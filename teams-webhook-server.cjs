#!/usr/bin/env node
/**
 * Teams → Claw Webhook受信サーバー v2
 * Power Automate から通知を受け取り、gsk teams search でメッセージ本文を取得、
 * OpenClaw mainセッションにsystemEventを注入する
 *
 * Port: 18794
 * Endpoint: POST /api/teams/inbound
 * Health:   GET  /health
 */

const http = require('http');
const { execSync } = require('child_process');

const PORT = 18794;
const SECRET = process.env.TEAMS_WEBHOOK_SECRET || 'logic-teams-2026';

const CHANNEL_NAMES = {
  '19:d51036576a914a70821814754e19062c@thread.tacv2': '🔨ビルド管理',
  '19:8966646a4a33450b9d8b65fd3f1e1552@thread.tacv2': '🚀リリース',
  '19:a154de427130436e9e58df0a84491e6a@thread.tacv2': '🐛バグ報告',
  '19:901b1112f7a94cd29e4e14c7a566e4fd@thread.tacv2': '💡プロダクト',
};

function stripHtml(html) {
  return (html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

// gsk teams search でメッセージ本文を取得
function fetchMessage(channelId, messageId) {
  try {
    const result = execSync(
      `gsk teams search --query "id:${messageId}" 2>/dev/null`,
      { timeout: 30000 }
    ).toString();
    const json = JSON.parse(result);
    const messages = json?.data?.microsoft_teams_search_results || [];
    if (messages.length > 0) {
      return {
        sender: messages[0].sender || 'Unknown',
        content: stripHtml(messages[0].body?.content || messages[0].content || ''),
      };
    }
  } catch (e) {
    console.error(`[WARN] fetchMessage failed: ${e.message.slice(0, 100)}`);
  }
  return null;
}

function sendToClaw(channelName, sender, message) {
  const text = `【Teamsより / ${channelName}】${sender}: ${message}`;
  const atTime = new Date(Date.now() + 5000).toISOString().replace('Z', '+00:00');
  const escaped = text.replace(/'/g, "'\\''");
  const cmd = `openclaw cron add --system-event '${escaped}' --name 'teams-inbound' --at '${atTime}' --wake now`;
  try {
    execSync(cmd, { timeout: 30000 });
    console.log(`[${new Date().toISOString()}] → Claw: ${text.slice(0, 120)}`);
    return true;
  } catch (e) {
    console.error(`[ERROR] sendToClaw: ${e.message.slice(0, 200)}`);
    return false;
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'teams-webhook', port: PORT }));
    return;
  }

  if (req.method !== 'POST' || req.url !== '/api/teams/inbound') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const providedSecret = req.headers['x-teams-secret'] || '';
      if (providedSecret !== SECRET) {
        console.warn(`[WARN] Invalid secret`);
        res.writeHead(401);
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
      }

      // raw bodyをまずログ
      console.log(`[DEBUG] raw body: ${body.slice(0, 500)}`);

      // JSONパース（concat式の末尾山マークも対応）
      let payload;
      try {
        payload = JSON.parse(body);
      } catch(parseErr) {
        // 末尾の余分な`"`を除去して再試行
        const cleaned = body.replace(/}"\s*$/, '}').trim();
        try {
          payload = JSON.parse(cleaned);
          console.log(`[INFO] Parsed with cleanup`);
        } catch(e2) {
          console.error(`[ERROR] JSON parse failed: ${body.slice(0, 200)}`);
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
          return;
        }
      }
      console.log(`[DEBUG] payload: ${JSON.stringify(payload).slice(0, 300)}`);

      // ping方式: トリガー通知のみ受け取り、gskで最新メッセージを取得
      // チャネルIDは payload.channelId または pingする全チャネルを検索
      const pingChannelId = payload.channelId || '';
      const channelName = CHANNEL_NAMES[pingChannelId] || '💡プロダクト';

      // gskで最新メッセージを取得
      let sender = 'Unknown';
      let message = '';

      console.log(`[INFO] Fetching latest message from ${channelName} via gsk...`);
      try {
        const searchChannelId = pingChannelId || '19:901b1112f7a94cd29e4e14c7a566e4fd@thread.tacv2';
        const result = execSync(
          `gsk teams search --query "from:Shibata" 2>/dev/null`,
          { timeout: 20000 }
        ).toString();
        const json = JSON.parse(result);
        // gskはsession_stateに結果を返す
        const messages = json?.session_state?.microsoft_teams_search_results || json?.data?.microsoft_teams_search_results || [];
        // 最新のメッセージを取得（チャネルフィルタなし、全メッセージの最新）
        const latest = messages
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
        if (latest) {
          sender = latest.sender || 'Unknown';
          message = stripHtml(latest.body?.content || latest.content || '');
          console.log(`[INFO] Got: ${sender}: ${message.slice(0, 80)}`);
        }
      } catch(e) {
        console.error(`[WARN] gsk search failed: ${e.message.slice(0, 100)}`);
      }

      message = stripHtml(message);

      console.log(`[${new Date().toISOString()}] ${channelName} / ${sender}: ${message.slice(0, 80)}`);

      if (!message || message.length < 2) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ignored', reason: 'empty' }));
        return;
      }

      const ok = sendToClaw(channelName, sender, message);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: ok ? 'ok' : 'error', channel: channelName }));
    } catch (e) {
      console.error(`[ERROR] ${e.message}`);
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Teams Webhook Server v2 listening on 127.0.0.1:${PORT}`);
  console.log(`Endpoint: POST /api/teams/inbound`);
});

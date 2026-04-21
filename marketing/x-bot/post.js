/**
 * X (Twitter) 自動投稿スクリプト
 * 
 * 使い方:
 *   node post.js "投稿テキスト"
 *   node post.js --file ./posts/day1.txt
 *   node post.js --thread ./posts/thread1.json
 * 
 * 環境変数 (.env):
 *   X_API_KEY
 *   X_API_SECRET
 *   X_ACCESS_TOKEN
 *   X_ACCESS_TOKEN_SECRET
 */

import { TwitterApi } from 'twitter-api-v2';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually (no dotenv dependency)
function loadEnv() {
  const envPath = resolve(__dirname, '.env');
  if (!existsSync(envPath)) {
    console.error('Error: .env file not found at', envPath);
    console.error('Create it with X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET');
    process.exit(1);
  }
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    process.env[key] = val;
  }
}

loadEnv();

const client = new TwitterApi({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
});

const rwClient = client.readWrite;

async function postTweet(text) {
  try {
    const result = await rwClient.v2.tweet(text);
    console.log(`Posted: ${result.data.id}`);
    console.log(`URL: https://x.com/optimalist_jp/status/${result.data.id}`);
    return result;
  } catch (err) {
    console.error('Failed to post:', err.message);
    if (err.data) console.error('Details:', JSON.stringify(err.data, null, 2));
    process.exit(1);
  }
}

async function postThread(tweets) {
  let lastId = null;
  for (let i = 0; i < tweets.length; i++) {
    try {
      const options = lastId ? { reply: { in_reply_to_tweet_id: lastId } } : {};
      const result = await rwClient.v2.tweet(tweets[i], options);
      lastId = result.data.id;
      console.log(`[${i + 1}/${tweets.length}] Posted: ${result.data.id}`);
      // Small delay between thread posts
      if (i < tweets.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`Failed at tweet ${i + 1}:`, err.message);
      process.exit(1);
    }
  }
  console.log(`Thread posted: https://x.com/optimalist_jp/status/${lastId}`);
}

// Parse args
const args = process.argv.slice(2);

if (args[0] === '--thread') {
  const filePath = resolve(args[1]);
  const tweets = JSON.parse(readFileSync(filePath, 'utf-8'));
  await postThread(tweets);
} else if (args[0] === '--file') {
  const filePath = resolve(args[1]);
  const text = readFileSync(filePath, 'utf-8').trim();
  await postTweet(text);
} else if (args.length > 0) {
  await postTweet(args.join(' '));
} else {
  console.log('Usage:');
  console.log('  node post.js "投稿テキスト"');
  console.log('  node post.js --file ./posts/day1.txt');
  console.log('  node post.js --thread ./posts/thread1.json');
}

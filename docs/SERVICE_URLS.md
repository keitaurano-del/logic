# Logic — サービス・環境URL一覧

最終更新: 2026-04-21

---

## アプリ環境

| 環境 | URL | ブランチ | デプロイ |
|---|---|---|---|
| **本番** | `https://logic-u5wn.onrender.com` | main | 手動（Keita承認後） |
| **SIT** | `https://logic-sit.onrender.com` | develop | 自動（push時） |

---

## 外部サービス

### Supabase（DB・認証）
| 項目 | 値 |
|---|---|
| ダッシュボード | `https://supabase.com/dashboard/project/yctlelmlwjwlcpcxvmgx` |
| API URL | `https://yctlelmlwjwlcpcxvmgx.supabase.co` |
| Project ID | `yctlelmlwjwlcpcxvmgx` |
| OAuth コールバック | `https://yctlelmlwjwlcpcxvmgx.supabase.co/auth/v1/callback` |

### Render（ホスティング）
| 項目 | 値 |
|---|---|
| ダッシュボード | `https://dashboard.render.com` |
| 本番 Service ID | `srv-d78vqe1r0fns73e6khmg` |
| SIT Service | `logic-sit`（autoDeploy: on） |
| 本番 Service | `logic`（autoDeploy: off） |

### Stripe（決済）
| 項目 | 値 |
|---|---|
| ダッシュボード | `https://dashboard.stripe.com` |
| アカウントID | `acct_1TMltQFrkwcSidJW` |
| Webhook URL | `https://logic-u5wn.onrender.com/api/stripe/webhook` |
| コンプライアンス | 3件すべて解決済み（2026-04-20） |

### Stripe テスト Price IDs
| プラン | Price ID |
|---|---|
| Standard 月額 ¥500 | `price_1TN3JqFrkwcSidJWCE1f8P2G` |
| Standard 年額 ¥3,500 | `price_1TN3JqFrkwcSidJWF89HJhud` |
| Premium 月額 ¥980 | `price_1TN3LXFrkwcSidJWfIiaARst` |
| Premium 年額 ¥6,980 | `price_1TN3LXFrkwcSidJW4EN0ybUx` |

### GitHub（ソースコード）
| 項目 | 値 |
|---|---|
| リポジトリ | `https://github.com/keitaurano-del/logic` |
| Actions | `https://github.com/keitaurano-del/logic/actions` |
| CI/CD | main push → Vercel自動デプロイ / develop push → SIT自動デプロイ |

### Jira（タスク管理）
| 項目 | 値 |
|---|---|
| ボード | `https://logic.atlassian.net/jira/software/projects/SCRUM/boards/1` |
| プロジェクトキー | SCRUM |
| 認証メール | `keita.urano@gmail.com` |

### Google Play Console（Android）
| 項目 | 値 |
|---|---|
| コンソール | `https://play.google.com/console` |
| App ID | `io.logic.app` |
| アカウント | Apollo100（ID: `5679289072658587465`） |
| 最新版 | v1.4.1 (versionCode 15) — 審査待ち |

### Google OAuth
| 項目 | 値 |
|---|---|
| GCP Console | `https://console.cloud.google.com` |
| プロジェクト | sigma-myth-298217 (My Project 89370) |
| Web Client ID | `688213389560-3a46q9o27lu5uljoogn98e23g89hg6eb.apps.googleusercontent.com` |
| Android Client ID | KeitaがGCP Consoleで作成済み |

### Vercel（旧ホスティング・CI/CD用）
| 項目 | 値 |
|---|---|
| プロジェクト | `https://vercel.com/keitaurano-2010/logic` |
| CI/CD | main push → 自動デプロイ（現在はRenderに移行済み） |

---

## マーケティング

### X（Twitter）
| 項目 | 値 |
|---|---|
| アカウント | `https://x.com/optimalist_jp` |
| Developer Portal | `https://developer.x.com/en/portal/dashboard` |
| API接続 | 完了（twitter-api-v2） |

### Notion
| 項目 | 値 |
|---|---|
| Logicプロジェクト | `https://www.notion.so/Logic-349ff06f1329814295eff9308b6e16ee` |

---

## 開発VM（Genspark Claw）

| 項目 | 値 |
|---|---|
| Public IP | `20.225.146.27` |
| ドメイン | `bqggwcso.gensparkclaw.com` |
| noVNC | `https://keita-urano2-3d1dd43e-6015-vm.southcentralus.cloudapp.azure.com:8443` |
| 作業ディレクトリ | `/home/work/.openclaw/workspace/logic` |

---

## 通知

### Slack
| 項目 | 値 |
|---|---|
| Webhook | `<SLACK_WEBHOOK_URL>` |
| DM Channel | `D0ATBB2S4AX` |

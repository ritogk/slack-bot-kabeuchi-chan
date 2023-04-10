import { menthonEvent } from "@/events/mention-event"
import { threadEvent } from "@/events/thread-event"
import { App } from "@slack/bolt"
import dotenv from "dotenv"
dotenv.config()

// boltの初期化
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
})

// slackのイベント処理
menthonEvent(app)
threadEvent(app)

// アプリ起動
;(async () => {
  await app.start(process.env.PORT || 3000)
  console.log("⚡️ Bolt app is running! port:" + process.env.PORT)
})()

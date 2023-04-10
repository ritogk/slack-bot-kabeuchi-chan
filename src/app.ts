import { App } from "@slack/bolt"
import dotenv from "dotenv"
import SimpleStorage from "./core/simple-storage"
import { chatCompletion } from "@/api/chat-gpt-api"

import { KabeuchiChan } from "@/models/kabeuchi-chan"

dotenv.config()

// ボットトークンと Signing Secret を使ってアプリを初期化します
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
})

// メンションにslackbotを指定して送信した場合のsubscribe
app.event("app_mention", async ({ event, client, say, body }) => {
  const kabeuchiChan = new KabeuchiChan(process.env.OPENAI_API_KEY ?? "")
  // メッセージ内に「壁打」の文字列が含まれている。
  await client.chat.postMessage({
    channel: event.channel,
    text: kabeuchiChan.call(),
  })
})

// メンションにslackbotを指定して送信した場合のsubscribe
app.event("message", async ({ event, client, body }) => {
  const kabeuchiChan = new KabeuchiChan(process.env.OPENAI_API_KEY ?? "")

  const { thread_ts, bot_id, text } = event as any
  if (!thread_ts) return

  const parentMessage = await client.conversations.replies({
    channel: event.channel,
    ts: thread_ts,
  })
  // 壁打ちちゃんが生成したスレッドかどうかの判別
  if (
    parentMessage.messages !== undefined &&
    parentMessage.messages[0] &&
    parentMessage.messages[0].text?.includes(kabeuchiChan.firstReply)
  ) {
    const goal = parentMessage.messages[1].text
    if (parentMessage.messages.length <= 2) {
      const message = await kabeuchiChan.sendTopic(text)
      await client.chat.postMessage({
        channel: event.channel,
        thread_ts: thread_ts,
        text: message,
      })
    } else {
      kabeuchiChan.remember(thread_ts)
      const message = await kabeuchiChan.askQuestion(text)
      await client.chat.postMessage({
        channel: event.channel,
        thread_ts: thread_ts,
        text: message,
      })
    }
    kabeuchiChan.memorize(thread_ts)
  }
})
;(async () => {
  // アプリを起動します
  await app.start(process.env.PORT || 3000)
  console.log("⚡️ Bolt app is running!")
})()

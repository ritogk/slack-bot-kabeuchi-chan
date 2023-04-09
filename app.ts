import { App } from "@slack/bolt"
import dotenv from "dotenv"
dotenv.config()

// ボットトークンと Signing Secret を使ってアプリを初期化します
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
})

// メンションにslackbotを指定して送信した場合のsubscribe
app.event("app_mention", async ({ event, client, say, body }) => {
  // メッセージ内に「壁打」の文字列が含まれている。
  if (event.text.includes("壁打")) {
    await client.chat.postMessage({
      channel: event.channel,
      text: `おっけー！壁打ちコーチングをするね。`,
    })
  }
})

// メンションにslackbotを指定して送信した場合のsubscribe
app.event("message", async ({ event, client }) => {
  const { thread_ts, bot_id } = event as any
  if (!thread_ts) return

  const parentMessage = await client.conversations.replies({
    channel: event.channel,
    ts: thread_ts,
  })
  if (
    parentMessage.messages !== undefined &&
    parentMessage.messages[0] &&
    parentMessage.messages[0].text?.includes(
      "おっけー！壁打ちコーチングをするね。"
    )
  ) {
    console.log(thread_ts)
    await client.chat.postMessage({
      channel: event.channel,
      thread_ts: thread_ts,
      text: `返答`,
    })
  }
})
;(async () => {
  // アプリを起動します
  await app.start(process.env.PORT || 3000)
  console.log("⚡️ Bolt app is running!")
})()

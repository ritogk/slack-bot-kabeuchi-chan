import { KabeuchiChan } from "@/models/kabeuchi-chan"
import { App } from "@slack/bolt"
import dotenv from "dotenv"
dotenv.config()

// boltフレームワークの初期化
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
})

// メンションにslackbotを指定して送信した場合のsubscribe
app.event("app_mention", async ({ event, client, say, body }) => {
  const kabeuchiChan = new KabeuchiChan(process.env.OPENAI_API_KEY ?? "")
  await client.chat.postMessage({
    channel: event.channel,
    text: kabeuchiChan.call(),
  })
})

// メンションにslackbotを指定して送信した場合のsubscribe
app.event("message", async ({ event, client, body }) => {
  const kabeuchiChan = new KabeuchiChan(process.env.OPENAI_API_KEY ?? "")

  const { thread_ts, text } = event as any
  if (!thread_ts) return

  // スレッドの親メッセージを取得
  const parentMessage = await client.conversations.replies({
    channel: event.channel,
    ts: thread_ts,
  })

  // 壁打ちちゃんが生成したメッセージかどうかの判別
  if (
    !(
      parentMessage.messages !== undefined &&
      parentMessage.messages[0] &&
      parentMessage.messages[0].text?.includes(kabeuchiChan.firstReply)
    )
  )
    return

  if (parentMessage.messages.length <= 2) {
    // 初回メッセージ
    const message = await kabeuchiChan.sendTopic(text)
    await client.chat.postMessage({
      channel: event.channel,
      thread_ts: thread_ts,
      text: message,
    })
  } else {
    kabeuchiChan.remember(thread_ts)
    const message = await kabeuchiChan.sendMessage(text)
    await client.chat.postMessage({
      channel: event.channel,
      thread_ts: thread_ts,
      text: message,
    })
  }
  kabeuchiChan.memorize(thread_ts)
})
;(async () => {
  // アプリを起動します
  await app.start(process.env.PORT || 3000)
  console.log("⚡️ Bolt app is running!")
})()

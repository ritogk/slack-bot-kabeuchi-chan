import { App } from "@slack/bolt"
import dotenv from "dotenv"
import { chatCompletion } from "./gpt"
import SimpleStorage from "./SimpleStorage"

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
app.event("message", async ({ event, client, body }) => {
  const { thread_ts, bot_id, text } = event as any
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
    // スレッドのやり取りを取得
    const storage = new SimpleStorage(`${thread_ts}.json`)
    const history = storage.get("history")
    const messages = history ? history : []
    // スレッドのやり取りとコメントから返答を生成
    messages.push({
      role: "user",
      content: `あなたは、プロの壁打ちコーチです。
以下の制約条件と入力文をもとに、【出力内容】を出力してください。
# 制約条件：
必ず質問をする事。
1文で答える事
答えを出してはいけない。
40文字以内で発言する事。

# 入力文
${text}`,
    })
    // messages.push({ role: "user", content: text })
    const reply = await chatCompletion(messages)
    console.log("返信")
    console.log(reply)
    // スレッドのやり取りを保存
    messages.push({ role: reply.role, content: reply.content })
    // ストレージに保存
    storage.set("history", messages)

    await client.chat.postMessage({
      channel: event.channel,
      thread_ts: thread_ts,
      text: reply.content,
    })
  }
})
;(async () => {
  // アプリを起動します
  await app.start(process.env.PORT || 3000)
  console.log("⚡️ Bolt app is running!")
})()

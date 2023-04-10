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
  await client.chat.postMessage({
    channel: event.channel,
    text: `はい！私が壁打ち相手になってあげる！\nまずこのスレッドに解決したい課題を書いてね。`,
  })
})

// メンションにslackbotを指定して送信した場合のsubscribe
app.event("message", async ({ event, client, body }) => {
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
    parentMessage.messages[0].text?.includes(
      `はい！私が壁打ち相手になってあげる！\nまずこのスレッドに解決したい課題を書いてね。`
    )
  ) {
    // スレッドのやり取りを取得
    const storage = new SimpleStorage(`${thread_ts}.json`)
    const history = storage.get("history")
    const messages = history ? history : []

    const goal = parentMessage.messages[1].text
    if (parentMessage.messages.length <= 2) {
      messages.push({
        role: "system",
        content: `あなたはコーチングが得意なプロのカウンセラーです。
以下の達成目標と制約条件と入力文をもとに回答してください。

# 達成目標:
${goal}

# 制約条件：
必ず質問をする事
1文で答える事
答えや意見を出さない事
40文字以内で回答する事`,
      })
    } else {
      messages.push({
        role: "user",
        content: text,
      })
    }

    // messages.push({ role: "user", content: text })
    const reply = await chatCompletion(messages)
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

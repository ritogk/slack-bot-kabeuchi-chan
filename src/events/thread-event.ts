import { App } from "@slack/bolt"
import { KabeuchiChan } from "@/models/kabeuchi-chan/kabeuchi-chan"

export const threadEvent = (app: App) => {
  // slackbotが生成したメッセージに対してスレッドが書き込まれた場合の処理
  app.event("message", async ({ event, client, body }) => {
    const { thread_ts, text, channel } = event as any
    // スレッドメッセージでない場合は処理を停止
    if (!thread_ts) return

    const kabeuchiChan = new KabeuchiChan(
      process.env.OPENAI_API_KEY ?? "",
      thread_ts
    )

    const kabeuchiMessage = await kabeuchiChan.chat(text)
    await client.chat.postMessage({
      channel: event.channel,
      thread_ts: thread_ts,
      text: kabeuchiMessage,
    })
  })
}

import { App } from "@slack/bolt"
import { KabeuchiChan, Status } from "@/models/kabeuchi-chan"
import { generateStatus } from "@/models/generate-status"

export const threadEvent = (app: App) => {
  // slackbotが生成したメッセージに対してスレッドが書き込まれた場合の処理
  app.event("message", async ({ event, client, body }) => {
    const { thread_ts, text, channel } = event as any
    // スレッドメッセージでない場合は処理を停止
    if (!thread_ts) return

    // 壁打ちちゃんの状態を取得する
    const status = await generateStatus(client, channel, thread_ts)

    const kabeuchiChan = new KabeuchiChan(
      process.env.OPENAI_API_KEY ?? "",
      thread_ts
    )

    let replay = ""
    switch (status) {
      case Status.UnReply:
        return
      case Status.AskedTopice:
        replay = await kabeuchiChan.sendTopic(text)
        break
      case Status.AcceptedTopic:
        replay = await kabeuchiChan.sendMessage(text)
        break
      default:
        break
    }

    await client.chat.postMessage({
      channel: event.channel,
      thread_ts: thread_ts,
      text: replay,
    })
  })
}

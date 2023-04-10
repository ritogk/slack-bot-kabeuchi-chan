import { App } from "@slack/bolt"
import { KabeuchiChan, Status } from "@/models/kabeuchi-chan"
import { generateStatus } from "@/models/generate-status"
import { Stats } from "fs"

export const threadEvent = (app: App) => {
  // slackbotが生成したメッセージに対してスレッドが書き込まれた場合の処理
  app.event("message", async ({ event, client, body }) => {
    const kabeuchiChan = new KabeuchiChan(process.env.OPENAI_API_KEY ?? "")

    const { thread_ts, text, channel } = event as any
    // スレッドメッセージでない場合は処理を停止
    if (!thread_ts) return

    const status = await generateStatus(client, channel, thread_ts)

    let replay = ""
    switch (status) {
      case Status.UnReply:
        return
      case Status.AskedTopice:
        replay = await kabeuchiChan.sendTopic(text)
        break
      case Status.AcceptedTopic:
        kabeuchiChan.remember(thread_ts)
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
    kabeuchiChan.memorize(thread_ts)
  })
}

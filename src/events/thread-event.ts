import { App } from "@slack/bolt"
import { KabeuchiChan } from "@/models/kabeuchi-chan"

export const threadEvent = (app: App) => {
  // slackbotが生成したメッセージに対してスレッドが書き込まれた場合の処理
  app.event("message", async ({ event, client, body }) => {
    const kabeuchiChan = new KabeuchiChan(process.env.OPENAI_API_KEY ?? "")

    const { thread_ts, text } = event as any
    // スレッドメッセージでない場合は処理を停止
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
      // 初回メッセージの場合
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
}

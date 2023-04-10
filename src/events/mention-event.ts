import { App } from "@slack/bolt"
import { KabeuchiChan } from "@/models/kabeuchi-chan"

export const menthonEvent = (app: App) => {
  // メンションにslackbotを指定した場合のイベント処理
  app.event("app_mention", async ({ event, client }) => {
    const kabeuchiChan = new KabeuchiChan(process.env.OPENAI_API_KEY ?? "")
    await client.chat.postMessage({
      channel: event.channel,
      text: kabeuchiChan.call(),
    })
  })
}

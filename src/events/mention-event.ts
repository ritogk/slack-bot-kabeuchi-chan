import { App } from "@slack/bolt"
import { messages } from "@/models/kabeuchi-chan/messages"

export const menthonEvent = (app: App) => {
  // メンションにslackbotを指定した場合のイベント処理
  app.event("app_mention", async ({ event, client }) => {
    await client.chat.postMessage({
      channel: event.channel,
      text: messages.firstReply,
    })
  })
}

import { Status } from "@/models/kabeuchi-chan"
import { WebClient } from "@slack/web-api"
import { KabeuchiChan } from "@/models/kabeuchi-chan"
/**
 * 壁打ちちゃんのステータスを生成する
 * @param client
 * @param channel
 * @param threadTs
 * @returns
 */
export const generateStatus = async (
  client: WebClient,
  channel: string,
  threadTs: string
): Promise<Status> => {
  // スレッドの親メッセージを取得
  const parentMessage = await client.conversations.replies({
    channel: channel,
    ts: threadTs,
  })

  if (
    parentMessage.messages === undefined ||
    !parentMessage.messages[0].text?.includes(KabeuchiChan.firstReply)
  ) {
    return Status.UnReply
  }

  if (parentMessage.messages.length <= 2) {
    return Status.AskedTopice
  } else {
    return Status.AcceptedTopic
  }
}

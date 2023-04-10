import { Message } from "@/api/chat-gpt-api"
import { chatCompletion } from "@/api/chat-gpt-api"
import SimpleStorage from "@/core/json-storage"
import { messages } from "@/models/kabeuchi-chan/messages"
import { Status } from "@/models/kabeuchi-chan/status"

interface IKabeuchiChan {
  chat: (message: string) => Promise<string>
}

/**
 * 壁打ちちゃん
 */
export class KabeuchiChan implements IKabeuchiChan {
  readonly openaiApiKey: string
  readonly threadTs: string
  private history: Message[] = []
  private status: Status = Status.AskedTopice

  /**
   * constructor
   */
  constructor(openaiApiKey: string, threadTs: string) {
    this.openaiApiKey = openaiApiKey
    this.threadTs = threadTs
    this.loadHistory()
  }

  /**
   * チャットを行う
   * @param message
   * @returns
   */
  chat = async (message: string): Promise<string> => {
    let gptMessage = ""
    switch (this.status) {
      case Status.AskedTopice:
        gptMessage = await this.sendTopic(message)
        break
      case Status.AcceptedTopic:
        gptMessage = await this.sendMessage(message)
        break
      default:
        break
    }
    return gptMessage
  }

  /**
   * 壁打ちちゃんに「トピックを伝える」
   * @param topic
   * @returns
   */
  private sendTopic = async (topic: string): Promise<string> => {
    // chatgptの役割をきめる
    const systemMessage: Message = {
      role: "system",
      content: messages.baseSystemMessage.replace("###topic###", topic),
    }
    const userMessage: Message = {
      role: "user",
      content: topic,
    }
    this.history.push(systemMessage)
    this.history.push(userMessage)
    // chatgptにchatリクエストを送る
    const assistantMessage = await chatCompletion(this.history)
    this.history.push(assistantMessage)
    // ステータス変更
    this.status = Status.AcceptedTopic
    // 会話履歴の永続化
    this.saveHistory()
    return assistantMessage.content
  }

  /**
   * 壁打ちちゃんに「メッセージを伝える」
   * @param message
   * @returns
   */
  private sendMessage = async (message: string): Promise<string> => {
    const userMessage: Message = {
      role: "user",
      content: message,
    }
    this.history.push(userMessage)
    const assistantMessage = await chatCompletion(this.history)
    this.history.push(assistantMessage)
    // 会話履歴の永続化
    this.saveHistory()
    return assistantMessage.content
  }

  /**
   * 「会話履歴」の読み込み
   * @param storageKey
   */
  private loadHistory = () => {
    const storage = new SimpleStorage<{
      history: Message[]
      status: Status
    }>(`${this.threadTs}.json`)
    const history = storage.get("history")
    this.history = history ? history : []
    const status = storage.get("status")
    this.status = status ? status : Status.AskedTopice
  }

  /**
   * 「会話履歴」を永続化
   * @param storageKey
   */
  private saveHistory = () => {
    const storage = new SimpleStorage<{
      history: Message[]
      status: Status
    }>(`${this.threadTs}.json`)
    storage.set("history", this.history)
    storage.set("status", this.status)
  }
}

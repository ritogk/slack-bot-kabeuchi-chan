import { Message } from "@/api/chat-gpt-api"
import { chatCompletion } from "@/api/chat-gpt-api"
import SimpleStorage from "@/core/simple-storage"

interface IKabeuchiChan {
  // 初回の応答文を取得
  call: () => string
  // 思い出す
  remember: (storageKey: string) => void
  // ストレージに保存
  memorize: (storageKey: string) => void
  // 課題を伝える。
  sendTopic: (topic: string) => Promise<string>
  // メッセージを送信して回答を得る。
  sendMessage: (question: string) => Promise<string>
}

// 壁打ちちゃんの状態
export enum Status {
  UnReply,
  AskedTopice,
  AcceptedTopic,
}

/**
 * 壁打ちちゃん
 */
export class KabeuchiChan implements IKabeuchiChan {
  readonly openaiApiKey: string
  private history: Message[] = []
  private status: Status = Status.UnReply
  static readonly firstReply = `はい！私が壁打ち相手になってあげる！
まずこのスレッドに解決したい課題を書いてね。`
  static readonly baseSystemMessage = `あなたはコーチングが得意なプロのカウンセラーです。
以下の達成目標と制約条件と入力文をもとに回答してください。
  
# 達成目標:
###topic###
  
# 制約条件：
必ず質問をする事
1文で答える事
答えや意見を出さない事
40文字以内で回答する事`

  constructor(openaiApiKey: string) {
    this.openaiApiKey = openaiApiKey
  }

  /**
   * 「壁打ちちゃん」を呼ぶ
   * @returns
   */
  call = (): string => {
    this.status = Status.AskedTopice
    return KabeuchiChan.firstReply
  }

  /**
   * 壁打ちちゃん「会話履歴を思い出す」
   * @param storageKey
   */
  remember = (storageKey: string) => {
    const storage = new SimpleStorage<{
      history: Message[]
      status: Status
    }>(`${storageKey}.json`)
    const history = storage.get("history")
    this.history = history ? history : []
    const status = storage.get("status")
    this.status = status ? status : Status.UnReply
  }

  /**
   * 壁打ちちゃんが「会話履歴を記憶する」
   * @param storageKey
   */
  memorize = (storageKey: string) => {
    const storage = new SimpleStorage<{
      history: Message[]
      status: Status
    }>(`${storageKey}.json`)
    storage.set("history", this.history)
    storage.set("status", this.status)
  }

  /**
   * 壁打ちちゃんに「トピックを伝える」
   * @param topic
   * @returns
   */
  sendTopic = async (topic: string): Promise<string> => {
    const systemMessage: Message = {
      role: "system",
      content: KabeuchiChan.baseSystemMessage.replace("###topic###", topic),
    }
    const userMessage: Message = {
      role: "user",
      content: topic,
    }
    this.history.push(systemMessage)
    this.history.push(userMessage)
    const assistantMessage = await chatCompletion(this.history)
    this.history.push(assistantMessage)

    this.status = Status.AcceptedTopic
    return assistantMessage.content
  }

  /**
   * 壁打ちちゃんに「メッセージを伝える」
   * @param message
   * @returns
   */
  sendMessage = async (message: string): Promise<string> => {
    const userMessage: Message = {
      role: "user",
      content: message,
    }
    this.history.push(userMessage)
    const assistantMessage = await chatCompletion(this.history)
    this.history.push(assistantMessage)
    return assistantMessage.content
  }
}

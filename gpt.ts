import dotenv from "dotenv"
dotenv.config()

import axios from "axios"

export type Message = {
  role: "user" | "system" | "assistant"
  content: string
}

export const chatCompletion = async (messages: Message[]): Promise<any> => {
  const body = JSON.stringify({
    messages,
    model: "gpt-3.5-turbo",
  })
  const options = {
    url: "https://api.openai.com/v1/chat/completions",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    data: body,
  }
  const response = await axios(options)
  const choice = 0
  console.log(response.data.choices[choice].message)
  return response.data.choices[choice].message
}

const prompt = `あなたは、プロの壁打ちコーチです。以下の制約条件と入力文をもとに、【出力内容】を出力してください。# 制約条件：
必ず質問をする事。
1文で答える事
答えを出してはいけない。
40文字以内で発言する事。

# 入力文：
GPTとチャットして悩みを解決するサービスをつくろうとしている。需要あるのかなあ`
chatCompletion([{ role: "user", content: prompt }])
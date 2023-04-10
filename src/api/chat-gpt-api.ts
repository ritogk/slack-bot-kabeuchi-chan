import dotenv from "dotenv"
dotenv.config()

import axios from "axios"

export type Message = {
  role: "user" | "system" | "assistant"
  content: string
}

export const chatCompletion = async (messages: Message[]): Promise<Message> => {
  const body = JSON.stringify({
    messages,
    model: "gpt-3.5-turbo",
    // temperature: 0.8, // 0~1の間で指定。値が低いほど関連性の高い単語が選ばれやすくなる。
    // max_tokens: 200,
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
  return response.data.choices[choice].message
}

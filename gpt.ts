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

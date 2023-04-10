type JsonPrimitive = boolean | number | string | null

type JsonArray = JsonPrimitive[] | JsonObject[]

type JsonObject = {
  [key: string]: JsonPrimitive | JsonObject | JsonArray
}

type Json = JsonPrimitive | JsonArray | JsonObject

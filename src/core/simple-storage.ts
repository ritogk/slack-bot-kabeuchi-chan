import fs from "fs"
import path from "path"

/**
 * jsonを使った簡易的なストレージ
 */
class SimpleStorage<T extends JsonObject> {
  private storagePath: string

  constructor(filename: string) {
    this.storagePath = path.resolve(__dirname, "../storage", filename)
    if (!fs.existsSync(this.storagePath)) {
      fs.writeFileSync(this.storagePath, JSON.stringify({}))
    }
  }

  set<K extends keyof T>(key: K, value: T[K]): void {
    const data = this.getAll()
    if (!data) return undefined
    data[key] = value
    fs.writeFileSync(this.storagePath, JSON.stringify(data))
  }

  get<K extends keyof T>(key: K): T[K] | undefined {
    const data = this.getAll()
    if (!data) return undefined
    return key in data ? data[key] : undefined
  }

  getAll(): T | undefined {
    const rawData = fs.readFileSync(this.storagePath, "utf-8")
    return JSON.parse(rawData)
  }
}

export default SimpleStorage

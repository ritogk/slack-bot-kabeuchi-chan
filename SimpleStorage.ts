import fs from "fs"
import path from "path"

class SimpleStorage {
  private storagePath: string

  constructor(filename: string) {
    this.storagePath = path.resolve(__dirname + "/storage", filename)
    if (!fs.existsSync(this.storagePath)) {
      fs.writeFileSync(this.storagePath, JSON.stringify({}))
    }
  }

  set(key: string, value: any): void {
    const data = this.getAll()
    data[key] = value
    fs.writeFileSync(this.storagePath, JSON.stringify(data))
  }

  get(key: string): any {
    const data = this.getAll()
    return data[key]
  }

  getAll(): Record<string, any> {
    const rawData = fs.readFileSync(this.storagePath, "utf-8")
    return JSON.parse(rawData)
  }
}

export default SimpleStorage

import fs from "fs"

export const lerArquivo = (callback) => {
  fs.readFile('socialize.json', 'utf8', (error, data) => {

    if (error) {
      callback(error)
      return
    }
    const json = JSON.parse(data)
    callback(null, json)
  })
}
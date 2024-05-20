import http from "http"
import fs from "fs"
import { lerArquivo } from "./lerArquivo.js"
import { formidable } from "formidable"

const PORT = 3333

const server = http.createServer((request, response) => {

  const { url, method } = request

  if (method === "GET" && url === "/usuarios") { // Listar todos os usuarios

    lerArquivo((error, data) => {
      if (error) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "Error ao ler os dados" }))
        return
      }
      response.writeHead(200, { "Content-Type": "application/json" })
      response.end(JSON.stringify(data))

    })
  }

  if (method === "GET" && url.startsWith("/perfil/")) { // Mostrar um perfil especifico por ID
    const id = url.split('/')[2]

    lerArquivo((error, data) => {
      if (error) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "Error ao ler os dados" }))
        return
      }
      const index = data.findIndex((perfil) => perfil.id == id)

      if (index == -1) {
        response.writeHead(404, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "Perfil não encontrado!" }))
        return
      }
      response.writeHead(200, { "Content-Type": "application/json" })
      response.end(JSON.stringify(data[index]))

    })
  }

  if (method === "PUT" && url.startsWith("/perfil/")) { // Atualizar um usuário
    const id = url.split('/')[2]

    let body = ""
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', (err) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "Error de servidor" }))
        return
      }
      const json = JSON.parse(body)

      lerArquivo((error, data) => {
        if (error) {
          response.writeHead(500, { "Content-Type": "application/json" })
          response.end(JSON.stringify({ message: "Error ao ler os dados" }))
          return
        }
        const index = data.findIndex((perfil) => perfil.id == id)

        if (index == -1) {
          response.writeHead(404, { "Content-Type": "application/json" })
          response.end(JSON.stringify({ message: "Perfil não encontrado!" }))
          return
        }
        data[index] = { ...data[index], ...json }

        fs.writeFile('socialize.json', JSON.stringify(data, null, 2), (erro) => {

          if (erro) {
            response.writeHead(500, { "Content-Type": "application/json" })
            response.end(JSON.stringify({ message: "Erro ao enviar os dados" }))
            return
          }
          response.writeHead(200, { "Content-Type": "application/json" })
          response.end(JSON.stringify(data[index]))
        })


      })

    })

  }

  if (method === "POST" && url.startsWith("/perfil/imagem/")) { // Upload de uma imagem de perfil

    lerArquivo(async (err, data) => {

      if (err) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "Error no servidor" }))
        return
      }

      const form = formidable({})

      let files;
      let fields;

      try {
        [files, fields] = await form.parse(request)

      } catch (err) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "Error ao enviar os dados" }))
        return
      }

      fs.rename(fields.file[0].filepath, `img/${fields.file[0].newFilename}.png`, (err) => {
        if (err) {
          response.writeHead(500, { "Content-Type": "application/json" })
          response.end(JSON.stringify({ message: "Error ao enviar os dados" }))
          return
        }
      })
      const id = url.split('/')[3]
      const index = data.findIndex((usuario) => usuario.id == id)

      data[index].imagemDePerfil = `img/${fields.file[0].newFilename}.png`

      fs.writeFile('socialize.json', JSON.stringify(data, null, 2), (err) => {
        if (err) {
          response.writeHead(500, { "Content-Type": "application/json" })
          response.end(JSON.stringify({ message: "Error ao enviar os dados" }))
          return
        }
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ fields, files }, null, 2));

      })
    })
  }

  if (method === "POST" && url === "/usuarios") { // Cadastrar usuario

    lerArquivo((error, data) => {
      if (error) {
        response.writeHead(500, { "Content-Type": "application/json" })
        response.end(JSON.stringify({ message: "Error ao ler os dados" }))
        return
      }
      let body = ""

      request.on('data', (chunk) => {
        body += chunk
      })
      request.on('end', () => {
        const novoPerfil = JSON.parse(body)
        novoPerfil.bio = ""
        novoPerfil.nome = ""
        novoPerfil.id = data.length + 1
        novoPerfil.imagemDePerfil = ""

        const acharUsuario = data.find((perfil) => perfil.usuario.email == novoPerfil.usuario.email)

        if (acharUsuario) {
          response.writeHead(500, { "Content-Type": "application/json" })
          response.end(JSON.stringify({ message: "Usuario já existente!" }))
          return
        }
        data.push(novoPerfil)

        fs.writeFile('socialize.json', JSON.stringify(data, null, 2), (err) => {
          if (err) {
            response.writeHead(500, { "Content-Type": "application/json" })
            response.end(JSON.stringify({ message: "Error ao enviar os dados" }))
            return
          }
          response.writeHead(200, { "Content-Type": "application/json" })
          response.end(JSON.stringify(novoPerfil))
        })
      })


    })

  }

})

server.listen(PORT, () => {
  console.log('server on PORT: ' + PORT)
})
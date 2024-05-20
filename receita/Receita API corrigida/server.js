import { createServer } from "node:http";
import fs from "node:fs"
import { URLSearchParams } from "node:url";
import lerDadosReceitas from "./lerReceitas.js";

const PORT = 3333

const server = createServer((request, response) => {
  const { method, url } = request

  if (method === 'GET' && url === '/receitas') { // Lista todas as receitas
    lerDadosReceitas((err, receitas) => {
      if (err) {
        response.writeHead(500, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: 'erro ao ler os dados' }))
        return
      }
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify(receitas))
    })
  }
  else if (method === 'GET' && url.startsWith('/receitas/')) {  // Lista uma receita por id
    //localhost:3333/receitas/1
    lerDadosReceitas((err, receitas) => {
      if (err) {
        response.writeHead(500, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: 'erro ao ler os dados' }))
        return
      }
    })
  }
  else if (method === 'GET' && url.startsWith('/busca')) {  // Busca uma receita por um termo
    //localhost:3333/busca?termo='Pratos%20Principais'
    const urlParam = new URLSearchParams(url.split("?")[1])
    const termo = urlParam.get('termo').toLocaleLowerCase()

    lerDadosReceitas((err, receitas) => {
      if (err) {
        response.writeHead(500, { "Content-Type": 'application/json' })
        response.end(JSON.stringify({ message: 'Erro no servidor' }))
        return
      }
      const resultadoBusca = receitas.filter((receita) =>
        receita.nome.includes(termo) ||
        receita.ingredientes.some((receita)=>receita.includes(termo)) ||
        receita.categoria.includes(termo)
      )

      if (resultadoBusca.length === 0) {
        response.writeHead(404, { "Content-Type": 'application/json' })
        response.end(JSON.stringify({ message: 'Não foi receita com o termo: ' + termo }))
        return
      }
      response.writeHead(200, { "Content-Type": 'application/json' })
      response.end(JSON.stringify(resultadoBusca))
    })
  }
  else if (method === 'GET' && url.startsWith('/categorias')) {  // Lista uma categoria especifica
    //localhost:3333/categorias/saladas
    response.end(method)
  }
  else if (method === 'GET' && url === '/ingredientes') {  // Listar todos os ingredientes
    //localhost:333/ingredientes
    response.end(method)
  }
  else if (method === 'POST' && url === '/receitas') {  // Cadastrar receita
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', () => {
      if (!body) {
        response.writeHead(400, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: 'Corpo da solicitação vazio' }))
        return
      }
      const novaReceita = JSON.parse(body)
      lerDadosReceitas((err, receitas) => {
        if (err) {
          response.writeHead(500, { 'Content-Type': 'application/json' })
          response.end(JSON.stringify({ message: 'Erro a cadastrar a receita' }))
          return
        }
        novaReceita.id = receitas.length + 1
        receitas.push(novaReceita)

        fs.writeFile('receitas.json', JSON.stringify(receitas, null, 2), (err) => {
          if (err) {
            response.writeHead(500, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify({ message: 'Erro ao ler dados da receita no arquivo' }))
            return
          }
          response.writeHead(202, { 'Content-Type': 'application/json' })
          response.end(JSON.stringify(novaReceita))
        })
      })
    })
  }
  else if (method === 'PUT' && url.startsWith('/receitas/')) {  // Atualiza uma receita
    const id = parseInt(url.split('/')[2])
    let body = ''
    request.on('data', (chunk) => {
      body += chunk
    })
    request.on('end', (err) => {
      if (!body) {
        response.writeHead(400, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: 'Corpo da solicitação vazio' }))
        return
      }
      lerDadosReceitas((err, receitas) => {
        if (err) {
          response.writeHead(500, { 'Content-Type': 'application/json' })
          response.end(JSON.stringify({ message: 'Erro a atualizar a receita' }))
          return
        }
        const indexReceita = receitas.findIndex((receita) => receita.id === id)
        if (indexReceita == -1) {
          response.writeHead(404, { 'Content-Type': 'application/json' })
          response.end(JSON.stringify({ message: 'Não foi encontrado receita com este id' }))
          return
        }

        const receitaAtualizada = JSON.parse(body)
        receitaAtualizada.id = id
        receitas[indexReceita] = { ...receitas[indexReceita], ...receitaAtualizada }


        fs.writeFile('receitas.json', JSON.stringify(receitas, null, 2), (err) => {
          if (err) {
            response.writeHead(500, { 'Content-Type': 'application/json' })
            response.end(JSON.stringify({ message: 'Erro ao ler dados da receita no arquivo' }))
            return
          }
          response.writeHead(202, { 'Content-Type': 'application/json' })
          response.end(JSON.stringify(receitas[indexReceita]))
        })
      })
    })
  }
  else if (method === 'DELETE' && url.startsWith('/receitas/')) {  // Deletar uma receita
    const id = parseInt(url.split('/')[2])

    lerDadosReceitas((err, receitas) => {
      if (err) {
        response.writeHead(500, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: "Erro ao ler os dados da receita" }))
        return
      }
      const indexReceita = receitas.findIndex((receita) => receita.id == id)
      if (indexReceita === -1) {
        response.writeHead(404, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: "Receita não encontrada!" }))
        return
      }
      receitas.splice(indexReceita, 1)

      fs.writeFile('receitas.json', JSON.stringify(receitas, null, 2), (err) => {
        if (err) {
          response.writeHead(500, { 'Content-Type': 'application/json' })
          response.end(JSON.stringify({ message: "Erro ao ler os dados da receita" }))
          return
        }
        response.writeHead(200, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: "Receita deletada!" }))
      })
    })
  }
  else {
    response.writeHead(404, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ message: 'Rota não encontrada!' }))
  }
})

server.listen(PORT, () => {
  console.log('server on PORT: ' + PORT)
})
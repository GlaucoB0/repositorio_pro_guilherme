import http from 'node:http'
import {
  lerArquivoReceitas,
  lerArquivoUnicaReceita,
  lerArquivoCategoria,
  lerArquivoBusca,
  lerArquivoIngredientes,
  cadastrarReceita,
  atualizarReceita,
  deletarReceita
}
  from './modulos.js'

const PORT = 3000

const server = http.createServer((request, response) => {

  const { url, method } = request

  if (url === '/receitas' && method === "GET") {
    lerArquivoReceitas((err, data) => {
      if (err) {
        response.writeHead(500, { "Content-Type": 'application/json' })
        response.end(JSON.stringify({ message: 'Erro no servidor' }))
        return
      }
      response.writeHead(200, { "Content-Type": 'application/json' })
      response.end(JSON.stringify(data))
    })
  }
  else if (url.startsWith('/receitas/') && method === "GET") {
    const id = url.split('/')[2]

    lerArquivoUnicaReceita(id, (err, data) => {
      if (err) {
        response.writeHead(500, { "Content-Type": 'application/json' })
        response.end(JSON.stringify({ message: 'Erro no servidor' }))
        return
      }
      if (data == undefined) {
        response.writeHead(404, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: "receita não encontrada!" }))
        return
      }
      response.writeHead(200, { "Content-Type": 'application/json' })
      response.end(JSON.stringify(data))
    })
  }
  else if (url === '/categorias' && method === 'GET') {
    lerArquivoCategoria((err, data) => {
      if (err) {
        response.writeHead(500, { "Content-Type": 'application/json' })
        response.end(JSON.stringify({ message: 'Erro no servidor' }))
        return
      }
      response.writeHead(200, { "Content-Type": 'application/json' })
      response.end(JSON.stringify(data))
    })
  }
  else if (url.startsWith('/busca') && method === 'GET') {
    lerArquivoBusca(request, (err, data) => {
      if (err) {
        response.writeHead(500, { "Content-Type": 'application/json' })
        response.end(JSON.stringify({ message: 'Erro no servidor' }))
        return
      }
      if (data.length == 0) {
        response.writeHead(404, { 'Content-Type': 'application/json' })
        response.end(JSON.stringify({ message: "receita não encontrada!" }))
        return
      }
      response.writeHead(200, { "Content-Type": 'application/json' })
      response.end(JSON.stringify(data))
    })
  }
  else if (url === '/ingredientes' && method === 'GET') {
    lerArquivoIngredientes((err, data) => {
      if (err) {
        response.writeHead(500, { "Content-Type": 'application/json' })
        response.end(JSON.stringify({ message: 'Erro no servidor' }))
        return
      }
      response.writeHead(200, { "Content-Type": 'application/json' })
      response.end(JSON.stringify(data))
    })
  }
  else if (url === '/receitas' && method === 'POST') {
    lerArquivoReceitas((err, data) => {
      if (err) {
        response.writeHead(500, { "Content-Type": 'application/json' })
        response.end(JSON.stringify({ message: 'Erro no servidor' }))
        return
      }
      cadastrarReceita(request, data, (err, json) => {
        if (err) {
          response.writeHead(500, { "Content-Type": 'application/json' })
          response.end(JSON.stringify({ message: 'Erro no servidor' }))
          return
        }
        response.writeHead(202, { "Content-Type": 'application/json' })
        response.end(JSON.stringify(json))
      })
    })

  }
  else if (url.startsWith('/receitas/') && method === 'PUT') {
    lerArquivoReceitas((err, data) => {
      if (err) {
        response.writeHead(500, { "Content-Type": 'application/json' })
        response.end(JSON.stringify({ message: 'Erro no servidor' }))
        return
      }
      atualizarReceita(request, data, (err, json) => {
        if (err) {
          response.writeHead(500, { "Content-Type": 'application/json' })
          response.end(JSON.stringify({ message: 'Erro no servidor' }))
          return
        }
        response.writeHead(200, { "Content-Type": 'application/json' })
        response.end(JSON.stringify(json))
      })
    })
  }
  else if (url.startsWith('/receitas') && method === 'DELETE') {
    lerArquivoReceitas((err, data) => {
      if (err) {
        response.writeHead(500, { "Content-Type": 'application/json' })
        response.end(JSON.stringify({ message: 'Erro no servidor' }))
        return
      }
      deletarReceita(request, data, (err, json) => {
        if (err) {
          response.writeHead(500, { "Content-Type": 'application/json' })
          response.end(JSON.stringify({ message: 'Erro no servidor' }))
          return
        }
        response.writeHead(200, { "Content-Type": 'application/json' })
        response.end(JSON.stringify({message: "Receita deletada"}))
      })
    })
  }
  else {
    response.writeHead(404, { 'Content-Type': 'application/json' })
    response.end(JSON.stringify({ message: "rota não encontrada!" }))
  }
})

server.listen(PORT, () => {
  console.log('Servidor on PORT:' + PORT)
})
import fs from "node:fs"

export const lerArquivoReceitas = (callback) => {
  fs.readFile('receitas.json', 'utf8', (err, data) => {
    if (err) {
      callback(err)
      return
    }
    const json = JSON.parse(data)
    callback(null, json)
  })
}

export const lerArquivoUnicaReceita = (id, callback) => {

  fs.readFile('receitas.json', 'utf8', (err, data) => {
    if (err) {
      callback(err)
      return
    }

    const json = JSON.parse(data)
    const index = json.findIndex((receita) => receita.id == id)

    callback(null, json[index])
  })
}

export const lerArquivoCategoria = (callback) => {
  fs.readFile('receitas.json', 'utf8', (err, data) => {
    if (err) {
      callback(err)
      return
    }
    const json = JSON.parse(data)

    const categorias = []

    json.map((receita) => {
      categorias.push(receita.Categoria)
      return
    })

    callback(null, categorias)
  })
}

export const lerArquivoBusca = (request, callback) => {

  const url = new URL((request.headers.host) + (request.url))
  const params = url.searchParams

  const categoria = params.get('categoria')
  const nome = params.get('nome')
  const ingrediente = params.get('ingrediente')

  fs.readFile('receitas.json', 'utf8', (err, data) => {
    if (err) {
      callback(err)
      return
    }
    const json = JSON.parse(data)
    const receitasBusca = json.filter((receita) => receita.Categoria == categoria || receita.nome == nome || receita.Ingredientes.includes(ingrediente))

    callback(null, receitasBusca)
  })
}

export const lerArquivoIngredientes = (callback) => {
  fs.readFile('receitas.json', 'utf8', (err, data) => {
    if (err) {
      callback(err)
      return
    }
    const json = JSON.parse(data)

    const ingredientes = []

    json.map((receita) => {
      ingredientes.push(receita.Ingredientes)
      return
    })

    callback(null, ingredientes)
  })
}

export const cadastrarReceita = (request, receitas, callback) => {
  let body = ''

  request.on('data', (chunk) => {
    body += chunk
  })
  request.on('end', (err) => {
    if (err) {
      callback(err)
      return
    }
    const json = JSON.parse(body)
    json.id = receitas.length + 1
    receitas.push(json)

    fs.writeFile('receitas.json', JSON.stringify(receitas, null, 2), () => {
      callback(null, json)
    })
  })
}

export const atualizarReceita = (request, receitas, callback) => {
  const id = request.url.split('/')[2]
  const index = receitas.findIndex((receita) => receita.id == id)

  let body = ''

  request.on('data', (chunk) => {
    body += chunk
  })
  request.on('end', (err) => {
    if (err) {
      callback(err)
      return
    }
    const json = JSON.parse(body)
    receitas[index] = { ...receitas[index], ...json }

    fs.writeFile('receitas.json', JSON.stringify(receitas, null, 2), () => {
      callback(null, receitas[index])
    })
  })
}

export const deletarReceita = (request, receitas, callback) => {
  const id = request.url.split('/')[2]
  const index = receitas.findIndex((receita) => receita.id == id)

  if(index == -1){
    callback(undefined)
    return
  }
  receitas.splice(index, 1)

  fs.writeFile('receitas.json', JSON.stringify(receitas, null, 2), () => {
    callback(null, receitas)
  })
}
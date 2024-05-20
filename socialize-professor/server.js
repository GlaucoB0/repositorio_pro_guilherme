// Trabalhando com imagens
// Caminho de onde a imagem está na aplicação - PATH
// 1º - Colocar a imagem em uma pasta na raiz projeto - Não Paga
// 2º - Contratar serviços ( API's ) para adicionar imagens - Custo Alto

import { createServer } from "node:http"
import { writeFile, readFile, fstat, rename } from "node:fs"
import path, { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import formidable, { errors as formidableErrors } from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import { lerDadosUsuarios } from "./lerUsuarios.js";

const PORT = 3000;

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
//NORMALIZE O CAMINHO DA IMAGEM

const server = createServer(async (request, response) => {

  const { url, method } = request;

  if (method === "GET" && url === "/usuarios") { // Listar todos os usuarios
    lerDadosUsuarios((err, usuarios) => {
      if (err) {
        response.writeHead(400, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ message: "Não foi possivel ler o arquivo" }));
        return
      }
      response.writeHead(200, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify(usuarios));
    })
  }
  else if (method === 'POST' && url === '/usuarios') { // Cadastrar novo usuario
    let body = ''
    request.on('data', (chunk) => {
      body += chunk;
    })
    request.on('end', () => {
      const novoUsuario = JSON.parse(body)
      //Validações dos dados vindo do body

      lerDadosUsuarios((err, data) => {
        if (err) {
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ message: "Não foi possivel ler o arquivo" }));
          return
        }
        novoUsuario.id = uuidv4()

        const verificaSeEmailExiste = data.find((usuario) => usuario.email === novoUsuario.email)
        if (verificaSeEmailExiste) {
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ message: "Email já cadastrado" }));
          return
        }

        data.push(novoUsuario)
        writeFile('socialize.json', JSON.stringify(data, null, 2), (err) => {
          if (err) {
            response.writeHead(400, { 'Content-Type': 'application/json' });
            response.end(JSON.stringify({ message: "Não foi possivel ler o arquivo" }));
            return
          }
          response.writeHead(200, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify(novoUsuario));
        })
      })

    })
  }
  else if (method === 'POST' && url === '/perfil') {
    // parse a file upload

    const form = formidable({});
    let fields;
    let files;
    try {
      [fields, files] = await form.parse(request);
    } catch (err) {
      // example to check for a very specific error
      if (err.code === formidableErrors.maxFieldsExceeded) {
      }
      console.error(err);
      response.writeHead(err.httpCode || 400, { 'Content-Type': 'text/plain' });
      response.end(String(err));
      return;
    }

    const {id, nome, bio} = fields
    const imagemDePerfil = files.imagemDePerfil

    if(!nome || !bio || !imagemDePerfil){
      response.writeHead(400, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: "formulario não preenchido corretamente" }));
      return
    }
    lerDadosUsuarios((err,usuarios)=>{
      if(err){
        response.writeHead(500, {"Content-Type":"application/json"})
        response.end(JSON.stringify({message:"erro ao ler o arquivo"}))
        return
      }

      const indexUsuario = usuarios.findIndex((usuario)=>usuario.id === id[0])

      if(indexUsuario === -1){
        response.writeHead(404, {"Content-Type":"application/json"})
        response.end(JSON.stringify({message:"Usuario não encontrado"}))
        return
      }
      
      //caminho/imagens/id.png
      const caminhoImagem = path.join(__dirname, "imagens", id+".png")

      const perfil = {
        nome: nome[0],
        bio: bio[0],
        caminhoImagem,
      }
      
      usuarios[indexUsuario] = {...usuarios[indexUsuario], perfil}
      
      writeFile('socialize.json', JSON.stringify(usuarios, null, 2), (err)=>{
        if(err){
          response.writeHead(500, {"Content-Type":"application/json"})
          response.end(JSON.stringify({message:"não é possivel escrever no arquivo"}))
          return
        }
      })
      rename(files.imagemDePerfil[0].filepath, caminhoImagem, (err)=>{
        if(err){
          response.writeHead(500, {"Content-Type":"application/json"})
          response.end(JSON.stringify({message:"não é possivel escrever no arquivo"}))
          return
        }
      })
    })


    response.end()
  }
  else {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: "Rota não encontrada!" }));
  }

});

server.listen(PORT, () => {
  console.log('server on PORT:' + PORT)
})
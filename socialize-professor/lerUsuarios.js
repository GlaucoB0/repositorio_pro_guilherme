import {readFile} from 'node:fs'

export const lerDadosUsuarios = (callback) => {
  readFile('socialize.json', 'utf8', (err, data) => {
    if (err) {
      callback(err);
    }
    try {
      const usuarios = JSON.parse(data);
      callback(null, usuarios);
    } catch (err) {
      callback(err);
    }
  });
};
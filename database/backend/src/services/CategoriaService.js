const categoriaModel = require('../models/categoriaModel');

function validar({ nome }) {
  if (!nome || nome.trim().length < 2) {
    const erro = new Error('O nome da categoria é obrigatório (mín. 2 letras).');
    erro.status = 400;
    throw erro;
  }
}

async function listar() {
  return categoriaModel.listar();
}

async function buscar(id) {
  const cat = await categoriaModel.buscarPorId(id);
  if (!cat) {
    const erro = new Error('Categoria não encontrada.');
    erro.status = 404;
    throw erro;
  }
  return cat;
}

async function criar(dados) {
  validar(dados);
  return categoriaModel.criar(dados);
}

async function atualizar(id, dados) {
  await buscar(id); 
  validar(dados);
  return categoriaModel.atualizar(id, dados);
}

async function excluir(id) {
  await buscar(id);
  try {
    return await categoriaModel.excluir(id);
  } catch (e) {
    const erro = new Error('Não é possível excluir: há produtos nesta categoria.');
    erro.status = 400;
    throw erro;
  }
}

module.exports = { 
  listar, 
  buscar, 
  criar, 
  atualizar, 
  excluir 
};

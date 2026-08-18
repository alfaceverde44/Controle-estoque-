if (!pegarToken()) window.location.href = 'index.html';

const usuario = pegarUsuario();
if (usuario) document.getElementById('nome-usuario').textContent = 'Olá, ' + usuario.nome;

let categoriasCache = [];
let produtosCache = [];
let modalTipo = null;
let modalId = null;

function aviso(texto, tipo = 'sucesso') {
  const m = document.getElementById('mensagem');
  m.textContent = texto;
  m.className = 'mensagem ' + tipo;
  setTimeout(() => { m.className = 'mensagem'; }, 4000);
}

function trocarAba(id, botao) {
  document.querySelectorAll('.secao').forEach(s => s.classList.remove('ativa'));
  document.querySelectorAll('nav.abas button').forEach(b => b.classList.remove('ativa'));
  document.getElementById(id).classList.add('ativa');
  botao.classList.add('ativa');

  if (id === 'dashboard') carregarDashboard();
  if (id === 'produtos') carregarProdutos();
  if (id === 'categorias') carregarCategorias();
  if (id === 'movimentacoes') carregarMovimentacoes();
}

function abrirModal(titulo, htmlForm) {
  document.getElementById('modal-titulo').textContent = titulo;
  document.getElementById('modal-form').innerHTML = htmlForm;
  document.getElementById('modal-fundo').classList.add('aberto');
}

function fecharModal() {
  document.getElementById('modal-fundo').classList.remove('aberto');
  modalTipo = null;
  modalId = null;
}

function moeda(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function carregarDashboard() {
  try {
    const d = await http.get('/movimentacoes/dashboard');
    document.getElementById('c-produtos').textContent = d.total_produtos;
    document.getElementById('c-categorias').textContent = d.total_categorias;
    document.getElementById('c-itens').textContent = d.itens_em_estoque;
    document.getElementById('c-valor').textContent = moeda(d.valor_total_estoque);
    
    const tbody = document.getElementById('tabela-alertas');
    if (!d.produtos_abaixo_minimo.length) {
      tbody.innerHTML = '<tr><td colspan="4" class="vazio">Nenhum produto abaixo do mínimo.</td></tr>';
    } else {
      tbody.innerHTML = d.produtos_abaixo_minimo.map(p => `
        <tr>
          <td>${p.nome}</td>
          <td>${p.quantidade}</td>
          <td>${p.estoque_minimo}</td>
          <td><span class="tag tag-baixo">Repor</span></td>
        </tr>
      `).join('');
    }
  } catch (e) {
    aviso(e.message, 'erro');
  }
}

async function carregarCategorias() {
  try {
    categoriasCache = await http.get('/categorias');
    const tbody = document.getElementById('tabela-categorias');
    if (!categoriasCache.length) {
      tbody.innerHTML = '<tr><td colspan="3" class="vazio">Nenhuma categoria cadastrada.</td></tr>';
      return;
    }
    tbody.innerHTML = categoriasCache.map(c => `
      <tr>
        <td>${c.nome}</td>
        <td>${c.descricao || '-'}</td>
        <td class="acoes">
          <button class="btn btn-pequeno" onclick="abrirFormCategoria(${c.id})">Editar</button>
          <button class="btn btn-perigo btn-pequeno" onclick="excluirCategoria(${c.id})">Excluir</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    aviso(e.message, 'erro');
  }
}

function abrirFormCategoria(id = null) {
  modalTipo = 'categoria';
  modalId = id;
  const cat = id ? categoriasCache.find(c => c.id === id) : {};
  abrirModal(id ? 'Editar categoria' : 'Nova categoria', `
    <div class="form-linha">
      <label>Nome *</label>
      <input id="f-nome" value="${cat.nome || ''}">
    </div>
    <div class="form-linha">
      <label>Descrição</label>
      <input id="f-descricao" value="${cat.descricao || ''}">
    </div>
  `);
}

async function salvarCategoria() {
  const corpo = {
    nome: document.getElementById('f-nome').value.trim(),
    descricao: document.getElementById('f-descricao').value.trim()
  };

  if (!corpo.nome) return aviso('Informe o nome da categoria.', 'erro');

  if (modalId) await http.put('/categorias/' + modalId, corpo);
  else await http.post('/categorias', corpo);

  fecharModal();
  aviso('Categoria salva com sucesso.');
  carregarCategorias();
}

async function excluirCategoria(id) {
  if (!confirm('Excluir esta categoria?')) return;
  try {
    await http.del('/categorias/' + id);
    aviso('Categoria excluída.');
    carregarCategorias();
  } catch (e) {
    aviso(e.message, 'erro');
  }
}

async function carregarProdutos() {
  try {
    produtosCache = await http.get('/produtos');
    const tbody = document.getElementById('tabela-produtos');
    if (!produtosCache.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="vazio">Nenhum produto cadastrado.</td></tr>';
      return;
    }
    tbody.innerHTML = produtosCache.map(p => `
      <tr>
        <td>${p.nome}</td>
        <td>${p.categoria_nome}</td>
        <td>${moeda(p.preco)}</td>
        <td>${p.quantidade} ${p.quantidade <= p.estoque_minimo ? '<span class="tag tag-baixo">baixo</span>' : ''}</td>
        <td>${p.estoque_minimo}</td>
        <td class="acoes">
          <button class="btn btn-pequeno" onclick="abrirFormProduto(${p.id})">Editar</button>
          <button class="btn btn-perigo btn-pequeno" onclick="excluirProduto(${p.id})">Excluir</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    aviso(e.message, 'erro');
  }
}

async function abrirFormProduto(id = null) {
  modalTipo = 'produto';
  modalId = id;

  if (!categoriasCache.length) categoriasCache = await http.get('/categorias');

  const p = id ? produtosCache.find(x => x.id === id) : {};
  const opcoes = categoriasCache.map(c =>
    `<option value="${c.id}" ${p.categoria_id === c.id ? 'selected' : ''}>${c.nome}</option>`
  ).join('');

  abrirModal(id ? 'Editar produto' : 'Novo produto', `
    <div class="form-linha">
      <label>Nome *</label>
      <input id="f-nome" value="${p.nome || ''}">
    </div>
    <div class="form-linha">
      <label>Descrição</label>
      <input id="f-descricao" value="${p.descricao || ''}">
    </div>
    <div class="form-linha">
      <label>Categoria *</label>
      <select id="f-categoria">${opcoes}</select>
    </div>
    <div class="form-linha">
      <label>Preço (R$) *</label>
      <input id="f-preco" type="number" step="0.01" min="0" value="${p.preco || 0}">
    </div>
    <div class="form-linha">
      <label>Quantidade inicial *</label>
      <input id="f-quantidade" type="number" min="0" value="${p.quantidade || 0}">
    </div>
    <div class="form-linha">
      <label>Estoque mínimo *</label>
      <input id="f-minimo" type="number" min="0" value="${p.estoque_minimo || 0}">
    </div>
  `);
}

async function salvarProduto() {
  const corpo = {
    nome: document.getElementById('f-nome').value.trim(),
    descricao: document.getElementById('f-descricao').value.trim(),
    categoria_id: Number(document.getElementById('f-categoria').value),
    preco: Number(document.getElementById('f-preco').value),
    quantidade: Number(document.getElementById('f-quantidade').value),
    estoque_minimo: Number(document.getElementById('f-minimo').value)
  };

  if (!corpo.nome) return aviso('Informe o nome do produto.', 'erro');
  if (!corpo.categoria_id) return aviso('Selecione uma categoria.', 'erro');

  if (modalId) await http.put('/produtos/' + modalId, corpo);
  else await http.post('/produtos', corpo);

  fecharModal();
  aviso('Produto salvo com sucesso.');
  carregarProdutos();
}

async function excluirProduto(id) {
  if (!confirm('Excluir este produto?')) return;
  try {
    await http.del('/produtos/' + id);
    aviso('Produto excluído.');
    carregarProdutos();
  } catch (e) {
    aviso(e.message, 'erro');
  }
}

async function carregarMovimentacoes() {
  try {
    const lista = await http.get('/movimentacoes');
    const tbody = document.getElementById('tabela-movimentacoes');
    if (!lista.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="vazio">Nenhuma movimentação registrada.</td></tr>';
      return;
    }
    tbody.innerHTML = lista.map(m => `
      <tr>
        <td>${new Date(m.criado_em).toLocaleString('pt-BR')}</td>
        <td>${m.produto_nome}</td>
        <td><span class="tag ${m.tipo === 'ENTRADA' ? 'tag-entrada' : 'tag-saida'}">${m.tipo}</span></td>
        <td>${m.quantidade}</td>
        <td>${m.usuario_nome}</td>
        <td>${m.observacao || '-'}</td>
        <td class="acoes">
          <button class="btn btn-perigo btn-pequeno" onclick="excluirMovimentacao(${m.id})">Excluir</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    aviso(e.message, 'erro');
  }
}

async function abrirFormMovimentacao() {
  modalTipo = 'movimentacao';
  modalId = null;

  if (!produtosCache.length) produtosCache = await http.get('/produtos');

  const opcoes = produtosCache.map(p =>
    `<option value="${p.id}">${p.nome} (estoque: ${p.quantidade})</option>`
  ).join('');

  abrirModal('Nova movimentação', `
    <div class="form-linha">
      <label>Produto *</label>
      <select id="f-produto">${opcoes}</select>
    </div>
    <div class="form-linha">
      <label>Tipo *</label>
      <select id="f-tipo">
        <option value="ENTRADA">ENTRADA</option>
        <option value="SAIDA">SAIDA</option>
      </select>
    </div>
    <div class="form-linha">
      <label>Quantidade *</label>
      <input id="f-quantidade" type="number" min="1" value="1">
    </div>
    <div class="form-linha">
      <label>Observação</label>
      <input id="f-observacao">
    </div>
  `);
}

async function salvarMovimentacao() {
  const corpo = {
    produto_id: Number(document.getElementById('f-produto').value),
    tipo: document.getElementById('f-tipo').value,
    quantidade: Number(document.getElementById('f-quantidade').value),
    observacao: document.getElementById('f-observacao').value.trim()
  };

  if (!corpo.produto_id) return aviso('Selecione um produto.', 'erro');
  if (!corpo.quantidade || corpo.quantidade <= 0) return aviso('Quantidade inválida.', 'erro');

  await http.post('/movimentacoes', corpo);
  fecharModal();
  aviso('Movimentação registrada.');
  carregarMovimentacoes();
}

async function salvarModal() {
  try {
    if (modalTipo === 'categoria') await salvarCategoria();
    else if (modalTipo === 'produto') await salvarProduto();
    else if (modalTipo === 'movimentacao') await salvarMovimentacao();
  } catch (e) {
    aviso(e.message, 'erro');
  }
}

carregarDashboard();
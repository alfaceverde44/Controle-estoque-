const jwt = require('jsonwebtoken');

function autenticar(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const parts = cabecalho.split(' ');

  if (parts.length !== 2) {
    return res.status(401).json({ erro: 'Token não enviado ou malformatado.' });
  }

  const [tipo, token] = parts;

  if (tipo !== 'Bearer') {
    return res.status(401).json({ erro: 'Tipo de autenticação inválido.' });
  }

  try {
    const dados = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = dados; // { id, nome, email }
    next();
  } catch (e) {
    return res.status(401).json({ erro: 'Token inválido ou expirado.' });
  }
}

module.exports = autenticar;

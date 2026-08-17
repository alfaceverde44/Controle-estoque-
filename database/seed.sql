USE controle_estoque;

INSERT INTO usuarios (nome, email, senha_hash) VALUES
(&#39;Administrador&#39;, &#39;admin@estoque.com&#39;,
&#39;$2a$10$Pzk56Ifp9RBmCo/YWXezOu13s92v50WGsoHeX/RUwBo7YKNOmvEQ.&#39;);

INSERT INTO categorias (nome, descricao) VALUES
(&#39;Bebidas&#39;, &#39;Refrigerantes, sucos e aguas&#39;),
(&#39;Limpeza&#39;, &#39;Produtos de higiene e limpeza&#39;),
(&#39;Papelaria&#39;, &#39;Material de escritorio&#39;);

INSERT INTO produtos (nome, descricao, preco, quantidade, estoque_minimo, categoria_id) VALUES
(&#39;Agua Mineral 500ml&#39;, &#39;Garrafa 500ml&#39;, 2.50, 120, 20, 1),
(&#39;Refrigerante Cola 2L&#39;,&#39;Garrafa 2 litros&#39;, 8.90, 40, 10, 1),
(&#39;Detergente Neutro&#39;, &#39;Frasco 500ml&#39;, 3.20, 60, 15, 2),
(&#39;Papel A4 500 folhas&#39;,&#39;Resma branca&#39;, 24.90, 15, 5, 3);

INSERT INTO movimentacoes (produto_id, usuario_id, tipo, quantidade, observacao) VALUES
(1, 1, &#39;ENTRADA&#39;, 100, &#39;Compra inicial&#39;),
(1, 1, &#39;SAIDA&#39;, 10, &#39;Venda balcao&#39;),
(2, 1, &#39;ENTRADA&#39;, 40, &#39;Reposicao&#39;),
(4, 1, &#39;SAIDA&#39;, 3, &#39;Uso interno&#39;);
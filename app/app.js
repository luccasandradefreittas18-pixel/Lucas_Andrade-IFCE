const express = require('express');
const app = express()
const port = 3000

var bodyParser = require('body-parser');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Lucas Andrade!')
})

app.get('/sobre', (req, res) => {
  res.send('sobre!')
})

app.post('/Admin/Produtos', (req, res) => {
  const { nome, descricao, preco, categoria } = req.body;

  console.log('Novo produto recebido:');
  console.log('Nome:', nome);
  console.log('Descrição:', descricao);
  console.log('Preço:', preco);
  console.log('Categoria:', categoria);

  res.send('Produto cadastrado com sucesso!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
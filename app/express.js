const express = require('express');
const app = express()
const port = 3000
const ProdutosService = require('./lib/ProdutosService');
const ProdutosController = require('./controllers/ProdutosController');

const produtosService = new ProdutosService();
const produtosController = new ProdutosController(produtosService);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.use(produtosController.getRouter());

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
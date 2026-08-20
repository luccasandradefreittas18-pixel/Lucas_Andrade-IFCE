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
  console.log(req.body);
  const {nome, email} = req.body;
  res.send('Admin!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
const express = require('express');
const app = express()
const port = 3000

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('Lucas Andrade!')
})

app.get('/sobre', (req, res) => {
  res.send('sobre!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
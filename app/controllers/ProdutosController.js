const express = require('express');

class ProdutosController {
    constructor(produtosService) {
        this.produtosService = produtosService;
    }
    getRouter() {
        const router = express.Router();
        router.get('/', this.index.bind(this));
        router.post('/admin/produtos', this.inserir.bind(this));
        router.get('/admin/produtos', this.listar.bind(this));
        router.get('/admin/produtos/:id', this.ver.bind(this));
        router.put('/admin/produtos/:id', this.alterar.bind(this));
        return router;
    }
    index(req, res) {
        let nome = req.query.nome;
        let produtos = this.produtosService.listar();
        res.render('index', {nome, produtos});
    }
    inserir(req, res) {
        let produto = {
            nome: req.body.nome,
            preco: parseFloat(req.body.preco),
            descricao: req.body.descricao,
            foto: req.body.foto,
            tamanho: req.body.tamanho
        }
        try {
            this.produtosService.inserir(produto);
            res.status(201).json({mensagem: 'Cadastrado com sucesso', produto})
        } catch (e) {
            res.status(400).send(e.message);
        }
    }
    listar(req, res) {
        let produtos = this.produtosService.listar();
        if (req.header('accept') == 'text/html') {
            res.render('teste', {nome: 'mundo', produtos});
        } else {
            res.json(produtos);
        }
    }
    ver(req, res) {
        let id = req.params.id;
        let produto = this.produtosService.ver(id);
        res.json(produto);
    }
    alterar(req, res) {
        let id = req.params.id;
        let produto = {
            nome: req.body.nome,
            preco: parseFloat(req.body.preco),
            descricao: req.body.descricao,
            foto: req.body.foto,
            tamanho: req.body.tamanho
        }
        this.produtosService.alterar(id, produto);
        res.json('Produto alterado com sucesso!');
    }
}
module.exports = ProdutosController;
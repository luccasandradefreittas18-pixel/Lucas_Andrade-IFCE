class ProdutosService {
    produtos = [];
    getDesconto(preco) {
        return preco - preco * 0.1;
    }
    inserir(produto) {
        this.validar(produto);

        produto.desconto = this.getDesconto(produto.preco);
        this.produtos.push(produto);
        produto.id = this.produtos.length;
    }
    validar(produto) {
        if (!produto.nome) {
            throw new Error('Nome não pode ser em branco!');
        }
    }

    listar() {
        return this.produtos;
    }
    ver(id) {
        return this.produtos.filter(p => p.id == id);
    }
    alterar(id, produto) {
        this.validar(produto);
        let indice = this.produtos.findIndex(p => p.id == id);
        let produtoAntigo = this.produtos[indice];
        this.produtos[indice] = {...produtoAntigo, ...produto};
    }
}
module.exports = ProdutosService;
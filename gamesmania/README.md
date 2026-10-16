# GAMESMANIA

Aplicacao Node.js + Express da loja de acessorios gamer GAMESMANIA, reescrita a
partir das paginas estaticas originais (`index2.html`, `detalhes.html`,
`autor.html`, `cadastro_produtos.html`, `cadastro_usuarios.html`, `login.html`)
em arquitetura **MVC**, com templates HTML separados (EJS) e suporte a Docker.

## Como rodar

Requisito: **Node.js 20 ou superior** (o banco usa `better-sqlite3`, que baixa um binario
pre-compilado na instalacao, entao e preciso acesso a internet no `npm install`).

### Opcao 1 — Node.js direto

```bash
npm install
npm start
```

A aplicacao sobe em `http://localhost:3000` (porta configuravel via `PORT`).

### Opcao 2 — Docker Compose (recomendado)

```bash
docker compose up --build
```

Acesse `http://localhost:3000`. Para parar: `Ctrl+C` ou `docker compose down`.

### Opcao 3 — Docker "na mao"

```bash
docker build -t gamesmania .
docker run -p 3000:3000 -e SESSION_SECRET=troque-este-segredo gamesmania
```

### Acesso administrativo inicial

```
E-mail: admin@gamesmania.com
Senha:  admin123
```

Esse usuario e criado automaticamente na primeira inicializacao (quando o banco esta vazio). Novos
cadastros feitos pela pagina "Cadastre-se" entram sempre como `cliente`;
apenas um admin logado pode promover alguem a `admin` (na tela de edicao de
usuarios).

## Estrutura (MVC)

```
gamesmania/
├── server.js                  # ponto de entrada / configuracao do Express
├── Dockerfile                 # imagem Node 20 Alpine
├── docker-compose.yml         # build + run com uma variavel de ambiente
├── .dockerignore
├── db/                        # Banco de dados (SQLite)
│   ├── database.js            #   conexao + criacao das tabelas
│   ├── seed.js                #   dados iniciais (so se o banco estiver vazio)
│   └── seed-data.json         #   catalogo de exemplo
├── data/                      # arquivo do banco (gamesmania.db) - ignorado pelo Git
├── tests/crud.test.js         # testes de integracao do CRUD (npm test)
├── models/                    # Model: acesso ao banco (CRUD em SQL)
│   ├── productModel.js        #   produtos ("temas")
│   ├── categoryModel.js       #   categorias
│   ├── userModel.js           #   usuarios + hash de senha (scrypt)
│   └── contactModel.js        #   mensagens do formulario de contato
├── views/                     # View: arquivos HTML (.ejs) separados por pagina
│   ├── helpers.js             #   funcoes auxiliares expostas aos templates
│   ├── partials/
│   │   ├── top.ejs            #   <head>, cabecalho, menu e abertura do <main>
│   │   └── bottom.ejs         #   fechamento do <main>, rodape e <script>
│   └── pages/
│       ├── home.ejs
│       ├── product.ejs
│       ├── products-admin.ejs
│       ├── product-form.ejs
│       ├── categories.ejs
│       ├── category-form.ejs
│       ├── users.ejs
│       ├── user-form.ejs
│       ├── login.ejs
│       ├── recover-password.ejs
│       ├── author.ejs
│       ├── message.ejs
│       └── 404.ejs
├── controllers/                # Controller: logica de GET/POST/PUT/DELETE
│   ├── productController.js
│   ├── categoryController.js
│   ├── userController.js
│   ├── authController.js
│   ├── messageController.js    # mensagens do formulario de contato (admin)
│   ├── pageController.js
│   └── negotiate.js            # helper de content negotiation (HTML x JSON)
├── middlewares/
│   └── auth.js                 # exigirLogin / exigirAdmin
├── routes/                     # Rotas Express -> Controller
│   ├── pageRoutes.js
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── productRoutes.js
│   ├── categoryRoutes.js
│   └── messageRoutes.js
└── public/                     # arquivos estaticos
    ├── css/style.css
    ├── js/main.js
    └── imagens/*.svg
```

Os dados ficam em um banco **SQLite** (`data/gamesmania.db`), entao
**sobrevivem a reinicios** do servidor. Veja a secao "Banco de dados" abaixo.

## Sobre os templates (`views/`)

O HTML de cada pagina agora fica em um arquivo `.ejs` proprio dentro de
`views/pages/`, em vez de strings dentro de um arquivo `.js` (como estava na
versao anterior). Os controllers so chamam `res.render("pages/nome", dados)`
— nenhum HTML fica hardcoded no controller.

`views/partials/top.ejs` e `bottom.ejs` guardam o que se repete em toda
pagina (cabecalho, menu, rodape). Cada pagina inclui os dois:

```ejs
<%- include("../partials/top", { title: "Inicio", active: "inicio" }) %>
  ... conteudo especifico da pagina ...
<%- include("../partials/bottom") %>
```

`usuario` (quem esta logado) e disponibilizado automaticamente para todo
template por um middleware em `server.js` — nao precisa passar isso em cada
`res.render`. `formatarPreco` fica em `app.locals` pelo mesmo motivo.

O EJS escapa `<%= %>` automaticamente (protege contra XSS); use `<%- %>`
apenas quando o conteudo ja for HTML de confianca (como os `include`).

## Rotas

### Publicas

| Metodo | Rota                | Descricao                                             |
|--------|---------------------|--------------------------------------------------------|
| GET    | `/`                 | Pagina inicial, catalogo dinamico (aceita `?categoria=ID`) |
| GET    | `/tema/:id`         | Pagina de detalhes de um produto                       |
| GET    | `/autor`            | Pagina "Sobre o autor"                                 |
| POST   | `/contato`          | Envio do formulario de contato                         |
| GET    | `/usuarios/novo`    | Formulario "Cadastre-se"                               |
| POST   | `/usuarios`         | Cria um usuario (cliente) e ja inicia a sessao         |
| GET    | `/login`            | Tela de login (aceita `?proximo=/rota`)                |
| POST   | `/login`            | Autentica e cria a sessao                              |
| POST   | `/logout`           | Encerra a sessao                                       |
| GET    | `/sessao`           | JSON com o usuario logado (ou `null`)                  |
| GET    | `/recuperar-senha`  | Formulario "Esqueci minha senha"                       |
| POST   | `/recuperar-senha`  | Confirmacao (envio de e-mail nao implementado)          |
| GET    | `/categorias`       | Lista de categorias — **somente em JSON**              |

### Administrativas (exigem login de admin)

| Metodo | Rota                     | Descricao                                    |
|--------|--------------------------|-----------------------------------------------|
| GET    | `/produtos`              | Cadastro de produtos: formulario + tabela     |
| POST   | `/produtos`              | Cria um produto                               |
| GET    | `/produtos/novo`         | Formulario de cadastro isolado                |
| GET    | `/produtos/:id/editar`   | Formulario de edicao                          |
| PUT    | `/produtos/:id`          | Atualiza um produto                           |
| DELETE | `/produtos/:id`          | Remove um produto                             |
| GET    | `/categorias`            | Gerenciamento de categorias (HTML)            |
| POST   | `/categorias`            | Cria uma categoria                            |
| GET    | `/categorias/:id/editar` | Formulario de edicao                          |
| PUT    | `/categorias/:id`        | Atualiza uma categoria                        |
| DELETE | `/categorias/:id`        | Remove (bloqueado se houver produtos usando-a) |
| GET    | `/usuarios`              | Cadastro de usuarios: formulario + tabela     |
| GET    | `/mensagens`             | Mensagens recebidas pelo formulario de contato |
| DELETE | `/mensagens/:id`         | Remove uma mensagem ja tratada                |

### Exigem login (proprio usuario ou admin)

| Metodo | Rota                     | Descricao                                    |
|--------|--------------------------|-----------------------------------------------|
| GET    | `/usuarios/:id/editar`   | Edicao do cadastro                            |
| PUT    | `/usuarios/:id`          | Atualiza o cadastro                           |
| DELETE | `/usuarios/:id`          | Remove (bloqueia excluir o unico admin)       |

Como formularios HTML nao suportam `PUT`/`DELETE`, essas rotas sao acionadas
via `method-override` (`?_method=PUT` ou `?_method=DELETE`).

## Autenticacao

- Sessao com `express-session` (cookie `httpOnly`, validade de 8 horas).
- Senhas nunca sao guardadas em texto puro: `crypto.scryptSync` com salt
  aleatorio por usuario, comparacao com `timingSafeEqual`.
- `senhaHash` e `senhaSalt` nunca aparecem nas respostas JSON nem no HTML.
- Sem login, rotas administrativas redirecionam para `/login?proximo=...` (HTML)
  ou retornam `401` (JSON); logado sem ser admin, retornam `403`.
- O menu do cabecalho muda conforme a sessao: visitantes veem "Cadastre-se" e
  "Entrar"; admins veem "Produtos", "Categorias", "Usuarios" e "Sair".

## Content negotiation

Todas as rotas verificam o cabecalho `Accept` (`controllers/negotiate.js`):

- `Accept: application/json` → resposta em JSON (API)
- qualquer outro caso → pagina HTML renderizada pelos templates `.ejs`

```bash
curl -c cookies.txt -H "Accept: application/json" \
  -d "email=admin@gamesmania.com&senha=admin123" http://localhost:3000/login

curl -b cookies.txt -H "Accept: application/json" http://localhost:3000/usuarios
```

## Frontend

- `public/css/style.css`: layout responsivo (grid/flexbox), tema escuro tipo
  "painel de controle". O painel admin usa formulario a esquerda e tabela a
  direita, empilhando em telas menores; tabelas viram cartoes no celular.
- `public/js/main.js`: menu mobile, confirmacao antes de excluir, checkbox
  "Mostrar senha", conferencia das senhas no cadastro, mascara de telefone
  `(00) 00000-0000` e envio do formulario de contato via `fetch`.

## Banco de dados (SQLite) e CRUD

A persistencia usa **SQLite** via [`better-sqlite3`](https://github.com/WiseLibs/better-sqlite3):
nao precisa instalar nem configurar servidor de banco, e o arquivo
`data/gamesmania.db` e criado sozinho na primeira execucao. Caminho
configuravel pela variavel `DB_PATH` (use `:memory:` para um banco temporario).

Tabelas: `categorias`, `produtos` (com chave estrangeira para categorias),
`usuarios` (e-mail unico, sem diferenciar maiusculas; senha apenas como hash
scrypt) e `mensagens`. Na primeira execucao, `db/seed.js` cria o catalogo de
exemplo e o admin; depois disso os dados existentes sao preservados.

Cada Model (`models/*.js`) implementa as operacoes basicas em SQL
(consultas preparadas, sem concatenar texto do usuario no SQL):

| Operacao          | Funcao do Model | SQL         | Rota (JSON: `Accept: application/json`)        |
|-------------------|-----------------|-------------|--------------------------------------------------|
| Inserir           | `create`        | `INSERT`    | `POST /produtos`, `/categorias`, `/usuarios`, `/contato` |
| Listar            | `getAll`        | `SELECT`    | `GET /produtos`, `/categorias`, `/usuarios`, `/mensagens` |
| Procurar pelo id  | `getById`       | `SELECT ... WHERE id = ?` | `GET /tema/:id`, `/categorias/:id`, `/usuarios/:id`, `/mensagens/:id` |
| Alterar           | `update`        | `UPDATE`    | `PUT /produtos/:id`, `/categorias/:id`, `/usuarios/:id` |
| Apagar            | `remove`        | `DELETE`    | `DELETE /produtos/:id`, `/categorias/:id`, `/usuarios/:id`, `/mensagens/:id` |

Mensagens de contato nao tem "alterar" (uma mensagem recebida nao e editada).
Rotas administrativas exigem login de admin (ver tabela de rotas acima).

### Testes

```bash
npm test
```

Sobe o servidor com um banco temporario, executa o CRUD completo de cada
entidade e confirma que os dados persistem apos reiniciar o servidor.

## Docker

O `Dockerfile` usa `node:20-alpine`, copia primeiro `package*.json` (para
aproveitar cache de camadas), instala apenas dependencias de producao e roda
como usuario sem privilegios. Variaveis de ambiente aceitas:

| Variavel         | Padrao                                    | Uso                                  |
|------------------|--------------------------------------------|---------------------------------------|
| `PORT`           | `3000`                                     | Porta em que o Express escuta         |
| `SESSION_SECRET` | valor de desenvolvimento (troque em prod) | Assina o cookie de sessao do login    |
| `DB_PATH`        | `data/gamesmania.db`                       | Arquivo do banco SQLite               |

O `docker-compose.yml` monta o volume `gamesmania-data` em `/app/data`, entao
o banco **persiste** entre `docker compose down`/`up`. Para recomecar do zero:
`docker compose down -v`. Com `docker run`, use `-v gamesmania-data:/app/data`.

## Observacoes

- As tabelas da area administrativa usam linhas alternadas (zebra) para facilitar a leitura.
- O campo de imagem do produto recebe o **caminho** do arquivo
  (ex.: `/imagens/mouse.svg`). Upload real de arquivo exigiria `multer`.
- A recuperacao de senha exibe a confirmacao, mas nao envia e-mail.

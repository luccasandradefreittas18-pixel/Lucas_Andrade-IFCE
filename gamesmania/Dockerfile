# Imagem enxuta baseada em Alpine com Node.js 20.
FROM node:20-alpine

# Diretorio de trabalho dentro do container.
WORKDIR /app

# Copia primeiro so os manifests para aproveitar o cache de camadas do
# Docker: "npm install" so roda de novo se package*.json mudar.
COPY package*.json ./
# better-sqlite3 normalmente baixa um binario pronto; as ferramentas de build
# abaixo servem de garantia caso precise compilar, e sao removidas em seguida
# para a imagem final ficar enxuta.
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
    && npm install --omit=dev \
    && apk del .build-deps

# Copia o restante do codigo da aplicacao.
COPY . .

# Pasta do banco SQLite, gravavel pelo usuario sem privilegios.
RUN mkdir -p /app/data && chown -R node:node /app/data

# Roda como usuario sem privilegios (a imagem node:alpine ja traz "node").
USER node

# Porta em que o Express escuta (ver server.js / variavel PORT).
EXPOSE 3000

# Variaveis com valores padrao; sobrescreva no "docker run -e" ou no
# docker-compose.yml conforme necessario.
ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server.js"]

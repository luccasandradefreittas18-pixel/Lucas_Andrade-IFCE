# Imagem enxuta baseada em Alpine com Node.js 20.
FROM node:20-alpine

# Diretorio de trabalho dentro do container.
WORKDIR /app

# Copia primeiro so os manifests para aproveitar o cache de camadas do
# Docker: "npm install" so roda de novo se package*.json mudar.
COPY package*.json ./
RUN npm install --omit=dev

# Copia o restante do codigo da aplicacao.
COPY . .

# Roda como usuario sem privilegios (a imagem node:alpine ja traz "node").
USER node

# Porta em que o Express escuta (ver server.js / variavel PORT).
EXPOSE 3000

# Variaveis com valores padrao; sobrescreva no "docker run -e" ou no
# docker-compose.yml conforme necessario.
ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "server.js"]

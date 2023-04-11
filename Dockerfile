FROM node:16

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

CMD ["npm", "start"]

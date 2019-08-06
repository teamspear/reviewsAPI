FROM node:10
WORKDIR '/app'
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8901
CMD node index.js
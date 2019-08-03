FROM node:10
WORKDIR .
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8901
CMD node index.js
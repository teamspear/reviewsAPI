FROM node:10
WORKDIR /server
COPY package*.json ./
COPY ./server .
RUN npm install
EXPOSE 8901
CMD ls && node index.js
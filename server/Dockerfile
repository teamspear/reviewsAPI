FROM node
WORKDIR /server
COPY package*.json ./
COPY . .
RUN npm install
EXPOSE 8901
CMD ls && node index.js
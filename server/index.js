const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database/index.js');
const app = express();


let port = process.env.PORT || 8901;
app.use(bodyParser.json());


app.get('/', (req,res) => {
  res.send('inside docker container');
})

app.get('/reviews/:product_id/list', (req,res) => {
  db.listAll(req,res);
});

app.get('/reviews/:review_id/photos', (req,res) => {
  db.listPhotos(req,res);
});

app.listen(port, () => {
  console.log(`listening in on ${port}...`)
});
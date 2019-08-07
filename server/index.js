const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database/index.js');
const app = express();


let port = process.env.PORT || 8901;

app.use(cors());
app.use(bodyParser.json());





app.get('/', (req,res) => {
  res.send('loaderio-fe95a7e3e8ba96761b12a768920cf5a3');
})

app.get('/reviews/:product_id/alllist', (req,res) => {
  db.all(req,res);
});

app.get('/reviews/:product_id/list', (req,res) => {
  db.listAll(req,res);
});

app.get('/reviews/:product_id/meta', (req,res) => {
  db.meta(req,res);
});

app.put('/reviews/helpful/:review_id', (req,res) => {
  db.helpful(req,res);
});

app.put('/reviews/report/:review_id', (req,res) => {
  db.reported(req,res);
})

app.post('/reviews/:product_id', (req,res) => {
  db.addReview(req,res);
})

app.listen(port, () => {
  console.log(`listening in on ${port}...`)
});
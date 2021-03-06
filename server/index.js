const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database/index.js');

const app = express();

let port = process.env.PORT || 8901;

app.use(cors());
app.use(bodyParser.json());

app.use(express.static('/server/loader'))

app.get('/health', (req,res) => {
  res.sendStatus(200);
})

app.get('/loaderio-5cd7893d0a64a5248978ea7b02be1e2e/', (req,res) => {
  res.sendFile(__dirname+'/loader/loaderio-5cd7893d0a64a5248978ea7b02be1e2e.txt');
})

app.get('/reviews/:product_id/list', (req,res) => {
  db.all(req,res);
});

app.get('/reviews/:product_id/listNOREDIS', (req,res) => {
  db.allNOREDIS(req,res);
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
const axios = require("axios");

axios.get(`http://localhost:8901/reviews/1/list`, {
  params: {
    sort:'newest',
    count: 50
  }
}).then(results=>console.log(results.data.results))
  .catch(err=>console.log(err));


// axios.post(`http://localhost:8901/reviews/1`, {
//   "rating": 1,
//   "summary": "test1",
//   "body": "test1",
//   "recommend": "true",
//   "name": "Bob",
//   "email": "bob@bobby.com",
//   "photos" : ['first photo','second photo'],
//   "characteristics" : "{14:5,12:3}"
// }).then(results=>console.log(results.data.results))
//   .catch(err=>console.log(err));

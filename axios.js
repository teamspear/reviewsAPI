const axios = require("axios");

axios.get(`http://localhost:8901/reviews/123/list`, {
  params: {
    sort:'helpful',
    count: 5
  }
}).then(results=>console.log(results.data.results))
  .catch(err=>console.log(err));

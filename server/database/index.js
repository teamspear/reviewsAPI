const { Pool } = require("pg");

const connectionString = "postgres://localhost:5432/sdc";
const pool = new Pool({
  connectionString: connectionString
});


const listallFormat = (q) => {
  let results = [];
  for (let i = 0; i < q.length; i++) {
    let result = {
      review_id : q[i].id,
      rating : q[i].rating,
      summary : q[i].summary,
      recommend : q[i].recommend,
      response : q[i].response,
      body : q[i].body,
      date : q[i].date,
      reviewer_name : q[i].reviewer_name,
      photos : q[i].photos
    }
    results.push(result);
  }
  let listAllObj = {
    product : q[0].product_id,
    page : 0,
    count : 50,
    results : results
  }
  return listAllObj;
}




module.exports = {
  listAll: (req, res) => {
    console.time()
    pool
      .query(
        `SELECT list_reviews.*, array_agg(review_photos.url) AS photos FROM list_reviews
       LEFT JOIN review_photos
       ON review_photos.review_id = list_reviews.id
       WHERE list_reviews.product_id = ${req.params.product_id} AND list_reviews.reported = false
       GROUP BY list_reviews.id
       LIMIT 50;`)
      .then(results => {res.send(listallFormat(results.rows));console.timeEnd()})
      .catch(err => console.log(err));
  },
  meta: (req, res) => {
    console.time();
    Promise.all([
    pool
      .query(
        `SELECT rating, COUNT(rating) FROM list_reviews 
       WHERE product_id = ${req.params.product_id} 
       GROUP BY rating;`
      ),
    pool.query(
      `SELECT recommend, COUNT(recommend) FROM list_reviews WHERE product_id = ${req.params.product_id} AND recommend = true GROUP BY recommend`),
    pool.query(
      `Select characteristic_id, AVG(value) FROM characteristic_reviews 
       WHERE characteristic_id IN (SELECT id from characteristics where product_id = ${req.params.product_id}) 
       GROUP BY characteristic_id;`
    )
    ]).then(results => {results.map(result => console.log(result.rows));console.timeEnd();res.sendStatus(200)})
  },
  helpful: (req, res) => {
    pool
      .query(
        `UPDATE list_reviews
       SET helpfulness = helpfulness + 1
       WHERE id = ${req.params.review_id}`
      )
      .then(() => res.sendStatus(202))
      .catch(err => console.log(err));
  },
  reported: (req, res) => {
    pool
    .query(
      `UPDATE list_reviews
       SET reported = NOT reported
       WHERE id = ${req.params.review_id}`)
    .then(()=> res.sendStatu(202))
    .catch(err => console.log(err))
  }
};

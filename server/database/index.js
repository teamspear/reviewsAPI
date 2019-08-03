const { Pool } = require("pg");

const connectionString = "postgres://localhost:5432/sdc";
const pool = new Pool({
  connectionString: connectionString
});

module.exports = {
  listAll: (req, res) => {
    console.time()
    pool
      .query(
        `SELECT list_reviews.*, array_agg(review_photos.url) AS photos FROM list_reviews
       LEFT JOIN review_photos
       ON review_photos.review_id = list_reviews.id
       WHERE list_reviews.product_id = ${req.params.product_id} AND list_reviews.reported = false
       GROUP BY list_reviews.id;`)
      .then(results => {res.send(results.rows);console.timeEnd()})
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

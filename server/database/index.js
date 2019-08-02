const { Pool } = require("pg");

// const pool = new Pool({
//   user : 'postgres',
//   host : 'postgres',
//   database: "sdc",
//   password: 'supersecret',
//   port: 5321
// });

const connectionString = 'postgresql://localhost:5432/sdc'
const pool = new Pool({
  connectionString: connectionString,
})
module.exports = {
  listAll: (req, res) => {
    pool.query(
      `SELECT list_reviews.*, array_agg(review_photos.url) AS photos FROM list_reviews
       LEFT JOIN review_photos
       ON review_photos.review_id = list_reviews.id
       WHERE list_reviews.product_id = ${req.params.product_id} AND list_reviews.reported = false
       GROUP BY list_reviews.id;`,
      (err, results) => {
        if (err) {
          console.log(err);
        }
        res.send(results.rows);
        console.log(results.rows)
        // pool.end() when to use pool.end()?
      }
  )},
  meta : (req, res) => {
    pool.query(
      `SELECT rating, COUNT(rating) FROM list_reviews 
       WHERE product_id = ${req.params.product_id} 
       GROUP BY rating;`,
      (err, results) => {
        if (err) {
          console.log(err)
        }
        res.send(results.rows);
      }
    )},
  helpful : (req,res) => {
    pool.query(
      `UPDATE list_reviews
       SET helpfulness = helpfulness + 1
       WHERE id = ${req.params.review_id}`,
       (err, results) => {
         if (err) {
           console.log(err)
         }
         res.send('marked as helpful');
        }
    )},
  reported : (req,res) => {
    pool.query(
    `UPDATE list_reviews
       SET reported = NOT reported
       WHERE id = ${req.params.review_id}`,
    (err, results) => {
      if (err) {
        console.log(err)
      }
      res.send('reported')
    })
  }
};

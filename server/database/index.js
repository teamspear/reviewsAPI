const { Pool } = require("pg");

//change localhost to db container?
const connectionString = 'postgresql://postgres:5432/sdc'
const pool = new Pool({
  connectionString: connectionString,
})
module.exports = {
  listAll: (req, res) => {
    pool.query(
      `SELECT review_photos.*,list_reviews.* FROM list_reviews 
       LEFT JOIN review_photos on list_reviews.id = review_photos.review_id 
       WHERE list_reviews.product_id = ${req.params.product_id};`,
      (err, results) => {
        if (err) {
          console.log(err);
        }
        res.send(results.rows);
        console.log(results.rows);
        // pool.end() when to use pool.end()?
      }
  )},
  listPhotos : (req, res) => {
    pool.query(
      `SELECT * from review_photos where review_photos.review_id = ${req.params.review_id};`,
      (err, results) => {
        if (err) {
          console.log(err)
        }
        res.send(results.rows);
      }
    )
  }
};

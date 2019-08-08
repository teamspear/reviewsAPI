var redis = require('redis');
// bluebird.promisifyAll(redis.RedisClient.prototype);
// bluebird.promisifyAll(redis.Multi.prototype);
var client = redis.createClient();

const { Pool } = require("pg");

const pool = new Pool({
  host: 'localhost',
  user: 'tom',
  password:'password',
  database: 'postgres',
  port: 5432,
});


const listallFormat = (q,page) => {
  let results = [];
  for (let i = 0; i < q.length; i++) {
    let photos = [];
    if(q[i].photos[0] !== null) {
      q[i].photos.map((photo,index)=> {
        photos.push({id:index+1,url:photo})
      })
    }
    let result = {
      review_id : q[i].id,

      rating : q[i].rating === null ? 0 : q[i].rating,
      summary : q[i].summary,
      recommend : q[i].recommend === true ? 1 : 0,
      response : q[i].response,
      body : q[i].body,
      date : q[i].date,
      reviewer_name : q[i].reviewer_name,
      photos : photos
    }
    results.push(result);
  }
  let listAllObj = {
    product : q[0].product_id,
    page : page,
    count : 50,
    results : results
  }
  return listAllObj;
};

const metaFormat = (q,id) => {
  let ratings = {};
  q[0].rows.forEach(rating => {
    ratings[rating.rating] = rating.count
  })

  let recommended ={0:0,1:0};
  q[1].rows.forEach( record => {
    if (record['recommend'] === false) {
      recommended[0] = record['count']
    }
    if (record['recommend'] === true) {
      recommended[1] = record['count']
    }
  })
  
  let characteristics = {};
  q[2].rows.forEach(type => {
    characteristics[type['name']] = {
      id : type['characteristic_id'],
      value : type['value']
    }
  })

  
  let meta = {
    product_id : id,
    ratings : ratings ? 1 : ratings,
    recommended : recommended,
    characteristics : characteristics
  }
  return meta;
}

const reviewPhotos = (photos, id) => {
  for (let i = 0; i < photos.length; i++) {
    pool.query(`INSERT INTO review_photos (review_id,url) VALUES (${id},${photos[i]});`)
    .catch(err =>console.log(err))
  }
}

const characteristicReviews = (char, id) => {
  for (let key in char) {
    pool.query(`INSERT INTO characteristic_reviews (characteristic_id,review_id,value)
                VALUES (${key},${id},${char[key]});`)
                .catch(err=> console.log(err))
  }
}

module.exports = {
  all : (req,res) => {
    client.get('all'+req.params.product_id,(err, reply)=> {
      if(reply) {
        console.log(JSON.stringify(reply));
      }
    })
    let page = req.query.page || 0;
    let count = req.query.count || 5;
    let offset = page * count;
    let sort = req.query.sort || 'reviews.id';
    if (sort === 'newest') {
      sort = 'reviews.date DESC';
    } else if (sort === 'helpful') {
      sort = 'reviews.helpfulness DESC'
    } else if (sort === 'relevant') {
      sort = 'reviews.helpfulness DESC, reviews.date DESC'
    }
    pool.query(`SELECT * from reviews
                WHERE product_id = ${req.params.product_id}
                ORDER BY ${sort}
                LIMIT ${count}
                OFFSET ${offset};`)
                .then(results => {
                  client.set('all'+req.params.product_id, 'listallFormat(results.rows,page)', 'EX', 60);
                  res.send(listallFormat(results.rows,page))})
                .catch(err=>console.log(err));
  },
  listAll: (req, res) => {
    let page = req.query.page || 0;
    let count = req.query.count || 5;
    let offset = page * count;
    let sort = req.query.sort || 'list_reviews.id';
    if (sort === 'newest') {
      sort = 'list_reviews.date DESC';
    } else if (sort === 'helpful') {
      sort = 'list_reviews.helpfulness DESC'
    } else if (sort === 'relevant') {
      sort = 'list_reviews.helpfulness DESC, list_reviews.date DESC'
    }
    pool
      .query(
        `SELECT list_reviews.*, array_agg(review_photos.url) AS photos FROM list_reviews
       LEFT JOIN review_photos
       ON review_photos.review_id = list_reviews.id
       WHERE list_reviews.product_id = ${req.params.product_id} AND list_reviews.reported = false
       GROUP BY list_reviews.id
       ORDER BY ${sort}
       LIMIT ${count}
       OFFSET ${offset};`)
      .then(results => {res.send(listallFormat(results.rows,page))})
      .catch(err=> {console.log(err); res.sendStatus(500)});
  },
  meta: (req, res) => {;
    Promise.all([
    pool
      .query(
        `SELECT rating, COUNT(rating) FROM list_reviews 
       WHERE product_id = $1 
       GROUP BY rating;`
      ,[req.params.product_id]),
    pool.query(
      `SELECT recommend, COUNT(recommend) FROM list_reviews WHERE product_id = $1 GROUP BY recommend`,[req.params.product_id]),
    pool.query(
      `Select characteristics.name, characteristic_reviews.characteristic_id, AVG(characteristic_reviews.value) AS value 
       FROM characteristic_reviews
       LEFT JOIN characteristics
       ON characteristics.id = characteristic_reviews.characteristic_id
       WHERE characteristic_id IN (SELECT id from characteristics where product_id = $1) 
       GROUP BY characteristic_reviews.characteristic_id, characteristics.name;`,[req.params.product_id]
    )
    ]).then(results => {res.send(metaFormat(results,req.params.product_id));})
  },
  helpful: (req, res) => {
    pool
      .query(
        `UPDATE list_reviews
       SET helpfulness = helpfulness + 1
       WHERE id = $1`,[req.params.review_id]
      )
      .then(() => res.sendStatus(204))
      .catch(err=> {console.log(err); res.sendStatus(500)});
  },
  reported: (req, res) => {
    pool
    .query(
      `UPDATE list_reviews
       SET reported = NOT reported
       WHERE id = $1`,[req.params.review_id])
    .then(()=> res.sendStatus(204))
    .catch(err=> {console.log(err); res.sendStatus(500)})
  },
  addReview: (req,res) => {;
    let reviewIdx ='';
    let product_id = req.params.product_id;
    const queryLR = {
      text :`INSERT INTO list_reviews (product_id,rating,summary,body,recommend,reviewer_name,reviewer_email) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      values: [product_id, req.body.rating, req.body.summary, req.body.body, req.body.recommend, req.body.name, req.body.email]
    }
    pool.query(queryLR)
    .then(result => reviewIdx = result.rows[0].id)
    .then(()=> reviewPhotos(req.body.photos,reviewIdx))
    .then(()=> characteristicReviews(req.body.characteristics,reviewIdx))
    .then(()=>res.sendStatus(201))
    .catch(err=> {console.log(err); res.sendStatus(500)})
  }
};
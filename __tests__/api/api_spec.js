const frisby = require('frisby');
const Joi = frisby.Joi;

it('should be a teapot', function () {
  return frisby.get('http://httpbin.org/status/418')
    .expect('status', 418);
});

it('should return 200 GET reviews', ()=> {
  return frisby.get('http://54.198.238.132/reviews/1/list')
    .expect('status', 200);
});

it('should return 200 GET meta', ()=> {
  return frisby.get('http://54.198.238.132/reviews/1/meta')
    .expect('status',200);
});

it('should return 204 PUT helpful', ()=> {
  return frisby.put('http://54.198.238.132/reviews/helpful/1')
    .expect('status',204);
});

it('should return 204 PUT report', ()=> {
  return frisby.put('http://54.198.238.132/reviews/report/1')
    .expect('status',204);
});

it('should return 500 list when product_id not present', ()=> {
  return frisby.get('http://54.198.238.132/reviews/11/list')
    .expect('status',500);
});

it('should return something', ()=> {
  return frisby.get('http://54.198.238.132/reviews/1/list')
  .expect('json', '*', {
   results:1
  })
})

import express from 'express';
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/hello", test);


function test (req, res, next){
  const response = {
    message: "Hello there!"
  }
  res.json(response)
}

export default router;
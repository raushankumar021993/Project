var express = require('express');
var router = express.Router();
var csrf = require('csurf');
var csrfProtection = csrf();
router.use(csrfProtection);
var elasticsearch = require('elasticsearch');
var Product = require('../models/product');


/* For Redis : Start*/
var mongooseRedisCache = require("mongoose-redis-cache");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var redisSchema = new Schema({

    _id: {type : String,required:true},
    imgPath : {type : String,required:true},
    model:{type : String,required:true},
    kms : {type : String,required:true},
    price :{type : String,required:true}
});
module.exports = mongoose.model("RadisProduct",redisSchema);
/* For Redis : End*/


// redis
//var redis = require('redis');
//var redisclient = redis.createClient(6379,'radish.ahwqek.ng.0001.use1.cache.amazonaws.com');

/*redisclient.auth('password', function (err) {
    if (err) throw err;
});*/
/*
redisclient.on('connect', function() {
    console.log('Connected to Redis');
});
*/

// redis
/*var client = new elasticsearch.Client( {
    hosts: 'localhost:9200'
});*/

   var client = new elasticsearch.Client({
        accessKeyId: 'AKIAJW3PGOZPG4F5HYSA',
        secretAccessKey: '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',
        service: 'es',
        region: 'US East (N. Virginia)',
        host: 'search-bigdata-hcq6bnbgrsciuk2ea5tp2akrla.us-east-1.es.amazonaws.com'
    });
client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 100000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});

router.get('/user/signup',function(req,res,next){
    res.render('user/signup',{csrfToken:req.csrfToken()})
});

router.post('/user/signup', function(req, res, next) {
 res.redirect('/');
});

/*
console.log("1");
redisclient.hset("key","_id","1","imgPath","http://www.gaadicdn.com/usedcar_image/original/usedcar_20171020_171030_1383575_1509093858.jpg","model","Volkswagen Vento2010-2013PetrolTrendline","kms","75,070","price","$6000");
console.log("2");
redisclient.hgetall("key", function (err, result) {
    console.log("3");
    var c1 = [];

    c1.push(result);
    console.log(c1);
});
*/



router.get('/', function(req, res, next) {
  Product.find(function(err,docs){
    var productChunks = [];
    var chunkSize = 3;
    for(var i=0;i<docs.length;i+=chunkSize){
      productChunks.push(docs.slice(i,i+chunkSize));
    }
    //console.log(productChunks);
      res.render('shop/index', { title: 'CarDekho',products:productChunks});

  })
  });

/* ES Changes */
//^search?q=:query
router.get('/search',function(req,response,next){
    var pageNum = 1;
    var perPage = 6;
    console.log("Hello there");
    var userQuery = req.query['query'];
    console.log(userQuery);
    var searchParams = {
        index: 'bigdatacars',
        from: (pageNum - 1) * perPage,
        size: perPage,
        type: 'cars',
        body: {
            query: {
                multi_match: {
               //match: { "model": userQuery }
                    fields:  ["model","kms"],
                    query:     userQuery,
                    fuzziness: "AUTO"
                }
            }
        }
};


    client.search(searchParams, function (err, res) {
        if (err) {
            // handle error
            throw err;
        }
        //console.log(res);
       var results = res.hits.hits.map(function(i){
            return i['_source'];
        });
      //  console.log("****" +results);
        var productChunks = [];
        var chunkSize = 3;
        for(var i = 0;i<results.length;i+=chunkSize){
            productChunks.push(results.slice(i,i+chunkSize));
            //console.log(productChunks);
            //console.log("reached productchunks")
        }

        response.render('shop/index', {title: 'CarDekho',
            products: productChunks
        });
    });
});

/*router.get('/loadProduct', function (req, res) {
    console.log("Calling MongoDB to load product Details!");
    var productId = req.query._id;
    console.log(productId)

    Product.find({_id: productId}, function(err, products) {
        console.log("Connect to MongoDB");
        console.log("productName from MongoDb"+products);
        res.render('shop/product',{title: 'Best Stores',products : products});
    });
});*/

router.get('/loadProduct', function (req, res) {
    console.log("Calling MongoDB to load product Details!");
    var productId = req.query._id;
    console.log(productId)
    Product.find({_id: productId}, function(err, product) {
        console.log("Connect to MongoDB");
        console.log("productName from MongoDb"+product);
        res.render('shop/product', {title: 'Shopping Cart', products: product});
    });
});


/* For Redish : Start*/
/*
redisclient.set("Petrol",{
'fuel':'Petrol',
    'transm':'Manual',
    'model':'Volkswagen Vento2010-2013PetrolTrendline',
    'imgPath':'http://www.gaadicdn.com/usedcar_image/original/usedcar_20171020_171030_1383575_1509093858.jpg',
    'kms':'75,070',
    'price':'$6000'
},redisclient.print);
redisclient.get("Petrol", function (err, result) {
    var c1 = [];
    c1.push(result);
    console.log(result);

});
*/
module.exports = router;

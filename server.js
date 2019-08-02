'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
 var dns = require('dns');

var cors = require('cors');

var app = express();


mongoose.connect(process.env.MONGO_URI, function(err) {
  if (err) { 
    console.log(err);
    } else {
    console.log("connected to db!")
  }
});

var Schema = mongoose.Schema;

var urlSchema = new Schema({
  url: {type: String, default: ""},
  index: {type: Number, default: 0}
});

var Url = mongoose.model('Url', urlSchema);

// Basic Configuration 
var port = process.env.PORT || 3000;


app.use(cors());


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  

app.use(bodyParser.urlencoded({ extended: false}));


app.post("/api/shorturl/new", function (req, res) {
  
  //let trimHttp = req.body.url;
  let trimHttp = req.body.url.replace(/https*:\/\//i,"");
  trimHttp = trimHttp.replace(/\/$/,"");
  
  console.log("trimHttp: " + trimHttp);
  
  var validUrl = dns.lookup(trimHttp, function (err, addresses, family) {
    if (err){
      console.log("Invalid URL");
      res.json({"Error": "Invalid URL"});
    } else {
      console.log("Valid URL");
      
      Url.find(function(err, data){
        if(err){
          console.log("error: "+ err);
        }else{
          let count = data.length;
          let url = new Url({url: req.body.url, index: count});  
          console.log(count);
      
          url.save( function (err, data) {
            if (err) {
              console.log("got error:" + err);
            }else{
              console.log("data here: " + data);
            }
          });
  
          res.json({"Shortened URL": count});
       } 
      });
      
    }
  });
  
console.log(validUrl);
  
});


//Testing retrieval from database
app.get("/getdata", function(req, res){
  
  Url.find(function(err, data){
    if(err){
      res.json({error: err});
    }else{
      let count = data.length;
      res.json({count: count, data: data});
    }
  });
});


app.get("/api/shorturl/:url", function(req, res){
  let shortUrl = parseInt(req.params.url);
  console.log(shortUrl);
  
  Url.findOne({index: shortUrl}, function(err, data){
    if(err){
      console.log(err);
    } else {
      res.redirect(data.url); 
    }                                                             
  });
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});

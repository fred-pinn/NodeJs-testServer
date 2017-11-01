// server.js 
//import * as express from './node_modules/express/lib/express'
import * as express from "express";
import * as bodyParser from "body-parser";
import * as fs from "fs";
import * as mkdirp from "mkdirp";
import View from "./View";
import Action from "./Action";
import HtmlRender from "./HtmlRender";
/* THe following import is for testing only */
import * as morgan from "morgan";
import * as ObjectAssign from "object-assign";
import * as mongodb from "mongodb";

Object.assign = ObjectAssign;
let mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL;
let mongoURLLabel = "";
if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
  let mongoServiceName:string = process.env.DATABASE_SERVICE_NAME.toUpperCase();
  let mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'],
      mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'],
      mongoDatabase = process.env[mongoServiceName + '_DATABASE'],
      mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
  let mongoUser:string = process.env[mongoServiceName + '_USER'];

  if (mongoHost && mongoPort && mongoDatabase) {
    mongoURLLabel = mongoURL = 'mongodb://';
    if (mongoUser && mongoPassword) {
      mongoURL += mongoUser + ':' + mongoPassword + '@';
    }
    // Provide UI label that excludes user id and pw
    mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    mongoURL += mongoHost + ':' +  mongoPort + '/' + mongoDatabase;

  }
}

class DbDetails {
  databaseName:string;
  url:string;
  type:string;
}

var db:mongodb.Db= null,
dbDetails = new DbDetails();
let initDb:Function = function(callback) {

  if (mongoURL == null) return;

  if (mongodb == null) return;

  mongodb.connect(mongoURL, function(err, conn:mongodb.Db) {
    if (err) {
      callback(err);
      return;
    }

    db = conn;
    dbDetails.databaseName = db.databaseName;
    dbDetails.url = mongoURLLabel;
    dbDetails.type = 'MongoDB';

    console.log('Connected to MongoDB at: %s', mongoURL);
  });
};



let pendingActions:Array<Action> = [];



//import ExampleResource from 'example-resource'
let noPadding:boolean = false;
let htmlRender = new HtmlRender();
let app = express();
let urlEncodedParser = bodyParser.urlencoded ( { limit: '100mb', extended: false } );
var port:number = parseInt((process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || '8181'));
var hostName:string   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || process.env.COMPUTERNAME + "." + process.env.USERDNSDOMAIN || '0.0.0.0';
//let mkdirp = require(mkdirp);

mkdirp("./Public/Images/", function(err){
  fs.copyFileSync("./android.js", "./Public/android.js");
  fs.copyFileSync("./android.css", "./Public/android.css");
  app.use(bodyParser.json({limit:'55mb'}));
  
  app.post("/activity", urlEncodedParser, function (req, res) {
    console.log("Activity");
    let data = req.body.data;
    //console.log("data: " + data);
    let dataJson:View = JSON.parse(data);
    let dump = JSON.stringify(dataJson, null, 4);
  
  
  //  console.log("Dump:\n" +dump);
   // let fs = require("fs");
  
  
  
     let html = htmlRender.createDocument(dataJson);
  
   
  
    fs.writeFile("./Public/Activity.html" , html, "utf8" , function(err) {
      if (err != null) {
        console.error("Could not write Activity.html file: " + err);
      }
    });
  
    fs.writeFile("./Public/Activity.json" , dump, "utf8" , function(err) {
      if (err != null) {
        console.error("Could not write Activity.json file: " + err);
      }
    });
  
    let arrayOfViewNames:Array<string> = htmlRender.getNeededComponents(dataJson, null);
  
    let newJson = {"status": "OK", "needViews":arrayOfViewNames}
  
  
    res.end(JSON.stringify( newJson ));
    
  });

  /* Begin - from original */
  app.get('/', function (req, res) {
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!db) {
      initDb(function(err){});
    }
    if (db) {
      var col = db.collection('counts');
      // Create a document with request IP and current time of request
      col.insert({ip: req.ip, date: Date.now()});
      col.count(function(err, count){
        res.render('index.html', { pageCountMessage : count, dbInfo: dbDetails });
      });
    } else {
      res.render('index.html', { pageCountMessage : null});
    }
  });

  app.get('/pagecount', function (req, res) {
    // try to initialize the db on every request if it's not already
    // initialized.
    if (!db) {
      initDb(function(err){});
    }
    if (db) {
      db.collection('counts').count(function(err, count ){
        res.send('{ pageCount: ' + count + '}');
      });
    } else {
      res.send('{ pageCount: -1 }');
    }
  });
  // error handling
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500).send('Something bad happened!');
});

initDb(function(err){
  console.log('Error connecting to Mongo. Message:\n'+err);
});
  /* End - from original */
  
  app.get("/clickView", function (req, res) {
    //let val:string = req.param("id");
    let val:string = req.query.id;
    console.log("clickView action"+val);;
    let viewName:string = val;
    let action:Action = new Action("clickView", viewName);
    pendingActions.push(action);
    console.log("Added the action");
    res.end("");
  });
  
  app.get("/keepAlive", function (req, res) {
    let jsonReturn:string = JSON.stringify( {"status": "OK", "actions": pendingActions});
    pendingActions = [];
    res.end(jsonReturn);
    });
  
  
  app.get("/deleteAllImages", function (req, res) {
    console.log("delete All Images");
    let path = "./Public/Images/";
    fs.readdir(path, function(err, items) {
      for (var i=0; i<items.length; i++) {
          var file = path + items[i];
          console.log("Delete: " + file);
          fs.unlink(file, function(err) {
            console.error("ERROR: Deleting file, " + err);
          });
      }
    });
    
    
      res.end(JSON.stringify( {"status":"OK"} ));
      
    });
  
  app.post("/viewImage", urlEncodedParser, function (req, res) {
    console.log("app.post");
  
    let data = req.body.data;
  
    //console.log("data: " + data);
    let dataJson = JSON.parse(data);
    let base64Image:string = dataJson.base64Image;
    let crc:string = dataJson.crc.toString(16);
    let imageFileName:string = "./Public/Images/" + dataJson.name + "." + crc + ".PNG";
    console.log("Image file: "+imageFileName);
  
   // let fs = require("fs");
    
    fs.writeFile(imageFileName, base64Image, 'base64', function(err) {
      console.error("ERROR: Writing PNG File: " + err);
    });
  
  
    res.end(JSON.stringify( {"status":"OK"} ));
    
  });
  
  app.get("/viewImage", function (req, res) {
  console.log("viewImage");
  
    res.end(JSON.stringify( {"status":"OK"} ));
    
  });
  
  let server = app.listen(port, hostName, function(){
    let host = server.address().address;
    let port = server.address().port;
  
    console.info(`==> Listening: ` + host + ":" + port);
  
  });
  
  app.use(express.static("Public"));
});


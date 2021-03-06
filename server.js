"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server.js 
//import * as express from './node_modules/express/lib/express'
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const mkdirp = require("mkdirp");
const Action_1 = require("./Action");
const HtmlRender_1 = require("./HtmlRender");
const ejs = require("ejs");
const ObjectAssign = require("object-assign");
const mongodb = require("mongodb");
const copyFile = require("fs-copy-file");
let server = null;
let myDirectory = process.cwd();
console.log("My directory is: " + myDirectory);
console.log("SERVER started");
console.log("NOTICE: Version: " + process.version);
Object.assign = ObjectAssign;
let mongoURL = process.env.OPENSHIFT_MONGODB_DB_URL || process.env.MONGO_URL;
let mongoURLLabel = "";
if (mongoURL == null && process.env.DATABASE_SERVICE_NAME) {
    let mongoServiceName = process.env.DATABASE_SERVICE_NAME.toUpperCase();
    let mongoHost = process.env[mongoServiceName + '_SERVICE_HOST'], mongoPort = process.env[mongoServiceName + '_SERVICE_PORT'], mongoDatabase = process.env[mongoServiceName + '_DATABASE'], mongoPassword = process.env[mongoServiceName + '_PASSWORD'];
    let mongoUser = process.env[mongoServiceName + '_USER'];
    if (mongoHost && mongoPort && mongoDatabase) {
        mongoURLLabel = mongoURL = 'mongodb://';
        if (mongoUser && mongoPassword) {
            mongoURL += mongoUser + ':' + mongoPassword + '@';
        }
        // Provide UI label that excludes user id and pw
        mongoURLLabel += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
        mongoURL += mongoHost + ':' + mongoPort + '/' + mongoDatabase;
    }
}
class DbDetails {
}
var db = null, dbDetails = new DbDetails();
let initDb = function (callback) {
    if (mongoURL == null) {
        console.log("WARNING: No mongoURL defined");
        return;
    }
    if (mongodb == null) {
        console.log("WARNING: No mongodb defined");
        return;
    }
    mongodb.connect(mongoURL, function (error, result) {
        if (error) {
            console.log("ERROR: " + error.message);
            //    console.error("ERROR: Cannot connect to Mongo: "+err);
            callback(error);
            return;
        }
        db = result;
        dbDetails.databaseName = result.databaseName;
        dbDetails.url = mongoURLLabel;
        dbDetails.type = 'MongoDB';
        console.log('Connected to MongoDB at: %s', mongoURL);
    });
};
let pendingActions = new Array();
var env;
var envs = process.env;
for (env in envs) {
    console.log("ENV: " + env + ": " + envs[env]);
}
//import ExampleResource from 'example-resource'
let noPadding = false;
let htmlRender = new HtmlRender_1.default();
let app = express();
let urlEncodedParser = bodyParser.urlencoded({ limit: '100mb', extended: false });
var port = parseInt((process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || envs["NODEJS_TESTSERVER_SERVICE_PORT"] || '8181'));
let hostNameForWindows = (process.env.COMPUTERNAME && process.env.USERDNSDOMAIN) ? (process.env.COMPUTERNAME + "." + process.env.USERDNSDOMAIN) : null;
var hostName = process.env.IP
    || process.env.OPENSHIFT_NODEJS_IP
    || envs["NODEJS_TESTSERVER_SERVICE_HOST"]
    || hostNameForWindows
    || '0.0.0.0';
/* Dump the environmental values */
var env;
var envs = process.env;
//let mkdirp = require(mkdirp);
mkdirp(myDirectory + "/Public/Images/", function (err) {
    let filesys = fs;
    copyFile(myDirectory + "/index.html", myDirectory + "/Public/index.html", function (err) {
        if (err) {
            console.error("ERROR: could not open file");
        }
        else {
            console.log("NOTICE: copied: " + myDirectory + "/Public/index.html");
        }
    });
    copyFile(myDirectory + "/android.js", myDirectory + "/Public/android.js", function (err) {
        if (err) {
            console.error("ERROR: could not open file");
        }
    });
    copyFile("./android.css", "./Public/android.css", function (err) {
        if (err) {
            console.error("ERROR: could not open file");
        }
    });
    app.engine('html', ejs.renderFile);
    app.set("views", myDirectory);
    app.set("view engine", "html");
    app.use(bodyParser.json({ limit: '55mb' }));
    /**
     * healthz - health check
     */
    app.get('/healthz', function (req, res, next) {
        // check my health
        // -> return next(new Error('DB is unreachable'))
        console.log(".");
        res.sendStatus(200);
    });
    app.post("/activity", urlEncodedParser, function (req, res) {
        console.log("Activity");
        let data = req.body.data;
        //console.log("data: " + data);
        let dataJson = JSON.parse(data);
        let dump = JSON.stringify(dataJson, null, 4);
        //  console.log("Dump:\n" +dump);
        // let fs = require("fs");
        let html = htmlRender.createDocument(dataJson);
        filesys.writeFile("./Public/Activity.html", html, "utf8", function (err) {
            if (err != null) {
                console.error("Could not write Activity.html file: " + err);
            }
        });
        filesys.writeFile("./Public/Activity.json", dump, "utf8", function (err) {
            if (err != null) {
                console.error("Could not write Activity.json file: " + err);
            }
        });
        let arrayOfViewNames = htmlRender.getNeededComponents(dataJson, null);
        let newJson = { "status": "OK", "needViews": arrayOfViewNames };
        res.end(JSON.stringify(newJson));
    });
    /* Begin - from original */
    app.get('/', function (req, res) {
        // try to initialize the db on every request if it's not already
        // initialized.
        console.log("app.get shlash");
        if (!db) {
            initDb(function (err) { });
        }
        if (db) {
            var col = db.collection('counts');
            // Create a document with request IP and current time of request
            col.insert({ ip: req.ip, date: Date.now() });
            col.count(function (err, count) {
                res.render('index.html', { pageCountMessage: count, dbInfo: dbDetails });
            });
        }
        else {
            try {
                let _dbinfo = new DbDetails();
                _dbinfo.databaseName = "foo";
                _dbinfo.url = "http://what.the.heck.com/";
                _dbinfo.type = "foobar";
                res.render('index.html', { pageCountMessage: 1234, dbInfo: _dbinfo }, function (err, html) {
                    if (err)
                        console.log("err: " + err);
                    if (html) {
                        res.send(html);
                    }
                });
                console.log("render the html successful");
            }
            catch (e) {
                console.log("render the html FAILED, reason: " + e);
                res.sendFile(myDirectory + '/index.html');
            }
        }
    });
    app.get('/pagecount', function (req, res) {
        // try to initialize the db on every request if it's not already
        // initialized.
        if (!db) {
            initDb(function (err) { });
        }
        if (db) {
            db.collection('counts').count(function (err, count) {
                res.send('{ pageCount: ' + count + '}');
            });
        }
        else {
            res.send('{ pageCount: -1 }');
        }
    });
    // error handling
    app.use(function (err, req, res, next) {
        console.error(err.stack);
        res.status(500).send('Something bad happened!');
    });
    initDb(function (err) {
        console.log('Error connecting to Mongo. Message:\n' + err);
    });
    /* End - from original */
    app.get("/clickView", function (req, res) {
        //let val:string = req.param("id");
        let val = req.query.id;
        console.log("clickView action" + val);
        ;
        let viewName = val;
        let action = new Action_1.default("clickView", viewName);
        pendingActions.push(action);
        console.log("Added the action");
        res.end("");
    });
    app.get("/keepAlive", function (req, res) {
        let jsonReturn = JSON.stringify({ "status": "OK", "actions": pendingActions });
        pendingActions = [];
        res.end(jsonReturn);
    });
    app.get("/deleteAllImages", function (req, res) {
        console.log("delete All Images");
        let path = "./Public/Images/";
        fs.readdir(path, function (err, items) {
            for (var i = 0; i < items.length; i++) {
                var file = path + items[i];
                console.log("Delete: " + file);
                fs.unlink(file, function (err) {
                    console.error("ERROR: Deleting file, " + err);
                });
            }
        });
        res.end(JSON.stringify({ "status": "OK" }));
    });
    app.post("/viewImage", urlEncodedParser, function (req, res) {
        console.log("app.post");
        let data = req.body.data;
        //console.log("data: " + data);
        let dataJson = JSON.parse(data);
        let base64Image = dataJson.base64Image;
        let crc = dataJson.crc.toString(16);
        let imageFileName = "./Public/Images/" + dataJson.name + "." + crc + ".PNG";
        console.log("Image file: " + imageFileName);
        // let fs = require("fs");
        fs.writeFile(imageFileName, base64Image, 'base64', function (err) {
            console.error("ERROR: Writing PNG File: " + err);
        });
        res.end(JSON.stringify({ "status": "OK" }));
    });
    app.get("/viewImage", function (req, res) {
        console.log("viewImage");
        res.end(JSON.stringify({ "status": "OK" }));
    });
    console.log("host: " + hostName);
    console.log("port: " + port);
    //NODEJS_TESTSERVER_PORT
    console.log("NODEJS_TESTSERVER_SERVICE_PORT: " + envs["NODEJS_TESTSERVER_SERVICE_PORT"]);
    console.log("NODEJS_TESTSERVER_SERVICE_HOST: " + envs["NODEJS_TESTSERVER_SERVICE_HOST"]);
    try {
        server = app.listen(port, hostName, function (err) {
            let host = server.address().address;
            let port = server.address().port;
            console.info(`==> Listening: ` + host + ":" + port);
        });
    }
    catch (ee) {
        console.error("FATAL: Could not listen on: " + hostName + ":" + port + ", Reason" + ee, ee);
        process.exit(0);
    }
    // app.set('view-engine', 'html');
    app.use(express.static(myDirectory + "/Public"));
});
process.on('SIGUSR1', () => {
    console.log("SIGUSR1 Signal");
    if (server) {
        server.close(function () {
            console.log("SIGUSR1: closed server");
            server = null;
            process.exit(0);
        });
    }
    else {
        process.exit(0);
    }
    //   .then() => Promise.all([
    //     console.log("Disconnecting");
    //   ])
    //  .then(() => process.exit(0))
    // .catch((err) => process.exit(-1))
});
process.on('SIGTERM', () => {
    console.log("SIGTERM Signal");
    if (server) {
        server.close(function () {
            console.log("SIGTERM: closed server");
            server = null;
            process.exit(0);
        });
    }
    else {
        process.exit(0);
    }
    //   .then() => Promise.all([
    //     console.log("Disconnecting");
    //   ])
    //  .then(() => process.exit(0))
    // .catch((err) => process.exit(-1))
});
//# sourceMappingURL=server.js.map
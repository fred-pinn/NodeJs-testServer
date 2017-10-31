"use strict";
exports.__esModule = true;
// server.js 
//import * as express from './node_modules/express/lib/express'
var express = require("express");
var bodyParser = require("body-parser");
var fs = require("fs");
var mkdirp = require("mkdirp");
var Action_1 = require("./Action");
var HtmlRender_1 = require("./HtmlRender");
var pendingActions = [];
//import ExampleResource from 'example-resource'
var noPadding = false;
var htmlRender = new HtmlRender_1["default"]();
var app = express();
var urlEncodedParser = bodyParser.urlencoded({ limit: '100mb', extended: false });
//let mkdirp = require(mkdirp);
mkdirp("./Public/Images/", function (err) {
    fs.copyFileSync("./android.js", "./Public/android.js");
    fs.copyFileSync("./android.css", "./Public/android.css");
    app.use(bodyParser.json({ limit: '55mb' }));
    app.post("/activity", urlEncodedParser, function (req, res) {
        console.log("Activity");
        var data = req.body.data;
        //console.log("data: " + data);
        var dataJson = JSON.parse(data);
        var dump = JSON.stringify(dataJson, null, 4);
        //  console.log("Dump:\n" +dump);
        // let fs = require("fs");
        var html = htmlRender.createDocument(dataJson);
        fs.writeFile("./Public/Activity.html", html, "utf8", function (err) {
            if (err != null) {
                console.error("Could not write Activity.html file: " + err);
            }
        });
        fs.writeFile("./Public/Activity.json", dump, "utf8", function (err) {
            if (err != null) {
                console.error("Could not write Activity.json file: " + err);
            }
        });
        var arrayOfViewNames = htmlRender.getNeededComponents(dataJson, null);
        var newJson = { "status": "OK", "needViews": arrayOfViewNames };
        res.end(JSON.stringify(newJson));
    });
    app.get("/clickView", function (req, res) {
        //let val:string = req.param("id");
        var val = req.query.id;
        console.log("clickView action" + val);
        ;
        var viewName = val;
        var action = new Action_1["default"]("clickView", viewName);
        pendingActions.push(action);
        console.log("Added the action");
        res.end("");
    });
    app.get("/keepAlive", function (req, res) {
        var jsonReturn = JSON.stringify({ "status": "OK", "actions": pendingActions });
        pendingActions = [];
        res.end(jsonReturn);
    });
    app.get("/deleteAllImages", function (req, res) {
        console.log("delete All Images");
        var path = "./Public/Images/";
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
        var data = req.body.data;
        //console.log("data: " + data);
        var dataJson = JSON.parse(data);
        var base64Image = dataJson.base64Image;
        var crc = dataJson.crc.toString(16);
        var imageFileName = "./Public/Images/" + dataJson.name + "." + crc + ".PNG";
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
    var server = app.listen(8181, "android.touchcommerce.com", function () {
        var host = server.address().address;
        var port = server.address().port;
        console.info("==> Listening: " + host + ":" + port);
    });
    app.use(express.static("Public"));
});

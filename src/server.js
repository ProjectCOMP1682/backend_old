import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import connectDB from "./config/connectDB";
import initwebRoutes from "./route/web";
import http from "http";
require('dotenv').config();


let app = express();

app.use(bodyParser.json({ limit: '50mb' }))
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))

viewEngine(app);
initwebRoutes(app);
const server = http.createServer(app);

connectDB();

let port = process.env.PORT || 6969;

server.listen(port, () => {
    console.log("Backend Nodejs is running on the port : " + port)
});
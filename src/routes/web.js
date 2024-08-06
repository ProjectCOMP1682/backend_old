import express from "express";


import middlewareControllers from '../middlewares/jwtVerify'
let router = express.Router();

let initWebRoutes = (app) => {

  

    return app.use("/", router);
}

module.exports = initWebRoutes;
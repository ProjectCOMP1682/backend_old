import express from "express";
import homeController from "../controllers/homeController"
import userController from "../controllers/userController"
let router = express.Router();

let initwebRoutes = (app) => {
    //=====================API USER==========================//
    router.post('/api/login', userController.handleLogin);
    return app.use("/", router);
}
module.exports = initwebRoutes;
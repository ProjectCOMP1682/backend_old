import express from "express";
import userController from "../controllers/userController"
import middlewareControllers from '../middlewares/jwtVerify';
let router = express.Router();

let initwebRoutes = (app) => {
    router.get("/", (req, res) => {
        return res.send("hello")
    })
    //=====================API USER==========================//
    router.post('/api/login', userController.handleLogin)
    router.post('/api/create-new-user', userController.handleCreateNewUser)
    return app.use("/", router);
}
module.exports = initwebRoutes;
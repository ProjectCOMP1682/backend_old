import express from "express";
import userController from "../controllers/userController"
import allcodeController from '../controllers/allcodeController';
import productController from '../controllers/productController';
import middlewareControllers from '../middlewares/jwtVerify';
let router = express.Router();

let initwebRoutes = (app) => {
    router.get("/", (req, res) => {
        return res.send("hello")
    })
    //=====================API USER==========================//
    router.post('/api/login', userController.handleLogin)
    router.post('/api/create-new-user', userController.handleCreateNewUser)
    router.put('/api/update-user', middlewareControllers.verifyTokenUser, userController.handleUpdateUser)
    router.delete('/api/delete-user', middlewareControllers.verifyTokenAdmin, userController.handleDeleteUser)
    router.post('/api/changepassword', middlewareControllers.verifyTokenUser, userController.handleChangePassword)
    router.get('/api/get-all-user', middlewareControllers.verifyTokenAdmin, userController.getAllUser)
    router.get('/api/get-detail-user-by-id', userController.getDetailUserById)
    router.post('/api/send-verify-email', middlewareControllers.verifyTokenUser, userController.handleSendVerifyEmailUser)
    router.post('/api/verify-email', middlewareControllers.verifyTokenUser, userController.handleVerifyEmailUser)
    router.post('/api/send-forgotpassword-email', userController.handleSendEmailForgotPassword)
    router.post('/api/forgotpassword-email', userController.handleForgotPassword)
    router.get('/api/check-phonenumber-email', userController.checkPhonenumberEmail)
    //===================API ALLCODE========================//
    router.post('/api/create-new-all-code', middlewareControllers.verifyTokenAdmin, allcodeController.handleCreateNewAllCode)
    router.put('/api/update-all-code', middlewareControllers.verifyTokenAdmin, allcodeController.handleUpdateAllCode)
    router.delete('/api/delete-all-code', middlewareControllers.verifyTokenAdmin, allcodeController.handleDeleteAllCode)
    router.get('/api/get-all-code', allcodeController.getAllCodeService)
    router.get('/api/get-list-allcode', allcodeController.getListAllCodeService)
    router.get('/api/get-detail-all-code-by-id', allcodeController.getDetailAllCodeById)
    router.get('/api/get-all-category-blog', allcodeController.getAllCategoryBlog)
    //==================API PRODUCT=========================//
    router.post('/api/create-new-product', middlewareControllers.verifyTokenAdmin, productController.createNewProduct)
    router.get('/api/get-all-product-admin', middlewareControllers.verifyTokenAdmin, productController.getAllProductAdmin)
    router.get('/api/get-all-product-user', productController.getAllProductUser)



    return app.use("/", router);
}
module.exports = initwebRoutes;
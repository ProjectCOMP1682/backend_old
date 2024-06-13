import orderService from '../services/orderService';
let createNewOrder = async (req, res) => {
    try {
        let data = await orderService.createNewOrder(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let getAllOrders = async (req, res) => {
    try {
        let data = await orderService.getAllOrders(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let getDetailOrderById = async (req, res) => {
    try {
        let data = await orderService.getDetailOrderById(req.query.id);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let updateStatusOrder = async (req, res) => {
    try {
        let data = await orderService.updateStatusOrder(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let getAllOrdersByUser = async (req, res) => {
    try {
        let data = await orderService.getAllOrdersByUser(req.query.userId);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let getAllOrdersByShipper = async (req, res) => {
    try {
        let data = await orderService.getAllOrdersByShipper(req.query);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let paymentOrder = async (req, res) => {
    try {
        let data = await orderService.paymentOrder(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
let paymentOrderSuccess = async (req, res) => {
    try {
        let data = await orderService.paymentOrderSuccess(req.body);
        return res.status(200).json(data);
    } catch (error) {
        console.log(error)
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}
module.exports = {
    createNewOrder: createNewOrder,
    getAllOrders: getAllOrders,
    getDetailOrderById: getDetailOrderById,
    updateStatusOrder: updateStatusOrder,
    getAllOrdersByUser: getAllOrdersByUser,
    getAllOrdersByShipper: getAllOrdersByShipper,
    paymentOrder: paymentOrder,
    paymentOrderSuccess: paymentOrderSuccess,

}
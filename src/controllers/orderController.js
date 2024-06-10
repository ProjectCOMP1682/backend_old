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
module.exports = {
    createNewOrder: createNewOrder,
}
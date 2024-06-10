import db from "../models/index";
require('dotenv').config()
let createNewOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.addressUserId || !data.typeShipId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {

                let product = await db.OrderProduct.create({

                    addressUserId: data.addressUserId,
                    isPaymentOnlien: data.isPaymentOnlien,
                    statusId: 'S3',
                    typeShipId: data.typeShipId,
                    voucherId: data.voucherId,
                    note: data.note

                })

                data.arrDataShopCart = data.arrDataShopCart.map((item, index) => {
                    item.orderId = product.dataValues.id
                    return item;
                })

                await db.OrderDetail.bulkCreate(data.arrDataShopCart)
                let res = await db.ShopCart.findOne({ where: { userId: data.userId, statusId: 0 } })
                if (res) {
                    await db.ShopCart.destroy({
                        where: { userId: data.userId }
                    })
                    for (let i = 0; i < data.arrDataShopCart.length; i++) {
                        let productDetailSize = await db.ProductDetailSize.findOne({
                            where: { id: data.arrDataShopCart[i].productId },
                            raw: false
                        })
                        //  productDetailSize.stock = productDetailSize.stock - data.arrDataShopCart[i].quantity
                        await productDetailSize.save()

                    }

                }
                if (data.voucherId && data.userId) {
                    let voucherUses = await db.voucherUsed.findOne({
                        where: {
                            voucherId: data.voucherId,
                            userId: data.userId
                        },
                        raw: false
                    })
                    voucherUses.status = 1;
                    await voucherUses.save()
                }
                resolve({
                    errCode: 0,
                    errMessage: 'ok'
                })
            }
        } catch (error) {
            reject(error)
        }
    })
}
let getAllOrders = (data) => {
    return new Promise(async (resolve, reject) => {
        try {

            let objectFilter = {
                include: [
                    { model: db.TypeShip, as: 'typeShipData' },
                    { model: db.Voucher, as: 'voucherData' },
                    { model: db.Allcode, as: 'statusOrderData' },

                ],
                order: [['createdAt', 'DESC']],
                raw: true,
                nest: true
            }
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit
                objectFilter.offset = +data.offset
            }
            if (data.statusId && data.statusId !== 'ALL') objectFilter.where = { statusId: data.statusId }
            let res = await db.OrderProduct.findAndCountAll(objectFilter)
            for (let i = 0; i < res.rows.length; i++) {
                let addressUser = await db.AddressUser.findOne({ where: { id: res.rows[i].addressUserId } })
                let shipper = await db.User.findOne({ where: { id: res.rows[i].shipperId } })

                if (addressUser) {
                    let user = await db.User.findOne({
                        where: {
                            id: addressUser.userId
                        }
                    })

                    res.rows[i].userData = user
                    res.rows[i].addressUser = addressUser
                    res.rows[i].shipperData = shipper
                }

            }
            resolve({
                errCode: 0,
                data: res.rows,
                count: res.count
            })


        } catch (error) {
            reject(error)
        }
    })
}
module.exports = {
    createNewOrder: createNewOrder,
    getAllOrders: getAllOrders,

}
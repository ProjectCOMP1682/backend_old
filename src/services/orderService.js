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
let getDetailOrderById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let order = await db.OrderProduct.findOne({
                    where: { id: id },
                    include: [
                        { model: db.TypeShip, as: 'typeShipData' },
                        { model: db.Voucher, as: 'voucherData' },
                        { model: db.Allcode, as: 'statusOrderData' },

                    ],
                    raw: true,
                    nest: true
                })
                if (order.image) {
                    order.image = new Buffer(order.image, 'base64').toString('binary')
                }
                order.voucherData.typeVoucherOfVoucherData = await db.TypeVoucher.findOne({
                    where: { id: order.voucherData.typeVoucherId }
                })
                let orderDetail = await db.OrderDetail.findAll({
                    where: { orderId: id }
                })
                let addressUser = await db.AddressUser.findOne({
                    where: { id: order.addressUserId }
                })
                order.addressUser = addressUser
                let user = await db.User.findOne({
                    where: { id: addressUser.userId },
                    attributes: {
                        exclude: ['password', 'image']
                    },
                    raw: true,
                    nest: true
                })
                order.userData = user
                for (let i = 0; i < orderDetail.length; i++) {
                    orderDetail[i].productDetailSize = await db.ProductDetailSize.findOne({
                        where: { id: orderDetail[i].productId },
                        include: [
                            { model: db.Allcode, as: 'sizeData' },
                        ],
                        raw: true,
                        nest: true
                    })
                    orderDetail[i].productDetail = await db.ProductDetail.findOne({
                        where: { id: orderDetail[i].productDetailSize.productdetailId }
                    })
                    orderDetail[i].product = await db.Product.findOne({
                        where: { id: orderDetail[i].productDetail.productId }
                    })
                    orderDetail[i].productImage = await db.ProductImage.findAll({
                        where: { productdetailId: orderDetail[i].productDetail.id }
                    })
                    for (let j = 0; j < orderDetail[i].productImage.length; j++) {
                        orderDetail[i].productImage[j].image = new Buffer(orderDetail[i].productImage[j].image, 'base64').toString('binary')
                    }
                }

                order.orderDetail = orderDetail;

                resolve({
                    errCode: 0,
                    data: order
                })
            }

        } catch (error) {
            reject(error)
        }
    })
}
let updateStatusOrder = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.statusId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let order = await db.OrderProduct.findOne({
                    where: { id: data.id },
                    raw: false
                })
                order.statusId = data.statusId
                await order.save()
                // cong lai stock khi huy don
                if (data.statusId == 'S7' && data.dataOrder.orderDetail && data.dataOrder.orderDetail.length > 0) {
                    for (let i = 0; i < data.dataOrder.orderDetail.length; i++) {
                        let productDetailSize = await db.ProductDetailSize.findOne({
                            where: { id: data.dataOrder.orderDetail[i].productDetailSize.id },
                            raw: false
                        })
                        productDetailSize.stock = productDetailSize.stock + data.dataOrder.orderDetail[i].quantity
                        await productDetailSize.save()
                    }
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
let getAllOrdersByUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!userId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter !'
                })
            } else {
                let addressUser = await db.AddressUser.findAll({
                    where: { userId: userId }
                })
                for (let i = 0; i < addressUser.length; i++) {
                    addressUser[i].order = await db.OrderProduct.findAll({
                        where: { addressUserId: addressUser[i].id },
                        include: [
                            { model: db.TypeShip, as: 'typeShipData' },
                            { model: db.Voucher, as: 'voucherData' },
                            { model: db.Allcode, as: 'statusOrderData' },

                        ],
                        raw: true,
                        nest: true
                    })
                    for (let j = 0; j < addressUser[i].order.length; j++) {
                        addressUser[i].order[j].voucherData.typeVoucherOfVoucherData = await db.TypeVoucher.findOne({
                            where: { id: addressUser[i].order[j].voucherData.typeVoucherId }
                        })
                        let orderDetail = await db.OrderDetail.findAll({
                            where: { orderId: addressUser[i].order[j].id }
                        })
                        for (let k = 0; k < orderDetail.length; k++) {
                            orderDetail[k].productDetailSize = await db.ProductDetailSize.findOne({
                                where: { id: orderDetail[k].productId },
                                include: [
                                    { model: db.Allcode, as: 'sizeData' },
                                ],
                                raw: true,
                                nest: true
                            })
                            orderDetail[k].productDetail = await db.ProductDetail.findOne({
                                where: { id: orderDetail[k].productDetailSize.productdetailId }
                            })
                            orderDetail[k].product = await db.Product.findOne({
                                where: { id: orderDetail[k].productDetail.productId }
                            })
                            orderDetail[k].productImage = await db.ProductImage.findAll({
                                where: { productdetailId: orderDetail[k].productDetail.id }
                            })
                            for (let f = 0; f < orderDetail[k].productImage.length; f++) {
                                orderDetail[k].productImage[f].image = new Buffer(orderDetail[k].productImage[f].image, 'base64').toString('binary')
                            }
                        }


                        addressUser[i].order[j].orderDetail = orderDetail
                    }



                }


                resolve({
                    errCode: 0,
                    data: addressUser

                })
            }

        } catch (error) {
            reject(error)
        }
    })
}
let getAllOrdersByShipper = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(data.shipperId)
            let objectFilter = {
                include: [
                    { model: db.TypeShip, as: 'typeShipData' },
                    { model: db.Voucher, as: 'voucherData' },
                    { model: db.Allcode, as: 'statusOrderData' },

                ],
                order: [['createdAt', 'DESC']],
                raw: true,
                nest: true,
                where: { shipperId: data.shipperId }
            }

            if (data.status && data.status == 'working') objectFilter.where = { ...objectFilter.where, statusId: 'S5' }
            if (data.status && data.status == 'done') objectFilter.where = { ...objectFilter.where, statusId: 'S6' }

            let res = await db.OrderProduct.findAll(objectFilter)

            for (let i = 0; i < res.length; i++) {
                let addressUser = await db.AddressUser.findOne({ where: { id: res[i].addressUserId } })
                if (addressUser) {
                    let user = await db.User.findOne({ where: { id: addressUser.userId } })
                    res[i].userData = user
                    res[i].addressUser = addressUser
                }

            }

            resolve({
                errCode: 0,
                data: res,

            })


            resolve({
                errCode: 0,
                data: addressUser

            })


        } catch (error) {
            reject(error)
        }
    })
}
module.exports = {
    createNewOrder: createNewOrder,
    getAllOrders: getAllOrders,
    getDetailOrderById: getDetailOrderById,
    updateStatusOrder: updateStatusOrder,
    getAllOrdersByUser: getAllOrdersByUser,
    getAllOrdersByShipper: getAllOrdersByShipper,

}
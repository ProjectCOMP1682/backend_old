import db from "../models/index";
// const { Op } = require("sequelize");

function dynamicSort(property) {
    var sortOrder = 1;
    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a, b) {
        /// sap xep tang dan
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}
function dynamicSortMultiple() {

    var props = arguments;
    return function (obj1, obj2) {
        var i = 0, result = 0, numberOfProperties = props.length;
        /* try getting a different result from 0 (equal)
         * as long as we have extra properties to compare
         */
        while (result === 0 && i < numberOfProperties) {
            result = dynamicSort(props[i])(obj1, obj2);
            i++;
        }
        return result;
    }
}

let createNewProduct = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.categoryId || !data.brandId || !data.image || !data.nameDetail) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                let product = await db.Product.create({
                    name: data.name,
                    contentHTML: data.contentHTML,
                    contentMarkdown: data.contentMarkdown,
                    statusId: 'S1',
                    categoryId: data.categoryId,
                    madeby: data.madeby,
                    material: data.material,
                    brandId: data.brandId
                })
                if (product) {
                    let productdetail = await db.ProductDetail.create({
                        productId: product.id,

                        description: data.description,

                        originalPrice: data.originalPrice,
                        discountPrice: data.discountPrice,
                        nameDetail: data.nameDetail
                    })
                    if (productdetail) {
                        await db.ProductImage.create({

                            productdetailId: productdetail.id,
                            image: data.image
                        })
                        await db.ProductDetailSize.create({
                            productdetailId: productdetail.id,
                            width: data.width,
                            height: data.height,
                            sizeId: data.sizeId,
                            weight: data.weight
                        })
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

let getAllProductAdmin = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let objectFilter = {

                include: [
                    { model: db.Allcode, as: 'brandData', attributes: ['value', 'code'] },
                    { model: db.Allcode, as: 'categoryData', attributes: ['value', 'code'] },
                    { model: db.Allcode, as: 'statusData', attributes: ['value', 'code'] },
                ],
                raw: true,
                nest: true
            }
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit
                objectFilter.offset = +data.offset
            }

            if (data.categoryId && data.categoryId !== 'ALL') objectFilter.where = { categoryId: data.categoryId }
            if (data.brandId && data.brandId !== 'ALL') objectFilter.where = { ...objectFilter.where, brandId: data.brandId }
            // if (data.sortName === "true") objectFilter.order = [['name', 'ASC']]
            // if (data.keyword !== '') objectFilter.where = { ...objectFilter.where, name: { [Op.substring]: data.keyword } }

            let res = await db.Product.findAndCountAll(objectFilter)
            for (let i = 0; i < res.rows.length; i++) {
                let objectFilterProductDetail = {
                    where: { productId: res.rows[i].id }, raw: true
                }

                res.rows[i].productDetail = await db.ProductDetail.findAll(objectFilterProductDetail)

                for (let j = 0; j < res.rows[i].productDetail.length; j++) {
                    res.rows[i].productDetail[j].productDetailSize = await db.ProductDetailSize.findAll({ where: { productdetailId: res.rows[i].productDetail[j].id }, raw: true })

                    res.rows[i].price = res.rows[i].productDetail[0].discountPrice
                    res.rows[i].productDetail[j].productImage = await db.ProductImage.findAll({ where: { productdetailId: res.rows[i].productDetail[j].id }, raw: true })
                    for (let k = 0; k < res.rows[i].productDetail[j].productImage.length > 0; k++) {
                        res.rows[i].productDetail[j].productImage[k].image = new Buffer(res.rows[i].productDetail[j].productImage[k].image, 'base64').toString('binary')
                    }
                }
            }
            if (data.sortPrice && data.sortPrice === "true") {

                res.rows.sort(dynamicSortMultiple("price"))
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
let getAllProductUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let objectFilter = {
                where: { statusId: 'S1' },
                include: [
                    { model: db.Allcode, as: 'brandData', attributes: ['value', 'code'] },
                    { model: db.Allcode, as: 'categoryData', attributes: ['value', 'code'] },
                    { model: db.Allcode, as: 'statusData', attributes: ['value', 'code'] },
                ],
                raw: true,
                nest: true
            }
            if (data.limit && data.offset) {
                objectFilter.limit = +data.limit
                objectFilter.offset = +data.offset
            }

            if (data.categoryId && data.categoryId !== 'ALL') objectFilter.where = { categoryId: data.categoryId }
            if (data.brandId && data.brandId !== 'ALL') objectFilter.where = { ...objectFilter.where, brandId: data.brandId }
            // if (data.sortName === "true") objectFilter.order = [['name', 'ASC']]
            // if (data.keyword !== '') objectFilter.where = { ...objectFilter.where, name: { [Op.substring]: data.keyword } }

            let res = await db.Product.findAndCountAll(objectFilter)
            for (let i = 0; i < res.rows.length; i++) {
                let objectFilterProductDetail = {
                    where: { productId: res.rows[i].id }, raw: true
                }

                res.rows[i].productDetail = await db.ProductDetail.findAll(objectFilterProductDetail)

                for (let j = 0; j < res.rows[i].productDetail.length; j++) {
                    res.rows[i].productDetail[j].productDetailSize = await db.ProductDetailSize.findAll({ where: { productdetailId: res.rows[i].productDetail[j].id }, raw: true })

                    res.rows[i].price = res.rows[i].productDetail[0].discountPrice
                    res.rows[i].productDetail[j].productImage = await db.ProductImage.findAll({ where: { productdetailId: res.rows[i].productDetail[j].id }, raw: true })
                    for (let k = 0; k < res.rows[i].productDetail[j].productImage.length > 0; k++) {
                        res.rows[i].productDetail[j].productImage[k].image = new Buffer(res.rows[i].productDetail[j].productImage[k].image, 'base64').toString('binary')
                    }
                }
            }
            if (data.sortPrice && data.sortPrice === "true") {

                res.rows.sort(dynamicSortMultiple("price"))
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
let UnactiveProduct = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                let product = await db.Product.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (!product) {
                    resolve({
                        errCode: 2,
                        errMessage: `The product isn't exist`
                    })
                } else {
                    product.statusId = 'S2';
                    await product.save();
                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}
let ActiveProduct = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                let product = await db.Product.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (!product) {
                    resolve({
                        errCode: 2,
                        errMessage: `The product isn't exist`
                    })
                } else {
                    product.statusId = 'S1';
                    await product.save();
                    resolve({
                        errCode: 0,
                        errMessage: 'ok'
                    })
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}
module.exports = {
    createNewProduct: createNewProduct,
    getAllProductAdmin: getAllProductAdmin,
    getAllProductUser: getAllProductUser,
    UnactiveProduct: UnactiveProduct,
    ActiveProduct: ActiveProduct,
}

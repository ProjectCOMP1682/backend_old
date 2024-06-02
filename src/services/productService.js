import db from "../models/index";

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

let updateProduct = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.categoryId || !data.brandId) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                let product = await db.Product.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (product) {
                    product.name = data.name;
                    product.material = data.material;
                    product.madeby = data.madeby;
                    product.brandId = data.brandId;
                    product.categoryId = data.categoryId;
                    product.contentMarkdown = data.contentMarkdown;
                    product.contentHTML = data.contentHTML;

                    await product.save()
                    resolve({
                        errCode: 0,
                        errMessage: ''
                    })
                }
            }

        } catch (error) {
            reject(error)
        }
    })
}

let getDetailProductById = (id) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                let res = await db.Product.findOne({
                    where: { id: id },
                    include: [
                        { model: db.Allcode, as: 'brandData', attributes: ['value', 'code'] },
                        { model: db.Allcode, as: 'categoryData', attributes: ['value', 'code'] },
                        { model: db.Allcode, as: 'statusData', attributes: ['value', 'code'] },
                    ],
                    raw: true,
                    nest: true
                })
                let product = await db.Product.findOne({
                    where: { id: id },
                    raw: false
                })
                product.view = product.view + 1
                await product.save()

                res.productDetail = await db.ProductDetail.findAll({
                    where: { productId: res.id }
                })

                for (let i = 0; i < res.productDetail.length > 0; i++) {

                    res.productDetail[i].productImage = await db.ProductImage.findAll({ where: { productdetailId: res.productDetail[i].id } })

                    res.productDetail[i].productDetailSize = await db.ProductDetailSize.findAll({
                        where: { productdetailId: res.productDetail[i].id },
                        include: [
                            { model: db.Allcode, as: 'sizeData', attributes: ['value', 'code'] },

                        ],

                        raw: true,
                        nest: true
                    })

                    for (let j = 0; j < res.productDetail[i].productImage.length; j++) {
                        res.productDetail[i].productImage[j].image = new Buffer(res.productDetail[i].productImage[j].image, 'base64').toString('binary')
                    }
                    for (let k = 0; k < res.productDetail[i].productDetailSize.length; k++) {
                        let receiptDetail = await db.ReceiptDetail.findAll({ where: { productDetailSizeId: res.productDetail[i].productDetailSize[k].id } })
                        let orderDetail = await db.OrderDetail.findAll({ where: { productId: res.productDetail[i].productDetailSize[k].id } })
                        let quantity = 0
                        for (let g = 0; g < receiptDetail.length; g++) {
                            quantity = quantity + receiptDetail[g].quantity
                        }
                        for (let h = 0; h < orderDetail.length; h++) {
                            let order = await db.OrderProduct.findOne({ where: { id: orderDetail[h].orderId } })
                            if (order.statusId != 'S7') {

                                quantity = quantity - orderDetail[h].quantity
                            }

                        }
                        res.productDetail[i].productDetailSize[k].stock = quantity



                    }
                }
                resolve({
                    errCode: 0,
                    data: res
                })
            }

        } catch (error) {
            reject(error)
        }
    })
}
let getAllProductDetailById = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.limit || !data.offset) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                let productdetail = await db.ProductDetail.findAndCountAll({
                    where: { productId: data.id },
                    limit: +data.limit,
                    offset: +data.offset,
                })
                if (productdetail.rows && productdetail.rows.length > 0) {
                    for (let i = 0; i < productdetail.rows.length; i++) {
                        productdetail.rows[i].productImageData = await db.ProductImage.findAll({
                            where: { productdetailId: productdetail.rows[i].id }
                        })
                        productdetail.rows[i].productsize = await db.ProductDetailSize.findAll({
                            where: { productdetailId: productdetail.rows[i].id }
                        })
                        if (productdetail.rows[i].productImageData && productdetail.rows[i].productImageData.length > 0) {
                            for (let j = 0; j < productdetail.rows[i].productImageData.length > 0; j++) {
                                productdetail.rows[i].productImageData[j].image = new Buffer(productdetail.rows[i].productImageData[j].image, 'base64').toString('binary')
                            }
                        }

                    }
                }
                resolve({
                    errCode: 0,
                    data: productdetail.rows,
                    count: productdetail.count
                })
            }

        } catch (error) {
            reject(error)
        }
    })
}
let getAllProductDetailImageById = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.limit || !data.offset) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {
                let productImage = await db.ProductImage.findAndCountAll({
                    where: { productdetailId: data.id },
                    limit: +data.limit,
                    offset: +data.offset,
                })
                if (productImage.rows && productImage.rows.length > 0) {
                    productImage.rows.map(item => item.image = new Buffer(item.image, 'base64').toString('binary'))
                }

                resolve({
                    errCode: 0,
                    data: productImage.rows,
                    count: productImage.count
                })
            }

        } catch (error) {
            reject(error)
        }
    })
}
let createNewProductDetail = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.image || !data.nameDetail || !data.originalPrice || !data.discountPrice || !data.id) {
                resolve({
                    errCode: 1,
                    errMessage: 'Missing required parameter!'
                })
            } else {

                let productdetail = await db.ProductDetail.create({
                    productId: data.id,
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
module.exports = {
    createNewProduct: createNewProduct,
    getAllProductAdmin: getAllProductAdmin,
    getAllProductUser: getAllProductUser,
    UnactiveProduct: UnactiveProduct,
    ActiveProduct: ActiveProduct,
    updateProduct: updateProduct,
    getDetailProductById: getDetailProductById,
    getAllProductDetailById: getAllProductDetailById,
    getAllProductDetailImageById: getAllProductDetailImageById,
    createNewProductDetail: createNewProductDetail,

}

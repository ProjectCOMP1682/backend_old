import db from "../models/index";

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
module.exports = {
    createNewProduct: createNewProduct,
}

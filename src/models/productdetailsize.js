'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductDetailSize extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      ProductDetailSize.belongsTo(models.Allcode, { foreignKey: 'sizeId', targetKey: 'code', as: 'sizeData' })
    }
  };
  ProductDetailSize.init({
    productdetailId: DataTypes.INTEGER,
    width: DataTypes.STRING,
    height: DataTypes.STRING,
    weigth: DataTypes.STRING,
    sizeId: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'ProductDetailSize',
  });
  return ProductDetailSize;
};
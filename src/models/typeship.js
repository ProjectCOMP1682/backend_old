'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TypeShip extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TypeShip.hasMany(models.OrderProduct, { foreignKey: 'typeShipId', as: 'typeShipData' })
    }
  };
  TypeShip.init({
    type: DataTypes.STRING,
    price: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'TypeShip',
  });
  return TypeShip;
};
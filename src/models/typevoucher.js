'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class typevoucher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      TypeVoucher.belongsTo(models.Allcode, { foreignKey: 'typeVoucher', targetKey: 'code', as: 'typeVoucherData' })
      TypeVoucher.hasMany(models.Voucher, { foreignKey: 'typeVoucherId', as: 'typeVoucherOfVoucherData' })
    }
  };
  typevoucher.init({
    typeVoucher: DataTypes.STRING,
    value: DataTypes.BIGINT,
    maxValue: DataTypes.BIGINT,
    minValue: DataTypes.BIGINT
  }, {
    sequelize,
    modelName: 'typevoucher',
  });
  return typevoucher;
};
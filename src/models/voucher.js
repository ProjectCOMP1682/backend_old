'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class voucher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Voucher.belongsTo(models.TypeVoucher, { foreignKey: 'typeVoucherId', targetKey: 'id', as: 'typeVoucherOfVoucherData' })
      Voucher.hasMany(models.OrderProduct, { foreignKey: 'voucherId', as: 'voucherData' })
    }
  };
  voucher.init({
    fromDate: DataTypes.STRING,
    toDate: DataTypes.STRING,
    typeVoucherId: DataTypes.INTEGER,
    amount: DataTypes.INTEGER,
    codeVoucher: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'voucher',
  });
  return voucher;
};
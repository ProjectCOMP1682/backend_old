'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('OrderProducts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      addressUserId: {
        type: Sequelize.INTEGER
      },
      statusId: {
        type: Sequelize.STRING
      },
      typeShipId: {
        type: Sequelize.INTEGER
      },
      voucherId: {
        type: Sequelize.INTEGER
      },
      note: {
        type: Sequelize.STRING
      },
      isPaymentOnlien: {
        type: Sequelize.INTEGER
      },
      shipperId: {
        type: Sequelize.INTEGER
      },
      image: {
        type: Sequelize.BLOB('long')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('OrderProducts');
  }
};
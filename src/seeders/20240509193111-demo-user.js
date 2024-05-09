'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Users', [
      {
        email: 'duongvanthanhson5@gmail.com',
        password: '123456',
        firstName: 'thanh',
        lastName: 'son',
        address: 'hanoi',
        generId: 'M',
        phonenumber: '123123123',
        image: '[BLOB - 53.1 KiB]',
        dob: '962125200000',
        isActiveEmail: '1',
        roleId: 'R1',
        statusId: 'S1',
        usertoken: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};

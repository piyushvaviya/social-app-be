"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "profile_url", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.sequelize.query(
      `UPDATE "users"
      SET "profile_url" = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQ1MEOl0lEd7LCAXd9kKpH9hwCTNzUpJLsBAb6wLx05g&s'`
    );
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn("users", "profile_url");
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};

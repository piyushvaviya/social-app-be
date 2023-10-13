"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("posts", "likes");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("posts", "likes", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: [],
    });
  },
};

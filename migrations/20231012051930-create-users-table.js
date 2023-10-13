"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("posts", "post_url", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("posts", "post_url", {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        isUrl: {
          msg: "Invalid image URL",
        },
      },
    });
  },
};

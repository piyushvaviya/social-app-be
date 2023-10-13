"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("posts", "comments");
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("posts", "comments", {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [],
    });
  },
};

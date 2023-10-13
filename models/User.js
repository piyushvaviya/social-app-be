const bcrypt = require("bcrypt");

const { STATUS } = require("../src/utils/constants");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      profile_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM(STATUS.ACTIVE, STATUS.DELETED),
        allowNull: false,
        defaultValue: STATUS.ACTIVE,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    { modelName: "User", tableName: "users" }
  );
  User.associate = function (models) {
    models.User.hasMany(models.Post, {
      foreignKey: "userId",
    });
    models.User.hasMany(models.Comment, {
      foreignKey: "userId",
    });
    models.User.hasMany(models.Like, {
      foreignKey: "userId",
      as: "likes",
    });
  };

  // Hash the password before saving the user
  User.beforeCreate(async (user) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword;
  });

  return User;
};

// module.exports = User;

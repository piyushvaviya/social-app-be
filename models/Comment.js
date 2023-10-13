module.exports = (sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "Comment",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      postId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
    { modelName: "Comment", tableName: "post_comments" }
  );

  Comment.associate = function (models) {
    // Define the relation between User and Comment
    Comment.belongsTo(models.User, { foreignKey: "userId", as: "user" });

    // Define the relation between Post and Comment
    Comment.belongsTo(models.Post, { foreignKey: "postId", as: "post" });
  };
  return Comment;
};

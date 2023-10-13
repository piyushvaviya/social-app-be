module.exports = (sequelize, DataTypes) => {
  const Post = sequelize.define(
    "Post",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      post_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      location: { type: DataTypes.STRING, allowNull: true },
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
    { modelName: "Post", tableName: "posts" }
  );

  Post.associate = function (models) {
    Post.belongsTo(models.User, { foreignKey: "userId", as: "user" });

    // Define the association between Post and Comment
    Post.hasMany(models.Comment, { foreignKey: "postId", as: "comments" });

    Post.hasMany(models.Like, { foreignKey: "postId", as: "likes" });
  };
  return Post;
};

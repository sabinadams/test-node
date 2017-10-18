module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("users", {
        tag: DataTypes.STRING,
        username: DataTypes.STRING,
        ID: { type: DataTypes.INTEGER, primaryKey: true },
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        salt: DataTypes.STRING,
        active: DataTypes.INTEGER
    }, {
        timestamps: false,
        freezeTableName: true
    });

    User.associate = (models) => {
        User.hasMany(models.sessions, { foreignKey: 'token' });
        User.hasMany(models.markers, { foreignKey: 'user_ID' });
    }

    return User;
};
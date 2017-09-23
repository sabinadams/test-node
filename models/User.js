module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("users", {
        tag: DataTypes.STRING,
        ID: { type: DataTypes.INTEGER, primaryKey: true },
        email: DataTypes.STRING,
        password: DataTypes.STRING,
        salt: DataTypes.STRING,
        active: DataTypes.INTEGER
    }, {
        timestamps: false
    });

    User.associate = (models) => {
        User.hasMany(models.sessions, { foreignKey: 'token' });
    }

    return User;
};
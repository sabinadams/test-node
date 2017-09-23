module.exports = (sequelize, DataTypes) => {
    const Session = sequelize.define("sessions", {
        token: {
            type: DataTypes.STRING,
            primaryKey: true
        },
        user_ID: DataTypes.INTEGER,
        timestamp: DataTypes.DATE
    }, {
        timestamps: false,
        freezeTableName: true
    });


    Session.associate = (models) => {
        Session.belongsTo(models.users, { foreignKey: 'user_ID' });
    }

    return Session;
};
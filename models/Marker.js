module.exports = (sequelize, DataTypes) => {
    const Marker = sequelize.define("markers", {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        xloc: DataTypes.INTEGER,
        yloc: DataTypes.INTEGER,
        user_ID: DataTypes.INTEGER,
        memo: DataTypes.STRING
    }, {
        timestamps: false,
        freezeTableName: true
    });


    Marker.associate = (models) => {
        Marker.belongsTo(models.users, { foreignKey: 'user_ID' });
    }

    return Marker;
};
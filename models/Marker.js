module.exports = (sequelize, DataTypes) => {
    const Marker = sequelize.define("markers", {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        xloc: DataTypes.FLOAT,
        yloc: DataTypes.FLOAT,
        user_ID: DataTypes.INTEGER,
        memo: DataTypes.STRING,
        img: DataTypes.STRING,
        date: DataTypes.DATE
    }, {
        timestamps: false,
        freezeTableName: true
    });


    Marker.associate = (models) => {
        Marker.belongsTo(models.users, { foreignKey: 'user_ID' });
    }

    return Marker;
};
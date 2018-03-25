module.exports = (sequelize, DataTypes) => {
    const Share = sequelize.define("shared_markers", {
        ID: {
            type: DataTypes.INTEGER,
            primaryKey: true
        },
        sharer_ID: DataTypes.INTEGER,
        reciever_ID: DataTypes.INTEGER,
        marker_ID: DataTypes.INTEGER
    }, {
        timestamps: false,
        freezeTableName: true
    });

    return Share;
};
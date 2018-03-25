module.exports = class MarkerService {
    constructor(db) {
        this.db = db;
    }

    newMarker(user, marker, cb) {
        let newMarker = {
            xloc: marker.xloc,
            yloc: marker.yloc,
            memo: marker.memo,
            user_ID: user.ID,
            img: marker.img
        };
        this.db.markers.create(newMarker).then(marker => {
            cb({ success: true, marker });
        }).catch(err => {
            cb({ success: false, message: err, marker: {} })
        });
    }

    // Will also have to add support to grab shared markers
    getMarkers(user, cb) {
        this.db.users.find({ where: { id: user.ID }, include: { association: 'markers' } }).then(record => {
            this.db.sequelize.query(`
                SELECT m.* FROM shared_markers sm 
                LEFT JOIN markers m on m.ID = sm.marker_ID
                WHERE sm.reciever_ID = :userID
            `, {
                replacements: { userID: user.ID },
                type: this.db.sequelize.QueryTypes.SELECT
            }).then(shared_markers => {
                cb({
                    success: true,
                    markers: record.toJSON().markers.concat(shared_markers)
                });
            })
        }).catch(err => {
            cb({
                success: false,
                markers: []
            });
        });
    }

    deleteMarker(user, ID, cb) {
        this.db.markers.findOne({ where: { ID: ID } }).then(marker => {
                if (marker != null) {
                    if (marker.user_ID == user.ID) {
                        this.db.markers.destroy({
                            where: { ID: ID, user_ID: user.ID }
                        }).then(() => {
                            this.db.shared_markers.destroy({
                                where: {
                                    marker_ID: ID,
                                    sharer_ID: user.ID
                                }
                            }).then(() => {
                                cb({ success: true, message: "Deleted" })
                            })

                        })
                    } else {
                        this.db.shared_markers.findOne({
                            where: { marker_ID: ID, reciever_ID: user.ID }
                        }).then(share_record => {
                            if (share_record != null) {
                                this.db.shared_markers.destroy({
                                    where: { marker_ID: ID, reciever_ID: user.ID }
                                }).then(() => { cb({ success: true, message: "Tie to marker successfully deleted" }); });
                            } else {
                                cb({ success: false, message: "You don't have access to a marker with this ID" });
                            }
                        })
                    }
                } else {
                    cb({
                        success: false,
                        message: "Marker not found"
                    })
                }
            })
            .catch(err => {
                cb({ success: true, message: err })
            });
    }

    sendToUser(userID, tag, markerID, cb) {
        this.db.users.findOne({ where: { tag: tag } }).then(user => {
            if (user != null) {
                if (user.ID == userID) {
                    cb({ success: false, message: "You cannot send a location to yourself" });
                } else {
                    this.db.shared_markers.findOne({
                        where: {
                            sharer_ID: userID,
                            reciever_ID: user.ID,
                            marker_ID: markerID
                        }
                    }).then(record => {
                        if (record == null) {
                            this.db.shared_markers.create({
                                sharer_ID: userID,
                                reciever_ID: user.ID,
                                marker_ID: markerID
                            }).then(() => {
                                cb({ success: true, message: "Marker shared" });
                            });
                        } else {
                            cb({ success: false, message: "Already sent to that user" });
                        }
                    })

                }
            } else {
                cb({ success: false, message: "User with that tag not found" });
            }

        }).catch(err => {
            cb({ success: false, message: err.message });
        });
    }
}
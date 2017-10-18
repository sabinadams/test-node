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
        this.db.users.find({ where: { id: user.ID }, include: { association: 'markers' } }).then(res => {
            cb({
                success: true,
                markers: res.toJSON().markers
            });
        }).catch(err => {
            cb({
                success: false,
                markers: []
            });
        });
    }

    deleteMarker(user, ID, cb) {
        this.db.markers.destroy({
            where: {
                ID: ID,
                user_ID: user.ID
            }
        }).then(() => {
            cb({ success: true, message: "Delted" })
        }).catch(err => {
            cb({ success: true, message: err })
        })
    }
}
let crypto = require('crypto');

module.exports = class AuthService {
    constructor(db) {
        this.db = db;
    }

    _generateToken() {
        let d = new Date().getTime();
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
    }

    validateTokenSession(req, token, cb) {
        // I don't think this should be doing "all"
        this.db.sessions.find({ where: { token: token }, include: { association: 'user' } }).then(res => {
            cb(res ? { isLoggedIn: true, user: res.toJSON().user } : { isLoggedIn: false, user: [] });
        });
    }

    _createHash(data) {
        return crypto.createHash('md5').update(data).digest('hex');

    }

    login(email = '', password = '', token = '', cb) {
        let hash = crypto.createHash('md5')
        if (email.length && password.length && token.length) {
            this.db.users.findOne({ where: { email: email } }).then(user => {
                if (user && user.active && user.password == this._createHash(`${password}${user.salt}`)) {
                    this.db.sessions.findOne({ where: { user_ID: user.ID, token: token } }).then(session => {
                        let ret_user = {
                            ID: user.ID,
                            email: user.email,
                            username: user.username,
                            tag: user.tag,
                            active: user.active,
                            token: token,
                            logged_in: 1
                        };
                        if (session) {
                            ret_user.message = "Used existing token";
                            // Update the session timetamp and the user's timestamp
                            cb(ret_user);
                        } else {
                            ret_user.message = "New token generated";
                            // Create a new session with the provided token
                            // Update user's timestamp
                            this.db.sessions.create({
                                user_ID: user.ID,
                                token: token,
                                timestamp: Date.now()
                            }).then(() => { cb(ret_user); });
                        }
                    })
                } else { cb({ loggedIn: false }); }
            })
        } else { cb({ loggedIn: false, message: 'Not all of the required fields were provided' }); }
    }

    updateUser(curr_user, new_info, cb) {
        this.db.users.findOne({ where: { email: curr_user.email, ID: curr_user.ID } }).then(user => {
            if (!new_info.old_password || (new_info.old_password && this._createHash(`${new_info.old_password}${user.salt}`) == user.password)) {
                if (user && user.active) {
                    let updateInfo = {};
                    if (new_info.email.length) { updateInfo['email'] = new_info.email; }
                    if (new_info.tag.length) { updateInfo['tag'] = new_info.tag; }
                    if (new_info.username.length) { updateInfo['username'] = new_info.username; }
                    if (new_info.password) {
                        let salt = this._createHash(this._generateToken());
                        let password_hash = this._createHash(`${new_info.password}${salt}`);
                        updateInfo.password = password_hash;
                        updateInfo.salt = salt;
                    };
                    user.update(updateInfo, {
                        where: { email: user.email, ID: user.ID }
                    }).then(updated => {
                        cb({
                            success: true,
                            new_user: {
                                tag: updated.dataValues.tag,
                                email: updated.dataValues.email,
                                username: updated.dataValues.username
                            },
                            message: 'User Updated'
                        });
                    });
                } else {
                    cb({
                        success: false,
                        new_user: {},
                        messgage: 'Either no user found, or the user was not active'
                    });
                }
            } else {
                cb({
                    success: false,
                    new_user: {},
                    message: 'Incorrect password'
                })
            }
        });
    }
}
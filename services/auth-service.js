let crypto = require('crypto');

module.exports = class AuthService {
    constructor(db) {
        this.db = db;
    }

    validateTokenSession(req, token, cb) {
        this.db.sessions.find({ where: { token: token }, include: { association: 'user', all: true } }).then(res => {
            cb(res ? { isLoggedIn: true, user: res.toJSON().user } : { isLoggedIn: false, user: [] });
        });
    }

    login(email = '', password = '', token = '', cb) {
        let hash = crypto.createHash('sha512')
        if (email.length && password.length && token.length) {
            this.db.users.findOne({ where: { email: email } }).then(user => {
                if (user && user.active && user.password == hash.update(`${password}${user.salt}`).digest('hex').toUpperCase()) {
                    this.db.sessions.findOne({ where: { user_ID: user.ID, token: token } }).then(session => {
                        let ret_user = {
                            ID: user.ID,
                            email: user.email,
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
}
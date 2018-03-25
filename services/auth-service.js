let crypto = require('crypto');
const nodemailer = require('nodemailer');
let fs = require('fs');
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
        this.db.sessions.find({ where: { token: token }, include: { association: 'user' } }).then(res => {
            cb(res ? { isLoggedIn: true, user: res.toJSON().user } : { isLoggedIn: false, user: [] });
        });
    }

    _createHash(data) {
        return crypto.createHash('md5').update(data).digest('hex');
    }

    getMinutesBetweenDates(startDate, endDate) {
        let diff = endDate.getTime() - startDate.getTime();
        return (diff / 60000);
    }

    register(user, cb) {
        if (!user.email || user.email == '' ||
            !user.password || user.password == '' ||
            !user.tag || user.tag == '' ||
            !user.password_repeat || user.password_repeat == ''
        ) {
            return cb({
                success: false,
                user: {},
                message: "Not all of the required fields were filled out"
            });
        }

        if (user.password != user.password_repeat) {
            return cb({
                success: false,
                user: {},
                message: "The passwords didn't match"
            });
        }
        user.salt = this._createHash(this._generateToken());
        user.password = this._createHash(`${user.password}${user.salt}`);
        user.active = 1;
        this.db.sequelize.query(`SELECT * FROM users WHERE email = :email OR tag = :tag`, {
            replacements: { email: user.email, tag: user.tag },
            type: this.db.sequelize.QueryTypes.SELECT
        }).then(dupCheck => {
            if (dupCheck.length == 0) {
                this.db.users.create(user).then(user => {
                    cb({
                        success: true,
                        user: {
                            email: user.email,
                            tag: user.tag,
                            username: user.username,
                            ID: user.ID,
                            active: user.active
                        },
                        message: 'User created'
                    });
                });
            } else {
                cb({
                    success: false,
                    user: {},
                    message: 'Email or Tag already taken'
                });
            }
        }).catch(err => {
            cb({
                success: false,
                user: {},
                message: err
            })
        })
    }

    login(email = '', password = '', token = '', cb) {
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
        this.db.users.findOne({
            where: {
                [this.db.sequelize.Op.or]: [{ email: new_info.email }, { tag: new_info.tag }]
            }
        }).then(user => {
            if (user == null) {
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
                                        username: updated.dataValues.username,
                                        active: user.active,
                                        ID: user.ID
                                    },
                                    message: 'User Updated'
                                });
                            });
                        } else {
                            cb({
                                success: false,
                                new_user: {},
                                message: 'Either no user found, or the user was not active'
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
            } else {
                cb({
                    success: false,
                    new_user: {},
                    message: 'Email or tag already in use'
                });
            }
        }).catch(err => {
            cb({
                success: false,
                new_user: {},
                message: 'Error, please ensure you are using a unique tag and email. '
            })
        })

    }

    forgotPasswordEmail(email, cb) {
        if (email == null || email == '') {
            return cb({
                success: false,
                message: 'No email provided'
            });
        }

        this.db.users.findOne({ where: { email: email } }).then(user => {
            if (user != null) {
                let code = Math.random().toString(36).substr(2, 5);
                this.db.users.update({ changePassToken: code, changePassTimestamp: new Date().getTime() }, {
                    where: {
                        email: email
                    }
                }).then(res => {

                    fs.readFile(__dirname + '/../util/email.html', (err, html) => {
                        let file = html.toString().replace(/#code#/, code);
                        if (err) {
                            return cb({
                                success: false,
                                message: 'Server Error1'
                            })
                        }
                        // create reusable transporter object using the default SMTP transport
                        let transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: { user: 'marksite.team@gmail.com', pass: '798140Sa' }
                        });

                        // setup email data with unicode symbols
                        let mailOptions = {
                            from: 'Marksite', // sender address
                            to: email, // list of receivers
                            subject: 'Reset Password Verification Code', // Subject line
                            html: file // html body
                        };

                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return cb({
                                    success: false,
                                    message: 'Server Error2'
                                })
                            }
                            cb({ success: true, message: `An email containing the verification code was sent to ${email}. This code is valid for 15 minutes.` });
                        });
                    });
                }).catch((err) => {
                    cb({
                        success: false,
                        message: err.message || 'Server Error3'
                    });
                })
            } else {
                cb({
                    success: false,
                    message: 'User not found'
                });
            }
        })
    }

    forgotPasswordChangePass(code, data, cb) {
        this.db.users.findOne({ where: { changePassToken: code } }).then(res => {
            if (res != null) {
                let user = res.toJSON();
                if (data.newPass != data.newPassConfirm) {
                    return cb({ success: false, message: 'The password did not match the confirm password.', timetaken: '' });
                }
                let currTime = new Date().getTime();
                if (this.getMinutesBetweenDates(new Date(user.changePassTimestamp), new Date(currTime)) <= 15) {
                    let password = this._createHash(`${data.newPass}${user.salt}`);
                    console.log(user.password, password)
                    this.db.users.update({ password: password, changePassToken: Math.random().toString(36) }, {
                        where: {
                            ID: user.ID
                        }
                    }).then(final => {
                        cb({
                            success: true,
                            message: "Password changed",
                            timetaken: this.getMinutesBetweenDates(new Date(user.changePassTimestamp), new Date(currTime))
                        });
                    })
                } else {
                    cb({
                        success: false,
                        message: "This code has expired. Please try again.",
                        timetaken: this.getMinutesBetweenDates(new Date(user.changeTimestamp), new Date(currTime))
                    });
                }
            } else {
                cb({
                    success: false,
                    message: "User not found",
                    timetaken: ''
                });
            }
        })
    }
}
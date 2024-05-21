import db from "../models/index";
import bcrypt from "bcryptjs";
require('dotenv').config();

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }
            })
            if (user) {
                resolve(true)
            } else {
                resolve(false)
            }
        } catch (error) {
            reject(error)
        }
    })
}

let handleLogin = (data) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!data.email || !data.password) {
                resolve({
                    errCode: 4,
                    errMessage: 'Missing required parameters!'
                })
            }
            else {
                let userData = {};

                let isExist = await checkUserEmail(data.email);

                if (isExist === true) {
                    let user = await db.User.findOne({
                        attributes: ['email', 'roleId', 'password', 'firstName', 'lastName', 'id'],
                        // where: { email: data.email, statusId: 'S1' },
                        where: { email: data.email, statusId: 'S1' },
                        raw: true
                    })
                    if (user) {
                        let check = await bcrypt.compareSync(data.password, user.password);
                        if (check) {
                            userData.errCode = 0;
                            userData.errMessage = 'Ok';

                            delete user.password;

                            userData.user = user;
                            // userData.accessToken = CommonUtils.encodeToken(user.id)
                        } else {
                            userData.errCode = 3;

                            userData.errMessage = 'Wrong password';
                        }
                    } else {
                        userData.errCode = 2;
                        userData.errMessage = 'User not found!'
                    }
                } else {
                    userData.errCode = 1;
                    userData.errMessage = `Your's email isn't exist in your system. plz try other email`
                }
                resolve(userData)
            }


        } catch (error) {
            reject(error)
        }
    })
}
module.exports = {
    handleLogin: handleLogin,
}
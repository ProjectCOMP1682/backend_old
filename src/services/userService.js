import db from "../models/index";
import bcrypt from "bcryptjs";
require('dotenv').config();
import CommonUtils from '../utils/CommonUtils';
const salt = bcrypt.genSaltSync(10);

let hashUserPasswordFromBcrypt = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (error) {
            reject(error)
        }
    })
}

let handleCreateNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.email || !data.lastName) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing required parameters !'
                })
            } else {
                let check = await checkUserEmail(data.email);
                if (check === true) {
                    resolve({
                        errCode: 1,
                        errMessage: 'Your email is already in used, Plz try another email!'
                    })
                } else {
                    let hashPassword = await hashUserPasswordFromBcrypt(data.password);
                    await db.User.create({
                        email: data.email,
                        password: hashPassword,
                        firstName: data.firstName,
                        lastName: data.lastName,
                        address: data.address,
                        roleId: data.roleId,
                        genderId: data.genderId,
                        phonenumber: data.phonenumber,
                        image: data.avatar,
                        dob: data.dob,
                        isActiveEmail: 0,
                        statusId: 'S1',
                        usertoken: '',
                    })
                    resolve({
                        errCode: 0,
                        message: 'OK'
                    })
                }

            }

        } catch (error) {
            reject(error)
        }
    })
}

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
let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id || !data.genderId) {
                resolve({
                    errCode: 2,
                    errMessage: `Missing required parameters`
                })
            } else {
                let user = await db.User.findOne({
                    where: { id: data.id },
                    raw: false
                })
                if (user) {
                    user.firstName = data.firstName
                    user.lastName = data.lastName
                    user.address = data.address
                    user.roleId = data.roleId
                    user.genderId = data.genderId
                    user.phonenumber = data.phonenumber
                    user.dob = data.dob
                    if (data.image) {
                        user.image = data.image
                    }
                    await user.save();
                    resolve({
                        errCode: 0,
                        errMessage: 'Update the user succeeds!'
                    })
                } else {
                    resolve({
                        errCode: 1,
                        errMessage: 'User not found!'
                    })
                }
            }

        } catch (error) {
            reject(error)
        }
    })
}

let deleteUser = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {

            if (!userId) {
                resolve({
                    errCode: 1,
                    errMessage: `Missing required parameters !`
                })
            } else {
                let foundUser = await db.User.findOne({
                    where: { id: userId }
                })
                if (!foundUser) {
                    resolve({
                        errCode: 2,
                        errMessage: `The user isn't exist`
                    })
                }
                await db.User.destroy({
                    where: { id: userId }
                })
                resolve({
                    errCode: 0,
                    message: `The user is deleted`
                })
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
                            userData.accessToken = CommonUtils.encodeToken(user.id)
                            user.usertoken= userData.accessToken
                            await db.User.update(
                                { usertoken: userData.accessToken },
                                { where: { id: user.id } }
                            );

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
    handleCreateNewUser: handleCreateNewUser,
    updateUserData: updateUserData,
    deleteUser: deleteUser,
}
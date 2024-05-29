const jwt = require('jsonwebtoken')
import db from "../models/index";
require('dotenv').config();
const secretString = process.env.JWT_SECRET
import CommonUtils from '../utils/CommonUtils';
const middlewareControllers = {
    verifyTokenUser: (req, res, next) => {
        const token = req.headers.authorization

        if (token) {
            const accessToken = token.split(' ')[1]

            jwt.verify(accessToken, secretString, async (err, payload) => {
                if (err) {
                    return res.status(403).json({
                        status: false,
                        errMessage: 'Token is not valid!',
                        refresh: true,
                    })
                }
                const user = await db.User.findOne({ where: { id: payload.sub } })
                if (!user) {
                    return res.status(404).json({
                        status: false,
                        errMessage: 'User is not exits',
                        refresh: true,
                    })
                }

                req.user = user
                next()
            })
        } else {
            return res.status(401).json({
                status: false,
                message: "You're not authentication!",
                refresh: true,
            })
        }
    },
    verifyTokenAdmin: (req, res, next) => {
        const token = req.headers.authorization

        if (token) {
            const accessToken = token.split(' ')[1]

            jwt.verify(accessToken, secretString, async (err, payload) => {
                if (err) {
                    return res.status(403).json({
                        status: false,
                        errMessage: 'Token is not valid!',
                        refresh: true,
                    })
                }
                const user = await db.User.findOne({ where: { id: payload.sub } })
                if (!user) {
                    return res.status(404).json({
                        status: false,
                        errMessage: 'User is not exits',
                        refresh: true,
                    })
                }
                if (user && (user.roleId == 'R4' || user.roleId == 'R1')) {
                    req.user = user
                    next()

                } else {
                    return res.status(404).json({
                        status: false,
                        errMessage: 'Bạn không có đủ quyền',
                        refresh: true,
                    })
                }

            })
        } else {
            return res.status(401).json({
                status: false,
                errMessage: "You're not authentication!",
                refresh: true,
            })
        }
    },
    refreshToken: async (req, res) => {
        const token = req.headers.authorization;

        if (token) {
            const refreshToken = token.split(' ')[1];

            jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, payload) => {
                if (err) {
                    return res.status(403).json({
                        status: false,
                        errMessage: 'Refresh Token is not valid!',
                        refresh: true,
                    });
                }

                const user = await db.User.findOne({ where: { id: payload.sub } });
                if (!user) {
                    return res.status(404).json({
                        status: false,
                        errMessage: 'User does not exist',
                        refresh: true,
                    });
                }

                const newAccessToken = CommonUtils.encodeToken(user.id);
                const newRefreshToken = CommonUtils.encodeRefreshToken(user.id);

                return res.status(200).json({
                    status: true,
                    token: newAccessToken,
                    refreshToken:newRefreshToken,
                    message: 'Access Token refreshed successfully',
                });
            });
        } else {
            return res.status(401).json({
                status: false,
                message: "You're not authenticated!",
                refresh: true,
            });
        }
    }
}

module.exports = middlewareControllers
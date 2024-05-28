import JWT from 'jsonwebtoken'
require('dotenv').config();

let encodeToken = (userId) =>{
    return JWT.sign({
        iss: 'Thanh Son',
        sub: userId,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() +3)
    },process.env.JWT_SECRET)

}
let encodeRefreshToken = (userId) => {
    return JWT.sign({
        iss: 'Thanh Son',
        sub: userId,
        iat: new Date().getTime(),
        exp: new Date().setDate(new Date().getDate() + 7) // 7 days expiration for refresh token
    }, process.env.JWT_REFRESH_SECRET);
};
module.exports = {
    encodeToken:encodeToken,
    encodeRefreshToken:encodeRefreshToken
}
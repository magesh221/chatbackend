const jwt = require('jsonwebtoken')
const keyfile = require('../config/keyfile')
var jwtTokenUser = keyfile.JWT_SECRET;
const jwt_decode = require("jwt-decode");

exports.Authentication = (key) => {
    const payload = { subject: key };
    const expiresInSeconds = 24 * 60 * 60; // (1 day)
    let token = jwt.sign(payload, jwtTokenUser, { expiresIn: expiresInSeconds });
    return token;
}
exports.Authorization = (req, res, next) => {
    if (!req.headers.authorization) {
        res.status(401).json({ status: false, message: "UnAuthorization" });
    } else {
        let token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, jwtTokenUser, (err, payload) => {
            if (payload) {
                let userid = payload.subject;
                req.userId = userid;
                next();
            } else {
                res.status(401).json({ status: false, message: "Unauthorized" });
            }
        });
    }
};
exports.jwtDecode = (token) => {
    try {
        var decoded = jwt_decode.jwtDecode(token, jwtTokenUser);
        return decoded;
    } catch (error) {
        return error
    }

};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apiTokens_1 = require("./apiTokens");
// Authenticates the user according to the token provided
// If the token is not provied it fails
const authenticateUser = (req, res, from) => {
    const token = req.cookies.auth_token;
    if (!token || typeof token !== "string") {
        console.log(`${from} error: MissingToken`);
        res.status(403).send("MissingToken");
        return null;
    }
    // Verify token
    const authtoken = (0, apiTokens_1.verifyAuthToken)(token);
    if (!authtoken) {
        console.log(`${from} error: AuthTokenIvalid`);
        res.status(403).send("AuthTokenInvalid");
        return null;
    }
    return authtoken;
};
exports.default = authenticateUser;

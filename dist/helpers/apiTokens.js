"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuthToken = exports.signAuthToken = exports.verifySignupToken = exports.signSignupToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signupToken_1 = require("../database/models/signupToken");
const authToken_1 = require("../database/models/authToken");
const signSignupToken = (number) => {
    const signedToken = jsonwebtoken_1.default.sign({ number: number }, process.env.JWT_SIGN_SECRET || '', {
        expiresIn: '10m',
    });
    return signedToken;
};
exports.signSignupToken = signSignupToken;
const verifySignupToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SIGN_SECRET || '');
        if ((0, signupToken_1.isSignupToken)(decoded)) {
            return decoded;
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.log(`VerifySignupToken error: ${error}`);
        return null;
    }
};
exports.verifySignupToken = verifySignupToken;
const signAuthToken = (token) => {
    const signedToken = jsonwebtoken_1.default.sign(token, process.env.JWT_AUTH_SECRET || '', {
        expiresIn: '10d',
    });
    return signedToken;
};
exports.signAuthToken = signAuthToken;
const verifyAuthToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_AUTH_SECRET || '');
        if ((0, authToken_1.isAuthToken)(decoded)) {
            return decoded;
        }
        else {
            return null;
        }
    }
    catch (error) {
        console.log(`VerifyAuthToken error: ${error}`);
        return null;
    }
};
exports.verifyAuthToken = verifyAuthToken;

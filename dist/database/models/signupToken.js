"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSignupToken = void 0;
// Helpers
const isSignupToken = (token) => {
    const unsafeCast = token;
    return (unsafeCast.number !== undefined &&
        unsafeCast.iat !== undefined &&
        unsafeCast.exp !== undefined);
};
exports.isSignupToken = isSignupToken;

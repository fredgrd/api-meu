"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthToken = void 0;
// Helpers
const isAuthToken = (token) => {
    const unsafeCast = token;
    return (unsafeCast.id !== undefined &&
        unsafeCast.number !== undefined &&
        unsafeCast.iat !== undefined &&
        unsafeCast.exp !== undefined);
};
exports.isAuthToken = isAuthToken;

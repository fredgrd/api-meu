"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logMongooseError = void 0;
const logMongooseError = (error, path) => {
    const mongooseError = error;
    console.log(`${path} error: ${mongooseError.name} ${mongooseError.message}`);
};
exports.logMongooseError = logMongooseError;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIError = void 0;
var APIError;
(function (APIError) {
    APIError["Internal"] = "InternalError";
    APIError["Environment"] = "EnvironmentError";
    APIError["Service"] = "ServiceError";
    APIError["Forbidden"] = "ForbiddenAccess";
})(APIError = exports.APIError || (exports.APIError = {}));

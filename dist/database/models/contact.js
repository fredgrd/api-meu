"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.areReducedContact = exports.isReducedContact = void 0;
// Helpers
const isReducedContact = (contact) => {
    const unsafeCast = contact;
    return (unsafeCast.id !== undefined &&
        unsafeCast.number !== undefined &&
        unsafeCast.is_user !== undefined);
};
exports.isReducedContact = isReducedContact;
const areReducedContact = (contacts) => {
    const reducedContacts = contacts.reduce((acc, curr) => {
        if ((0, exports.isReducedContact)(curr)) {
            return acc * 1;
        }
        else {
            return acc * 0;
        }
    }, 1);
    return reducedContacts === 1;
};
exports.areReducedContact = areReducedContact;

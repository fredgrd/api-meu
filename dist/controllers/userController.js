"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterContacts = exports.createUser = void 0;
const apiTokens_1 = require("../helpers/apiTokens");
const apiTokens_2 = require("../helpers/apiTokens");
const user_1 = require("../database/models/user");
const errors_1 = require("../database/models/errors");
const authenticateUser_1 = __importDefault(require("../helpers/authenticateUser"));
const contact_1 = require("../database/models/contact");
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.cookies.signup_token;
    const name = req.body.name;
    if (!token || typeof token !== 'string') {
        console.log('CreateUser error: MissingToken');
        res.sendStatus(403);
        return;
    }
    // Verify token
    const signupToken = (0, apiTokens_1.verifySignupToken)(token);
    if (!signupToken) {
        console.log('CreateUser error: NotSignupToken');
        res.status(403).send(errors_1.APIError.Forbidden);
        return;
    }
    try {
        const user = yield user_1.User.create({
            number: signupToken.number,
            name: name,
            avatar_url: `https://ui-avatars.com/api/?size=300&name=${name}&length=1`,
        });
        // Set cookie
        const token = (0, apiTokens_2.signAuthToken)({
            id: user.id,
            number: user.number,
        });
        res.cookie('auth_token', token, {
            maxAge: 60 * 60 * 24 * 10 * 1000,
            httpOnly: true,
            secure: true,
            domain: 'api.dinolab.one',
        });
        res.clearCookie('signup_token');
        res.status(200).json({
            id: user.id,
            number: user.number,
            name: user.name,
            avatar_url: user.avatar_url,
            created_at: user.created_at,
        });
    }
    catch (error) {
        const mongooseError = error;
        console.log(`CreateUser error: ${mongooseError.message}`);
        res.status(500).send(errors_1.APIError.Internal);
    }
});
exports.createUser = createUser;
const filterContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authToken = (0, authenticateUser_1.default)(req, res, 'UserController/filterContacts');
    if (!authToken) {
        return;
    }
    const contacts = req.body.contacts;
    if (contacts && (0, contact_1.areReducedContact)(contacts)) {
        try {
            const users = yield user_1.User.find({
                number: { $in: contacts.map((e) => e.number) },
            }).select('number');
            const reducedContacts = [];
            for (const user of users) {
                const contact = contacts.find((e) => e.number === user.number);
                if (contact) {
                    contact.is_user = true;
                    reducedContacts.push(contact);
                }
            }
            res.status(200).send({ contacts: reducedContacts });
        }
        catch (error) {
            const mongooseError = error;
            console.log(`UserController/filterContacts error: ${mongooseError.name} ${mongooseError.message}`);
            res.status(500).send(errors_1.APIError.Internal);
        }
    }
    else {
        res.status(400).send('No contacts provided');
    }
});
exports.filterContacts = filterContacts;

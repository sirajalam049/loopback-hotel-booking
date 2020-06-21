'use strict';

const _ = require('lodash');
const HTTP_STATUS_CODES = require('http-status-codes');

module.exports = function (User) {
    // Validate the token
    User.me = async function (req) {
        const userId = _.get(req, 'accessToken.userId');
        if (!userId) throw ({ statusCode: HTTP_STATUS_CODES.BAD_REQUEST });
        return await User.findById(userId).catch(error => { throw error; });
    };
    User.remoteMethod(
        'me',
        {
            accepts: [{ arg: 'req', type: 'object', http: { source: 'req' } }],
            returns: { arg: 'response', type: 'object', root: true, description: 'Will give the logged in user object' },
            http: { path: '/me', verb: 'GET' },
        },
    );

    // User signup
    User.signup = async function (user, next) {
        if (await User.isRegistered(user.email)) throw { statusCode: HTTP_STATUS_CODES.CONFLICT, message: 'Email is already registered' };
        user = _.pick(user, ['firstName', 'lastName', 'email', 'password']);
        if ((user.firstName || user.lastName)) user.name = user.firstName + ' ' + user.lastName;
        return await User.upsertWithWhere({ email: user.email }, user).catch(error => { console.log('error', error); throw error; });
    };
    User.remoteMethod(
        'signup',
        {
            accepts: [{ arg: 'user', type: 'object', http: { source: 'body' } }],
            returns: { arg: 'response', type: 'object', root: true },
            http: { path: '/signup', verb: 'POST' },
        },
    );

    // Check is the user is already registered or not
    User.isRegistered = async (email) => {
        if (!email) throw { statusCode: HTTP_STATUS_CODES.BAD_REQUEST, message: 'Email is required' };
        return !_.isEmpty(await User.findOne({ where: { email } }).catch(error => { console.log('Error', error); throw error; }));
    };

    User.remoteMethod(
        'isRegistered',
        {
            description: 'check if user is registered by email',
            accepts: [{ arg: 'email', type: 'string', required: true }],
            returns: { arg: 'response', type: 'boolean', root: true },
            http: { path: '/isRegistered', verb: 'GET' },
        },
    );
};

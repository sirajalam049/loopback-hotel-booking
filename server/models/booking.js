'use strict';

const { BAD_REQUEST } = require("http-status-codes");

module.exports = function (Booking) {
    Booking.beforeValidate = function (next, modelInstance) {
        const { inDraft, numberOfNights, numberOfRooms, date } = modelInstance;
        console.log({ modelInstance });
        if (!date) throw { statusCode: BAD_REQUEST, message: "Date cannot be empty" };
        if (modelInstance.inDraft) {
            next();
        }
        else {
            if (!numberOfNights) throw { statusCode: BAD_REQUEST, message: "Number of nights cannot be empty or zero" };
            if (!numberOfRooms) throw { statusCode: BAD_REQUEST, message: "Number of rooms cannot be empty or zero" };
            next();
        }
    };
};

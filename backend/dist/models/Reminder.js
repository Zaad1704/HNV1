"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
status: {
    type: String,
    ;
    let ;
    (function () {
    })( || ( = {}));
    ['active', 'inactive', 'sent', 'failed'],
    ;
    'active';
}
lastSentDate: {
    type: Date;
}
sentCount: {
    type: Number, ;
    0;
}
{
    timestamps: true;
}
;
exports.default = mongoose_1.model;
exports.default = (0, mongoose_1.model)('Reminder', ReminderSchema);

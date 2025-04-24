"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const utils_1 = require("../lib/utils");
const errorHandler = (err, req, res, next) => {
    console.log("Unexpected Server Error: ", err);
    if ((0, utils_1.isError)(err)) {
        res.status(500).json({
            message: `Erreur interne du serveur | ${err.message}`,
        });
    }
    else {
        res.status(500).json({
            message: "Erreur inconnue du serveur",
        });
    }
};
exports.errorHandler = errorHandler;

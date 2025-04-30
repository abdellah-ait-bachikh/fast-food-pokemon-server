"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const file_controller_1 = require("../controller/file.controller");
const fileRouter = (0, express_1.Router)();
fileRouter.get('/images/:imageName', file_controller_1.getImageByName);
exports.default = fileRouter;

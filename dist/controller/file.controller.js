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
exports.getImageByName = void 0;
const utils_1 = require("../lib/utils");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.getImageByName = (0, utils_1.asyncHandler)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { imageName } = req.params;
    const imagePath = path_1.default.join(__dirname, "../../uploads/images/categories", imageName);
    if (fs_1.default.existsSync(imagePath)) {
        console.log("exist");
        res.sendFile(imagePath);
    }
    else {
        console.log(" not exist");
        res.status(404).json({ message: "Image not found." });
    }
}));

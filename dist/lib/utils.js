"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.isError = void 0;
exports.deleteFile = deleteFile;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const isError = (err) => {
    return (err instanceof Error &&
        typeof err === "object" &&
        typeof err.message === "string");
};
exports.isError = isError;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
function deleteFile(fileName, folderPath) {
    if (fileName === undefined)
        return;
    const filePath = path_1.default.join(folderPath, fileName);
    fs_1.default.unlink(filePath, (err) => {
        if (err) {
            console.error(`❌ Failed to delete file: ${filePath}`, err.message);
        }
        else {
            console.log(`✅ File deleted: ${filePath}`);
        }
    });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = exports.isError = void 0;
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

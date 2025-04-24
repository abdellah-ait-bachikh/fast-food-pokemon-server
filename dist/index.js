"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const home_route_1 = __importDefault(require("./router/home.route"));
const errorHandler_1 = require("./middlewares/errorHandler");
(0, dotenv_1.config)();
const PORT = process.env.PORT;
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
};
const io = new socket_io_1.Server(server, { cors: corsOptions });
app.use(express_1.default.json());
app.use((0, cors_1.default)(corsOptions));
io.on("connection", (socket) => {
    console.log(`user connecte withe id : ${socket.id}`);
    io.on("disconnect", () => {
        console.log(`user disconnected with id : ${socket.id}`);
    });
});
//routers
app.use("/api/home", home_route_1.default);
app.use(errorHandler_1.errorHandler);
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
// export function startServer() {
//   app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
//   });
// }

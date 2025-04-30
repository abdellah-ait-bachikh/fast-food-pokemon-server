import { PrismaClient } from "@prisma/client";
import express from "express";
import cors, { CorsOptions } from "cors";
import { config } from "dotenv";
import http from "http";
import { Server, Socket } from "socket.io";
import homeRouter from "./router/home.route";
import { errorHandler } from "./middlewares/errorHandler";
import categoryRoutes from "./router/category.route";
import fileRouter from "./router/files.route";

config();
const PORT = process.env.PORT;
const app = express();
const server = http.createServer(app);
const corsOptions: CorsOptions = {
  origin: "*",
  methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
};

const io = new Server(server, { cors: corsOptions });

app.use(express.json());
app.use(cors(corsOptions));

io.on("connection", (socket: Socket) => {
  console.log(`user connecte withe id : ${socket.id}`);

  io.on("disconnect", () => {
    console.log(`user disconnected with id : ${socket.id}`);
  });
});

//routers
app.use("/api/files", fileRouter);
app.use("/api/home", homeRouter);
app.use("/api/categories", categoryRoutes);

app.use(errorHandler);
// server.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });

export function startServer() {
  if (process.env.NODE_ENV === 'development') {
    console.log(" raning in development");
  } else if (process.env.NODE_ENv === "production") {
    console.log(" raning in production");
  }
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();

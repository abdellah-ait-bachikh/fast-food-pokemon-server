import { PrismaClient } from "@prisma/client";
import express, { Request, Response } from "express";
const db = new PrismaClient();
const app = express();

app.get("/api/users", async (req: Request, res: Response) => {
  const user = await  db.user.create({
    data: {
      name: "test user ",
    },
  });
  const users = await db.user.findMany();
  res.json({ message: "hello user", users });
});
app.get("/api/test", async (req: Request, res: Response) => {
  res.json({ message: "hello test" });
});
app.get("/api/helow", async (req: Request, res: Response) => {
  res.json({ message: "hello helow" });
});

const PORT = process.env.PORT || 3000;

export function startServer() {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

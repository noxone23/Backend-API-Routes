import express from "express";

import { errorHandler, notFoundHandler } from "./middleware/errors";
import { booksRouter } from "./routes/books";

export const app = express();

app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/books", booksRouter);

app.use(notFoundHandler);
app.use(errorHandler);

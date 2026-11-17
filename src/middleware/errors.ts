import type { NextFunction, Request, Response } from "express";

export function notFoundHandler(_request: Request, response: Response): void {
  response.status(404).json({ error: "Not found" });
}

function isJsonParseError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "type" in error &&
    error.type === "entity.parse.failed"
  );
}

// Express only treats a function with four parameters as an error handler.
export function errorHandler(
  error: unknown,
  _request: Request,
  response: Response,
  next: NextFunction
): void {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (isJsonParseError(error)) {
    response.status(400).json({ error: "Invalid JSON" });
    return;
  }

  // Details stay in the server log, the client only gets a generic message.
  console.error(error);
  response.status(500).json({ error: "Internal server error" });
}

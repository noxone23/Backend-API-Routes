import { STATUSES, type NewBook, type Status } from "./types";

export type ValidationResult =
  | { ok: true; value: NewBook }
  | { ok: false; error: string };

export function isStatus(value: unknown): value is Status {
  return typeof value === "string" && STATUSES.includes(value as Status);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validates the body of POST and PUT. Only known fields are copied, so an `id` is ignored. */
export function validateBookInput(body: unknown): ValidationResult {
  if (!isRecord(body)) {
    return { ok: false, error: "Body must be a JSON object" };
  }

  const { title, author, status = "want-to-read", rating = null, notes = "" } = body;

  if (typeof title !== "string" || title.trim() === "") {
    return { ok: false, error: "title must be a non-empty text" };
  }

  if (typeof author !== "string" || author.trim() === "") {
    return { ok: false, error: "author must be a non-empty text" };
  }

  if (!isStatus(status)) {
    return { ok: false, error: `status must be one of: ${STATUSES.join(", ")}` };
  }

  if (
    rating !== null &&
    (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5)
  ) {
    return { ok: false, error: "rating must be null or an integer from 1 to 5" };
  }

  if (typeof notes !== "string") {
    return { ok: false, error: "notes must be a text" };
  }

  return {
    ok: true,
    value: {
      title: title.trim(),
      author: author.trim(),
      status,
      rating,
      notes,
    },
  };
}

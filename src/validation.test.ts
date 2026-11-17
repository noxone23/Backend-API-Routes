import { describe, expect, test } from "vitest";

import { isStatus, validateBookInput } from "./validation";

const valid = { title: "Dune", author: "Frank Herbert" };

describe("validateBookInput", () => {
  test("sets the defaults for title and author only", () => {
    expect(validateBookInput(valid)).toEqual({
      ok: true,
      value: {
        title: "Dune",
        author: "Frank Herbert",
        status: "want-to-read",
        rating: null,
        notes: "",
      },
    });
  });

  test("accepts all fields", () => {
    const body = { ...valid, status: "done", rating: 5, notes: "Great" };
    expect(validateBookInput(body)).toEqual({ ok: true, value: body });
  });

  test("trims title and author in the result", () => {
    expect(validateBookInput({ title: "  Dune  ", author: " Frank Herbert " })).toEqual({
      ok: true,
      value: expect.objectContaining({ title: "Dune", author: "Frank Herbert" }),
    });
  });

  test("keeps notes as they are", () => {
    const result = validateBookInput({ ...valid, notes: "  line 1\nline 2  " });
    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({ notes: "  line 1\nline 2  " }),
    });
  });

  test("ignores unknown fields, so a client cannot set the id", () => {
    const result = validateBookInput({ ...valid, id: "hacked", admin: true });
    expect(result).toEqual({ ok: true, value: expect.not.objectContaining({ id: "hacked" }) });
    if (result.ok) {
      expect(Object.keys(result.value).sort()).toEqual(
        ["author", "notes", "rating", "status", "title"]
      );
    }
  });

  test.each([
    ["null", null],
    ["undefined (no body)", undefined],
    ["a list", []],
    ["a list of objects", [valid]],
    ["a string", "text"],
    ["a number", 5],
    ["a boolean", true],
  ])("rejects a body that is %s", (_name, body) => {
    expect(validateBookInput(body)).toEqual({ ok: false, error: expect.any(String) });
  });

  describe("title", () => {
    test.each([
      ["missing", undefined],
      ["empty", ""],
      ["spaces only", "   "],
      ["a number", 5],
      ["null", null],
      ["a list", ["Dune"]],
      ["an object", { text: "Dune" }],
    ])("rejects a title that is %s", (_name, title) => {
      expect(validateBookInput({ ...valid, title }).ok).toBe(false);
    });
  });

  describe("author", () => {
    test.each([
      ["missing", undefined],
      ["empty", ""],
      ["spaces only", "   "],
      ["a number", 5],
      ["null", null],
    ])("rejects an author that is %s", (_name, author) => {
      expect(validateBookInput({ ...valid, author }).ok).toBe(false);
    });
  });

  describe("status", () => {
    test.each(["want-to-read", "reading", "done"])("accepts %s", (status) => {
      expect(validateBookInput({ ...valid, status }).ok).toBe(true);
    });

    test.each([
      ["an unknown value", "finished"],
      ["a different case", "Done"],
      ["an empty text", ""],
      ["a number", 1],
      ["null", null],
    ])("rejects %s", (_name, status) => {
      expect(validateBookInput({ ...valid, status }).ok).toBe(false);
    });
  });

  describe("rating", () => {
    test.each([null, 1, 2, 3, 4, 5])("accepts %s", (rating) => {
      expect(validateBookInput({ ...valid, rating })).toEqual({
        ok: true,
        value: expect.objectContaining({ rating }),
      });
    });

    test.each([
      ["0", 0],
      ["6", 6],
      ["-1", -1],
      ["3.5", 3.5],
      ["the text '4'", "4"],
      ["a boolean", true],
      ["a list", [4]],
      ["an object", { value: 4 }],
    ])("rejects %s", (_name, rating) => {
      expect(validateBookInput({ ...valid, rating }).ok).toBe(false);
    });
  });

  describe("notes", () => {
    test.each([
      ["a number", 5],
      ["null", null],
      ["a list", ["a"]],
    ])("rejects notes that are %s", (_name, notes) => {
      expect(validateBookInput({ ...valid, notes }).ok).toBe(false);
    });
  });

  test("returns an error message that names the field", () => {
    expect(validateBookInput({ ...valid, rating: 6 })).toEqual({
      ok: false,
      error: expect.stringContaining("rating"),
    });
  });
});

describe("isStatus", () => {
  test.each(["want-to-read", "reading", "done"])("accepts %s", (value) => {
    expect(isStatus(value)).toBe(true);
  });

  test.each([undefined, null, "", "Done", "finished", 1, ["done"]])(
    "rejects %s",
    (value) => {
      expect(isStatus(value)).toBe(false);
    }
  );
});

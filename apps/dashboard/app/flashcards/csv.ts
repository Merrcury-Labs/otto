import type { Flashcard } from "./types";

type CsvRow = string[];

function parseRows(source: string): CsvRow[] {
  const rows: CsvRow[] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (character === '"') {
      if (quoted && source[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && source[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  if (quoted) {
    throw new Error("The CSV contains an unclosed quoted field.");
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function normalizeHeader(value: string): string {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase();
}

function findColumn(headers: string[], names: string[]): number {
  return headers.findIndex((header) => names.includes(header));
}

export function parseFlashcardsCsv(source: string): Flashcard[] {
  const rows = parseRows(source);
  if (rows.length < 2) {
    throw new Error("The CSV must contain a header and at least one card.");
  }

  const headers = rows[0]!.map(normalizeHeader);
  const frontColumn = findColumn(headers, ["front", "question", "prompt"]);
  const backColumn = findColumn(headers, ["back", "answer", "response"]);
  const hintColumn = findColumn(headers, ["hint"]);
  const tagsColumn = findColumn(headers, ["tags", "tag"]);

  if (frontColumn < 0 || backColumn < 0) {
    throw new Error(
      'The CSV needs "front" and "back" columns (or "question" and "answer").'
    );
  }

  return rows.slice(1).map((row, index) => {
    const front = (row[frontColumn] ?? "").trim();
    const back = (row[backColumn] ?? "").trim();
    if (!front || !back) {
      throw new Error(`Row ${index + 2} must have both front and back content.`);
    }

    return {
      id: `csv-${Date.now()}-${index}`,
      front,
      back,
      position: index,
      hint: hintColumn >= 0 ? (row[hintColumn] ?? "").trim() : "",
      tags:
        tagsColumn >= 0
          ? (row[tagsColumn] ?? "")
              .split(/[;,]/)
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
    };
  });
}

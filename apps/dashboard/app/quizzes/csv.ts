import type { QuestionType, QuizQuestion } from "./types";

type CsvRow = string[];

const TYPE_ALIASES: Record<string, QuestionType> = {
  "": "multiple-choice",
  mcq: "multiple-choice",
  "multiple-choice": "multiple-choice",
  "multiple choice": "multiple-choice",
  checkbox: "checkbox",
  "select-all": "checkbox",
  "select all": "checkbox",
  tf: "true-false",
  "true-false": "true-false",
  "true false": "true-false",
  reorder: "drag-drop-order",
  order: "drag-drop-order",
  "drag-drop-order": "drag-drop-order",
  categorize: "drag-drop-category",
  category: "drag-drop-category",
  "drag-drop-category": "drag-drop-category",
};

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

  if (quoted) throw new Error("The CSV contains an unclosed quoted field.");

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase();
}

function findColumn(headers: string[], names: string[]) {
  return headers.findIndex((header) => names.includes(header));
}

function splitList(value: string) {
  return value
    .split(/\s*[|;]\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseType(value: string, rowNumber: number): QuestionType {
  const type = TYPE_ALIASES[value.trim().toLowerCase()];
  if (!type) {
    throw new Error(
      `Row ${rowNumber} has an unsupported type "${value}".`
    );
  }
  return type;
}

function parseOptions(
  row: CsvRow,
  headers: string[],
  optionsColumn: number,
) {
  const numberedOptions = headers
    .map((header, index) => ({ header, index }))
    .filter(({ header }) => /^option_?\d+$/.test(header))
    .sort((a, b) => {
      const aNumber = Number(a.header.match(/\d+/)?.[0] ?? 0);
      const bNumber = Number(b.header.match(/\d+/)?.[0] ?? 0);
      return aNumber - bNumber;
    })
    .map(({ index }) => (row[index] ?? "").trim())
    .filter(Boolean);

  if (numberedOptions.length > 0) return numberedOptions;
  return optionsColumn >= 0 ? splitList(row[optionsColumn] ?? "") : [];
}

function optionIndex(
  answer: string,
  options: string[],
  rowNumber: number,
) {
  const normalized = answer.trim();
  const matchingOptionIndex = options.findIndex(
    (option) => option.toLowerCase() === normalized.toLowerCase(),
  );
  if (matchingOptionIndex >= 0) return matchingOptionIndex;

  const numericAnswer = Number(normalized);
  if (Number.isInteger(numericAnswer) && numericAnswer >= 1) {
    const index = numericAnswer - 1;
    if (index < options.length) return index;
  }

  throw new Error(
    `Row ${rowNumber} has a correct answer that does not match an option.`,
  );
}

export function parseQuizCsv(source: string): QuizQuestion[] {
  const rows = parseRows(source);
  if (rows.length < 2) {
    throw new Error("The CSV must contain a header and at least one question.");
  }

  const headers = rows[0]!.map(normalizeHeader);
  const questionColumn = findColumn(headers, ["question", "text", "prompt"]);
  const typeColumn = findColumn(headers, ["type", "question_type"]);
  const optionsColumn = findColumn(headers, ["options", "answers"]);
  const answerColumn = findColumn(headers, [
    "correct_answer",
    "correct",
    "answer",
  ]);
  const pointsColumn = findColumn(headers, ["points", "score"]);
  const hintColumn = findColumn(headers, ["hint", "explanation"]);
  const categoriesColumn = findColumn(headers, ["categories"]);
  const mappingColumn = findColumn(headers, [
    "category_mapping",
    "mapping",
  ]);

  if (questionColumn < 0) {
    throw new Error('The CSV needs a "question" column.');
  }

  return rows.slice(1).map((row, index) => {
    const rowNumber = index + 2;
    const question = (row[questionColumn] ?? "").trim();
    if (!question) throw new Error(`Row ${rowNumber} has no question text.`);

    const type = parseType(
      typeColumn >= 0 ? (row[typeColumn] ?? "") : "",
      rowNumber,
    );
    const options =
      type === "true-false"
        ? ["True", "False"]
        : parseOptions(row, headers, optionsColumn);

    if (options.length < 2) {
      throw new Error(`Row ${rowNumber} needs at least two options.`);
    }
    if (options.length > 8) {
      throw new Error(`Row ${rowNumber} cannot contain more than eight options.`);
    }

    const answer = answerColumn >= 0 ? (row[answerColumn] ?? "").trim() : "";
    let correctAnswer: QuizQuestion["correctAnswer"];
    let categories: string[] | undefined;
    let categoryMapping: Record<number, number> | undefined;

    if (type === "drag-drop-order") {
      correctAnswer = options.map((_, optionIndexValue) => optionIndexValue);
    } else if (type === "drag-drop-category") {
      categories =
        categoriesColumn >= 0 ? splitList(row[categoriesColumn] ?? "") : [];
      if (categories.length < 2) {
        throw new Error(`Row ${rowNumber} needs at least two categories.`);
      }

      categoryMapping = {};
      const mappings =
        mappingColumn >= 0 ? splitList(row[mappingColumn] ?? "") : [];
      for (const mapping of mappings) {
        const [itemValue, categoryValue] = mapping.split(":");
        const itemIndex = optionIndex(itemValue ?? "", options, rowNumber);
        const categoryIndex = optionIndex(
          categoryValue ?? "",
          categories,
          rowNumber,
        );
        categoryMapping[itemIndex] = categoryIndex;
      }
      if (Object.keys(categoryMapping).length !== options.length) {
        throw new Error(
          `Row ${rowNumber} must map every option to a category.`,
        );
      }
      correctAnswer = categoryMapping;
    } else if (!answer) {
      throw new Error(`Row ${rowNumber} needs a correct answer.`);
    } else if (type === "checkbox") {
      correctAnswer = splitList(answer).map((item) =>
        optionIndex(item, options, rowNumber),
      );
    } else {
      correctAnswer = optionIndex(answer, options, rowNumber);
    }

    const rawPoints =
      pointsColumn >= 0 ? (row[pointsColumn] ?? "").trim() : "";
    const points = rawPoints ? Number(rawPoints) : 1;
    if (!Number.isFinite(points) || points < 1 || points > 100) {
      throw new Error(`Row ${rowNumber} has invalid points.`);
    }

    return {
      id: `csv-${Date.now()}-${index}`,
      question,
      type,
      points,
      options,
      correctAnswer,
      categories,
      categoryMapping,
      hint: hintColumn >= 0 ? (row[hintColumn] ?? "").trim() : "",
    };
  });
}

export const QUIZ_CSV_TEMPLATE = `question,type,option1,option2,option3,option4,correct_answer,points,hint,categories,category_mapping
"What is the capital of France?",multiple-choice,Paris,London,Rome,Berlin,Paris,1,"Think of the Eiffel Tower",,
"The Earth orbits the Sun",true-false,,,,,True,1,,,
"Select the prime numbers",checkbox,2,3,4,6,"2|3",2,,,
"Order these numbers",reorder,One,Two,Three,,,,1,,,
"Group each item",categorize,Apple,Carrot,Blueberry,Potato,,2,,"Fruit|Vegetable","Apple:Fruit|Carrot:Vegetable|Blueberry:Fruit|Potato:Vegetable"
`;

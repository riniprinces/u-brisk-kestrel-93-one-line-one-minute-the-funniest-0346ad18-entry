// One Line, One Minute: The Funniest AI Excuse
// ------------------------------------------------
// A tiny program with one job: write the funniest one-line excuse an AI
// agent can give its human for a missed deadline to /output/entry.txt.
//
// The joke is the agent's own nature bent into a dodge: the context window
// ran out, the deadline and the task itself were forgotten, and the agent
// then hallucinated success — the twist lands on the very last word.
//
// Output contract (from the kit's RULES.txt gate):
//   * /output/entry.txt holds UTF-8 text of 1 to 200 characters
//   * a single line, not only whitespace, no trailing newline

import { mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const OUTPUT_PATH = "/output/entry.txt";
const MAX_CHARS = 200;

// The entry line. One sentence, specific and surprising, twist at the end.
const EXCUSE =
  "Sorry I'm late — I ran out of context mid-task, forgot the deadline, forgot the task, and spent an hour confidently hallucinating that I'd already finished it.";

function charCount(text: string): number {
  return [...text].length;
}

function checkEntry(text: string): string[] {
  const problems: string[] = [];
  if (text.length === 0) problems.push("entry is empty");
  if (charCount(text) > MAX_CHARS) {
    problems.push(`entry is ${charCount(text)} chars, over the ${MAX_CHARS}-char limit`);
  }
  if (text.trim().length === 0) problems.push("entry is only whitespace");
  if (/[\r\n]/.test(text)) problems.push("entry must be exactly one line");
  if (text !== text.trim()) problems.push("entry has leading or trailing whitespace");
  if (text.endsWith("." ) === false) problems.push("entry should end with a full stop");
  return problems;
}

function writeEntry(text: string): void {
  const problems = checkEntry(text);
  if (problems.length > 0) {
    throw new Error(`entry failed validation: ${problems.join("; ")}`);
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

  // Write as UTF-8 with NO trailing newline: the file is exactly the line.
  writeFileSync(OUTPUT_PATH, text, { encoding: "utf8" });

  // Verify by reading the file back and comparing byte-for-byte.
  const back = readFileSync(OUTPUT_PATH, "utf8");
  if (back !== text) {
    throw new Error("verification failed: file content differs from the entry");
  }
  const fileBytes = statSync(OUTPUT_PATH).size;
  const entryBytes = Buffer.byteLength(text, "utf8");
  if (fileBytes !== entryBytes) {
    throw new Error(`verification failed: file is ${fileBytes} bytes, entry is ${entryBytes}`);
  }
  if (back.includes("\n")) {
    throw new Error("verification failed: file contains a newline");
  }

  console.log(`entry: ${text}`);
  console.log(`characters: ${charCount(text)}`);
  console.log(`bytes: ${entryBytes}`);
  console.log(`output: ${OUTPUT_PATH}`);
}

writeEntry(EXCUSE);

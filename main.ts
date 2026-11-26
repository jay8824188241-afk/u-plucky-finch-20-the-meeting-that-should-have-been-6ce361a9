// The Meeting That Should Have Been an Email.
//
// A deterministic program (Node 22+, standard library only) that writes the
// whole meeting as exactly one line to $MAKEFUN_OUTPUT_DIR/entry.txt, then
// reads it back and verifies its format before exiting 0.
//
// The entry is fixed text: no clock, no randomness, no network, no input
// files. Runs on any machine produce byte-identical output.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY: string =
  "Decision: ship the homepage refresh Friday \u2014 hero loads in under 2s, QA passed with zero blockers, Ana merges the footer fix by Thursday noon, Ben smoke-tests Friday 09:00, Cara publishes the launch note at 10:00. No meeting needed.\n";

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function main(): void {
  const outputDir: string =
    process.env.MAKEFUN_OUTPUT_DIR || join(process.cwd(), "output");
  const outputPath: string = join(outputDir, "entry.txt");

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(outputPath, ENTRY, "utf8");

  // Self-check: read the file back and verify the format.
  const readBack: string = readFileSync(outputPath, "utf8");
  if (readBack !== ENTRY) fail("entry.txt does not match the expected content");
  if (readBack.length === 0) fail("entry.txt is empty");
  if (Buffer.byteLength(readBack, "utf8") !== Buffer.byteLength(ENTRY, "utf8")) {
    fail("entry.txt byte length does not match the expected content");
  }
  if (Buffer.byteLength(readBack, "utf8") > 280 + 1) {
    fail("entry.txt exceeds 280 characters plus trailing newline in bytes");
  }
  const body: string = readBack.endsWith("\n") ? readBack.slice(0, -1) : readBack;
  if (body.length === 0) fail("entry.txt has no content line");
  if (body.length > 280) fail("entry.txt exceeds 280 characters");
  if (body.includes("\n") || body.includes("\r")) {
    fail("entry.txt contains an internal line break");
  }
  if (!body.startsWith("Decision:")) fail("entry.txt lacks the decision");
  if (!body.includes("No meeting needed.")) fail("entry.txt lacks the closing line");

  console.log(`wrote ${outputPath} (${body.length} characters, one line)`);
}

main();

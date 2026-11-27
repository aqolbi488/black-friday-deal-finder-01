// Entry point for the black-friday-deal-finder-01 hand-in (Node 22, standard library only).
// The site itself is the static app/ folder beside this file. This program copies app/ and
// screenshots/ to the output directory (/output in the grader, MAKEFUN_OUTPUT_DIR locally) and
// writes dossier.json there with the vendored buildDossier, using the scorer's own caps so the
// local dossier matches the one the gate rebuilds byte for byte.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const root = fileURLToPath(new URL(".", import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

mkdirSync(out, { recursive: true });
cpSync(join(root, "app"), join(out, "app"), { recursive: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
if (existsSync(join(root, "screenshots"))) {
  cpSync(join(root, "screenshots"), join(out, "screenshots"), { recursive: true });
}

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(out, "dossier.json"), dossier);

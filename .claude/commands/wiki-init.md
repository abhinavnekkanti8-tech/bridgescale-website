# Initialize Wiki Compiler

Set up the wiki-compiler for this project by generating `.wiki-compiler.json`.

## Instructions

Ask **one question at a time**, waiting for user responses before proceeding.

### Step 1: Check for existing config

Look for `.wiki-compiler.json` in the project root. If found, ask: "A wiki config already exists. Reinitialize? (y/n)"

### Step 2: Detect project type

Auto-detect whether this is a **codebase** project or **knowledge** project:
- **Codebase** — has `package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`, or similar manifest files
- **Knowledge** — primarily markdown directories without code manifests

---

## Codebase Mode

For code projects, streamline to three steps:

**Auto-detect:**
- Identify language, frameworks, and modules
- Find documentation files: `README.md`, `CLAUDE.md`, `AGENTS.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, ADR files, `openapi.yaml/json`, `.proto`, `.graphql` files
- Find key config files: `docker-compose.yml`, `Dockerfile`, `.env.example`, `package.json`, `go.mod`

**Present findings:** Show a summary with proposed config:
- Project name (from package.json/manifest or directory name)
- Source directories to scan
- Output directory (default: `wiki/`)
- Mode: `recommended`
- Article sections: `Purpose`, `Architecture`, `Talks To`, `API Surface`, `Data`, `Key Decisions`, `Gotchas`

**Single confirmation:** "Proceed with this config? (y/n/customize)"

If yes → write `.wiki-compiler.json` and immediately run `/wiki-compile`.

---

## Knowledge Mode

For markdown-heavy projects, run 7 interactive steps:

1. **Source selection** — "Which directories contain the knowledge to compile?" (list candidates)
2. **Naming** — "What should this knowledge base be called?"
3. **Output location** — "Where should compiled wiki articles go?" (default: `wiki/`)
4. **Structure proposal** — Sample 3-5 source files, propose article sections tailored to content
5. **Integration mode** — "How should the wiki integrate?"
   - `staging` — supplements context, consult when needed
   - `recommended` — read topic articles before raw files
   - `primary` — wiki is the main knowledge source
6. **Stale detection** — "Auto-prompt when sources change?" (off/prompt)
7. **Generate config** — Write `.wiki-compiler.json`

---

## Config Format

```json
{
  "name": "<project name>",
  "mode": "recommended",
  "output": "wiki/",
  "sources": [
    { "path": "<relative-dir>", "type": "docs" }
  ],
  "article_sections": ["Purpose", "Architecture", "Talks To", "API Surface", "Data", "Key Decisions", "Gotchas"],
  "auto_update": "prompt",
  "wiki_mode": "codebase"
}
```

After writing config, tell the user: "Config saved. Run `/wiki-compile` to build your knowledge base."

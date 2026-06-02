# Wiki Compiler Skill

Transforms source files into topic-based wiki articles. Called by `/wiki-compile`.

## Compilation Algorithm

### Phase 1 — Scan sources

Read configured `sources[]` from `.wiki-compiler.json`. Compare against `.compile-state.json` (if it exists) to identify new or changed files.

- **Knowledge mode** (`wiki_mode: "knowledge"`): process `.md` files
- **Codebase mode** (`wiki_mode: "codebase"`): prioritize `README.md`, `CLAUDE.md`, `AGENTS.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, ADR files, `openapi.yaml/json`, `.proto`, `.graphql`, `docker-compose.yml`, `Dockerfile`, `.env.example`, and manifest files (`package.json`, `go.mod`, `Cargo.toml`, `pyproject.toml`)
- Skip: `node_modules/`, `.git/`, `dist/`, `vendor/`, `__pycache__/`, `.build/`

### Phase 2 — Classify and discover topics

Classify each file into topics based on:
- Content signals (headings, keywords, domain terminology)
- Directory structure (files in the same directory often share a topic)
- Configured hints in `sources[].hints` (if present)
- Existing schema (from `schema.md`) takes precedence — respect existing topic taxonomy

Mark topics as **time-sensitive** (pricing, roadmap, team structure) or **stable** (architecture, data models) — this affects staleness thresholds.

Unclassified files with 3+ shared themes → spawn a new topic.

### Phase 3 — Compile topic articles (run in parallel)

For each affected topic, create or update `{output}/topics/{slug}.md`.

Article structure uses `article_sections` from config. Default sections for codebase mode:
- **Purpose** — what this module/area does and why it exists
- **Architecture** — how it's structured, key components
- **Talks To** — dependencies, integrations, consumers
- **API Surface** — endpoints, exported functions, interfaces
- **Data** — schemas, models, key data structures
- **Key Decisions** — why it was built this way (rationale, tradeoffs)
- **Gotchas** — known pitfalls, edge cases, surprises

Per section, add a coverage tag: `[coverage: high/medium/low]` based on source density.

For time-sensitive sections, add time-decay annotations for claims older than the staleness threshold (6-18 months for volatile topics, 24-48 months for stable ones).

### Phase 3.5 — Discover concept articles

Find cross-cutting patterns that appear in 3+ topics:
- Recurring architectural decisions
- Shared relationship patterns
- Methodology or convention used across modules

Create `{output}/concepts/{slug}.md` for each. Concept articles are interpretive, not just summaries.

### Phase 3.7 — Generate or update schema.md

Write `{output}/schema.md` as the source of truth for wiki structure:
- List all topics with their slugs, aliases, and source files
- List all concepts with their scope
- Record schema evolution log (append-only)

### Phase 4 — Update INDEX.md

Write `{output}/INDEX.md`:
```markdown
# {name} — Wiki Index
Last compiled: {date} | Topics: {N} | Concepts: {M}

## Topics
| Topic | Coverage | Sources | Last Updated |
|-------|----------|---------|--------------|
| [Topic Name](topics/slug.md) | high | 12 | 2024-01-15 |

## Concepts
| Concept | Topics Referenced |
|---------|------------------|
| [Concept Name](concepts/slug.md) | module-a, module-b |
```

### Phase 5 — Update state and log

Write `.compile-state.json`:
```json
{
  "last_compiled": "YYYY-MM-DD",
  "topics": ["slug1", "slug2"],
  "source_hashes": { "path/to/file.md": "sha256hash" }
}
```

Append to `{output}/log.md`:
```
### {date} — Compile
- Topics: {created} created, {updated} updated, {unchanged} unchanged
- Concepts: {N} discovered
- Sources: {N} files processed
```

### Phase 6 — Generate CONTEXT.md (codebase mode, first run only)

Write `{output}/CONTEXT.md` with navigation guidance:
- How to use the wiki (read INDEX.md first, then topic articles)
- When to read raw sources vs. wiki articles
- How to keep the wiki fresh (run `/wiki-compile` after significant changes)

## Key Design Principles

- **Read-only sources**: never modify files outside the configured output directory
- **Time-series preservation**: stale content is flagged with annotations, not deleted
- **Coverage transparency**: every section shows a coverage tag so readers know when to trust the wiki vs. raw sources
- **Parallel efficiency**: Phase 3 topic articles compile in parallel; all other phases run sequentially

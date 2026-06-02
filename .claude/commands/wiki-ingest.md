# Ingest a Single Source

Add a single source file to the wiki through an interactive process.

## Instructions

### Step 1: Validate

- Check `.wiki-compiler.json` exists; if not, tell user to run `/wiki-init` first.
- Accept a file path as argument (e.g., `/wiki-ingest docs/architecture.md`)
- If no argument provided, ask: "Which file do you want to ingest?"
- Verify the file is a markdown document within configured source directories.

### Step 2: Read and discuss

- Read the file and summarize key points (3-5 bullets)
- Ask: "What should I emphasize or de-emphasize from this source?"
- Wait for user guidance before proceeding (unless `--quiet` flag is passed)

### Step 3: Classify

- Read `{output}/schema.md` to see existing topics
- Match the source to existing topics; propose new topics if the content doesn't fit
- Tell the user which topics will be updated or created

### Step 4: Update articles

- Integrate information into relevant topic files, respecting user guidance
- Update source counts in each modified article
- Add a "Sources" reference entry if not already present

### Step 5: Update metadata

- Refresh `schema.md` if new topics were created (log the schema evolution)
- Update `INDEX.md` with any new or updated topics
- Append to `{output}/log.md`:
  ```
  ### {date} — Ingest
  - Source: {file path}
  - Topics updated: {list}
  ```
- Update `.compile-state.json`

### Step 6: Summary

Report all changes: which topics were updated, what sections changed, and whether any new topics were created.

## Arguments

- File path as argument
- No arguments: prompts user for the file path
- `--quiet`: non-interactive, skip user guidance step (for batch operations)

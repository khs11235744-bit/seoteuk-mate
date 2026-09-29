# KHS DevCraft Guard — Seoteuk Mate

## Project
- projectId: `seoteuk`
- base: GitHub `khs11235744-bit/seoteuk-mate`
- local working copy: `C:\Users\권형석\Documents\ChatGPT\seoteuk-mate-v3.8.2`
- target line: v3.9 local-first / lite / full

## Preserve
- Existing v3.8.2 full app behavior.
- Existing dirty work. Never reset / clean / stash / rebase.
- 2026 official record rules and evidence-first validation.
- Existing Firebase/cloud providers in Full mode.

## Local-first rules
1. Student evidence stays between the browser app and local Ollama in Local-only mode.
2. KHS Flow receives only routing/status metadata; never student names, student text, evidence, generated records, or source documents.
3. Local model: `khs-ax7b6k:latest`.
4. Local generation is draft-only. Deterministic validation and teacher review remain authoritative.
5. When local evidence is insufficient, output must say that the evidence is insufficient rather than inventing activity.

## Variants
- Full: existing complete v3.8.x feature set + local A.X option.
- Lite: record writing / validation / batch essentials only. No bundled 12 MB knowledge pack, Firebase, OCR, analytics, demo data.
- Local-only: Lite capabilities, forced local A.X/Ollama, no cloud AI provider or remote data sync.

## Verification gate
- `node tests/smoke.mjs`
- `node tests/teacher-sim-100.mjs`
- `node tests/local-lite.mjs`
- local bridge health
- local A.X generation
- KHS Flow metadata-only route

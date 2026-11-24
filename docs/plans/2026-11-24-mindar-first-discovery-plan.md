# MindAR First Discovery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Give each of the four MindAR birds a first-discovery moment with local birdsong and a per-profile challenge.

**Architecture:** Keep MindAR target detection unchanged and reuse its four target indices. A small data module maps each target to one question; the existing profile helpers remain the source of truth for first discovery and one-time rewards. The React viewer presents a dismissible new-discovery card and audio fallback, then the species challenge.

**Tech Stack:** React, TypeScript, Node test runner, Vite.

---

### Task 1: Define shared challenge content

**Files:**
- Create: `src/data/mindarChallenges.ts`
- Test: `tests/mindarChallenges.test.ts`

**Acceptance:** Four target-indexed questions, each with four answers, a valid correct index, and an explanation; Tucán retains its existing thermoregulation question.

### Task 2: Add first-discovery presentation and shared challenge flow

**Files:**
- Modify: `src/components/ToucanMindARViewer.tsx`
- Test: `tests/scanner.test.ts`

**Acceptance:** Show the central reveal only when registering a new target succeeds; attempt that bird's local audio and expose a replay control; use that target's challenge; suppress repeat reveal and duplicate XP.

### Task 3: Diagnose Tucán's target reliability

**Files:**
- Review: `public/ar/targets.mind`, the supplied compiler feature visualization, and MindAR initialization in `src/components/ToucanMindARViewer.tsx`.

**Acceptance:** Confirm whether configuration differs by target. Do not change detection thresholds or replace/recompile the marker without the actual source image and evidence.

### Task 4: Correct camera framing and startup resolution

**Files:**
- Modify: `src/components/ToucanMindARViewer.tsx`
- Test: `tests/scanner.test.ts`

**Acceptance:** Request an ideal 1280 × 720 stream before MindAR initializes, let MindAR size the video without aspect-ratio overrides, and keep continuous focus optional. If the browser still provides less than 960 × 540, display its actual resolution for diagnosis.

### Task 5: Verify integration

**Files:**
- Review: full test suite, lint, build output.

**Acceptance:** Tests and lint pass; build includes the target and local audio assets; report the physical-camera check separately.

# GitHub Workflow Guide for Assetify
> For beginners — everything you need to manage your plugin development

---

## Branch Structure

```
main      ← stable, published version (what users get from Framer Marketplace)
staging   ← active development (where you build new features)
```

**Rule:** Never build directly on `main`. Always work on `staging`, then merge to `main` when ready to publish.

---

## One-Time Setup (do this once)

### Step 1 — Create the staging branch
Open your terminal in the project folder, then run:

```bash
git checkout main
git checkout -b staging
git push origin staging
```

### Step 2 — Protect main branch on GitHub
1. Go to your repo on GitHub
2. Click **Settings** → **Branches**
3. Click **Add branch protection rule**
4. Type `main` as the branch name
5. Check **"Require a pull request before merging"**
6. Click **Save changes**

This prevents accidentally pushing directly to main.

---

## Daily Development Workflow

### Starting work
```bash
# Always make sure you're on staging first
git checkout staging

# Pull latest changes (good habit)
git pull origin staging
```

### Saving your work (commit + push)
```bash
# See what files changed
git status

# Stage all changes
git add .

# Save with a message describing what you did
git commit -m "fix: navigate usage button not working"

# Push to GitHub
git push origin staging
```

### Commit message format
```
feat: add bandwidth scan feature
fix: video thumbnail not showing
design: update card layout
refactor: clean up framerApi.ts
docs: update CLAUDE.md
```

---

## Releasing a New Version to Marketplace

Do this when a feature is complete and tested:

### Step 1 — Update version number
Open `src/plugin.config.ts` and bump the version:
```ts
export const PLUGIN_VERSION = "2.1.0"  // was 2.0.0
```

### Step 2 — Commit the version bump on staging
```bash
git add .
git commit -m "chore: bump version to 2.1.0"
git push origin staging
```

### Step 3 — Merge staging into main
```bash
git checkout main
git merge staging
git push origin main
```

### Step 4 — Build the plugin
```bash
npm run pack
```

### Step 5 — Submit to Framer Marketplace
Upload the generated zip file to Framer.

### Step 6 — Tag the release on GitHub (optional but good practice)
```bash
git tag v2.1.0
git push origin v2.1.0
```

### Step 7 — Go back to staging
```bash
git checkout staging
```

---

## Working on a Specific Feature

When building something big (takes multiple sessions):

```bash
# Create a feature branch FROM staging
git checkout staging
git checkout -b feature/page-detection

# Build the feature...
git add .
git commit -m "feat: add page detection to navigator"
git push origin feature/page-detection

# When done — merge back into staging
git checkout staging
git merge feature/page-detection

# Clean up the feature branch
git branch -d feature/page-detection
git push origin --delete feature/page-detection
```

---

## Hotfix (urgent bug on published version)

If users report a bug on the live plugin and you need to fix it fast:

```bash
# Branch off main (not staging)
git checkout main
git checkout -b fix/critical-bug

# Fix the bug...
git add .
git commit -m "fix: plugin crashes on empty CMS collection"

# Merge to main immediately
git checkout main
git merge fix/critical-bug
git push origin main

# Also merge the fix into staging so it's not lost
git checkout staging
git merge fix/critical-bug

# Clean up
git branch -d fix/critical-bug
```

---

## Working with Claude (AI) on New Sessions

### Reading files directly from GitHub
Instead of uploading files, paste the raw URL:
```
https://raw.githubusercontent.com/maghassiz/asset-manager-plugin/staging/src/App.tsx
```

**To get the raw URL for any file:**
1. Go to the file on GitHub
2. Click the **Raw** button
3. Copy the URL

### Starting a new chat session
Tell Claude:
> "Here's my Framer plugin repo: https://github.com/maghassiz/asset-manager-plugin
> Please read CLAUDE.md first for context, then read [specific file] from the staging branch."

### Branch-specific raw URLs
```
# staging branch
https://raw.githubusercontent.com/maghassiz/asset-manager-plugin/staging/src/App.tsx

# main branch  
https://raw.githubusercontent.com/maghassiz/asset-manager-plugin/main/src/App.tsx
```

---

## Useful Git Commands Cheatsheet

```bash
# See which branch you're on
git branch

# Switch branch
git checkout staging
git checkout main

# See what changed
git status

# See commit history
git log --oneline

# Undo last commit (keeps your changes)
git reset --soft HEAD~1

# Discard all changes (careful — can't undo)
git checkout -- .

# See difference in a file
git diff src/App.tsx
```

---

## Version Numbering Guide

Use **semantic versioning**: `MAJOR.MINOR.PATCH`

| Change type | Example | Version bump |
|---|---|---|
| Bug fix | Fix nav button | 2.0.0 → 2.0.1 |
| New feature | Add bandwidth tab | 2.0.0 → 2.1.0 |
| Major redesign | Full UI overhaul | 2.0.0 → 3.0.0 |

---

## File Checklist Before Publishing

- [ ] `PLUGIN_VERSION` updated in `plugin.config.ts`
- [ ] `https://YOUR_DOCS_LINK_HERE` replaced with real URL in `App.tsx` and `AboutView.tsx`
- [ ] Supabase test data cleared (run `clear_test_data.sql`)
- [ ] Tested in Framer with real project
- [ ] `npm run pack` builds without errors
- [ ] `CLAUDE.md` updated if architecture changed

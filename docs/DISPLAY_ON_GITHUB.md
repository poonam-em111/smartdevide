# Make Wiki, Issues, and Discussions display at GitHub URLs

This doc explains how the repo is set up so content **displays** at:

- **Wiki:** https://github.com/poonam-em111/smartdevide/wiki  
- **Issues:** https://github.com/poonam-em111/smartdevide/issues (template chooser when you click **New issue**)  
- **Discussions:** https://github.com/poonam-em111/smartdevide/discussions (after enabling; templates when you click **New discussion**)

---

## 1. Issues (templates at `/issues/new`)

**What’s in the repo:**  
`.github/ISSUE_TEMPLATE/` with:

- `bug_report.md` – Bug report
- `feature_request.md` – Feature request  
- `documentation.md` – Documentation or wiki

**What you need to do:**  
Commit and push the repo (including `.github/`) to the **default branch**.  
Then at **https://github.com/poonam-em111/smartdevide/issues** → **New issue**, GitHub will show a dropdown to pick one of these templates.

**Optional:** In the repo create labels `bug`, `enhancement`, `documentation` so the templates can auto-apply them.

---

## 2. Discussions (templates at `/discussions`)

**What’s in the repo:**  
`.github/DISCUSSION_TEMPLATE/` with:

- `general.yml` – for a **General** category (slug: `general`)
- `ideas.yml` – for an **Ideas** category (slug: `ideas`)

**What you need to do:**

1. **Enable Discussions:** Repo **Settings** → **Features** → check **Discussions**.
2. **Create categories** (if needed):  
   Discussions → **New category** → create e.g. **General** and **Ideas** (GitHub may create **General** by default; slug for Ideas is usually `ideas`).
3. **Push the repo** so `.github/DISCUSSION_TEMPLATE/` is on the default branch.

Then at **https://github.com/poonam-em111/smartdevide/discussions** → **New discussion**, users can choose a category and see the form from the matching template.  
The Discussions URL will work (no 404) once Discussions are enabled; it will be empty until someone creates a discussion.

---

## 3. Wiki (pages at `/wiki`, `/wiki/Features`, etc.)

**What’s in the repo:**  
`wiki/` folder with `Home.md`, `Features.md`, `Installation.md`, `Roadmap.md`.  
GitHub’s Wiki is a **separate git repo** (`smartdevide.wiki`), so these files must be **pushed into the wiki repo** for them to show at the Wiki URLs.

**What you need to do:**

1. **Enable Wiki:** Repo **Settings** → **Features** → check **Wiki**.
2. **Create the first page once** in the browser so the wiki repo exists:  
   Open https://github.com/poonam-em111/smartdevide/wiki → **Create the first page** → e.g. title **Home**, paste `wiki/Home.md` → Save.
3. **Push wiki content from the repo:** from the repo root run:
   ```bash
   ./scripts/publish-wiki-to-github.sh
   ```
   This clones `smartdevide.wiki`, copies `wiki/Home.md`, `Features.md`, `Installation.md`, `Roadmap.md` into it, and pushes.  
   After that, the Wiki URLs will display that content:
   - https://github.com/poonam-em111/smartdevide/wiki  
   - https://github.com/poonam-em111/smartdevide/wiki/Features  
   - https://github.com/poonam-em111/smartdevide/wiki/Installation  
   - https://github.com/poonam-em111/smartdevide/wiki/Roadmap  

Details are also in **wiki/README.md**.

---

## Summary

| URL | What to do | Result |
|-----|------------|--------|
| **.../issues** | Push repo with `.github/ISSUE_TEMPLATE/` | **New issue** shows template chooser |
| **.../discussions** | Enable Discussions in Settings; push repo with `.github/DISCUSSION_TEMPLATE/` | **New discussion** shows category forms; URL works (no 404) |
| **.../wiki** | Enable Wiki; create first page once; run `./scripts/publish-wiki-to-github.sh` | Wiki home and subpages display content from `wiki/*.md` |

All of this assumes the **smartdevide** repo is the one you’re working in (e.g. the **IDE Extension** folder is the root of that repo, or these files are under that repo). If the repo root is different, run the script from the directory that contains the `wiki/` and `scripts/` folders.

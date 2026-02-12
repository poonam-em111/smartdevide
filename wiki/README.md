# Wiki content for GitHub

These Markdown files are the source for the **GitHub Wiki** so they display at **https://github.com/poonam-em111/smartdevide/wiki**.

## Option A: Push from repo (recommended – content shows at Wiki URL)

1. **Enable Wiki** on the repo: **Settings** → **Features** → check **Wiki**.
2. **Create the first page once** on GitHub so the wiki repo exists: open the [Wiki](https://github.com/poonam-em111/smartdevide/wiki), click **Create the first page**, add any title (e.g. `Home`), paste **Home.md** content, save.
3. **From the repo root** (IDE Extension folder), run:
   ```bash
   chmod +x scripts/publish-wiki-to-github.sh
   ./scripts/publish-wiki-to-github.sh
   ```
4. The script clones the wiki repo, copies **Home.md**, **Features.md**, **Installation.md**, and **Roadmap.md** into it, and pushes. Your wiki URLs will then show this content:
   - https://github.com/poonam-em111/smartdevide/wiki
   - https://github.com/poonam-em111/smartdevide/wiki/Features
   - https://github.com/poonam-em111/smartdevide/wiki/Installation
   - https://github.com/poonam-em111/smartdevide/wiki/Roadmap

## Option B: Copy-paste in the browser

1. Open **https://github.com/poonam-em111/smartdevide/wiki**
2. Click **Create the first page** (or **New Page** for more).
3. For **Home**: title `Home`, paste **Home.md** → Save.
4. **New Page** → title `Features`, paste **Features.md** → Save.
5. Repeat for **Installation** (Installation.md) and **Roadmap** (Roadmap.md).

## Files in this folder

| File | Wiki page URL |
|------|----------------|
| Home.md | .../wiki (home) |
| Features.md | .../wiki/Features |
| Installation.md | .../wiki/Installation |
| Roadmap.md | .../wiki/Roadmap |

Internal links in the markdown (e.g. `[Features](Features)`) work once those pages exist.

# Push CitiCare to GitHub (dev branch)

Your repo: **https://github.com/PurvJK/CitiCare** (branch: `dev`)

Run these commands in a terminal from the **project root** (`citicare-main`).

---

## If this folder is NOT a git repo yet

```powershell
cd "d:\SEM VI\SGP IV\sgp\citicare-main"

# 1. Initialize git
git init

# 2. Add your GitHub repo as remote
git remote add origin https://github.com/PurvJK/CitiCare.git

# 3. Fetch and set up dev branch (if dev already exists on GitHub)
git fetch origin
git checkout -b dev
git branch -u origin/dev

# 4. Add all files, commit, push
git add .
git commit -m "Initial commit: CitiCare - Smart City Complaint Management System"
git push -u origin dev
```

---

## If this folder IS already a git repo

```powershell
cd "d:\SEM VI\SGP IV\sgp\citicare-main"

# 1. Set or update remote to your repo
git remote remove origin
git remote add origin https://github.com/PurvJK/CitiCare.git

# 2. Switch to dev (create if needed)
git checkout -b dev

# 3. Add, commit, push
git add .
git status
git commit -m "Update: CitiCare frontend and backend"
git push -u origin dev
```

---

## If dev already exists on GitHub and you have local changes

```powershell
cd "d:\SEM VI\SGP IV\sgp\citicare-main"

git remote add origin https://github.com/PurvJK/CitiCare.git
git fetch origin
git checkout dev
git add .
git commit -m "Your commit message"
git push origin dev
```

---

## Notes

- **Authentication**: If push asks for login, use a [Personal Access Token](https://github.com/settings/tokens) instead of password, or use GitHub Desktop / Git Credential Manager.
- **First push**: If GitHub repo already has a `dev` branch with different history, you may need `git pull origin dev --rebase` then `git push origin dev`, or force push only if you intend to overwrite remote: `git push -u origin dev --force`.
- Run from **PowerShell** or **Git Bash**; use your actual project path if different from `d:\SEM VI\SGP IV\sgp\citicare-main`.

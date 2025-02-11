### **Lockfiler - Keep Your Lockfiles Updated Automatically**  

Lockfiler is a GitHub Action that automatically updates lockfiles (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) whenever `package.json` changes. It can also bump dependencies and create a pull request instead of committing directly.  

## Features  

- Detects and updates lockfiles when `package.json` changes  
- Supports `npm`, `yarn`, and `pnpm`  
- Optionally bumps dependencies using `npm-check-updates`  
- Commits changes directly or creates a pull request  
- Lightweight and simple to use  

## Usage  

### 1. How to use this?  

Create a file at `.github/workflows/update-lockfile.yml` or click on **Actions → New workflow → Set up workflow yourself**.

```yaml
name: lockfiler

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main
  workflow_dispatch:

jobs:
  update-lockfile:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run Lockfiler
        uses: IRON-M4N/lockfiler@v1.0.4
        with:
          package-manager: auto
          bump-dependencies: true
          dry-run: false
          commit-message: "chore: update lockfile"
```

### 2. Make Pull Request  
If you want it to make pull request instead of commit then here's an example that uses [peter-evans](https://github.com/peter-evans/create-pull-request) create pull request
```yaml
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v6
        with:
          branch: lockfile/update
          delete-branch: true
          title: "lockfile update"
          body: "updates to the latest package.json lockfile"
          labels: "dependencies, automation"
          assignees:  # your git username
          reviewers:  # your git username
```

### 3. Inputs  

| Input              | Description                                       | Default |
|--------------------|-------------------------------------------------|---------|
| `package-manager`  | Auto-detect or specify (`npm`, `yarn`, `pnpm`) | `auto`  |
| `bump-dependencies` | Update dependencies in `package.json`         | `false` |
| `dry-run`         | Simulate changes without committing             | `false` |
| `commit-message`  | Custom commit message                          | `chore: update lockfile` |

---
description: Build the Firebase project
---

# Build Project

This workflow installs dependencies and builds the project.

1. **Install Node 24**:
   If Node 24 is not installed, install it via nvm:
   ```bash
   # turbo
   source ~/.nvm/nvm.sh && nvm install 24 && nvm use 24
   ```

2. **Install Dependencies**:
   ```bash
   # turbo
   source ~/.nvm/nvm.sh && nvm use 24 && npm install
   ```

3. **Build**:
   ```bash
   # turbo
   source ~/.nvm/nvm.sh && nvm use 24 && npm run build
   ```

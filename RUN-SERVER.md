# Run the app locally

## Option 1: Terminal (recommended)

1. Open **PowerShell** or **Command Prompt**.
2. Go to the project folder:
   ```bash
   cd C:\Users\pc\Desktop\metabolic-paper-app-
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Wait until you see something like:
   ```
   ✓ Ready in 3.2s
   ○ Local: http://localhost:3030
   ```
5. Open your browser and go to: **http://localhost:3030**

---

## Option 2: From VS Code / Cursor

1. Open the project folder in Cursor/VS Code.
2. Press **Ctrl+`** (backtick) to open the terminal.
3. Run:
   ```bash
   npm run dev
   ```
4. In the browser, open **http://localhost:3030**.

---

## If port 3030 is already in use (EADDRINUSE)

**Option A:** The app may already be running. Open **http://localhost:3030** in your browser.

**Option B:** Free the port and start again:

1. Find the process using port 3030:
   ```bash
   netstat -ano | findstr :3030
   ```
   In the output, the **last column** is the PID (e.g. `23456`).

2. Kill that process (replace `23456` with your actual PID):
   ```bash
   taskkill /PID 23456 /F
   ```

3. Start the server:
   ```bash
   npm run dev
   ```

**Note:** In PowerShell, do not type `<that-number>` — use the real number from step 1 (e.g. `taskkill /PID 23456 /F`).

---

## First time / after git pull

Install dependencies first:

```bash
npm install
npm run dev
```

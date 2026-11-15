# AstroHealth Backend

Backend for AstroHealth using Node.js, Express, and SQLite. Includes NASA bed-rest sleep research data.

## Setup

1. Pull the latest changes:
   ```bash
   git pull origin main
   ```
2. Install dependencies:
   ```bash
   cd server
   npm install
   ```
3. Import NASA sleep data:
   ```bash
   node importNASA.js
   ```
4. Start the backend:
   ```bash
   npm run dev
   ```

The server runs at **http://localhost:3001**.

## Test the API

- **Health check:** http://localhost:3001/api/health
- **NASA subjects:** http://localhost:3001/api/nasa/sleep/subjects
- **Sleep records:** `http://localhost:3001/api/nasa/sleep/SUBJECT_ID`

Replace `SUBJECT_ID` with an ID returned by the subjects endpoint.

## NASA Dataset

The dataset contains **207 sleep records from 3 research subjects** (69 each).

The data is stored in SQLite and can be used to compare historical sleep patterns with astronaut-submitted health measurements.

**Note:** This is historical NASA bed-rest analog research, not live astronaut data. Avoid rerunning the import unless you've verified that duplicate records are handled.

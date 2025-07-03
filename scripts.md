
# Running the SQLite-based Application

## Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the API server:
   ```bash
   npm run server
   ```

3. In a separate terminal, start the frontend:
   ```bash
   npm run dev
   ```

## Package.json Scripts Needed

Add these scripts to your package.json:

```json
{
  "scripts": {
    "dev": "vite",
    "server": "tsx watch server/index.ts",
    "build": "tsc && vite build",
    "start": "node dist/server/index.js"
  }
}
```

## Additional Dependencies Installed

- better-sqlite3: SQLite database
- drizzle-orm: Type-safe database operations
- express: API server
- jsonwebtoken: JWT authentication
- bcryptjs: Password hashing
- cors: Cross-origin requests
- @paralleldrive/cuid2: Unique ID generation

The application now runs completely independently without Supabase dependencies.

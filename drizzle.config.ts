import { env } from "process"
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:password@localhost:5432/job_board",
  },
})

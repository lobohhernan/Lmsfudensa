#!/usr/bin/env node

// Script para ejecutar migraciones SQL en Supabase
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Leer archivo .env para obtener las credenciales
const envPath = path.join(__dirname, "../../.env.local");
const envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf-8") : "";

// Buscar SUPABASE_DB_PASSWORD en el archivo .env
const dbPasswordMatch = envContent.match(/SUPABASE_DB_PASSWORD=(.+)/);
const dbPassword = dbPasswordMatch ? dbPasswordMatch[1].trim() : "";

if (!dbPassword) {
  console.error("❌ SUPABASE_DB_PASSWORD not found in .env.local");
  console.log("Please set SUPABASE_DB_PASSWORD in .env.local");
  process.exit(1);
}

async function runMigration() {
  try {
    const migrationPath = path.join(
      __dirname,
      "../supabase/migrations/20250114_create_enrollments.sql"
    );

    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, "utf-8");
    console.log("📝 Preparing to run migration...");
    console.log("⚠️ Note: psql command requires local PostgreSQL installation");
    console.log("");
    console.log("To run this migration manually:");
    console.log("1. Use Supabase Web UI: SQL Editor → Paste the SQL and run");
    console.log("2. Or use command: psql 'postgresql://...' < migration.sql");
    console.log("");
    console.log("For now, displaying the SQL to be executed:");
    console.log("=".repeat(60));
    console.log(sql);
    console.log("=".repeat(60));
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

runMigration();

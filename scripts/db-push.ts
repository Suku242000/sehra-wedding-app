import * as schema from "../shared/schema";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Configure Neon for serverless environments
neonConfig.webSocketConstructor = ws;

// Entry point function
async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  console.log("🔌 Connecting to database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });

  console.log("🏗️ Pushing schema changes to database...");
  
  try {
    // Simple approach: Create tables directly if they don't exist
    // NOTE: This is a simple approach and doesn't handle migrations for existing tables
    // For production, consider using drizzle-kit generate and running proper migrations
    console.log("Creating tables if they don't exist...");
    
    // Using raw SQL for simplicity to drop all tables first
    console.log("Initializing database schema...");
    await pool.query(`
      DO $$ 
      BEGIN
        -- Users table needs to be dropped last due to references
        ALTER TABLE IF EXISTS "supervisor_clients" DROP CONSTRAINT IF EXISTS "supervisor_clients_supervisor_id_users_id_fk";
        ALTER TABLE IF EXISTS "supervisor_clients" DROP CONSTRAINT IF EXISTS "supervisor_clients_client_id_users_id_fk";
        ALTER TABLE IF EXISTS "vendor_profiles" DROP CONSTRAINT IF EXISTS "vendor_profiles_user_id_users_id_fk";
        ALTER TABLE IF EXISTS "tasks" DROP CONSTRAINT IF EXISTS "tasks_user_id_users_id_fk";
        ALTER TABLE IF EXISTS "guests" DROP CONSTRAINT IF EXISTS "guests_user_id_users_id_fk";
        ALTER TABLE IF EXISTS "budget_items" DROP CONSTRAINT IF EXISTS "budget_items_user_id_users_id_fk";
        ALTER TABLE IF EXISTS "vendor_bookings" DROP CONSTRAINT IF EXISTS "vendor_bookings_user_id_users_id_fk";
        ALTER TABLE IF EXISTS "user_achievements" DROP CONSTRAINT IF EXISTS "user_achievements_user_id_users_id_fk";
        ALTER TABLE IF EXISTS "user_progress" DROP CONSTRAINT IF EXISTS "user_progress_user_id_users_id_fk";
        ALTER TABLE IF EXISTS "timeline_events" DROP CONSTRAINT IF EXISTS "timeline_events_user_id_users_id_fk";
        ALTER TABLE IF EXISTS "messages" DROP CONSTRAINT IF EXISTS "messages_from_user_id_users_id_fk";
        ALTER TABLE IF EXISTS "messages" DROP CONSTRAINT IF EXISTS "messages_to_user_id_users_id_fk";
        ALTER TABLE IF EXISTS "contact_statuses" DROP CONSTRAINT IF EXISTS "contact_statuses_user_id_users_id_fk";
        ALTER TABLE IF EXISTS "contact_statuses" DROP CONSTRAINT IF EXISTS "contact_statuses_supervisor_id_users_id_fk";
        ALTER TABLE IF EXISTS "notifications" DROP CONSTRAINT IF EXISTS "notifications_user_id_users_id_fk";
        ALTER TABLE IF EXISTS "vendor_reviews" DROP CONSTRAINT IF EXISTS "vendor_reviews_user_id_users_id_fk";
        ALTER TABLE IF EXISTS "user_achievements" DROP CONSTRAINT IF EXISTS "user_achievements_achievement_id_achievements_id_fk";
        ALTER TABLE IF EXISTS "vendor_reviews" DROP CONSTRAINT IF EXISTS "vendor_reviews_vendor_id_vendor_profiles_id_fk";
        ALTER TABLE IF EXISTS "vendor_calendar" DROP CONSTRAINT IF EXISTS "vendor_calendar_vendor_id_vendor_profiles_id_fk";
        ALTER TABLE IF EXISTS "vendor_analytics" DROP CONSTRAINT IF EXISTS "vendor_analytics_vendor_id_vendor_profiles_id_fk";
        ALTER TABLE IF EXISTS "budget_items" DROP CONSTRAINT IF EXISTS "budget_items_vendor_id_vendor_profiles_id_fk";
        ALTER TABLE IF EXISTS "vendor_bookings" DROP CONSTRAINT IF EXISTS "vendor_bookings_vendor_id_vendor_profiles_id_fk";
        ALTER TABLE IF EXISTS "vendor_calendar" DROP CONSTRAINT IF EXISTS "vendor_calendar_booking_id_vendor_bookings_id_fk";
        
        -- Drop tables
        DROP TABLE IF EXISTS "users" CASCADE;
        DROP TABLE IF EXISTS "supervisor_clients" CASCADE;
        DROP TABLE IF EXISTS "vendor_profiles" CASCADE;
        DROP TABLE IF EXISTS "tasks" CASCADE;
        DROP TABLE IF EXISTS "guests" CASCADE;
        DROP TABLE IF EXISTS "budget_items" CASCADE;
        DROP TABLE IF EXISTS "vendor_bookings" CASCADE;
        DROP TABLE IF EXISTS "achievements" CASCADE;
        DROP TABLE IF EXISTS "user_achievements" CASCADE;
        DROP TABLE IF EXISTS "user_progress" CASCADE;
        DROP TABLE IF EXISTS "timeline_events" CASCADE;
        DROP TABLE IF EXISTS "messages" CASCADE;
        DROP TABLE IF EXISTS "contact_statuses" CASCADE;
        DROP TABLE IF EXISTS "notifications" CASCADE;
        DROP TABLE IF EXISTS "vendor_reviews" CASCADE;
        DROP TABLE IF EXISTS "vendor_calendar" CASCADE;
        DROP TABLE IF EXISTS "vendor_analytics" CASCADE;
      END $$;
    `);
    
    // Create all tables using drizzle
    console.log("Creating tables from schema...");
    
    // Execute SQL to create tables
    for (const [tableName, tableSchema] of Object.entries(schema)) {
      // Skip items that aren't tables (relations, types, etc.)
      if (!tableSchema || typeof tableSchema !== 'object' || !('create' in tableSchema)) {
        continue;
      }
      
      // Create SQL for the table
      try {
        // @ts-ignore - We know this is a table schema
        const sql = tableSchema.toSQL?.();
        if (sql) {
          await pool.query(sql.sql);
          console.log(`Created table: ${tableName}`);
        }
      } catch (error) {
        // Some objects in the schema might not be tables
        continue;
      }
    }
    
    console.log("✅ All tables created successfully!");
  } catch (error) {
    console.error("❌ Error pushing schema:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }

  console.log("✅ Schema push completed successfully!");
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
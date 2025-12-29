import { Pool } from "pg";
import "dotenv/config";

async function testConnection() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        console.log("Testing PostgreSQL connection...");
        console.log("Connection string:", process.env.DATABASE_URL);

        const client = await pool.connect();
        console.log("✅ Connected to PostgreSQL successfully!");

        const result = await client.query("SELECT version()");
        console.log("PostgreSQL version:", result.rows[0].version);

        client.release();
    } catch (error) {
        console.error("❌ Connection failed:");
        console.error(error);
    } finally {
        await pool.end();
    }
}

testConnection();

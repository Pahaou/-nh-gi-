const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function test() {
    console.log('Connecting to:', process.env.DB_HOST);
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            ssl: { rejectUnauthorized: false }
        });
        console.log('✅ Connected to TiDB!');
        await conn.end();
    } catch (e) {
        console.error('❌ Connection failed:', e.message);
    }
}
test();

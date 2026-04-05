const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function migrate() {
    console.log('🚀 Starting migration to TiDB Cloud (Database: ' + process.env.DB_NAME + ')...');
    
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME,
            multipleStatements: true,
            ssl: { rejectUnauthorized: false }
        });
        console.log('✅ Connected to TiDB!');

        const schemaSQL = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'schema.sql'), 'utf8')
            .replace(/CREATE DATABASE IF NOT EXISTS evaluation_system\;/gi, '')
            .replace(/USE evaluation_system\;/gi, '');
            
        const seedSQL = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'seed.sql'), 'utf8')
            .replace(/USE evaluation_system\;/gi, '');

        console.log('📋 Running schema.sql...');
        await conn.query(schemaSQL);
        console.log('✅ Schema created.');

        console.log('🌱 Running seed.sql...');
        await conn.query(seedSQL);
        console.log('✅ Seed data inserted.');

    } catch (e) {
        console.error('❌ Migration failed:', e.message);
    } finally {
        if (conn) await conn.end();
    }
}

migrate();

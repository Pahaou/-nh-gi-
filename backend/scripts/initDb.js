/**
 * Khởi tạo database - chạy 1 lần
 * Đọc và thực thi schema.sql + seed.sql
 */
require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
    console.log('🔧 Đang khởi tạo database...\n');

    // Kết nối không chỉ định database
    let conn;
    try {
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER,
            password: process.env.DB_PASS || '',
            database: process.env.DB_NAME || 'test',
            multipleStatements: true,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : null,
            connectTimeout: 20000
        });
        console.log('✅ Kết nối MySQL thành công');
    } catch (error) {
        console.error('❌ Không thể kết nối MySQL:', error.message);
        console.log('\n💡 Hãy kiểm tra:');
        console.log('   1. MySQL/Laragon đang chạy');
        console.log('   2. Thông tin user/password trong file .env');
        process.exit(1);
    }

    try {
        // Đọc và thực thi schema.sql
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
        console.log('\n📋 Đang tạo bảng...');
        await conn.query(schemaSQL);
        console.log('✅ Tạo schema thành công');

        // Đọc và thực thi seed.sql
        const seedPath = path.join(__dirname, '..', 'database', 'seed.sql');
        const seedSQL = fs.readFileSync(seedPath, 'utf8');
        console.log('\n🌱 Đang thêm dữ liệu mẫu...');
        await conn.query(seedSQL);
        console.log('✅ Thêm dữ liệu mẫu thành công');

        console.log('\n🎉 Khởi tạo database hoàn tất!');
        console.log('   Database: evaluation_system');
        console.log('   Tài khoản demo:');
        console.log('   - MSV: 2051012345 / MK: 123456');
        console.log('   - MSV: 2051012346 / MK: 123456');
        console.log('   - MSV: 2051012347 / MK: 123456');
    } catch (error) {
        console.error('❌ Lỗi khi thực thi SQL:', error.message);
        if (error.sqlMessage) {
            console.error('   SQL Error:', error.sqlMessage);
        }
    } finally {
        await conn.end();
    }
}

initDatabase();

require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
    const c = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: 'evaluation_system'
    });

    await c.query(`
        UPDATE instructors SET full_name = CASE id 
            WHEN 1 THEN 'Phạm Minh Đức' 
            WHEN 2 THEN 'Nguyễn Thị Hoa' 
            WHEN 3 THEN 'Trần Văn Khang' 
            WHEN 4 THEN 'Lê Thị Mai' 
            WHEN 5 THEN 'Hoàng Văn Nam' 
        END 
        WHERE id IN (1,2,3,4,5)
    `);

    console.log('Updated instructor names!');
    await c.end();
})();

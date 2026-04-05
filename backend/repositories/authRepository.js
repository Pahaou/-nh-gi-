const db = require('../config/database');

class AuthRepository {
    /**
     * Tìm sinh viên theo mã sinh viên
     */
    async findByStudentCode(studentCode) {
        const [rows] = await db.query(
            'SELECT id, student_code, full_name, email, password_hash, faculty FROM students WHERE student_code = ?',
            [studentCode]
        );
        return rows[0] || null;
    }

    async findByInstructorCode(code) {
        const [rows] = await db.query(
            'SELECT id, instructor_code, full_name, email, password_hash, faculty, academic_rank FROM instructors WHERE instructor_code = ?',
            [code]
        );
        return rows[0] || null;
    }

    async findAdminByUsername(username) {
        const [rows] = await db.query(
            'SELECT id, username, full_name, password_hash FROM admins WHERE username = ?',
            [username]
        );
        return rows[0] || null;
    }

    /**
     * Tìm user chung theo ID và role
     */
    async findById(id, role) {
        let table = 'students';
        let columns = 'id, student_code, full_name, email, faculty';
        
        if (role === 'instructor') {
            table = 'instructors';
            columns = 'id, instructor_code, full_name, email, faculty, academic_rank';
        } else if (role === 'admin') {
            table = 'admins';
            columns = 'id, username, full_name';
        }

        const [rows] = await db.query(`SELECT ${columns} FROM ${table} WHERE id = ?`, [id]);
        return rows[0] || null;
    }
}

module.exports = new AuthRepository();

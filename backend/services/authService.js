const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/authRepository');

class AuthService {
    /**
     * Đăng nhập multi-role
     * @param {string} username - Mã SV, Mã GV, hoặc Username
     * @param {string} password - Mật khẩu
     * @param {string} role - 'student' | 'instructor' | 'admin'
     */
    async login(username, password, role) {
        let user = null;
        let identifierField = '';

        if (role === 'student') {
            user = await authRepository.findByStudentCode(username);
            identifierField = 'studentCode';
        } else if (role === 'instructor') {
            user = await authRepository.findByInstructorCode(username);
            identifierField = 'instructorCode';
        } else if (role === 'admin') {
            user = await authRepository.findAdminByUsername(username);
            identifierField = 'username';
        } else {
            throw { status: 400, message: 'Role không hợp lệ' };
        }

        if (!user) {
            throw { status: 401, message: 'Tài khoản không tồn tại' };
        }

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw { status: 401, message: 'Mật khẩu không chính xác' };
        }

        const payload = {
            id: user.id,
            role: role,
            fullName: user.full_name
        };
        
        if (role === 'student') payload.studentCode = user.student_code;
        if (role === 'instructor') payload.instructorCode = user.instructor_code;
        if (role === 'admin') payload.username = user.username;

        // Tạo JWT token
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        return {
            token,
            user: {
                id: user.id,
                ...payload,
                email: user.email,
                faculty: user.faculty,
                academicRank: user.academic_rank
            }
        };
    }

    async getStudentInfo(userId, role) {
        const user = await authRepository.findById(userId, role);
        if (!user) {
            throw { status: 404, message: 'Không tìm thấy tài khoản' };
        }
        return user;
    }
}

module.exports = new AuthService();

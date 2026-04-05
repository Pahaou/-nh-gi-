const authService = require('../services/authService');

class AuthController {
    /**
     * POST /api/auth/login
     * Đăng nhập sinh viên, trả về JWT Token
     */
    async login(req, res) {
        try {
            const { username, password, role } = req.body;

            // backward compatibility
            const loginUsername = username || req.body.studentCode;
            const loginRole = role || 'student';

            if (!loginUsername || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Vui lòng nhập tài khoản và mật khẩu'
                });
            }

            const result = await authService.login(loginUsername, password, loginRole);

            return res.status(200).json({
                success: true,
                message: 'Đăng nhập thành công',
                data: result
            });
        } catch (error) {
            const status = error.status || 500;
            return res.status(status).json({
                success: false,
                message: error.message || 'Lỗi hệ thống'
            });
        }
    }

    /**
     * GET /api/auth/me
     * Lấy thông tin tài khoản đang đăng nhập
     */
    async getMe(req, res) {
        try {
            const userId = req.user.id;
            const role = req.user.role;
            const user = await authService.getStudentInfo(userId, role); // Reuse getStudentInfo, but backend uses findById(id, role)

            return res.status(200).json({
                success: true,
                data: {
                    ...user,
                    role: role
                }
            });
        } catch (error) {
            const status = error.status || 500;
            return res.status(status).json({
                success: false,
                message: error.message || 'Lỗi hệ thống'
            });
        }
    }
}

module.exports = new AuthController();

const jwt = require('jsonwebtoken');

/**
 * Middleware xác thực JWT Token
 * Verify Bearer Token từ header Authorization
 */
function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Không tìm thấy token xác thực'
        });
    }

    // Lấy token từ "Bearer <token>"
    const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // .id, .role, .fullName, etc.
        req.studentId = decoded.id; // backward-compatibility for existing evaluation flow
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'
            });
        }
        return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ'
        });
    }
}

/**
 * Middleware kiểm tra quyền truy cập theo role
 * @param {string|string[]} roles 
 */
function requireRole(roles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ success: false, message: 'Chưa xác thực' });
        }
        
        const authorizedRoles = Array.isArray(roles) ? roles : [roles];
        if (!authorizedRoles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Không có quyền truy cập' });
        }
        
        next();
    };
}

module.exports = {
    authMiddleware,
    requireRole
};

/**
 * auth.js - Xử lý đăng nhập Sinh viên / Giảng viên / Admin
 */

const API_BASE = 'http://localhost:3000/api';

// Nếu đã đăng nhập hợp lệ, chuyển sang dashboard
(async () => {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                window.location.replace('/dashboard');
                return;
            }
        } catch (e) {}
        // Token không hợp lệ → xóa
        localStorage.clear();
    }
})();

let currentRole = 'student';

// Xử lý chuyển tab
document.querySelectorAll('.role-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
        // Active tab
        document.querySelectorAll('.role-tab').forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');
        
        currentRole = e.target.dataset.role;
        
        // Đổi label form
        const label = document.getElementById('usernameLabel');
        const input = document.getElementById('username');
        const demoInfo = document.getElementById('demoInfo');
        
        if (currentRole === 'student') {
            label.textContent = 'Mã sinh viên';
            input.placeholder = 'VD: 2051012345';
            demoInfo.innerHTML = `
                <strong>Tài khoản Sinh viên:</strong><br>
                MSV: <strong>2051012345</strong> — Mật khẩu: <strong>123456</strong><br>
                MSV: <strong>2051012346</strong> — Mật khẩu: <strong>123456</strong>
            `;
        } else if (currentRole === 'instructor') {
            label.textContent = 'Mã giảng viên';
            input.placeholder = 'VD: GV001';
            demoInfo.innerHTML = `
                <strong>Tài khoản Giảng viên:</strong><br>
                MGV: <strong>GV001</strong> — Mật khẩu: <strong>123456</strong><br>
                MGV: <strong>GV002</strong> — Mật khẩu: <strong>123456</strong>
            `;
        } else {
            label.textContent = 'Tên đăng nhập';
            input.placeholder = 'VD: admin';
            demoInfo.innerHTML = `
                <strong>Tài khoản Admin:</strong><br>
                Username: <strong>admin</strong> — Mật khẩu: <strong>123456</strong>
            `;
        }
    });
});

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const btn = document.getElementById('loginBtn');
    const alert = document.getElementById('alert');

    if (!username || !password) {
        showAlert('Vui lòng nhập đầy đủ tài khoản và mật khẩu', 'error');
        return;
    }

    // Disable button
    btn.disabled = true;
    btn.innerHTML = '⏳ Đang đăng nhập...';

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, role: currentRole })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Lưu token và thông tin User
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));

            showAlert('Đăng nhập thành công! Đang chuyển hướng...', 'success');

            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 500);
        } else {
            showAlert(data.message || 'Đăng nhập thất bại', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Không thể kết nối đến server. Vui lòng kiểm tra lại.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '🔐 Đăng nhập';
    }
});

function showAlert(message, type) {
    const alert = document.getElementById('alert');
    alert.textContent = message;
    alert.className = `alert alert-${type}`;
    alert.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => { alert.style.display = 'none'; }, 3000);
    }
}

/**
 * dashboard.js - Orchestrator theo role
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Kiểm tra đăng nhập
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        window.location.replace('/');
        return;
    }

    let user;
    try {
        user = JSON.parse(userStr);
    } catch (e) {
        localStorage.clear();
        window.location.replace('/');
        return;
    }

    // 2. Hiển thị User Info
    document.getElementById('userName').textContent = user.fullName;
    document.getElementById('userAvatar').textContent = user.fullName.charAt(0);
    
    if (user.role === 'student') {
        document.getElementById('userCode').textContent = user.studentCode;
    } else if (user.role === 'instructor') {
        document.getElementById('userCode').textContent = user.instructorCode;
    } else {
        document.getElementById('userCode').textContent = 'Admin';
    }

    // 3. Đăng xuất
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/';
    });

    // 4. Hiển thị đúng Role View
    document.getElementById('studentView').style.display = 'none';
    document.getElementById('instructorView').style.display = 'none';
    document.getElementById('adminView').style.display = 'none';

    if (user.role === 'student') {
        document.getElementById('studentView').style.display = 'block';
        if (window.initStudentDashboard) window.initStudentDashboard(user, token);
    } else if (user.role === 'instructor') {
        document.getElementById('instructorView').style.display = 'block';
        if (window.initInstructorDashboard) window.initInstructorDashboard(user, token);
    } else if (user.role === 'admin') {
        document.getElementById('adminView').style.display = 'block';
        if (window.initAdminDashboard) window.initAdminDashboard(user, token);
    }
});

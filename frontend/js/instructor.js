/**
 * instructor.js - Logic cho Giảng viên Dashboard
 */

window.initInstructorDashboard = async function(user, token, campaignId = null) {
    const API_BASE = 'http://localhost:3000/api';
    const grid = document.getElementById('instructorGrid');
    
    if (typeof showLoading === 'function') showLoading(true);
    try {
        const url = campaignId ? `${API_BASE}/instructor/dashboard?campaignId=${campaignId}` : `${API_BASE}/instructor/dashboard`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const { availableCampaigns, campaign, classes } = data.data;
            
            if (!campaign) {
                grid.innerHTML = '<p style="color:var(--text-color);">Hiện tại không mở đợt đánh giá nào.</p>';
                return;
            }
            
            const available = availableCampaigns || [];
            let headerHtml = `<h2>Dashboard Giảng viên</h2>`;
            if (available.length > 1) {
                let options = available.map(c => `<option value="${c.id}" ${c.id == campaign.id ? 'selected' : ''} style="color:black">${c.name}</option>`).join('');
                headerHtml += `<p id="instructorSub">Thống kê đợt: <select onchange="window.initInstructorDashboard(JSON.parse(localStorage.getItem('user')), '${token}', this.value)" style="background:transparent; color:var(--text-secondary); border:1px solid var(--border); padding:2px 5px; border-radius:4px; font-family:inherit;">${options}</select></p>`;
            } else {
                headerHtml += `<p id="instructorSub">Thống kê đợt đánh giá: ${campaign.name}</p>`;
            }
            document.querySelector('#instructorView .campaign-info').innerHTML = headerHtml;
            
            if (classes.length === 0) {
                grid.innerHTML = '<p style="color:var(--text-color);">Bạn không có lớp học phần nào trong học kỳ này.</p>';
                return;
            }
            
            grid.innerHTML = classes.map(cls => `
                <div class="class-card">
                    <span class="class-code">${cls.class_code}</span>
                    <div class="subject-name">${cls.subject_name}</div>
                    <div class="class-meta">
                        <div class="class-meta-item">
                            <span class="icon">👥</span>
                            <span>Lớp: ${cls.total_students} SV</span>
                        </div>
                        <div class="class-meta-item">
                            <span class="icon">✅</span>
                            <span>Đã khảo sát: ${cls.submitted_students} SV</span>
                        </div>
                    </div>
                    <button class="btn-evaluate" onclick="viewClassResults(${cls.class_id}, '${token}', ${campaign.id})" style="background:var(--secondary-color);">📈 Xem kết quả</button>
                </div>
            `).join('');
            
        } else {
            grid.innerHTML = '<p style="color:var(--danger-color);">Lỗi tải dữ liệu.</p>';
        }
    } catch(err) {
        grid.innerHTML = '<p style="color:var(--danger-color);">Lỗi kết nối.</p>';
    } finally {
        if (typeof showLoading === 'function') showLoading(false);
    }
};

window.viewClassResults = async function(classId, token, campaignId = null) {
    const API_BASE = 'http://localhost:3000/api';
    
    // Tận dụng modal của student để show results 
    document.getElementById('modalTitle').textContent = 'Kết quả đánh giá';
    document.getElementById('modalSubtitle').textContent = 'Đang tải...';
    document.getElementById('modalBody').innerHTML = '<div style="display:flex; justify-content:center; padding: 2rem;"><div class="spinner"></div></div>';
    
    // Hide progress bar & submit button cho Instructor Mode
    document.querySelector('.modal-footer').style.display = 'none';
    document.getElementById('evalModal').classList.add('active');
    
    try {
        const url = campaignId ? `${API_BASE}/instructor/classes/${classId}/results?campaignId=${campaignId}` : `${API_BASE}/instructor/classes/${classId}/results`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success) {
            const { classInfo, criteriaScores, comments } = data.data;
            document.getElementById('modalSubtitle').textContent = `${classInfo.class_code} - ${classInfo.subject_name}`;
            
            let html = `
                <div style="margin-bottom: 2rem;">
                    <h3>📊 Điểm trung bình theo tiêu chí</h3>
                    <table class="table" style="width:100%; text-align:left; border-collapse: collapse; margin-top:1rem;">
                        <thead>
                            <tr style="border-bottom:2px solid var(--border-color);">
                                <th style="padding:10px;">Tiêu chí</th>
                                <th style="padding:10px; width:100px;">Điểm TB</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${criteriaScores.map(c => `
                                <tr style="border-bottom:1px solid var(--border-color);">
                                    <td style="padding:10px; color:var(--text-color);">${c.criteria_content}</td>
                                    <td style="padding:10px; font-weight:bold; color:var(--primary-color);">
                                        ${c.avg_score} / ${c.max_score}
                                    </td>
                                </tr>
                            `).join('')}
                            ${criteriaScores.length===0 ? '<tr><td colspan="2">Chưa có dữ liệu đánh giá</td></tr>' : ''}
                        </tbody>
                    </table>
                </div>
                
                <div>
                    <h3>💬 Ý kiến phản hồi</h3>
                    <div style="margin-top:1rem;">
                        ${comments.map(c => `
                            <div style="background:var(--card-bg); padding:1rem; border-radius:8px; border:1px solid var(--border-color); margin-bottom:1rem;">
                                <div style="color:var(--text-light); font-size:12px; margin-bottom:5px;">
                                    ${new Date(c.submitted_at).toLocaleString('vi-VN')}
                                </div>
                                <div style="color:var(--text-color);">
                                    ${c.comments}
                                </div>
                            </div>
                        `).join('')}
                        ${comments.length===0 ? '<p style="color:var(--text-light);">Chưa có ý kiến phản hồi nào.</p>' : ''}
                    </div>
                </div>
            `;
            document.getElementById('modalBody').innerHTML = html;
        } else {
            document.getElementById('modalBody').innerHTML = `<p style="color:red">${data.message}</p>`;
        }
    } catch(err) {
        document.getElementById('modalBody').innerHTML = `<p style="color:red">Lỗi kết nối</p>`;
    }
};

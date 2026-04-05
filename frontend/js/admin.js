/**
 * admin.js - Logic cho Admin Dashboard
 */

window.initAdminDashboard = async function(user, token) {
    const API_BASE = '/api';
    
    async function loadCampaigns() {
        const tbody = document.getElementById('adminCampaignBody');
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Đang tải...</td></tr>';
        
        if (typeof showLoading === 'function') showLoading(true);
        try {
            const res = await fetch(`${API_BASE}/admin/campaigns`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success) {
                if (data.data.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Chưa có đợt đánh giá nào.</td></tr>';
                    return;
                }
                
                tbody.innerHTML = data.data.map(c => `
                    <tr>
                        <td><strong>${c.name}</strong></td>
                        <td>${c.semester_name}</td>
                        <td>
                            ${new Date(c.start_date).toLocaleDateString('vi-VN')} - 
                            ${new Date(c.end_date).toLocaleDateString('vi-VN')}
                        </td>
                        <td>
                            <span class="badge ${c.is_active ? 'badge-active' : 'badge-inactive'}" 
                                  style="padding:5px 10px; border-radius:12px; background:${c.is_active ? 'var(--primary-color)' : 'var(--text-light)'}; color:white; font-size:12px;">
                                ${c.is_active ? 'Đang mở' : 'Đã khóa'}
                            </span>
                        </td>
                        <td>
                            Lớp: ${c.total_classes} <br>
                            Đã đánh giá: ${c.evaluated_classes}
                        </td>
                        <td>
                            <button class="btn btn-sm" onclick="toggleCampaign(${c.id}, ${!c.is_active}, '${token}')" 
                                    style="padding:5px 10px; font-size:12px; background:${c.is_active ? 'var(--danger-color)' : 'var(--secondary-color)'}; margin-right:5px;">
                                ${c.is_active ? 'Khóa đợt' : 'Mở đợt'}
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        } catch(err) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:red;">Lỗi tải dữ liệu.</td></tr>';
        } finally {
            if (typeof showLoading === 'function') showLoading(false);
        }
    }
    
    window.toggleCampaign = async function(id, isActive, tokenObj) {
        try {
            const res = await fetch(`${API_BASE}/admin/campaigns/${id}/toggle`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${tokenObj}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ is_active: isActive })
            });
            const data = await res.json();
            if(data.success) {
                alert(data.message);
                loadCampaigns();
            } else {
                alert('Lỗi: ' + data.message);
            }
        } catch(err) {
            alert('Lỗi kết nối');
        }
    };
    
    document.getElementById('adminCreateBtn').addEventListener('click', async () => {
        const name = prompt("Nhập tên đợt đánh giá mới:");
        if (!name) return;
        
        // Hardcode semester_id = 2 for quick demo creation matching the prompt
        // Ideally we would fetch semesters and show a select dropdown
        const payload = {
            name: name,
            semester_id: 2, 
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date(new Date().setMonth(new Date().getMonth()+1)).toISOString().split('T')[0],
            is_active: true
        };
        
        try {
            const res = await fetch(`${API_BASE}/admin/campaigns`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                alert('Tạo đợt đánh giá thành công! Đã clone tiêu chí mẫu.');
                loadCampaigns();
            } else {
                alert('Lỗi: ' + data.message);
            }
        } catch(err) {
            alert('Lỗi kết nối');
        }
    });

    loadCampaigns();
};

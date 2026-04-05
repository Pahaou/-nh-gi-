/**
 * evaluation.js - Xử lý dashboard đánh giá giảng dạy
 * Flow theo biểu đồ tuần tự:
 *   1. GET /api/evaluations/pending → Hiển thị danh sách lớp
 *   2. POST /api/evaluations/submit → Nộp phiếu đánh giá
 */

const API_BASE = '/api';
let isRedirecting = false;

// State
let appState = {
    token: null,
    student: null,
    selectedCampaignId: null,
    campaign: null,
    availableCampaigns: [],
    pendingClasses: [],
    submittedClasses: [],
    criteria: [],
    selectedClass: null
};

// ========== INITIALIZATION ==========
window.initStudentDashboard = function(user, token) {
    appState.token = token;
    appState.student = user;
    
    // Đã có dashboard.js render avatar rồi, không cần renderUserInfo()
    loadPendingEvaluations();
    setupEventListeners();
};

// ========== API CALLS ==========

/**
 * Gọi API có kèm JWT Token
 */
async function apiCall(url, options = {}) {
    if (isRedirecting) return null;

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${appState.token}`
    };

    const response = await fetch(`${API_BASE}${url}`, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers }
    });

    // Token hết hạn
    if (response.status === 401) {
        isRedirecting = true;
        localStorage.clear();
        window.location.replace('/');
        return null;
    }

    return response;
}

/**
 * Bước 1: GET /api/evaluations/pending
 * Lấy danh sách lớp cần đánh giá
 */
async function loadPendingEvaluations() {
    showLoading(true);

    try {
        const url = appState.selectedCampaignId ? `/evaluations/pending?campaignId=${appState.selectedCampaignId}` : '/evaluations/pending';
        const response = await apiCall(url);
        if (!response) return; // redirect đang xử lý

        const data = await response.json();

        if (data.success) {
            appState.availableCampaigns = data.data.availableCampaigns || [];
            appState.campaign = data.data.campaign;
            appState.pendingClasses = data.data.pendingClasses;
            appState.submittedClasses = data.data.submittedClasses;
            appState.criteria = data.data.criteria;

            renderCampaign();
            renderPendingClasses();
            renderSubmittedClasses();
            updateStats();
        }
    } catch (error) {
        console.error('Load error:', error);
        showToast('Không thể tải dữ liệu. Vui lòng thử lại.', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Bước 2: POST /api/evaluations/submit
 * Nộp phiếu đánh giá
 */
async function submitEvaluation() {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Đang gửi...';

    // Thu thập dữ liệu
    const criteriaScores = [];
    const starInputs = document.querySelectorAll('#modalBody input[type="radio"]:checked');

    starInputs.forEach(input => {
        criteriaScores.push({
            criteriaId: parseInt(input.name.replace('criteria_', '')),
            score: parseInt(input.value)
        });
    });

    const comments = document.getElementById('evalComments').value.trim();

    const payload = {
        classId: appState.selectedClass.class_id,
        campaignId: appState.campaign.id,
        criteriaScores,
        comments
    };

    try {
        const response = await apiCall('/evaluations/submit', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            // Đóng evaluation modal
            closeModal('evalModal');
            
            // Hiển thị success modal
            document.getElementById('successModal').classList.add('active');

            // Reload data
            await loadPendingEvaluations();
        } else {
            showToast(data.message || 'Gửi đánh giá thất bại', 'error');
        }
    } catch (error) {
        console.error('Submit error:', error);
        showToast('Lỗi kết nối. Vui lòng thử lại.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '📤 Gửi đánh giá';
    }
}

// ========== RENDER FUNCTIONS ==========

function renderUserInfo() {
    const s = appState.student;
    document.getElementById('userName').textContent = s.fullName;
    document.getElementById('userCode').textContent = s.studentCode;
    document.getElementById('userAvatar').textContent = s.fullName.charAt(0).toUpperCase();
}

function renderCampaign() {
    if (!appState.campaign) {
        document.getElementById('noCampaign').style.display = 'block';
        document.getElementById('campaignBanner').style.display = 'none';
        document.getElementById('tabsContainer').style.display = 'none';
        return;
    }

    const c = appState.campaign;
    const available = appState.availableCampaigns;
    
    document.getElementById('campaignBanner').style.display = 'flex';
    document.getElementById('tabsContainer').style.display = 'flex';
    document.getElementById('noCampaign').style.display = 'none';

    const startDate = new Date(c.start_date).toLocaleDateString('vi-VN');
    const endDate = new Date(c.end_date).toLocaleDateString('vi-VN');
    
    // Inject select if multiple active tracking, otherwise just H2
    let nameHtml;
    if (available && available.length > 1) {
        let options = available.map(cam => `<option value="${cam.id}" ${cam.id == c.id ? 'selected' : ''} style="color:black">${cam.name}</option>`).join('');
        nameHtml = `<select onchange="window.switchStudentCampaign(this.value)" style="background:transparent; color:white; border:1px solid rgba(255,255,255,0.3); padding:4px 8px; border-radius:4px; font-size:1.1rem; font-weight:700; margin-bottom:5px; outline:none; cursor:pointer;">
            ${options}
        </select>`;
    } else {
        nameHtml = `<h2>${c.name}</h2>`;
    }

    // Since campaignName was originally an h2 tag, we overwrite the whole banner info side
    const infoContainer = document.querySelector('.campaign-info');
    infoContainer.innerHTML = `
        ${nameHtml}
        <p id="campaignDate">Thời gian: ${startDate} → ${endDate}</p>
    `;
}

window.switchStudentCampaign = function(val) {
    appState.selectedCampaignId = val;
    loadPendingEvaluations();
}

function renderPendingClasses() {
    const grid = document.getElementById('pendingGrid');
    const empty = document.getElementById('pendingEmpty');
    const classes = appState.pendingClasses;

    if (classes.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    grid.innerHTML = classes.map(cls => `
        <div class="class-card" onclick="openEvaluation(${cls.class_id})">
            <span class="class-code">${cls.class_code}</span>
            <div class="subject-name">${cls.subject_name}</div>
            <div class="class-meta">
                <div class="class-meta-item">
                    <span class="icon">👨‍🏫</span>
                    <span>${cls.academic_rank ? cls.academic_rank + ' ' : ''}${cls.instructor_name}</span>
                </div>
                <div class="class-meta-item">
                    <span class="icon">📚</span>
                    <span>${cls.credits} tín chỉ</span>
                </div>
                <div class="class-meta-item">
                    <span class="icon">🕐</span>
                    <span>${cls.schedule || 'Chưa rõ'}</span>
                </div>
                <div class="class-meta-item">
                    <span class="icon">🏫</span>
                    <span>Phòng ${cls.room || 'N/A'}</span>
                </div>
            </div>
            <button class="btn-evaluate">📝 Đánh giá ngay</button>
        </div>
    `).join('');
}

function renderSubmittedClasses() {
    const grid = document.getElementById('submittedGrid');
    const empty = document.getElementById('submittedEmpty');
    const classes = appState.submittedClasses;

    if (classes.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
    }

    empty.style.display = 'none';
    grid.innerHTML = classes.map(cls => `
        <div class="class-card submitted">
            <span class="class-code">${cls.class_code}</span>
            <div class="subject-name">${cls.subject_name}</div>
            <div class="class-meta">
                <div class="class-meta-item">
                    <span class="icon">👨‍🏫</span>
                    <span>${cls.instructor_name}</span>
                </div>
                <div class="class-meta-item">
                    <span class="icon">📅</span>
                    <span>Đã gửi: ${new Date(cls.submitted_at).toLocaleString('vi-VN')}</span>
                </div>
            </div>
            <div class="submitted-badge">✅ Đã hoàn thành</div>
        </div>
    `).join('');
}

function updateStats() {
    const pending = appState.pendingClasses.length;
    const done = appState.submittedClasses.length;

    document.getElementById('statPending').textContent = pending;
    document.getElementById('statDone').textContent = done;
    document.getElementById('tabBadgePending').textContent = pending;
    document.getElementById('tabBadgeDone').textContent = done;
}

// ========== EVALUATION MODAL ==========

function openEvaluation(classId) {
    const cls = appState.pendingClasses.find(c => c.class_id === classId);
    if (!cls) return;

    appState.selectedClass = cls;

    // Set modal header
    document.getElementById('modalTitle').textContent = cls.subject_name;
    document.getElementById('modalSubtitle').textContent = 
        `${cls.class_code} — ${cls.academic_rank ? cls.academic_rank + ' ' : ''}${cls.instructor_name}`;

    // Render criteria groups
    const body = document.getElementById('modalBody');
    let totalCriteria = 0;

    let html = appState.criteria.map((group, gi) => {
        const groupHtml = group.criteria.map(c => {
            totalCriteria++;
            return `
                <div class="criteria-item">
                    <div class="criteria-content">${c.content}</div>
                    <div class="star-rating">
                        ${[5,4,3,2,1].map(score => `
                            <input type="radio" name="criteria_${c.id}" id="star_${c.id}_${score}" value="${score}" onchange="updateProgress()">
                            <label for="star_${c.id}_${score}" title="${score} sao">★</label>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="criteria-group">
                <div class="criteria-group-title">
                    <span class="group-number">${gi + 1}</span>
                    ${group.group_name}
                </div>
                ${groupHtml}
            </div>
        `;
    }).join('');

    // Comment section
    html += `
        <div class="comment-section">
            <label for="evalComments">💬 Ý kiến đóng góp (không bắt buộc)</label>
            <textarea id="evalComments" placeholder="Nhập ý kiến, nhận xét của bạn về giảng viên và môn học..."></textarea>
        </div>
    `;

    body.innerHTML = html;

    // Reset progress
    appState.totalCriteria = totalCriteria;
    updateProgress();

    // Show modal
    document.getElementById('evalModal').classList.add('active');
    body.scrollTop = 0;
}

function updateProgress() {
    const checked = document.querySelectorAll('#modalBody input[type="radio"]:checked').length;
    const total = appState.totalCriteria || 0;
    const pct = total > 0 ? Math.round((checked / total) * 100) : 0;

    document.getElementById('progressText').textContent = `${checked}/${total} câu`;
    document.getElementById('progressFill').style.width = `${pct}%`;

    // Enable submit button khi đã chấm hết
    document.getElementById('submitBtn').disabled = checked < total;
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ========== EVENT LISTENERS ==========

document.addEventListener('DOMContentLoaded', () => {
    // Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;

            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(tab === 'pending' ? 'tabPending' : 'tabSubmitted').classList.add('active');
        });
    });

    // Modal close
    document.getElementById('modalClose').addEventListener('click', () => closeModal('evalModal'));
    document.getElementById('evalModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('evalModal')) closeModal('evalModal');
    });

    // Submit
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', submitEvaluation);
    }

    // Success modal close
    document.getElementById('successCloseBtn').addEventListener('click', () => closeModal('successModal'));
    document.getElementById('successModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('successModal')) closeModal('successModal');
    });

    // ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal('evalModal');
            closeModal('successModal');
        }
    });
});

function setupEventListeners() {
    // Empty function to keep compatibility with initStudentDashboard if it still calls it
}

// ========== UTILITIES ==========

function showLoading(show) {
    document.getElementById('loadingOverlay').style.display = show ? 'flex' : 'none';
}

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

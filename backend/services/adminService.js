const adminRepository = require('../repositories/adminRepository');

class AdminService {
    async getCampaigns() {
        return await adminRepository.getCampaigns();
    }

    async getSemesters() {
        return await adminRepository.getSemesters();
    }

    async createCampaign(data) {
        if (!data.name || !data.semester_id || !data.start_date || !data.end_date) {
            throw { status: 400, message: 'Vui lòng điền đủ thông tin đợt đánh giá' };
        }
        
        if (new Date(data.start_date) >= new Date(data.end_date)) {
            throw { status: 400, message: 'Ngày bắt đầu phải trước ngày kết thúc' };
        }

        const campaignId = await adminRepository.createCampaign({
            ...data,
            is_active: data.is_active !== undefined ? data.is_active : true
        });

        // Tự động tạo bộ tiêu chí mẫu cho đợt mới
        await adminRepository.cloneDefaultCriteria(campaignId);

        return campaignId;
    }

    async updateCampaign(id, data) {
        if (!data.name || !data.semester_id || !data.start_date || !data.end_date) {
            throw { status: 400, message: 'Vui lòng điền đủ thông tin đợt đánh giá' };
        }

        if (new Date(data.start_date) >= new Date(data.end_date)) {
            throw { status: 400, message: 'Ngày bắt đầu phải trước ngày kết thúc' };
        }

        const success = await adminRepository.updateCampaign(id, data);
        if (!success) {
            throw { status: 404, message: 'Không tìm thấy đợt đánh giá' };
        }
        return true;
    }

    async toggleCampaignStatus(id, isActive) {
        const success = await adminRepository.toggleCampaignStatus(id, isActive);
        if (!success) {
            throw { status: 404, message: 'Không tìm thấy đợt đánh giá' };
        }
        return true;
    }
}

module.exports = new AdminService();

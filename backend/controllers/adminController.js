const adminService = require('../services/adminService');

class AdminController {
    async getCampaigns(req, res) {
        try {
            const campaigns = await adminService.getCampaigns();
            res.json({ success: true, data: campaigns });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    
    async getSemesters(req, res) {
        try {
            const semesters = await adminService.getSemesters();
            res.json({ success: true, data: semesters });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async createCampaign(req, res) {
        try {
            const id = await adminService.createCampaign(req.body);
            res.json({ success: true, message: 'Đã tạo đợt đánh giá thành công', data: { id } });
        } catch (error) {
            res.status(error.status || 500).json({ success: false, message: error.message });
        }
    }

    async updateCampaign(req, res) {
        try {
            await adminService.updateCampaign(req.params.id, req.body);
            res.json({ success: true, message: 'Đã cập nhật đợt đánh giá' });
        } catch (error) {
            res.status(error.status || 500).json({ success: false, message: error.message });
        }
    }

    async toggleCampaignStatus(req, res) {
        try {
            const { is_active } = req.body;
            await adminService.toggleCampaignStatus(req.params.id, is_active);
            res.json({ success: true, message: is_active ? 'Đã mở đợt đánh giá' : 'Đã khóa đợt đánh giá' });
        } catch (error) {
            res.status(error.status || 500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new AdminController();

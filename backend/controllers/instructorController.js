const instructorService = require('../services/instructorService');

class InstructorController {
    async getDashboard(req, res) {
        try {
            const instructorId = req.user.id;
            const campaignId = req.query.campaignId;
            const data = await instructorService.getClasses(instructorId, campaignId);
            res.json({ success: true, data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    async getClassResults(req, res) {
        try {
            const instructorId = req.user.id;
            const classId = req.params.classId;
            const campaignId = req.query.campaignId;
            const data = await instructorService.getClassResults(instructorId, classId, campaignId);
            res.json({ success: true, data });
        } catch (error) {
            res.status(error.status || 500).json({ success: false, message: error.message });
        }
    }
}

module.exports = new InstructorController();

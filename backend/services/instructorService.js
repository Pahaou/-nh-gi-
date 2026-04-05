const instructorRepository = require('../repositories/instructorRepository');

class InstructorService {
    async getClasses(instructorId, targetCampaignId = null) {
        const campaigns = await instructorRepository.getActiveCampaigns();
        if (!campaigns || campaigns.length === 0) {
            return { availableCampaigns: [], campaign: null, classes: [] };
        }
        
        let campaign = campaigns[0];
        if (targetCampaignId) {
            const found = campaigns.find(c => c.id == targetCampaignId);
            if (found) campaign = found;
        }

        const classes = await instructorRepository.getInstructorClasses(instructorId, campaign.semester_id);
        return {
            availableCampaigns: campaigns,
            campaign,
            classes
        };
    }

    async getClassResults(instructorId, classId, targetCampaignId = null) {
        const campaigns = await instructorRepository.getActiveCampaigns();
        if (!campaigns || campaigns.length === 0) {
            throw { status: 404, message: 'Không có đợt đánh giá nào đang mở' };
        }

        let campaign = campaigns[0];
        if (targetCampaignId) {
            const found = campaigns.find(c => c.id == targetCampaignId);
            if (found) campaign = found;
        }

        // Verify class belongs to instructor in this semester
        const classes = await instructorRepository.getInstructorClasses(instructorId, campaign.semester_id);
        const ownsClass = classes.find(c => c.class_id === parseInt(classId));
        if (!ownsClass) {
            throw { status: 403, message: 'Bạn không có quyền xem lớp này trong đợt đánh giá này' };
        }

        const results = await instructorRepository.getClassResults(classId, campaign.id);
        return {
            classInfo: ownsClass,
            ...results
        };
    }
}

module.exports = new InstructorService();

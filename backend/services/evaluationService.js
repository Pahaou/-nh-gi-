const evaluationRepository = require('../repositories/evaluationRepository');

class EvaluationService {
    /**
     * Lấy danh sách lớp cần đánh giá
     * (Biểu đồ: getPendingEvaluations)
     */
    async getPendingEvaluations(studentId, targetCampaignId = null) {
        // Lấy các đợt đánh giá đang active
        const campaigns = await evaluationRepository.getActiveCampaigns();
        if (!campaigns || campaigns.length === 0) {
            return { availableCampaigns: [], campaign: null, pendingClasses: [], submittedClasses: [], criteria: [] };
        }

        let campaign = campaigns[0];
        if (targetCampaignId) {
            const found = campaigns.find(c => c.id == targetCampaignId);
            if (found) campaign = found;
        }

        // Lấy danh sách lớp chưa đánh giá
        const pendingClasses = await evaluationRepository.findUnsubmittedClasses(
            studentId, 
            campaign.id
        );

        // Lấy danh sách lớp đã đánh giá
        const submittedClasses = await evaluationRepository.getSubmittedClasses(
            studentId, 
            campaign.id
        );

        // Lấy tiêu chí đánh giá
        const criteria = await evaluationRepository.getCriteriaBycampaign(campaign.id);

        return {
            availableCampaigns: campaigns,
            campaign,
            pendingClasses,
            submittedClasses,
            criteria
        };
    }

    /**
     * Nộp phiếu đánh giá
     * (Biểu đồ: submitEvaluation với validation nghiệp vụ)
     */
    async submitEvaluation(studentId, payload) {
        const { classId, campaignId, criteriaScores, comments } = payload;

        // Validate 1: Kiểm tra đợt đánh giá còn mở
        const isActive = await evaluationRepository.checkCampaignActive(campaignId);
        if (!isActive) {
            throw {
                status: 403,
                message: 'Đợt đánh giá đã đóng hoặc chưa mở'
            };
        }

        // Validate 2: Kiểm tra đã nộp chưa
        const isSubmitted = await evaluationRepository.hasSubmitted(studentId, classId, campaignId);
        if (isSubmitted) {
            throw {
                status: 400,
                message: 'Bạn đã đánh giá lớp học phần này rồi'
            };
        }

        // Validate 3: Kiểm tra dữ liệu điểm
        if (!criteriaScores || criteriaScores.length === 0) {
            throw {
                status: 400,
                message: 'Vui lòng chấm điểm tất cả các tiêu chí'
            };
        }

        // Validate 4: Kiểm tra điểm hợp lệ (1-5)
        for (const cs of criteriaScores) {
            if (cs.score < 1 || cs.score > 5) {
                throw {
                    status: 400,
                    message: `Điểm phải từ 1 đến 5`
                };
            }
        }

        // Lưu phiếu đánh giá (transaction)
        const submissionId = await evaluationRepository.saveSubmission({
            studentId,
            classId,
            campaignId,
            criteriaScores,
            comments
        });

        return {
            success: true,
            submissionId,
            message: 'Gửi đánh giá thành công'
        };
    }
}

module.exports = new EvaluationService();

const evaluationService = require('../services/evaluationService');

class EvaluationController {
    /**
     * GET /api/evaluations/pending
     * Lấy danh sách lớp cần đánh giá
     * (Biểu đồ: bước 1 - Xem danh sách lớp cần đánh giá)
     */
    async getPendingEvaluations(req, res) {
        try {
            const studentId = req.studentId;
            const campaignId = req.query.campaignId;
            const result = await evaluationService.getPendingEvaluations(studentId, campaignId);

            return res.status(200).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('getPendingEvaluations error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Lỗi hệ thống'
            });
        }
    }

    /**
     * POST /api/evaluations/submit
     * Nộp phiếu đánh giá
     * (Biểu đồ: bước 2 - Thực hiện nộp phiếu đánh giá)
     */
    async submitEvaluation(req, res) {
        try {
            const studentId = req.studentId;
            const payload = req.body;

            const result = await evaluationService.submitEvaluation(studentId, payload);

            return res.status(201).json({
                success: true,
                data: result
            });
        } catch (error) {
            console.error('submitEvaluation error:', error);
            const status = error.status || 500;
            return res.status(status).json({
                success: false,
                message: error.message || 'Lỗi hệ thống'
            });
        }
    }
}

module.exports = new EvaluationController();

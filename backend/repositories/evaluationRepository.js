const db = require('../config/database');

class EvaluationRepository {
    /**
     * Tìm các lớp chưa được SV đánh giá trong đợt hiện tại
     * (Biểu đồ: findUnsubmittedClasses)
     */
    async findUnsubmittedClasses(studentId, campaignId) {
        const [rows] = await db.query(`
            SELECT 
                c.id AS class_id,
                c.class_code,
                s.subject_code,
                s.subject_name,
                s.credits,
                i.full_name AS instructor_name,
                i.academic_rank,
                c.schedule,
                c.room,
                sem.name AS semester_name
            FROM enrollments e
            JOIN classes c ON e.class_id = c.id
            JOIN subjects s ON c.subject_id = s.id
            JOIN instructors i ON c.instructor_id = i.id
            JOIN semesters sem ON c.semester_id = sem.id
            JOIN campaigns camp ON camp.semester_id = sem.id AND camp.id = ?
            WHERE e.student_id = ?
              AND NOT EXISTS (
                  SELECT 1 FROM submissions sub
                  WHERE sub.student_id = e.student_id
                    AND sub.class_id = e.class_id
                    AND sub.campaign_id = camp.id
              )
            ORDER BY s.subject_code
        `, [campaignId, studentId]);
        return rows;
    }

    /**
     * Kiểm tra đợt đánh giá có đang mở không
     * (Biểu đồ: checkCampaignActive)
     */
    async checkCampaignActive(campaignId) {
        const [rows] = await db.query(`
            SELECT is_active, start_date, end_date,
                   NOW() BETWEEN start_date AND end_date AS is_in_range
            FROM campaigns 
            WHERE id = ?
        `, [campaignId]);
        if (!rows[0]) return false;
        return rows[0].is_active && rows[0].is_in_range;
    }

    /**
     * Kiểm tra SV đã nộp phiếu cho lớp này trong đợt này chưa
     * (Biểu đồ: hasSubmitted)
     */
    async hasSubmitted(studentId, classId, campaignId) {
        const [rows] = await db.query(`
            SELECT COUNT(*) AS count 
            FROM submissions 
            WHERE student_id = ? AND class_id = ? AND campaign_id = ?
        `, [studentId, classId, campaignId]);
        return rows[0].count > 0;
    }

    /**
     * Lưu phiếu đánh giá (Transaction)
     * (Biểu đồ: saveSubmission)
     */
    async saveSubmission(submissionData) {
        const conn = await db.getConnection();
        try {
            await conn.beginTransaction();

            // Insert submission
            const [result] = await conn.query(`
                INSERT INTO submissions (student_id, class_id, campaign_id, comments)
                VALUES (?, ?, ?, ?)
            `, [
                submissionData.studentId,
                submissionData.classId,
                submissionData.campaignId,
                submissionData.comments || null
            ]);

            const submissionId = result.insertId;

            // Insert submission_details (điểm từng tiêu chí)
            if (submissionData.criteriaScores && submissionData.criteriaScores.length > 0) {
                const values = submissionData.criteriaScores.map(cs => 
                    [submissionId, cs.criteriaId, cs.score]
                );
                await conn.query(`
                    INSERT INTO submission_details (submission_id, criteria_id, score)
                    VALUES ?
                `, [values]);
            }

            await conn.commit();
            return submissionId;
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    /**
     * Lấy các đợt đánh giá đang active
     */
    async getActiveCampaigns() {
        const [rows] = await db.query(`
            SELECT id, name, semester_id, start_date, end_date
            FROM campaigns
            WHERE is_active = TRUE
              AND NOW() BETWEEN start_date AND end_date
            ORDER BY start_date DESC
        `);
        return rows;
    }

    /**
     * Lấy tiêu chí đánh giá theo đợt (grouped)
     */
    async getCriteriaBycampaign(campaignId) {
        const [groups] = await db.query(`
            SELECT id, group_name, display_order
            FROM criteria_groups
            WHERE campaign_id = ?
            ORDER BY display_order
        `, [campaignId]);

        for (const group of groups) {
            const [criteria] = await db.query(`
                SELECT id, content, max_score, display_order
                FROM criteria
                WHERE group_id = ?
                ORDER BY display_order
            `, [group.id]);
            group.criteria = criteria;
        }

        return groups;
    }

    /**
     * Lấy danh sách phiếu đã nộp của SV
     */
    async getSubmittedClasses(studentId, campaignId) {
        const [rows] = await db.query(`
            SELECT 
                sub.id AS submission_id,
                sub.submitted_at,
                sub.comments,
                c.class_code,
                s.subject_name,
                i.full_name AS instructor_name
            FROM submissions sub
            JOIN classes c ON sub.class_id = c.id
            JOIN subjects s ON c.subject_id = s.id
            JOIN instructors i ON c.instructor_id = i.id
            WHERE sub.student_id = ? AND sub.campaign_id = ?
            ORDER BY sub.submitted_at DESC
        `, [studentId, campaignId]);
        return rows;
    }
}

module.exports = new EvaluationRepository();

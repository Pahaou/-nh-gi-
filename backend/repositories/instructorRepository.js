const db = require('../config/database');

class InstructorRepository {
    async getActiveCampaigns() {
        const [rows] = await db.query(`
            SELECT id, name, semester_id 
            FROM campaigns 
            WHERE is_active = TRUE AND NOW() BETWEEN start_date AND end_date
            ORDER BY start_date DESC
        `);
        return rows;
    }

    async getInstructorClasses(instructorId, semesterId) {
        const [rows] = await db.query(`
            SELECT 
                c.id AS class_id, c.class_code, c.schedule, c.room,
                s.subject_code, s.subject_name, s.credits,
                (SELECT COUNT(*) FROM enrollments WHERE class_id = c.id) as total_students,
                (SELECT COUNT(*) FROM submissions sub 
                 JOIN campaigns camp ON sub.campaign_id = camp.id 
                 WHERE sub.class_id = c.id AND camp.semester_id = c.semester_id) as submitted_students
            FROM classes c
            JOIN subjects s ON c.subject_id = s.id
            WHERE c.instructor_id = ? AND c.semester_id = ?
        `, [instructorId, semesterId]);
        return rows;
    }

    async getClassResults(classId, campaignId) {
        // Average scores grouped by criteria
        const [criteriaScores] = await db.query(`
            SELECT 
                cg.group_name,
                cr.content as criteria_content,
                cr.max_score,
                ROUND(AVG(sd.score), 2) as avg_score
            FROM submission_details sd
            JOIN submissions sub ON sd.submission_id = sub.id
            JOIN criteria cr ON sd.criteria_id = cr.id
            JOIN criteria_groups cg ON cr.group_id = cg.id
            WHERE sub.class_id = ? AND sub.campaign_id = ?
            GROUP BY cr.id, cg.group_name, cr.content, cr.max_score
            ORDER BY cg.display_order, cr.display_order
        `, [classId, campaignId]);

        // Comments
        const [comments] = await db.query(`
            SELECT comments, submitted_at
            FROM submissions
            WHERE class_id = ? AND campaign_id = ? AND comments IS NOT NULL AND comments != ''
            ORDER BY submitted_at DESC
        `, [classId, campaignId]);

        return { criteriaScores, comments };
    }
}

module.exports = new InstructorRepository();

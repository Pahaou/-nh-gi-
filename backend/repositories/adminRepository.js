const db = require('../config/database');

class AdminRepository {
    async getCampaigns() {
        const [rows] = await db.query(`
            SELECT c.*, s.name as semester_name,
                   (SELECT COUNT(*) FROM classes WHERE semester_id = c.semester_id) as total_classes,
                   (SELECT COUNT(DISTINCT class_id) FROM submissions WHERE campaign_id = c.id) as evaluated_classes
            FROM campaigns c
            JOIN semesters s ON c.semester_id = s.id
            ORDER BY c.start_date DESC
        `);
        return rows;
    }

    async getSemesters() {
        const [rows] = await db.query('SELECT * FROM semesters ORDER BY start_date DESC');
        return rows;
    }

    async createCampaign(data) {
        const [result] = await db.query(`
            INSERT INTO campaigns (name, semester_id, start_date, end_date, is_active)
            VALUES (?, ?, ?, ?, ?)
        `, [data.name, data.semester_id, data.start_date, data.end_date, data.is_active ? 1 : 0]);
        return result.insertId;
    }

    async updateCampaign(id, data) {
        const [result] = await db.query(`
            UPDATE campaigns 
            SET name = ?, semester_id = ?, start_date = ?, end_date = ?
            WHERE id = ?
        `, [data.name, data.semester_id, data.start_date, data.end_date, id]);
        return result.affectedRows > 0;
    }

    async toggleCampaignStatus(id, isActive) {
        const [result] = await db.query(`
            UPDATE campaigns SET is_active = ? WHERE id = ?
        `, [isActive ? 1 : 0, id]);
        return result.affectedRows > 0;
    }
    
    // Auto-create criteria groups/criteria for new campaign for simplicity
    async cloneDefaultCriteria(campaignId) {
        // Clone from campaign 1 for demo purposes
        const [groups] = await db.query('SELECT * FROM criteria_groups WHERE campaign_id = 1');
        for (const g of groups) {
            const [grpResult] = await db.query(
                'INSERT INTO criteria_groups (campaign_id, group_name, display_order) VALUES (?, ?, ?)',
                [campaignId, g.group_name, g.display_order]
            );
            const newGroupId = grpResult.insertId;
            
            const [criteria] = await db.query('SELECT * FROM criteria WHERE group_id = ?', [g.id]);
            for (const c of criteria) {
                await db.query(
                    'INSERT INTO criteria (group_id, content, max_score, display_order) VALUES (?, ?, ?, ?)',
                    [newGroupId, c.content, c.max_score, c.display_order]
                );
            }
        }
    }
}

module.exports = new AdminRepository();

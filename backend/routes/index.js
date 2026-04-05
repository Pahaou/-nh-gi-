const express = require('express');
const router = express.Router();
const { authMiddleware, requireRole } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const evaluationController = require('../controllers/evaluationController');
const adminController = require('../controllers/adminController');
const instructorController = require('../controllers/instructorController');

// ========== Auth Routes (Public) ==========
router.post('/auth/login', (req, res) => authController.login(req, res));

// ========== Auth Routes (Protected) ==========
router.get('/auth/me', authMiddleware, (req, res) => authController.getMe(req, res));

// ========== Evaluation Routes (Student) ==========
router.get('/evaluations/pending', authMiddleware, requireRole('student'), (req, res) => evaluationController.getPendingEvaluations(req, res));
router.post('/evaluations/submit', authMiddleware, requireRole('student'), (req, res) => evaluationController.submitEvaluation(req, res));

// ========== Admin Routes ==========
router.get('/admin/campaigns', authMiddleware, requireRole('admin'), (req, res) => adminController.getCampaigns(req, res));
router.get('/admin/semesters', authMiddleware, requireRole('admin'), (req, res) => adminController.getSemesters(req, res));
router.post('/admin/campaigns', authMiddleware, requireRole('admin'), (req, res) => adminController.createCampaign(req, res));
router.put('/admin/campaigns/:id', authMiddleware, requireRole('admin'), (req, res) => adminController.updateCampaign(req, res));
router.put('/admin/campaigns/:id/toggle', authMiddleware, requireRole('admin'), (req, res) => adminController.toggleCampaignStatus(req, res));

// ========== Instructor Routes ==========
router.get('/instructor/dashboard', authMiddleware, requireRole('instructor'), (req, res) => instructorController.getDashboard(req, res));
router.get('/instructor/classes/:classId/results', authMiddleware, requireRole('instructor'), (req, res) => instructorController.getClassResults(req, res));

module.exports = router;

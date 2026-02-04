const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user settings
router.get('/', authenticateToken, async (req, res) => {
  res.json({
    companyName: req.user.companyName,
    email: req.user.email,
    phone: req.user.phone,
    testingSchedule: req.user.testingSchedule,
    defaultReminderDays: req.user.defaultReminderDays,
  });
});

// Update company info
router.put(
  '/company',
  authenticateToken,
  [
    body('companyName').optional().notEmpty().trim(),
    body('phone').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { companyName, phone } = req.body;

    try {
      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          companyName: companyName || req.user.companyName,
          phone: phone !== undefined ? (phone || null) : req.user.phone,
        },
        select: {
          id: true,
          email: true,
          companyName: true,
          phone: true,
          testingSchedule: true,
          defaultReminderDays: true,
        },
      });

      res.json(user);
    } catch (error) {
      console.error('Update company error:', error);
      res.status(500).json({ error: 'Failed to update company info' });
    }
  }
);

// Update testing schedule
router.put(
  '/schedule',
  authenticateToken,
  [
    body('testingSchedule').isIn(['SEMI_ANNUAL', 'QUARTERLY']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { testingSchedule } = req.body;

    try {
      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: { testingSchedule },
        select: {
          id: true,
          email: true,
          companyName: true,
          phone: true,
          testingSchedule: true,
          defaultReminderDays: true,
        },
      });

      res.json(user);
    } catch (error) {
      console.error('Update schedule error:', error);
      res.status(500).json({ error: 'Failed to update testing schedule' });
    }
  }
);

// Update reminder preferences
router.put(
  '/reminders',
  authenticateToken,
  [
    body('defaultReminderDays').isArray(),
    body('defaultReminderDays.*').isInt({ min: 1, max: 365 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { defaultReminderDays } = req.body;

    try {
      const user = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          defaultReminderDays: defaultReminderDays.sort((a, b) => b - a),
        },
        select: {
          id: true,
          email: true,
          companyName: true,
          phone: true,
          testingSchedule: true,
          defaultReminderDays: true,
        },
      });

      res.json(user);
    } catch (error) {
      console.error('Update reminders error:', error);
      res.status(500).json({ error: 'Failed to update reminder preferences' });
    }
  }
);

// Change password
router.put(
  '/password',
  authenticateToken,
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });

      // Verify current password
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: req.user.id },
        data: { password: hashedPassword },
      });

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  }
);

module.exports = router;

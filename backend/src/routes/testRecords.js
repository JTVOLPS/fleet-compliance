const express = require('express');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { calculateNextDueDate, calculateStatus } = require('../utils/statusCalculator');

const router = express.Router();
const prisma = new PrismaClient();

// Get test records for a truck
router.get('/truck/:truckId', authenticateToken, async (req, res) => {
  try {
    // Verify ownership
    const truck = await prisma.truck.findFirst({
      where: {
        id: req.params.truckId,
        userId: req.user.id,
      },
    });

    if (!truck) {
      return res.status(404).json({ error: 'Truck not found' });
    }

    const testRecords = await prisma.testRecord.findMany({
      where: { truckId: req.params.truckId },
      orderBy: { testDate: 'desc' },
    });

    res.json(testRecords);
  } catch (error) {
    console.error('Get test records error:', error);
    res.status(500).json({ error: 'Failed to fetch test records' });
  }
});

// Add test record
router.post(
  '/',
  authenticateToken,
  [
    body('truckId').notEmpty(),
    body('testDate').isISO8601(),
    body('testResult').isIn(['PASS', 'FAIL']),
    body('testerName').notEmpty().trim(),
    body('schedule').optional().isIn(['SEMI_ANNUAL', 'QUARTERLY']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { truckId, testDate, testResult, testerName, notes, schedule } = req.body;

    try {
      // Verify ownership
      const truck = await prisma.truck.findFirst({
        where: {
          id: truckId,
          userId: req.user.id,
        },
        include: {
          user: true,
        },
      });

      if (!truck) {
        return res.status(404).json({ error: 'Truck not found' });
      }

      // Use provided schedule or user's default
      const testingSchedule = schedule || truck.user.testingSchedule;
      const nextDueDate = calculateNextDueDate(testDate, testingSchedule);

      // Create test record
      const testRecord = await prisma.testRecord.create({
        data: {
          truckId,
          testDate: new Date(testDate),
          testResult,
          nextDueDate,
          testerName,
          notes: notes || null,
        },
      });

      // Update truck based on test result
      if (testResult === 'PASS') {
        const newStatus = calculateStatus(nextDueDate);
        await prisma.truck.update({
          where: { id: truckId },
          data: {
            nextDueDate,
            status: newStatus,
            needsRetest: false,
          },
        });

        // Generate reminders for the new due date
        const reminderDays = truck.user.defaultReminderDays || [30, 14, 3];
        const now = new Date();

        for (const days of reminderDays) {
          const reminderDate = new Date(nextDueDate);
          reminderDate.setDate(reminderDate.getDate() - days);

          if (reminderDate > now) {
            await prisma.reminder.create({
              data: {
                truckId,
                reminderDate,
                reminderType: 'EMAIL',
                sent: false,
              },
            });
          }
        }
      } else {
        // Test failed - mark as needs retest, don't advance due date
        await prisma.truck.update({
          where: { id: truckId },
          data: {
            needsRetest: true,
          },
        });
      }

      // Return updated truck with test record
      const updatedTruck = await prisma.truck.findUnique({
        where: { id: truckId },
        include: {
          testRecords: {
            orderBy: { testDate: 'desc' },
          },
        },
      });

      res.status(201).json({
        testRecord,
        truck: updatedTruck,
      });
    } catch (error) {
      console.error('Create test record error:', error);
      res.status(500).json({ error: 'Failed to create test record' });
    }
  }
);

// Delete test record
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const testRecord = await prisma.testRecord.findUnique({
      where: { id: req.params.id },
      include: {
        truck: true,
      },
    });

    if (!testRecord) {
      return res.status(404).json({ error: 'Test record not found' });
    }

    // Verify ownership
    if (testRecord.truck.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.testRecord.delete({
      where: { id: req.params.id },
    });

    // Recalculate truck's next due date based on remaining records
    const latestRecord = await prisma.testRecord.findFirst({
      where: {
        truckId: testRecord.truckId,
        testResult: 'PASS',
      },
      orderBy: { testDate: 'desc' },
    });

    if (latestRecord) {
      const newStatus = calculateStatus(latestRecord.nextDueDate);
      await prisma.truck.update({
        where: { id: testRecord.truckId },
        data: {
          nextDueDate: latestRecord.nextDueDate,
          status: newStatus,
        },
      });
    } else {
      // No passing records, reset truck
      await prisma.truck.update({
        where: { id: testRecord.truckId },
        data: {
          nextDueDate: null,
          status: 'COMPLIANT',
        },
      });
    }

    res.json({ message: 'Test record deleted successfully' });
  } catch (error) {
    console.error('Delete test record error:', error);
    res.status(500).json({ error: 'Failed to delete test record' });
  }
});

module.exports = router;

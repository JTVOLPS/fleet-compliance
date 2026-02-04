const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all reminders for user's trucks
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { sent, upcoming } = req.query;

    const trucks = await prisma.truck.findMany({
      where: { userId: req.user.id },
      select: { id: true },
    });

    const truckIds = trucks.map((t) => t.id);

    const where = {
      truckId: { in: truckIds },
    };

    if (sent !== undefined) {
      where.sent = sent === 'true';
    }

    if (upcoming === 'true') {
      where.reminderDate = {
        gte: new Date(),
      };
      where.sent = false;
    }

    const reminders = await prisma.reminder.findMany({
      where,
      include: {
        truck: {
          select: {
            id: true,
            unitNumber: true,
            vin: true,
            nextDueDate: true,
          },
        },
      },
      orderBy: { reminderDate: 'asc' },
    });

    res.json(reminders);
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Get reminders for specific truck
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

    const reminders = await prisma.reminder.findMany({
      where: { truckId: req.params.truckId },
      orderBy: { reminderDate: 'asc' },
    });

    res.json(reminders);
  } catch (error) {
    console.error('Get truck reminders error:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Create manual reminder
router.post('/', authenticateToken, async (req, res) => {
  const { truckId, reminderDate, reminderType } = req.body;

  try {
    // Verify ownership
    const truck = await prisma.truck.findFirst({
      where: {
        id: truckId,
        userId: req.user.id,
      },
    });

    if (!truck) {
      return res.status(404).json({ error: 'Truck not found' });
    }

    const reminder = await prisma.reminder.create({
      data: {
        truckId,
        reminderDate: new Date(reminderDate),
        reminderType: reminderType || 'EMAIL',
        sent: false,
      },
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Delete reminder
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id: req.params.id },
      include: {
        truck: true,
      },
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Verify ownership
    if (reminder.truck.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await prisma.reminder.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

// Mark reminder as sent (for testing/manual trigger)
router.patch('/:id/send', authenticateToken, async (req, res) => {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id: req.params.id },
      include: {
        truck: true,
      },
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    // Verify ownership
    if (reminder.truck.userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updated = await prisma.reminder.update({
      where: { id: req.params.id },
      data: {
        sent: true,
        sentAt: new Date(),
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ error: 'Failed to send reminder' });
  }
});

module.exports = router;

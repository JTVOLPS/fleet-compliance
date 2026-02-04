const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { updateUserTruckStatuses } = require('../services/statusService');

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Update all statuses first
    await updateUserTruckStatuses(req.user.id);

    const trucks = await prisma.truck.findMany({
      where: { userId: req.user.id },
    });

    const total = trucks.length;
    const compliant = trucks.filter((t) => t.status === 'COMPLIANT').length;
    const dueSoon = trucks.filter((t) => t.status === 'DUE_SOON').length;
    const overdue = trucks.filter((t) => t.status === 'OVERDUE').length;
    const needsRetest = trucks.filter((t) => t.needsRetest).length;

    // Get upcoming reminders (next 30 days)
    const truckIds = trucks.map((t) => t.id);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingReminders = await prisma.reminder.findMany({
      where: {
        truckId: { in: truckIds },
        sent: false,
        reminderDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
      include: {
        truck: {
          select: {
            unitNumber: true,
            nextDueDate: true,
          },
        },
      },
      orderBy: { reminderDate: 'asc' },
      take: 10,
    });

    // Get trucks due soon
    const trucksDueSoon = await prisma.truck.findMany({
      where: {
        userId: req.user.id,
        status: { in: ['DUE_SOON', 'OVERDUE'] },
      },
      orderBy: { nextDueDate: 'asc' },
      take: 5,
    });

    res.json({
      stats: {
        total,
        compliant,
        dueSoon,
        overdue,
        needsRetest,
      },
      upcomingReminders,
      trucksDueSoon,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Get compliance summary by fleet tag
router.get('/by-fleet-tag', authenticateToken, async (req, res) => {
  try {
    const trucks = await prisma.truck.findMany({
      where: { userId: req.user.id },
    });

    const byFleetTag = {};
    trucks.forEach((truck) => {
      const tag = truck.fleetTag || 'Unassigned';
      if (!byFleetTag[tag]) {
        byFleetTag[tag] = {
          total: 0,
          compliant: 0,
          dueSoon: 0,
          overdue: 0,
        };
      }
      byFleetTag[tag].total++;
      if (truck.status === 'COMPLIANT') byFleetTag[tag].compliant++;
      if (truck.status === 'DUE_SOON') byFleetTag[tag].dueSoon++;
      if (truck.status === 'OVERDUE') byFleetTag[tag].overdue++;
    });

    res.json(byFleetTag);
  } catch (error) {
    console.error('Get fleet tag stats error:', error);
    res.status(500).json({ error: 'Failed to fetch fleet tag stats' });
  }
});

module.exports = router;

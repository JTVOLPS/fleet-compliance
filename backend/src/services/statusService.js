const { PrismaClient } = require('@prisma/client');
const { calculateStatus } = require('../utils/statusCalculator');

const prisma = new PrismaClient();

const updateTruckStatus = async (truckId) => {
  const truck = await prisma.truck.findUnique({
    where: { id: truckId },
  });

  if (!truck) return null;

  const newStatus = calculateStatus(truck.nextDueDate);

  if (newStatus !== truck.status) {
    return await prisma.truck.update({
      where: { id: truckId },
      data: { status: newStatus },
    });
  }

  return truck;
};

const updateAllTruckStatuses = async () => {
  const trucks = await prisma.truck.findMany();

  for (const truck of trucks) {
    await updateTruckStatus(truck.id);
  }

  return { updated: trucks.length };
};

const updateUserTruckStatuses = async (userId) => {
  const trucks = await prisma.truck.findMany({
    where: { userId },
  });

  for (const truck of trucks) {
    await updateTruckStatus(truck.id);
  }

  return { updated: trucks.length };
};

const generateReminders = async () => {
  const now = new Date();
  const reminderDays = [30, 14, 3];

  // Get all trucks with upcoming due dates
  const trucks = await prisma.truck.findMany({
    where: {
      nextDueDate: {
        gte: now,
      },
    },
    include: {
      user: true,
      reminders: true,
    },
  });

  let created = 0;

  for (const truck of trucks) {
    const userReminderDays = truck.user.defaultReminderDays || reminderDays;

    for (const days of userReminderDays) {
      const reminderDate = new Date(truck.nextDueDate);
      reminderDate.setDate(reminderDate.getDate() - days);

      // Check if reminder already exists
      const existingReminder = truck.reminders.find(
        (r) => Math.abs(new Date(r.reminderDate) - reminderDate) < 86400000 // within 1 day
      );

      if (!existingReminder && reminderDate > now) {
        await prisma.reminder.create({
          data: {
            truckId: truck.id,
            reminderDate,
            reminderType: 'EMAIL',
            sent: false,
          },
        });
        created++;
      }
    }
  }

  return { created };
};

const processReminders = async () => {
  const now = new Date();

  // Find unsent reminders that are due
  const dueReminders = await prisma.reminder.findMany({
    where: {
      sent: false,
      reminderDate: {
        lte: now,
      },
    },
    include: {
      truck: {
        include: {
          user: true,
        },
      },
    },
  });

  const processed = [];

  for (const reminder of dueReminders) {
    // Log the reminder (actual email/SMS sending would go here)
    console.log(`[REMINDER] ${reminder.reminderType} to ${reminder.truck.user.email}`);
    console.log(`  Truck: ${reminder.truck.unitNumber}`);
    console.log(`  Due Date: ${reminder.truck.nextDueDate}`);

    // Mark as sent
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: {
        sent: true,
        sentAt: now,
      },
    });

    processed.push(reminder);
  }

  return { processed: processed.length };
};

module.exports = {
  updateTruckStatus,
  updateAllTruckStatuses,
  updateUserTruckStatuses,
  generateReminders,
  processReminders,
};

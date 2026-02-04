const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.reminder.deleteMany();
  await prisma.testRecord.deleteMany();
  await prisma.truck.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@cleantruckchecksd.com',
      password: hashedPassword,
      companyName: 'Clean Truck Check SD',
      phone: '619-555-0123',
      defaultReminderDays: [30, 14, 3],
      testingSchedule: 'SEMI_ANNUAL',
    },
  });

  console.log('Created demo user:', demoUser.email);

  // Sample truck data with realistic VINs
  const trucks = [
    // Compliant trucks (8)
    { unitNumber: 'TRK-001', vin: '1FUJGHDV0CLBP8834', licensePlate: '8ABC123', engineYear: 2020, fuelType: 'DIESEL', fleetTag: 'Yard A', daysUntilDue: 120 },
    { unitNumber: 'TRK-002', vin: '1XKAD49X1GJ424891', licensePlate: '8DEF456', engineYear: 2021, fuelType: 'DIESEL', fleetTag: 'Yard A', daysUntilDue: 95 },
    { unitNumber: 'TRK-003', vin: '3AKJHHDR5LSLN4352', licensePlate: '8GHI789', engineYear: 2019, fuelType: 'DIESEL', fleetTag: 'Route 5', daysUntilDue: 85 },
    { unitNumber: 'TRK-004', vin: '1HTMMAAL98H681053', licensePlate: '8JKL012', engineYear: 2022, fuelType: 'ALT_FUEL', fleetTag: 'Route 5', daysUntilDue: 150 },
    { unitNumber: 'TRK-005', vin: '5PVNJ8JT4H4S55987', licensePlate: '8MNO345', engineYear: 2020, fuelType: 'DIESEL', fleetTag: 'Yard B', daysUntilDue: 75 },
    { unitNumber: 'TRK-006', vin: '1FUJA6CV67LW12345', licensePlate: '8PQR678', engineYear: 2018, fuelType: 'DIESEL', fleetTag: 'Yard B', daysUntilDue: 60 },
    { unitNumber: 'TRK-007', vin: '3HSDJAPR8CN123456', licensePlate: '8STU901', engineYear: 2021, fuelType: 'ALT_FUEL', fleetTag: 'Route 8', daysUntilDue: 45 },
    { unitNumber: 'TRK-008', vin: '1XPWD40X2GD789012', licensePlate: '8VWX234', engineYear: 2023, fuelType: 'DIESEL', fleetTag: 'Route 8', daysUntilDue: 35 },

    // Due soon trucks (4 - within 30 days)
    { unitNumber: 'TRK-009', vin: '2FWJA3CV67LY54321', licensePlate: '8YZA567', engineYear: 2019, fuelType: 'DIESEL', fleetTag: 'Yard A', daysUntilDue: 28 },
    { unitNumber: 'TRK-010', vin: '1HTSDAAN09H987654', licensePlate: '8BCD890', engineYear: 2020, fuelType: 'DIESEL', fleetTag: 'Route 5', daysUntilDue: 18 },
    { unitNumber: 'TRK-011', vin: '3AKJGLDR4MSMP1234', licensePlate: '8EFG123', engineYear: 2017, fuelType: 'DIESEL', fleetTag: 'Yard B', daysUntilDue: 7 },
    { unitNumber: 'TRK-012', vin: '1FUJGLDR0BSBS5678', licensePlate: '8HIJ456', engineYear: 2022, fuelType: 'ALT_FUEL', fleetTag: 'Route 8', daysUntilDue: 3 },

    // Overdue trucks (3)
    { unitNumber: 'TRK-013', vin: '5PVNJ8JT1G4T91011', licensePlate: '8KLM789', engineYear: 2016, fuelType: 'DIESEL', fleetTag: 'Yard A', daysUntilDue: -5 },
    { unitNumber: 'TRK-014', vin: '1XKWDB0X37J112233', licensePlate: '8NOP012', engineYear: 2018, fuelType: 'DIESEL', fleetTag: 'Route 5', daysUntilDue: -15 },
    { unitNumber: 'TRK-015', vin: '3HSDJSJR7CN445566', licensePlate: '8QRS345', engineYear: 2015, fuelType: 'DIESEL', fleetTag: 'Yard B', daysUntilDue: -30, needsRetest: true },
  ];

  const now = new Date();

  for (const truckData of trucks) {
    const nextDueDate = new Date(now);
    nextDueDate.setDate(nextDueDate.getDate() + truckData.daysUntilDue);

    // Calculate last test date (6 months before next due)
    const lastTestDate = new Date(nextDueDate);
    lastTestDate.setMonth(lastTestDate.getMonth() - 6);

    // Determine status
    let status = 'COMPLIANT';
    if (truckData.daysUntilDue <= 0) {
      status = 'OVERDUE';
    } else if (truckData.daysUntilDue <= 30) {
      status = 'DUE_SOON';
    }

    const truck = await prisma.truck.create({
      data: {
        userId: demoUser.id,
        unitNumber: truckData.unitNumber,
        vin: truckData.vin,
        licensePlate: truckData.licensePlate,
        engineYear: truckData.engineYear,
        fuelType: truckData.fuelType,
        fleetTag: truckData.fleetTag,
        status: status,
        needsRetest: truckData.needsRetest || false,
        nextDueDate: nextDueDate,
      },
    });

    // Create test history (2-3 records per truck)
    const numRecords = Math.floor(Math.random() * 2) + 2;
    const testerNames = ['Mike Johnson', 'Sarah Williams', 'David Chen', 'Emily Rodriguez', 'James Brown'];

    for (let i = 0; i < numRecords; i++) {
      const testDate = new Date(lastTestDate);
      testDate.setMonth(testDate.getMonth() - (i * 6));

      const recordNextDue = new Date(testDate);
      recordNextDue.setMonth(recordNextDue.getMonth() + 6);

      // Last record for TRK-015 was a fail
      const testResult = (truckData.needsRetest && i === 0) ? 'FAIL' : 'PASS';

      await prisma.testRecord.create({
        data: {
          truckId: truck.id,
          testDate: testDate,
          testResult: testResult,
          nextDueDate: recordNextDue,
          testerName: testerNames[Math.floor(Math.random() * testerNames.length)],
          notes: testResult === 'PASS'
            ? 'All emissions within acceptable limits.'
            : 'Failed NOx emissions test. Requires retest after repairs.',
        },
      });
    }

    // Create reminders for trucks that are due soon or not yet due
    if (truckData.daysUntilDue > 0) {
      const reminderDays = [30, 14, 3];
      for (const days of reminderDays) {
        if (truckData.daysUntilDue > days) {
          const reminderDate = new Date(nextDueDate);
          reminderDate.setDate(reminderDate.getDate() - days);

          const shouldBeSent = reminderDate <= now;

          await prisma.reminder.create({
            data: {
              truckId: truck.id,
              reminderDate: reminderDate,
              reminderType: 'EMAIL',
              sent: shouldBeSent,
              sentAt: shouldBeSent ? reminderDate : null,
            },
          });
        }
      }
    }

    console.log(`Created truck: ${truck.unitNumber} (${status})`);
  }

  console.log('\nSeed completed successfully!');
  console.log('Demo account: demo@cleantruckchecksd.com / demo123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

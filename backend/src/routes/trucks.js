const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
const { updateTruckStatus } = require('../services/statusService');
const { calculateStatus } = require('../utils/statusCalculator');

const router = express.Router();
const prisma = new PrismaClient();

// Get all trucks for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, search, sortBy = 'unitNumber', sortOrder = 'asc' } = req.query;

    const where = { userId: req.user.id };

    if (status && status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { unitNumber: { contains: search, mode: 'insensitive' } },
        { vin: { contains: search, mode: 'insensitive' } },
        { licensePlate: { contains: search, mode: 'insensitive' } },
        { fleetTag: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy = {};
    if (sortBy === 'nextDueDate') {
      orderBy.nextDueDate = sortOrder;
    } else if (sortBy === 'status') {
      orderBy.status = sortOrder;
    } else if (sortBy === 'engineYear') {
      orderBy.engineYear = sortOrder;
    } else {
      orderBy.unitNumber = sortOrder;
    }

    const trucks = await prisma.truck.findMany({
      where,
      include: {
        testRecords: {
          orderBy: { testDate: 'desc' },
          take: 1,
        },
      },
      orderBy,
    });

    // Update statuses on fetch
    const updatedTrucks = await Promise.all(
      trucks.map(async (truck) => {
        const newStatus = calculateStatus(truck.nextDueDate);
        if (newStatus !== truck.status) {
          return await prisma.truck.update({
            where: { id: truck.id },
            data: { status: newStatus },
            include: {
              testRecords: {
                orderBy: { testDate: 'desc' },
                take: 1,
              },
            },
          });
        }
        return truck;
      })
    );

    res.json(updatedTrucks);
  } catch (error) {
    console.error('Get trucks error:', error);
    res.status(500).json({ error: 'Failed to fetch trucks' });
  }
});

// Get single truck
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const truck = await prisma.truck.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: {
        testRecords: {
          orderBy: { testDate: 'desc' },
        },
        reminders: {
          orderBy: { reminderDate: 'asc' },
        },
      },
    });

    if (!truck) {
      return res.status(404).json({ error: 'Truck not found' });
    }

    // Update status
    const newStatus = calculateStatus(truck.nextDueDate);
    if (newStatus !== truck.status) {
      const updatedTruck = await prisma.truck.update({
        where: { id: truck.id },
        data: { status: newStatus },
        include: {
          testRecords: {
            orderBy: { testDate: 'desc' },
          },
          reminders: {
            orderBy: { reminderDate: 'asc' },
          },
        },
      });
      return res.json(updatedTruck);
    }

    res.json(truck);
  } catch (error) {
    console.error('Get truck error:', error);
    res.status(500).json({ error: 'Failed to fetch truck' });
  }
});

// Create truck
router.post(
  '/',
  authenticateToken,
  [
    body('unitNumber').notEmpty().trim(),
    body('vin').notEmpty().trim().isLength({ min: 17, max: 17 }),
    body('licensePlate').notEmpty().trim(),
    body('engineYear').isInt({ min: 1990, max: new Date().getFullYear() + 1 }),
    body('fuelType').isIn(['DIESEL', 'ALT_FUEL']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { unitNumber, vin, licensePlate, engineYear, fuelType, fleetTag } = req.body;

    try {
      // Check for duplicate VIN
      const existingTruck = await prisma.truck.findFirst({
        where: {
          userId: req.user.id,
          vin: vin.toUpperCase(),
        },
      });

      if (existingTruck) {
        return res.status(400).json({ error: 'A truck with this VIN already exists' });
      }

      const truck = await prisma.truck.create({
        data: {
          userId: req.user.id,
          unitNumber,
          vin: vin.toUpperCase(),
          licensePlate: licensePlate.toUpperCase(),
          engineYear,
          fuelType,
          fleetTag: fleetTag || null,
          status: 'COMPLIANT',
        },
      });

      res.status(201).json(truck);
    } catch (error) {
      console.error('Create truck error:', error);
      res.status(500).json({ error: 'Failed to create truck' });
    }
  }
);

// Update truck
router.put(
  '/:id',
  authenticateToken,
  [
    body('unitNumber').optional().notEmpty().trim(),
    body('vin').optional().notEmpty().trim().isLength({ min: 17, max: 17 }),
    body('licensePlate').optional().notEmpty().trim(),
    body('engineYear').optional().isInt({ min: 1990, max: new Date().getFullYear() + 1 }),
    body('fuelType').optional().isIn(['DIESEL', 'ALT_FUEL']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Verify ownership
      const existingTruck = await prisma.truck.findFirst({
        where: {
          id: req.params.id,
          userId: req.user.id,
        },
      });

      if (!existingTruck) {
        return res.status(404).json({ error: 'Truck not found' });
      }

      const { unitNumber, vin, licensePlate, engineYear, fuelType, fleetTag } = req.body;

      // Check for duplicate VIN if VIN is being changed
      if (vin && vin.toUpperCase() !== existingTruck.vin) {
        const duplicateVin = await prisma.truck.findFirst({
          where: {
            userId: req.user.id,
            vin: vin.toUpperCase(),
            NOT: { id: req.params.id },
          },
        });

        if (duplicateVin) {
          return res.status(400).json({ error: 'A truck with this VIN already exists' });
        }
      }

      const truck = await prisma.truck.update({
        where: { id: req.params.id },
        data: {
          unitNumber: unitNumber || existingTruck.unitNumber,
          vin: vin ? vin.toUpperCase() : existingTruck.vin,
          licensePlate: licensePlate ? licensePlate.toUpperCase() : existingTruck.licensePlate,
          engineYear: engineYear || existingTruck.engineYear,
          fuelType: fuelType || existingTruck.fuelType,
          fleetTag: fleetTag !== undefined ? (fleetTag || null) : existingTruck.fleetTag,
        },
      });

      res.json(truck);
    } catch (error) {
      console.error('Update truck error:', error);
      res.status(500).json({ error: 'Failed to update truck' });
    }
  }
);

// Delete truck
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Verify ownership
    const truck = await prisma.truck.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!truck) {
      return res.status(404).json({ error: 'Truck not found' });
    }

    await prisma.truck.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Truck deleted successfully' });
  } catch (error) {
    console.error('Delete truck error:', error);
    res.status(500).json({ error: 'Failed to delete truck' });
  }
});

module.exports = router;

const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ensureRole = require('../middleware/authMiddleware');

router.get('/dashboard', ensureRole('BRANCH_MANAGER'), async (req, res, next) => {
  try {
    const branchId = req.user.branchId;
    const { from, to } = req.query;

    const orders = await prisma.order.findMany({
      where: {
        branchId,
        orderDate: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
      },
      include: { user: true, branch: true, menuItem: true },
    });

    const priceMapping = {
      1: 10.99,  // GRILLED_CHICKEN
      2: 12.99,  // PASTA_ALFREDO
      3: 14.99,  // PIZZA_MARGHERITA
      4: 16.99,  // SUSHI_ROLL
      5: 18.99,  // BURGER_DELUXE
      6: 9.99,   // CAESAR_SALAD
    };

    const totalEarnings = orders.reduce((total, order) => {
      const price = priceMapping[order.menuItemId]; 
      if (price) {
        return total + price; 
      }
      return total; 
    }, 0);

    res.render('branch-report', { orders, totalEarnings });
  } catch (error) {
    next(error);
  }
});


router.get('/hqm-report', ensureRole('HQM'), async (req, res, next) => {
  try {
    const { from, to, branchId } = req.query;

    // Fetch orders based on filters
    const orders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: from ? new Date(from) : undefined,
          lte: to ? new Date(to) : undefined,
        },
        branchId: branchId ? Number(branchId) : undefined,
      },
      include: {
        user: true,
        branch: true,
        menuItem: true,
      },
    });

    // Fetch branches for the dropdown
    const branches = await prisma.branch.findMany();

    // Render the page with fetched data
    res.render('hqm-report', {
      orders,
      branches,
      selectedBranchId: branchId,
    });
  } catch (error) {
    next(error);
  }
});


module.exports = router;



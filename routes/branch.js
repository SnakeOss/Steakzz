const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware to verify admin role
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'ADMIN') {
    return next();
  }
  res.status(403).json({ message: 'Access denied. Admins only.' });
}

// GET route to render the add-branch form
router.get('/branches/add', (req, res) => {
  res.render('add-branch'); // Make sure you have this view created
});

// POST route to create a new branch
router.post('/branches', isAdmin, async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Branch name is required.' });
  }

  try {
    const existingBranch = await prisma.branch.findFirst({ where: { name } });
    if (existingBranch) {
      return res.status(409).json({ message: 'Branch already exists.' });
    }

    const newBranch = await prisma.branch.create({ data: { name } });
    res.status(201).json(newBranch);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router;

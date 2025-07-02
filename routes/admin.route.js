const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { roles } = require('../utils/constants');
const ensureRole = require('../middleware/authMiddleware');   // checks req.user.role

/* ────────────────────────────────────────────────────────── */
/*  GET  /admin/users   – Manage Users page                   */
/* ────────────────────────────────────────────────────────── */
router.get('/users', ensureRole('ADMIN'), async (req, res, next) => {
  try {
    // fetch all users (include their current branch info)
    const users = await prisma.user.findMany({
      include: { Branch: true }           // optional: lets Pug show branch name
    });

    // fetch **all** branches so the view can list every one
    const branches = await prisma.branch.findMany({
      orderBy: { id: 'asc' }              // order however you like
    });

    res.render('manage-users', { users, branches });
  } catch (error) {
    console.error('Error fetching users/branches:', error);
    next(error);
  }
});

/* ────────────────────────────────────────────────────────── */
/*  POST /admin/update-role   – change a user’s role          */
/* ────────────────────────────────────────────────────────── */
router.post('/update-role', async (req, res, next) => {
  try {
    const { id, role } = req.body;
    if (!id || !role) {
      req.flash('error', 'Invalid request');
      return res.redirect('back');
    }

    const rolesArray = Object.values(roles);
    if (!rolesArray.includes(role)) {
      req.flash('error', 'Invalid role');
      return res.redirect('back');
    }

    if (req.user.id === parseInt(id)) {
      req.flash('error', 'Admins cannot remove themselves from Admin.');
      return res.redirect('back');
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { role }
    });

    req.flash('info', `Updated role for ${user.email} to ${user.role}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

/* ────────────────────────────────────────────────────────── */
/*  POST /admin/update-branch   – assign user to a branch     */
/* ────────────────────────────────────────────────────────── */
router.post('/update-branch', async (req, res, next) => {
  try {
    const { id, branch } = req.body;        // branch = branchId from form
    if (!id || !branch) {
      req.flash('error', 'Invalid request');
      return res.redirect('back');
    }

    if (req.user.id === parseInt(id)) {
      req.flash('error', 'Admins cannot change their own branch');
      return res.redirect('back');
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { branchId: parseInt(branch) }
    });

    req.flash('info', `Updated branch for ${user.email} to branch ${branch}`);
    res.redirect('back');
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const passport = require('passport');
const bcrypt = require('bcrypt');
const connectEnsure = require('connect-ensure-login');

// GET: Login Page
router.get(
  '/login',
  connectEnsure.ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {
    res.render('login');
  }
);

// POST: Login
router.post(
  '/login',
  connectEnsure.ensureLoggedOut({ redirectTo: '/' }),
  passport.authenticate('local', {
    successRedirect: '/user/profile',
    failureRedirect: '/auth/login',
    failureFlash: true,
  })
);

// GET: Register Page
router.get(
  '/register',
  connectEnsure.ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {
    res.render('register');
  }
);

// POST: Register a New User
router.post(
  '/register',
  connectEnsure.ensureLoggedOut({ redirectTo: '/' }),
  async (req, res, next) => {
    try {
      const { email, password, password2 } = req.body;

      // Check if passwords match
      if (password !== password2) {
        req.flash('error', 'Passwords do not match');
        return res.redirect('/auth/register');
      }

      // Check if the email is already registered
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        req.flash('warning', 'Email already exists');
        return res.redirect('/auth/register');
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Check if a Branch with id: 1 exists
      let branch = await prisma.branch.findUnique({ where: { id: 1 } });

      // If no Branch exists, create one
      if (!branch) {
        branch = await prisma.branch.create({
          data: {
            id: 1, // Optional: Let Prisma auto-generate the ID if preferred
            name: 'Default Branch',
          },
        });
      }

      // Create the new User and associate with the Branch
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'WAITER', // Default role
          Branch: { connect: { id: branch.id } }, // Connect to the existing or newly created Branch
        },
      });

      // Redirect to login page with a success message
      req.flash('success', 'Registration successful. You can now log in.');
      res.redirect('/auth/login');
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
);

// GET: Logout
router.get(
  '/logout',
  connectEnsure.ensureLoggedIn({ redirectTo: '/' }),
  (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect('/');
    });
  }
);

module.exports = router;

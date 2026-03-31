const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Multer Setup for Profiles
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `profile-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ 
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }
});

router.get('/profile', authMiddleware, userController.getProfile);
router.patch('/profile', authMiddleware, upload.single('profilePicture'), userController.updateProfile);
router.delete('/profile', authMiddleware, userController.deleteAccount);
router.get('/:id', userController.getUserById);

module.exports = router;

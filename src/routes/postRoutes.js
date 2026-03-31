const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, postController.createPost);
router.get('/', postController.getPosts);
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;

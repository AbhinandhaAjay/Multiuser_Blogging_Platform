const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, commentController.addComment);
router.get('/post/:postId', commentController.getPostComments);
router.delete('/:id', authMiddleware, commentController.deleteComment);

module.exports = router;

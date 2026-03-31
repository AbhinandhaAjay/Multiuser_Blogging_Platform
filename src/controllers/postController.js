const Post = require('../models/Post');
const Group = require('../models/Group');
const User = require('../models/User');

exports.createPost = async (req, res) => {
  const { title, content, groupId } = req.body;

  if (!title || !content || !groupId) {
    return res.status(400).json({ message: 'Title, content and groupId are required' });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
        return res.status(404).json({ message: 'Group not found' });
    }

    const post = new Post({
      title,
      content,
      author: req.user.id,
      group: groupId
    });

    await post.save();

    // Add post to user's posts
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { posts: post._id } });

    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .populate('group', 'name')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deletePost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }

    await Post.findByIdAndDelete(id);
    await User.findByIdAndUpdate(req.user.id, { $pull: { posts: post._id } });
    
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const Vote = require('../models/Vote');
const Post = require('../models/Post');

exports.votePost = async (req, res) => {
  const { postId, voteType } = req.body;

  if (!postId || !['upvote', 'downvote'].includes(voteType)) {
    return res.status(400).json({ message: 'PostId and valid voteType are required' });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const existingVote = await Vote.findOne({ user: req.user.id, post: postId });

    let scoreChange = 0;

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle OFF: clicked same vote again
        scoreChange = voteType === 'upvote' ? -1 : 1;
        await Vote.findByIdAndDelete(existingVote._id);
        post.votesCount += scoreChange;
        await post.save();
        return res.json({ message: 'Vote removed', votesCount: post.votesCount });
      } else {
        // Switch: from up to down or vice versa
        scoreChange = voteType === 'upvote' ? 2 : -2;
        existingVote.voteType = voteType;
        await existingVote.save();
        post.votesCount += scoreChange;
        await post.save();
        return res.json({ message: 'Vote switched', votesCount: post.votesCount });
      }
    } else {
      // New Vote
      const newVote = new Vote({
        user: req.user.id,
        post: postId,
        voteType
      });
      await newVote.save();
      scoreChange = voteType === 'upvote' ? 1 : -1;
      post.votesCount += scoreChange;
      await post.save();
      return res.status(201).json({ message: 'Vote added', votesCount: post.votesCount });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

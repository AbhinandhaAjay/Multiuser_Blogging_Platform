const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'posts',
        populate: { path: 'group', select: 'name' }
      })
      .populate({
        path: 'comments',
        populate: { path: 'post', select: 'title' }
      })
      .populate('joinedGroups', 'name description');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id)
      .select('-password')
      .populate('posts')
      .populate('joinedGroups', 'name');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Reddit style: Post and Comment content remains, but author is gone.
    // Deleting the user automatically makes their ID unreachable during population.
    await User.findByIdAndDelete(req.user.id);

    res.json({ message: 'Account deleted successfully, but your content remains anonymized.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { bio } = req.body;
  const updates = {};
  if (bio) updates.bio = bio;
  if (req.file) updates.profilePicture = `/uploads/${req.file.filename}`;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


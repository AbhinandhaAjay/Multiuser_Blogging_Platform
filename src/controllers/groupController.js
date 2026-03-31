const Group = require('../models/Group');
const User = require('../models/User');

exports.createGroup = async (req, res) => {
  const { name, description } = req.body;

  if (!name || !description) {
    return res.status(400).json({ message: 'Name and description are required' });
  }

  try {
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ message: 'Group with this name already exists' });
    }

    const group = new Group({
      name,
      description,
      creator: req.user.id,
      members: [req.user.id]
    });

    await group.save();

    // Add group to user's joined groups
    await User.findByIdAndUpdate(req.user.id, { $addToSet: { joinedGroups: group._id } });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.joinGroup = async (req, res) => {
  const { id: groupId } = req.params;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    group.members.push(req.user.id);
    await group.save();

    await User.findByIdAndUpdate(req.user.id, { $addToSet: { joinedGroups: group._id } });

    res.json({ message: 'Successfully joined group', group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.leaveGroup = async (req, res) => {
  const { id: groupId } = req.params;

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.creator.toString() === req.user.id.toString()) {
      return res.status(400).json({ message: 'Creator cannot leave own group' });
    }

    group.members = group.members.filter(member => member.toString() !== req.user.id.toString());
    await group.save();

    await User.findByIdAndUpdate(req.user.id, { $pull: { joinedGroups: group._id } });

    res.json({ message: 'Successfully left group', group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('creator', 'username');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

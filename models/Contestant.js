const mongoose = require('mongoose');

const ContestantSchema = new mongoose.Schema({
  photo: { type: String, required: true },
  description: { type: String, required: true },
  votes: { type: Number, default: 0 },
  comments: [{ type: String }]
});

module.exports = mongoose.model('Contestant', ContestantSchema);

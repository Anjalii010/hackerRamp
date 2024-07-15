const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const Contestant = require('./models/Contestant');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Routes
app.get('/', async (req, res) => {
  try {
    const contestants = await Contestant.find();
    res.render('index', { contestants });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contestants' });
  }
});

// Submit contestant route
app.post('/submit-contestant', upload.single('file'), async (req, res) => {
  try {
    const { description } = req.body;
    const photo = req.file.filename;
    const newContestant = new Contestant({ photo, description });
    await newContestant.save();
    res.json({ message: 'Contestant submitted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit contestant' });
  }
});

// Vote for contestant route
app.post('/vote/:id', (req, res) => {
  const contestantId = parseInt(req.params.id, 10);
  const contestant = contestants.find(c => c.id === contestantId);

  if (contestant) {
      contestant.votes += 1;
      fs.writeFileSync('contestants.json', JSON.stringify(contestants, null, 2));
      res.json(contestant);
  } else {
      res.status(404).json({ message: 'Contestant not found' });
  }
});
// Comment on contestant route
app.post('/comment/:contestantId', async (req, res) => {
  const contestantId = req.params.contestantId;
  const { comment } = req.body;
  try {
    const contestant = await Contestant.findById(contestantId);
    if (!contestant) {
      return res.status(404).json({ error: 'Contestant not found' });
    }
    contestant.comments.push(comment); // Add comment to contestant's comments array
    await contestant.save();
    res.json({ message: 'Comment added successfully', contestant });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get all contestants route (API endpoint)
app.get('/contestants', async (req, res) => {
  try {
    const contestants = await Contestant.find();
    res.json(contestants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch contestants' });
  }
});
app.get('/top-voters', (req, res) => {
  // Assuming you have a list of voters with their vote counts
  const voters = [
      { name: 'Alice', votes: 10, photo: 'path_to_photo1' },
      { name: 'Bob', votes: 8, photo: 'path_to_photo2' },
      { name: 'Charlie', votes: 7, photo: 'path_to_photo3' },
  ];

  const topVoters = voters.sort((a, b) => b.votes - a.votes).slice(0, 3);
  res.json(topVoters);
});


// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

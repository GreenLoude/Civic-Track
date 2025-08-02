const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// Supabase client setup
const supabaseUrl = 'https://wgbnbjxmoiefbhrdqeko.supabase.co/'; // Replace with your Supabase Project URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnYm5ianhtb2llZmJocmRxZWtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMjU4NzEsImV4cCI6MjA2OTcwMTg3MX0.5IzXYHN3abPsbP6Zo3oosPFTUBC5f0LFUFbeGwMAqFE'; // Replace with your Supabase Anon Key
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Middleware
app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only .png, .jpg, and .jpeg formats allowed!'));
  }
});

// POST endpoint to create a new issue
app.post('/api/issues', upload.single('image'), async (req, res) => {
  try {
    const { title, location, distance, reporter, description } = req.body;
    const reportedDate = new Date().toISOString().split('T')[0];
    let imageUrl = null;

    if (req.file) {
      const fileName = `${Date.now()}-${req.file.originalname}`;
      const { data, error } = await supabase.storage
        .from('issue-images')
        .upload(`public/${fileName}`, req.file.buffer, {
          contentType: req.file.mimetype,
        });
      if (error) {
        throw new Error(`Image upload failed: ${error.message}`);
      }
      const { data: publicUrlData } = supabase.storage
        .from('issue-images')
        .getPublicUrl(`public/${fileName}`);
      imageUrl = publicUrlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('issues')
      .insert([{
        title,
        location,
        distance: distance || 'N/A',
        status: 'pending',
        reporter: reporter || 'Anonymous',
        reported_date: reportedDate,
        description,
        image: imageUrl,
      }])
      .select();

    if (error) {
      throw new Error(`Database insert failed: ${error.message}`);
    }

    res.status(201).json({ message: 'Issue created successfully', issue: data[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET endpoint to fetch all issues
app.get('/api/issues', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .order('reported_date', { ascending: false });
    if (error) {
      throw new Error(`Database fetch failed: ${error.message}`);
    }
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// GET endpoint to fetch a single issue by ID
app.get('/api/issues/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('issues')
      .select('*')
      .eq('id', req.params.id)
      .single();
    if (error) {
      throw new Error(`Database fetch failed: ${error.message}`);
    }
    if (!data) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
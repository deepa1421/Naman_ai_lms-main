require("dotenv").config();

const express = require('express');
const connectDB = require("./config/mongodb");
const cors = require('cors');

const app = express();
connectDB();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.send('LMS Backend is running');
});

// Routes
const sheetsRoutes = require('./routes/sheets');
const userRoutes = require('./routes/user');
const aiTutorRoute = require("./routes/aiTutor");
const assessmentRoutes = require("./routes/assessment");

app.use("/assessment", assessmentRoutes);
app.use("/ai-tutor", aiTutorRoute);
app.use('/api', sheetsRoutes);
app.use('/api', userRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
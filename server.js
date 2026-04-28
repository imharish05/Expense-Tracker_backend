const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db.js');


dotenv.config(); 

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes'); // 👈 ADD THIS
const treasuryRoutes = require('./routes/treasuryRoutes'); // 👈 ADD THIS

const { protect } = require('./middleware/protect.js');

const app = express();


const allowedOrigins = ['http://localhost:3000', 'https://imharish05.github.io','https://harishtracker.netlify.app'];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/treasury', treasuryRoutes);

app.get('/', (req, res) => res.send('Server is running...'));

const PORT = process.env.PORT || 5000;

connectDB(); // Initialize MongoDB

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
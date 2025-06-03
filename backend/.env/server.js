const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
dotenv.config();

const authRoutes = require('../routes/auth.js');
const wishlistRoutes = require('../routes/wishlist.js');
const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjYXJhcGkuYXBwIiwic3ViIjoiNDU4NzQ1YmEtNDQ0My00OTE2LTllM2QtOTFkMDMxZTIxYjEwIiwiYXVkIjoiNDU4NzQ1YmEtNDQ0My00OTE2LTllM2QtOTFkMDMxZTIxYjEwIiwiZXhwIjoxNzQ5NTI3MTMxLCJpYXQiOjE3NDg5MjIzMzEsImp0aSI6IjdmNTVjM2NkLTljZTAtNDc4Yi04MDQ1LWVkNjc2YWY1ZmZhMyIsInVzZXIiOnsic3Vic2NyaXB0aW9ucyI6W10sInJhdGVfbGltaXRfdHlwZSI6ImhhcmQiLCJhZGRvbnMiOnsiYW50aXF1ZV92ZWhpY2xlcyI6ZmFsc2UsImRhdGFfZmVlZCI6ZmFsc2V9fX0.6IyFXpJNaBCNzlVMMU-Hf2FHCvLjdLHpH-uXNJXwqxA';

const app = express();
app.use(cors({
  origin: '*', // or 'http://localhost:5500' if you want to be strict
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

app.get('/api/cars', async (req, res) => {
  try {
    const { year = 2020 } = req.query;
    const totalPages = 5;
    const allModels = [];

    for (let page = 1; page <= totalPages; page++) {
      const response = await axios.get(`https://carapi.app/api/models/v2`, {
        headers: { Authorization: `Bearer ${API_KEY}` },
        params: { year, page }
      });

      const models = response.data.data || response.data; // Adjust if structure differs
      allModels.push(...models);
    }

    res.json(allModels); // Send the combined array
  } catch (error) {
    if (error.response) {
      console.error('🔴 API Response Error:');
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('🔴 No response received:', error.request);
    } else {
      console.error('🔴 Error setting up request:', error.message);
    }

    res.status(500).json({ error: 'Failed to fetch car data' });
  }
});


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

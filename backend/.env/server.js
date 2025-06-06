const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const xml2js = require('xml2js');

dotenv.config();

const authRoutes = require('../routes/auth.js');
const wishlistRoutes = require('../routes/wishlist.js');
const { modelName } = require('../models/User.js');
const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjYXJhcGkuYXBwIiwic3ViIjoiNDU4NzQ1YmEtNDQ0My00OTE2LTllM2QtOTFkMDMxZTIxYjEwIiwiYXVkIjoiNDU4NzQ1YmEtNDQ0My00OTE2LTllM2QtOTFkMDMxZTIxYjEwIiwiZXhwIjoxNzQ5NTI3MTMxLCJpYXQiOjE3NDg5MjIzMzEsImp0aSI6IjdmNTVjM2NkLTljZTAtNDc4Yi04MDQ1LWVkNjc2YWY1ZmZhMyIsInVzZXIiOnsic3Vic2NyaXB0aW9ucyI6W10sInJhdGVfbGltaXRfdHlwZSI6ImhhcmQiLCJhZGRvbnMiOnsiYW50aXF1ZV92ZWhpY2xlcyI6ZmFsc2UsImRhdGFfZmVlZCI6ZmFsc2V9fX0.6IyFXpJNaBCNzlVMMU-Hf2FHCvLjdLHpH-uXNJXwqxA';
const CARSXE_API = '6hzkyx7xq_ueu31sjx3_baqauxwg8';

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
      const response = await axios.get('https://carapi.app/api/models/v2', {
        headers: { Authorization: Bearer `${API_KEY} `},
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

app.get('/api/car-image', async (req, res) => {
  const { make, model, year } = req.query;

  if (!make || !model || !year) {
    return res.status(400).json({ error: 'Missing make, model, or year' });
  }

  try {
    const searchTerm = `${make} ${model}`;
    const response = await axios.get(`https://www.carimagery.com/api.asmx/GetImageUrl?searchTerm=2020${encodeURIComponent(searchTerm)}`);
    
    const parser = new xml2js.Parser();
    parser.parseString(response.data, (err, result) => {
      if (err) {
        console.error('XML parse error:', err);
        return res.status(500).json({ image: 'https://placehold.co/300x180?text=No+Image&font=roboto' });
      }

      const imageUrl = result?.string?._ || 'https://placehold.co/300x180?text=No+Image&font=roboto';
      res.json({ image: imageUrl });
    });

  } catch (error) {
    console.error('Image fetch error:', error.message);
    res.status(500).json({ image: 'https://placehold.co/300x180?text=No+Image&font=roboto' });
  }
});

app.get('/api/car-details', async (req, res) => {
  const { make, model, year = 2020 } = req.query;

  if (!make || !model || !year) {
    return res.status(400).json({ error: 'Missing make, model, or year' });
  }

  try {
    const response = await axios.get('https://carapi.app/api/bodies/v2', {
      headers: { Authorization: Bearer` ${API_KEY}` },
      params: { make, model, year }
    });

    const carTrims = response.data?.data;

    if (!carTrims || carTrims.length === 0) {
      return res.status(404).json({ error: 'No car data found for this make/model/year' });
    }

    // Extract unique types and seats from the trims
    const uniqueTypes = [...new Set(carTrims.map(car => car.type))];
    const uniqueSeats = [...new Set(carTrims.map(car => car.seats))];

    res.json({
      make,
      model,
      year,
      types: uniqueTypes,
      seats: uniqueSeats
    });
  } catch (error) {
    console.error('Car details fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch car details' });
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
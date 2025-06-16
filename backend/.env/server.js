const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const xml2js = require('xml2js');
const NodeCache = require("node-cache");

dotenv.config();

const authRoutes = require('../routes/auth.js');
const wishlistRoutes = require('../routes/wishlist.js');
const userRoutes = require('../routes/user');
const bookingRoutes = require('../routes/booking');

const ONE_MONTH = 30 * 24 * 60 * 60;
const carCache = new NodeCache({ stdTTL: ONE_MONTH });
const detailsCache = new NodeCache({ stdTTL: ONE_MONTH });


// const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjYXJhcGkuYXBwIiwic3ViIjoiNDU4NzQ1YmEtNDQ0My00OTE2LTllM2QtOTFkMDMxZTIxYjEwIiwiYXVkIjoiNDU4NzQ1YmEtNDQ0My00OTE2LTllM2QtOTFkMDMxZTIxYjEwIiwiZXhwIjoxNzQ5NTI3MTMxLCJpYXQiOjE3NDg5MjIzMzEsImp0aSI6IjdmNTVjM2NkLTljZTAtNDc4Yi04MDQ1LWVkNjc2YWY1ZmZhMyIsInVzZXIiOnsic3Vic2NyaXB0aW9ucyI6W10sInJhdGVfbGltaXRfdHlwZSI6ImhhcmQiLCJhZGRvbnMiOnsiYW50aXF1ZV92ZWhpY2xlcyI6ZmFsc2UsImRhdGFfZmVlZCI6ZmFsc2V9fX0.6IyFXpJNaBCNzlVMMU-Hf2FHCvLjdLHpH-uXNJXwqxA';
const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjYXJhcGkuYXBwIiwic3ViIjoiNDU4NzQ1YmEtNDQ0My00OTE2LTllM2QtOTFkMDMxZTIxYjEwIiwiYXVkIjoiNDU4NzQ1YmEtNDQ0My00OTE2LTllM2QtOTFkMDMxZTIxYjEwIiwiZXhwIjoxNzUwMTQzMjE2LCJpYXQiOjE3NDk1Mzg0MTYsImp0aSI6IjQwYTIzZmM0LWM4NjAtNDczYi1iOWJjLTFkY2NiNGMxNDQ1YSIsInVzZXIiOnsic3Vic2NyaXB0aW9ucyI6W10sInJhdGVfbGltaXRfdHlwZSI6ImhhcmQiLCJhZGRvbnMiOnsiYW50aXF1ZV92ZWhpY2xlcyI6ZmFsc2UsImRhdGFfZmVlZCI6ZmFsc2V9fX0.PP2hkV_yjQyTWVR0Q9UhdgF8-N5ToX0wwLeP6RcML2Y';
const CARSXE_API = '6hzkyx7xq_ueu31sjx3_baqauxwg8';

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

/* EXISTING: Fetch cars */
app.get('/api/cars', async (req, res) => {
  const { year = 2020 } = req.query;

  // Check cache first
  const cacheKey = `cars_${year}`;  
  const cached = carCache.get(cacheKey);
  if (cached){
    console.log('✅ Using cached data');
    return res.json(cached);
  }

  console.log('🔄 Fetching fresh data from API');

  try {
    const totalPages = 5;
    const allModels = [];

    for (let page = 1; page <= totalPages; page++) {
      const response = await axios.get('https://carapi.app/api/models/v2', {
        headers: { Authorization: `Bearer ${API_KEY}` },
        params: { year, page },
      });
      console.log('Calling Car API with:', { year, page });
      allModels.push(...response.data.data);
    }

    carCache.set(cacheKey, allModels);
    res.json(allModels);
  } catch (error) {
    console.error('Car API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch car data' });
  }
  
});

/* EXISTING: Fetch image from CarImagery */
app.get('/api/car-image', async (req, res) => {
  const { make, model, year } = req.query;
  if (!make || !model || !year) {
    return res.status(400).json({ error: 'Missing make, model, or year' });
  }

  try {
    const searchTerm = `${make} ${model}`;
    const response = await axios.get(`https://www.carimagery.com/api.asmx/GetImageUrl?searchTerm=${year}${encodeURIComponent(searchTerm)}`);
    xml2js.parseString(response.data, (err, result) => {
      const imageUrl = result?.string?._ || 'https://placehold.co/300x180?text=No+Image';
      res.json({ image: imageUrl });
    });
  } catch (error) {
    console.error('Image fetch error:', error.message);
    res.status(500).json({ image: 'https://placehold.co/300x180?text=No+Image' });
  }
});

/* EXISTING: Basic car detail fetch by make/model/year */
app.get('/api/car-details', async (req, res) => {
  const { make, model, year = 2020 } = req.query;
  const cacheKey = `details_${make}_${model}_${year}`;
  if (detailsCache.has(cacheKey)) return res.json(detailsCache.get(cacheKey));

  if (!make || !model || !year) {
    return res.status(400).json({ error: 'Missing make, model, or year' });
  }

  try {
    const response = await axios.get('https://carapi.app/api/bodies/v2', {
      headers: { Authorization: `Bearer ${API_KEY}` },
      params: { make, model, year }
    });

    const carTrims = response.data?.data;
    if (!carTrims || carTrims.length === 0) {
      return res.status(404).json({ error: 'No car data found' });
    }

    const types = [...new Set(carTrims.map(car => car.type))];
    const seats = [...new Set(carTrims.map(car => car.seats))];

    const result = { make, model, year, types, seats };
    detailsCache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Car details fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch car details' });
  }
});

/* ✅ NEW: Proxy for detailed trim info */
app.get('/api/trim-details/:trimId', async (req, res) => {
  const { trimId } = req.params;
  const cacheKey = `trim_${trimId}`;
  if (detailsCache.has(cacheKey)) return res.json(detailsCache.get(cacheKey));

  try {
    const response = await axios.get(`https://carapi.app/api/trims/v2/${trimId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });

    const data = response.data;
    detailsCache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error('Trim details fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch trim details' });
  }
});

/* Routes */
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/user', userRoutes);
app.use('/api/bookings', bookingRoutes);

/* MongoDB Connection */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* Start Server */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

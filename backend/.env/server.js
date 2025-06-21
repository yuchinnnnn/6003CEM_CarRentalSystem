const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const xml2js = require('xml2js');
const path = require('path');

const NodeCache = require("node-cache");
const ONE_MONTH = 30 * 24 * 60 * 60; // 30 days in seconds
const carCache = new NodeCache({ stdTTL: ONE_MONTH });
const detailsCache = new NodeCache({ stdTTL: ONE_MONTH });

require('dotenv').config();

const authRoutes = require('../routes/auth.js');
const wishlistRoutes = require('../routes/wishlist.js');
const { modelName } = require('../models/User.js');
const userRoutes = require('../routes/user');
const bookingRoutes = require('../routes/booking.js');
const paymentRoutes = require('../routes/payment.js');

// API keys
const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJjYXJhcGkuYXBwIiwic3ViIjoiZmM1OTkxODUtYmM3NS00NzhhLWI2YjAtN2I5MGE5YmQ0YWY2IiwiYXVkIjoiZmM1OTkxODUtYmM3NS00NzhhLWI2YjAtN2I5MGE5YmQ0YWY2IiwiZXhwIjoxNzUwNzg1MDk5LCJpYXQiOjE3NTAxODAyOTksImp0aSI6ImU5NGVkMGZkLTkwMzAtNDJiNC05MTI2LWQ4MzE4ZjMzZTE1YSIsInVzZXIiOnsic3Vic2NyaXB0aW9ucyI6W10sInJhdGVfbGltaXRfdHlwZSI6ImhhcmQiLCJhZGRvbnMiOnsiYW50aXF1ZV92ZWhpY2xlcyI6ZmFsc2UsImRhdGFfZmVlZCI6ZmFsc2V9fX0.pLEUpLSbDpc4NeeHD2P93q6tXdeGDaJumbu-xB_-a6g';
const EMAIL_API = '35924de5c3aa0c41819bd0e34bd121ee';

const app = express();
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

/* Fetch cars */
app.get('/api/cars', async (req, res) => {
  try {
    const { year = 2020 } = req.query;

    // Check cache first
    const cacheKey = `cars_${year}`;
    const cached = carCache.get(cacheKey);
    if (cached) {
      console.log('✅ Using cached data');
      return res.json({ fromCache: true, data: cached });
    }

    console.log('🔄 Fetching fresh data from API');

    const totalPages = 5;
    const allModels = [];

    for (let page = 1; page <= totalPages; page++) {
      const response = await axios.get('https://carapi.app/api/models/v2', {
        headers: { Authorization: `Bearer ${API_KEY}`},
        params: { year, page }
      });
      // console.log('Calling Car API with:', { year, page });
      allModels.push(...response.data.data);
    }

    // Save to cache
    carCache.set(cacheKey, allModels);

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

/* Fetch image from CarImagery */
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

/* Basic car detail fetch by make/model/year */
app.get('/api/car-details', async (req, res) => {
  const { make, model, year = 2020 } = req.query;
  const cacheKey = `details_${make}_${model}_${year}`;
  if (detailsCache.has(cacheKey)) {
    console.log(`✅ Cache hit for ${cacheKey}`);
    return res.json(detailsCache.get(cacheKey));
  } else {
    console.log(`❌ Cache miss for ${cacheKey}`);
  }

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

    const malaysiaLocations = [
      "Kuala Lumpur", "Penang", "Johor Bahru", "Ipoh",
      "Melaka", "Seremban", "Kuching", "Kota Kinabalu"
    ];

    const types = [...new Set(carTrims.map(car => car.type))];
    const seats = [...new Set(carTrims.map(car => car.seats))];
    // const location = malaysiaLocations[Math.floor(Math.random() * malaysiaLocations.length)];
    const location = [...new Set(carTrims.map(car => car.location))];
    
    const result = { make, model, year, types, seats, location };
    detailsCache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Car details fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch car details' });
  }
});


app.get('/api/validate-email', async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const response = await axios.get('http://apilayer.net/api/check', {
      params: {
        access_key: EMAIL_API,
        email: email,
        smtp: 1,
        format: 1
      }
    });

    const data = response.data;

    res.json({
      success: true,
      email: data.email,
      format_valid: data.format_valid,
      smtp_check: data.smtp_check,
      score: data.score,
      did_you_mean: data.did_you_mean,
      disposable: data.disposable,
    });
  } catch (error) {
    res.status(500).json({ error: 'MailboxLayer API request failed', details: error.message });
  }
});


/*Proxy for detailed trim info */
app.get('/api/trim-details/:trimId', async (req, res) => {
  const { trimId } = req.params;
  const cacheKey = `trim_${trimId}`;
  const malaysiaLocations = [
      "Kuala Lumpur", "Penang", "Johor Bahru", "Ipoh",
      "Melaka", "Seremban", "Kuching", "Kota Kinabalu"
    ];

const index = parseInt(trimId.replace(/\D/g, '')) % malaysiaLocations.length;
const location = malaysiaLocations[index]; 

  if (detailsCache.has(cacheKey)) return res.json(detailsCache.get(cacheKey));

  try {
    const response = await axios.get(`https://carapi.app/api/trims/v2/${trimId}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });

    const data = response.data;
    const result = {
      ...data,
      location 
    };

    detailsCache.set(cacheKey, result);
    res.json(result); // ✅ send the enriched response

  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401 || status === 402) {
      console.warn(`Trim ID ${trimId} skipped: ${message}`);
      return res.status(204).json({ skip: true }); // 204 = No Content
    }

    console.error('Trim details fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch trim details' });
  }
});

app.get('/api/debug/cache', (req, res) => {
  res.json({
    carKeys: carCache.keys(),
    detailsKeys: detailsCache.keys()
  });
});

app.get("/payment-success", (req, res) => {
  res.send("<h2>✅ Payment Successful! Thank you for your booking.</h2>");
});

app.post("/api/payment-callback", express.urlencoded({ extended: false }), (req, res) => {
  console.log("📩 ToyyibPay Callback Received:", req.body);
  res.status(200).send("Callback received");
});


/* Routes */
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/user', userRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/upload', express.static(path.join(__dirname, '../upload')));
app.use('/api/payment', paymentRoutes);

/* MongoDB Connection */
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
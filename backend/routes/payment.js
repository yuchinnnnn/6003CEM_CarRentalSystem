require("dotenv").config();
const axios = require("axios");
const express = require("express");
const router = express.Router();
const qs = require("qs");
const app = express();
app.use(express.json());

router.post("/create-toyyib-bill", async (req, res) => {
  console.log("📦 Received booking payload:", req.body);

  const booking = req.body;

  const user = booking.userInfo || {}; // Destructure from booking body

  const bill = {
    userSecretKey: process.env.TOYYIBPAY_SECRET_KEY,
    categoryCode: process.env.TOYYIBPAY_CATEGORY_CODE,

    billName: `Car Rental - ${booking.car.make} ${booking.car.model}`,
    billDescription: `Booking from ${booking.pickupLocation} to ${booking.dropoffLocation}`,
    billPriceSetting: 1,
    billPayorInfo: 1,
    billAmount: booking.totalPrice * 100, // Convert RM to sen
    billReturnUrl: "http://localhost:5000/payment-success",
    billCallbackUrl: "http://localhost:5000/api/payment-callback",
    billExternalReferenceNo: booking.car.id,
    billTo: user.name || "Customer",
    billEmail: user.email || "example@email.com",
    billPhone: user.phone || "0123456789",
    billSplitPayment: 0,
    billPaymentChannel: "1",
    billDisplayMerchant: 1
  };

  try {
  console.log("🧾 Sending to ToyyibPay:", bill);
  console.log("🔑 Using secret key:", bill.userSecretKey);
  console.log("📦 Using category code:", bill.categoryCode);


  const response = await axios.post(
    "https://toyyibpay.com/index.php/api/createBill",
    qs.stringify(bill),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );
  console.log("✅ ToyyibPay Response:", response.data);

  const billCode = response.data[0]?.BillCode;
  if (!billCode) return res.status(500).json({ message: "Failed to generate bill code" });

  res.json({ billCode });
  } catch (err) {
    console.error("❌ ToyyibPay Error:", err.response?.data || err.message);
    console.error(err.stack);
    res.status(500).json({
      message: "Payment creation failed",
      error: err.response?.data || err.message
    });
  }


});

module.exports = router;
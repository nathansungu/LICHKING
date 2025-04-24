const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const { CONSUMER_KEY, CONSUMER_SECRET, SHORTCODE, PASSKEY, CALLBACK_URL } = process.env;

const getAccessToken = async () => {
  const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString("base64");
  const res = await fetch("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials", {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await res.json();
  return data.access_token;
};

const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace(/[^0-9]/g, "").slice(0, 14);
};

const generatePassword = (timestamp) => {
  const str = SHORTCODE + PASSKEY + timestamp;
  return Buffer.from(str).toString("base64");
};

// Payment Route
app.post("/pay", async (req, res) => {
  const { phone, amount, orderId } = req.body;
  //check if fields are valid
  if(!phone ){
    return res.status(400).json({ error: "Phone number is required" });
  }

  try {
    const access_token = await getAccessToken();
    const timestamp = getTimestamp();
    const password = generatePassword(timestamp);

    const stkBody = {
      BusinessShortCode: SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: SHORTCODE,
      PhoneNumber: phone,
      CallBackURL: CALLBACK_URL,
      AccountReference: orderId,
      TransactionDesc: "LICHKING SHOP"
    };

    const response = await fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify(stkBody),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errorMessage || "STK Push failed");
    }

    res.status(200).json({ message: "STK Push sent", data });
  } catch (err) {
    console.error( err.message);
    res.status(500).json({ error: err.message });
  }
});

// 🔁 Callback Route
app.post("/callback", (req, res) => {
  console.log(" STK Callback:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});

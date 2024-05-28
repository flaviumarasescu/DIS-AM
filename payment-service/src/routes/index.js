const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

const PaymentModel = require('../models/payment');

const router = express.Router();

router.post('/payment/create', async (req, res) => {
  try {
    // Handle the payment details
    const { payment_data, concert_data, concert_id } = req.body;
    // console.log('paymentData', payment_data);
    // Save in db
    const newPayment = new PaymentModel({
      concert_id: new mongoose.Types.ObjectId(concert_id),
      ...payment_data,
      user_PIN: new mongoose.Types.ObjectId(payment_data.user_PIN),
      status: 'success',
    });
    await newPayment.save();

    const reservationRes = await axios.post(
      'http://reservation-service:5004/api/reservation/create',
      {
        concert_id,
        concert_data,
      },
      {
        responseType: 'arraybuffer',
      }
    );

    return res.status(200).send(reservationRes.data);
  } catch (e) {
    console.error('Err payment:', e.message);
    throw new Error('payment not  CONVERTED');
  }
});

module.exports = router;

const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');

const PaymentModel = require('../models/payment');

const router = express.Router();

router.post('/payment/create', async (req, res) => {
  try {
    // Handle the payment details
    const { payment_data, concert_data, concert_id } = req.body;
    // console.log('in payment fff, paymentData', payment_data);
    // console.log('req.body payment', req.body);
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
        responseType: 'arraybuffer', // Ensure the response is treated as binary data
      }
    );
    // console.log('reservationRes.data', reservationRes.data);
    // return 'payment  CONVERTED ffffffffffff'
    return res.status(200).send(reservationRes.data);
  } catch (e) {
    console.error('Errf payment:', e.message);
    throw new Error('payment not  CONVERTED ffffffffffff');
  }
});

module.exports = router;

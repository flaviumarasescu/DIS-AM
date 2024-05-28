const express = require('express');
const axios = require('axios');

const router = express.Router();

const camelToSnake = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => camelToSnake(item));
  }

  return Object.keys(obj).reduce((acc, key) => {
    let snakeKey = key.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
    snakeKey = snakeKey === 'user_p_i_n' ? 'user_PIN' : snakeKey;

    acc[snakeKey] = camelToSnake(obj[key]);
    return acc;
  }, {});
};

router.post('/concert', async (req, res) => {
  try {
    // console.log('req.body', req.body);
    const { payment_data, concert_data, concert_id } = camelToSnake(req.body);
    // console.log('payment_data', payment_data);
    // console.log('concert_data', concert_data);
    const paymentRes = await axios.post(
      'http://payment-service:5002/api/payment/create',
      {
        concert_id,
        payment_data,
        concert_data,
      },
      {
        responseType: 'arraybuffer',
      }
    );
    // console.log('paymentRes.data', paymentRes.data);
    return res.status(200).send(paymentRes.data);
  } catch (e) {
    console.error('Errf concert:', e);
  }
});

router.get('/', (req, res) => {
  res.status(200).send('GET CONCERTS');
});

module.exports = router;

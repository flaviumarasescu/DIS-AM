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

// router.get("/concert", async (req, res) => {
//   try {
//     console.log("concert post1");
//
//     // return 'GET CONCERTS ffffffffffff'
//     await axios.post("http://query-service:5000/api/query/payment/create");
//     return res.status(200).send("GET CONCERTS ffffffffffff");
//   } catch (e) {
//     console.error("Errf concert:", e);
//   }
// });

router.post('/concert', async (req, res) => {
  // router.post("/concert", async (req, res) => {
  try {
    // return 'GET CONCERTS ffffffffffff'
    // console.log('concert post2 req.body', req.body);
    const { payment_data, concert_data, concert_id } = camelToSnake(req.body);
    // console.log('payment_dataff', payment_data);
    // console.log('concert_dataff', concert_data);
    const paymentRes = await axios.post(
      'http://payment-service:5002/api/payment/create',
      {
        concert_id,
        payment_data,
        concert_data,
      },
      {
        responseType: 'arraybuffer', // Ensure the response is treated as binary data
      }
    );
    // console.log('paymentRes.data', paymentRes.data);
    return res.status(200).send(paymentRes.data);
  } catch (e) {
    console.error('Errf concert:', e);
  }
});

// router.post("/concert", (req, res) => {
//   // return 'GET CONCERTS ffffffffffff'
//   console.log("concert post2");
//   res.status(200).send("POST CONCERTS ffffffffffff");
// });

router.get('/', (req, res) => {
  res.status(200).send('GET CONCERTS');
});

module.exports = router;

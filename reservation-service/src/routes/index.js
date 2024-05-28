const express = require('express');
const axios = require('axios');
const ReservationModel = require('../models/reservation');

const router = express.Router();

router.post('/reservation/create', async (req, res) => {
  try {
    const { concert_id, concert_data } = req.body;
    const newReservation = new ReservationModel({
      concert_id,
      ...concert_data,
    });
    await newReservation.save();

    const ticketsId = concert_data.tickets.map((ticket) => ticket.ticket_id);

    const pdfConvertRes = await axios.post(
      'http://pdf-converter-service:5003/api/pdf-convert/create',
      {
        concert_id,
        concert_data,
      },
      {
        responseType: 'arraybuffer',
      }
    );
    // console.log('pdfConvertRes.data', pdfConvertRes.data);
    return res.status(200).send(pdfConvertRes.data);
  } catch (e) {
    console.error('Errf reservation:', e);
  }
});

module.exports = router;

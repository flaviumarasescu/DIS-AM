const express = require('express');
const axios = require('axios');
const ReservationModel = require('../models/reservation');
// const ConcertModel = require("../../../concert-service/src/models/concert");

const router = express.Router();

router.post('/reservation/create', async (req, res) => {
  try {
    const { concert_id, concert_data } = req.body;
    // console.log('in reservation concert_data', concert_data);
    const newReservation = new ReservationModel({
      concert_id,
      ...concert_data,
    });
    await newReservation.save();

    const ticketsId = concert_data.tickets.map((ticket) => ticket.ticket_id);

    // const concertFilter = {
    //   _id: concert_id,
    //   "tickets.ticket_id": { $in: ticketsId },
    // };

    // const update = { $set: { "tickets.$.status": "sold" } };

    // const result = await ConcertModel.updateMany(concertFilter, update);
    // console.log('result Reservation', result);

    const pdfConvertRes = await axios.post(
      'http://pdf-converter-service:5003/api/pdf-convert/create',
      {
        concert_id,
        concert_data,
      },
      {
        responseType: 'arraybuffer', // Ensure the response is treated as binary data
      }
    );
    // console.log('pdfConvertRes.data', pdfConvertRes.data);
    return res.status(200).send(pdfConvertRes.data);
  } catch (e) {
    console.error('Errf reservation:', e);
  }
});

module.exports = router;

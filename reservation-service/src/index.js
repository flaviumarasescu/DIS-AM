// const {TICKET_API_URL} = require('./URLs')

// const bodyParser = require('body-parser')
const express = require('express');
const mongoose = require('mongoose');

const router = require('./routes');
const amqp = require('amqplib');
const ReservationModel = require('./models/reservation');

const app = express();

// app.use(express.urlencoded({extended: false}))
// app.use(bodyParser.json())
app.use(express.json());
app.use('/api', router);

const Startup = async () => {
  try {
    const database = await mongoose.connect(
      'mongodb://concert-mongo-service:27017/reservation'
    );
    console.log(
      'connected to mongo reservation!!',
      database.connection.host,
      database.connection.port,
      database.connection.name
    );

    const connection = await amqp.connect(
      'amqp://rabbitmq-service:5672',
      'heartbeat=60'
    );
    const channel = await connection.createChannel();
    console.log('Connected to rabbitmq!!');

    await channel.assertExchange('query-exchange', 'topic', { durable: true });
    console.log('query exchange created');

    await channel.assertQueue('reservation-queue', { durable: true });
    await channel.bindQueue(
      'reservation-queue',
      'query-exchange',
      'reservation'
    );

    channel.consume(
      'reservation-queue',
      async (msg) => {
        const request = JSON.parse(msg.content.toString());

        const { concert_id, concert_data } = request;
        // console.log('in reservation concert_data', concert_data);
        const newReservation = new ReservationModel({
          concert_id,
          ...concert_data,
        });
        await newReservation.save();

        channel.publish(
          'query-exchange',
          'converter',
          Buffer.from(
            JSON.stringify({
              concert_id,
              concert_data,
            })
          ),
          {
            correlationId: msg.properties.correlationId,
          }
        );
        channel.ack(msg);
      },
      { noAck: false }
    );
  } catch (e) {
    console.log('Reservation error', e);
  }
};

app.listen(5004, () => {
  console.log(`reservation-service listening on port 5004!!! `);
});

Startup();

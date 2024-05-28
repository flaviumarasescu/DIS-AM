const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const amqp = require('amqplib');

const PaymentModel = require('./models/payment');

const router = require('./routes');

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());

const Startup = async () => {
  try {
    const database = await mongoose.connect(
      'mongodb://concert-mongo-service:27017/payment'
    );
    console.log(
      'connected to mongo payment!!!',
      database.connection.host,
      database.connection.port,
      database.connection.name
    );

    const connection = await amqp.connect(
      'amqp://rabbitmq-service:5672',
      'heartbeat=60'
    );
    const channel = await connection.createChannel();
    console.log('Connected to rabbitmq!');

    await channel.assertExchange('query-exchange', 'topic', { durable: true });
    console.log('query exchange created');

    await channel.assertQueue('payment-queue', { durable: true });
    await channel.bindQueue('payment-queue', 'query-exchange', 'payment');

    channel.consume(
      'payment-queue',
      async (msg) => {
        const request = JSON.parse(msg.content.toString());
        const { payment_data, concert_data, concert_id } = request;
        // console.log('paymentData', payment_data);
        // Save in db
        const newPayment = new PaymentModel({
          concert_id: new mongoose.Types.ObjectId(concert_id),
          ...payment_data,
          user_PIN: new mongoose.Types.ObjectId(payment_data.user_PIN),
          status: 'success',
        });
        await newPayment.save();

        channel.publish(
          'query-exchange',
          'reservation',
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
    console.log('payment mongo db error', e);
  }
};

app.listen(5002, () => {
  console.log(`payment-service listening on port 5002!!! `);
});

Startup();

const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const express = require('express');

const ConcertModel = require('./models/concert');
const router = require('./routes');
const cors = require('cors');
const amqp = require('amqplib');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use(express.json());

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

const Startup = async () => {
  try {
    const database = await mongoose.connect(
      'mongodb://concert-mongo-service:27017/concert'
    );

    console.log(
      'connected to mongo concert!!',
      database.connection.host,
      database.connection.port,
      database.connection.name
    );
    const newConcert = new ConcertModel({
      name: 'concert 1',
      date: new Date(),
      venue: 'Venue 1',
      tickets: [
        {
          seat_number: 1,
          price: 1,
        },
      ],
    });
    await newConcert.save();
    const list = await ConcertModel.find({});
    // console.log('list', list);

    const connection = await amqp.connect(
      'amqp://rabbitmq-service:5672',
      'heartbeat=60'
    );
    const channel = await connection.createChannel();
    console.log('Connected to rabbitmq!!! ');

    await channel.assertExchange('query-exchange', 'topic', { durable: true });
    console.log('query exchange created');

    await channel.assertQueue('concert-queue', { durable: true });
    await channel.bindQueue('concert-queue', 'query-exchange', 'concert');

    await channel.consume(
      'concert-queue',
      async (msg) => {
        const request = JSON.parse(msg.content.toString());

        const { payment_data, concert_data, concert_id } =
          camelToSnake(request);
        // console.log('payment_data', payment_data);
        // console.log('concert_data', concert_data);

        channel.publish(
          'query-exchange',
          'payment',
          Buffer.from(
            JSON.stringify({
              concert_id,
              payment_data,
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
    console.error('err', e);
  }
  app.listen(5001, () => {
    console.log(`concert-service listening on port 5001!! `);
  });
};

Startup();

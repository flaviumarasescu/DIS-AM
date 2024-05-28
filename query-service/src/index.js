const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const amqp = require('amqplib');
const { randomBytes } = require('crypto');

const app = express();

let channel = null;
const responseHandlers = {};

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/query/concert', async (req, res) => {
  try {
    const correlationId = randomBytes(4).toString('hex');

    await channel.assertExchange('query-exchange', 'topic', { durable: true });
    console.log('query exchange created');

    await channel.assertQueue('query-queue', { durable: true });
    await channel.bindQueue('query-queue', 'query-exchange', 'query');

    responseHandlers[correlationId] = res;

    await channel.publish(
      'query-exchange',
      'concert',
      Buffer.from(JSON.stringify(req.body)),
      {
        correlationId,
      }
    );
  } catch (e) {
    console.log('Query error', e);
  }
});

const Startup = async () => {
  try {
    const connection = await amqp.connect(
      'amqp://rabbitmq-service:5672',
      'heartbeat=60'
    );

    channel = await connection.createChannel();
    console.log('Connected to rabbitmq!!');

    await channel.assertQueue('query-pdf-queue', { durable: true });
    await channel.bindQueue('query-pdf-queue', 'query-exchange', 'query-pdf');

    channel.consume(
      'query-pdf-queue',
      async (msg) => {
        try {
          const correlationId = msg.properties.correlationId;

          // Find the corresponding response handler
          const responseHandler = responseHandlers[correlationId];

          if (responseHandler) {
            responseHandler.end(msg.content);

            await channel.ack(msg);

            // Remove the response handler
            delete responseHandlers[correlationId];
          }
        } catch (e) {
          console.log('query-pdf-queue ERROR ', e);
        }
      },
      { noAck: false }
    );
  } catch (e) {
    console.log('Query error', e);
  }
};

app.listen(5000, () => {
  console.log(`query-service listening on port 5000!!!`);
  Startup();
});

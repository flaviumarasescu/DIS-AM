// const {TICKET_API_URL} = require('./URLs')

const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const CircularJSON = require('circular-json');
const router = require('./routes');
const amqp = require('amqplib');
const { randomBytes } = require('crypto');
const { log } = require('console');

const app = express();

let channel = null;
const responseHandlers = {};

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
// app.use("/api", router);

app.use('/api/query/concert', async (req, res) => {
  try {
    // console.log('resggg', res);
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
        //   replyTo: 'concert-reply',
        correlationId,
        //   // Unique correlation ID
      }
    );

    // const timeout = setTimeout(() => {
    //   console.log('timeoutff');
    //   res.status(504).json({ message: 'PDF service timed out' });
    //   // channel.close(); // Close the channel even if timed out
    // }, 9000); // Replace with a suitable timeout value

    // const pdfBuffer = await
  } catch (e) {
    console.log('Query error', e);
  }
});

// http://concert-service:5001/api/concert
// http://payment-service:5002/api/payment/create/
// http://reservation-service:5004/api/reservation/create/
// http://pdf-converter-service:5003/api/pdf-convert/create/

const Startup = async () => {
  try {
    const connection = await amqp.connect(
      'amqp://rabbitmq-service:5672',
      'heartbeat=60'
    );

    channel = await connection.createChannel();
    console.log('Connected to rabbitmq!!');
    // await channel.assertExchange('query-exchange', 'topic', { durable: true });
    // console.log('query exchange created');
    // await channel.assertQueue('query-queue', { durable: true });
    // await channel.bindQueue('query-queue', 'query-exchange', 'query');
    // await channel.assertQueue('query-pdf-queue', { durable: true });
    // await channel.bindQueue('query-pdf-queue', 'query-exchange', 'query-pdf');
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
            // console.log('responseHandlerff', responseHandler);
            // clearTimeout(timeout);
            // console.log('query consume processing message ff', msg);
            // console.log('pdfBuffer', pdfBuffer);
            // res.setHeader('Content-Type', 'application/pdf');
            // res.setHeader('Content-Disposition', 'inline; filename=output.pdf');
            responseHandler.end(msg.content);
            // return res.status(200).send(msg.content);
            // return msg.content;
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
  console.log('Updated code');
  Startup();
});

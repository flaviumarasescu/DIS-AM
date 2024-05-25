// const {TICKET_API_URL} = require('./URLs')

const bodyParser = require('body-parser');
const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const router = require('./routes');
const amqp = require('amqplib');
const { log } = require('console');

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use('/api', router);

const Startup = async () => {
  try {
    const connection = await amqp.connect(
      'amqp://rabbitmq-service:5672',
      'heartbeat=60'
    );
    const channel = await connection.createChannel();
    console.log('Connected to rabbitmq!!');

    await channel.assertExchange('query-exchange', 'topic', { durable: true });
    console.log('query exchange created');

    await channel.assertQueue('converter-queue', { durable: true });
    await channel.bindQueue('converter-queue', 'query-exchange', 'converter');

    channel.consume(
      'converter-queue',
      async (msg) => {
        const requestData = JSON.parse(msg.content.toString());
        // console.log('requestData', requestData);

        // Generate the PDF
        const doc = new PDFDocument();
        const buffers = [];

        doc.text(
          'Hello, this is a dynamic PDF generated using Node.js and pdfkit!'
        );
        // Add more dynamic content as needed

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(buffers);

          // Save the PDF to a file on the server (optional)
          const pdfFilePath = 'output.pdf';
          fs.writeFileSync(pdfFilePath, pdfBuffer);

          // Send the PDF buffer back to the Query Service
          channel.publish('query-exchange', 'query-pdf', pdfBuffer, {
            correlationId: msg.properties.correlationId,
          });
        });

        doc.end();
        channel.ack(msg);
      },
      { noAck: false }
    );
  } catch (e) {
    console.log('Convertor error', error);
  }
};

app.listen(5003, () => {
  console.log(`pdf converter-service listening on port 5003!!!`);
});

Startup();

const express = require('express');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const router = express.Router();

router.post('/pdf-convert/create', async (req, res) => {
  try {
    const doc = new PDFDocument();

    // Buffer to store the PDF content
    const buffers = [];

    doc.text(
      'Hello, this is a dynamic PDF generated using Node.js and pdfkit!'
    );

    // Pipe the PDF content to the buffers array
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      // Concatenate all the buffers into a single buffer
      const pdfBuffer = Buffer.concat(buffers);
      // Save the PDF to a file on the server
      const pdfFilePath = 'output.pdf';
      fs.writeFileSync(pdfFilePath, pdfBuffer);

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=output.pdf');

      // Send the PDF buffer to the client
      res.end(pdfBuffer);
    });

    // Finalize the PDF
    return doc.end();
  } catch (e) {
    console.error('Errf pdf converter:', e);
  }
});

module.exports = router;

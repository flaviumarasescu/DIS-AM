const express = require('express');
// const pdfMaster = require('pdf-master');
const PDFDocument = require('pdfkit');
const fs = require('fs');

const router = express.Router();

router.post('/pdf-convert/create', async (req, res) => {
  try {
    // console.log('in pdf req.body GGG', req.body);

    // var students = {
    //   id: 1,
    //   name: 'Sam',
    //   age: 21,
    // };

    // let options = {
    //   displayHeaderFooter: true,
    //   format: 'A4',
    //   headerTemplate: `<h3> Header </h3>`,
    //   footerTemplate: `<h3> Copyright 2023 </h3>`,
    //   margin: { top: '80px', bottom: '100px' },
    // };

    // let PDF = await pdfMaster.generatePdf('./template.hbs', students, options);
    // res.contentType('application/pdf');
    // res.status(200).send(PDF);
    // return res.status(200).send('PDF CONVERTED ffffffffffff');

    const doc = new PDFDocument();

    // Buffer to store the PDF content
    const buffers = [];

    // Add dynamic content to the PDF
    doc.text(
      'Hello, this is a dynamic PDF generated using Node.js and pdfkit!'
    );
    // Add more dynamic content as needed

    // Pipe the PDF content to the buffers array
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      // Concatenate all the buffers into a single buffer
      const pdfBuffer = Buffer.concat(buffers);
      console.log();
      // Save the PDF to a file on the server
      const pdfFilePath = 'output.pdf';
      fs.writeFileSync(pdfFilePath, pdfBuffer);
      console.log('2');

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename=output.pdf');
      console.log('3');

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

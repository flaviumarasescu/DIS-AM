const express = require('express');

const router = express.Router();

router.get('/query', (req, res) => {
  res.status(200).send('GET query');
});

module.exports = router;

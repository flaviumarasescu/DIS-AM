const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { TICKET_API_URL } = require("../URLs");
const proxy = require("express-http-proxy");
const axios = require("axios");

const router = express.Router();

// router.get('/query/concert', async (req, res) => {
//     await axios.get("http://concert-service:5001/api/concert")
//         .then(res => {
//             console.log(' data concert',res.data);
//         })
//         .catch(error => {
//             console.error('Fetch error:', error);
//         });
//     res.status(200).send(`GET query ffffffffffff `)
// })
//
// router.post('/query/concert', async (req, res) => {
//     console.log('in post request')
//     await axios.post("http://concert-service:5001/api/concert")
//         .then(res => {
//             console.log(' data concert',res.data);
//         })
//         .catch(error => {
//             console.error('Fetch error:', error);
//         });
//     res.status(200).send(`POST query ffffffffffff `)
// })

router.get("/query", (req, res) => {
  res.status(200).send("GET query");
});

module.exports = router;

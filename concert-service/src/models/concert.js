const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  seat_number: { type: String, required: true },
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: ["available", "reserved", "sold"],
    default: "available",
  },
});

const concertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  tickets: [ticketSchema],
});

const Concert = mongoose.model("Concert", concertSchema);

module.exports = Concert;

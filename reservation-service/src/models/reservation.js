const mongoose = require("mongoose");

const ticketReservationSchema = new mongoose.Schema({
  ticket_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  seat_number: { type: String, required: true },
  status: { type: String, enum: ["reserved", "expired"], default: "reserved" },
});

const reservationSchema = new mongoose.Schema({
  user_PIN: { type: mongoose.Schema.Types.ObjectId, required: true },
  concert_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  tickets: [ticketReservationSchema],
  expiration_time: { type: Date, required: true },
});

const Reservation = mongoose.model("Reservation", reservationSchema);

module.exports = Reservation;

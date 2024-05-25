const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user_PIN: { type: mongoose.Schema.Types.ObjectId, required: true },
  concert_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["success", "pending", "failed"],
    default: "pending",
  },
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;

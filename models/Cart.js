// models/Cart.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const cartItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, default: 1 },
});

const cartSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: [cartItemSchema],
});

module.exports = mongoose.model("Cart", cartSchema);

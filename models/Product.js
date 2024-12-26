// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dateUploaded: { type: Date, default: Date.now },
  sold: { type: Boolean, default: false },
  soldDate: { type: Date }
});


module.exports = mongoose.model('Product', productSchema);

// models/PurchaseHistory.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const purchaseHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  products: [
    {
      productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      purchaseDate: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('PurchaseHistory', purchaseHistorySchema);

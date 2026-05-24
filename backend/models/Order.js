const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  cancellationReason: {
    type: String,
    default: null
  },
  cancellationDate: {
    type: Date,
    default: null
  },
  refundStatus: {
    type: String,
    enum: ['not_applicable', 'pending', 'processed', 'rejected'],
    default: 'not_applicable'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for payment information
orderSchema.virtual('payment', {
  ref: 'Payment',
  localField: '_id',
  foreignField: 'orderId',
  justOne: true
});

// Generate order number before validation
orderSchema.pre('validate', function(next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  next();
});

// Method to calculate total amount
orderSchema.pre('save', function(next) {
  if (this.items && this.items.length > 0) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  }
  next();
});

// Method to check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'processing'].includes(this.orderStatus);
};

// Method to cancel order
orderSchema.methods.cancel = function(reason) {
  if (this.canBeCancelled()) {
    this.orderStatus = 'cancelled';
    this.cancellationReason = reason;
    this.cancellationDate = new Date();
    return true;
  }
  return false;
};

const Order = mongoose.model('Order', orderSchema);

module.exports = Order; 
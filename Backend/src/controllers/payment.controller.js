require("dotenv").config();

const productModel = require("../models/product.model");
const Razorpay = require("razorpay");
const PaymentModel = require("../models/payment.model");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createOrder(req, res) {
  try {
    const product = await productModel.findOne();
    if (!product) {
      return res.status(404).send("Product not found");
    }

    const options = {
      amount: product.price.amount,
      currency: product.price.currency,
    };
    const order = await razorpay.orders.create(options);

    await PaymentModel.create({
      orderId: order.id,
      price: {
        amount: order.amount,
        currency: order.currency,
      },
      status: "PENDING",
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).send("Error creating order");
  }
}

async function verifyPayment(req, res) {
  const { razorpayOrderId, razorpayPaymentId, signature } = req.body;
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (!razorpayOrderId || !razorpayPaymentId || !signature) {
    return res.status(400).send("Missing payment verification details");
  }

  try {
    const {
      validatePaymentVerification,
    } = require("../../node_modules/razorpay/dist/utils/razorpay-utils.js");

    const result = validatePaymentVerification(
      { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
      signature,
      secret,
    );
    if (result) {
      const payment = await PaymentModel.findOne({ orderId: razorpayOrderId });
      if (!payment) {
        return res.status(404).send("Payment order not found");
      }

      payment.paymentId = razorpayPaymentId;
      payment.signature = signature;
      payment.status = "COMPLETED";
      await payment.save();
      res.json({ status: "success" });
    } else {
      res.status(400).send("Invalid signature");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error verifying payment");
  }
}
module.exports = {
  createOrder,
  verifyPayment
};

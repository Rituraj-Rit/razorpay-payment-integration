const express = require('express')
const productRoutes = require('./routes/product.routes')
const cors = require('cors');
const paymentRoutes = require('./routes/payment.routes')
const app = express();


app.use(express.json());
app.use(cors());

app.use('/api/products', productRoutes);
app.use('/api/payments', paymentRoutes);

module.exports = app;
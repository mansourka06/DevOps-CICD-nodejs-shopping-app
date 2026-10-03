// FILE: controllers/shop.js

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');
const { fetchAllProducts, forwardError } = require('../utils');

/* -------------------------------------------------------------------------- */
/* SHOP PAGES                                                                  */
/* -------------------------------------------------------------------------- */

exports.getIndex = (req, res, next) => {
  fetchAllProducts('shop/index', 'Shop', '/', req, res, next);
};

exports.getProducts = (req, res, next) => {
  fetchAllProducts(
    'shop/product-list',
    'All Products',
    '/products',
    req,
    res,
    next
  );
};

exports.getProduct = (req, res, next) => {
  Product.findById(req.params.productId)
    .then(product => {
      res.render('shop/product-detail', {
        title: product.title,
        path: '/products',
        product
      });
    })
    .catch(err => forwardError(err, next));
};

/* -------------------------------------------------------------------------- */
/* CART                                                                        */
/* -------------------------------------------------------------------------- */

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.products.productId')
    .execPopulate()
    .then(user => {
      res.render('shop/cart', {
        title: 'Your Cart',
        path: '/cart',
        products: user.cart.products
      });
    })
    .catch(err => forwardError(err, next));
};

exports.postCart = (req, res, next) => {
  Product.findById(req.body.productId)
    .then(product => req.user.addToCart(product))
    .then(() => res.redirect('/cart'))
    .catch(err => forwardError(err, next));
};

exports.postCartDeleteProduct = (req, res, next) => {
  req.user
    .deleteProductFromCart(req.body.productId)
    .then(() => res.redirect('/cart'))
    .catch(err => forwardError(err, next));
};

/* -------------------------------------------------------------------------- */
/* CHECKOUT — DEMO                                                             */
/* -------------------------------------------------------------------------- */

exports.getCheckout = (req, res, next) => {
  req.user
    .populate('cart.products.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.products;

      const totalPrice = products.reduce((sum, item) => {
        return sum + item.quantity * item.productId.price;
      }, 0);

      res.render('shop/checkout', {
        title: 'Checkout',
        path: '/checkout',
        products,
        totalPrice
      });
    })
    .catch(err => forwardError(err, next));
};

exports.postDemoCheckout = (req, res, next) => {
  req.user
    .populate('cart.products.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.products.map(item => ({
        product: { ...item.productId._doc },
        quantity: item.quantity
      }));

      const order = new Order({
        user: {
          email: user.email,
          userId: user._id
        },
        products
      });

      return order.save();
    })
    .then(() => req.user.clearCart())
    .then(() => res.redirect('/orders'))
    .catch(err => forwardError(err, next));
};

/* -------------------------------------------------------------------------- */
/* ORDERS                                                                      */
/* -------------------------------------------------------------------------- */

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        title: 'Your Orders',
        path: '/orders',
        orders
      });
    })
    .catch(err => forwardError(err, next));
};

/* -------------------------------------------------------------------------- */
/* INVOICE                                                                     */
/* -------------------------------------------------------------------------- */

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return forwardError('Order not found', next);
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return forwardError('Unauthorized', next);
      }

      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `inline; filename="${invoiceName}"`
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', { underline: true });
      pdfDoc.moveDown();

      let totalPrice = 0;

      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(`${prod.product.title} - ${prod.quantity} x $${prod.product.price}`);
      });

      pdfDoc.moveDown();
      pdfDoc.fontSize(18).text(`Total Price: $${totalPrice}`);
      pdfDoc.end();
    })
    .catch(err => forwardError(err, next));
};

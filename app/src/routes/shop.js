// FILE: routes/shop.js

const express = require('express');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

/* -------------------------------------------------------------------------- */
/* SHOP                                                                        */
/* -------------------------------------------------------------------------- */

router.get('/', shopController.getIndex);
router.get('/products', shopController.getProducts);
router.get('/products/:productId', shopController.getProduct);

/* -------------------------------------------------------------------------- */
/* CART                                                                        */
/* -------------------------------------------------------------------------- */

router.get('/cart', isAuth, shopController.getCart);
router.post('/cart', isAuth, shopController.postCart);
router.post('/cart/delete-item', isAuth, shopController.postCartDeleteProduct);

/* -------------------------------------------------------------------------- */
/* CHECKOUT (DEMO MODE)                                                        */
/* -------------------------------------------------------------------------- */

router.get('/checkout', isAuth, shopController.getCheckout);
router.post('/checkout/demo', isAuth, shopController.postDemoCheckout);

/* -------------------------------------------------------------------------- */
/* ORDERS                                                                      */
/* -------------------------------------------------------------------------- */

router.get('/orders', isAuth, shopController.getOrders);
router.get('/orders/:orderId', isAuth, shopController.getInvoice);

module.exports = router;

const path = require('path');
const isAuth =require('../middleware/is-auth');

const express = require('express');

const adminController = require('../controllers/admin');

const router = express.Router();

// SINCE ALL THESE ARE ADMIN PAGES
// WE WANT THE USER TO ONLY BE ABLE TO ACCESS IT IF THEY ARE AUTHENTICATED
// REQUEST WHICH REACH HERE are parsed from left to right in our controllers
// so first requests goes into isAuth and then to the next controller


// /admin/add-product => GET
router.get('/add-product', isAuth , adminController.getAddProduct);                  

// // /admin/products => GET
router.get('/products', isAuth , adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',  isAuth ,adminController.postAddProduct);

// /admin/edit-product =>post
router.post('/edit-product', isAuth ,adminController.postEditProduct);

// /admin/edit-product/:prodId => GET
router.get('/edit-product/:prodId', isAuth ,adminController.getEditProduct);

// /admin/delete-product =>post
router.post('/delete-product', isAuth ,adminController.postDeleteProduct);

module.exports = router;

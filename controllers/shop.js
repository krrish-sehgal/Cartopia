const Product = require('../models/product');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;       //getting the object id constructor

const Order = require("../models/orders");
const user = require('../models/user');

exports.getProducts = (req, res, next) => {

  Product.find()
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        isAuthenticated : req.session.isLoggedIn,
        path: '/products'
      })
    }).catch(err => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  Product.find()
    .then(products => {

      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        isAuthenticated : req.session.isLoggedIn

      });
    })
    .catch(err => {
      console.log(err);
    })
};

exports.postCreateOrder = (req, res, next) => {
  new Promise((resolve,reject)=>{
    return resolve(req.user)
  })
    // .populate('cart.items.productId')
    .then(user => {
      // i have a product array in my orders model 
      // that has 2 field, the id and product object
      const products = user.cart.items.map(i => {
        // Now since we have populated our cart.items.productId undergiven code , shouldbve yield all product porrperties but it doesnt
        // return { quantity: i.quantity, product: i.productId };
        return { quantity: i.quantity, product: {...i.productId._doc}};  
         //._doc gives us access to the full document referred in productId field, so we dont have to call populate
      })
      const order = new Order({
        Products: products,
        User: {
          UserId: req.user._id,
          Name : req.user.userName
        }
      })
      return order.save();
    })
    .then(result => {
      return req.user.emptyCart();
    })
    .then(result=>{
      res.redirect('/orders');
    })
    .catch(err => {
      console.log("Couldnt save in orders collection")
      console.log(err);
    })

}

exports.getOrders = (req, res, next) => {
  Order.find({'User.UserId' : req.user._id})
    .then(orders => {
      console.log(orders);
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        isAuthenticated : req.session.isLoggedIn,
        orders: orders
      });
    })
    .catch(err => {
      console.log(err);
    })

};

exports.getProductDetails = (req, res, next) => {

  const prodId = req.params.productId;
  console.log(prodId);
  Product.findById(new ObjectId(prodId))     //we have , this as mongoose method , that takes in string , or object id, if string is passed it automatically converts into objectId
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        path: '/products/:prodId',
        pageTitle: 'prod Details',
        isAuthenticated : req.session.isLoggedIn

      });
    })
    .catch(err => {

      // console.log("Details couldnt be fetched");
      console.log(err);
    })


}
exports.getCart = (req, res, next) => {
  // console.log("this is the users " + req.user);
  req.user
    .populate('cart.items.productId')
    .then(user => {   //user will be just an object with productId populated
      const products = user.cart.items;     //products will be in it
      // console.log("This is getCart func" + products);
      res.render('shop/cart', {
        products: products,
        path: '/cart',
        pageTitle: 'Your Cart',
        isAuthenticated : req.session.isLoggedIn

      });
    })
    .catch(err => {
      console.log(err);
    })
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;    //extracting the productId , which is sent to the server with the help of form , when add to cart is clicked
  Product
    .findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/cart');
      // console.log(result);
    })
    .catch(err => {
      console.log(err);
    })
}

exports.postCartDeleteProduct = (req, res, next) => {

  const prodId = req.body.productId;
  req.user
    .deleteItemFromCart(prodId)
    .then(result => {
      console.log("deleted");
      res.redirect('/products');
    })
    .catch(err => {
      console.log(err);
    });
}
const Product = require('../models/product');
const mongoose = require('mongoose');
const dbObjectId = mongoose.Types.ObjectId;

exports.getAddProduct = (req, res, next) => {
  
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    edit: false,
    isAuthenticated:req.session.isLoggedIn
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description; 
  console.log("This is"  + req.session.user);
  // const userId = new dbObjectId(req.user._id);
  const product= new Product({
    title:title,
    imageUrl:imageUrl,
    price:price,
    description:description,
    userId:new dbObjectId(req.user._id)              //we can also just pass req.user and mongoose will make sure to use it
  });
  product.save()    //.save is provided by mongoose
  .then(result=>{
    console.log('Created Product');
    res.redirect('/admin/products');
    // mongodb will automatically create an id for all the files , that will be unique
  })
  .catch(err=>{
    console.log(err);
  })
}

exports.getProducts = (req, res, next) => {

  Product.find({userId :req.user._id})          //authorisation , along with some changes in edit and delete , adding if statements to check wether the smae use rwho added the product in this website , is only able to access it
  .then(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      isAuthenticated : req.session.isLoggedIn,
      path: '/admin/products'
    });
  });
};

exports.getEditProduct = (req,res,next)=>{
  const editMode= req.query.edit;
  const prodId = req.params.prodId;

  if(!editMode){
    return res.redirect('/');
  }

    Product.findById(prodId)
    .then(product=>{

      if(!product){
        return res.redirect('/');
      }
      
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        product:product,
        isAuthenticated : req.session.isLoggedIn,
        edit: editMode
      })
    })

  .catch(err=>{
    console.log(err);
  });
}

exports.postEditProduct = (req,res,next)=>{
  console.log("reached post edit product controller")
  // Now we modify the product
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const prodId = req.body.productId;
  
  Product.findById(prodId)
  .then(product=>{       

    if(product.userId.toString() !== req.user._id.toString()){
      console.log("check");
      return res.redirect('/');
      
    } 
    product.title =title,
    product.imageUrl = imageUrl,
    product.price = price,
    product.description= description

    product.save()          // and call save it wont add anew prod , but update the exissiting one
    .then(result =>{
      console.log('DB  updated');
      res.redirect("/admin/products");
    })
  })
  .catch(err=>{            
    console.log(err);
  })

  // or we can use Product.findOneByIdAndUpdate(id, js object matching to schema)
  
}
  exports.postDeleteProduct = (req,res,next)=>{
    const prodId = req.body.productId;
    
    Product.deleteOne({_id: prodId, userId: req.user._id})       //again something provided by monggoose
    .then(result =>{
      console.log("Product Destoyed")
      res.redirect('/');
    })
    .catch(err=>{
      console.log(err);
    })
  }

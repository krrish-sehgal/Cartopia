const mongodb = require('mongodb');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaObjectId = Schema.Types.ObjectId;
const dbObjectId = mongoose.Types.ObjectId;
const Product = require('./product');

const UserSchema = new Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password:{
        type: String,
        required:true
    },
    resetToken: String,                 // wont be requrired always , (if pass hsnt been sent to reset or it has already been reseetted )
    tokenExpirationDate  : Date,       
    cart: {
        // type: Object,
        items: [
            {
                productId: { type: SchemaObjectId, ref: 'Product', required: true },
                quantity: { type: Number }
            }
        ]
    }
})
//ref is used to define a reference to other models , that might be related to this model

// a methods key is an object that allows you to add your own methods
// we have to use the function keyword , so that the this keyword inside the funcition still refers to the userSchema and not th funciton
UserSchema.methods.addToCart = function (product) {

    const cartProductIdx = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString();
    })

    let newQuantity = 1;
    let updatedCartItems = [...this.cart.items];
    console.log(updatedCartItems.quantity);
    if (cartProductIdx >= 0) {
        newQuantity = this.cart.items[cartProductIdx].quantity + 1;
        updatedCartItems[cartProductIdx].quantity = newQuantity;
        console.log("sup"+updatedCartItems.quantity);
    }
    else {
        updatedCartItems.push(
            { productId: new dbObjectId(product._id), quantity: newQuantity }
        )
    }
    const updatedCart = { items: updatedCartItems };
    this.cart = updatedCart;
    console.log(newQuantity);
    return this.save();
}

UserSchema.methods.deleteItemFromCart= function(productId){

    const updatedCart = this.cart.items.filter(product => {
        return product.productId.toString() !== productId;   
       
    })
   this.cart = updatedCart;
   return this.save();
}

UserSchema.methods.emptyCart= function(){

    this.cart =  { items:[] };
    return this.save();
}

module.exports = mongoose.model('User', UserSchema);
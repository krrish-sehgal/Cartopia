const mongoose = require('mongoose');
const Schema = mongoose.Schema;    //getting the schema constructor

const productSchema = new Schema({

  title: {
    type: String,
    required: true
    // Since in mongodb , we have the flexiiblity of not working with the schema ,
    // by default wahtever we do give in our schema can simply be ignored to take values ni 
    // but by setting reqd as true , we give up this flexibility in turn for aother advantages , as to avoiderror whule outputting

  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',                     //ref is used to define a reference to other models , that might be related to this model, and then we use populate on this
    required: true
  }
})

//  just like in sequelise , we had .define('modelname', js object with schema)
// we have the model method in mongodb , and a collection will atuomatically be formed with the plural of the model name
module.exports = mongoose.model('Product', productSchema);



const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const SchemaObjectId = Schema.Types.ObjectId;

const OrderSchema = new Schema({
    Products:{
        type:Array,
        product:{
            type:Object,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        }

    },
    User:{
        UserId:{
            type:SchemaObjectId,
            ref:'User',
            required:true
        },
        Name:{
            type:String,
            required:true
        }
    }

})

module.exports= mongoose.model('Orders',OrderSchema);
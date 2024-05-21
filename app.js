const path = require('path');
const mongoose= require('mongoose');

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');        
const MongoDBStore = require('connect-mongodb-session')(session);
const errorController = require('./controllers/error');
const csrf = require('csurf');
const flash = require('connect-flash');



const MONGODB_URI = 'mongodb://Krrish:kishu123@ac-7gvopvc-shard-00-00.1nxbntm.mongodb.net:27017,ac-7gvopvc-shard-00-01.1nxbntm.mongodb.net:27017,ac-7gvopvc-shard-00-02.1nxbntm.mongodb.net:27017/shop?ssl=true&replicaSet=atlas-11fue8-shard-0&authSource=admin&w=majority&appName=Cluster1';

const app = express();
const store = new MongoDBStore({
    uri :MONGODB_URI,                  
    collection :"sessions"               
})

const csrfProtection = csrf();
const flashMessage = flash();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
    session({
        secret: 'my secret',
        resave:false,
        saveUninitialized:false,
        store :store                    //setting to store in a db store
    })
)

app.use(csrfProtection);          
app.use(flashMessage);
const User = require("./models/user");

app.use((req,res,next)=>{   
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id)     
    .then(user=>{           
        if(!user){
            console.log("not exsists");
        }
        console.log("this is user after sessino = " + user);
        req.user = user;           
        next();
    })       
    .catch(err=>{
        console.log(err);
    })                 
})


app.use((req,res,next)=>{

    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();

    next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
    .connect(
        MONGODB_URI
    )
    .then(result=>{
        app.listen(3000,()=>{
            console.log('Running on http://localhost:3000/')
        });
    })
    .catch(err=>{
        console.log(err);
    });

                

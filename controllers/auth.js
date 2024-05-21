const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const crypto = require('crypto');


// After having the check middleweare in place of theroutes , we will now use
// another validation result package that helps in storing all the errors in the format of the input fields , we have set the middlewar on
const {validationResult} = require('express-validator');

const etherealTransporter  = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'rickie.larson93@ethereal.email',
        pass: 'q8Gy3g4fjr4hjASEQW'
    }
})

exports.getLogin = (req,res,next)=>{
    let message= req.flash('error');
    if(message.length>0){
        message = message[0];
    }else{
        message= null;
    }
    res.render('auth/login',{
        path:'/login',
        pageTitle:'Login',
        isAuthenticated : req.session.isLoggedIn,
        errorMessage: message         //retrieving the error message and this paritcular action deletes the temp data in session
    });

}
exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                req.flash('error', "Invalid email or password");    // using flash to store temp error message in session to display while redirecting to login
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)                 //this is a method that decrypts the password that is stored in the database
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            if (err) {
                                console.error(err);
                            }
                            return res.redirect("/");
                        });
                    } else {
                        req.flash('error', 'Password does not match');
                        return res.redirect("/login");
                    }
                })
                .catch(err => {
                    console.error(err);
                    return res.redirect('/login');
                });
        })
        .catch(err => {
            console.error(err);
            return res.redirect('/login');
        });
};

exports.postLogOut = (req,res,next)=>{
    req.session.destroy((err)=>{                
        console.log(err);                       
        res.redirect('/');                     
    })
}

exports.getSignUp = (req,res,next)=>{
    let message= req.flash('error');
    if(message.length>0){
        message = message[0];
    }else{
        message= null;
    }
    res.render("auth/signup",{
        path:'/signup',
        pageTitle : 'SignUp',
        isAuthenticated:false,
        errorMessage : message
    })
}


exports.postSignUp = (req,res,next)=>{
    let name ="Test";
    let email= req.body.email;
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);                //this will have the result of that check middlware , and will have an array of all errors

    if(!errors.isEmpty()){
        console.log(errors.array())
        // if errors arr is not empty then i want to render back my page with an error message
        return res.status(422).render('auth/signup',{
            path:'/signup',
            pageTitle : 'SignUp',
            isAuthenticated:false,
            errorMessage: errors.array()[0].msg
        })
        
    }
    User.findOne({email:email})
    .then(userDoc=>{
        if(userDoc){
            req.flash('error','Email already registered');
            res.redirect("/login");
        }
        return bcrypt
           .hash(password,12)   

        .then(hashedPass=>{
            const user = new User({
                userName : name,
                email : email,
                password:hashedPass,
                cart : {items: []}
            })
            return user.save();
        })   
        .then(result=>{
            const mailOptions = {
                to : email,
                from : "monikasehgal03@gmail.com",
                message: "You have been signed up ",
                subject: "Signed Up",
                html :`
                    <h1> This is the html content of  the mail  </h1>
                `
            }
            etherealTransporter.sendMail(mailOptions,(err,info)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("mail has been sent , with response =  " + info.response);
                }
            })
            res.redirect('/');
        })   
    })
    .catch(err=>{
        console.log(err);
    })
}

exports.getReset = (req,res,next) =>{

    let message= req.flash('error');
    if(message.length>0){
        message = message[0];
    }else{
        message= null;
    }
    res.render('auth/reset',{
        path:'/reset',
        pageTitle: "Reset Password",
        errorMessage: message
    });

}

exports.postReset =(req,res,next)=>{
    // Now what we want is to allow users to only reset their passwords throught the email that we sent 
    // so similar to csrf , we'll send a crypted unique code (token)using inbuilt cryto js lib
    // that further ensures that the user is only able to change the password form the link that we sent thorugh the mail
    // and not from somewehre else
    // We'll also need an expiration date of that token, so that after like 10 mins user is not allowed to reset the password
    
    crypto.randomBytes(33,(err,buffer)=>{
        if(err){
            console.log(err);
            req.flash('error','sone error');
            return res.redirect('/reset');
        }
        // if we get a buffer of those cypted random vlaues
        const token= buffer.toString('hex'); //since hex will be the form in which we'll recieve our buffer
        // now this token should get stored on the databse , since it belongs to the user
        // So we'll add two more fields in our user model to store the token


        // find the user and store this token in its database
        User.findOne({email:req.body.email})
        .then(user=>{
            if(!user){
                req.flash('error','No account with email found');
            }
            user.resetToken = token;
            user.tokenExpirationDate  = Date.now() + 3600000;               //1hr = 3600 seconds = 36,00,000 millisecs ( we have to express in milliseconds)
            return user.save();
        })
        .then(result=>{
            res.redirect('/');
            const mailOptions= {
                to : req.body.email,
                from : "monikasehgal03@gmail.com",
                message: "You have requested a password change",
                subject: "password-change-request",
                html :`
                    <h1> This is the html content of  the mail  </h1>
                    <p>Click this<a href = "http://localhost:3000/reset/${token}">link</a> to reset the password: </p>
                `
            }
            etherealTransporter.sendMail(mailOptions,(err,info)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log("passwords changed mail," + info.response);
                }
            })
        })
        .catch(err=>{
            console.log(err);
        })

    })
}
exports.getNewPassword = (req,res,next)=>{
    const token = req.params.token;
    User.findOne({resetToken:token , tokenExpirationDate : {$gt: Date.now()}})
    .then(user=>{
        if(!user){
            console.log("somethiing went wrong , prolly token expired")
        }
        // console.log("yo user" + user);
        let message= req.flash('error');
        if(message.length>0){
            message = message[0];
        }else{
            message= null;
        }
        res.render('auth/newPass',{
            path:`/reset/${token}`,
            pageTitle: "Reset Password",
            errorMessage:message,
            passToken: token,
            userId : user._id
        })
    })
    .catch(err=>{
        console.log(err);
    })
    
}

exports.postNewPassword = (req,res,next)=>{
    const passwordToken = req.body.newPasswordToken;
    const userId = req.body.userId;
    const newPassword = req.body.newPassword;
    let user;
    User.findOne({_id:userId ,resetToken:passwordToken })
    .then(user=>{
        user = user;
        return bcrypt.hash(newPassword,12)
    })
    .then(hashedPass=>{
        user.resetToken= undefined;
        user.tokenExpirationDate = undefined;
        user.password = hashedPass;
        return user.save();
    })
    .then(result=>{
        console.log("passChanged");
        res.redirect("/login");
    })
    .catch(err=>{
        console.log(err);
    })
}
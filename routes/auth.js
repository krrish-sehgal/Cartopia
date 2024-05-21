const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
// const expValidator = require('express-validator/check');             //getting a check validator object 
const { query, body } = require('express-validator');             //destructuring and gettting a check function from expValidator

router.get('/login', authController.getLogin);

router.post('/login', authController.postLogin);

router.post('/logout', authController.postLogOut);

router.get('/signup', authController.getSignUp);

// the check function takes the array or name of the fields , that is in the form , and returns an object having different methods , that canbe found at:
// 
router.post('/signup',
        body('email')       
        .custom((value,{req})=>{                    //setting up a custom validators
            if(value==="test@test.com"){
                throw new Error('Forbidden mail')
            }
            return true;
        })
        .isEmail()
        .withMessage('Please enter a valid email')
        , authController.postSignUp);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
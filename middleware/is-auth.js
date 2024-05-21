module.exports = (req,res,next)=>{
    if(!req.session.isLoggedIn){
        return res.redirect('/');           //if not authorised to access redirect to home page
    }
    next();                                 //else go to the right middleware mentioned in our route
}


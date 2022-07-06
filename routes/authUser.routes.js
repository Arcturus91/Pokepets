const router = require('express').Router();
const User = require('../models/User.model');
const bcryptjs = require('bcryptjs');
const fileUploader = require('../config/cloudinary.config');
const mongoose = require('mongoose');
const {checkRole} = require("../middleware/customMiddleware")

const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");
const { reset } = require('nodemon');

//Create user
router.get('/signup',(req,res,next)=>{
    console.log('Llegaste a la ruta de logueo')
    console.log('El req.session', req.session);
    if (req.session.currentUser) {
        return res.redirect(`user/userProfile/${req.session.currentUser._id}`)
      }
    res.render('auth/userSignup')
});

router.post('/signup',fileUploader.single('profile_pic'),(req,res)=>{

    if(!req.file||!profile_pic){
       profile_pic = "https://res.cloudinary.com/dhgfid3ej/image/upload/v1558806705/asdsadsa_iysw1l.jpg"
    }else{
        profile_pic= req.file.path
    }

    const {username,lastname,password,number,email} = req.body;

    console.log('que es el req.body: ',req.body)
    if(!username||!lastname||!number||!email||!password){
        console.log('ERROR en los datos de validacion para el post de sigup')
        res.render('auth/userSignup',{
            errorMessage:'All fields are required'
        })
        return;
    }
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
    if(!regex.test(password)){
        res.render('auth/userSingup',{errorMessage:'The password needs to have at least eight characters, must contain at least one uppercase letter, lowercase letter and a number.'})
        return;
    }
    const salt = bcryptjs.genSaltSync(10)
    const hashedPassword = bcryptjs.hashSync(password,salt)
    console.log('password hash: ', hashedPassword)
    User.create({
            username,
            lastname,
            password:hashedPassword,
            number,
            email,
            profile_pic
        })
    .then(userFromDB =>{
        console.log('New user create', userFromDB)
        req.session.currentUser = userFromDB
        console.log('El req.session: ', req.session);
        res.redirect(`user/userProfile/${userFromDB._id}`) 
    })
    .catch(error =>{
        console.log('Ha salido un error en el post ID',error)
        if(error instanceof mongoose.Error.ValidationError){
            res.render('auth/userSignup',{
                errorMessage:error.message
            });
        }else if(error.code===11000){
            res.render('auth/userSignup',{
                errorMessage: 'The email must be unique'
            })
        }else{
            console.log('Salio un error en sigup')
        }
    })
})

//Show your profile
router.get('/user/userProfile/:id',(req,res,next)=>{
    const {id} = req.params;
    User.findById(id)
    .populate('_pets') //add _commets
    .then(user =>{
        //console.log('Llegaste al get de userProfile', req.session.currentUser)
        console.log('El USUARIO: ',user)
        if( user.role === 'ADMIN'){
            res.render('user/adminProfile',{user})
        }else{
            res.render('user/userProfile',{user})
        }
    })
    .catch(error =>{
        console.log('Ha salido un error en el get ID',error)
        next(error)
    })
})

//Login User
router.get('/login',(req,res,next)=>{
    console.log('currentUser: ',req.session.currentUser)
    if (req.session.currentUser) {
        return res.redirect(`user/userProfile/${req.session.currentUser._id}`)
      }
    res.render('auth/userLogin')
})

router.post('/login', (req,res,next)=>{
    const {email, password} = req.body;
    if(!email||!password){
        res.render('auth/userLogin',{
            errorMessage:'All fields are required'
        });
        return;
    }
    User.findOne({email})
    .then((user) =>{
        req.session.currentUser = user;
        if(!user){
            res.render('auth/userLogin')
            return
        }else if(bcryptjs.compareSync(password,user.password)){
            res.redirect(`/auth/user/userProfile/${user._id}`);
        }else{
            res.render('auth/userLogin',{
                errorMessage:'Wrong username or password'
            })
        }
    })
    .catch(error =>{
        console.log('Ha salido un error en el post login',error)
        next(error)
    })
})

//Show list's users only ADMIN
router.get("/listUsers",checkRole(['ADMIN']),(req, res,next)=>{
    console.log('Estas en get listUsers')
    User.find()
    .populate('_pets')
    .then((users) => {
        res.render("listUsers", { users });
    })
    .catch((error) => {
        console.log("error", error);
        next();
    });
});

//Delete users
router.get('/deleteUser/:id',checkRole(['ADMIN']),(req, res, next)=>{
    const { id } = req.params; 
    User.findByIdAndDelete(id)
    .then(()=>{
        console.log('User delete');
    })
    /*.then(() => {
        console.log("User delete")
        //res.redirect('auth/listUsers')
        //res.render('auth/listUsers')
        //res.render('listUsers')
        //res.redirect('listUsers')
    }) */
    User.find()
    .populate('_pets')
    .then((users) => {
        res.render("listUsers", { users });
    })
    .catch(err => {
      console.log('user delete error',err)
    })
  
  })

//Kill session
router.post('/logout', (req, res, next) => {
    req.session.destroy(err => {
        console.log('Destruyendo la sesion');
      if (err) next(err);
      res.redirect('/listPets');
    });
    console.log('Sesion destruida');
  });

//Edit user
router.get('/editUser/:id',(req,res,next)=>{
    console.log('Llegaste a la ruta de editUser')
    let user = req.session.currentUser
    if(!user){
        res.render('auth/userLogin')
        return;
    }
    User.findById(user._id)
    .then(userFromDB=>{
        //console.log('userFromDB',userFromDB)
         res.render('user/editUser',userFromDB)
         return;  
    })
    .catch(error=>console.log('Ha salido un error en GET edit user'))
});

 router.post('/editUser/:id',fileUploader.single('profile_pic'),(req,res,next)=>{
    const {number,email} = req.body;
    const {id} = req.params
    console.log("EL ID:", id)
    if(!req.file||!profile_pic){
       profile_pic = "https://res.cloudinary.com/dhgfid3ej/image/upload/v1558806705/asdsadsa_iysw1l.jpg"
    }else{
        profile_pic= req.file.path
    }
    console.log('que es el req.body: ',req.body)
    if(!number||!email){
        res.render('auth/editUser',{errorMessage:'The email and password fields must be filled'})
        return;
    }
    User.findByIdAndUpdate(id,{number,email,profile_pic},{new:true})
    .then(userUpdate =>{
        console.log('New user create', userUpdate)
        req.session.currentUser = userUpdate
        console.log('El req.session: ', req.session);
        res.redirect(`/auth/user/userProfile/${id}`) 
    })
    .catch(error =>{
        console.log('Ha salido un error en el post update',error)
        if(error instanceof mongoose.Error.ValidationError){
            reset.render('auth/userSignup',{
                errorMessage:error.message
            });
        }else if(error.code===11000){
            res.render('auth/userSignup',{
                errorMessage: 'The email must be unique'
            })
        }else{
            res.render('auth/userSignup',{
                errorMessage: 'The email must be unique'
            })
        }
    })
})

module.exports = router;

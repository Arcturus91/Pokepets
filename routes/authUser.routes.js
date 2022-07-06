const router = require('express').Router();
const User = require('../models/User.model');
const bcryptjs = require('bcryptjs');
const fileUploader = require('../config/cloudinary.config');
const mongoose = require('mongoose');
const {checkRole} = require("../middleware/customMiddleware")

//Create user
router.get('/signup',(req,res,next)=>{
    console.log('Llegaste a la ruta de logueo')
    console.log('El req.session', req.session);
    if (req.session.currentUser) {
        return res.redirect(`user/userProfile/${req.session.currentUser._id}`)
      }
    //console.log("req.session.currentUser: ", req.session.currentUser)

    res.render('auth/userSignup')
});

router.post('/signup',fileUploader.single('profile_pic'),(req,res,next)=>{

    let {username,lastname,password,number,email,profile_pic} = req.body;

    if(!req.file||!profile_pic){
       profile_pic = "https://res.cloudinary.com/dhgfid3ej/image/upload/v1558806705/asdsadsa_iysw1l.jpg"
    }else{
        profile_pic= req.file.path
    }
    console.log('que es el req.body: ',req.body)
    if(!username||!lastname||!password||!number||!email){
        res.render('auth/userSignup',{errorMessage:'Los campos de username, lastname, email y password deben ser llenados'})
        return;
    }
    const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
    if(!regex.test(password)){
        res
        .status(500)
        .render('auth/userSingup',{errorMessage:'El password necesita tener al menos ocho caracteres, debe contener al menos una letra mayuscula, minuscula y un numero.'})
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
            res.status(500).render('auth/userSignup',{
                errorMessage:error.message
            });
        }else if(error.code===11000){
            res.status(500).render('auth/userSignup',{
                errorMessage: 'El correo debe ser unico'
            })
        }else{
            next(error)
        }
    })
})

//Show your profile
router.get('/user/userProfile/:id',(req,res,next)=>{
    const {id} = req.params;
    User.findById(id)
    .populate('_pets') //add _commets
    .then(user =>{
        console.log('Llegaste al get de userProfile', req.session.currentUser)
        res.render('user/userProfile',{user})
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
    console.log('fuera del if para login')
    res.render('auth/userLogin')
})

router.post('/login', (req,res,next)=>{
    const {email, password} = req.body;
    if(!email||!password){
        res.render('auth/userLogin',{
            errorMessage:'I need email  y password'
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
            res.render('auth/userLogin')
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

module.exports = router;

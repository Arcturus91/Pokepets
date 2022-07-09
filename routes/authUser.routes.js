const router = require('express').Router();
const User = require('../models/User.model');
const bcryptjs = require('bcryptjs');
const fileUploader = require('../config/cloudinary.config');
const mongoose = require('mongoose');
const {checkRole} = require("../middleware/customMiddleware")
const nodemailer = require("nodemailer")

const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

//const { reset } = require('nodemon');

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

    let profile_pic;

    if(!req.file){
        console.log("error creating account con picture")
/*         console.log("yo soy req.file", req.file)
        console.log("yo soy profile_pic", profile_pic) */
       profile_pic = "https://res.cloudinary.com/dhgfid3ej/image/upload/v1558806705/asdsadsa_iysw1l.jpg"
    }else{
        console.log("creating account con picture")

        profile_pic= req.file.path
        console.log("creating account con picture", profile_pic)

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
            res.render('user/userProfile',{user})
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
    const {number,email,password} = req.body;
    const {id} = req.params
    console.log("EL ID:", id)


    let profile_pic
    if(!req.file){
       profile_pic = "https://res.cloudinary.com/dhgfid3ej/image/upload/v1558806705/asdsadsa_iysw1l.jpg"
    }else{
        profile_pic= req.file.path
        console.log("la pic de cloudinary", profile_pic)
    }
    console.log('que es el req.body: ',req.body)
    if(!number||!email||!password){
        console.log('error de numero y correo')
        res.render('user/editUser',{errorMessage:'The number, email and password fields must be filled'})
        return;
    }
    const salt = bcryptjs.genSaltSync(10)
    const hashedPassword = bcryptjs.hashSync(password,salt)
    User.findByIdAndUpdate(id,{number,email,profile_pic,password:hashedPassword},{new:true})
    .then(userUpdate =>{
        console.log('New user create', userUpdate)
        req.session.currentUser = userUpdate
        console.log('El req.session: ', req.session);
        res.redirect(`/auth/user/userProfile/${id}`) 
    })
    .catch(error =>{
        console.log('Ha salido un error en el post update',error)
        if(error instanceof mongoose.Error.ValidationError){
            //reset
            res.render('auth/userSignup',{
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

//Send email for password
router.get('/sendEmail',(req,res,next)=>{
    res.render('auth/userSendEmail')
})

router.post('/sendEmail',(req,res,next)=>{
    let { email } = req.body;
    User.findOne({email})
    .then(userFromDB=>{
        if(!userFromDB){
            res.render('auth/userSendEmail',{
                errorMessage:'Try again'
                
            })
            return
        }else{
            let randomString = Math.random().toString(36).slice(-8);
            randomString = randomString.charAt(0).toUpperCase() + randomString.slice(1)
            let transporter = nodemailer.createTransport({
                host:'smtp.gmail.com',
                port: process.env.PORT_MAIL,
                secure:false,
                auth:{
                    user: `${process.env.USER_MAIL}`,
                    pass: `${process.env.PASS_MAIL}`
                }
            });
            transporter.sendMail({
                from:'"🐱 Pokepets 🐶" <pokepetsweb@gmail.com>',
                to: email,
                subject: 'New pass for web Pokepets',
                html: `<h3>Your new password is:</h3>
                       <br>
                       <b>${randomString}</b>
                       <br>
                       <p>
                       Please after receiving the password change it for your security<p>`
            })
            const salt = bcryptjs.genSaltSync(10)
            const hashedPassword = bcryptjs.hashSync(randomString,salt)
            User.findOneAndUpdate({email},{password:hashedPassword},{new:true})
            .then(userUpdate =>{
                console.log('User update password', userUpdate)
            })
            res.render('checkMail.hbs')
        }
    })
    .catch(error =>{
        console.log('Ha salido un error en el post sendMail', error)
    })
})

module.exports = router;

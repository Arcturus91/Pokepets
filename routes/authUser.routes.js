const router = require('express').Router();
const User = require('../models/User.model');
const bcryptjs = require('bcryptjs');


router.get('/signup',(req,res,next)=>{
    console.log('Llegaste a la ruta de logueo')
    console.log('El req.session', req.session);
    if (req.session.currentUser) {
        console.log("req.session.currentUser: ", req.session.currentUser)
        return res.redirect(`user/userProfile/${req.session.currentUser._id}`)
      }
    //console.log("req.session.currentUser: ", req.session.currentUser)

    res.render('auth/userSignup')
});

router.post('/signup',(req,res,next)=>{
    let {username,lastname,password,number,email,profile_pic} = req.body;
    if(!profile_pic){
       profile_pic = "https://res.cloudinary.com/dhgfid3ej/image/upload/v1558806705/asdsadsa_iysw1l.jpg"
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
            res.status(500).render('auth/userSingup',{
                errorMessage:error.message
            });
        }else if(error.code===11000){
            res.status(500).render('auth/userSingup',{
                errorMessage: 'El correo debe ser unico'
            })
        }else{
            next(error)
        }
    })
})

router.get('/user/userProfile/:id',(req,res,next)=>{
    const {id} = req.params;
    console.log('Llegaste al get de userProfile')
    User.findById(id)
    .populate('_pets','_comments')
    .then(user =>{
        console.log('USER: ',user);
        console.log('{USER}: ',{user});
        res.render('user/userProfile',{user})
    })
    .catch(error =>{
        console.log('Ha salido un error en el get ID',error)
        next(error)
    })
})

router.get('/login',(req,res,next)=>{
    res.render('auth/userLogin')
})

router.post('/login', (req,res,next)=>{
    const {username, password} = req.body;
    if(!username||!password){
        res.render('auth/userLogin',{
            errorMessage:'ingresa username y password'
        });
        return;
    }
    User.findOne({username})
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


router.post('/logout', (req, res, next) => {
    req.session.destroy(err => {
        console.log('Destruyendo la sesion');
      if (err) next(err);
      res.redirect('/listPets');
    });
    console.log('Sesion destruida');
  });



module.exports = router;


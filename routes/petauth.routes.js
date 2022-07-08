const router = require("express").Router();
const User = require("../models/User.model");
const mongoose = require("mongoose");
const fileUploader = require('../config/cloudinary.config');
const {checkRole} = require("../middleware/customMiddleware")
// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

// Require the Pet model in order to interact with the database
const Pet = require("../models/Pet.model");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

//CREATE PET
  //Create pet GET route

router.get("/createNewPet", isLoggedOut, (req, res) => {
  res.render("createNewPet");
});
  //Create pet POST route
router.post("/createNewPet", fileUploader.single('profile_pic'), isLoggedOut, (req, res) => {

  let profile_pic;
  if(req.file){
      profile_pic = req.file.path
  }

  console.log("req.file",req.file)

  const { petName, petType, size, weight, sex, address,longitude, latitude } =
    req.body;

    console.log("la info que subno al crear un pet", req.body)

  if (!petName) {
    return res.status(400).render("createNewPet", {
      errorMessage: "Please provide your pet name.",
    });
  }

  if (!petType) {
    return res.status(400).render("createNewPet", {
      errorMessage: "Please define wether your pet is a god or a cat",
    });
  }

  if (!profile_pic) {
    return res.status(400).render("createNewPet", {
      errorMessage: "Please upload your pet pic",
    });
  }

  if (!size) {
    //
    return res.status(400).render("createNewPet", {
      errorMessage: "Please indicate your pet size",
    });
  }

  if (!weight) {
    return res.status(400).render("createNewPet", {
      errorMessage: "Please indicate your pet weight",
    });
  }

  if (!sex) {
    return res.status(400).render("createNewPet", {
      errorMessage: "Please indicate your pet sex",
    });
  }

  if (!address) {
    return res.status(400).render("createNewPet", {
      errorMessage: "Please indicate where to find the pet",
    });
  }

  // Search the database for a user with the petName submitted in the form
  Pet.findOne({ petName }).then((found) => {
    // If the user is found, send the message petName is taken
    if (found) {
      return res
        .status(400)
        .render("createNewPet", { errorMessage: "petName already taken." });
    }
  });

  Pet.create({
    petName,
    petType,
    profile_pic,
    size,
    weight,
    sex,
    address,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
  })
    .then((newpet) => {

      if (req.session.currentUser){
        User.findByIdAndUpdate(req.session.currentUser._id, { $push: { _registered_pets: newpet._id } })
        .then((user) => {
Pet.findByIdAndUpdate(newpet._id,{ _register: user._id })
.then(pet=>{
  console.log("the updated user and pet ", user, pet);
res.redirect("/");
    })
  })} else {
    res.redirect("/");
    console.log("new pet creado sin rescuer", newpet)
  }})
    .catch((error) => {
      console.log("error creando pet", error);
    });
});

router.get("/listPets", (req, res) => {
  Pet.find()
  .populate('_register')
    .then((pets) => {
      console.log("los perros ", pets);
      res.render("listPets", { pets });
    })
    .catch((error) => {
      console.log("error", error);
      next(); //esto me enviará a la página de errores.
    });
});

router.get('/listPets/api', (req, res, next) => {
	Pet.find({}, (error, allPetsFromDB) => {
		if (error) { 
			next(error); 
		} else { 
			res.status(200).json({ pets: allPetsFromDB });
		}
	});
});

//Perfil único del pet

router.get("/profile/:id", (req, res, next) => {
  if (!req.session.currentUser) {
    return res.render("auth/userSignup"); // quiza sería ideal tener signup / login en uno solo
  }

  const { id } = req.params;

  Pet.findById(id)
  .populate('_register')
    .then((pet) => {
      console.log("detalle del pet", pet)
      res.render("auth/profilePet", pet);
    })
    .catch((err) => {
      console.log(err);
      next();
    });
});


// to see raw data in your browser, just go on: http://localhost:3000/profile/api/62c718f0d0e9b4eb8b270a35
router.get('/profile/api/:id', (req, res, next) => {
	let petId = req.params.id;
	Pet.findOne({_id: petId}, (error, onePetFromDB) => {
		if (error) { 
			next(error) 
		} else { 
			res.status(200).json({ pet: onePetFromDB}); 

		}
	});
});





//Adopt

router.get("/adoptSuccess/:id", (req, res, next) => {
  if (!req.session.currentUser) {
    return res.render("auth/userSignup"); // quiza sería ideal tener signup / login en uno solo
  }
  const { id } = req.params;

  console.log("llegué al update")

  User.findByIdAndUpdate(req.session.currentUser._id, { $push: { _pets: id } })
    .then((user) => {

Pet.findByIdAndUpdate(id,{ _adopter: user._id })
.then(pet=>{console.log("the updated user and pet ", user, pet);
res.render("auth/adoptSuccess",  user);})
      
    })
    .catch((error) => {
      console.log("error updating user", error);
    });
});


// DELETE PET

router.get("/deletePet/:id", checkRole(["ADMIN"]), (req, res, next) => {

  console.log("yo soy el user antes de borrar", req.session.currentUser)
  if (!req.session.currentUser) {
    return res.render("auth/userSignup"); // quiza sería ideal tener signup / login en uno solo
  }
  const { id } = req.params;


  Pet.findByIdAndDelete(id)
  .then(deleted =>{
    console.log("pet deleted")
    res.redirect("/")
  })
  .catch(err => {
    console.log("pet delete error",err)
  })

})









//pendinete de modificar
router.get("/login", isLoggedOut, (req, res) => {
  res.render("auth/login");
});

router.post("/login", isLoggedOut, (req, res, next) => {
  const { petName } = req.body;

  if (!petName) {
    return res.status(400).render("auth/login", {
      errorMessage: "Please provide your petName.",
    });
  }

  // Search the database for a user with the petName submitted in the form
  Pet.findOne({ petName })
    .then((pet) => {
      // If the user isn't found, send the message that user provided wrong credentials
      if (!pet) {
        return res.status(400).render("auth/login", {
          errorMessage: "Wrong credentials.",
        });
      }

      req.session.pet = pet;
      // req.session.user = user._id; // ! better and safer but in this case we saving the entire user object
      return res.redirect("/");
    })

    .catch((err) => {
      // in this case we are sending the error handling to the error handling middleware that is defined in the error handling file
      // you can just as easily run the res.status that is commented out below
      next(err);
      // return res.status(500).render("login", { errorMessage: err.message });
    });
});

router.get("/logout", isLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res
        .status(500)
        .render("auth/logout", { errorMessage: err.message });
    }
    res.redirect("/");
  });
});

module.exports = router;

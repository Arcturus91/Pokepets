const router = require("express").Router();

const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

// Require the Pet model in order to interact with the database
const Pet = require("../models/Pet.model");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/createNewPet", isLoggedOut, (req, res) => {
  res.render("createNewPet");
});

router.post("/createNewPet", isLoggedOut, (req, res) => {
  const { petName,petType,profile_pic,size,weight,sex,address } = req.body;

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

  if (!size) { //
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
    
  })

  Pet.create({
    petName,petType,profile_pic,size,weight,sex,address
  })
  .then(newpet =>{
    res.redirect("/");
    console.log("pet creado con éxito",newpet)
  })
  .catch((error) => {
    console.log("error creando pet", error)
  })



});



router.get("/listPets", (req, res) => {
 
Pet.find()
.then(pets => {
  console.log("los perros ", pets)
  res.render("listPets", { pets });
})
.catch((error) => {
  console.log("error", error);
  next(); //esto me enviará a la página de errores.
});
})

router.get("/profile/:id", (req, res, next) => {

  if (!req.session.currentUser) {
      return res.render("auth/userSignup"); // quiza sería ideal tener signup / login en uno solo 
    }
  
    console.log("estoy logeado ", req.session.currentUser);
  
    const { id } = req.params;
  
    Pet.findById(id)
      .then((pet) => {
        res.render("auth/profilePet", pet);
      })
      .catch((err) => {
        console.log(err);
        next();
      });
  });


























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

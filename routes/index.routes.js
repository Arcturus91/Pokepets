const router = require("express").Router();
/* GET home page */
router.get("/", (req, res, next) => {

  



  res.render("index");
});

/* se podri3a colocar una parte que diga: estás logeado como xxxxx user.  */



module.exports = router;

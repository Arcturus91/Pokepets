const cloudinary = require('cloudinary').v2 //le decimos que vamos a usar la version 2.
const { CloudinaryStorage} = require('multer-storage-cloudinary');
const multer = require('multer')

//config
cloudinary.config({
   cloud_name:process.env.CLOUDINARY_NAME,
   api_key: process.env.CLOUDINARY_KEY,
   api_secret:process.env.CLOUDINARY_SECRET,
});

//config storage
const storage =new CloudinaryStorage({

    //cloudinary config
    cloudinary,
    params:{
        folder:"pokepets",
        allowed_formats:['jpeg', 'png', 'gif','svg',"jpeg"]
    }
});

module.exports = multer({storage})

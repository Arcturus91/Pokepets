const { Schema, model, SchemaType, SchemaTypes } = require("mongoose");

const validateEmail = function(email) {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email)
  }; 
// TODO: Please make sure you edit the user model to whatever makes sense in this case
const userSchema = new Schema(
  {
  username: {
    type: String,
    trim: true,
    required: true
    },
  lastname: {
    type: String,
    trim: true,
    required: true
    },
  password: {
    type: String,
    required: true  
    },
  //_comments: [{type:Schema.Types.ObjectId, ref:'Comment'}],
  _pets: [{type:Schema.Types.ObjectId, ref:'Pet'}],
  number:{
    type: Number,
    unique: true,
    trim: true
    },
  email: {
    type: String,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un correo valido'],
    trim: true,
    lowercase: true,
    unique: true,
    required: true,
    validate: [validateEmail, 'Please fill a valid email address'],
    },
  profile_pic: {
    type: String,
    default: "https://res.cloudinary.com/dhgfid3ej/image/upload/v1558806705/asdsadsa_iysw1l.jpg"
  },
  role:{
    type:String,
    enum:["ADMIN","USER"],
    default:"USER"
   }
  },
  {timestamps:true}
  );

const User = model("User", userSchema);

module.exports = User;
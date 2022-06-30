const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the user model to whatever makes sense in this case
const petSchema = new Schema(
  {
    petName: {
      type: String,
     unique: true,
     required: true
    },
    petType:{
      type: String,
      required: true,
      enum:["Gato","Perro"],
    },
    profile_pic: {
      type: String,
      required: true,
      default:
        "https://res.cloudinary.com/dhgfid3ej/image/upload/v1558806705/asdsadsa_iysw1l.jpg",
    },
    size:{
      type: String,
      required: true,
    },
    weight:{
      type: String,
      required: true,
    },
    sex:{
      type: String,
      required: true,
      enum:["Macho","Hembra"],
    },
    address:{
      type: String,
      required: true,
    },
    _rescuer: { 
      type:Schema.Types.ObjectId,
      ref:"User"
  },
  _adopter: { 
    type:Schema.Types.ObjectId,
    ref:"User"
},
  _comments:{
  type:Schema.Types.ObjectId,
  ref:"Comment"
}

  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Pet = model("Pet", petSchema);

module.exports = Pet;

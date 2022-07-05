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
      enum:["Cat","Dog"],
    },
    profile_pic: {
      type: String,
      required: true,
      
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
      enum:["Male","Female"],
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

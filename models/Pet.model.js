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
      enum:["Mini","Small","Medium","Large","Extra large"],
    },
    weight:{
      type: Number
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
    _register: { 
      type:Schema.Types.ObjectId,
      ref:"User"
  },
  _adopter: { 
    type:Schema.Types.ObjectId,
    ref:"User"
},
location: { type: { type: String }, coordinates: [Number] }

  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

petSchema.index({ location: '2dsphere' });

const Pet = model("Pet", petSchema);

module.exports = Pet;

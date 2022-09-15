const { Schema, model } = require("mongoose");
//handles user password hasing using bcryp library,similar to sequelize but mongoose way is slightly different
const bcrypt = require("bcrypt");

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    //validation thats already in place specifically for the validation of the email field.
    email: {
      type: String,
      required: true,
      unique: true,
      //match is a type of validation that allows us to use regex to test the input value.
      //we are using a regex pattter to see is the data being entered is actually valid email address.
      //if it doesnt we send back a custom error message stating that there must be a valid email address.
      match: [/.+@.+\..+/, "Must match an email address!"],
    },
    password: {
      type: String,
      required: true,
      minlength: 5,
    },
    thoughts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Thought",
      },
    ],
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

// set up pre-save middleware to create password
//mongoose implements middleware to capture out data before getting to or coming from the database and manipulating it.
//we are checking to see if data is new or if the password has been modified.
//we can use this same middleware for both new users who are updating their information but dont want to update their password values.
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("password")) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }

  next();
});

// compare the incoming password with the hashed password
userSchema.methods.isCorrectPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.virtual("friendCount").get(function () {
  return this.friends.length;
});

const User = model("User", userSchema);

module.exports = User;

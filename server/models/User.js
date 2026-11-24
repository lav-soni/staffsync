// User model
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const userSchema = mongoose.Schema(
    {
        name: {type: String, required: true },
        email: {type: String, required: true, unique: true },
        password: {type: String, required: true, minilength: 6, select:false },
        role: { type: String, enum: ["employee", "manager", "hr"], default: "employee" },
    },
    {
        timestamps: true,
    }
);

// hash pwd before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//compare password with hashed password
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
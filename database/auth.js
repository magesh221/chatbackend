const mongoose = require('mongoose')
var Schema = mongoose.Schema
var authSchema = new Schema(
    {
        name: { type: String  ,require:true},
        email: { type: String ,require:true},
        password: { type: String, require:true },
        phone: { type: Number , require:true},  
        filePath:{type: String},
        imageupload:{type:Boolean , default:false},
    }, { timestamps: true }
)

module.exports = mongoose.model("auth", authSchema)
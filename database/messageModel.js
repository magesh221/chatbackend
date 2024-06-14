const mongoose = require('mongoose')
var Schema = mongoose.Schema
const MessageSchema = new Schema(
  {
    message: { type: String, required: true },
    receiver: { type: String },
    sender: { type: String }
  }, { timestamps: true }
)

module.exports = mongoose.model("Messages", MessageSchema)
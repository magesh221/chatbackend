const dbMsg = require('../database/messageModel')

// exports.addMessage = async (req, res) => {
//   const userID = req.userId._id
//   console.log('userID: ', userID);
//   const info = req.body
//   try {
//     const data = {
//       sender: userID,
//       receiver: info.receiver,
//       message: info.message
//     }
//     dbMsg.create(data)
//       .then((ResData) => {
//         console.log('ResData: ', ResData);
//         // res.status(201).json({ message: "message updated" })
//         return ResData
//       })
//       .catch((err) => {
//         console.log('err: ', err);
//         return res.status(409).json({ message: "User already exists" });
//       })

//   } catch (error) {
//     console.log('error: ', error);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// }






exports.addMessage = async (userId,receiver,message) => {
  console.log('message: ', message);
  console.log('receiver: ', receiver);
  const userID = userId
  console.log('userID: ', userID);
if (receiver === undefined){
  return null
}
  try {
    const data = {
      sender: userID,
      receiver: receiver,
      message: message
    }
    dbMsg.create(data)
      .then((ResData) => {

        return ResData
      })
      .catch((err) => {
        console.log('err: ', err);
        return res.status(409).json({ message: "User already exists" });
      })

  } catch (error) {
    console.log('error: ', error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

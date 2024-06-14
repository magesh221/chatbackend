const dbAuth = require('../database/auth')
const bcrypt = require('bcrypt')
const helper = require('../middleware/helper')
const fs = require('fs');
const path = require('path');


exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Required data is missing" });
    }
    const existingUser = await dbAuth.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await dbAuth.create({ name, email, password: hashedPassword, phone });
    return res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await dbAuth.findOne({ email: req.body.email });
    if (!user) {
      return res.status(401).json({ status: false, msg: "User not found" });
    }
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ status: false, msg: "Incorrect password" });
    }
    const data = {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone
    }
    const token = helper.Authentication(data)
    res.status(200).json({ status: true, msg: "Login successful", token: token });
  } catch (error) {
    res.status(500).json({ status: false, msg: "Internal server error" });
  }
};

exports.usersList = async (req, res) => {
  try {
    dbAuth.find()
      .then((result) => {
        res.json({ status: true, msg: result })
      })
      .catch((err) => {
        res.status(401).json({ status: false, msg: err })
      })
  } catch (error) {
    res.status(401).json({ status: false, msg: error })
  }
}

exports.profile_pic = async (req, res) => {
  
  const userID = req.userId._id
  try {
    dbAuth.findById(userID)
    .then((response)=>{
      const filePath = response.filePath 
       if (filePath == undefined){
      return res.status(200).json({ status : true , filePath:'undefined'  });
       }
      else{
        const data = {
          name : response.name,
          email : response.email,
          phone : response.phone,
          filePath : response.filePath
        }
        res.status(200).json({ status: true, response: data })
      }
    })
    .catch((error)=>{
      return res.status(400).json({ status:false ,  error: 'No Files are upload' });

    })
  } catch (error) {
    return res.status(400).json({status:false ,  error: 'No file uploaded' });
  }
}

// exports.imageUpload = async (req, res) => {
//   const { file } = req;
//   const userID = req.userId._id
//   if (!file) {
//     return res.status(400).json({ error: 'file upload error' });
//   }
//   try {

//     const folder = '../uploads'

//     const uploadDir = path.join(__dirname, folder);
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir);
//     }

//     const filePath = path.join(uploadDir, `${Date.now()}-${file.originalname}`);

//     // Save file to disk
//     fs.writeFile(filePath, file.buffer, (err) => {
//       if (err) {
//         console.error('Error saving file: ', err);
//         return res.status(500).json({ error: 'An error occurred during file upload' });
//       }
// console.log('---------------------ddddddddddddddd------------------------');
//       dbAuth.findByIdAndUpdate(userID, {
//         $set: {
//           filePath: filePath,
//           imageupload: true
//         }
//       })
//         .then((result) => {
//           console.log('result: ', result);
//           res.status(200).json({ message: 'upload', filePath });
//         }).catch((err) => {
//           console.log('err: ', err);
//           res.status(400).json({ status: false, error: err })
//         })

//     });
//   } catch (error) {
//     console.log('error: ', error);
//     res.status(500).json({ error: 'An error occurred during file upload' });
//   }
// };


exports.imageUpload = async (req, res) => {
  const { file } = req;
   const { filePath } = req.body;
  const userID = req.userId._id; // Ensure this is correct based on how userId is set in req
  if (!file) {
    return res.status(400).json({ error: 'file upload error' });
  }

  try {
    const folder = '../uploads';
    const uploadDir = path.join(__dirname, folder);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const fileLocation = path.join(uploadDir, `${Date.now()}-${file.originalname}`);

    // Save file to disk
    await fs.promises.writeFile(fileLocation, file.buffer);

    const result = await dbAuth.findByIdAndUpdate(
      userID,
      {
        $set: {
          filePath: filePath,
          imageupload: true
        }
      },
      { new: true }
    );

    res.status(200).json({ message: 'upload', filePath });

  } catch (error) {
    res.status(500).json({ error: 'An error occurred during file upload' });
  }
};

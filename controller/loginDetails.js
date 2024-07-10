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
      .then((response) => {
        const filePath = response.filePath
        if (filePath == undefined) {
          return res.status(200).json({ status: true, filePath: 'undefined' });
        }
        else {
          const data = {
            name: response.name,
            email: response.email,
            phone: response.phone,
            filePath: response.filePath
          }
          res.status(200).json({ status: true, response: data })
        }
      })
      .catch((error) => {
        return res.status(400).json({ status: false, error: 'No Files are upload' });

      })
  } catch (error) {
    return res.status(400).json({ status: false, error: 'No file uploaded' });
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


const AWS = require('aws-sdk')
var albumBucketName = "cmapk";
var bucketRegion = "ap-south-1";
var IdentityPoolId = "ap-south-1:45052911-803f-48e8-92b3-c77f63af93ab";

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId,
  }),
});

var s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: albumBucketName },
});

exports.uploads = async (req, res) => {
  const timestamp = new Date().getTime();
  const date = new Date(timestamp);
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  const istDate = new Date(date.getTime() + istOffset);
  const day = istDate.getUTCDate();
  const month = istDate.getUTCMonth() + 1; // Months are zero-based
  const year = istDate.getUTCFullYear();
  const hours = istDate.getUTCHours();
  const minutes = istDate.getUTCMinutes();
  const seconds = istDate.getUTCSeconds();
const dateformate = `${day}-${month}-${year}__${hours}-${minutes}-${seconds}`
console.log('dateformate: ', dateformate);
  const companyName = "maddy"
  const { file } = req;
  const fileName = `${req.body.documentFeild}_${file.originalname}`;
  const fileContent = file.buffer;
  const folderName = `${companyName}${dateformate}`
  
  const params = {
    Bucket: albumBucketName,
    Key: `Documents/${folderName}/${fileName}`,
    Body: fileContent,
    ACL: 'public-read',
    ContentType: file.mimetype,
    ContentDisposition: "inline"
  };

  try {
    const data = await s3.upload(params).promise();
    console.log('Upload Success', data);
    res.status(200).send({
      message: 'File uploaded successfully',
      data: data,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send({
      message: 'Error uploading file',
      error: error.message,
    });
  }
};

exports.multipleUploads = async (req, res) => {
  const files = req.files;  // Access the array of files
  if (!files || files.length === 0) {
    return res.status(400).send({
      message: 'No files uploaded',
    });
  }

  // Create an array of promises to handle multiple file uploads
  const uploadPromises = files.map(file => {
    const fileName = file.originalname;
    const fileContent = file.buffer;
    // Key: `${folderName}/${fileName}`
    const params = {
      Bucket: albumBucketName,
      Key: fileName,
      Body: fileContent,
      ACL: 'public-read',
      ContentDisposition: "inline"
    };

    return s3.upload(params).promise();
  });

  try {
    const data = await Promise.all(uploadPromises);
    const fileLocations = data.map(result => result);

    console.log('Upload Success', fileLocations);
    res.status(200).send({
      message: 'Files uploaded successfully',
      data: fileLocations,
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).send({
      message: 'Error uploading files',
      error: error.message,
    });
  }
}

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

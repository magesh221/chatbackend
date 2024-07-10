const express = require('express');
const router = express.Router();
const loginController = require('../controller/loginDetails');
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Change from 'upload.single' to 'upload.array' to handle multiple files
router.post("/upload", upload.array('files', 10), loginController.uploads);

module.exports = router;






const AWS = require('aws-sdk');
var albumBucketName = "****";
var bucketRegion = "******************";
var IdentityPoolId = "************************";

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
    const folderName = "companyName"

    const params = {
      Bucket: albumBucketName,
      Key: `${folderName}/${fileName}`,
      Body: fileContent,
      ACL: 'public-read',
      ContentDisposition: "inline"
    };

    return s3.upload(params).promise();
  });

  try {
    const data = await Promise.all(uploadPromises);
    const fileLocations = data.map(result => result);
    console.log('data: ', data);
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
};

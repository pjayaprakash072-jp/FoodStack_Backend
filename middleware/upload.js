const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
// create a storage object with Cloudinary configuration

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "foodstack", // specify the folder in Cloudinary where files will be stored
        allowed_formats: ["jpg", "jpeg", "png"], // specify allowed file formats
    },
});

const upload = multer({ storage: storage });

module.exports = upload;


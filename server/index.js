const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());

const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    const filePath = path.join(__dirname, "uploads", file.originalname);

    if (fs.existsSync(filePath)) { //checking if file already exists
      req.fileExists = true;
    } else {
      req.fileExists = false;
    }

    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("model"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = `http://localhost:3100/models/${req.file.filename}`;

  if (req.fileExists) {
    return res.status(200).json({
      message: "File already exists",
      filename: req.file.filename,
      filePath: filePath,
    });
  }

  return res.status(201).json({
    message: "File uploaded successfully",
    filename: req.file.filename,
    filePath: filePath,
  });
});

app.use("/models", express.static(path.join(__dirname, "uploads")));

app.listen(3100, () => console.log("Server running on port 3100"));

const express = require("express");
const OAuth2GoogleFileUploaderRoute = express.Router();
const FileUploadeController = require("../Controller/FileUplodeController");

OAuth2GoogleFileUploaderRoute.get("/", FileUploadeController.getHomePage);
OAuth2GoogleFileUploaderRoute.get("/google/callback", FileUploadeController.ExecuteCallback);
OAuth2GoogleFileUploaderRoute.post("/upload", FileUploadeController.UploadFile);
OAuth2GoogleFileUploaderRoute.get("/logout", FileUploadeController.Logout);

module.exports = OAuth2GoogleFileUploaderRoute;
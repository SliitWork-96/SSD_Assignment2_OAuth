/*
  extract the google from Googleapi library which allow communication 
  with Google Services and their integration to other services.
*/
const { google } = require("googleapis");
const OAuth2Info = require("../ClientApp_Info.json");
const multer = require('multer');
const fs = require("fs");

//extreact the client_id, client_scret and redirect_url from the ClientApp_Info.json
const OAuth_CLIENT_ID = OAuth2Info.web.client_id;
const OAuth_CLIENT_SECRET = OAuth2Info.web.client_secret;
const OAuth_REDIRECT_URL = OAuth2Info.web.redirect_uris[0];


//create client object
const GoogleOAuth2Client = new google.auth.OAuth2(
    OAuth_CLIENT_ID,
    OAuth_CLIENT_SECRET,
    OAuth_REDIRECT_URL
  );

//initially we assume user is not authenticated
let authenticated = false;

//define the scope what we need to access from the google API
const Google_SCOPES ="https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile";

const texts = require("../constants/texts"); //take constant to prompt messages
const serverMessages = texts.server;
let profilePicture, Username;


//Access the home page and sign in or register using gmail
exports.getHomePage = (req, res) => {

    if (!authenticated) {
        // Generate an OAuth URL and redirect there
        let AccessUrl = GoogleOAuth2Client.generateAuthUrl({
          access_type: "offline",
          scope: Google_SCOPES,
        });
        console.log("\n" + AccessUrl + "\n");
        res.render("index", { url: AccessUrl });
      } else {  
          
        let googleOauth2 = google.oauth2({
            auth: GoogleOAuth2Client,
            version: "v2",
        });

        //getting the user profile information
        googleOauth2.userinfo.get(function (error, response) {
            if (error) {
              console.log(error);
            } else {

                console.log(response.data);
                Username = response.data.name
                profilePicture = response.data.picture
                res.render("profile", {
                  username: Username,
                  picture: profilePicture,
                  success:false
                });
             
            }
          });

    }

}

//get the Authorization code using callback url and get the access token
exports.ExecuteCallback = (req, res) => {

    //get the authorization code from the query param
    const Authorization_code = req.query.code;

    console.log("Authorization Code : " + Authorization_code + "\n");

    if (Authorization_code) {

          // Get an access token based on our Authorization code
          GoogleOAuth2Client.getToken(Authorization_code,  (error, accesstokens) => {

          if (error) {

            console.log(serverMessages.OAUTHERROR);
            console.log(error);
          } else {

            console.log(serverMessages.OAUTHSUCCESS +"\n");
            console.log(accesstokens)
            console.log("\n")
            GoogleOAuth2Client.setCredentials(accesstokens); // set the credentials by passing token
    
            authenticated = true;
            res.redirect("/");
          }
        });
      }
}


// Upload file
let Storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, "./uploads");
    },
    filename: function (req, file, callback) {
      callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    },
  });

  let upload = multer({
    storage: Storage,
  }).single("file"); //Field name 


// upload file into google drive 
exports.UploadFile = (req, res, next) => {

    upload(req, res, err => {

        if (err) {
          console.log(err);
          return res.end("Something went wrong");
        } else {

          console.log(req.file.path);

          //call the Google drive API
          const GoogleDrive = google.drive({ 
              version: "v3",
              auth:GoogleOAuth2Client 
          });

          const FileUploadData = {
            name: req.file.filename,
          };

          const FileUploadmedia = {
            mimeType: req.file.mimetype,
            body: fs.createReadStream(req.file.path),
          };

          //upload file into google drive
          GoogleDrive.files.create(
          {
              resource: FileUploadData,
              media: FileUploadmedia,
              fields: "id",
          },

            (err, file) => {
              if (err) {
                // Handle the error when uploading
                console.error(err);
              } else {

                // Delete the file from uploads folder
                fs.unlinkSync(req.file.path)
                res.render("profile",{
                    username:Username,
                    picture:profilePicture,
                    success:true})
              }
    
            }
          );
        }
      });
    
}


//logout function
exports.Logout = (req, res) => {
    
    authenticated = false
    res.redirect('/')
}

const express = require("express");
const texts = require("./constants/texts"); //take constant to prompt messages
const serverMessages = texts.server;


//create express server
const app = express();
const port = process.env.PORT || 5000;


//setting the template engine
app.set("view engine", "ejs");


app.use(express.static(__dirname + '/public'));


//set the route endpoint
const GoogleAuthFileUploderRoute = require("./Routes/FileUploderRoutes");
app.use("/", GoogleAuthFileUploderRoute);


// server listening port
app.listen(port, () => {
    console.log(serverMessages.SERVER + port);
  });
  
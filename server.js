const express = require("express");
const data = require("./wins.js");
const fs = require("fs");

// Sets up the Express App
// =============================================================
let app = express();
let PORT = process.env.PORT || 8080;

// Requiring our models for syncing

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static directory

app.use(express.static("public"));

// Static directory
let exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
const team = "Ohio State";

fs.readFile("./winsData.json", (err, data) => {
  data = JSON.parse(data);
  let nowData = [{x:[],y:[]}, {x:[],y:[]}];
  for (let year = 2003; year < 2019; year++) {
      
      let wins = Number(/([^-]*?)-/.exec(data[year][team].wins)[1])*8;
      let rank = data[year][team].rank;
    // nowData.push({
    //   x: year,
    //   y: wins
    // });
    nowData[0].x.push(year);
    nowData[0].y.push(wins);
    nowData[1].x.push(year);
    nowData[1].y.push(rank);


  }
  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });

  app.get("/recruit", (req, res) => {
    res.render("index");
  });
  app.post("/recruit", (req,res)=>{
      res.send(nowData);
  })
});

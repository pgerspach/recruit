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
let team = "Ohio State";

fs.readFile("./winsData.json", (err, data) => {
  data = JSON.parse(data);

  app.listen(PORT, function() {
    console.log("App listening on PORT " + PORT);
  });

  app.get("/", (req, res) => {
    const teams = {};
    for(let year = 2003;year<2019;year++){
      for(let team of Object.keys(data[year])){
        if(!(team in teams)){
          teams[team]="";
        }
      }
    }
    let teamsArray = Object.keys(teams);
    teamsArray = teamsArray.map(x=>{
      return{team:x}
    });
    res.render("index",{teamsArray});
  });
  app.post("/recruit/team", (req, res) => {
    let team = req.body.team;
    console.log(team);
    let nowData = [{ x: [], y: [] }, { x: [], y: [] }];
    for (let year = 2003; year < 2019; year++) {
      if (data[year][team]) {
        let wins = Number(/([^-]*?)-/.exec(data[year][team].wins)[1]);
        let rank = Number(data[year][team].rank);

        nowData[0].x.push(year);
        nowData[0].y.push(wins);
        nowData[1].x.push(year);
        nowData[1].y.push(rank);
      }
    }
    console.log(nowData);
    res.send(nowData);
  });
});

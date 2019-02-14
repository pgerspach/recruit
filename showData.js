const fs = require("fs");

fs.readFile("./recruitData.json", (err,data)=>{
    const recruitData = JSON.parse(data);
    const year = 2018;
        console.log(recruitData[year]["Clemson"]);
})


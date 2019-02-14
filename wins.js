const request = require("request");
const fs = require("fs");
const nameAndWins = /<td\sclass=["'`]nowrap["'`][^<>]*?><a[^<>]+?>([^<>0-9]+?)<\/a>[^<>]*?<\/td>[^<>]*?<td\sclass=["'`]text-right["'`][^<>]*?>([-\d]+?)<\//g;
const abvs = require("./stAbvs.js");
const years = [2003, 2018];

fs.readFile("./recruitData.json", (err, data) => {
  const recruitData = JSON.parse(data);
  const winsData = [];
  //   console.log(recruitData);
  getWinsData(years[0]);

  function getWinsData(year) {
    request(
      "https://www.teamrankings.com/ncf/trends/win_trends/?range=yearly_" +
        year,
      function(error, response, body) {
        let resp;
        while ((rep = nameAndWins.exec(body)) !== null) {
          winsData.push({ name: rep[1], wins: rep[2] });
        }
        for (let team of winsData) {
          if (team.name in recruitData[year]) {
            recruitData[year][team.name].wins = team.wins;
          } else if (team.name in abvs) {
            if (abvs[team.name] in recruitData[year]) {
              recruitData[year][abvs[team.name]].wins = team.wins;
            }
          } else {
            let nameSplit = team.name.split(" ");
            let newName = [];
            for (let word of nameSplit) {
              if (word in abvs) {
                if (typeof abvs[word] == "object") {
                  let limit = newName.length;
                  if (limit === 0) {
                    for (let abv of abvs[word]) {
                      newName.push(abv);
                    }
                  } else {
                    for (let varient of newName.slice(0, limit)) {
                      newName.push((varient + " " + abv).trim());
                    }
                  }
                } else {
                  if (newName.length === 0) {
                    newName.push(abvs[word].trim());
                  } else {
                    for (let vers in newName) {
                      newName[vers] = (newName[vers] + " " + abvs[word]).trim();
                    }
                  }
                }
              } else {
                if (newName.length === 0) {
                  newName.push(word.trim());
                } else {
                  for (let vers in newName) {
                    newName[vers] = (newName[vers] + " " + word).trim();
                  }
                }
              }
            }
            if (newName.length !== 0) {
              for (let name of newName) {
                if (name in recruitData[year]) {
                  recruitData[year][name].wins = team.wins;
                }
              }
            }
          }
        }
        if (year < years[1]) {
          getWinsData(year + 1);
        } else {
          writeResults();
          return;
        }
      }
    );
  }

  function writeResults() {
    fs.writeFile("winsData.json", JSON.stringify(recruitData), err => {
      if (err) throw err;
    });
  }
});

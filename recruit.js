const phantom = require("phantom");
const fs = require("fs");
let startYear = 2002;
let endYear = 2019;

let content;
const dataObj = {};

runScript();

async function runScript(resolve) {
  for (let year = startYear; year < endYear; year++) {
    console.log("getting year "+year+"...");
    await visitRivals(year);
  }
  fs.writeFile("./recruitData.json", JSON.stringify(dataObj), (err)=>{
    if(err) throw err;
  });
}

async function visitRivals(year) {
  let instance = await phantom.create();
  let page = await instance.createPage();
  await page.on("onResourceRequested", function(requestData) {});

  let status = await page.open(
    `https://n.rivals.com/team_rankings/${year}/all-teams/football`
  );
  content = await page.property("content");
  getContent(year, content);
  await instance.exit();
}

function getContent(year, content) {
  let elOpen = /<([^<>]*?)\s[^<>]*?>/g;
  let elClose = /<\/([^<>]*?)>/g;
  let tbodyPos = [];
  let testFor = elOpen;

  while (true) {
    let match = testFor.exec(content);

    if (match[1] === "tbody") {
      tbodyPos.push(testFor.lastIndex);
      if (tbodyPos.length < 2) {
        testFor = elClose;
      }
      break;
    } else {
      continue;
    }
  }
  content = content.slice(tbodyPos[0], tbodyPos[1]);

  let getTableRow = /<tr[^<>]*?>([^]*?)<\/tr>/g;
  let tableColumns = [
    "rank-rankings",
    "school-name-rankings",
    "total-stars",
    "total-stars",
    "total-stars",
    "total-stars",
    "total-stars",
    "points"
  ];

  function getTableColumn(colName) {
    return new RegExp("td[^<>]?class[^<>]?=['`\"]" + colName, "g");
  }
  let getItem = /<[^<>]*?>[\s\n]*([^\n<>]*?[\w\)])[\s\n]*<\//g;
  dataObj[year] = {};
  goThroughRows();

  function goThroughRows() {
    let tableColumn;
    let rowData = [];
    let tr = getTableRow.exec(content);
    if (tr === null) {
      return;
    }
    let temp = content.slice(tr.index, getTableRow.lastIndex);
    for (let colName of tableColumns) {
      tableColumn = getTableColumn(colName);
      let tc = tableColumn.exec(temp);
      if (tc === null) {
        return;
      }
      temp = temp.slice(tc.index);
      rowData.push(getItem.exec(temp)[1]);
      temp = temp.slice(getItem.lastIndex);
      getItem.lastIndex = 0;
    }
    dataObj[year][rowData[1]] = {
      rank: rowData[0],
      name: rowData[1],
      total_commits: rowData[2],
      five_stars: rowData[3],
      four_stars: rowData[4],
      three_stars: rowData[5],
      avg: rowData[6],
      total_points: rowData[7]
    };

    content = content.slice(getTableRow.lastIndex);
    getItem.lastIndex = 0;
    getTableRow.lastIndex = 0;
    goThroughRows();
  }
}

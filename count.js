const fs = require("fs");

const rawData = fs.readFileSync("./temp.json", "utf8");
const data = JSON.parse(rawData);

console.log("Số object trong mảng:", data.length);
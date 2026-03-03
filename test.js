const fs = require("fs");

// Đọc file gốc
const inputPath = "./temp.json";
const outputPath = "./output.json";

const rawData = fs.readFileSync(inputPath, "utf8");
const data = JSON.parse(rawData);

// Lọc bỏ field email
const filteredData = data.map(({ email, ...rest }) => rest);

// Ghi ra file mới
fs.writeFileSync(outputPath, JSON.stringify(filteredData, null, 2));

console.log("Done! File đã được tạo:", outputPath);
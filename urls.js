const fetch = require("node-fetch");

const fs = require("fs");

const writeToFile = (filename, obj) => {
  fs.writeFile(filename, JSON.stringify(obj), function (err) {
    if (err) {
      return console.log(err);
    }
  });
};

const updateFile = (fileName, arr) => {
  if (arr != getFileData(fileName)) writeToFile(fileName, arr);
};

const getFileData = fileName => {
  let array, file;
  try {
    file = fs.readFileSync(fileName);
    array = JSON.parse(file.toString());
  } catch (error) {
    // console.log(error);
    console.log("creating file");
    writeToFile(fileName, []);
    array = [];
  }
  return array;
};

// let getUrls = () => {
// };

let removeSlug = (fileName, slug) => {
  let array = getFileData(fileName);
  let index = array.reduce((a, b, i) => (b.slug == slug ? i : a), -1);
  index != -1 ? array.splice(index, 1) : {};
  updateFile(fileName, array);
};

let getUrl = (fileName, slug) => {
  let array = getFileData(fileName);
  return array.reduce((a, b) => {
    if (b.slug == slug) {
      return b.url;
    } else return a;
  }, undefined);
};

let incrementCount = (fileName, slug) => {
  let array = getFileData(fileName);
  let index = array.reduce((a, b, i) => (b.slug == slug ? i : a), -1);
  if (array[index].count > 0) array[index].count++;
  else array[index].count = 1;
  updateFile(fileName, array);
};

let createUrl = (fileName, slug, url) => {
  let array = getFileData(fileName);
  const newUrl = { slug, url, count: 0 };
  array.push(newUrl);
  updateFile(fileName, array);
  return array;
};

module.exports = { writeToFile, getFileData, removeSlug, getUrl, incrementCount, createUrl };

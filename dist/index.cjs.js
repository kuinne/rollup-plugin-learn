'use strict';

function moduleAFn () {
    console.log('moduleAFe');
}

var img = "data:image/jpeg;base64,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";

const testAlias = () => {
  moduleAFn();
};

const testImage = () => {
  console.log(img);
};

const testReplace = () => {
  console.log("production");
  console.log("2024-03-05T08:48:49.631Z");
};

const test = () => {
  testAlias();
  testImage();
  testReplace();
};

module.exports = test;
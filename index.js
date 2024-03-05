import moduleA from "moduleA";
import logo from "./rollup.jpg";

const testAlias = () => {
  moduleA();
};

const testImage = () => {
  console.log(logo);
};

const testReplace = () => {
  console.log(process.env.NODE_ENV);
  console.log(__buildDate__);
};

const test = () => {
  testAlias();
  testImage();
  testReplace();
};

export default test;

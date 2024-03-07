import moduleA from "moduleA";
import logo from "./rollup.jpg";
import * as addProxy from "./addProxy";

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

const testAddProxy = () => {
  console.log("addProxy", addProxy);
};

const testDynamicChunkLogs = () => {
  return import("./dynamicModule");
};

const test = () => {
  testAlias();
  testImage();
  testReplace();
  testAddProxy();
  testDynamicChunkLogs();
};

export default test;

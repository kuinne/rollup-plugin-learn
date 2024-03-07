import moduleA from "./moduleA";

export default () => {
  moduleA();
  console.log("This is a dynamicModule", import("./dynamicModule2"));
};

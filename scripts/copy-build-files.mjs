import fs from "fs-extra";

// source directory
const sourceDir = "src";
// build directory
const destinationDir = "lib";

// Copy the 'prompts' directory
fs.copySync(sourceDir + "/prompts", destinationDir + "/prompts");

// Copy the 'knowledge-bases' directory inside 'rag' directory
fs.copySync(
  sourceDir + "/rag/knowledge-bases",
  destinationDir + "/rag/knowledge-bases"
);

// Copy the 'tests/test-data' directory
fs.copySync(
  sourceDir + "/tests/test-data",
  destinationDir + "/tests/test-data"
);

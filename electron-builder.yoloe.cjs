const { build } = require("./package.json");

module.exports = {
  ...build,
  appId: "com.easylabeling.yoloe26",
  productName: "Easy Labeling YOLOE-26",
  extraMetadata: { name: "easy-labeling-yoloe26", version: "2.6.1" },
  directories: { output: "release/yoloe26" },
  artifactName: "Easy-Labeling-YOLOE26-Setup-${version}-x64.${ext}",
  win: { ...build.win, target: [{ target: "nsis", arch: ["x64"] }] },
  extraResources: [
    { from: "assets/models/yoloe26", to: "yoloe26" }
  ]
};

const path = require("path");
const { defineConfig } = require("vite");

module.exports = defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "lib.js"),
      name: "iframe-dialog",
      fileName: "iframe-dialog",
    },
  },
});

exports.config = {
  // See http://brunch.io/#documentation for docs.
  files: {
    javascripts: {
      joinTo: "js/app.js",
      // entryPoints: {
      //   "js/app.js": { "js/app.js": /^..\/..\/components\// }
      // },
      order: {
        before: "*.jsx?"
      }

      // To use a separate vendor.js bundle, specify two files path
      // http://brunch.io/docs/config#-files-
      // joinTo: {
      //   "js/app.js": /^js/,
      //   "js/vendor.js": /^(?!js)/
      // }
      //
      // To change the order of concatenation of files, explicitly mention here
      // order: {
      //   before: [
      //     "vendor/js/jquery-2.1.1.js",
      //     "vendor/js/bootstrap.min.js"
      //   ]
      // }
    },
    stylesheets: {
      joinTo: "css/app.css"
    },
    templates: {
      joinTo: "js/app.js"
    }
  },

  conventions: {
    // This option sets where we should place non-css and non-js assets in.
    // By default, we set this to "/assets/static". Files in this directory
    // will be copied to `paths.public`, which is "priv/static" by default.
    assets: /^(static)/
  },

  // Phoenix paths configuration
  paths: {
    // Dependencies and current project directories to watch
    watched: ["static", "css", "js", "vendor", "../../components"],
    // Where to compile files to
    public: "../priv/static"
  },

  // Configure your plugins
  plugins: {
    babel: {
      presets: [
        // require.resolve("babel-preset-env"),
        // require.resolve("babel-preset-react")
        "env",
        "react"
      ],
      plugins: [
        // require.resolve("babel-plugin-transform-object-rest-spread")],
        "transform-object-rest-spread"
      ],
      // Do not use ES6 compiler in vendor code
      ignore: [/vendor/]
      // compilers: ["env", "react", "transform-object-rest-spread"]
    }
  },

  modules: {
    // wrapper: (path, data) => {
    //   console.log(path, data)
    // },
    wrapper: (path, data) => {
      console.log("wrapper:", path, data)
      return `
        require.define({${path}: function(exports, require, module) {
          ${data}
        }});\n\n
      `
    },
    nameCleaner: path => console.log("path:", path),
    autoRequire: {
      "js/app.js": ["js/app"]
    }
  },
  hooks: {
    onCompile(generatedFiles, changedAssets) {
      console.log(generatedFiles.map(f => f.path))
    }
  },
  npm: {
    compilers: ["babel-brunch"],
    enabled: true
  }
}

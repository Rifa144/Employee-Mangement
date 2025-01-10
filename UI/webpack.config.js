const path = require("path"); //Importing the path module from the node.js
const HtmlWebpackPlugin = require("html-webpack-plugin"); // Importing HtmlWebpackPlugin to generating a html files

module.exports = {
  entry: "./JSX/EmployeeDirectory.jsx", //Entry point of the application
  output: {
    path: path.resolve(__dirname, "public"),//Output Directory for bundled files
    filename: "bundle.js", //Name of the bundled Javascript file
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, //Rule for processing Javascript and JSX files
        exclude: /node_modules/, //Exclude node_modules directory from processing
        use: {
          loader: "babel-loader", //USe babel-loader for transpilling JSX and ES6 code
          options: {
            presets: ["@babel/preset-env", "@babel/preset-react"],
          },
        },
      },
      {
        test: /\.css$/, //Rule for processing CSS files
        use: ["style-loader", "css-loader"], //Use style-loader and css-loader for handling CSS
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"], //Automatically resolve .js and .jsx extensions
    modules: [path.resolve(__dirname, "node_modules")], 
  },
  externals: {
    react: "React", //Treat react as an external dependency
    "react-dom": "ReactDOM", //Treat ReactDOM as an external dependency
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./public/index.html", //Use index.html as a template for HtmlWebpackPlugin
    }),
  ],
};

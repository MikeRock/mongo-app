import webpack from 'webpack'
import path from 'path'
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import CopyPlugin from 'copy-webpack-plugin'
let config =  {
  entry: {
    "vendor": ['react'],
    "bundle":["./src/app.js"]
  },
  output: {
    path: path.resolve(__dirname,"build"),
    filename: "[name].js"
  },
  module: {
    rules:[{
        test:/\.js$/,
        use: "babel-loader",
        exclude: /node_modules/ 
    },{
      test:/.css$/,
      exclude: /node_modules/,
      use: ExtractTextPlugin.extract({
        fallback: "style-loader",
        use: "css-loader" 
      })
    }]
},
plugins: [
  // Automatically requests package when the name is encountered
  // No need to add React to imports anymore :)
  new webpack.ProvidePlugin({
    "React": "react"
  }),
  // Copies to [path]/[to]
  new CopyPlugin([{
    from: "src/copy_me.txt",
    to:"was_copied.txt"
  }]),
  new ExtractTextPlugin({
    filename: "/styles/style.css",
    allChunks: true,
    // NOT teh path of extraction only relevant when using with HtmlWebpackPlugin in <link href='[publicPath]/[filename]' /> 
    publicPath: "build"
  }),
  new webpack.HashedModuleIdsPlugin({
    hashDigestLength: 10,
    hashDigest: "base64"
  }),
  new webpack.BannerPlugin({
   banner:"CHUNKNAME [name] CHUNKHASH [chunkhash] FILE [file]" 
  }),
  // EnvironmentPlugin equivalent  => new EnvironMentPlugin({NODE_ENV: "development"}) 
  //only sets development if NODE_ENV  is not defined in process.env 
    new webpack.DefinePlugin({
   "process.env.NODE_ENV":JSON.stringify(process.env.NODE_ENV) || "development"
  }),
  new webpack.optimize.CommonsChunkPlugin({
    names: ["vendor","manifest"]
  }),
  // Helps in long term caching
  new ChunkManifestPlugin({
    filename: 'manifest.json',
    manifestVariable: 'webpackManifest',
    inlineManifest: false})

]
  
}

if(process.env.NODE_ENV === "development")
config = {...config,devtool:"source-map"}
export default config
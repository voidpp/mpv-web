const path = require('path');

module.exports = {

    entry: ["./src/ts/app.tsx"],

    devServer: {
        contentBase: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000,
    },
    output: {
        path: __dirname + '/dist',
        publicPath: '/',
        filename: 'app.js'
    },
    module: {
        rules: [
            {
                test: /\.s?css$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS
                ]
            },
            {
                test: /\.(jpe?g|png|ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
                use: 'base64-inline-loader?name=[name].[ext]'
            },

            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: "babel-loader"
            },
            {
                test: /\.tsx?$/,
                exclude: /node_modules/,
                loader: "ts-loader",
            },
        ]
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    node: {
        console: true,
        fs: 'empty',
        net: 'empty',
        tls: 'empty'
    }
};

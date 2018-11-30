
//TODO: change to mode production 

let babelLoader = {
     loader: 'babel-loader' ,
     options: {
         presets: ['@babel/preset-env', '@babel/preset-react']
     }
}

let config = {
    mode: 'development',
    entry: [
        './src/index.js'
    ],
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: [
                    babelLoader,
                    { loader: 'ts-loader', options: { onlyCompileBundledFiles: true } }
                ]
            },
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [
                    babelLoader
                ]
            }
        ]
    },
    resolve: {
        extensions: ['*', '.ts', '.tsx', '.js', '.jsx'],
        alias: {}
    },
    output: {
        path: __dirname + '/public/assets/javascript',
        publicPath: '/assets/javascript',
        filename: 'bundle.js'
    },
    plugins: [],
    devServer: {
        contentBase: './public'
    },
    // optimization: {
    //     splitChunks: {
    //         cacheGroups: {
    //             vendor: {
    //                 test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
    //                 name: 'vendor',
    //                 chunks: 'all',
    //             },
    //             tests: {
    //                 test: /[\\/]node_modules[\\/](react-hot-loader|webpack-dev-server)[\\/]/,
    //                 name: 'tests',
    //                 chunks: 'all',
    //             },                          
    //         }
    //     }
    // }
};

module.exports = config;
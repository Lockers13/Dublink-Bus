const path = require('path');

module.exports = {
	entry: {
		app : './react/index.js',
		app2: './react/secondtestindex.js',

	},
	watch: true,
	devtool: 'source-map',
	output: {
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [ 
						{
                      		loader: 'babel-loader',
                      		options: {
                        	presets: ['@babel/react']
                      	}
                    }
                ]
			}

		]
	},
	resolve: {
		extensions: [
			'.js'
		]
	}
}
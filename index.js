const path = require("path")
const express = require("express")
const webpack = require("webpack")
const webpackMiddleware = require("webpack-dev-middleware")
const webpackConfig = require("./webpack.config")

const app = express()

const publicPath = path.join(__dirname, "public")

app.use(express.static(publicPath))
app.use(webpackMiddleware(webpack(webpackConfig)))

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, "src/views/home.html"))
})

app.get('/chess', (req, res) => {
	res.sendFile(path.join(__dirname, "src/views/chess.html"))
})

const port = process.env.PORT || 9000

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})

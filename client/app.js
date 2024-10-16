// Imports
const express = require('express')
const expressLayouts = require('express-ejs-layouts')

const app = express()
const port = 3232

// Static Files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))

// Set Templating Engine
app.use(expressLayouts)
app.set('layout', './layouts')
app.set('view engine', 'ejs')

// Routes
app.get('/chapters', (req, res) => {
	res.render('chapters', { title: 'Chapters Page', layout: './layouts/base' })
});
app.get('/entries', (req, res) => {
	res.render('entries', { title: 'Entries Page', layout: './layouts/base' })
});
app.get('/tags', (req, res) => {
	res.render('tags', { title: 'Tags Page', layout: './layouts/base' })
});
app.get('/reminds', (req, res) => {
	res.render('reminds', { title: 'Reminds Page', layout: './layouts/base' })
});
app.get('/system', (req, res) => {
	res.render('system', { title: 'System Page', layout: './layouts/base' })
});


// Listen on Port 5000
app.listen(port, () => console.info(`App listening on port ${port}`))
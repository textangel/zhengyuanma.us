const path = require('path');
const express = require('express')
const app = express()
const port = 3000
var fs = require('fs');

const pug = require('pug');

course_dirname = 'assets/courses/'
courses = ['cs224n', 'cs231n', 'cs246', 'cs234', 'stats200']

function generate_files_list(course_dirname, course){
	generate_file(course)
}

function generate_file(course) {
	course_dirname = 'assets/courses/';
	url_prefix = __dirname + "/" + course_dirname;
	fs.readdir(url_prefix + course, function(err, files) {
		course_list = [];
		if (err) {
			console.log("error", err);
			return 0;
		}
		files.forEach(file => {
			if (file.endsWith('.html') && file != "index.html")
				course_list.push(file.slice(0, -5))
		})
		course_list.sort(function (x,y) {console.log(x, parseInt(x.split("-")[0].trim())); return parseInt(x.split("-")[0].trim()) - parseInt(y.split("-")[0].trim())})
		var compiled_html = pug.renderFile(course_dirname + course + '/index.pug', 
				{"base_path": course_dirname + course + "/",
					"files": JSON.stringify(course_list) });
	
		fs.writeFile(url_prefix + course + '/index.html', compiled_html, function(err) {
			if(err) { return console.log(err); }
			// console.log(compiled_html, "\n\nsaved to ", url_prefix + course + '/index.html\n\n\n');
		}); 
	})
}

courses.forEach(course_name => generate_files_list(course_dirname, course_name))


// app.use('/', express.static("."))
// app.listen(port, () => {
// 	console.log(`Example app listening at http://localhost:${port}`)
// })

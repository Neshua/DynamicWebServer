// Built-in Node.js modules
let fs = require('fs');
let path = require('path');
// const Chart = require('chart.js');
// const myChart = new Chart(ctx, {...});
// import Chart from 'chart.js/auto';


// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


let public_dir = path.join(__dirname, 'public');
let template_dir = path.join(__dirname, 'templates');
let db_filename = path.join(__dirname, 'db', 'births.sqlite3'); // <-- change this

let app = express();
let port = 8000;

// Open SQLite3 database (in read-only mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.log('Error opening ' + path.basename(db_filename));
    }
    else {
        console.log('Now connected to ' + path.basename(db_filename));
    }
});

// Serve static files from 'public' directory
app.use(express.static(public_dir));


// GET request handler for home page '/' (redirect to desired route)
app.get('/', (req, res) => {
    //if request does not equal or contain --> submit 404
    let home = '/year/2000';
    res.redirect(home);
});



// Example GET request handler for data about a specific year
app.get('/year/:selected_year', (req, res) => {
    let year = req.params.selected_year;
    fs.readFile(path.join(template_dir, 'births_template.html'), (err, template) => {
        let query = "SELECT * FROM Births WHERE Births.year = ?";
        db.all(query, [year], (err, rows) => {
            let response = template.toString();
            response = response.replace('%%TITLE%%', "Data of every month for year:");
            response = response.replace('%%YEAR%%', year);
            let month = 1;
            let birth_number = 0;
            let birth_data = "";
            for(let i = 0; i < rows.length; i++){
                if (i === (rows.length-1) || rows[i].monthNum !== month) {
                    if(i === rows.length-1) {
                        birth_number += rows[i].births;
                    }
                    birth_data += "<tr>";
                    birth_data += "<td>" + rows[i-1].monthNum + "</td>";
                    birth_data += "<td>" + birth_number + "</td>";
                    birth_data += "</tr>";
                    birth_number = rows[i].births;
                    month++;
                } else {
                    birth_number += rows[i].births;
                }
            }
            response = response.replace("%%BIRTH_INFO%%", birth_data);
            if(rows.length > 0) {
                res.status(200).type('html').send(response);
            } else {
                res.status(404).type('text').send("ERROR: No data for year "+ year);
            }
        });
    });
});

// Example GET request handler for data about a specific year
app.get('/month/:selected_month', (req, res) => {
    console.log(req.params.selected_month);
    fs.readFile(path.join(template_dir, 'month.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database

        res.status(200).type('html').send(template); // <-- you may need to change this
    });
});

// Example GET request handler for data about a specific year
app.get('/day/:selected_day', (req, res) => {
    console.log(req.params.selected_day);
    fs.readFile(path.join(template_dir, 'year.html'), (err, template) => {
        // modify `template` and send response
        // this will require a query to the SQL database

        res.status(200).type('html').send(template); // <-- you may need to change this
    });
});




app.listen(port, () => {
    console.log('Now listening on port ' + port);
});

// Built-in Node.js modules
let fs = require('fs');
let path = require('path');
// const Chart = require('chart.js');
// const myChart = new Chart(ctx, {...});
// import Chart from 'chart.js/auto';


// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3').verbose();


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



// outputs all births in the 12 months in that given year
app.get('/year/:selected_year', (req, res) => {
    let year = req.params.selected_year;
    fs.readFile(path.join(template_dir, 'births_template.html'), (err, template) => {
        let query = "SELECT * FROM Births WHERE Births.year = ?";
        db.all(query, [year], (err, rows) => {
            let response = template.toString();
            response = response.replace('%%TITLE%%', "Sum of all US Births for every month in");
            response = response.replace('%%YEAR%%', year);
            let month = 1;
            let birth_number = 0;
            let birth_data = "";
            let xlabels = "";
            let data = "";
            let table_head = "";
            for(let i = 0; i < rows.length; i++){
                if (i === (rows.length-1) || rows[i].monthNum !== month) {
                    if(i === rows.length-1) {
                        xlabels += month.toString();
                        birth_number += rows[i].births;
                        data += birth_number.toString();
                    } else {
                        data += birth_number.toString() + ',';
                        xlabels += month.toString() + ",";
                    }
                    birth_data += "<tr>";
                    birth_data += "<td>" + month + "</td>";
                    birth_data += "<td>" + birth_number + "</td>";
                    birth_data += "</tr>";
                    birth_number = rows[i].births;
                    month++;
                } else {
                    birth_number += rows[i].births;
                }
            }
            table_head = "<tr>"+ "<th>" +"Month Number"+"</th>"+ "<th>" +"Sum of Births"+"</th>" + "</tr>";
            response = response.replace("%%MFR_IMAGE%%", "/images/" + "year.png");
            response = response.replace("%%TABLE_HEADER%%", table_head);
            response = response.replace("%%data_list%%", data);
            response = response.replace("%%label_list%%", xlabels);
            response = response.replace("%%BIRTH_INFO%%", birth_data);
            if(rows.length > 0) {
                res.status(200).type('html').send(response);
            } else {
                res.status(404).type('text').send("ERROR: No data for year "+ year);
            }
        });
    });
});

// outputs the amount of births in that month throughout the 14 years (ex april in 2000-2014)
app.get('/month/:selected_month', (req, res) => {
    // let month = req.params.selected_month.toLowerCase();
    let month = req.params.selected_month;
    month = month[0].toUpperCase() + month.substring(1, month.length)
    let monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let month_number = parseInt(monthList.indexOf(month) + 1);
    console.log(month);
    console.log(month_number);
    
    fs.readFile(path.join(template_dir, 'births_template.html'), (err, template) => {
        let query = "SELECT * FROM Births WHERE Births.monthNum = ?";
        db.all(query, [month_number], (err, rows) => {
            let response = template.toString();
            response = response.replace('%%TITLE%%', 'Sum of all US births in');
            response = response.replace('%%YEAR%%',  " " + month +  ' from 2000-2014');
            let birth_number = 0;
            let year = 2000;
            let birth_data = "";
            let xlabels = "";
            let data = "";
            let table_head = "";
            for(let i = 0; i < rows.length; i++){
                if (i === (rows.length-1) || rows[i].year !== year) {
                    if(i === rows.length-1) {
                        xlabels += year.toString();
                        birth_number += rows[i].births;
                        data += birth_number.toString();
                    } else {
                        data += birth_number.toString() + ',';
                        xlabels += year.toString() + ",";
                    }
                    birth_data += "<tr>";
                    birth_data += "<td>" + year + "</td>";
                    birth_data += "<td>" + birth_number + "</td>";
                    birth_data += "</tr>";
                    birth_number = rows[i].births;
                    year++;
                } else {
                    birth_number += rows[i].births;
                }
            }
            table_head = "<tr>"+ "<th>" +"Year"+"</th>"+ "<th>" +"Sum of Births"+"</th>" + "</tr>";
            response = response.replace("%%MFR_IMAGE%%", "/images/" + "month.png");
            response = response.replace("%%TABLE_HEADER%%", table_head);
            response = response.replace("%%data_list%%", data);
            response = response.replace("%%label_list%%", xlabels);
            response = response.replace("%%BIRTH_INFO%%", birth_data);
            if(rows.length > 0) {
                res.status(200).type('html').send(response);
            } else {
                res.status(404).type('text').send("ERROR: No data for day "+ month);
            }
        
        });
    });
});

// outputs the amount of births for that day (ex. sum of all tuesday births in 2002) throughout all 14 years.
app.get('/day/:selected_day', (req, res) => {
    let day = req.params.selected_day.toString();
    day = day[0].toUpperCase() + day.substring(1, day.length);
    fs.readFile(path.join(template_dir, 'births_template.html'), (err, template) => {
        let query = "SELECT * FROM Births INNER JOIN DayOfWeek ON Births.day = DayOfWeek.day WHERE DayOfWeek.name = ?";
        db.all(query, [day], (err, rows) => {
            //console.log(rows);
            let response = template.toString();
            response = response.replace('%%TITLE%%', "Sum of all US births on");
            response = response.replace('%%YEAR%%', day + "'s from 2000-2014");
            let birth_number = 0;
            let year = 2000;
            let birth_data = "";
            let xlabels = "";
            let data = "";
            let table_head = "";
            for(let i = 0; i < rows.length; i++){
                if (i === (rows.length-1) || rows[i].year !== year) {
                    if(i === rows.length-1) {
                        xlabels += year.toString();
                        birth_number += rows[i].births;
                        data += birth_number.toString();
                    } else {
                        data += birth_number.toString() + ',';
                        xlabels += year.toString() + ",";
                    }
                    birth_data += "<tr>";
                    birth_data += "<td>" + year + "</td>";
                    birth_data += "<td>" + birth_number + "</td>";
                    birth_data += "</tr>";
                    birth_number = rows[i].births;
                    year++;
                } else {
                    birth_number += rows[i].births;
                }
            }
            table_head = "<tr>"+ "<th>" +"Year"+"</th>"+ "<th>" +"Sum of Births"+"</th>" + "</tr>";
            response = response.replace("%%MFR_IMAGE%%", "/images/" + "week.png");
            response = response.replace("%%TABLE_HEADER%%", table_head);
            response = response.replace("%%data_list%%", data);
            response = response.replace("%%label_list%%", xlabels);
            response = response.replace("%%BIRTH_INFO%%", birth_data);
            if(rows.length > 0) {
                res.status(200).type('html').send(response);
            } else {
                res.status(404).type('text').send("ERROR: No data for day "+ day);
            }
        });
    });
});




app.listen(port, () => {
    console.log('Now listening on port ' + port);
});

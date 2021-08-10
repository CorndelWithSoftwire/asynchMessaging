
const fs = require('fs');

// Example log scraper

let logFileName = process.argv[2];
if (! logFileName || logFileName.length == 0) {
    logFileName = "ace.log";
}

console.log("Scraping ", logFileName);

const logLines = fs.readFileSync(logFileName).toString().split("\n");

console.log("Read", logLines.length, "lines");

const regexp = /.*W: (?<m>.*)/

logLines.forEach( line => 
    {
       const match = regexp.exec(line);
       if ( match){
           console.log("warning message:", match.groups.m);
       }
    }
    );



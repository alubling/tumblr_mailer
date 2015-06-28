var fs = require('fs');
// var ejs = require('ejs');
// var querystring = require('querystring');
// var es = require('./event-stream');
// var Transform = require('stream').Transform,
//     csv = require("./csv-stream/csv-streamify"),
//     JSONStream = require('./JSONStream');

// read the csv file and put it into a string
var csvFile = fs.readFileSync("friend_list.csv", "utf8");
// console.log(csvFile);

// Read in the file from the email template
var fileContents = fs.readFileSync('email_template.html', {encoding: "utf8"});


// var csvToJson = csv({objectMode: true});
//
// PARSER:
//
//     var parser = new Transform(); // {objectMode: true}
//     parser._transform = function(data, encoding, done){
//       this.push(data);
//       done();
//     };
//
//     var jsonToStrings = JSONStream.stringify(false);
//
//     // Pipe the streams
//     process.stdin
//     .pipe(csvToJson)
//     .pipe(parser)
//     .pipe(jsonToStrings)
//     .pipe(process.stdout);
//
//     // In case of error
//     process.stdout.on("error", process.exit);

    function csvParse(csvFile) {
      // var query = querystring.parse(csvFile.toString());
      // return query;

      // fs.createReadStream(csvFile)
      //     .pipe()

      // Going to use .split() to parse this csv file, but that seems pretty brittle and only works because I know the exact format and know it won't change.
      // I'd like to use a module or library for this but still have a problem with npm configuration that I can't resolve myself

      // create the overall array
      var masterArray = [];

      // start by parsing for each entry
      var csvArray = csvFile.split("\n");
      //console.log(csvArray);

      // now parse for the header into a string
      var headerArray = csvArray[0].split(",", 4);
      //console.log(headerArray);
      //var headerObject = Object.create(header);

      // create the kind of object you will want using the header's values as the keys of a generic object
      var csvObject = {};
      csvObject[headerArray[0]] = "";
      csvObject[headerArray[1]] = "";
      csvObject[headerArray[2]] = "";
      csvObject[headerArray[3]] = "";
      //console.log(csvObject);

      var newPersonArray = [];

      // now parse the rest of the strings
      for (var i = 1; i < csvArray.length - 2; i++) {

        //console.log(csvArray);
        // parse each entry into an array
        var newPersonArray = csvArray[i].split(",", 4);

        // create an object for each person
        // var newPerson = Object.create(csvObject); // this doesn't work since it doesn't copy properties into the new object, only inheritance from the object as a prototype
        // var newPerson = Object.assign({}, csvObject); // not sure why this is still unsupported but doesn't this do COPYING perfectly?
        // this seems to be the simplest way I can find to just copy an object with it's properties
        var newPerson = {};
        for(var ref in csvObject) {
          newPerson[ref] = csvObject[ref];
        }
        // console.log(newPerson);
        // console.log(newPersonArray);

        // loop through the array of newPerson attributes and assign each one to a key
        for (var j = 0; j < newPersonArray.length; j++) {
          newPerson[Object.keys(newPerson)[j]] = newPersonArray[j]; // need a way to reference each key by number
        }
        //console.log(newPerson);

        // // loop through the object's keys and assign the value at each one
        // for (var key in newPerson) {
        //   if (object.hasOwnProperty(variable)) {
        //     // loop through the array of newPerson attributes and assign each one to a key
        //     for (var i = 0; i < newPersonArray.length; i++) {
        //       // if the nth key matches the nth array index, assign it
        //       if (Object.keys(newPerson)[i] == newPersonArray[i]) {
        //
        //       }
        //     }
        //   }
        // }
        masterArray.push(newPerson);
      }
      return masterArray;


      // for (var i = 0; i < 4; i++) {
      //   array[i]
      // }



    };

    var csv_list = csvParse(csvFile);
    // console.log(csv_list);



// for each of the people in the list, print out an email template with the right values filled in
csv_list.forEach(function(currentVal) {

  // first get the FIRST_NAME
  var firstName = currentVal["firstName"];

  // then get the NUM_MONTHS_SINCE_CONTACT
  var numMonths = currentVal["numMonthsSinceContact"];

  // make a copy of the fileContents since they can be used again
  var fileContentsInstance = fileContents;

  // Replace both values in the fileContents
  fileContentsInstance = fileContentsInstance.replace("FIRST_NAME", firstName);
  fileContentsInstance = fileContentsInstance.replace("NUM_MONTHS_SINCE_CONTACT", numMonths);

  console.log(fileContentsInstance);

});

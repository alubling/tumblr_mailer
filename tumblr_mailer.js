var fs = require('fs');
var ejs = require('ejs');
// var tumblr = require('./tumblr.js');
// var querystring = require('querystring');
// var es = require('./event-stream');
// var Transform = require('stream').Transform,
//     csv = require("./csv-stream/csv-streamify"),
//     JSONStream = require('./JSONStream');

var mandrill = require('mandrill-api/mandrill');
var mandrill_client = new mandrill.Mandrill('api key goes here');


// Authenticate via OAuth - Tumblr authentication information
var tumblr = require('tumblr.js');
var client = tumblr.createClient({
  consumer_key: 'api key goes here',
  consumer_secret: 'secret key goes here',
  token: 'token goes here',
  token_secret: 'secret token goes here'
});

// Make the request
client.userInfo(function (err, data) {
    // ...
});

// Grab the posts from my tumblr blog
client.posts('pragmaticbear.tumblr.com', function(err, blog){
  //console.log(blog);
});


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



client.posts('pragmaticbear.tumblr.com', function(err, blog){
  // console.log(blog);

// find the latest posts and create an array to hold them (but are these a property of an object)
var latestPosts = [];


// find the posts written in the last 7 days. client.posts is an array of objects, so client.posts[].
// loop through the array holding the blog posts - they contain blog objects
for (var i = 0; i < blog.posts.length; i++) {

//  console.log(blog.posts.length);
//  console.log(blog.posts[i]["date"]);

  // create a new date object
  var currentDate = new Date();
  // set a new date in the date format
  var postDate = new Date(blog.posts[i]["date"]);

  // for each one, if it was written in the last 7 days, add it to the latestPosts array
  if ( blog.posts[i]["state"] === 'published' && (Date.parse(currentDate) - 604800000) < Date.parse(blog.posts[i]["date"])) { // blog.posts[i]["state"] === 'published' &&
    // console.log("something pushed" + i + " time");
    latestPosts.push(blog.posts[i]);
  }
}

//console.log(latestPosts[0]);

    // for each of the people in the list, print out an email template with the right values filled in
    csv_list.forEach(function(currentVal) {

      // first get the FIRST_NAME
      //var firstName = currentVal["firstName"];

      // then get the NUM_MONTHS_SINCE_CONTACT
      //var numMonths = currentVal["numMonthsSinceContact"];

      // make a copy of the fileContents since they can be used again
      var fileContentsInstance = fileContents;

      // Replace both values in the fileContents
      // fileContentsInstance = fileContentsInstance.replace("FIRST_NAME", firstName);
      // fileContentsInstance = fileContentsInstance.replace("NUM_MONTHS_SINCE_CONTACT", numMonths);

      //console.log(fileContentsInstance);
      //console.log(latestPosts);

      // Create our ejs template for each person in the list
      var ejsTemplate = ejs.render(fileContentsInstance, {firstName: currentVal["firstName"], numMonthsSinceContact: currentVal["numMonthsSinceContact"], latestPosts: latestPosts});

      // Send the emails!
      sendEmail(currentVal["firstName"], currentVal["emailAddress"], "Amit", "alubling@gmail.com", "Check this out!", ejsTemplate );

    });

});

// send email function to actually send the emails
function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]
    };
    var async = false;
    var ip_pool = "Main Pool";
    mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }

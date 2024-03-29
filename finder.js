var path = require('path'),
    fs = require('fs'),
    glob = require('glob'),
    conf = require('./finder.conf.js');

function FileFinder(conf) {
  this.baseDir = conf.baseDir || process.cwd();
  this.directories = conf.directories || {};
  this.humanMap = {};

  // Scan for files
  this.scan();
}
FileFinder.prototype = {
  'open': function (name) {
    var exec = require('child_process').exec,
        file = this.humanMap[name],
        dir = this.baseDir,
        filepath = path.join(dir, '/', file);

    exec(conf.editor + ' ' + filepath, function () {});
  },
  'query': function (query) {
    // Grab the keys for quick looping
    var humanMap = this.humanMap,
        humanNames = Object.getOwnPropertyNames(humanMap),

    // Collect all items that match
        queryParts = query.split(/\s+/),
        queryPart,
        hasUppercase,
        regexpFlags,
        regexpArr = [],
        regexp,
        j,
        matches = [],
        matchesAll;

    // Create the regexp items
    for (i = 0, len = queryParts.length; i < len; i++) {
      queryPart = queryParts[i];

      // If the queryPart uses upper case, be case sensitive. Otherwise, don't.
      hasUppercase = !!queryPart.match(/[A-Z]/),
      regexpFlags = hasUppercase ? '' : 'i';
      regexp = new RegExp(queryPart, regexpFlags);

      // Generate the filter and push it onto the array
      regexpArr.push(regexp);
    }

    // Iterate the names
    for (i = 0, len = humanNames.length; i < len; i++) {
      humanName = humanNames[i];
      matchesAll = true;

      // Check each name against a regular expression
      for (j = regexpArr.length; j--;) {

        // If it does not match, fail the loop
        if (!humanName.match(regexpArr[j])) {
          matchesAll = false;
          break;
        }
      }

      // If there were no failures
      if (matchesAll === true) {
        // Push the match on the list
        matches.push(humanName);
      }
    }

    // Return the matches
    return matches;
  },
  'scan': function () {
    // Erase the old memory
    this.humanMap = {};

    // Update the new memory
    var fullFilenames = this.scanFullFilenames();
    this.mapFilenamesToHuman(fullFilenames);
  },
  'scanFullFilenames': function () {
    var retArr = [],
        dirs = this.directories,
        baseDir = this.baseDir;
        
    dirs.forEach(function (dir) {
      var files = glob.sync(dir, {cwd: baseDir});
      retArr = retArr.concat(files);
    });
    
    this.fullFilenames = retArr;
    return retArr;
  },
  'mapFilenamesToHuman': function (fullFilenames) {
    // Recusively dive and collect all files
    var i,
        len,
        humanToFullFilenameMap = this.humanMap,
        baseDir = this.baseDir,
        filename,
        humanName;

    // Loop through the files
    for (i = 0, len = fullFilenames.length; i < len; i++) {
      // Get each filename sans base_dir
      filename = fullFilenames[i];
      humanName = filename.replace(baseDir, '');

      // Add the file name to the map
      humanToFullFilenameMap[humanName] = filename;
    }

    return this;
  }
};

// Grab our config and create our fileFinder
var fileFinder = new FileFinder(conf),
// Generate the interface
    rl = require('readline'),
    iface = rl.createInterface(process.stdin, process.stdout, null);

// Set up startSearch for calling later
function startSearch() {
  iface.question('Enter search: ', function (query) {
    // Get the results of our query
    var matches = fileFinder.query(query),
        len = matches.length;

    // If no results were found
    if (len === 0) {
      console.log('No results found for: ' + query);
      startSearch();
    } else if (len === 1) {
      var item = matches[0];
    // If there is one, skip to go
      console.log('Opening: ' + item);
      fileFinder.open(item);

      // Begin the search again
      startSearch();
    } else {
    // Otherwise, list options
      console.log('');
      console.log('----------------');
      console.log('Search Results');
      console.log('----------------');
      for (i = 0; i < len; i++) {
        console.log(i + ': ' + matches[i]);
      }

      // Ask for a number
      iface.question('Which item would you like to open? ', function (numStr) {
        var num = +numStr,
            item;

        // If the number is not NaN and we were not given an empty string
        if (num === num && numStr !== '') {
          // and if it is in our result set
          if (num >= 0 && num < len) {
            // Open it
            item = matches[num];
            console.log('Opening: ' + item);
            fileFinder.open(item);
          }
        } else {
        // Otherwise, if there was a word in there so we are assuming it was 'rescan'
          // Rescan
          console.log('Rescanning...');
          fileFinder.scan();
        }

        // Begin the search again
        startSearch();
      });
    }
  });
}

startSearch();


// TODO: Eventually...
// // TEST: tty inputting
// var sentence = {
  // 'charArr': [],
  // 'push': function (letter) {
    // val += letter;
    // // TODO: Move the cursor
  // },
  // 'delete': function (letter) {

    // // TODO: Rewrite sentence
  // }
// };
// process.stdin.resume();
// process.stdin.setEncoding('utf8');

// require('tty').setRawMode(true);

// function ontype(letter) {
  // switch (letter) {
  // // If the command is to terminate, terminate
    // case '\u0003':
      // return process.exit();
      // break;
  // // If a carriage return (enter) was hit
    // case '\r':
    // case '\n':
      // // TODO: Open the highlighted item
      // console.log('Opening: ', sentence);

      // // and retype the selected item
      // console.log('Select a file: ', sentence);
      // break;
    // default:
      // // Otherwise, append the item to the sentence
      // sentence

      // // Get unicode
      // // console.log(arguments);
  // }
// }
// process.stdin.on('data', ontype);
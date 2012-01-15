var path = require('path'),
    fs = require('fs');
    
// Prep for recursive dive of the directories
function getFilesFromDirectory(basePath, dirName, tree) {
  var dirPath = path.join(basePath, dirName),
      treeType = typeof tree,
      files = [],
      keys,
      key,
      i,
      len;

  // TODO: Use async lib and don't do sync
  // If the tree is not a tree/object
  if (treeType !== 'object') {
    // and is a boolean
    if (treeType === 'boolean') {
      // TODO: Handle black listing? (via false)
      if (tree === true) {
        keys = fs.readdirSync(dirPath);

        for (i = 0, len = keys.length; i < len; i++) {
          key = keys[i];
          files.push( path.join(dirPath, key) );
        }
      }
    }
  } else {
  // Otherwise, keep on diving in the tree
    keys = Object.getOwnPropertyNames(tree);
    for (i = 0, len = keys.length; i < len; i++) {
      key = keys[i];
      files = files.concat(getFilesFromDirectory(dirPath, key, tree[key]));
    }
  }

  return files;
}
    
function FileFinder(conf) {
  this.baseDir = conf.baseDir || process.cwd();
  this.directories = conf.directories || {};
  this.humanMap = {};
  
  // Scan for files
  this.scan();
}
FileFinder.prototype = {
  'query': function (query) {
    // Grab the keys for quick looping
    var humanMap = this.humanMap,
        humanNames = Object.getOwnPropertyNames(humanMap),
        
    // Collect all items that match
        regexpArr = query.split(/\s+/),
        j,
        matches = [];
    for (i = 0, len = humanNames.length; i < len; i++) {
      humanName = humanNames[i];
      matchesAll = true;
      for (j = regexpArr.length; j--;) {
        if (humanName.indexOf(regexpArr[j]) === -1) {
          matchesAll = false;
          break;
        }
      }

      if (matchesAll === true) {
        matches.push(humanName);
      }
    }
    
    // Return the matches
    return matches;
  },
  'scan': function () {
    var fullFilenames = this.scanFullFilenames();
    this.mapFilenamesToHuman(fullFilenames);
  },
  'scanFullFilenames': function () {
    var retArr = this.fullFilenames = getFilesFromDirectory(this.baseDir, '.', this.directories);
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
var conf = require('./finder.conf.js'),
    fileFinder = new FileFinder(conf),
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
    } else {
    // Otherwise, list options
      for (i = 0; i < len; i++) {
        console.log(i + ': ' + matches[i]);
      }

      // Ask for a number
      iface.question('Which item would you like to open? ', function (numStr) {
        var num = +numStr,
            item;

        // If the number is not NaN
        if (num === num) {
          // and if it is in our result set
          if (numStr !== '' && num >= 0 && num < len) {
            // Open it
            item = matches[num];
            console.log('Opening: ' + item);
            var exec = require('child_process').exec;
            exec('start ' + humanToFullFilenameMap[item], function () {});
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
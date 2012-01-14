var path = require('path'),
    conf = require('./finder.conf.js'),
    BASE_DIR = conf.baseDir || process.cwd(),
    directories = conf.directories || {},
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

// Recusively dive and collect all files
var fullFilenames = getFilesFromDirectory(BASE_DIR, '.', directories),
    i,
    len,
    humanToFullFilenameMap = {},
    filename,
    humanName;

// Loop through the files
for (i = 0, len = fullFilenames.length; i < len; i++) {
  // Get each filename sans base_dir
  filename = fullFilenames[i];
  humanName = filename.replace(BASE_DIR, '');

  // Add the file name to the map
  humanToFullFilenameMap[humanName] = filename;
}

// Then, create an array of the keys (for quick looping)
var humanNames = Object.keys(humanToFullFilenameMap),
    rl = require('readline'),
    iface = rl.createInterface(process.stdin, process.stdout, null);

// Set up startSearch for calling later
function startSearch() {
  iface.question('Enter search: ', function (query) {
    // Collect all items that match
    var regexpArr = query.split(/\s+/),
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

    // If no results were found
    len = matches.length;
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

        // If the number is not NaN and is in our result set
        if (numStr !== '' && num === num && num >= 0 && num < len) {
          // Open it
          item = matches[num];
          console.log('Opening: ' + item);
          var exec = require('child_process').exec;
          exec('start ' + humanToFullFilenameMap[item], function () {});
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
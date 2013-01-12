finder
======

Quick and dirty cross-platform CLI tool for searching for files to open with favorite editor.

Suggested Usage
---------------
This was intended to be used on a per-project basis and hook up to a OS level hotkey.

```shell
# Clone the repository
git clone git://github.com/twolfson/finder.git {{Optional: folder_name}}

# Enter the folder
cd finder {{or folder_name}}

# Set up configuration. See Configuration for more details.
{{editor}} finder.conf.js

# Create shortcut for `node finder.js`. See Shortcuts for more details.
```

### Configuration
`finder.conf.js` returns an object which conforms to the following setup:
```js
module.exports = {
  'baseDir': 'directory/to/start/all/searches/from,
  'directories': [
    'minimatch/**/patterns.js',
    'that.you.would.like.to.search.for',
    'All patterns should expand to files.js'
  ],
  'editor': 'path/to/your/favorite/editor'
};
```
[minimatch][minimatch] info can be found [here][minimatch].

[minimatch]: https://github.com/isaacs/minimatch

### Shortucts

#### Windows
On Windows, I created a shortcut

- Right click `finder.js`
- Create shortcut
- Specify program to be `path/to/node.exe`

Once the shortuct was created, I editted it again and bound it to the global hotkey of `ctrl+alt+o`.

This allowed me to press that key combination and be prompted for the file I wanted to open.

#### Non-Windows platforms
On other platforms, I began using [Sublime Text 2][subl]'s `Find in project` functionality and no longer had a need for this.

If you know how to set it up, please submit a pull request with instructions.

[subl]: http://www.sublimetext.com/2
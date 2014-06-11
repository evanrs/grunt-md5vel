# grunt-md5vel

[Grunt][grunt] plugin for generating `MD5` filenames.

## Getting Started

Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-md5vel`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-md5vel');
```

Then specify what files you want to generate an md5 filename in your config:

```javascript
grunt.initConfig({
  md5vel: {
    compile: {
      files: [{
        'dest/folder/': 'src/file'
      }],
      options: {
        /** `prefix`, `suffix`, `hash`, `extension`, `template` accept `string`, `function` and `object`
         * @type {String, Object, Function, void}
         * Where object is keyed by the original value, such that the destinations file extension would become `new.dist.js` with the option `{ 'js': 'new.dist.js' }` for `script.js`
         */
        prefix: '', // defaults to current basename of file,
        hash: function(hash){
          return hash.substr(0,8)
        },
        suffix: '',
        extension: 'ext' || {
          'js': 'my.js',
          'css': 'our.css'
        } 
        template: _.template(
          "<%= _.filter([prefix, hash, suffix]).join(delimiter) %>" +
          "<%= extension? '.':'' %><%= extension %>")

        /**
         * Called before determing the filename
         * @param  {Object} filename Contains filename compontents { 
         *                              prefix 
         *                              hash
         *                              suffix
         *                              extension 
         *                              template 
         *                            }
         */
        beforeEach: function (filename, options){}

        /**
         * A callback after each file is written describing the change
         * @param  {Object} fileChange {
         *                               newPath
         *                               oldPath
         *                               content
         *                             }
         */
        afterEach: function (fileChange) {},

        /**
         * A callback after all files are written with a summary of writes
         * @param  {[Object]} fileChanges [{newPath, oldPath, content}, …}]
         */
        after: function (fileChanges) {}

      }
    }
  }
});
```

[grunt]: https://github.com/cowboy/grunt
[getting_started]: https://github.com/cowboy/grunt/blob/master/docs/getting_started.md

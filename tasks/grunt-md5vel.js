/*
 * grunt-md5vel
 * https://github.com/evanrs/grunt-md5vel
 */
/*global _:true, require:true*/

var crypto = require('crypto');

var _ = require('lodash');

var __template = _.template(
  "<%= _.filter([prefix, hash, suffix]).join(delimiter) %>" +
  "<%= extension ? '.' + extension :'' %>");

function resolveProperty (attribute, original, context){
  if(_.isUndefined(attribute))
    attribute = original

  else if (_.isString(attribute))
    attribute = attribute

  else if (_.isFunction(attribute))
    attribute = attribute.call(this, original, context)

  else if (attribute[original] !== void 0)
    attribute = resolveProperty.call(this, attribute[original], original, context)

  return attribute;
}

module.exports = function(grunt) {
  'use strict';

  // TODO: ditch this when grunt v0.4 is released
  grunt.util = grunt.util || grunt.utils;

  var _ = grunt.util._;
  var path = require('path');

  grunt.registerMultiTask('md5vel', 'Generate a md5 filename', function() {
    // file object : {newPath: /***/, oldPath: /***/, content: /***/}
    var currentFile;
    var options = this.options({
      encoding: null
    });

    var context = this;

    grunt.verbose.writeflags(options, 'Options');

    // Keep track of processedFiles so we can call the `after` callback if needed.
    var processedFiles = [];

    this.files.forEach(function(filePair) {
      var isExpandedPair = filePair.orig.expand || false;

      if (typeof filePair.src === 'undefined') {
        grunt.fail.warn('Files object doesn\'t exist');
      }

      filePair.src.filter(function(filepath) {
        return grunt.file.isFile(filepath);
      })
      .forEach(function(srcFile) {
        try {
          var srcCode = grunt.file.read(srcFile, {encoding: options.encoding});

          var filename, destFile;

          var filename = {
            algorithm: resolveProperty(options.algorithm, 'md5'),
            delimiter: '-',
            extension: path.extname(srcFile).replace('.', ''),
            hash: '',
            prefix: path.basename(srcFile, path.extname(srcFile)),
            suffix: '',
            template: __template
          }

          filename.hash = crypto.
              createHash(filename.algorithm).
              update(srcCode, options.encoding).
              digest('hex')

          _.each(filename, function(v, k, c){
            filename[k] = resolveProperty.call(context, options[k], v, c)
          })

          if(_.isFunction(options.beforeEach)) {
              options.beforeEach.call(context, filename, options)
          }

          filename.name = filename.template(filename)

          var regex = new RegExp(escapeRegExp(path.basename(srcFile)) + "$");
          if (detectDestType(filePair.dest) === 'directory') {
            destFile = (isExpandedPair) ?
              filePair.dest.replace(regex, filename)
            : unixifyPath(path.join(filePair.dest, filename.name));
          } else {
            destFile = filePair.dest.replace(regex, filename.name);
          }

          grunt.file.copy(srcFile, destFile);

          filename.paths = {
            dest: destFile,
            src: srcFile
          }

          // for callback after each file
          if (_.isFunction(options.afterEach)) {
            options.afterEach.call(context, filename, options);
          }

          if (_.isFunction(options.after)) {
            processedFiles.push(currentFile);
          }

          grunt.log.writeln('File \'' + destFile + '\' created.');
        } catch(err) {
          grunt.log.error(err);
          grunt.fail.warn('Fail to generate an MD5 file name');
        }
      });
    });

    // call `after` if defined
    if (_.isFunction(options.after)) {
      options.after.call(context, processedFiles, options);
    }
  });

  // From grunt-contrib-copy
  var detectDestType = function(dest) {
    if (grunt.util._.endsWith(dest, '/')) {
      return 'directory';
    } else {
      return 'file';
    }
  };

  // From grunt-contrib-copy
  var unixifyPath = function(filepath) {
    if (process.platform === 'win32') {
      return filepath.replace(/\\/g, '/');
    } else {
      return filepath;
    }
  };

  // http://stackoverflow.com/a/3561711
  var escapeRegExp = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  };
};


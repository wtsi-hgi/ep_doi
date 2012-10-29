/*
 * Copyright (c) 2012 Genome Research Ltd.
 *
 * Author: Joshua C. Randall <jcrandall@alum.mit.edu>
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU General Public License as published by the Free Software
 * Foundation; either version 3 of the License, or (at your option) any later
 * version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 *
 */

/* used for escapeHTMLAttribute */
var Security = require('ep_etherpad-lite/static/js/security.js');

/* Regular expression to identify a a doi identifier (e.g. doi:10.1234/232) */
var doiHrefRegexp = new RegExp(/((info:doi\/|doi\:)([^\ \t]+?))([\ \t\]\}\)]|$)/g);


var linkSanitizingFn = function(result) {
  if(!result) return result;
  var s = result[1];
  result[0] = s
  return result;
};


var CustomRegexp = function(regexp, sanitizeResultFn) {
  this.regexp = regexp;
  this.sanitizeResultFn = sanitizeResultFn;
};


CustomRegexp.prototype.exec = function(text) {
  var result = this.regexp.exec(text);
  return this.sanitizeResultFn(result);
};


var getCustomRegexpFilter = function(customRegexp, tag, linestylefilter) {
  var filter =  linestylefilter.getRegexpFilter(customRegexp, tag);
  return filter;
};


exports.aceCreateDomLine = function(name, context) {
  var doiHref;
  var cls = context.cls;
  var domline = context.domline;
  console.debug("ep_doi.aceCreateDomLine: cls = %s domline = %s", cls, domline);

  if (cls.indexOf('doiHref') >= 0) {
    cls = cls.replace(/(^| )doiHref:(\S+)/g, function(x0, space, url) {
      doiHref = url;
      return space + "url";
    });
  }

  if (doiHref) {
    var url = doiHref.replace(/^(info:doi\/|doi\:)/, 'http://dx.doi.org/');
    var modifier = {
      extraOpenTags: '<a href="' + Security.escapeHTMLAttribute(url) +'">',
      extraCloseTags: '</a>',
      cls: cls
    }
    return [modifier];
  }
  return;
};


exports.aceGetFilterStack = function(name, context) {
  var linestylefilter = context.linestylefilter;
  var filter = getCustomRegexpFilter(
    new CustomRegexp(doiHrefRegexp, linkSanitizingFn),
    'doiHref',
    linestylefilter
  );
  return [filter];
};


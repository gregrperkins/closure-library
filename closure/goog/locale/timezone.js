// Copyright 2008 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Functions to provide timezone information for use with
 * date/time format.
*
 */

goog.provide('goog.locale.TimeZone');

goog.require('goog.locale');
goog.require('goog.string');

/**
 * TimeZone class implemented a time zone resolution and name information
 * source for client applications. The time zone object is initiated from
 * a time zone information array. Application can initiate a time zone
 * statically, or it may choose to initiate from a data obtained from server.
 * Each time zone information array is small, but the whole set of data
 * is too much for client application to download. If end user is allowed to
 * change time zone setting, dynamic retrieval should be the method to use.
 * In case only time zone offset is known, there is a decent fallback
 * that only use the time zone offset to create a TimeZone object.
 * A whole set of time zone information array was available under
 * http://go/js_locale_data.  It is generated based on CLDR and
 * Olson time zone data base (through pytz), and will be updated timely.
 *
 * @constructor
 * @deprecated Use goog.i18n.TimeZone.
 */
goog.locale.TimeZone = function() {
  /**
   * The standard time zone id.
   * @type {string}
   * @private
   */
  this.timeZoneId_;


  /**
   * The standard, non-daylight time zone offset.
   * @type {number}
   * @private
   */
  this.standardOffset_;


  /**
   * An array of string that can have 2 or 4 elements, long and short names for
   * standard time zone, and long and short names for daylight time zone if it
   * has daylight time transitions.
   * @type {Array}
   * @private
   */
  this.tzNames_;


  /**
   * Daylight/standard time transition array. It lists transition points since
   * 1970 until some year in future. It always in pair of (transition point) +
   * (time zone offset adjustment)
   * @type {Array}
   * @private
   */
  this.transitions_;
};

/**
 * Milliseconds per hour constant.
 * @type {number}
 * @private
 */
goog.locale.TimeZone.MILLISECONDS_PER_HOUR_ = 3600 * 1000;

/**
 * Enum of time zone names. The value will be used as index of in time zone
 * name array.
 * @enum {number}
 * @deprecated Use goog.i18n.TimeZone.NameType.
 */
goog.locale.TimeZone.NameType = {
  STD_SHORT_NAME: 0,
  STD_LONG_NAME: 1,
  DLT_SHORT_NAME: 2,
  DLT_LONG_NAME: 3
};


/**
 * This factory method creates a time zone instance. It takes either a time zone
 * information array or a simple timezone offset. The latter form does not offer
 * the same set of functionalities as first form.
 *
 * @param {number|Array} timeZoneData this parameter could take 2 types,
 *     if it is a number, a simple TimeZone object will be created. Otherwise,
 *     it should be a array that holds all time zone related information.
 * @return {goog.locale.TimeZone} A goog.locale.TimeZone object for the given
 *     time zone data.
 * @deprecated Use goog.i18n.TimeZone.createTimeZone.
 */
goog.locale.TimeZone.createTimeZone = function(timeZoneData) {
  if (typeof timeZoneData == 'number') {
    return goog.locale.TimeZone.createSimpleTimeZone_(timeZoneData);
  }
  var tz = new goog.locale.TimeZone();
  tz.timeZoneId_ = timeZoneData['id'];
  tz.standardOffset_ = -timeZoneData['std_offset'];
  tz.tzNames_ = timeZoneData['names'];
  tz.transitions_ = timeZoneData['transitions'];
  return tz;
};


/**
 * This factory method provides a decent fallback to create a time zone object
 * just based on a given time zone offset.
 * @param {number} timeZoneOffsetInMinutes time zone offset in minutes.
 * @return {goog.locale.TimeZone} A goog.locale.TimeZone object generated by
 *     just using the time zone offset information.
 * @private
 */
goog.locale.TimeZone.createSimpleTimeZone_ = function(timeZoneOffsetInMinutes) {
  var tz = new goog.locale.TimeZone();
  tz.standardOffset_ = timeZoneOffsetInMinutes;
  tz.timeZoneId_ =
      goog.locale.TimeZone.composePosixTimeZoneID_(timeZoneOffsetInMinutes);
  var str = goog.locale.TimeZone.composeUTCString_(timeZoneOffsetInMinutes);
  tz.tzNames_ = [str, str];
  tz.transitions_ = [];
  return tz;
};


/**
 * Generate GMT string given a time zone offset.
 * @param {number} offset time zone offset in minutes.
 * @return {string} GMT string for this offset.
 * @private
 */
goog.locale.TimeZone.composeGMTString_ = function(offset) {
  var parts = ['GMT'];
  parts.push(offset <= 0 ? '+' : '-');
  offset = Math.abs(offset);
  parts.push(goog.string.padNumber(Math.floor(offset / 60) % 100, 2),
             ':', goog.string.padNumber(offset % 60, 2));
  return parts.join('');
};


/**
 * POSIX time zone ID as fallback.
 * @param {number} offset time zone offset in minutes.
 * @return {string} posix time zone id for given offset.
 * @private
 */
goog.locale.TimeZone.composePosixTimeZoneID_ = function(offset) {
  if (offset == 0) {
    return 'Etc/GMT';
  }
  var parts = ['Etc/GMT', offset < 0 ? '-' : '+'];
  offset = Math.abs(offset);
  parts.push(Math.floor(offset / 60) % 100);
  offset = offset % 60;
  if (offset != 0) {
    parts.push(':', goog.string.padNumber(offset, 2));
  }
  return parts.join('');
};


/**
 * Generate UTC string.
 * @param {number} offset time zone offset in minutes.
 * @return {string} UTC string for given offset.
 * @private
 */
goog.locale.TimeZone.composeUTCString_ = function(offset) {
  if (offset == 0) {
    return 'UTC';
  }
  var parts = ['UTC', offset < 0 ? '+' : '-'];
  offset = Math.abs(offset);
  parts.push(Math.floor(offset / 60) % 100);
  offset = offset % 60;
  if (offset != 0) {
    parts.push(':', offset);
  }
  return parts.join('');
};


/**
 * Return the adjustment amount of time zone offset. When daylight time
 * is in effect, this number will be positive. Otherwise, it is zero.
 * @param {Date} date the time to check.
 * @return {number} offset amount.
 * @deprecated Use goog.i18n.TimeZone.prototype.getDaylightAdjustment.
 */
goog.locale.TimeZone.prototype.getDaylightAdjustment = function(date) {
  var timeInMs = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(),
                          date.getUTCDate(), date.getUTCHours(),
                          date.getUTCMinutes());
  var timeInHours = timeInMs / goog.locale.TimeZone.MILLISECONDS_PER_HOUR_;
  var index = 0;
  while (index < this.transitions_.length &&
         timeInHours >= this.transitions_[index]) {
    index += 2;
  }
  return (index == 0) ? 0 : this.transitions_[index - 1];
};


/**
 * Return the GMT representation of this time zone object.
 * @param {Date} date The date for which time to retrieve GMT string.
 * @return {string} GMT representation string.
 * @deprecated Use goog.i18n.TimeZone.prototype.getGMTString.
 */
goog.locale.TimeZone.prototype.getGMTString = function(date) {
  return goog.locale.TimeZone.composeGMTString_(this.getOffset(date));
};


/**
 * To get long time zone name for given date.
 * @param {Date} date The Date object for which time to retrieve long time
 *     zone name.
 * @return {string} long time zone name.
 * @deprecated Use goog.i18n.TimeZone.prototype.getLongName.
 */
goog.locale.TimeZone.prototype.getLongName = function(date) {
  return this.tzNames_[this.isDaylightTime(date) ?
      goog.locale.TimeZone.NameType.DLT_LONG_NAME :
      goog.locale.TimeZone.NameType.STD_LONG_NAME];
};


/**
 * To get time zone offset (in minutes) relative to UTC for given date.
 * To be consistent with JDK/Javascript API, west of Greenwich will be
 * positive.
 *
 * @param {Date} date The date for which time to retrieve time zone offset.
 * @return {number} time zone offset in minutes.
 * @deprecated Use goog.i18n.TimeZone.prototype.getOffset.
 */
goog.locale.TimeZone.prototype.getOffset = function(date) {
  return this.standardOffset_ - this.getDaylightAdjustment(date);
};


/**
 * To get RFC representation of certain time zone name for given date.
 * @param {Date} date The Date object for which time to retrieve RFC time
 *     zone string.
 * @return {string} RFC time zone string.
 * @deprecated Use goog.i18n.TimeZone.prototype.getRFCTimeZoneString.
 */
goog.locale.TimeZone.prototype.getRFCTimeZoneString = function(date) {
  var offset = -this.getOffset(date);
  var parts = [offset < 0 ? '-' : '+'];
  offset = Math.abs(offset);
  parts.push(goog.string.padNumber(Math.floor(offset / 60) % 100, 2),
             goog.string.padNumber(offset % 60, 2));
  return parts.join('');
};


/**
 * To get short time zone name for given date.
 * @param {Date} date The date for which time to retrieve short time zone.
 * @return {string} short time zone name.
 * @deprecated Use goog.i18n.TimeZone.prototype.getShortName.
 */
goog.locale.TimeZone.prototype.getShortName = function(date) {
  return this.tzNames_[this.isDaylightTime(date) ?
      goog.locale.TimeZone.NameType.DLT_SHORT_NAME :
      goog.locale.TimeZone.NameType.STD_SHORT_NAME];
};


/**
 * Return time zone id for this time zone.
 * @return {string} time zone id.
 * @deprecated Use goog.i18n.TimeZone.prototype.getTimeZoneId.
 */
goog.locale.TimeZone.prototype.getTimeZoneId = function() {
  return this.timeZoneId_;
};


/**
 * Check if the given time fall within daylight saving period.
 * @param {Date} date time for which to check.
 * @return {boolean} true if daylight time in effect.
 * @deprecated Use goog.i18n.TimeZone.prototype.isDaylightTime.
 */
goog.locale.TimeZone.prototype.isDaylightTime = function(date) {
  return this.getDaylightAdjustment(date) > 0;
};


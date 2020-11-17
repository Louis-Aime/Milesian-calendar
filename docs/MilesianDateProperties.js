/* Milesian properties added to Date
	Character set is UTF-8
	This code, to be manually imported, set properties to object Date for the Milesian calendar.
Versions
	M2017-12-16 : replace CalendarCycleComputationEngine with CBCCE
	M2018-05-19 : create getUTCMilesianDate, getMilesianUTCDate to be deprecated 
	M2018-10-26 : delete getMilesianUTCDate (deprecated)
	M2018-11-06	: manage display of out-of-range date
	M2018-11-11 : JSDoc comments
	M2018-11-16 : replace getTimezoneOffset with getRealTZmsOffset
	M2019-01-13 : change intercalation rule to Gregorian
	M2019-07-27 : adapt to getRealTZmsOffset located in another package
	M2020-01-12 : strict mode
Required
	Package CBCCE.
	getRealTZmsOffset method.
Contents
	getMilesianDate : the day date as a three elements object: .year, .month, .date; .month is 0 to 11. Conversion is in local time.
	getUTCMilesianDate : same as above, in UTC time.
	setTimeFromMilesian (year, month, date, hours, minutes, seconds, milliseconds) : set Time from milesian date + local hour.
	setUTCTimeFromMilesian (year, month, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
	toIntlMilesianDateString : return a string with the date elements in Milesian: (day) (month)"m" (year), month 1 to 12.
	toUTCIntlMilesianDateString : same as above, in UTC time zone.
*/
/* Copyright Miletus 2016-2020 - Louis A. de FOUQUIERES
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
	1. The above copyright notice and this permission notice shall be included
	in all copies or substantial portions of the Software.
	2. Changes with respect to any former version shall be documented.

The software is provided "as is", without warranty of any kind,
express of implied, including but not limited to the warranties of
merchantability, fitness for a particular purpose and noninfringement.
In no event shall the authors of copyright holders be liable for any
claim, damages or other liability, whether in an action of contract,
tort or otherwise, arising from, out of or in connection with the software
or the use or other dealings in the software.
Inquiries: www.calendriermilesien.org
*/
"use strict";
/*
 1. Basic tool of this package
*/
/** The parameters for the Cycle Based Calendar Computation Engine (CBCCE)
 * that describes the Milesian calendar with respect to Posix time.
*/
var Milesian_time_params = { // To be used with a Unix timestamp in ms. Decompose into Milesian years, months, date, hours, minutes, seconds, ms
	timeepoch : -62168083200000, // Unix timestamp of 1 1m 000 00h00 UTC in ms
	coeff : [ 
	  {cyclelength : 12622780800000, ceiling : Infinity, subCycleShift : 0, multiplier : 400, target : "year"},
	  {cyclelength : 3155673600000, ceiling :  3, subCycleShift : 0, multiplier : 100, target : "year"},
	  {cyclelength : 126230400000, ceiling : Infinity, subCycleShift : 0, multiplier : 4, target : "year"},
	  {cyclelength : 31536000000, ceiling : 3, subCycleShift : 0, multiplier : 1, target : "year"},
	  {cyclelength : 5270400000, ceiling : Infinity, subCycleShift : 0, multiplier : 2, target : "month"},
	  {cyclelength : 2592000000, ceiling : 1, subCycleShift : 0, multiplier : 1, target : "month"}, 
	  {cyclelength : 86400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "date"},
	  {cyclelength : 3600000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "hours"},
	  {cyclelength : 60000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "minutes"},
	  {cyclelength : 1000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "seconds"},
	  {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "milliseconds"}
	],
	canvas : [ 
		{name : "year", init : 0},
		{name : "month", init : 0},
		{name : "date", init : 1},
		{name : "hours", init : 0},
		{name : "minutes", init : 0},
		{name : "seconds", init : 0},
		{name : "milliseconds", init : 0},
	]
}
/*
 2. Methods added to Date object for Milesian dates
*/
/** Compose a date object with the figures of the Milesian date in local time. 
 * @method getMilesianDate
 * @return {{year:number,month:number,date:number,hours:number,minutes:number,seconds:number,milliseconds:number}} 
 * the figures of the Milesian date in local time, in a compound object
*/
Date.prototype.getMilesianDate = function () {
  return cbcceDecompose (this.getTime() - (this.getRealTZmsOffset()), Milesian_time_params);
}
/** Compose a date object with the figures of the Milesian date in UTC time. 
 * @method getUTCMilesianDate
 * @return {{year:number,month:number,date:number,hours:number,minutes:number,seconds:number,milliseconds:number}} 
 * the figures of the Milesian date in UTC time, in a compound object
*/
Date.prototype.getUTCMilesianDate = function () {
  return cbcceDecompose (this.getTime(), Milesian_time_params);
}
/** Modify date object with the figures of the Milesian date in local time. 
 * @method setTimeFromMilesian
 * @param {number} year - Milesian year, in local time. Always the real year, 2-digit year means 1st century
 * @param {number} month - Milesian month number, 0 to 11
 * @param {number} date - Milesian date in month, 1 to 31
 * @param {number} hours - hour in day, local time, used as in .setHours(), by default: hour of current time
 * @param {number} minutes - minutes in local time, used as in .setHours(), by default: minutes of current time
 * @param {number} seconds - seconds in local time, used as in .setHours(), by default: seconds of current time
 * @param {number} milliseconds - milliseconds of local time, used as in .setHours(), by default: milliseconds of current time
 * @return {number} date value of the modified date object, computed after the given Milesian date in local time
*/
Date.prototype.setTimeFromMilesian = 
	function (year, month, date, hours = this.getHours(), minutes = this.getMinutes(), 
			seconds = this.getSeconds(), milliseconds = this.getMilliseconds()) {
	  this.setTime(cbcceCompose({
		  'year' : year, 'month' : month, 'date' : date, 'hours' : 0, 'minutes' : 0, 'seconds' : 0, 'milliseconds' : 0
		  }, Milesian_time_params));			// Date is first specified at midnight UTC.
	  this.setHours (hours, minutes, seconds, milliseconds); // Then hour part is specified
	  return this.valueOf();
}
/** Modify date object with the figures of the Milesian date in UTC time. 
 * @method setUTCTimeFromMilesian
 * @param {number} year - Milesian year, in UTC time. Always the real year, 2-digit year means 1st century
 * @param {number} month - Milesian month number, 0 to 11, default 0
 * @param {number} date - Milesian date in month, 1 to 31, default 1
 * @param {number} hours - hour in day, UTC time, used as in .setHours(), by default: hour of current time
 * @param {number} minutes - minutes in UTC time, used as in .setHours(), by default: minutes of current time
 * @param {number} seconds - seconds in UTC time, used as in .setHours(), by default: seconds of current time
 * @param {number} milliseconds - milliseconds of UTC time, used as in .setHours(), by default: milliseconds of current time
 * @return {number} date value of the modified date object, computed after the given Milesian date in UTC time
*/
Date.prototype.setUTCTimeFromMilesian = 
  function (year, month = 0, date = 1,
		   hours = this.getUTCHours(), minutes = this.getUTCMinutes(), seconds = this.getUTCSeconds(),
		   milliseconds = this.getUTCMilliseconds()) {
	  this.setTime(cbcceCompose({
		  'year' : year, 'month' : month, 'date' : date, 'hours' : hours, 'minutes' : minutes, 'seconds' : seconds,
		  'milliseconds' : milliseconds
		  }, Milesian_time_params));
	   return this.valueOf();
}
/** Compute a string representing the Milesian date (local time) in international notation
 * @method toIntlMilesianDateString
 * @return {string} a date in the form \d m'm' [-]yyy\, example: 1 1m 009 
*/
Date.prototype.toIntlMilesianDateString = function () {
	var dateElements = cbcceDecompose (this.getTime()- (this.getRealTZmsOffset()), Milesian_time_params );
	let absYear = Math.abs(dateElements.year);
	return isNaN(dateElements.year) ? "Invalid Date" : dateElements.date+" "+(++dateElements.month)+"m "
		+ ((dateElements.year < 0) ? "-": "") 
		+ ((absYear < 100) ? "0" : "") + ((absYear < 10) ? "0" : "") + absYear; 
}
/** Compute a string representing the Milesian date (UTC time) in international notation
 * @method toUTCIntlMilesianDateString
 * @return {string} a date in the form \d m'm' [-]yyy\, example: 1 1m 009 
*/
Date.prototype.toUTCIntlMilesianDateString = function () {
	var dateElements = cbcceDecompose (this.getTime(), Milesian_time_params );
	let absYear = Math.abs(dateElements.year);
	return isNaN(dateElements.year) ? "Invalid Date" : dateElements.date+" "+(++dateElements.month)+"m "
		+ ((dateElements.year < 0) ? "-": "") 
		+ ((absYear < 100) ? "0" : "") + ((absYear < 10) ? "0" : "") + absYear; 
}

/* French revolutionary calendar properties added to Date object
Character set is UTF-8
This code, to be manually imported, set properties to object Date for the French Revolutionary calendar.
Versions 
	M2017-12-26
	M2018-05-19 : create getUTCFrenchRevDate, getFrenchRevUTCDate to be deprecated 
	M2018-10-26 : getFrenchRevUTCDate deprecated
	M2018-11-06	: manage display of out-of-range date
	M2018-11-11 : JSDocs comments
	M2018-11-16 : adapt to time zone computation
Required
	Package CBCCE.
Contents
	getFrenchRevDate : the day date as a three elements object: .year, .month, .date; .month is 0 to 11. Conversion is in local time.
	getUTCFrenchRevDate : same as above, in UTC time.
	setTimeFromFrenchRev (year, month, date, hours, minutes, seconds, milliseconds) : set Time from julian calendar date + local hour.
	setUTCTimeFromFrenchRev (year, month, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
	toIntlFrenchRevDateString : return a string with the date elements in Republican calendar: (day number) / (month number) / (year), month 1 to 12.
	toUTCIntlFrenchRevDateString : same as above, in UTC time zone.	
*/
/* Copyright Miletus 2017-2018 - Louis A. de Fouquières
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
/*
 1. Basic tools of this package
*/
/** The parameters for the Cycle Based Calendar Computation Engine (CBCCE)
 * that describes the French Revolutionary calendar with respect to Posix time.
 * A 128-years cycle composed of 3 33-years cycles (one 5-years franciade after 7 4-years) and 1 29-years cycle (one 5-years franciade after 6 4-years)
 * Origin : 3 10m 1779
*/
var FrenchRev_time_params = { // To be used with a Unix timestamp in ms. Decompose into years, months, date, hours, minutes, seconds, ms
	timeepoch : -6004454400000, // Unix timestamp of 3 10m 1779 00h00 UTC in ms, the origin for the algorithm
	coeff : [ 
	  {cyclelength : 4039286400000, ceiling : Infinity, subCycleShift : 0, multiplier : 128, target : "year"}, // 128 (julian) years minus 1 day.
	  {cyclelength : 1041379200000, ceiling : 3, subCycleShift : -1, multiplier : 33, target : "year"}, // 33 years cycle. Last franciade is 5 years.
		// The 33-years cycle contains 7 4-years franciades, and one 5-years. 
		// subCycleShift set to -1 means: if the 33-years is the last one of the 128-years cycle, i.e. number 3 starting from 0,
		// then it turns into a 7 franciades cycle, the first 6 being 4-years, the 7th (instead of the 8th) is 5-years.
	  {cyclelength : 126230400000, ceiling : 7, subCycleShift : +1, multiplier : 4, target : "year"}, 	//The ordinary "Franciade" (4 years)
		// Same principle as above: if franciade is the last one (#7 or #6 starting form #0) of upper cycle, then it is 5 years long instead of 4 years.
	  {cyclelength : 31536000000, ceiling : 3, subCycleShift : 0, multiplier : 1, target : "year"},	//The ordinary year within the franciade
	  {cyclelength : 2592000000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}, 
	  {cyclelength : 86400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "date"},
	  {cyclelength : 3600000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "hours"},
	  {cyclelength : 60000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "minutes"},
	  {cyclelength : 1000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "seconds"},
	  {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "milliseconds"}
	],
	canvas : [ 
		{name : "year", init : -12},
		{name : "month", init : 0},
		{name : "date", init : 1},
		{name : "hours", init : 0},
		{name : "minutes", init : 0},
		{name : "seconds", init : 0},
		{name : "milliseconds", init : 0},
	]
}
/*
2. Methods added to Date object for French Revolutionary dates
*/
/** Compose a date object with the figures of the Republican date in local time. 
 * @method getFrenchRevDate
 * @return {{year:number,month:number,date:number,hours:number,minutes:number,seconds:number,milliseconds:number}} 
 * the figures of the Republican date in local time, in a compound object
*/
Date.prototype.getFrenchRevDate = function () {
  return cbcceDecompose (this.getTime() - (this.getRealTZmsOffset()), FrenchRev_time_params);
}
/** Compose a date object with the figures of the Republican date in UTC time. 
 * @method getUTCFrenchRevDate
 * @return {{year:number,month:number,date:number,hours:number,minutes:number,seconds:number,milliseconds:number}} 
 * the figures of the Republican date in UTC time, in a compound object
*/
Date.prototype.getUTCFrenchRevDate = function () {
  return cbcceDecompose (this.getTime(), FrenchRev_time_params);
}
/** Modify date object with the figures of the Republican date in local time. 
 * @method setTimeFromFrenchRev
 * @param {number} year - Republican year, in local time. Always the real year, 2-digit year means 1st century
 * @param {number} month - Republican month number, 0 to 11
 * @param {number} date - Republican date in month, 1 to 31
 * @param {number} hours - hour in day, local time, used as in .setHours(), by default: hour of current time
 * @param {number} minutes - minutes in local time, used as in .setHours(), by default: minutes of current time
 * @param {number} seconds - seconds in local time, used as in .setHours(), by default: seconds of current time
 * @param {number} milliseconds - milliseconds of local time, used as in .setHours(), by default: milliseconds of current time
 * @return {number} date value of the modified date object, computed after the given Republican date in local time
*/
Date.prototype.setTimeFromFrenchRev = 
  function (year, month, date, hours = this.getHours(), minutes = this.getMinutes(), 
			seconds = this.getSeconds(),milliseconds = this.getMilliseconds()) {
	  this.setTime(cbcceCompose({
		  'year' : year, 'month' : month, 'date' : date, 'hours' : 0, 'minutes' : 0, 'seconds' : 0, 'milliseconds' : 0
		  }, FrenchRev_time_params));			// Date is first specified at midnight UTC.
	  this.setHours (hours, minutes, seconds, milliseconds); // Then hour part is specified
	  return this.valueOf();
}
/** Modify date object with the figures of the Republican date in UTC time. 
 * @method setUTCTimeFromFrenchRev
 * @param {number} year - Republican year, in UTC time. Always the real year, 2-digit year means 1st century
 * @param {number} month - Republican month number, 0 to 11, default 0
 * @param {number} date - Republican date in month, 1 to 31, default 1
 * @param {number} hours - hour in day, UTC time, used as in .setHours(), by default: hour of current time
 * @param {number} minutes - minutes in UTC time, used as in .setHours(), by default: minutes of current time
 * @param {number} seconds - seconds in UTC time, used as in .setHours(), by default: seconds of current time
 * @param {number} milliseconds - milliseconds of UTC time, used as in .setHours(), by default: milliseconds of current time
 * @return {number} date value of the modified date object, computed after the given Republican date in UTC time
*/
Date.prototype.setUTCTimeFromFrenchRev = 
  function (year, month = 0, date = 1, hours = this.getUTCHours(), minutes = this.getUTCMinutes(), 
			seconds = this.getUTCSeconds(), milliseconds = this.getUTCMilliseconds()) {
	  this.setTime(cbcceCompose({
		  'year' : year, 'month' : month, 'date' : date, 'hours' : hours, 'minutes' : minutes, 'seconds' : seconds,
		  'milliseconds' : milliseconds
		  }, FrenchRev_time_params));
	  return this.valueOf();
}
/** Compute a string representing the Republican date (local time) in numeric notation
 * @method toIntlFrenchRevDateString
 * @return {string} a date in the form \d m [-]yyy\, example: 1/1/-1780 
*/
Date.prototype.toIntlFrenchRevDateString = function () {
	var dateElements = cbcceDecompose (this.getTime()- this.getRealTZmsOffset(), FrenchRev_time_params );
	return isNaN(dateElements.year) ? "Invalid Date" : dateElements.date+"/"+(++dateElements.month)+"/"+dateElements.year;
}
/** Compute a string representing the Republican date (UTC time) in numeric notation
 * @method toUTCIntlFrenchRevDateString
 * @return {string} a date in the form \d m [-]y\, example: 1/1/-1780 
*/
Date.prototype.toUTCIntlFrenchRevDateString = function () {
	var dateElements = cbcceDecompose (this.getTime(), FrenchRev_time_params );
	return isNaN(dateElements.year) ? "Invalid Date" : dateElements.date+"/"+(++dateElements.month)+"/"+dateElements.year;
}
/* ISO 8601 week calendar properties added to Date object
Character set is UTF-8
This code, to be manually imported, set properties to object Date for the ISO week calendar, which is the calendar implied by ISO 8601.
Versions
	M2017-12-26 : replace CalendarCycleComputationEngine with CBCCE
	M2018-05-19 : set alias to getIsoWeekCalUTCDate (to be deprecated): getUTCIsoWeekCalDate
	M2018-10-26 : delete getIsoWeekCalUTCDate (deprecated)
	M2018-11-03 : set reference year to Gregorian year only, and improve toString presentations
	M2018-11-06	: manage display of out-of-range date
	M2018-11-11 : JSDocs comments
	M2018-11-16 : adapt to time zone computation
	M2019-06-12 : fix year setting for years 0 to 100
	M2019-07-27 : adapt to getRealTZmsOffset located in another package
	M2020-01-12 : strict mode
Required
	Package CBCCE.
	getRealTZmsOffset method.
Contents
	getIsoWeekCalDate : the day date as a three elements object: .year, .week, .date; .week is 1 to 53. Conversion is in local time.
	getUTCIsoWeekCalDate : same as above, in UTC time.
	setTimeFromIsoWeekCal (year, week, date, hours, minutes, seconds, milliseconds) : set Time from ISO week calendar date + local hour.
	setUTCTimeFromIsoWeekCal (year, week, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
	toIsoWeekCalDateString : return a string with the date elements in IsoWeekCal: yyyy-Www-dd
	toUTCIsoWeekCalDateString : same as above, in UTC time zone.
*/
/* Copyright Miletus 2016-2020 - Louis A. de Fouquières
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
 1. Basic tools of this package
*/
/** The parameters for the Cycle Based Calendar Computation Engine (CBCCE)
 * in order to decompose a Posix time within a (Gregorian) year in week number and day.
*/
var
isoWeekCalendar_params = {
	timeepoch : 0, // 
	coeff : [ 
		{cyclelength : 604800000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "week"},
		{cyclelength : 86400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "day"},
		{cyclelength : 3600000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "hours"},
		{cyclelength : 60000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "minutes"},
		{cyclelength : 1000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "seconds"},
		{cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "milliseconds"}
	],
		canvas : [ 
		{name : "week", init : 1},
		{name : "day", init : 1},
		{name : "hours", init : 0},
		{name : "minutes", init : 0},
		{name : "seconds", init : 0},
		{name : "milliseconds", init : 0},
	]
};
/*
 2. Properties added to Date object for ISO week calendar
*/
/** yields the time stamp monday 00:00 first moment of the first ISO week in given year.
 * @param {number} year - the Gregorian year whose ISO week origin is searched for
 * @return {number} - time stamp, result of computation.
*/
function isoWeekCalendarBase (year) { 			// 
	let referenceDate = new Date (Date.UTC(year, 0, 4));	// 4th January is always in first ISO week of year.
	referenceDate.setUTCFullYear(year); 			// Year is always a full year, 98 means 98 years A.D., not 1998.	
	return referenceDate.valueOf() 
		- ((referenceDate.getUTCDay() + 6) % 7)* Chronos.DAY_UNIT // Substract weekday number - 1 (+6) modulo 7 in order to come back to last monday
}
/** Compose a date object with the figures of the ISO week calendar date in local time. 
 * @method getIsoWeekCalDate
 * @return {{year:number, week:number, day:number, hours:number, minutes:number, seconds:number, milliseconds:number}} 
 * the figures of the ISO week calendar date in local time, in a compound object
*/
Date.prototype.getIsoWeekCalDate = function () {
	let base = new Date (this.valueOf() + 3 * Chronos.DAY_UNIT); // Gregorian year of "base" is ISO week year of "this", or possibly one unit more.
	let year = base.getFullYear(); 
	base = new Date (isoWeekCalendarBase(year));	// This is the first day of tentative ISO week year.
	if (base.valueOf() > this.valueOf() - this.getRealTZmsOffset()) // If "this" is before the first day of tentative ISO year...
		base.setTime (isoWeekCalendarBase(--year)); //... then set base of ISO year one year before.
	let compoundDate = cbcceDecompose (this.valueOf() - this.getRealTZmsOffset() - base.valueOf(), isoWeekCalendar_params);
	// Here we have computed the day-of-week, week number, and time of day elements within the year.
	Object.defineProperty (compoundDate, "year", {enumerable : true, writable : true, 
		value : (!isNaN(compoundDate.day) ? year : NaN)}); // Assign year in compound record. If computed compound is NaN, extend to year
	return compoundDate;
}
/** Compose a date object with the figures of the ISO week calendar date in UTC time. 
 * @method getUTCIsoWeekCalDate
 * @return {{year:number, week:number, day:number, hours:number, minutes:number, seconds:number, milliseconds:number}} 
 * the figures of the ISO week calendar date in UTC time, in a compound object
*/
Date.prototype.getUTCIsoWeekCalDate = function () {
	let base = new Date (this.valueOf() + 3 * Chronos.DAY_UNIT); // Gregorian year of "base" is ISO week year of "this", or possibly one unit more.
	let year = base.getUTCFullYear(); 
	base = new Date (isoWeekCalendarBase(year));	// This is the first day of ISO week year.
	if (base.valueOf() > this.valueOf()) 			// If "this" is before the first day of tentative ISO year...
		base.setTime (isoWeekCalendarBase(--year));	//... then set base of ISO year one year before.
	let compoundDate = cbcceDecompose (this.valueOf() - base.valueOf(), isoWeekCalendar_params);
	// Here we have computed the day-of-week, week number, and time of day elements within the year.	
	Object.defineProperty (compoundDate, "year", {enumerable : true, writable : true, 
		value : (!isNaN(compoundDate.day) ? year : NaN)}); // Assign year in compound record. If computed compound is NaN, extend to year
	return compoundDate;
}
/** Modify date object with the figures of the ISO week calendar date in local time. 
 * @method setTimeFromIsoWeekCal
 * @param {number} year - ISO week calendar year, in local time. Always the real year, 2-digit year means 1st century
 * @param {number} week - ISO week calendar week number, 1 to 53
 * @param {number} date - ISO week calendar date in month, 1 to 7
 * @param {number} hours - hour in day, local time, used as in .setHours(), by default: hour of current time
 * @param {number} minutes - minutes in local time, used as in .setHours(), by default: minutes of current time
 * @param {number} seconds - seconds in local time, used as in .setHours(), by default: seconds of current time
 * @param {number} milliseconds - milliseconds of local time, used as in .setHours(), by default: milliseconds of current time
 * @return {number} date value of the modified date object, computed after the given ISO week calendar date in local time
*/
Date.prototype.setTimeFromIsoWeekCal = 
  function (year, week, day, hours = this.getHours(), minutes = this.getMinutes(), 
			seconds = this.getSeconds(), milliseconds = this.getMilliseconds()) { 
    this.setTime(isoWeekCalendarBase(year) + cbcceCompose({		// Set ISO week calendar date at 00:00 UTC. The year begins at isoWeekCalendarBase.
	  'week' : week, 'day' : day, 'hours' : 0, 'minutes' : 0, 'seconds' : 0, 'milliseconds' : 0 }, isoWeekCalendar_params));
	this.setHours (hours, minutes, seconds, milliseconds);		// Then set hour of the day
	return this.valueOf();
}
/** Modify date object with the figures of the ISO week calendar date in UTC time. 
 * @method setUTCTimeFromIsoWeekCal
 * @param {number} year - ISO week calendar year, in UTC time. Always the real year, 2-digit year means 1st century
 * @param {number} week - ISO week calendar week number, 1 to 53, default 1
 * @param {number} date - ISO week calendar date in month, 1 to 7, default 1
 * @param {number} hours - hour in day, UTC time, used as in .setHours(), by default: hour of current time
 * @param {number} minutes - minutes in UTC time, used as in .setHours(), by default: minutes of current time
 * @param {number} seconds - seconds in UTC time, used as in .setHours(), by default: seconds of current time
 * @param {number} milliseconds - milliseconds of UTC time, used as in .setHours(), by default: milliseconds of current time
 * @return {number} date value of the modified date object, computed after the given ISO week calendar date in UTC time
*/
Date.prototype.setUTCTimeFromIsoWeekCal = 
  function (year, week = 1, day = 1, hours = this.getUTCHours(), minutes = this.getUTCMinutes(), 
			seconds = this.getUTCSeconds(), milliseconds = this.getUTCMilliseconds()) {
    this.setTime(isoWeekCalendarBase (year) + cbcceCompose({
	  'week' : week, 'day' : day, 'hours' : hours, 'minutes' : minutes, 'seconds' : seconds,
	  'milliseconds' : milliseconds
	  }, isoWeekCalendar_params));
	return this.valueOf();
}
/** Compute a string representing the ISO week date (local time) in standardized notation
 * @method toIsoWeekCalDateString
 * @return {string} a date in the form [-]yyy-Www-d  example: 2000-W42-6 
*/
Date.prototype.toIsoWeekCalDateString = function () { //return a string with the date elements in IsoWeekCal: #yyy-Www-d
	var dateElements = this.getIsoWeekCalDate();
	let absYear = Math.abs(dateElements.year);
	return isNaN(dateElements.year)
		? "Invalid Date"
		: ((dateElements.year < 0) ? "-": "") 
			+ ((absYear < 100) ? "0" : "") + ((absYear < 10) ? "0" : "") + absYear
			+"-W" + ((dateElements.week < 10) ? "0" : "") + (dateElements.week) + "-"+dateElements.day;	
}
/** Compute a string representing the ISO week date (UTC time) in standardized notation
 * @method toUTCIsoWeekCalDateString
 * @return {string} a date in the form [-]yyy-Www-d  example: 2000-W42-6 
*/
Date.prototype.toUTCIsoWeekCalDateString = function () { //return a string with the date elements in IsoWeekCal: #yyy-Www-d expressed at UTC date
	var dateElements = this.getUTCIsoWeekCalDate();
	let absYear = Math.abs(dateElements.year);
	return isNaN(absYear)
		? "Invalid Date"
		: ((dateElements.year < 0) ? "-": "") 
			+ ((absYear < 100) ? "0" : "") + ((absYear < 10) ? "0" : "") + absYear	
			+"-W" + ((dateElements.week < 10) ? "0" : "") + (dateElements.week) + "-"+dateElements.day;
}

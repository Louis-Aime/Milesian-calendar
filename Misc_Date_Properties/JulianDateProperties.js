/* Julian calendar and Julian Day properties added to Date object
	Character set is UTF-8
	This code, to be manually imported, set properties to object Date for the Julian calendar and for the Julian day.
Versions 
	M2017-12-26 : replace CalendarCycleComputationEngine with CBCCE
	M2018-05-19 : create getUTCJulianDate, getJulianUTCDate to be deprecated 
	M2018-10-26 : delete getJulianUTCDate (deprecated)
	M2018-11-11
		JSDoc comments
		Set default month and date for setJulianDay
		Extract setJulianDay
	M2018-11-16 : adapt to time zone computation
	M2019-01-06 : reconstruct julian calendar converter using CBCCE
	M2019-03-04 : replace {... Object} notation that does not fit to MS Edge
	M2019-07-27 : adapt to getRealTZmsOffset located in another package
Required
	Package CBCCE
	getRealTZmsOffset method.
Contents
	getJulianDate : the day date as a three elements object: .year, .month, .date; .month is 0 to 11. Conversion is in local time.
	getUTCJulianDate : same as above, in UTC time.
	getJulianDay : the decimal Julian Day, from the UTC time.
	setTimeFromJulianCalendar (year, month, date, hours, minutes, seconds, milliseconds) : set Time from julian calendar date + local hour.
	setUTCTimeFromJulianCalendar (year, month, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
	setTimeFromJulianDay (julianDay) : Set time from an integer or a fractionnal Julian day.
	Deprecated, extracter: setJulianDay (julianDay[, timeZoneOffset]) : set date as specified by integer (or rounded) Julian day, without changing local time.
*/
/* Copyright Miletus 2016-2018 - Louis A. de Fouquières
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
var 
/** Julian Day 0 at 0h00 UTC.
*/
  JULIAN_DAY_UTC0_EPOCH_OFFSET = 210866803200000, 
/** The parameters for the Cycle Based Calendar Computation Engine (CBCCE)
 * that describes the Julian calendar shifted to 1 March, with no month, with respect to Posix time
*/
Julian_calendar_params = { // To by used for the Julian calendar with a Unix timestamp. Calendar starts on 1 March of year 0 (i.e. 1 before Common Era).
//	Decompose in year, month (starting with 0 for March), day in month (starting with 1), hours, minutes, seconds, ms.
/* Within a year, the following cycles are considered
	Five months cycle of 153 days. 1 March to 31 July, 1 August to 31 December, 1 January to end of February.
	Bimester of 61 days.
	Month of 31 days, since each bimester begins with a 31 days month.
*/
	timeepoch : -62162208000000, // 1 March of year 0, Julian calendar
	coeff : [
	  {cyclelength : 126230400000, ceiling : Infinity, subCycleShift : 0, multiplier : 4, target : "year"}, // Olympiade
	  {cyclelength : 31536000000, ceiling : 3, subCycleShift : 0, multiplier : 1, target : "year"}, // One 365-days year
	  {cyclelength : 13219200000, ceiling : Infinity, subCycleShift : 0, multiplier : 5, target : "month"}, // Five-months cycle
	  {cyclelength : 5270400000, ceiling : Infinity, subCycleShift : 0, multiplier : 2, target : "month"}, // 61-days bimester
	  {cyclelength : 2678400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}, // 31-days month
	  {cyclelength : 86400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "date"}, // Date in month
	  {cyclelength : 3600000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "hours"},
	  {cyclelength : 60000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "minutes"},
	  {cyclelength : 1000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "seconds"},
	  {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "milliseconds"}
	],
	canvas : [ 
		{name : "year", init : 0},
		{name : "month", init : 2}, // Shifted year begins with month number 2 (March), thus simplify month shifting
		{name : "date", init : 1},
		{name : "hours", init : 0},
		{name : "minutes", init : 0},
		{name : "seconds", init : 0},
		{name : "milliseconds", init : 0},
	]	
}
/** romanShift : from standard Roman (Julian or Gregorian) date compound with year beginning in January, build a shifted date compound, year beginning in March
 * @param {{year : number, month: number, date: number}} - figures of a date in Julian calendar (or possibly Gregorian) 
 * @return {{year : number, month: number, date: number}} - the shifted date elements. year is same year or -1, Jan and Feb are shifted by 12
*/
function romanShift (romanDate) {
	if (romanDate.month < 0 || romanDate.month > 11) return undefined;  // Control validity of month only. Date may be negative or greater than 31. 
	let shiftDate = Object.assign ({},romanDate); // shiftDate = {...romanDate}; -- does not work with MS edge
	if (romanDate.month < 2) {
		shiftDate.year -= 1;
		shiftDate.month += 12
	}
	return shiftDate
}
/** romanUnshift : from shifted Roman (Julian or Gregorian) date compound with year beginning in March, build the standard date compound, year beginning in January
 * @param {{year : number, month: number, date: number}} - figures of shifted date, month 2 to 13 
 * @return {{year : number, month: number, date: number}} - the standard Roman date elements. year is same year or +1, 12 and 13 are shifted by -12
*/
function romanUnshift (shiftDate) {
	if (shiftDate.month < 2 || shiftDate.month > 13)  return undefined;  // Control validity of month only. Date may be negative or greater than 31. 
	let romanDate = Object.assign ({},shiftDate); // romanDate = {...shiftDate}; -- does not work with MS edge
	if (shiftDate.month > 11) {
		romanDate.year += 1;
		romanDate.month -= 12
	}
	return romanDate
}
/*
 2. Properties added to Date object
*/
/** Compose a date object with the figures of the Julian calendar date in local time. 
 * @method getJulianDate
 * @return {{year:number,month:number,date:number,hours:number,minutes:number,seconds:number,milliseconds:number}} 
 * the figures of the Julian calendar date in local time, in a compound object
*/
Date.prototype.getJulianDate = function () {
	return romanUnshift(cbcceDecompose (this.getTime() - this.getRealTZmsOffset(), Julian_calendar_params));
}
/** Compose a date object with the figures of the Julian calendar date in UTC time. 
 * @method getUTCJulianDate
 * @return {{year:number,month:number,date:number,hours:number,minutes:number,seconds:number,milliseconds:number}} 
 * the figures of the Julian calendar date in UTC time, in a compound object
*/
Date.prototype.getUTCJulianDate = function () {
	return romanUnshift (cbcceDecompose (this.getTime(), Julian_calendar_params));
}
/** Compute Julian day in decimal from Date object. This is always a UTC-based time. Integer values at 12h UTC (noon).
 * @method getJulianDay
 * @return {number} - Julian day
*/
Date.prototype.getJulianDay = function () {
  return (this.getTime() + JULIAN_DAY_UTC0_EPOCH_OFFSET - (12 * Chronos.HOUR_UNIT)) / Chronos.DAY_UNIT;
}
/** Modify date object with the figures of the Julian calendar date in local time. 
 * @method setTimeFromJulianCalendar
 * @param {number} year - Julian calendar year, in local time. Always the real year, 2-digit year means 1st century
 * @param {number} month - Julian calendar month number, 0 to 11
 * @param {number} date - Julian calendar date in month, 1 to 31
 * @param {number} hours - hour in day, local time, used as in .setHours(), by default: hour of current time
 * @param {number} minutes - minutes in local time, used as in .setHours(), by default: minutes of current time
 * @param {number} seconds - seconds in local time, used as in .setHours(), by default: seconds of current time
 * @param {number} milliseconds - milliseconds of local time, used as in .setHours(), by default: milliseconds of current time
 * @return {number} date value of the modified date object, computed after the Julian calendar date in local time
*/
Date.prototype.setTimeFromJulianCalendar = 
  function(year, month, date, hours = this.getHours(), minutes = this.getMinutes(), 
			seconds = this.getSeconds(), milliseconds = this.getMilliseconds()) {
	let shift = romanShift ({'year': year, 'month': month, 'date': date,
		'hours': 0, 'minutes': 0, 'seconds': 0, 'milliseconds': 0});
	this.setTime (cbcceCompose(shift, Julian_calendar_params ));	// First, set date à 0:00 UTC
	return this.setHours (hours, minutes, seconds, milliseconds)	// Then set hour of the day
}
/** Modify date object with the figures of the Julian calendar date in UTC time. 
 * @method setUTCTimeFromJulianCalendar
 * @param {number} year - Julian calendar year, in UTC time. Always the real year, 2-digit year means 1st century
 * @param {number} month - Julian calendar month number, 0 to 11, default 0
 * @param {number} date - Julian calendar date in month, 1 to 31, default 1
 * @param {number} hours - hour in day, UTC time, used as in .setHours(), by default: hour of current time
 * @param {number} minutes - minutes in UTC time, used as in .setHours(), by default: minutes of current time
 * @param {number} seconds - seconds in UTC time, used as in .setHours(), by default: seconds of current time
 * @param {number} milliseconds - milliseconds of UTC time, used as in .setHours(), by default: milliseconds of current time
 * @return {number} date value of the modified date object, computed after the Julian calendar date in UTC time
*/
Date.prototype.setUTCTimeFromJulianCalendar = 
  function(year, month = 0, date = 1, hours = this.getUTCHours(), minutes = this.getUTCMinutes(), 
			seconds = this.getUTCSeconds(), milliseconds = this.getMilliseconds()) {
	return this.setTime (cbcceCompose(romanShift ({'year': year, 'month': month, 'date': date,
		'hours': hours, 'minutes': minutes, 'seconds': seconds, 'milliseconds': milliseconds}), Julian_calendar_params ))	
}
/** Set time from a fractional Julian day 
 * @method setTimeFromJulianDay
 * @param {number} julianDay - Julian Day, a decimal day counted from Julian calendar Monday 1 January -4712 at 12:00 noon UTC
 * @return {number} date value of the modified date object after computation
*/
Date.prototype.setTimeFromJulianDay = function (julianDay) { 
	return this.setTime (Math.round(julianDay*Chronos.DAY_UNIT) - JULIAN_DAY_UTC0_EPOCH_OFFSET + 12 * Chronos.HOUR_UNIT)
}

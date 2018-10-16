/* Julian calendar and Julian Day properties added to Date object
	Character set is UTF-8
	This code, to be manually imported, set properties to object Date for the Julian calendar and for the Julian day.
Versions 
	M2017-12-26 : replace CalendarCycleComputationEngine with CBCCE
	Version M2018-05-19 : create getUTCJulianDate, getJulianUTCDate to be deprecated 
	Version M2018-10-26 : delete getJulianUTCDate (deprecated)
Required
	Package CBCCE is used.
Contents
	getJulianDate : the day date as a three elements object: .year, .month, .date; .month is 0 to 11. Conversion is in local time.
	getUTCJulianDate : same as above, in UTC time.
	getJulianDay : the decimal Julian Day, from the UTC time.
	setTimeFromJulianCalendar (year, month, date, hours, minutes, seconds, milliseconds) : set Time from julian calendar date + local hour.
	setUTCTimeFromJulianCalendar (year, month, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
	setTimeFromJulianDay (julianDay) : Set time from an integer or a fractionnal Julian day.
	setJulianDay (julianDay[, timeZoneOffset]) : set date as specified by integer (or rounded) Julian day, without changing local time.
*/////////////////////////////////////////////////////////////////////////////////////////////
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
*////////////////////////////////////////////////////////////////////////////////
//
// 1. Basic tools of this package
//
/* Import CalendarCycleComputationEngine, or make visible. */
var 
  JULIAN_DAY_UTC0_EPOCH_OFFSET = 210866803200000, // Julian Day 0 at 0h00 UTC.
  Julian_calendar_params = { // To by used for the Julian calendar with a Unix timestamp. Calendar starts on 1 March of year 0 (i.e. 1 before Common Era).
//	Decompose in years, days in year, hours, minutes, seconds, ms.
	timeepoch : -62162208000000, // 1 March of year 0, Julian calendar
	coeff : [
	  {cyclelength : 126230400000, ceiling : Infinity, subCycleShift : 0, multiplier : 4, target : "year"},
	  {cyclelength : 31536000000, ceiling : 3, subCycleShift : 0, multiplier : 1, target : "year"},
	  {cyclelength : 86400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "dayinyear"}, // Day in year is 1 (1 March) to 366 (29 February)
	  {cyclelength : 3600000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "hours"},
	  {cyclelength : 60000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "minutes"},
	  {cyclelength : 1000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "seconds"},
	  {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "milliseconds"}
	],
	canvas : [ 
		{name : "year", init : 0},
		{name : "dayinyear", init : 1},
		{name : "hours", init : 0},
		{name : "minutes", init : 0},
		{name : "seconds", init : 0},
		{name : "milliseconds", init : 0},
	]	
}
/////////////////////
// romanDecompose : from day in year counted from 1 March, get Date (in month), month number (js style, 0 to 11) and year shift (0 or 1)
////////////////////
function romanDecompose (dayOfYear) { // The switch from shifted date to Roman (Julian calendar) date uses Zeller's formula
	var month = 0, date = 5*(dayOfYear-1)+2;
	while (date >= 153) {
		++month;
		date -= 153;
	}
	date = Math.floor (date/5) + 1
	return (month < 10) ? {year : 0, month : month + 2, date : date} : {year : 1, month : month - 10, date : date};
}
/////////////////////
// romanCompose : from a Roman date compound, compute year and  day in year counted from 1 March
////////////////////
function romanCompose (romanDate) { // from a Roman date, returns the offset days with respect to 1 March of same year. 	
	if ((romanDate.month < 0) || (romanDate.month > 11)) { return undefined; } // Control validity of month only. Days may be negative or greater than 31. 
	else 
	{let yearshift = 0, month = 0, days = romanDate.date;
		if (romanDate.month < 2) { yearshift -= 1;  month = romanDate.month + 10}
		else { month = romanDate.month - 2};
	return { 'yearshift' : yearshift, 'daysinyear' : Math.floor((month * 153 + 2) / 5) + days }
	}
}
//
// 2. Properties added to Date object
//
Date.prototype.getJulianDate = function () {
	let shiftedDate = cbcceDecompose (this.getTime() - (this.getTimezoneOffset() * Chronos.MINUTE_UNIT), Julian_calendar_params);
	let romanDate = romanDecompose (shiftedDate.dayinyear);
	return {year : shiftedDate.year + romanDate.year, month : romanDate.month, date: romanDate.date, 
			hours: shiftedDate.hours, minutes: shiftedDate.minutes, seconds: shiftedDate.seconds, milliseconds: shiftedDate.milliseconds}
}
Date.prototype.getUTCJulianDate = function () {
	let shiftedDate = cbcceDecompose (this.getTime(), Julian_calendar_params);
	let romanDate = romanDecompose (shiftedDate.dayinyear);
	return {year : shiftedDate.year + romanDate.year, month : romanDate.month, date: romanDate.date, 
			hours: shiftedDate.hours, minutes: shiftedDate.minutes, seconds: shiftedDate.seconds, milliseconds: shiftedDate.milliseconds}	
}
Date.prototype.getJulianDay = function () { // From this Unix time stamp, give Julian day in decimal. This is always a UTC-based time. Integer values at 12h UTC (noon).
  return (this.getTime() + JULIAN_DAY_UTC0_EPOCH_OFFSET - (12 * Chronos.HOUR_UNIT)) / Chronos.DAY_UNIT;
}
Date.prototype.setTimeFromJulianCalendar = function(year, month, date, //: set Time from milesian date + local hour.
                                               hours = this.getHours(), minutes = this.getMinutes(), seconds = this.getSeconds(),
                                               milliseconds = this.getMilliseconds()) {
	let shift = romanCompose ({'month': month, 'date': date});
	this.setTime (cbcceCompose({
		'year' : year + shift.yearshift, 'dayinyear' : shift.daysinyear, 
		'hours' : 0, 'minutes' : 0, 'seconds' : 0, 'milliseconds' : 0}, Julian_calendar_params ));	// First, set date à 0:00 UTC
	this.setHours (hours, minutes, seconds, milliseconds);							// Then set hour of the day
  return this.valueOf();
}
Date.prototype.setUTCTimeFromJulianCalendar = function(year, month, date, // same but from UTC time zone.
                                                hours = this.getUTCHours(), minutes = this.getUTCMinutes(), seconds = this.getUTCSeconds(),
						milliseconds = this.getMilliseconds()) {
 	let shift = romanCompose ({'month': month, 'date': date});
	this.setTime (cbcceCompose({
		'year' : year + shift.yearshift, 'dayinyear' : shift.daysinyear, 
		'hours' : hours, 'minutes' : minutes, 'seconds' : seconds, 'milliseconds' : milliseconds
	}, Julian_calendar_params ));
  return this.valueOf();	
}
Date.prototype.setTimeFromJulianDay = function (julianDay) { // Set time from a fractional Julian day 
	this.setTime (Math.round(julianDay*Chronos.DAY_UNIT) - JULIAN_DAY_UTC0_EPOCH_OFFSET + 12 * Chronos.HOUR_UNIT);
  return this.valueOf()
}
Date.prototype.setJulianDay = function(julianDay, timeZoneOffset = this.getTimezoneOffset()) { // Set an integer Julian day, without changing local time.
	julianDay = Math.round (julianDay) ; // force julianDay to an integer value
	let decomposeLocalTimeStamp = cbcceDecompose ((this.valueOf() - timeZoneOffset * Chronos.MINUTE_UNIT), Day_milliseconds); // Separate day from hour in day.
    decomposeLocalTimeStamp.day_number = julianDay - JULIAN_DAY_UTC0_EPOCH_OFFSET / Chronos.DAY_UNIT ; // Compute Unix day number
	this.setTime (decomposeLocalTimeStamp.day_number * Chronos.DAY_UNIT + decomposeLocalTimeStamp.milliseconds_in_day + timeZoneOffset * Chronos.MINUTE_UNIT);
	return this.valueOf()
}

/* Deprecated complement to Julian Day properties added to Date object
	Character set is UTF-8
	This code, to be manually imported, set properties to object Date for the Julian calendar and for the Julian day.
Versions 
	M2017-12-26 : replace CalendarCycleComputationEngine with CBCCE
	Version M2018-05-19 : create getUTCJulianDate, getJulianUTCDate to be deprecated 
	Version M2018-10-26 : delete getJulianUTCDate (deprecated)
	M2018-11-11
		JSDoc comments
		Extract setJulianDay to this file
Required
	Package CBCCE
	JulianDateProperties
	Day_milliseconds (this is the only function that uses this CBCCE parameter set)
Contents
	setJulianDay (julianDay[, timeZoneOffset]) : set date as specified by integer (or rounded) Julian day, without changing local time.
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
/** Set the date part of a local date to a given integer (or rounded) Julian day, without changing local time.
 * @todo the sense of thie method is not evident, it might be deprecated 
 * @method setJulianDay
 * @param {number} julianDay - the Julian day to set. If not an integer, the rounded value is used.
 * @param {number} timeZoneOffset - Offset in minutes for the local time zone. Default: system time zone offset at given date.
 * @return {number} date value of the modified date object after computation 
*/
Date.prototype.setJulianDay = function(julianDay, timeZoneOffset = this.getTimezoneOffset()) { 
	julianDay = Math.round (julianDay) ; // force julianDay to an integer value
	let decomposeLocalTimeStamp = cbcceDecompose ((this.valueOf() - timeZoneOffset * Chronos.MINUTE_UNIT), Day_milliseconds); // Separate day from hour in day.
    decomposeLocalTimeStamp.day_number = julianDay - JULIAN_DAY_UTC0_EPOCH_OFFSET / Chronos.DAY_UNIT ; // Compute Unix day number
	this.setTime (decomposeLocalTimeStamp.day_number * Chronos.DAY_UNIT + decomposeLocalTimeStamp.milliseconds_in_day + timeZoneOffset * Chronos.MINUTE_UNIT);
	return this.valueOf()
}
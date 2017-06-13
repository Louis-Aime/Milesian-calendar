/* Milesian properties added to Date
// Character set is UTF-8
// This code, to be manually imported, set properties to object Date for the Milesian calendar.
// Version M2017-06-22
// Package CalendarCycleComputationEngine is used.
//	getMilesianDate : the day date as a three elements object: .year, .month, .date; .month is 0 to 11. Conversion is in local time.
//  getMilesianUTCDate : same as above, in UTC time.
//  setTimeFromMilesian (year, month, date, hours, minutes, seconds, milliseconds) : set Time from milesian date + local hour.
//  setUTCTimeFromMilesian (year, month, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
//  toIntlMilesianDateString : return a string with the date elements in Milesian: (day) (month)"m" (year), month 1 to 12.
//  toUTCIntlMilesianDateString : same as above, in UTC time zone.
*/////////////////////////////////////////////////////////////////////////////////////////////
/* Copyright Miletus 2016-2017 - Louis A. de Fouquières
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 1. The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 2. Changes with respect to any former version shall be documented.
//
// The software is provided "as is", without warranty of any kind,
// express of implied, including but not limited to the warranties of
// merchantability, fitness for a particular purpose and noninfringement.
// In no event shall the authors of copyright holders be liable for any
// claim, damages or other liability, whether in an action of contract,
// tort or otherwise, arising from, out of or in connection with the software
// or the use or other dealings in the software.
// Inquiries: www.calendriermilesien.org
*////////////////////////////////////////////////////////////////////////////////
//
// 1. Basic tools of this package
/*// Import CalendarCycleComputationEngine, or make visible. */
var
Milesian_time_params = { // To be used with a Unix timestamp in ms. Decompose into Milesian years, months, date, hours, minutes, seconds, ms
	timeepoch : -188395804800000, // Unix timestamp of 1 1m -4000 00h00 UTC in ms
	coeff : [ 
	  {cyclelength : 100982160000000, ceiling : Infinity, multiplier : 3200, target : "year"},
	  {cyclelength : 12622780800000, ceiling : Infinity, multiplier : 400, target : "year"},
	  {cyclelength : 3155673600000, ceiling :  3, multiplier : 100, target : "year"},
	  {cyclelength : 126230400000, ceiling : Infinity, multiplier : 4, target : "year"},
	  {cyclelength : 31536000000, ceiling : 3, multiplier : 1, target : "year"},
	  {cyclelength : 5270400000, ceiling : Infinity, multiplier : 2, target : "month"},
	  {cyclelength : 2592000000, ceiling : 1, multiplier : 1, target : "month"}, 
	  {cyclelength : 86400000, ceiling : Infinity, multiplier : 1, target : "date"},
	  {cyclelength : 3600000, ceiling : Infinity, multiplier : 1, target : "hours"},
	  {cyclelength : 60000, ceiling : Infinity, multiplier : 1, target : "minutes"},
	  {cyclelength : 1000, ceiling : Infinity, multiplier : 1, target : "seconds"},
	  {cyclelength : 1, ceiling : Infinity, multiplier : 1, target : "milliseconds"}
	],
	canvas : [ 
		{name : "year", init : -4000},
		{name : "month", init : 0},
		{name : "date", init : 1},
		{name : "hours", init : 0},
		{name : "minutes", init : 0},
		{name : "seconds", init : 0},
		{name : "milliseconds", init : 0},
	]
}
//
// 2. Properties added to Date object for Milesian dates
//
Date.prototype.getMilesianDate = function () {
  return ccceDecompose (this.getTime() - (this.getTimezoneOffset() * Chronos.MINUTE_UNIT), Milesian_time_params);
}
Date.prototype.getMilesianUTCDate = function () {
  return ccceDecompose (this.getTime(), Milesian_time_params);
}
Date.prototype.setTimeFromMilesian = function (year, month, date, 
                                               hours = this.getHours(), minutes = this.getMinutes(), seconds = this.getSeconds(),
                                               milliseconds = this.getMilliseconds()) {
  this.setTime(ccceCompose({
	  'year' : year, 'month' : month, 'date' : date, 'hours' : 0, 'minutes' : 0, 'seconds' : 0, 'milliseconds' : 0
	  }, Milesian_time_params));			// Date is first specified at midnight UTC.
  this.setHours (hours, minutes, seconds, milliseconds); // Then hour part is specified
  return this.valueOf();
}
Date.prototype.setUTCTimeFromMilesian = function (year, month = 0, date = 1,
                                               hours = this.getUTCHours(), minutes = this.getUTCMinutes(), seconds = this.getUTCSeconds(),
                                               milliseconds = this.getUTCMilliseconds()) {
  this.setTime(ccceCompose({
	  'year' : year, 'month' : month, 'date' : date, 'hours' : hours, 'minutes' : minutes, 'seconds' : seconds,
	  'milliseconds' : milliseconds
	  }, Milesian_time_params));
   return this.valueOf();
}
Date.prototype.toIntlMilesianDateString = function () {
	var dateElements = ccceDecompose (this.getTime()- (this.getTimezoneOffset() * Chronos.MINUTE_UNIT), Milesian_time_params );
	return dateElements.date+" "+(++dateElements.month)+"m "+dateElements.year;
}
Date.prototype.toUTCIntlMilesianDateString = function () {
	var dateElements = ccceDecompose (this.getTime(), Milesian_time_params );
	return dateElements.date+" "+(++dateElements.month)+"m "+dateElements.year;
}

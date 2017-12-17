/* French revolutionary calendar properties added to Date object
// Character set is UTF-8
// This code, to be manually imported, set properties to object Date for the French Revolutionary calendar.
// Version M2017-12-26
// Package CBCCE is used.
//  getFrenchRevDate : the day date as a three elements object: .year, .month, .date; .month is 0 to 11. Conversion is in local time.
//  getFrenchRevUTCDate : same as above, in UTC time.
//  setTimeFromFrenchRev (year, month, date, hours, minutes, seconds, milliseconds) : set Time from julian calendar date + local hour.
//  setUTCTimeFromFrenchRev (year, month, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
*/////////////////////////////////////////////////////////////////////////////////////////////
/* Copyright Miletus 2017 - Louis A. de Fouquières
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
// Import CBCCE, or make visible.
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
//
// 2. Methods added to Date object for French Revolutionary dates
//
Date.prototype.getFrenchRevDate = function () {
  return cbcceDecompose (this.getTime() - (this.getTimezoneOffset() * Chronos.MINUTE_UNIT), FrenchRev_time_params);
}
Date.prototype.getFrenchRevUTCDate = function () {
  return cbcceDecompose (this.getTime(), FrenchRev_time_params);
}
Date.prototype.setTimeFromFrenchRev = function (year, month, date, 
                                               hours = this.getHours(), minutes = this.getMinutes(), seconds = this.getSeconds(),
                                               milliseconds = this.getMilliseconds()) {
  this.setTime(cbcceCompose({
	  'year' : year, 'month' : month, 'date' : date, 'hours' : 0, 'minutes' : 0, 'seconds' : 0, 'milliseconds' : 0
	  }, FrenchRev_time_params));			// Date is first specified at midnight UTC.
  this.setHours (hours, minutes, seconds, milliseconds); // Then hour part is specified
  return this.valueOf();
}
Date.prototype.setUTCTimeFromFrenchRev = function (year, month = 0, date = 1,
                                               hours = this.getUTCHours(), minutes = this.getUTCMinutes(), seconds = this.getUTCSeconds(),
                                               milliseconds = this.getUTCMilliseconds()) {
  this.setTime(cbcceCompose({
	  'year' : year, 'month' : month, 'date' : date, 'hours' : hours, 'minutes' : minutes, 'seconds' : seconds,
	  'milliseconds' : milliseconds
	  }, FrenchRev_time_params));
   return this.valueOf();
}
Date.prototype.toIntlFrenchRevDateString = function () {
	var dateElements = cbcceDecompose (this.getTime()- (this.getTimezoneOffset() * Chronos.MINUTE_UNIT), FrenchRev_time_params );
	return dateElements.date+"/"+(++dateElements.month)+"/"+dateElements.year;
}
Date.prototype.toUTCIntlFrenchRevDateString = function () {
	var dateElements = cbcceDecompose (this.getTime(), FrenchRev_time_params );
	return dateElements.date+"/"+(++dateElements.month)+"/"+dateElements.year;
}
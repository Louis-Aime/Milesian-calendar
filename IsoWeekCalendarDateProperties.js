/* ISO week calendar properties added to Date object
// Character set is UTF-8
// This code, to be manually imported, set properties to object Date for the ISO week calendar, which is the calendar implied by ISO 8601.
// Version M2017-06-22
// Package CalendarCycleComputationEngine is used.
// Package MilesianDateProperties is used (in order to compute quickly year of date to be converted into ISO week calendar)
//	getIsoWeekCalDate : the day date as a three elements object: .year, .month, .date; .month is 0 to 11. Conversion is in local time.
//  getIsoWeekCalUTCDate : same as above, in UTC time.
//  setTimeFromIsoWeekCal (year, month, date, hours, minutes, seconds, milliseconds) : set Time from milesian date + local hour.
//  setUTCTimeFromIsoWeekCal (year, month, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
//  toIsoWeekCalDateString : return a string with the date elements in IsoWeekCal: yyyy-Www-dd
//  toUTCIsoWeekCalDateString : same as above, in UTC time zone.
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
/* Import CalendarCycleComputationEngine, or make visible. */ 
/* Import MilseianDateProperties, or make visible. */
var
isoWeekCalendar_params = { // To be used with a Unix timestamp in ms. Decompose a delay within a year in week number and day.
	timeepoch : 0, // 
	coeff : [ 
		{cyclelength : 604800000, ceiling : Infinity, multiplier : 1, target : "week"},
		{cyclelength : 86400000, ceiling : Infinity, multiplier : 1, target : "day"},
		{cyclelength : 3600000, ceiling : Infinity, multiplier : 1, target : "hours"},
		{cyclelength : 60000, ceiling : Infinity, multiplier : 1, target : "minutes"},
		{cyclelength : 1000, ceiling : Infinity, multiplier : 1, target : "seconds"},
		{cyclelength : 1, ceiling : Infinity, multiplier : 1, target : "milliseconds"}
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
//
// 2. Properties added to Date object for ISO week calendar
//
function isoWeekCalendarBase (year) { 			// yields the monday 00:00 first moment of the first ISO week in given year.
	let referenceDate = new Date (Date.UTC(year, 0, 4));	// 4th January is always in first ISO week of year.
	referenceDate.setFullYear(year); 			// Year is always a full year, 98 means 98 years A.D., not 1998.	
	return referenceDate.valueOf() - ((referenceDate.getUTCDay() + 6) % 7)* Chronos.DAY_UNIT // Substract weekday number - 1 (+6) modulo 7 in order to come back to monday
}
Date.prototype.getIsoWeekCalDate = function () {
	let year = this.getMilesianDate().year; 	// Milesian year begins always before ISO week year, therefore ISO week calendar year is either Milesian year, either - 1.
	let base = new Date (isoWeekCalendarBase(year));	// This is the first day of ISO week year.
	if (base.valueOf() > this.valueOf()-(this.getTimezoneOffset() * Chronos.MINUTE_UNIT)) base.setTime (isoWeekCalendarBase(--year)); 
	let compoundDate = ccceDecompose (this.valueOf() - this.getTimezoneOffset() * Chronos.MINUTE_UNIT - base.valueOf(), isoWeekCalendar_params);
	Object.defineProperty (compoundDate, "year", {enumerable : true, writable : true, value : year});
	return compoundDate;
}
Date.prototype.getIsoWeekCalUTCDate = function () {
	let year = this.getMilesianUTCDate().year; 	// Milesian year begins always before ISO week year, therefore ISO week calendar year is either Milesian year, either - 1.
	let base = new Date (isoWeekCalendarBase(year));	// This is the first day of ISO week year.
	if (base.valueOf() > this.valueOf()) base.setTime (isoWeekCalendarBase(--year));
	let compoundDate = ccceDecompose (this.valueOf() - base.valueOf(), isoWeekCalendar_params);
	Object.defineProperty (compoundDate, "year", {enumerable : true, writable : true, value : year});
	return compoundDate;
}
Date.prototype.setTimeFromIsoWeekCal = function (year, week, day, 
                                               hours = this.getHours(), minutes = this.getMinutes(), seconds = this.getSeconds(),
                                               milliseconds = this.getMilliseconds()) { // set time from date expressed in ISO week calendar
    this.setTime(isoWeekCalendarBase(year) + ccceCompose({		// Set ISO week calendar date at 00:00 UTC. The year begins at isoWeekCalendarBase.
	  'week' : week, 'day' : day, 'hours' : 0, 'minutes' : 0, 'seconds' : 0, 'milliseconds' : 0 }, isoWeekCalendar_params));
	this.setHours (hours, minutes, seconds, milliseconds);							// Then set hour of the day
	return this.valueOf();
}
Date.prototype.setUTCTimeFromIsoWeekCal = function (year, week, day, 
                                               hours = this.getUTCHours(), minutes = this.getUTCMinutes(), seconds = this.getUTCSeconds(),
                                               milliseconds = this.getUTCMilliseconds()) { // set time from date expressed in ISO week calendar
    this.setTime(isoWeekCalendarBase (year) + ccceCompose({
	  'week' : week, 'day' : day, 'hours' : hours, 'minutes' : minutes, 'seconds' : seconds,
	  'milliseconds' : milliseconds
	  }, isoWeekCalendar_params));
  return this.valueOf();
}
Date.prototype.toUTCIsoWeekCalString = function () { //return a string with the date elements in IsoWeekCal: yyyy-Www-dd
	var dateElements = this.getIsoWeekCalUTCDate();
	let absYear = Math.abs(dateElements.year)
	return ((dateElements.year < 0) ? "-": "") 
			+ ((absYear < 100) ? "0" : "") + ((absYear < 10) ? "0" : "") + absYear
			+"-W" + ((dateElements.week < 10) ? "0" : "") + (dateElements.week) + "-0"+dateElements.day
			+"T"+((dateElements.hours < 10) ? "0" : "") + dateElements.hours + ":"
			+ ((dateElements.minutes < 10) ? "0" : "") + dateElements.minutes + ":"
			+ ((dateElements.seconds < 10) ? "0" : "") + dateElements.seconds + ":"
			+ ((dateElements.milliseconds < 100) ? "0" : "") + ((dateElements.milliseconds < 10) ? "0" : "") 
			+ dateElements.milliseconds + "Z";
}
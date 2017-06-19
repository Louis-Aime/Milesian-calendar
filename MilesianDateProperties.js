/* Milesian properties added to Date
// Character set is UTF-8
// This code, to be manually imported, set properties to object Date for the Milesian calendar.
// Version M2017-06-29
// Package CalendarCycleComputationEngine is used.
// File MilesianMonthNames.xml is used
//	getMilesianDate : the day date as a three elements object: .year, .month, .date; .month is 0 to 11. Conversion is in local time.
//  getMilesianUTCDate : same as above, in UTC time.
//  setTimeFromMilesian (year, month, date, hours, minutes, seconds, milliseconds) : set Time from milesian date + local hour.
//  setUTCTimeFromMilesian (year, month, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
//  toIntlMilesianDateString : return a string with the date elements in Milesian: (day) (month)"m" (year), month 1 to 12.
//  toUTCIntlMilesianDateString : same as above, in UTC time zone.
//  toMilesianLocaleDateString ([locale, [options]]) : return a string with date and time, according to locale and options.
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
/*// Import or make visible: 
	CalendarCycleComputationEngine.js
	MilesianMonthNames.xml
*/
var req = new XMLHttpRequest();
req.open("GET", "./MilesianMonthNames.xml", false); 
req.send();
var milesianNames = req.responseXML; 	// MilesianNames is the document containing the month names of the Milesian calendar, in several languages
// 
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
function pad(number) {	// utility function, pad 2-digit integerr numbers. No control.
	return ( number < 10 ) ? ('0' + number) : number;
    }
//
// 2. Methods added to Date object for Milesian dates
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
//////////////////////////////////////////////////////
// The following method elaborate a string giving the date in Milesian, under several locales and options.
// This method is a makeup, the result is not totally in line with the expected results of such functions.
// It just show that these layouts are possible.
//////////////////////////////////////////////////////
Date.prototype.toMilesianLocaleDateString = function (locales = undefined, options = undefined) {
	// var dateElements = ccceDecompose (this.getTime()- (this.getTimezoneOffset() * Chronos.MINUTE_UNIT), Milesian_time_params ); 
	var str = ""; 	// the final string for this date;
	var sep = "";	// separator of date elements, / or space.
	if (options == undefined) var askedOptions = new Intl.DateTimeFormat (locales)	// require locale and option from present implementation;
	else var askedOptions = new Intl.DateTimeFormat (locales, options);
	var usedOptions = askedOptions.resolvedOptions(); // the options used after negotiation: 
	// example of standard usedOptions: { locale: "fr-FR", calendar: "gregory", numberingSystem: "latn", timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", year: "numeric" }
	// while specifiying option, you may suppress year, month or day.
	var lang = usedOptions.locale[0] + usedOptions.locale[1], country = usedOptions.locale[3] + usedOptions.locale[4];
	let wstr = "", dstr = "", mstr = "", ystr = "", tstr = "", tzstr = ""; // components of date string
	let Xpath1 = "", node = undefined;
	// let weekday = (Math.floor((this.getTime()- (this.getTimezoneOffset() * Chronos.MINUTE_UNIT)) / Chronos.DAY_UNIT)-3) % 7;
	if (usedOptions.weekday !== undefined) wstr = this.toLocaleDateString (usedOptions.locale, {weekday : usedOptions.weekday}); // construct weekday using existing data;
	switch (usedOptions.year) {
		case "numeric": ystr = this.getMilesianDate().year; break;
		case "2-digit": ystr = this.getMilesianDate().year % 100; break;
		default : break; }
	switch (usedOptions.month) {
		case "numeric": mstr = this.getMilesianDate().month+1; break;
		case "2-digit": mstr = pad (this.getMilesianDate().month+1); break;
		case "narrow":
			Xpath1 = "/pldr/ldmlBCP47/calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='narrow']/month[@type=this.getMilesianDate().month+1]";
			node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
			mstr = node.stringValue;
			break;
		case "short":
			Xpath1 = "/pldr/ldmlBCP47/calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type="
				+ (this.getMilesianDate().month+1) + "]";
			node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
			mstr = node.stringValue;
			break;
		case "long":
			Xpath1 = "/pldr/ldmlBCP47/calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type="
				+ (this.getMilesianDate().month+1) + "]";
			node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
			mstr = node.stringValue;
			Xpath1 = "/pldr/ldml/identity/language[@type=" + "'"+lang+"'"+ "]/../calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type="
				+ (this.getMilesianDate().month+1) + "]";
			node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
			if (node.stringValue !== "") mstr = node.stringValue;
			break;
		default : break; }
	switch (usedOptions.day) {
		case "numeric": dstr = this.getMilesianDate().date; break;
		case "2-digit": dstr = pad (this.getMilesianDate().date); break;
		default : break; }	
	if (usedOptions.hour !== undefined || usedOptions.minute !== undefined || usedOptions.hour !== undefined) 
		tstr = new Intl.DateTimeFormat (usedOptions.locale, {hour : usedOptions.hour, minute : usedOptions.minute, second : usedOptions.second}).format(this);
	switch (usedOptions.month) {
		case "numeric": case "2-digit" : sep = "/"; break;
		case "narrow": case "short" : case "long" : sep = " "; break;
		default : break; }
	if (wstr !== "") str +=wstr + " ";
	if (country == "US") { 
		if (mstr !== "") str += mstr;  
		if (dstr !== "" && str !== "") str += sep + dstr ;
		if (ystr !== "" && str !== "") str += sep + ystr ;
		if (tstr !== "") str += " " + tstr ;
	} else {
		if (dstr !== "") str += dstr ;
		if (mstr !== "" && str !== "") str += sep + mstr;  
		if (ystr !== "" && str !== "") str += sep + ystr ;
		if (tstr !== "") str += " " + tstr ;
	}
	return str; }


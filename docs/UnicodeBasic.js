/* JS tools used with Date and Intl.DateTimeFormat objects replacing bugged or missing functions
	Character set is UTF-8
Versions
	The tools were originally developed with UnicodeMilesianFormat tools in 2017.
	M2018-11-11: separate tools, in order to cater for several independent calendar implementations.
	M2018-11-16: add a time zone offset computing function and a simple version of toLocalDate
	M2018-11-24: deprecate toLocalDate
	M2019-07-27: separate getRealTZOffset into RealTZmsOffset.js
	M2019-12-22: simplify since all browser handle DateTimeFormat, and insert a display validity test
	M2020-01-10: set strict mode and enhance code
	M2020-04-22: Deprecate unicodeCalendarHandled (was used in Converter only for MS Edge, before it used Unicode)
Contents
	getRealTZmsOffset : moved to RealTZmsOffset.js
	unicodeCalendarHandled (deprecated) : from a requested calendar, gives the effectively used one (was used only for MS Edge)
	toResolvedLocalDate : return a Date object holding the date shifted by the time zone offset of a given Unicode (IANA) time zone. 
	unicodeValidDateinCalendar: A filter for calendrical computation bugs in the ICUs
Required
	Access to "Chronos" object.
	getRealsTZmsOffset defined elsewhere.
*/
/* Copyright Miletus 2017-2019 - Louis A. de Fouquières
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sub-license, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
	1. The above copyright notice and this permission notice shall be included
	in all copies or substantial portions of the Software.
	2. Changes with respect to any former version shall be documented.

The software is provided "as is", without warranty of any kind,
express of implied, including but not limited to the warranties of
merchantability, fitness for a particular purpose and non infringement.
In no event shall the authors of copyright holders be liable for any
claim, damages or other liability, whether in an action of contract,
tort or otherwise, arising from, out of or in connection with the software
or the use or other dealings in the software.
Inquiries: www.calendriermilesien.org
*/
"use strict";
/** Construct a date that represents the "best fit" value of the given date shifted to the named time zone. 
 * The computation of the time zone is that of Unicode, or  the the standard TZOffset if Unicode's is not available.
 * @param {Date} myDate - the Date object to convert, and that shows the moment of time zone offset computation.
 * @param {string} myTZ - the name of the time zone.
 * @returns {Date} - the best possible result given by the navigator.
 */
function toResolvedLocalDate (myDate, myTZ = "") {
	var	localTime = new Date (myDate.valueOf()); // Initiate a draft date.
	var localOptions;
	if (myTZ == "UTC") return localTime; // Trivial case: time zone asked is UTC.
	// Check that given time zone name is valid
	try {
		if (myTZ == (null || ""))
			localOptions = new Intl.DateTimeFormat ("en-GB")
		else
			localOptions = new Intl.DateTimeFormat ("en-GB", {timeZone : myTZ}); // Submit specified time zone
	}
	catch (e) { // Submitted option is not valid
		return new Date (NaN)	// myTZ is not empty, but the navigator is unable to resolve it as a valid time zone
	}
	// Here localOptions is set with valid asked timeZone
	// Set a format object suitable to extract numeric components from Date string
	let numericSettings = {weekday: 'long', era: 'short', year: 'numeric',  month: 'numeric',  day: 'numeric',  
			hour: 'numeric',  minute: 'numeric',  second: 'numeric', hour12: false};
	if (!(myTZ == (undefined || ""))) numericSettings.timeZone = myTZ;	
	var numericOptions = new Intl.DateTimeFormat ("en-GB", numericSettings);
	let	localTC = numericOptions.formatToParts(myDate); // Local date and time components at myTZ
	// Construct a UTC date based on the figures of the local date.
	localTime.setUTCFullYear (
		(localTC[8].value == "BC") ? 1-localTC[6].value : localTC[6].value, // year component
		localTC[4].value-1, localTC[2].value); // month and date components 
	localTime.setUTCHours(localTC[10].value, localTC[12].value, localTC[14].value); //Hours, minutes and seconds
	return localTime;
}
/** With the ICUs, is this date properly displayed with this calendar ? 
 * The filtering is done after our experience. This routine may change in the time.
 * Only real computational bugs are filtered, not poor presentations.
 * @param {Date} myDate - the Date object to display.
 * @param (String) myTZ - the time zone name used, may be ''
 * @param {string} myCalendar - the name of the calendar, after Unicode's referential.
 * @returns {Boolean} - true if the ICU is deemed to give a valid value.
 */
function unicodeValidDateinCalendar(myDate, myTZ, myCalendar) {
	let valid = true; 	// Flag the few cases where calendar computations under Unicode yield a wrong result
	switch (myCalendar) {	
		case "hebrew": valid = (toResolvedLocalDate(myDate, myTZ).valueOf()
			>= -180799776000000); break;	// Computations are false before 1 Tisseri 1 Anno Mundi
		case "indian": valid = (toResolvedLocalDate(myDate, myTZ).valueOf() 
			>= -62135596800000); break;	// Computations are false before 01/01/0001 (gregorian)
		case "islamic":
		case "islamic-rgsa": valid = (toResolvedLocalDate(myDate, myTZ).valueOf()
			>= -42521673600000); break; // Computations are false before Haegirian epoch i.e. 27 7m 622
		case "islamic-umalqura": valid = (toResolvedLocalDate(myDate, myTZ).valueOf()
			>= -6227305142400000); break; // Computations are false before 2 8m -195366
		}
	return valid
}
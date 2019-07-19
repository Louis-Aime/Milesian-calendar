/* JS tools used with Date and Intl.DateTimeFormat objects replacing bugged or missing functions
	Character set is UTF-8
Versions
	The tools were originally developed with UnicodeMilesianFormat tools in 2017.
	M2018-11-11: separate tools, in order to cater for several independent calendar implementations.
	M2018-11-16: add a time zone offset computing function and a simple version of toLocalDate
	M2018-11-24: deprecate toLocalDate
	M2019-07-27: separate getRealTZOffset into ReaTZmsOffset.js
Contents
	getRealTZmsOffset : moved to RealTZmsOffset.js
	unicodeCalendarHandled : from a requested calendar, gives the effectively used one.
	toResolvedLocalDate : return a Date object holding the date shifted by the time zone offset of a given Unicode (IANA) time zone.  
Required
	Access to "Chronos" object.
	getRealsTZmsOffset defined elsewhere
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


/** Show which calendar is effectively used, in connection with a language, upon request through the Locale u-ca- parameters of Intl.DateTimeFormatate
 * @param {string} calendar: name of asked calendar
 * @param {string} locale: the language for which the request is done. If undefined, current locale.
 * @returns {string} the calendar that the implementation selects
*/
function unicodeCalendarHandled (calendar, locale) {
	if (locale == null || locale == "" ) locale = new Intl.DateTimeFormat().resolvedOptions().locale
	else locale = new Intl.DateTimeFormat(locale).resolvedOptions().locale;
	locale = (locale.includes("-u-") 
	? 	(locale.substring(locale.indexOf("-u-")).includes("ca-") 
			? locale.substring (0,locale.indexOf("ca-",locale.indexOf("-u-")))
			: locale )
		+ "ca-"
	: locale + "-u-ca-"
	) + calendar ;
	return 	new Intl.DateTimeFormat(locale).resolvedOptions().calendar;
	}

/** Construct a date that represents the "best fit" value of the given date shifted to the time zone indicated or resolved in Options. 
 * The computation of the time zone is that of Unicode, or  the the standard TZOffset if Unicode's is not available.
 * @param {Date} myDate - the Date object to convert, and that shows the moment of time zone offset computation.
 * @param {string} myTZ - the name of the time zone.
 * @returns {Date} - the best possible result given the navigator
 */
function toResolvedLocalDate (myDate, myTZ = "") {
	var	localTime = new Date (myDate.valueOf() - myDate.getRealTZmsOffset()); //Basic value if no further computation possible
	// Normally, should get the time zone offset and compute shifted date. Should take one line !! 
	// Halas, time zone offset is not available. So we have to get it by other ways, depending upon the browser.
	// if (myTZ == (undefined || "")) return localTime; 
	if (myTZ == "UTC") return new Date(myDate.valueOf()); // Trivial case: time zone asked is UTC.
	// First try to resolve time zone option.
	try {
	// Before any further action, test format functions
		var askedOptions = new Intl.DateTimeFormat (); // Default parameters	
		}
	catch (e) { // No DateTimeFormat, even with default, use basic local time.
		return localTime // No way of computing any local time, only system local time available
	  }
	// Here a minimum format Option management works.
	try {
		if (myTZ == (null || ""))
			askedOptions = new Intl.DateTimeFormat ("en-GB")
		else
			askedOptions = new Intl.DateTimeFormat ("en-GB", {timeZone : myTZ}); // Submit specified time zone
	}
	catch (e) { // Submitted option is not valid
		return new Date (NaN)	// myTZ is not empty, but not a valid time zone
	}
	// Here askedOptions are set with valid asked timeZone
	// Set a format object suitable to extract numeric components from Date string
	let numericSettings = {weekday: 'long', era: 'short', year: 'numeric',  month: 'numeric',  day: 'numeric',  
			hour: 'numeric',  minute: 'numeric',  second: 'numeric', hour12: false};
	if (!(myTZ == (undefined || ""))) numericSettings.timeZone = myTZ;	
	var numericOptions = new Intl.DateTimeFormat ("en-GB", numericSettings);
		
	try {	// try using formatToParts. If not usable, use localTime previously computed.
		let	localTC = numericOptions.formatToParts(myDate); // Local date and time components at myTZ
		localTime = new Date(0);
		// Construct a UTC date based on the figures of the local date.
		localTime.setUTCFullYear (
			(localTC[8].value == "BC") ? 1-localTC[6].value : localTC[6].value, // year component
			localTC[4].value-1, localTC[2].value); // month and date components 
		localTime.setUTCHours(localTC[10].value, localTC[12].value, localTC[14].value); //Hours, minutes and seconds
		return localTime; // Success
		}
	catch (e) { // can't use formatToParts. This is MS Edge specific. Just use standard TimezoneOffset if TZ was not specified, else return NaN
		if   (myTZ == undefined || myTZ == "" || myTZ == new Intl.DateTimeFormat().resolvedOptions().timeZone)
			return localTime 
		else return new Date (NaN)
	}
}

/* Unicode tools used with Intl.DateTimeFormat for string generation functions with other calendars
	Character set is UTF-8
Utility functions used with Intl.DateTimeFormat object, offering supplemental functionalities.
Versions
	The tools wer originally developped with UnicodeMilesianFormat tools in 2017
	M2018-11-11 separate tools, in order to cater for several independent calendar implementations.
Contents
	unicodeCalendarHandled : from a requested calendar, gives the effectively used one.
	toLocalDate : return a Date object holding the date shifted by the time zone offset of a given Unicode (IANA) time zone. 
Required
	Access to "Chronos" object.
*/
/* Copyright Miletus 2017-2018 - Louis A. de Fouquières
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
/** @description Show which calendar is effectively used upon request through the Locale u-ca- parameters of Intl.DateTimeFormatate
 * @param (string) calendar: name of asked calendar
 * @returns (string) the calendar that the implementation selects
*/
function unicodeCalendarHandled (calendar) {
	return 	new Intl.DateTimeFormat("en-US-u-ca-"+calendar).resolvedOptions().calendar;
	}
/*
1.3 Utility to get the local Date-Time as an UTC date.

/** @description Construct a date that represents the value of the given date shifted to the time zone indicated or resolved in Options. 
 * @summary The computation of the time zone is that of Unicode, or  the the standard TZOffset if Unicode's is not available.
 * @param myDate (Date object) the Date object to convert, and that shows the moment of time zone offset computation.
 * @param myTZ (string) the name of the time zone.
 * @returns (Object) {localDate : the best possible result, accuracy : ("exact": Unicode, "approximate": JS TZOffset, way :(for debug, how did we compute)}
*/
function toLocalDate (myDate, myTZ = "") {
	var	localTime = new Date (myDate.valueOf() - myDate.getTimezoneOffset()*Chronos.MINUTE_UNIT); //Basic value if no further computation possible
	// Normally, should get the time zone offset and compute shifted date. Should take one line !! 
	// Halas, time zone offset is not available. So we have to get it by other ways, depending upon the browser.
	// if (myTZ == (undefined || "")) return { localDate: localTime, accuracy : "exact", way : "default" }; 
	if (myTZ == "UTC") return { localDate: new Date(myDate.valueOf()), accuracy : "exact", way : "UTC"}; // Trivial case: time zone asked is UTC.
	// First try to resolve time zone option.
	try {
	// Before any further action, test format functions
		var askedOptions = new Intl.DateTimeFormat (); // Default parameters	
		}
	catch (e) { // No DateTimeFormat, even with default, use basic local time.
		return {localDate : localTime, accuracy : "approx" , way : "noformat"}
	  }
	// Here a minimum format Option management works.
	try {
		if (myTZ == (undefined || ""))
			askedOptions = new Intl.DateTimeFormat ("en-GB")
		else
			askedOptions = new Intl.DateTimeFormat ("en-GB", {timeZone : myTZ}); // Submit specified time zone
	}
	catch (e) { // Submitted option is not valid
		return { localDate : localTime, accuracy : "approx" , way : "invalidTZ"}	// myTZ is not empty, but not a valid time zone
	}
	// Here askedOptions are set with valid asked timeZone
	// Set a format object suitable to extract numeric components from Date string
	let numericSettings = {weekday: 'long', era: 'short', year: 'numeric',  month: 'numeric',  day: 'numeric',  
			hour: 'numeric',  minute: 'numeric',  second: 'numeric', hour12: false};
	if (!(myTZ == (undefined || ""))) numericSettings.timeZone = myTZ;	
	var numericOptions = new Intl.DateTimeFormat ("en-GB", numericSettings);
		
	try {	// try using formatToParts. If not usable, use localTime previously computed.
		let	localTC = numericOptions.formatToParts(myDate); // Local date and time components at myTZ
		localTime = new Date(Date.UTC		// Construct a UTC date based on the figures of the local date.
				(localTC[6].value, localTC[4].value-1, localTC[2].value, localTC[10].value, localTC[12].value, localTC[14].value));
		if (localTC[8].value == "BC") localTC[6].value = 1-localTC[6].value; // Correct years in BC Era.
		localTime.setUTCFullYear(localTC[6].value);	// If year was a 2-digit figure, ensure true value.
		return { localDate : localTime, accuracy : "exact", way : "ToParts" }; // Success
		}
	catch (e) { // can't use formatToParts. This is MS Edge specific. Just use standard TimezoneOffset.
		return { localDate : localTime, accuracy : "approx" , way : "noformatToParts"}	// 
	}
}
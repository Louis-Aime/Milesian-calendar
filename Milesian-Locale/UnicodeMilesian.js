/* Unicode Milesian functions
two functions and one property-function added to Date, in order to generate date strings using Unicode tools.
Character set is UTF-8
This code, to be manually imported, set properties to object Date for the Milesian calendar, especially to generate date strings
Version M2017-12-28 catches MS Edge generated error
Version M2017-12-26 formal update of M2017-07-04 concerning dependent files.
Version M2018-02-28 
* Rename toMilesianString.js into UnicodeMilesian.js
* full use of Unicode time zone offset base - more specifically non-integer offsets
* add toLocalDate
* suppress pad (not used, replace with standard Unicode functions)
Version M2018-05-16
* Use of .formatToParts method. Non conformant navigator (MS Edge) only know Gregorian calendars
* Add unicodeCalendarHandled (calendar) : from a requested calendar, gives the used one.
Contents
* unicodeCalendarHandled (calendar) : from a requested calendar, gives the effectively used one.
* toLocalDate : return a Date object holding the version shifted by the time zone offset contained in options. 
* toMilesianLocaleDateString ([locale, [options]]) : return a string with date and time, according to locale and options.
Necessary files:
* MilesianMonthNames.xml: fetched source of month names - may be provided by milesianMonthNamesString
* MilesianDateProperties.js (and dependent files)
* MilesianAlertMsg
*/////////////////////////////////////////////////////////////////////////////////////////////
/* Copyright Miletus 2016-2018 - Louis A. de Fouquières
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
*////////////////////////////////////////////////////////////////////////////////
/*
1. Basic tools of this package

1.1 Access to XML file: 
A "real" access is not working the same way an all platform, is not used is such.
In file milesianMonthNamesString.js, const pldr is declared, and milesianNames is constructed.
Note: take care that text items from milesianNames be in the proper character set, corresponding to the Internet site.

1.2 General utilities: 
* pad utility function -> not needed, use Intl.NumberFormat constructor.
* unicodeCalendarHandled : which calendar is effectively used upon request through the Locale nu-ca- parameters
*/
function unicodeCalendarHandled (calendar) { // From an "asked" calendar, gives the "used" one.
	var 	testOptions = new Intl.DateTimeFormat ("en-US-u-ca-"+calendar);
	return 	testOptions.resolvedOptions().calendar;
	}
/*
1.3 Utility to get the local Date-Time as a UTC date.

/** Construct a date that represents the value of the given date shifted to the time zone indicated or resolved in Options.
*/
function toLocalDate (myDate, Options = undefined) {
	if (Options == undefined) var askedOptions = new Intl.DateTimeFormat ()	// require locale and option from present implementation;
	else var askedOptions = new Intl.DateTimeFormat (undefined, Options); // Computed object from asked locales and options
	var usedOptions = askedOptions.resolvedOptions();
	var	localTime = new Date (myDate.valueOf() - myDate.getTimezoneOffset()*Chronos.MINUTE_UNIT); 
		//Basic value if no further computation possible

	// This routine uses formatToParts. Another method is used for MS Edge, but limited to year 100 and above.
	var numericOptions = new Intl.DateTimeFormat ("fr",{weekday: 'long',
		year: 'numeric',  month: 'numeric',  day: 'numeric',  hour: 'numeric',  minute: 'numeric',  second: 'numeric',  era: 'narrow', 
		timeZone: usedOptions.timeZone});
	try {	// try using formatToParts. If not usable, use the variant algorithm
		let	localTC = numericOptions.formatToParts(myDate); // Local date and time components at usedOptions.timeZone
		localTime = new Date(Date.UTC		// Construct a UTC date based on the figures of the local date.
				(localTC[6].value, localTC[4].value-1, localTC[2].value, localTC[10].value, localTC[12].value, localTC[14].value));
		if (localTC[8].value == "av. J.-C.") localTC[6].value = 1-localTC[6].value;
		localTime.setUTCFullYear(localTC[6].value);	// If year was a 2-digit figure, ensure true value.
		}
	catch (e) {
		if (myDate.getUTCFullYear() > 100)	{ // Browser does not know formatToParts - let's try to do it another way
			// Variant 2 not using formatToParts and trying to save the most, only for date above year 100.
			var parseOptions = new Intl.DateTimeFormat ("en-US",{
				year: 'numeric',  month: 'short',  day: 'numeric',  hour: 'numeric',  minute: 'numeric',  second: 'numeric', era: 'narrow', hour12: false, 
				timeZone: usedOptions.timeZone});
			try {	// Try translating date into a string for the local date, then this string into a UTC date.
					// If navigator does not accept, use standard TZ.
				var localString = parseOptions.format(myDate) + " UTC";	// Elaborate a local display of date and declare it as UTC
				localTime = new Date(localString);
				}
				
			catch (e) {	// If navigator still did not accept, return standard basic local time
				throw "Browser does not handle Unicode functions"; 
				}
			//			
		}
		else { 
			throw "Browser does not handle Unicode functions"; 
			}
		}
	return localTime; 
}
//////////////////////////////////////////////////////
//
// 2. Method added to Date object for Milesian dates
//
//////////////////////////////////////////////////////
// The following method elaborates a string giving the date in Milesian, under several locales and options.
// This method is a draft model, the result is not totally in line with the expected results of such functions.
// It just show that these layouts are possible.
// The method makes the best possible use of Unicode time zone offset base.
//////////////////////////////////////////////////////
/**
* toMilesianLocaleDateString yields a string representing this Date in Milesian, following the Locale and options given.
* parameter: locales, a Unicode Locale. Current Locale if left undefined.
* parameter: options, set of options. Current default options if left undefined.
* return: a string.
*/
Date.prototype.toMilesianLocaleDateString = function (locales = undefined, options = undefined) {

	// Check milesianNames established - to be done when searching  milesianNames; if note found, use abbreviated names.
	// if (milesianNames == undefined) return ""; else 
		
	// Initialise string parts
	let str = ""; 	// the final string for this date and time;
	let wstr = "", dstr = "", mstr = "", ystr = "" ; // components of date string
	let tstr = "", tzstr = ""; 	// components of time string.
	let wsep = " ", msep = " ", ysep = " ";	// separators of date elements, "/", ", " or " ".
	let localTime = new Date(); // used in several parts of this function.

	// Establish effective options through "negotiation"
	if (options == undefined) var askedOptions = new Intl.DateTimeFormat (locales)	// require locale and option from present implementation;
	else var askedOptions = new Intl.DateTimeFormat (locales, options); // Computed object from asked locales and options
	var usedOptions = askedOptions.resolvedOptions(); // resolve options to use after "negotiation": 
	// example of standard usedOptions: { locale: "fr-FR", calendar: "gregory", numberingSystem: "latn", timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", year: "numeric" }
	// while specifying option, caller may suppress year, month or day.
	
	// Set a 2-digit and a 3-digit formatters
	var format2 = new Intl.NumberFormat (undefined, {minimumIntegerDigits : 2, useGrouping : false});
	var format3 = new Intl.NumberFormat (undefined, {minimumIntegerDigits : 3, useGrouping : false});
	
	// Get local Day-time elements under selected option, and compute time offset from UTC time, in order to compute a "local" date-time.
	// Due to the limitations with MS-Edge, try to exit only on specific cases.
	try {
	localTime = toLocalDate (this, {timeZone : usedOptions.timeZone});
		}
	catch (e) {	// Got limitation from navigator - give a desesparate ersatz version, else abort
		if (options == undefined) // No options given at call, system local time zone assumed
			localTime.setTime(this.valueOf()-this.getTimezoneOffset()*Chronos.MINUTE_UNIT)
		else if (usedOptions.timeZone=="UTC") localTime.setTime(this.valueOf()) // If timeZone option was UTC, computation remains possible
		else return milesianAlertMsg ("browserError");
		}
	// Get effective language and country, and set whether month should come before day
	let lang = usedOptions.locale[0] + usedOptions.locale[1], country = usedOptions.locale[3] + usedOptions.locale[4]; // Decompose Locales string.
	let monthDay = false;	// true for languages and country
	if (usedOptions.weekday !== undefined) {
		try {	// As MS Edge may throw a range error for any date before 0001-01-01, error is caught and wstr set to blank
			// construct weekday with asked language, and in Gregorian calendar
			wstr = localTime.toLocaleDateString ((lang+"-u-ca-gregory"), {timeZone : "UTC", weekday : usedOptions.weekday}); 
			}
		catch (e) {
			wstr = "";	// case of date range error: weekday set to blank, computations continue
		}
	}

	// Compute year
	switch (usedOptions.year) {	// Compute year string
		case "numeric": ystr = format3.format(localTime.getMilesianUTCDate().year); break;
		case "2-digit": ystr = "'" + format2.format(localTime.getMilesianUTCDate().year % 100); break;
		default : break; }
		
	// Compute year separator
	if (ystr !== "") switch (lang) {	// Language dependent year separator, if month is not numeric
		case "en" : switch (country) { 	// Depending on English-speaking countries, a comma may be necessary
			case "US" : case "CA" : ysep = ", "; monthDay = true; break;
			default : ysep = " "; break
			}; break;		
		case "es" : case "pt" : ysep = " de "; break;
		}
	
	// Compute separator between month and day, depending on month option.
	switch (usedOptions.month) {	
		case "numeric": case "2-digit" : msep = "/"; break;
		case "narrow": case "short" : case "long" : 
			switch (lang) { 		// If month is not a numeric value, there a sign or text. Here we use short-cuts.
				case "es" : case "pt": msep = " de "; break; 
				case "de" : msep = ". "; break; 	// In German, you have to put a dot after the day number. 
				default : msep = " "; break; } 
			break;
		default : break; }
	if (msep == "/" && ysep !== "") ysep = "/"; // If there is a year element, and month element is numeric, year separator shall always be "/"

	// Compute month part of string 
	let Xpath1 = "", node = undefined;	// will be used for searching the month's names in the Locale data registry
	switch (usedOptions.month) {	
//		case "numeric": mstr = this.getMilesianDate().month+1; break; That is the "easy" way, we do not use it. Numeric should give 1m, 2m etc, like "narrow".
		case "2-digit": mstr = format2.format (localTime.getMilesianUTCDate().month+1); break;
		case "narrow":	// Only the international (Latin) value can be used in this case
			Xpath1 = "/pldr/ldmlBCP47/calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='narrow']/month[@type="
				+ (localTime.getMilesianUTCDate().month+1) + "]";
			node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
			mstr = node.stringValue;
			break;
		case "short": case "numeric" :	// Only the international "xm" format, where x is 1 to 12, is used in these cases.
			Xpath1 = "/pldr/ldmlBCP47/calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type="
				+ (localTime.getMilesianUTCDate().month+1) + "]";
			node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
			mstr = node.stringValue;
			break;
		case "long":	// By default, take the Latin name;
			Xpath1 = "/pldr/ldmlBCP47/calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type="
				+ (localTime.getMilesianUTCDate().month+1) + "]";
			node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
			mstr = node.stringValue;
			// Search if a national ("Locale") name exists
			Xpath1 = "/pldr/ldml/identity/language[@type=" + "'"+lang+"'"+ "]/../calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type="
				+ (localTime.getMilesianUTCDate().month+1) + "]";
			node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
			if (node.stringValue !== "") mstr = node.stringValue; // If found, replace Latin name with language-dependant.
			break;
		default : break; }
		
	// Compute day string, a plain numeric or 2-digit string.	
	switch (usedOptions.day) {	
		case "numeric": dstr = localTime.getMilesianUTCDate().date; break;	// no blank
		case "2-digit": dstr = format2.format (localTime.getMilesianUTCDate().date); break;
		default : break; }
		
	//	Finally Time part.
	if (usedOptions.hour !== undefined || usedOptions.minute !== undefined || usedOptions.hour !== undefined) 
		tstr = new Intl.DateTimeFormat (usedOptions.locale, 
		  {timeZone: "UTC", hour : usedOptions.hour, minute : usedOptions.minute, second : usedOptions.second}).format(localTime);

	//Compute weekday separator, which depends on language
	if (wstr !== "" && dstr !== "") switch (lang) {	
		case "en": case "de": case "es": case "pt": wsep = ", "; break;
		case "da": wsep = (usedOptions.month == "numeric" || usedOptions.month == "2-digit") ? " " : " den "; break;
		default : wsep = " "; break;	} 

	// Concatenate string
	str += wstr + wsep;		// Weekday element
	if (monthDay)   // Construct day and month in order specified
			{ if (mstr !== "") {str += mstr + ((dstr !=="") ? msep + dstr : "")} else str += dstr }
			else  
			{ if (mstr !== "") {str += ((dstr !=="") ? dstr + msep : "" ) + mstr} else str += dstr}	;	
	str += ysep + ystr ;	// Add year separator and year
	str += (tstr == "" ? "" : " " + tstr);
	return str; 
}

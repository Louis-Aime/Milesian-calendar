/* Unicode Milesian date string generation functions
	Character set is UTF-8
Milesian date string generation functions using Unicode tools.
	This code, to be manually imported, set properties to object Intl.DateTimeFormat, in order to generate Milesian date strings
	using Intl.DateTimeFormat.prototype.
Versions
	M2017-12-28 catches MS Edge generated error
	M2017-12-26 formal update of M2017-07-04 concerning dependent files.
	M2018-02-28 
		Rename toMilesianString.js into UnicodeMilesian.js
		full use of Unicode time zone offset base - more specifically non-integer offsets
		add toLocalDate
		suppress pad (not used, replace with standard Unicode functions)
	M2018-05-20
		Use of .formatToParts method
		Define 2 new methods on Intl.DateTimeFormat, one "format" and one "formatToParts"
		For non conformant browsers (MS Edge), make it possible to generate and parse a date in order to compute time zone offset. 
		Add unicodeCalendarHandled (calendar) : from a requested calendar (in Locale), gives the used one.
	M2018-05-30
		Restructure toLocalDate parameters - whenever possible, TZ parameter passed is used.
	M2018-10-26
		Delete a whole set of complicated code dedicated to MS Edge, that lack most calendar functions.
	M2018-10-29
		Update comments
Contents
	unicodeCalendarHandled (calendar) : from a requested calendar, gives the effectively used one.
	toLocalDate : return a Date object holding the date shifted by the time zone offset of a given Unicode (IANA) time zone. 
	Intl.DateTimeFormat.prototype.milesianFormatToParts  : return elements of string with date and time, according to DateTimeFormat.
	Intl.DateTimeFormat.prototype.milesianFormat : : return a string with date and time, according to DateTimeFormat.
Required:
	Access to milesianNames, a global object that hold the names of milesian months in several languages
		This object is either constructed through milesianMonthNamesString.js
		or fetched from MilesianMonthNames.xml through milesianCommonSettings
		(this way seems ideal, but is complex and finally not recommended)
	MilesianDateProperties.js (and dependent file CBCCE)
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

1.1 Access to the list of month names: 
Object milesianNames, resulting from a DOMParser operation, hold the names of milesian calendar items in several languages.
Please take care that text items from milesianNames be in the proper character set, corresponding to the Internet site's.

1.2 General utilities: 
*	unicodeCalendarHandled : which calendar is effectively used upon request through the Locale nu-ca- parameters
*/
function unicodeCalendarHandled (calendar) { // From an "asked" calendar, gives the "used" one.
	return 	new Intl.DateTimeFormat("en-US-u-ca-"+calendar).resolvedOptions().calendar;
	}
/*
1.3 Utility to get the local Date-Time as an UTC date.

/** Construct a date that represents the value of the given date shifted to the time zone indicated or resolved in Options.
As in many situations it is not possible to compute the exact local Date-Time, the result here is an Object:
{ localDate : (a Date object with the best possible result), accuracy : (see under), way :(for debug, how did we compute)}
Possible values for accuracy:
	"exact" : local date has been computed with formatToParts or by parsing a date string, in a 'safe' period.
	"approximate" : local date could not be computed exactly, the returned date is the local date as from the user's settings, not from Unicode.
*/
function toLocalDate (myDate, myTZ = "") {  //myTZ : a string with the name of a time zone. 
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
/*/////////////////////////////////////////////////////

2. Methods added to Intl.DateTimeFormat object for display of Milesian dates

The method makes the best possible use of Unicode concepts for calendar, and re-use the expression pattern of gregory dates.

2.1 FormatToParts in milesian elements

*/

Intl.DateTimeFormat.prototype.milesianFormatToParts	= function (myDate) { // Give formatted elements of a Milesian date.
	// This function works only if .formatToParts is provided, else an error is thrown.
	// .formatToParts helps it to have the same order and separator as with a Gregorian date expression.
	var	
		locale = this.resolvedOptions().locale,	// Fetch the locale from this 
		lang = locale.includes("-") ? locale.substring (0,locale.indexOf("-")) : locale;	// the pure language identifier, without country
	// Change the calendar of locale to "gregory"
	locale = (locale.includes("-u-") 
		? 	(locale.substring(locale.indexOf("-u-")).includes("ca-") 
				? locale.substring (0,locale.indexOf("ca-",locale.indexOf("-u-")))
				: locale )
			+ "ca-"
		: locale + "-u-ca-"
		) + "gregory" ;
	var 
		figure2 = new Intl.NumberFormat (locale, {minimumIntegerDigits : 2, useGrouping : false}),
		figure3 = new Intl.NumberFormat (locale, {minimumIntegerDigits : 3, useGrouping : false});
	var 
		constructOptions = new Intl.DateTimeFormat(locale,this.resolvedOptions()), 
		referenceOptions = constructOptions.resolvedOptions();
	var milesianComponents; 	// To be initiated later
	try	{
		let referenceComponents = constructOptions.formatToParts (myDate); // Implementations which do not accept this function will throw an error
		let TZ = referenceOptions.timeZone;	// Used time zone. In some cases, "undefined" is given, meaning system time zone.
		if (TZ == undefined) 	milesianComponents = myDate.getMilesianDate();	// system local date, expressed in Milesian
		else 				milesianComponents = toLocalDate(myDate, TZ).localDate.getUTCMilesianDate(); // TZ local date.
		// Here milesianComponents holds the local Milesian date figures, we replace the Gregorian day, month and year components with those.
		let monthContext = 'format'; // Begin computing the context, 'format' or 'stand-alone'
		if (referenceOptions.day == undefined && referenceOptions.year == undefined) monthContext = 'stand-alone';
		return referenceComponents.map ( ({type, value}) => {
			switch (type) {
				case "era" : return {type:type, value: ""};  	// No era in the Milesian system
				case "year": switch (referenceOptions.year) {
					case "2-digit" : // Authorised only if displayed year is strictly positive, and with a quote.
						if (milesianComponents.year > 0) return {type:type, value: ("'" + figure2.format(milesianComponents.year % 100))};
					default : return {type:type, value: figure3.format(milesianComponents.year)}; // Return complete year, 3-digit, even if (negative) 2-digit asked 
					}
				case "day": switch (referenceOptions.day) {		// Unicode says "day" where original JS says "date" (in French: "quantième du mois")
					case "2-digit" : return {type:type, value: figure2.format(milesianComponents.date)}; 
					default : return {type:type, value: milesianComponents.date}; 
					} 
				case "month" : 
					let Xpath1 = "", node = undefined;	// will be used for searching the month's names in the Locale data registry
					let monthWidth = "";
					switch (referenceOptions.month) {	
					//	case "numeric": return milesianComponents.month+1; break; That is the "easy" way, we do not use it. Numeric should give 1m, 2m etc, like "narrow".
						// case "2-digit": return {type:type, value: figure2.format (milesianComponents.month+1)};
						case "numeric" : case "2-digit": monthWidth = "numeric" ; break; 
						case "narrow":	monthWidth = "narrow" ; break;
						case "short": monthWidth = "abbreviated"; break; 
						case "long" : monthWidth = "wide"; break;
						default : return {type:type, value: (milesianComponents.month+1)+"m"};
						} 	// end of referenceMonth switch
					// Now fetch month string value from database.
					Xpath1 = "/pldr/ldmlBCP47/calendar[@type='milesian']/months/monthContext[@type='"+monthContext
						+"']/monthWidth[@type='"+monthWidth
						+"']/month[@type="+(milesianComponents.month+1) + "]";
					node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
					let revis = node.stringValue;
					// Search if a language specific name exists
					Xpath1 = "/pldr/ldml/identity/language[@type='"+lang
						+"']/../calendar[@type='milesian']/months/monthContext[@type='"+monthContext
						+"']/monthWidth[@type='"+monthWidth
						+"']/month[@type=" + (milesianComponents.month+1) + "]";
					node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
					if (node.stringValue !== "") revis = node.stringValue; // If found, replace Latin name with language specific one.
					if (referenceOptions.month == "2-digit" && !isNaN(revis)) revis = figure2.format (revis);
					return {type:type, value: revis}; 
				default : return {type: type, value: value};
				}	// Other values in parts are not changed.
			});	// End of mapping function
		}	// end of try
	catch (e) {
		throw e; // Error to be handled by caller, but do not stop working.
		}
}
/*
2.2 Construct a string that expresses a date in the Milesian calendar.
*/
Intl.DateTimeFormat.prototype.milesianFormat = function (myDate) { // Issue a Milesian string for the date.
	// First, try using FormatToParts
	try {
		let parts = this.milesianFormatToParts (myDate); // Compute components
		return parts.map(({type, value}) => {return value;}).reduce((buf, part)=> buf + part, "");
		}
	// FormatToParts does not work, however we can use a backup version using the backup LocalDate, without formatting the Milesian date.
	catch (e) { // just catch and continue
	}
	try { // Compute a local date, mention accuracy
		var	those = this.resolvedOptions(), 
			localComput;
		try {
			localComput = toLocalDate(myDate, those.timeZone); // In some browsers, the resolved time zone may not be a valid option !
			}
		catch (e) {
			localComput = toLocalDate(myDate);	
			localComput.accuracy = "approximate";
		}
		return localComput.localDate.toUTCIntlMilesianDateString() 
			+ " " + (those.hour == null ? "" :(new Intl.DateTimeFormat(those.locale, 
						{hour : those.hour, minute : those.minute, second : those.second, hour12 : false, timeZone : "UTC"}))
						.format(localComput.localDate))
			+ ((localComput.accuracy == "exact") ? "" : " (approx)"); 
	}
	catch (e) { // This case should only happen in case of error with resolvedOptions or with the last return statement
	}
	var myTimeString;
	try {
		myTimeString = myDate.toLocaleTimeString(this.locale,those);
		}
	catch (e) {
		myTimeString = myDate.toTimeString();	// the minimum version
	}
	return myDate.toIntlMilesianDateString()
				+ " " + myTimeString
				+ " (system)"; 
}
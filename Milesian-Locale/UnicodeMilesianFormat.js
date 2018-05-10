/* Unicode Milesian functions
Milesian date string generation functions using Unicode tools.
Using Intl.DateTimeFormat.prototype.
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
* Intl.DateTimeFormat.prototype.milesianFormatToParts  : return elements of string with date and time, according to DateTimeFormat.
* Intl.DateTimeFormat.prototype.milesianFormat : : return a string with date and time, according to DateTimeFormat.
* the former Date.prototype.toMilesianLocaleDateString is deprecated.
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
	var	localTime = new Date (myDate.valueOf() - myDate.getTimezoneOffset()*Chronos.MINUTE_UNIT); //Basic value if no further computation possible
	if (Options.timeZone == undefined) // Very simple case: time zone is system default
		return localTime 
	else if (Options.timeZone == "UTC") return new Date(myDate.valueOf())	// Other trivial case: TZ asked is UTC.
	else { // Now the difficult part begins
		var askedOptions = new Intl.DateTimeFormat (undefined, Options); // Computed object from asked locales and options
		var usedOptions = askedOptions.resolvedOptions();

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
					let tryTime = new Date(localString); // If error occurs here, will not destroy backup result
					let test = Math.abs(myDate.valueOf() - tryTime.valueOf());
					if (!isNaN(test) && (Math.abs(test) < 2*Chronos.DAY_UNIT)) localTime = tryTime; // last security against unwanted effects
					}
					
				catch (e1) {	// If navigator still did not accept, return standard basic local time (as initialised)
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
/*
This new version: 
	deprecates toMilesianLocaleDateString (as a Date method)
	defines
		Intl.DateTimeFormat.prototype.milesianFormat, done
		and milesianFormatToParts, as an intro to the formatter
*/
Intl.DateTimeFormat.prototype.milesianFormatToParts	= function (myDate) { // Give formatted elements of a Milesian date.
	// This function works only if .formatToParts is provided, else an error is thrown.
	// .formatToParts helps it to have the same order and separator as with a Gregorian date expression.
	var	
		locale = this.resolvedOptions().locale,	// Fetch the locale from this and change the calendar into "gregory"
		lang = locale.includes("-") ? locale.substring (0,locale.indexOf("-")) : locale;	// the pure language identifier, without country
	if (locale.includes("-u-"))
		locale = locale.substring (0,locale.indexOf("ca-",locale.indexOf("-u-"))) + "ca-gregory"
		else locale = locale + "-u-ca-gregory"; // The locale with language, possibly country, maybe numbering system, and Gregorian calendar.
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
		else 				milesianComponents = toLocalDate(myDate,{timeZone: TZ}).getUTCMilesianDate(); // TZ local date.
		// Here milesianComponents holds the local Milesian date figures, we replace the Gregorian day, month and year components with those.
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
					// return (milesianComponents.month+1) + "m" // maybe not necessary
					switch (referenceOptions.month) {	
					//	case "numeric": return milesianComponents.month+1; break; That is the "easy" way, we do not use it. Numeric should give 1m, 2m etc, like "narrow".
						case "2-digit": return {type:type, value: figure2.format (milesianComponents.month+1)};
						case "narrow":	// Only the international (Latin) value can be used in this case
							Xpath1 = "/pldr/ldmlBCP47/calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='narrow']/month[@type="
								+ (milesianComponents.month+1) + "]";
							node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
							return {type:type, value: node.stringValue};
						case "short": case "numeric" :	// Only the international "xm" format, where x is 1 to 12, is used in these cases.
							Xpath1 = "/pldr/ldmlBCP47/calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type="
								+ (milesianComponents.month+1) + "]";
							node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
							return {type:type, value: node.stringValue};
						case "long":	// By default, take the Latin name;
							Xpath1 = "/pldr/ldmlBCP47/calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type="
								+ (milesianComponents.month+1) + "]";
							node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
							let revis = node.stringValue;
							// Search if a national ("Locale") name exists
							Xpath1 = "/pldr/ldml/identity/language[@type=" + "'"+lang+"'"+ "]/../calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type="
								+ (milesianComponents.month+1) + "]";
							node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
							if (node.stringValue !== "") revis = node.stringValue; // If found, replace Latin name with language-dependant.
							return {type:type, value: revis}; 
						default : return {type:type, value: (milesianComponents.month+1)+"m"}; 
						} 	// end of "month" case
				default : return {type: type, value: value};
				}	// Other values in parts are not changed.
			});	// End of mapping function
		}	// end of try
	catch (e) {
		throw e	// Error to be handled by caller
		return;	// return undefined item
	}
}

Intl.DateTimeFormat.prototype.milesianFormat = function (myDate) { // Issue a Milesian string for the date.
	try {
		var parts = this.milesianFormatToParts (myDate); // Compute components
		return parts.map(({type, value}) => {return value;}).reduce((buf, part)=> buf + part, "");
		}
	catch (e) {
		return milesianAlertMsg("browserError")+"("+myDate.toUTCIntlMilesianDateString()+" UTC)";
	}
}
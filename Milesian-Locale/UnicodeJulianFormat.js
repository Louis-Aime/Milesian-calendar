/* Unicode Julian calendar date string generation functions
	Character set is UTF-8
Julian date string generation functions using Unicode tools.
	This code, to be manually imported, set properties to object Intl.DateTimeFormat, in order to generate Julian calendar date strings
	using Intl.DateTimeFormat.prototype.
Versions
	M2018-11-11 Initiate from UnicodeMilesianFormat, separate and comment
	M2018-11-14 instead of alerting, return an error message as result if FormatToParts not implemented
Contents
	-- unicodeCalendarHandled (calendar) : from a requested calendar, gives the effectively used one.
	-- toLocalDate : return a Date object holding the date shifted by the time zone offset of a given Unicode (IANA) time zone. 
	Intl.DateTimeFormat.prototype.julianFormatToParts  : return elements of string with date and time, according to DateTimeFormat.
	Intl.DateTimeFormat.prototype.julianFormat : : return a string with date and time, according to DateTimeFormat.
Required:
	JulianDateProperties (and dependent file CBCCE)
	toLocalDate (working version on UnicodeMilesianFormat, to be transferred to some other file.)
	Intl object with FormatToParts
*/
/* Copyright Miletus 2018 - Louis A. de Fouquières
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
/** @description FormatToParts that issues parts of a Julian calendar date.
 * @param {Date object} myDate - the date to display, like for standard FormatToParts method.
 * @returns {Object} same object structure than for FormatToParts method.
*/
Intl.DateTimeFormat.prototype.julianFormatToParts = function (myDate, eraIfNeeded = true) { // Give formatted elements of a Julian calendar date.
	// This function works only if .formatToParts is provided, else an error is thrown.
	// .formatToParts helps it to have the same order and separator as with a Gregorian date expression.
	// eraIfNeeded means: put only BC era, in "narrow" option if "era" is undefined.
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
		constructOptions = new Intl.DateTimeFormat(locale,this.resolvedOptions()),
		referenceOptions = constructOptions.resolvedOptions();
	try	{
		let referenceComponents = constructOptions.formatToParts (myDate); // Implementations which do not accept this function will throw an error
		let TZ = referenceOptions.timeZone;	// Used time zone. In some cases, "undefined" is given, meaning system time zone.
		var julianComponents = (TZ == undefined
			? myDate.getJulianDate()	// system local date, expressed in Julian
			: julianComponents = toLocalDate(myDate, TZ).localDate.getUTCJulianDate() ); // TZ local date.
		// Here julianComponents holds the local Julian date figures, we replace the Gregorian date, month, year and era components with those.
		// The trick is this: we construct the date and month with the Gregorian date that uses the Julian figures,
		// then we insert the right year and era, computed separately.
		var 
			gregDate = new Date (Date.UTC(2000, julianComponents.month, julianComponents.date)),
			BC = (julianComponents.year <= 0), 
			eraOption = (BC ? (referenceOptions.era == undefined ? 'narrow' : referenceOptions.era) : referenceOptions.era);
		if (eraOption != null) referenceOptions.era = eraOption; // add eraOption if required
		constructOptions = new Intl.DateTimeFormat(locale,referenceOptions); // Re-construct formatting object
		referenceComponents = constructOptions.formatToParts (myDate);		// and re-construct array of parts
		var eraDate = new Date (0); eraDate.setUTCFullYear(julianComponents.year); // Hold the "era" part

		return referenceComponents.map ( ({type, value}) => {
			switch (type) {
				case "era" : case "year" : return {type:type, 
						value: constructOptions.formatToParts(eraDate).find(item => item.type == type).value}
				case "month" : case "day" : return {type:type, 
						value: constructOptions.formatToParts(gregDate).find(item => item.type == type).value}
				default : return {type: type, value: value};
				}
			});	// End of mapping function
		}	// end of try
	catch (e) {
		throw e; // Error to be handled by caller, but do not stop working.
		}
}
/** @description a .format method that issues a string representing a Julian calendar date.
 * @param {Date object} myDate - the date to display, like for standard FormatToParts method.
 * @returns {string} the date following the Unicode options
*/
Intl.DateTimeFormat.prototype.julianFormat = function (myDate) { 
	// First, try using FormatToParts
	try {
		let parts = this.julianFormatToParts (myDate); // Compute components
		return parts.map(({type, value}) => {return value;}).reduce((buf, part)=> buf + part, "");
		}
	// FormatToParts does not work -> just leave an error message
	catch (e) { // just catch and continue
		return (milesianAlertMsg ('browserError'))
	}
}
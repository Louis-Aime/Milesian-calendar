/* Unicode Julian calendar date string generation functions
	Character set is UTF-8
Julian date string generation functions using Unicode tools.
	This code, to be manually imported, set properties to object Intl.DateTimeFormat, in order to generate Julian calendar date strings
	using Intl.DateTimeFormat.prototype.
Versions
	M2018-11-11 Initiate from UnicodeMilesianFormat, separate and comment
	M2018-11-14 instead of alerting, return an error message as result if FormatToParts not implemented
	M2018-11-24 use toResolvedLocalDate in place of toLocalDate
	M2019-11-18 make same changes as in UnicodeJulianFormat: add a thisOptions variable (now myOptions), and suppress useless error catching.
	M2020-01-12 use options specified in Locale, use strict mode.
	M2020-03-12 Optional parameter of julianFormat is boolean
	M2020-10-07 eraDisplay option instead of exceptCurrentEra, adapt to new dateStyle option
	M2020-10-11 simplify handling of calendar options
Contents
	Intl.DateTimeFormat.prototype.julianFormatToParts  : return elements of string with date and time, according to DateTimeFormat.
	Intl.DateTimeFormat.prototype.julianFormat : : return a string with date and time, according to DateTimeFormat.
Required:
	JulianDateProperties (and dependent file CBCCE)
	UnicodeBasic
	Intl object with FormatToParts
*/
/* Copyright Miletus 2018-2019 - Louis A. de Fouquières
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
/** @description FormatToParts that issues parts of a Julian calendar date.
 * @param {Date object} myDate - the date to display, like for standard FormatToParts method.
 * @param {string} eraDisplay - optional, state whether era field should be displayed, by default era is displayed only before 1 Jan. 1.
 * @returns {Object} same object structure as for formatToParts method.
*/
Intl.DateTimeFormat.prototype.julianFormatToParts = function (myDate, eraDisplay = "past") { // Give formatted elements of a Julian calendar date.
	// This function works only if .formatToParts is provided, else an error is thrown.
	// .formatToParts helps it to have the same order and separator as with a Gregorian date expression.
	// eraDisplay is recomputed following other display options: even if era to be displayed, display only for terminated eras.

	// Build a DateTimeFormat object with iso8601 calendar
	var	
		myOptions = this.resolvedOptions();
		myOptions.calendar = "iso8601"; // the calendar option supersedes the locale
	var	langCountry = myOptions.locale.includes("-u-") ? myOptions.locale.substring (0,myOptions.locale.indexOf("-u-")) : myOptions.locale,
		constructOptions = new Intl.DateTimeFormat(langCountry,myOptions),
		referenceOptions = constructOptions.resolvedOptions(),
		referenceComponents = constructOptions.formatToParts (myDate), // Implementations which do not accept this function will throw an error
		TZ = referenceOptions.timeZone,	// Used time zone. In some cases, "undefined" is given, meaning system time zone.
		julianComponents = (TZ == undefined
			? myDate.getJulianDate()	// system local date, expressed in Julian
			: toResolvedLocalDate(myDate, TZ).getUTCJulianDate() ), // TZ local date.
		// Here julianComponents holds the local Julian date figures, we replace the Gregorian date, month, year and era components with those.
		// The trick is this: we construct the date and month with the Gregorian date that uses the Julian figures,
		// then we insert the right year and era, computed separately.
		gregDate = new Date (Date.UTC(2000, julianComponents.month, julianComponents.date)); // leap year, so that 29 Feb. is possible.

	// Establish effective eraDisplay
	if (myOptions.year == undefined && myOptions.dateStyle == undefined) eraDisplay = "never"; // no attempt to display era if no option requires it
	if (eraDisplay == "past") eraDisplay = ( julianComponents.year > 0 ? "never" : "always" );
	switch (eraDisplay) {
		case "never" : delete referenceOptions.era ; break;
		case "always" : if (referenceOptions.year !== undefined && referenceOptions.era == undefined) referenceOptions.era = "short"; break;
	} // nothing done if other value

	// Build display string

	constructOptions = new Intl.DateTimeFormat(langCountry,referenceOptions); // Re-construct formatting object
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
}
/** @description a .format method that issues a string representing a Julian calendar date.
 * @param {Date object} myDate - the date to display, like for standard FormatToParts method.
 * @param {string} eraDisplay - optional, state whether era field should be displayed, by default era is displayed only before 1 Jan. 1.
 * @returns {string} the date following the Unicode options
*/
Intl.DateTimeFormat.prototype.julianFormat = function (myDate, eraDisplay = "past") { 
	// First, try using FormatToParts
	try {
		let parts = this.julianFormatToParts (myDate, eraDisplay); // Compute components
		return parts.map(({type, value}) => {return value;}).reduce((buf, part)=> buf + part, "");
		}
	// julianFormatToParts does not work, return error code
	catch (e) { 
		alert (e.message + "\n" + e.fileName + " line " + e.lineNumber);
		return (milesianAlertMsg ('browserError'))
	}
}
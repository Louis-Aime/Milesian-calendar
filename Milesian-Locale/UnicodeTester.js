/* Unicode Tester: test Unicode calendars formatting capabilities. 
To be used with UnicodeTester.html
Character set is UTF-8
Versions: preceding versions were a personal makeup page, under the name writeMilesian.
	M2018-05-22 : incorporated time management tools and secured entries
	M2018-05-29 : enhanced and simplified control of options
	M2018-11-16 : adapt to new (bugged) time zone handling
	M2019-06-08 : change one field
	M2019-07-27 : mention getRealTZmsOffset - no functional change
	M2019-11-18 : add display of Julian calendar date, with era on demand
	M2019-12-14 : add handling and display of all format options
	M2019-12-22 : Use an external function of UnicodeBasic to filter bad calendrical computation cases, and add ISO display
	M2020-01-12 : Use strict and add Unicode extension (possibly other calendar)
	M2020-01-14	: 
		Use milliseconds also
		Display toISOString()
	M2020-01-18 :
		Change UTC string: no padding with zeroes, time unit separated.
	M2020-03-12
		Test all formatting options
		Separate experimental era control format option
	M2020-06-03 "min" instead of "mn"
	M2020-10-07 date input also 8601; use new options of Unicode
	M2020-10-11 handleseparately "calendar" option from "u-ca" part of Locale
	M2020-10-11 handleseparately "calendar" option from "u-ca" part of Locale, handle "am/pm"
Contents: general structure is as MilesianClock.
	setDisplay: modify displayed page after a change
	putStringOnOptions : specifically modify date strings. Called by setDisplay.
	other routines are copied from MilesianClockDisplay
Required:
	MilesianDateProperties.js 
		CBCCE (necessary for MilesianDateProperties)
		getRealTZmsOffset method (necessary for MilesianDateProperties)
	JulianDateProperties.js 
	MilesianMonthNames.xml: 
		or milesianMonthNamesString, a simpler version
	MilesianAlertMsg.js
	UnicodeBasic.js
	UnicodeMilesianFormat.js
	UnicodeJulianFormat.js
	UnicodeEraControlFormat.js
*/
/* Copyright Miletus 2017-2019 - Louis A. de Fouquières
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sub-license, or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
1. The above copyright notice and this permission notice shall be included
   in all copies or substantial portions of the Software.
2. Changes with respect to any former version shall be documented.

The software is provided "as is", without warranty of any kind,
express of implied, including but not limited to the warranties of
merchantability, fitness for a particular purpose and non-infringement.
In no event shall the authors of copyright holders be liable for any
claim, damages or other liability, whether in an action of contract,
tort or otherwise, arising from, out of or in connection with the software
or the use or other dealings in the software.

Inquiries: www.calendriermilesien.org
*/
"use strict";
var 
	targetDate = new Date(),
	shiftDate = new Date (targetDate.getTime() - targetDate.getRealTZmsOffset()),
	TZSettings = {mode : "TZ", msoffset : 0};	// initialisation to be superseded
	//	Options = {weekday : "long", day : "numeric", month: "long", year : "numeric", era : "short",
	//				hour : "numeric", minute : "numeric", second : "numeric"}; 	// Initial presentation options.

function putStringOnOptions() { // get Locale, calendar indication and Options given on page, print String; No control. Called by setDisplay
	let Locale = document.LocaleOptions.Locale.value;
//	let Calendar = document.LocaleOptions.Calendar.value;
	let unicodeAskedExtension = document.LocaleOptions.UnicodeExt.value;
	var askedOptions, usedOptions, eraDisplay; 

	// Test specified Locale
	try {
		if (Locale == "")
			askedOptions = new Intl.DateTimeFormat()
		else askedOptions = new Intl.DateTimeFormat(Locale);
	}
	catch (e) {
		alert (e.message + "\n" + e.fileName + " line " + e.lineNumber); // alert (milesianAlertMsg("invalidCode") + '"' + Locale + '"');
		document.LocaleOptions.Locale.value = ''; 	// Reset Locale indication to empty string
		askedOptions = new Intl.DateTimeFormat()
	}
	Locale = askedOptions.resolvedOptions().locale;	// Locale is no longer empty
	Locale = Locale.includes("-u-") ?  Locale.substring (0,Locale.indexOf("-u-")) : Locale; // Remove Unicode extension
	
	// Add extension
	let unicodeExtension = "-u";
	let extendedLocale = Locale;
//	if (Calendar !== "") unicodeExtension += "-ca-" + Calendar;
	if (unicodeAskedExtension !== "") unicodeExtension += "-" + unicodeAskedExtension;
	if (unicodeExtension !== "-u") extendedLocale += unicodeExtension; 
	
	// Add presentation options
	let Options = {}; 
	if	(document.LocaleOptions.LocaleMatcher.value != "")	Options.localeMatcher = document.LocaleOptions.LocaleMatcher.value;
	if	(document.LocaleOptions.FormatMatcher.value != "")	Options.formatMatcher = document.LocaleOptions.FormatMatcher.value;
	if	(document.LocaleOptions.TimeZone.value != "")	Options.timeZone = document.LocaleOptions.TimeZone.value;
	if	(document.LocaleOptions.Calendar.value != "")	Options.calendar = document.LocaleOptions.Calendar.value;
	if	(document.LocaleOptions.DateStyle.value != "") 	Options.dateStyle = document.LocaleOptions.DateStyle.value;
	if	(document.LocaleOptions.TimeStyle.value != "") 	Options.timeStyle = document.LocaleOptions.TimeStyle.value;
	if	(document.LocaleOptions.Weekday.value != "")	Options.weekday = document.LocaleOptions.Weekday.value;
	if	(document.LocaleOptions.Day.value != "") 	Options.day = document.LocaleOptions.Day.value;
	if	(document.LocaleOptions.Month.value != "") 	Options.month = document.LocaleOptions.Month.value;
	if 	(document.LocaleOptions.Year.value != "")	Options.year = document.LocaleOptions.Year.value;
	if	(document.LocaleOptions.Era.value != "")	Options.era	= document.LocaleOptions.Era.value;
	if	(document.LocaleOptions.Hour.value != "")	Options.hour = document.LocaleOptions.Hour.value;
	if	(document.LocaleOptions.Minute.value != "")	Options.minute = document.LocaleOptions.Minute.value;
	if	(document.LocaleOptions.Second.value != "")	Options.second	= document.LocaleOptions.Second.value;
	if	(document.LocaleOptions.Msdigits.value != "")	Options.fractionalSecondDigits	= document.LocaleOptions.Msdigits.value;
	if	(document.LocaleOptions.TimeZoneName.value != "")	Options.timeZoneName	= document.LocaleOptions.TimeZoneName.value;
	if	(document.LocaleOptions.Hour12.value != "")	Options.hour12	= (document.LocaleOptions.Hour12.value == "true");
	if	(document.LocaleOptions.HourCycle.value != "")	Options.hourCycle	= document.LocaleOptions.HourCycle.value;
	if	(document.LocaleOptions.AmPm.value != "")	Options.dayPeriod	= document.LocaleOptions.AmPm.value;
	
	eraDisplay = undefined;
	if	(document.LocaleOptions.eraDisplay.value != "")	eraDisplay	= document.LocaleOptions.eraDisplay.value;
	
	// Test that Options set is acceptable. If not, display with empty options object
	try {
		askedOptions = new Intl.DateTimeFormat (extendedLocale, Options);
		}
	catch (e) {
		alert (e.message + "\nasked options ignored" ); 
		askedOptions = new Intl.DateTimeFormat (extendedLocale);	// empty Options object
	}

	usedOptions = askedOptions.resolvedOptions();
	
	// Display all effective options
	document.LocaleOptions.Elocale.value = usedOptions.locale;
	document.LocaleOptions.Ecalend.value = usedOptions.calendar;
	document.LocaleOptions.Enum.value = usedOptions.numberingSystem;
	document.LocaleOptions.EtimeZoneName.value = usedOptions.timeZoneName;
	document.LocaleOptions.EdateStyle.value = usedOptions.dateStyle;
	document.LocaleOptions.EtimeStyle.value = usedOptions.timeStyle ;
	document.LocaleOptions.ETimeZone.value = usedOptions.timeZone;
	document.LocaleOptions.Eweekday.value = usedOptions.weekday;
	document.LocaleOptions.Eera.value = usedOptions.era;
	document.LocaleOptions.Eyear.value = usedOptions.year;
	document.LocaleOptions.Emonth.value = usedOptions.month;
	document.LocaleOptions.Eday.value = usedOptions.day;
	document.LocaleOptions.Ehour.value = usedOptions.hour;
	document.LocaleOptions.Eminute.value = usedOptions.minute;
	document.LocaleOptions.Esecond.value = usedOptions.second;
	document.LocaleOptions.Emsdigits.value = usedOptions.fractionalSecondDigits;
	document.LocaleOptions.Ehour12.checked = usedOptions.hour12;
	document.LocaleOptions.EhourCycle.value = usedOptions.hourCycle;
	document.LocaleOptions.EAmPm.value = usedOptions.dayPeriod;
	
	// Build "reference" format object with asked options and ISO8601 calendar, and display non-Unicode calendar string
	extendedLocale = Locale + "-u-ca-iso8601" + (unicodeAskedExtension == "" ? "" : "-" + unicodeAskedExtension); // Build Locale with ISO8601 calendar
	let referenceFormat = new Intl.DateTimeFormat(extendedLocale,usedOptions);
//	document.getElementById("Gstring").innerHTML = referenceFormat.format(targetDate);

	// Display Julian string - with the experimental option
	document.getElementById("Jstring").innerHTML = referenceFormat.julianFormat(targetDate, eraDisplay);

	//Display Milesian string - with no era.
	document.getElementById("Mstring").innerHTML = referenceFormat.milesianFormat(targetDate);

	// Certain Unicode calendars do not give a proper result: here is the control code.
	let valid = unicodeValidDateinCalendar(targetDate, usedOptions.timeZone, usedOptions.calendar),
		myUnicodeElement = document.getElementById("Ustring"),
		myEraControlElement = document.getElementById("ExtUstring");
	try { 
		myUnicodeElement.innerHTML = (valid ? "" : "(!) ") + askedOptions.format(targetDate); 
		}
	catch (e) { 
		alert (e.message + "\n" + e.fileName + " line " + e.lineNumber);
		myUnicodeElement.innerHTML = milesianAlertMsg("browserError"); 
		}
	try {
		myEraControlElement.innerHTML = (valid ? "" : "(!) ") + askedOptions.conditionalEraFormat(targetDate, eraDisplay);
		}
	catch (e) { 
		alert (e.message + "\n" + e.fileName + " line " + e.lineNumber);
		myEraControlElement.innerHTML = milesianAlertMsg("browserError"); 
		}
}

function setDisplay () { // Considering that targetDate time has been set to the desired date, this routines updates all form fields.

	// Time section
	// Initiate Time zone mode for the "local" time from main display
	TZSettings.mode = document.TZmode.TZcontrol.value;
/** TZSettings.msoffset is JS time zone offset in milliseconds (UTC - local time)
 * Note that getTimezoneOffset sometimes gives an integer number of minutes where a decimal number is expected
*/
	TZSettings.msoffset = targetDate.getRealTZmsOffset().valueOf();
	let myElement = document.getElementById("sysTZoffset");
	myElement.innerHTML = new Intl.NumberFormat().format(targetDate.getTimezoneOffset());
	let
		systemSign = (TZSettings.msoffset > 0 ? -1 : 1), // invert sign because of JS convention for time zone
		absoluteRealOffset = - systemSign * TZSettings.msoffset,
		absoluteTZmin = Math.floor (absoluteRealOffset / Chronos.MINUTE_UNIT),
		absoluteTZsec = Math.floor ((absoluteRealOffset - absoluteTZmin * Chronos.MINUTE_UNIT) / Chronos.SECOND_UNIT);
	switch (TZSettings.mode) {
		case "UTC" : 
			TZSettings.msoffset = 0; // Set offset to 0, but leave time zone offset on display
		case "TZ" : 
			document.TZmode.TZOffsetSign.value = systemSign;
			document.TZmode.TZOffset.value = absoluteTZmin;
			document.TZmode.TZOffsetSec.value = absoluteTZsec;
			break;
		case "Fixed" : TZSettings.msoffset = // Here compute specified time zone offset
			- document.TZmode.TZOffsetSign.value 
			* (document.TZmode.TZOffset.value * Chronos.MINUTE_UNIT + document.TZmode.TZOffsetSec.value * Chronos.SECOND_UNIT);
	}

	shiftDate = new Date (targetDate.getTime() - TZSettings.msoffset);	// The UTC representation of targetDate date is the local date of TZ
	
	// Initiate Gregorian form with present local date
    document.milesian.year.value = shiftDate.getUTCMilesianDate().year; // uses the local variable - not UTC
    document.milesian.monthname.value = shiftDate.getUTCMilesianDate().month + 1 ; // Display month value in 1..12 range.
    document.milesian.day.value = shiftDate.getUTCMilesianDate().date;

	// Initiate Milesian form with present local date
    document.gregorian.year.value = shiftDate.getUTCFullYear(); // uses the local variable - not UTC
    document.gregorian.monthname.value = shiftDate.getUTCMonth() + 1 ; // Display month value in 1..12 range.
    document.gregorian.day.value = shiftDate.getUTCDate();
	try {
		document.milesian.dayofweek.value = (new Intl.DateTimeFormat("fr-FR", {weekday : "long", timeZone : "UTC"})).format(shiftDate);
		}
	catch (e) {
		alert (e.message + "\n" + e.fileName + " line " + e.lineNumber);
		document.milesian.dayofweek.value = milesianAlertMsg ("browserError"); 
		}
	// Update local time fields - using	Date properties
	document.time.hours.value = shiftDate.getUTCHours();
	document.time.mins.value = shiftDate.getUTCMinutes();
	document.time.secs.value = shiftDate.getUTCSeconds();
	document.time.ms.value = shiftDate.getUTCMilliseconds();

	// Display UTC date & time in Milesian, ISO, and Posix number
	myElement = document.getElementById("UTCdate");
	myElement.innerHTML = targetDate.toUTCIntlMilesianDateString();
	myElement = document.getElementById("UTCtime");
	myElement.innerHTML = 
	  targetDate.getUTCHours() + " h "
	  + targetDate.getUTCMinutes() + " min " 
	  + targetDate.getUTCSeconds() + " s "
  	  + targetDate.getUTCMilliseconds() + " ms";
	myElement = document.getElementById("ISOdatetime");
	myElement.innerHTML = targetDate.toISOString();
	myElement = document.getElementById("Posixnumber");
	myElement.innerHTML = targetDate.valueOf();

	// Write Milesian, Julian and Unicode strings following currently visible options
	putStringOnOptions();
}

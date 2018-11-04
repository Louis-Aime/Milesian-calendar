/* Milesian Clock and converter functions - part 1
Character set is UTF-8.
These functions are associated with the Milesian clock and converter html page: 
They use the basic Milesian calendar functions, and the conversion functions of other calendar,
in order to display the Milesian on-line clock and to perform calendar conversion.
Associated with: 
*	MilesianClock.html
1. Common functions
*	CBCCE (the Cycle-Based Calendar Computation Engine)
*	MilesianAlertMsg
2. For conversions and clock operation
*	MilesianClockOperations
*	MilesianDateProperties
*	JulianDateProperties
*	FrenchRevDateProperties
*	IsoWeekCalendarDateProperties
*	LunarDateProperties
*	ChronologicalCountConversion
3. For display, using Unicode standards
*	UnicodeMilesianFormat (used to be: toMilesianLocaleDateString then UnicodeMilesian)
*	MilesianMonthNameString (indirectly - or access to the name base in XML)
*/
/*
Version M2018-01-04 :
*	Display julio-gregorian date 
*	Red background when displayed date is outside validity
Version M2018-02-29
*	New modes (UTC, time zone or special offset) to manage date and time.
*	Specify time zone for Unicode part, giving access to numerous "local" times.
*	Enhance control of calendar validity.
Version M2018-05-15
*	Put Unicode and Milesian strings computation in setDisplay. 
Version M2018-10-26
*	askedOptions and userOptions variables were mis-declared, due to a ";" instead of ","
Version M2018-10-29
*	enhanced management of display parameters
Version M2018-11-02
*	Catch out-of-range errors
*	Catch display error on Unicode Um-al-Qura calendar
Version M2018-11-03
*	Display ISO week calendar string
*	Use date entry validity control option
*	Adapt TZ offset to min and sec
Version M2018-11-08
*	Group remote .js file, insert data entry in other file
*/
/* Copyright Miletus 2017-2018 - Louis A. de Fouquières
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
var  // set of global variables, used when updating calendar
	targetDate = new Date(),	// Reference UTC date
	gregorianSwitch =  		// Date where Gregorian calendar enforced 
		new Date (Date.UTC(1582, 11, 20, 0, 0, 0, 0)), // France
	lowerRepublicanDate = new Date (Date.UTC(1792, 8, 22, 0, 0, 0, 0)),	// Origin date for the French Republican calendar
	upperRepublicanDate = new Date (Date.UTC(1806, 0, 1, 0, 0, 0, 0)), // Upper limit of the Republican calendar
	TZSettings = {mode : "TZ", msoffset : 0},	
	Options = {weekday : "long", day : "numeric", month: "long", year : "numeric", 
					hour : "numeric", minute : "numeric", second : "numeric"}, 	
	askedOptions = new Intl.DateTimeFormat(undefined,Options), 	
	userOptions = askedOptions.resolvedOptions(); 

function compLocalePresentationCalendar() {	// Manage date string display parameters
	var 
		Locale = document.LocaleOptions.Language.value,
		Calendar = document.LocaleOptions.Calendar.value,
		timeZone = document.LocaleOptions.TimeZone.value;

	// Negotiate effective language code and display 
	try {
		askedOptions = Locale == "" ? new Intl.DateTimeFormat() : new Intl.DateTimeFormat (Locale);
		}
	catch (e) {	// Locale is not a valid language code
		alert (milesianAlertMsg("invalidCode") + '"' + Locale + '"');
		document.LocaleOptions.Language.value = ''; // user-specified value back to blank
		askedOptions = new Intl.DateTimeFormat();	// and prepare to resolve language code with default value
		}
	userOptions = askedOptions.resolvedOptions(); 
	Locale = userOptions.locale; 	// Here Locale is no longer an empty string
	if (Locale.includes("-u-"))		// The Unicode extension ("-u-") is indicated in the specified locale, drop it
	Locale = Locale.substring (0,Locale.indexOf("-u-"));
		
	// Specify calendar
	if (Calendar !== "") Locale = Locale + "-u-ca-" + Calendar; // No entry error expected
	
	// Set presentation options from one of the standard presentations listed.
	switch (document.LocaleOptions.Presentation.value) {
		case "long":
			Options = {weekday : "long", day : "numeric", month : "long", year : "numeric", era : "long",
					hour : "numeric", minute : "numeric", second : "numeric"};
			break;
		case "standard":
			Options = {weekday : "long", day : "numeric", month: "long", year : "numeric",
					hour : "numeric", minute : "numeric"};
			break;
		case "short":
			Options = {weekday : "short", day : "numeric", month: "short", year : "numeric", era : "short",
					hour : "numeric"};
			break;
		case "narrow":
			Options = {weekday : "narrow", day : "numeric", month: "narrow", year : "numeric", 
					hour : "2-digit", minute : "2-digit", second : "2-digit"};
			break;	
		case "numeric":
			Options = {weekday : "short", day : "numeric", month : "numeric", year : "numeric", era : "narrow",
					hour : "2-digit", minute : "2-digit", second : "2-digit"};
			break;
		case "2-digit":
			Options = {weekday : "narrow", day : "2-digit", month : "2-digit", year : "numeric", 
					hour : "2-digit", minute : "2-digit"};
			break;
		case "year-2-digit":
			Options = {weekday : undefined, day : "2-digit", month : "2-digit", year : "2-digit", 
					hour : "2-digit"};
		}
	
	// Add time zone
	if (timeZone !== "") 
		Options.timeZone = timeZone ; // Object.defineProperty(Options, "timeZone", {enumerable : true, writable : true, value : timeZone});
	// Check here that Options with timeZone is valid
	try {
		askedOptions = Intl.DateTimeFormat (Locale, Options);
		}
	catch (e) {
		alert (milesianAlertMsg("invalidCode") + '"' + Options.timeZone + '"');
		document.LocaleOptions.TimeZone.value = ''; 	// Reset TimeZone indication to empty string
		delete Options.timeZone; // Delete property
		askedOptions = Intl.DateTimeFormat (Locale, Options);	// Finally the options do not comprise the time zone
	}
	userOptions = askedOptions.resolvedOptions();	// The global variable.
}
	
function setDisplay () {	// Disseminate targetDate and time on all display fields

	// Initiate Time zone mode for the "local" time from main display
	TZSettings.mode = document.TZmode.TZcontrol.value;
	// Timezone offset for next computations - opposite of JS off;set.
	// if (isNaN (document.TZmode.TZOffset.value)) alert (milesianAlertMsg("nonNumeric") + ' "' + document.TZmode.TZOffset.value + '"');
	let 
		systemDecimalTZ = - targetDate.getTimezoneOffset(), // Decimal minutes
		systemSign = (systemDecimalTZ < 0 ? -1 : 1),
		absoluteDecimalTZ = systemSign * systemDecimalTZ,
		absoluteTZmin = Math.floor (absoluteDecimalTZ),
		absoluteTZsec = Math.round ((absoluteDecimalTZ-absoluteTZmin) * 60);
	switch (TZSettings.mode) {
		case "TZ" : 
			document.TZmode.TZOffsetSign.value = systemSign;
			document.TZmode.TZOffset.value = absoluteTZmin;
			document.TZmode.TZOffsetSec.value = absoluteTZsec;
		// Continue for  this case, copy computed TZOffset into TZSettings fur future computations
		case "Fixed" : TZSettings.msoffset = 
			- document.TZmode.TZOffsetSign.value 
			* (document.TZmode.TZOffset.value * Chronos.MINUTE_UNIT + document.TZmode.TZOffsetSec.value * Chronos.SECOND_UNIT);
			break;
		// If UTC mode, set computation offset to 0, but set displayed field to TZ value
		case "UTC" : 
			TZSettings.msoffset = 0; 
			document.TZmode.TZOffsetSign.value = systemSign;
			document.TZmode.TZOffset.value = absoluteTZmin;
			document.TZmode.TZOffsetSec.value = absoluteTZsec;
	}
	
	compLocalePresentationCalendar(); // Establish initial / recomputed date string display parameters 

	var shiftDate = new Date (targetDate.getTime() - TZSettings.msoffset);	// The UTC representation of targetDate date is the local date of TZ
	if (isNaN (shiftDate.valueOf())) { // targetDate may be in bounds, and shiftDate out of bounds.
		alert (milesianAlertMsg("outOfRange")) ; return 
	}
	// Initiate milesian clock and milesian string with present time and date
	var myElement = document.querySelector("#clock2");	// myElement is a work variable
	setMilesianCalendarClockHands (myElement, shiftDate.getUTCMilesianDate().year, shiftDate.getUTCMilesianDate().month, shiftDate.getUTCMilesianDate().date,
		shiftDate.getUTCHours(), shiftDate.getUTCMinutes(), shiftDate.getUTCSeconds() );

	var dateComponent = shiftDate.getUTCMilesianDate();	// Initiate a date decomposition in Milesian, to be used several times in subsequent code

	// Update milesian field selector - using Date properties
	document.milesian.year.value = dateComponent.year;
    document.milesian.monthname.value = dateComponent.month;
    document.milesian.day.value = dateComponent.date;
	
	// Update local time fields - using	Date properties
	document.time.hours.value = dateComponent.hours;
	document.time.mins.value = dateComponent.minutes;
	document.time.secs.value = dateComponent.seconds;

	// Write date strings near the clock, using Unicode and Unicode-derived routines
	var labelDate = new Intl.DateTimeFormat (undefined,{timeZone:"UTC",weekday:"long",day:"numeric",month:"long",year:"numeric"});
	// Write Milesian date string
	myElement = document.getElementById("clockmilesiandate"); 	// Milesian date element
	myElement.innerHTML = labelDate.milesianFormat (shiftDate);
	
	// Display julio-gregorian date. Use standard Unicode or UnicodeJulianFormat. 
	// Translate to Julian if before date of switch to Gregorian calendar

	myElement = document.getElementById("juliogregdate");
	if (shiftDate.valueOf() < gregorianSwitch.valueOf()) 	// If target date is before Gregorian calendar was enforced 
		myElement.innerHTML = labelDate.julianFormat(shiftDate)
	else
		myElement.innerHTML = labelDate.format(shiftDate);

	// Update settings (date of switching to gregorian calendar)
	document.gregorianswitch.year.value = gregorianSwitch.getUTCFullYear();
	document.gregorianswitch.monthname.value = gregorianSwitch.getUTCMonth();
	document.gregorianswitch.day.value = gregorianSwitch.getUTCDate();
	
	// Date conversion frame - other calendars than the Milesian
	
    //  Update Gregorian Calendar - using Date properties
    document.gregorian.year.value = shiftDate.getUTCFullYear();
    document.gregorian.monthname.value = shiftDate.getUTCMonth();
    document.gregorian.day.value = shiftDate.getUTCDate();		
	myElement = document.querySelector("#gregorianline");
	if (shiftDate.valueOf() < gregorianSwitch.valueOf()) 	// If target date is before Gregorian calendar was enforced 
		myElement.setAttribute("class", "outbounds")	// Set "outbounds" class: display shall change
	else myElement.removeAttribute("class");			// Else remove class: display shall be normal
	

    //  Update Julian Calendar - using Date properties 
	dateComponent = shiftDate.getUTCJulianDate();
    document.julian.year.value = dateComponent.year;
    document.julian.monthname.value = dateComponent.month;
    document.julian.day.value = dateComponent.date;

    //  Update Republican Calendar - using Date properties
	dateComponent = shiftDate.getUTCFrenchRevDate();
    document.republican.year.value = dateComponent.year;
    document.republican.monthname.value = dateComponent.month;
    document.republican.day.value = dateComponent.date;	
	myElement = document.querySelector("#republicanline");
	if (shiftDate.valueOf() >= upperRepublicanDate.valueOf()
		|| shiftDate.valueOf() < lowerRepublicanDate.valueOf() ) 	// If target date is outside period where Republican calendar was enforced 
		myElement.setAttribute("class", "outbounds")	// Set "outbounds" class: display shall change
	else myElement.removeAttribute("class");			// Else remove class: display shall be normal

	//  Update ISO week calendar - using Date properties
	dateComponent = shiftDate.getUTCIsoWeekCalDate();
	document.isoweeks.year.value = dateComponent.year;
	document.isoweeks.week.value = dateComponent.week;
	document.isoweeks.day.value = dateComponent.day;	
	myElement = document.querySelector("#isoweeksline");
	if (shiftDate.valueOf() < gregorianSwitch.valueOf() ) 	// If target date is before gregorian calendar was enforced 
		myElement.setAttribute("class", "outbounds")	// Set "outbounds" class: display shall change
	else myElement.removeAttribute("class");			// Else remove class: display shall be normal

	// Set Julian Day 
   	document.daycounter.julianday.value = targetDate.getJulianDay();
	
	// Chronological fields frame
	
	// Display chronological counts
	myElement = document.querySelector("#unixCountDisplay");
	myElement.innerHTML = targetDate.valueOf().toLocaleString();
	myElement = document.querySelector("#jdDisplay");
	myElement.innerHTML = targetDate.getCount("julianDay").toLocaleString(undefined,{maximumFractionDigits:6});
	myElement = document.querySelector("#mjdDisplay");
	myElement.innerHTML = targetDate.getCount("modifiedJulianDay").toLocaleString(undefined,{maximumFractionDigits:6});
	myElement = document.querySelector("#nasajdDisplay");
	myElement.innerHTML = targetDate.getCount("nasaDay").toLocaleString(undefined,{maximumFractionDigits:6});
	myElement = document.querySelector("#windowsCountDisplay");
	myElement.innerHTML = targetDate.getCount("windowsCount").toLocaleString(undefined,{maximumFractionDigits:6});
	myElement = document.querySelector("#MacOSCountDisplay");
	myElement.innerHTML = targetDate.getCount("macOSCount").toLocaleString(undefined,{maximumFractionDigits:6});
	
	// Unicode frame 
	myElement = document.querySelector("#langCode");
	// Display Locale (language code only) as obtained after negotiation process
	myElement.innerHTML = userOptions.locale.includes("-u-") ? userOptions.locale.substring (0,userOptions.locale.indexOf("-u-")) : userOptions.locale ;		
	myElement = document.querySelector("#CalendarCode");
	myElement.innerHTML = userOptions.calendar;	// Display calendar obtained after negotiation process
	myElement = document.querySelector("#timeZone");
	myElement.innerHTML = userOptions.timeZone;	// Display time zone as obtained after negotiation process
	
	// Print Unicode string, following already computed options.
 
	let valid = true; 	// Flag the few cases where calendar computations under Unicode yield a wrong result
	// Certain Unicode calendars do not give a proper result: set the flag.
	switch (userOptions.calendar) {	
		case "hebrew": valid = (toLocalDate(targetDate, userOptions.timeZone).localDate.valueOf()
			>= -180799776000000); break;	// Computations are false before 1 Tisseri 1 AM  	
		case "indian": valid = (toLocalDate(targetDate, userOptions.timeZone).localDate.valueOf() 
			>= -62135596800000); break;	// Computations are false before 01/01/0001 (gregorian)
		case "islamic":
		case "islamic-rgsa": valid = (toLocalDate(targetDate, userOptions.timeZone).localDate.valueOf()
			>= -42521673600000); break; // Computations are false before Haegirian epoch
		case "islamic-umalqura": valid = (toLocalDate(targetDate, userOptions.timeZone).localDate.valueOf()
			>= -6227305142400000); break; // Computations are false before 2 6m -195366
		}
	//	Write date string. Catch error if navigator fails to handle writing routine (MS Edge)
	myElement = document.getElementById("UnicodeString");
	try { myElement.innerHTML = (valid ? askedOptions.format(targetDate) : milesianAlertMsg("invalidDate")); } // Plutôt que targetDate.toLocaleTimeString(Locale,Options)
	catch (e) { myElement.innerHTML = milesianAlertMsg("invalidDate"); }

	//	Milesian date string following options. Catch error if navigator fails, in this case write without time part.
	myElement = document.getElementById("milesianDisplay");
	try	{ myElement.innerHTML = askedOptions.milesianFormat(targetDate); } // .toMilesianLocaleDateString(userOptions.locale,Options);
	catch (e) { myElement.innerHTML = milesianAlertMsg("bowserError"); }
	
	// Lunar data frame

	// Update lunar parameters - using targetDate
	dateComponent = targetDate.getCEMoonDate();
	document.moon.age.value = dateComponent.age.toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2}); // age given as a decimal number
	document.moon.residue.value = (29.5305888310185 - dateComponent.age).toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2});
	document.moon.angle.value = targetDate.getDraconiticAngle().toLocaleString(undefined,{maximumFractionDigits:3, minimumFractionDigits:3});		
	document.moon.dracotime.value = new Date(shiftDate.valueOf() + targetDate.getDraconiticSunTimeAngle()).toLocaleTimeString(undefined,{timeZone:'UTC'});
	document.moon.height.value = targetDate.getDraconiticHeight().toLocaleString(undefined,{maximumFractionDigits:3, minimumFractionDigits:3});
	document.moon.moontime.value = new Date(shiftDate.valueOf() + targetDate.getLunarSunTimeAngle()).toLocaleTimeString(undefined,{timeZone:'UTC'});
	document.moon.moondate.value = targetDate.getLunarDateTime().date + " " 
				+  (++targetDate.getLunarDateTime().month) + "m";
	dateComponent = shiftDate.getCELunarDate();				
	document.moon.CElunardate.value = 	dateComponent.date;
	document.moon.CElunarmonth.value = 	++dateComponent.month;
	document.moon.CElunaryear.value = 	dateComponent.year;
	dateComponent = shiftDate.getHegirianLunarDate();	
	document.moon.hegiriandate.value = 	dateComponent.date;
	document.moon.hegirianmonth.value = ++dateComponent.month;
	document.moon.hegirianyear.value = 	dateComponent.year;
	
	// Update Delta T (seconds)
	document.deltat.delta.value = (targetDate.getDeltaT()/Chronos.SECOND_UNIT);
	
	// Display UTC date & time
	myElement = document.getElementById("UTCdate");
	myElement.innerHTML = targetDate.toUTCIntlMilesianDateString();
	myElement = document.getElementById("UTCtime");
	myElement.innerHTML = 
	  targetDate.getUTCHours() + "h "
	  + ((targetDate.getUTCMinutes() < 10) ? "0" : "") + targetDate.getUTCMinutes() + "mn " 
	  + ((targetDate.getUTCSeconds() < 10) ? "0" : "") + targetDate.getUTCSeconds() + "s";
	// This variant makes a bug with MS Edge, if outside the range of handled values :
	/*	targetDate.toLocaleTimeString
		(Locale,{timeZone: "UTC", hour12: false}); */

}

/* Unicode Tester: test Unicode calendars formatting capabilities. 
To be used with UnicodeTester.html
Character set is UTF-8
Versions: preceding versions were a personal makeup page, under the name writeMilesian.
	M2018-05-22 : incorporated time management tools and secured entries
	M2018-05-29 : enhanced and simplified control of options
Contents: general structure is as MilesianClock.
	setDisplay: modify displayed page after a change
	putStringOnOptions : specifically modify date strings. Called by setDisplay.
	other routines are copied from MilesianClockDisplay
Required:
	MilesianDateProperties.js 
		CBCCE (necessary for MilesianProperties)
	MilesianMonthNames.xml: 
		or milesianMonthNamesString, a simpler version
	MilesianAlertMsg.js
	UnicodeMilesianFormat.js
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

var 
	targetDate = new Date(),
	shiftDate = shiftDate = new Date (targetDate.getTime() - targetDate.getTimezoneOffset()*Chronos.MINUTE_UNIT),
	TZSettings = {mode : "TZ", offset : 0, msoffset : 0};	// initialisation to be superseded
//	Options = {weekday : "long", day : "numeric", month: "long", year : "numeric", era : "short",
	//				hour : "numeric", minute : "numeric", second : "numeric"}; 	// Initial presentation options.

function putStringOnOptions() { // get Locale, calendar indication and Options given on page, print String; No control. Called by setDisplay
	let Locale = document.LocaleOptions.Locale.value;
	let Calendar = document.LocaleOptions.Calendar.value;
	let timeZone = document.LocaleOptions.TimeZone.value;
	var askedOptions, usedOptions; 

	// Test specified Locale
	try {
		if (Locale == "")
			askedOptions = new Intl.DateTimeFormat()
		else askedOptions = new Intl.DateTimeFormat(Locale);
	}
	catch (e) {
		alert (milesianAlertMsg("invalidCode") + '"' + Locale + '"');
		document.LocaleOptions.Locale.value = ''; 	// Reset Locale indication to empty string
		askedOptions = new Intl.DateTimeFormat()
	}
	Locale = askedOptions.resolvedOptions().locale;	// Locale is no longer empty
	Locale = Locale.includes("-u-") ?  Locale.substring (0,Locale.indexOf("-u-")) : Locale; // Remove Unicode extension
	
	// Add calendar
	if (Calendar !== "") Locale = Locale + "-u-ca-" + Calendar; 
	
	// Add presentation options
	let Options = {};	
	if	(document.LocaleOptions.Weekday.value != "")	Options.weekday = document.LocaleOptions.Weekday.value;
	if	(document.LocaleOptions.Day.value != "") 	Options.day = document.LocaleOptions.Day.value;
	if	(document.LocaleOptions.Month.value != "") 	Options.month = document.LocaleOptions.Month.value;
	if 	(document.LocaleOptions.Year.value != "")	Options.year = document.LocaleOptions.Year.value;
	if	(document.LocaleOptions.Era.value != "")	Options.era	= document.LocaleOptions.Era.value;
	if	(document.LocaleOptions.Hour.value != "")	Options.hour = document.LocaleOptions.Hour.value;
	if	(document.LocaleOptions.Minute.value != "")	Options.minute = document.LocaleOptions.Minute.value;
	if	(document.LocaleOptions.Second.value != "")	Options.second	= document.LocaleOptions.Second.value;
	if	(document.LocaleOptions.Hour12.value != "")	Options.hour12	= (document.LocaleOptions.Hour12.value == "true");
	
	if (timeZone !== "") 
		Options.timeZone = timeZone ; // Object.defineProperty(Options, "timeZone", {enumerable : true, writable : true, value : timeZone});
	// Check here that Options with timeZone is valid
	try {
		askedOptions = new Intl.DateTimeFormat (Locale, Options);
		}
	catch (e) {
		alert (milesianAlertMsg("invalidCode") + '"' + Options.timeZone + '"');
		document.LocaleOptions.TimeZone.value = ''; 	// Reset TimeZone indication to empty string
		timeZone = "";
		delete Options.timeZone; // Delete property
		askedOptions = new Intl.DateTimeFormat (Locale, Options);	// Finally the options do not comprise the time zone
	}

	usedOptions = askedOptions.resolvedOptions();
	
	// Display all effective options
	document.LocaleOptions.ETimeZone.value=usedOptions.timeZone;
	document.LocaleOptions.Elocale.value = usedOptions.locale;
	document.LocaleOptions.Ecalend.value = usedOptions.calendar;
	
	// Display Milesian string
	document.getElementById("Mstring").innerHTML = askedOptions.milesianFormat(targetDate);

	// Certain Unicode calendars do not give a proper result: here is the control code.
	
	let valid = true; 	// Flag the few cases where calendar computations under Unicode yield a wrong result
	switch (usedOptions.calendar) {	
		case "hebrew": valid = (toLocalDate(targetDate, timeZone).localDate.valueOf()
			>= -180799776000000); break;	// Computations are false before 1 Tisseri 1 AM  	
		case "indian": valid = (toLocalDate(targetDate, timeZone).localDate.valueOf() 
			>= -62135596800000); break;	// Computations are false before 01/01/0001 (gregorian)
		case "islamic":
		case "islamic-rgsa": valid = (toLocalDate(targetDate, timeZone).localDate.valueOf()
			>= -42521673600000); break; // Computations are false before Haegirian epoch
		}
		
	let myElement = document.getElementById("Gstring");
	try { myElement.innerHTML = (valid ? "" : milesianAlertMsg("invalidDate")) + askedOptions.format(targetDate); }
	catch (e) { myElement.innerHTML = milesianAlertMsg("browserError"); }
}

function setDisplay () { // Considering that targetDate time has been set to the desired date, this routines updates all form fields.

	// Time section
	// Initiate Time zone mode for the "local" time from main display
	TZSettings.mode = document.TZmode.TZcontrol.value;
	// Timezone offset for next computations - opposite of JS offset.
	switch (TZSettings.mode) {
		case "TZ" : document.TZmode.TZOffset.value = -targetDate.getTimezoneOffset();
		// If TZ mode, Copy computed TZOffset into TZSettings fur future computations
		case "Fixed" : TZSettings.offset = -document.TZmode.TZOffset.value; break;
		// If UTC mode, set computation offset to 0, but set displayed field to TZ value
		case "UTC" : TZSettings.offset = 0; document.TZmode.TZOffset.value = -targetDate.getTimezoneOffset(); 	
	}
	TZSettings.msoffset = TZSettings.offset * Chronos.MINUTE_UNIT; // Small computation made ounce for all

	shiftDate = new Date (targetDate.getTime() - TZSettings.msoffset);	// The UTC representation of targetDate date is the local date of TZ
	
	// Initiate milesian string with present time and date
    document.milesian.year.value = shiftDate.getUTCMilesianDate().year; // uses the local variable - not UTC
    document.milesian.monthname.value = shiftDate.getUTCMilesianDate().month ; // Month value following JS habits: 0 to 11.
    document.milesian.day.value = shiftDate.getUTCMilesianDate().date;
	try {
		document.milesian.dayofweek.value = (new Intl.DateTimeFormat("fr-FR", {weekday : "long", timeZone : "UTC"})).format(shiftDate);
		}
	catch (e) {
		document.milesian.dayofweek.value = milesianAlertMsg ("browserError"); 
		}
	// Update local time fields - using	Date properties
	document.time.hours.value = shiftDate.getUTCHours();
	document.time.mins.value = shiftDate.getUTCMinutes();
	document.time.secs.value = shiftDate.getUTCSeconds();

	// Display UTC date & time
	myElement = document.getElementById("UTCdate");
	myElement.innerHTML = targetDate.toUTCIntlMilesianDateString();
	myElement = document.getElementById("UTCtime");
	myElement.innerHTML = 
	  targetDate.getUTCHours() + "h "
	  + ((targetDate.getUTCMinutes() < 10) ? "0" : "") + targetDate.getUTCMinutes() + "mn " 
	  + ((targetDate.getUTCSeconds() < 10) ? "0" : "") + targetDate.getUTCSeconds() + "s";

	// Write Milesian and Gregorian strings following currently visible options
	putStringOnOptions();
}
function setDateToNow(){ // Self explanatory
    targetDate = new Date(); // set new Date object.
	setDisplay ();
}
function SetDayOffset (sign) { // the days are integer, all 24h, so local time may change making this operation
	if (sign == undefined) sign = 1;	// Sign is either +1 or -1. Just in case it does not come as a parameter.
	let days = Math.round (document.control.shift.value);
	if (!Number.isInteger(days)) alert (milesianAlertMsg("nonInteger") + '"' + days + '"')
	else { 
		targetDate.setUTCDate (targetDate.getUTCDate()+sign*days);
		setDisplay();
	}
}
function addTime (sign) { // A number of seconds is added or subtracted to or from the Timestamp.
	if (sign == undefined) sign = 1;	// Sign is either +1 or -1. Just in case it does not come as a parameter.
	let secs = Math.round (document.UTCshift.shift.value);
	if (isNaN(secs)) alert (milesianAlertMsg("nonInteger") + '"' + document.UTCshift.shift.value + '"')
	else { 
		targetDate.setTime (targetDate.getTime()+sign*secs*Chronos.SECOND_UNIT);
		setDisplay();
	}
}
function calcTime() { // Here the hours are deemed local hours
	var hours = Math.round (document.time.hours.value), mins = Math.round (document.time.mins.value), secs = Math.round (document.time.secs.value);
	if (isNaN(hours) || isNaN (mins) || isNaN (secs)) 
		alert (milesianAlertMsg("invalidDate") + '"' + document.time.hours.value + '" "' + document.time.mins.value + '" "' + document.time.secs.value + '"')
	 else {switch (TZSettings.mode) {
		case "TZ" : targetDate.setHours(hours, mins, secs, 0); break;
		case "UTC" : targetDate.setUTCHours(hours, mins, secs, 0); break;
		case "Fixed" : 
			targetDate.setUTCTimeFromMilesian (	document.milesian.year.value, document.milesian.monthname.value,document.milesian.day.value );
			targetDate.setUTCHours(hours, mins, secs, 0); 
			targetDate.setTime(targetDate.getTime() + TZSettings.msoffset);
		}
		setDisplay();	
	}
}
function setUTCHoursFixed (UTChours=0) { // set UTC time to the hours specified.
		if (typeof UTChours == undefined)  UTChours = document.UTCset.Compute.value;
		targetDate.setUTCHours(UTChours, 0, 0, 0); //targetDate.setUTCMinutes(0); targetDate.setSeconds(0); targetDate.setMilliseconds(0);
		setDisplay();	
}
function calcMilesian() {
	var day =  Math.round (document.milesian.day.value);
	var month = document.milesian.monthname.value;
	var year =  Math.round (document.milesian.year.value);
	if	( isNaN(day)  || isNaN (year ))
		alert (milesianAlertMsg("invalidDate") + '"' + document.milesian.day.value + '" "' + document.milesian.year.value + '"')
	else { switch (TZSettings.mode){
		case "TZ": targetDate.setTimeFromMilesian (year, month, day); // Set date object from milesian date indication, without changing time-in-the-day.
			break;
		case "UTC" : targetDate.setUTCTimeFromMilesian (year, month, day);
			break;
		case "Fixed" : 	
			let shiftDate = new Date (targetDate.getTime() - TZSettings.msoffset);	// The shifted date, to be changed.
			shiftDate.setUTCTimeFromMilesian (year, month, day); 
			targetDate.setTime(shiftDate.getTime() + TZSettings.msoffset);
		}
	setDisplay ();
	}
}
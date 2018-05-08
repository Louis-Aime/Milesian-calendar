/* Milesian Clock and converter functions - computations on entries
Character set is UTF-8.
See Milesian Clock Display (.html and .js) for details.
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

function setLocalePresentationCalendar() {	// What happens when Locale-presentation-calendar option button hit
	var myElement, // work variable
	// Get user-specified parameters
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
	
	// Now add specified calendar
	if (Calendar !== "") Locale = Locale + "-u-ca-" + Calendar; // Calendar is a selected value, no entry error expected
	
	// Set presentation options from one of the standard presentations listed. Options is a global variable.
	switch (document.LocaleOptions.Presentation.value) {
		case "long":
			Options = {weekday : "long", day : "numeric", month : "long", year : "numeric", era : "long",
					hour : "numeric", minute : "numeric", second : "numeric"};
			break;
		case "textCumWeek":
			Options = {weekday : "long", day : "numeric", month: "long", year : "numeric", era : "short",
					hour : "numeric", minute : "numeric", second : "numeric"};
			break;
		case "textSineWeek":
			Options = {weekday : undefined, day : "numeric", month: "long", year : "numeric", era : "short",
					hour : "numeric", minute : "numeric", second : "numeric"};
			break;
		case "short":
			Options = {weekday : "short", day : "numeric", month: "short", year : "numeric", era : "narrow",
					hour : "2-digit", minute : "2-digit", second : "2-digit"};
			break;	
		case "numeric":
			Options = {weekday : undefined, day : "numeric", month : "numeric", year : "numeric", era : "narrow",
					hour : "2-digit", minute : "2-digit", second : "2-digit"};
			break;
		case "2-digit":
			Options = {weekday : undefined, day : "2-digit", month : "2-digit", year : "numeric", era : undefined,
					hour : "2-digit", minute : "2-digit", second : "2-digit"};
			break;
		case "year-2-digit":
			Options = {weekday : undefined, day : "2-digit", month : "2-digit", year : "2-digit", era : undefined,
					hour : "2-digit", minute : "2-digit", second : "2-digit"};
		}
	
	// Add time zone if specified
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

	setDisplay();	// set all, as Locale may change the way the first Milesian string is written
}

function setDateToNow(){ // Self explanatory
    targetDate = new Date(); // set new Date object and initiate to date-time of call
	setDisplay(); 
}
function setMode() {	// Just change mode UTC, time zone or fixed offset.
	setDisplay();
}
function setGregSwitch() {	// Set date of switch from julian to gregorian calendar to specific value
	var day =  Math.round (document.gregorianswitch.day.value);
	var month = document.gregorianswitch.monthname.value;
	var year =  Math.round (document.gregorianswitch.year.value);
	if	( isNaN(day)  || isNaN (year ))
		alert (milesianAlertMsg("invalidDate") + '"' + document.gregorianswitch.day.value + '" "' + document.gregorianswitch.year.value + '"')
	else {		
		let A = new Date (Date.UTC(year, month, day, 0, 0, 0, 0));
		if (A.valueOf() < Date.UTC(1582,9,15,0,0,0,0)) {	// If specified date is prior to 15 October 1582, reject change and keep current
			month++ ;
			alert (milesianAlertMsg("invalidDate") + '"' + day + ' ' + month + ' ' + year + '"')
			}
		else {
		gregorianSwitch = new Date (A.valueOf());
			}
		}	
	setDisplay();	
}

function SetDayOffset (sign) { // Choice here: the days are integer, all 24h, so local time may change making this operation
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
function calcJulianDay(){ // here, Julian Day is specified as a decimal number. Insert with the suitable Date setter.
	var j = (document.daycounter.julianday.value); // extract Julian Day, numeric value (not necessarily integer) expected.
	j = j.replace(/\s/gi, ""); j = j.replace(/,/gi, "."); j = Number (j);
	if (isNaN (j)) alert (milesianAlertMsg("nonNumeric") + '"' + document.daycounter.julianday.value + '"')
	else {
		j =  Math.round ((j * Chronos.DAY_UNIT)/Chronos.SECOND_UNIT) * Chronos.SECOND_UNIT / Chronos.DAY_UNIT ; 
		// j rounded to represent an integer number of seconds, avoiding rounding up errors.
	targetDate.setTimeFromJulianDay (j); 
	setDisplay ();
	}
}
function calcGregorian() {
	var day =  Math.round (document.gregorian.day.value);
	var month = (document.gregorian.monthname.value);
	var year =  Math.round (document.gregorian.year.value);
	if	( isNaN(day)  || isNaN (year ))
		alert (milesianAlertMsg("invalidDate") + '"' + document.gregorian.day.value + '" "' + document.gregorian.year.value + '"')
	else { switch (TZSettings.mode) {
		case "TZ": 
			targetDate.setFullYear(year, month, day); 	// Set date object from calendar date indication, without changing time-in-the-day.
			break;
		case "UTC" : targetDate.setUTCFullYear(year, month, day);
			break;
		case "Fixed" : 	
			let shiftDate = new Date (targetDate.getTime() - TZSettings.msoffset);	// The shifted date, to be changed.
			shiftDate.setUTCFullYear (year, month, day); 
			targetDate.setTime(shiftDate.getTime() + TZSettings.msoffset);
		} 
		setDisplay ();
		}
}
function calcJulian(){
	var day =  Math.round(document.julian.day.value);
	var month = new Number(document.julian.monthname.value); // month has to be a number.
	var year =  Math.round(document.julian.year.value);
	if	( isNaN(day)  || isNaN (year))
		alert (milesianAlertMsg("invalidDate") + '"' + document.julian.day.value + '" "' + document.julian.year.value + '"')
	else { switch (TZSettings.mode) {
		case "TZ": 
			targetDate.setTimeFromJulianCalendar(year, month, day); 	// Set date object from calendar date indication, without changing time-in-the-day.
			break;
		case "UTC" : targetDate.setUTCTimeFromJulianCalendar(year, month, day);
			break;
		case "Fixed" : 	
			let shiftDate = new Date (targetDate.getTime() - TZSettings.msoffset);	// The shifted date, to be changed.
			shiftDate.setUTCTimeFromJulianCalendar (year, month, day); 
			targetDate.setTime(shiftDate.getTime() + TZSettings.msoffset);
		}
		setDisplay ();
		}
}
function calcFrenchRev(){
	let day =  Math.round(document.republican.day.value);
	let month = new Number(document.republican.monthname.value); // month has to be a number.
	let year =  Math.round(document.republican.year.value);
	if	( isNaN(day)  || isNaN (year))
		alert (milesianAlertMsg("invalidDate") + '"' + document.republican.day.value + '" "' + document.republican.year.value + '"')
	else { switch (TZSettings.mode) {
		case "TZ": 
			targetDate.setTimeFromFrenchRev(year, month, day); 	// Set date object from calendar date indication, without changing time-in-the-day.
			break;
		case "UTC" : targetDate.setUTCTimeFromFrenchRev(year, month, day);
			break;
		case "Fixed" : 	
			let shiftDate = new Date (targetDate.getTime() - TZSettings.msoffset);	// The shifted date, to be changed.
			shiftDate.setUTCTimeFromFrenchRev (year, month, day); 
			targetDate.setTime(shiftDate.getTime() + TZSettings.msoffset);
		}
		setDisplay ();
		}
}
function calcISO() {
	var day =  Math.round (document.isoweeks.day.value);
	var week = Math.round (document.isoweeks.week.value);
	var year =  Math.round (document.isoweeks.year.value);
	if	( isNaN(day)  || isNaN (week) || isNaN (year))
		alert (milesianAlertMsg("invalidDate") + '"' + document.isoweeks.year.value + '" "' + document.isoweeks.week.value + '"')
	else { switch (TZSettings.mode) {
		case "TZ": 
			targetDate.setTimeFromIsoWeekCal(year, week, day); 	// Set date object from calendar date indication, without changing time-in-the-day.
			break;
		case "UTC" : targetDate.setUTCTimeFromIsoWeekCal(year, week, day);
			break;
		case "Fixed" : 	
			let shiftDate = new Date (targetDate.getTime() - TZSettings.msoffset);	// The shifted date, to be changed.
			shiftDate.setUTCTimeFromIsoWeekCal (year, week, day); 
			targetDate.setTime(shiftDate.getTime() + TZSettings.msoffset);
		}
		setDisplay ();
		}
}

/* Milesian Clock and converter functions
Character set is UTF-8.
These functions are associated with the Milesian clock and converter html page: 
They use the basic Milesian calendar functions, and the conversion functions of other calendar,
in order to display the Milesian on-line clock and to perform calendar conversion.

Associated with: 
*	MilesianClock.html
Other js necessary
1. Common functions
*	CBCCE (the Cycle-Based Calendar Computation Engine)
*	MilesianAlertMsg
2. For conversions
*	MilesianClockOperations
*	MilesianDateProperties
*	JulianDateProperties
*	FrenchRevDateProperties
*	IsoWeekCalendarDateProperties
*	LunarDateProperties
*	ChronologicalCountConversion
3. For clock operation
*	MilesianClockOperations
4. For display, using Unicode standards
*	UnicodeMilesian (used to be: toMilesianLocaleDateString)
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
	targetDate = new Date(),	// target date will be used to update everything
	gregorianSwitch = { 		// Settings: date where the Gregorian calendar was enforced (may change from one country to the other) 
		year : 1582, month : 11, date : 30 }, // Values for France, on initialisation. In principle, should be fetched from Unicode.
	lowerRepublicanDate = new Date (Date.UTC(1792, 8, 22, 0, 0, 0, 0)),	// Origin date for the French Republican calendar
	upperRepublicanDate = new Date (Date.UTC(1806, 0, 1, 0, 0, 0, 0)); // Upper limit of the Republican calendar
		// Caveat with these limits: it is assumed that the timezone cannot be changed during a session.
	TZSettings = {mode : "TZ", offset : 0, msoffset : 0};	// initialisation to be superseded

function setDisplay () {	// Disseminate targetDate and time on all display fields

	let dateComponent;	// Local result of date decomposition process, used several times
	// Initiate mode from main display
	TZSettings.mode = document.TZmode.TZcontrol.value;
	// Timezone offset for next computations - opposite if JS offset.
	switch (TZSettings.mode) {
		case "TZ" : document.TZmode.TZOffset.value = -targetDate.getTimezoneOffset();
		// If TZ mode, Copy computed TZOffset into TZSettings fur future computations
		case "Fixed" : TZSettings.offset = -document.TZmode.TZOffset.value; break;
		// If UTC mode, set computation offset to 0, but set displayed field to TZ value
		case "UTC" : TZSettings.offset = 0; document.TZmode.TZOffset.value = -targetDate.getTimezoneOffset(); 	
	}
	TZSettings.msoffset = TZSettings.offset * Chronos.MINUTE_UNIT; // Small computation made ounce for all
	// Initiate milesian clock and milesian string with present time and date
	let shiftDate = new Date (targetDate.getTime() - TZSettings.msoffset);	// This date is shifted as desired
	let myElement = document.querySelector("#clock2");
	setSolarYearClockHands (myElement, shiftDate.getMilesianUTCDate().year, shiftDate.getMilesianUTCDate().month, shiftDate.getMilesianUTCDate().date,
		shiftDate.getUTCHours(), shiftDate.getUTCMinutes(), shiftDate.getUTCSeconds() );

	// Main frame fields

	// Update milesian field selector - using Date properties
	dateComponent = shiftDate.getMilesianUTCDate();		// Get date-time component from shiftDate, following desired time zone
	document.milesian.year.value = dateComponent.year;
    document.milesian.monthname.value = dateComponent.month;
    document.milesian.day.value = dateComponent.date;
	
	// Update local time fields - using	Date properties
	document.time.hours.value = dateComponent.hours;
	document.time.mins.value = dateComponent.minutes;
	document.time.secs.value = dateComponent.seconds;
	
	// Set Milesian date string (just under clock dial)
	myElement = document.getElementById("milesiandate");
	myElement.innerHTML = shiftDate.toMilesianLocaleDateString
		(undefined,{timeZone:"UTC",weekday:"long",day:"numeric",month:"long",year:"numeric"});

	// Display standard date in non-editable part
	// Translate to julian if before (local) date of switch to Gregorian calendar
	let gregSwitchDate = new Date; 
	gregSwitchDate.setUTCTimeFromMilesian (gregorianSwitch.year, gregorianSwitch.month, gregorianSwitch.date, 0, 0, 0, 0); 
		// gregSwitchDate is date where Gregorian calendar was enforced, in displayed value. Julian calendar was used before this date.
	if (shiftDate.valueOf() < gregSwitchDate.valueOf()) 	// If target date is before Gregorian calendar was enforced 
		dateComponent = shiftDate.getJulianUTCDate()		// dateComponent object set to Julian date-time
	else { 												// else, dateComponent set to (standard) Gregorian coordinates
		dateComponent.year  = shiftDate.getUTCFullYear();
		dateComponent.month = shiftDate.getUTCMonth();
		dateComponent.date	= shiftDate.getUTCDate();
		};
	myElement = document.juliogregdate;
	myElement.year.value = dateComponent.year;
	myElement.monthname.value = dateComponent.month;
	myElement.day.value = dateComponent.date;

	// Update settings
	document.gregorianswitch.year.value = gregorianSwitch.year;
	document.gregorianswitch.monthname.value = gregorianSwitch.month;
	document.gregorianswitch.day.value = gregorianSwitch.date;
	

	// Date conversion frame
	
    //  Update Gregorian Calendar - using Date properties
    document.gregorian.year.value = shiftDate.getUTCFullYear();
    document.gregorian.monthname.value = shiftDate.getUTCMonth();
    document.gregorian.day.value = shiftDate.getUTCDate();		
	myElement = document.querySelector("#gregorianline");
	if (shiftDate.valueOf() < gregSwitchDate.valueOf()) 	// If target date is before Gregorian calendar was enforced 
		myElement.setAttribute("class", "outbounds")	// Set "outbounds" class: display shall change
	else myElement.removeAttribute("class");			// Else remove class: display shall be normal
	

    //  Update Julian Calendar - using Date properties 
	dateComponent = shiftDate.getJulianUTCDate();
    document.julian.year.value = dateComponent.year;
    document.julian.monthname.value = dateComponent.month;
    document.julian.day.value = dateComponent.date;

    //  Update Republican Calendar - using Date properties
	dateComponent = shiftDate.getFrenchRevUTCDate();
    document.republican.year.value = dateComponent.year;
    document.republican.monthname.value = dateComponent.month;
    document.republican.day.value = dateComponent.date;	
	myElement = document.querySelector("#republicanline");
	if (shiftDate.valueOf() >= upperRepublicanDate.valueOf()
		|| shiftDate.valueOf() < lowerRepublicanDate.valueOf() ) 	// If target date is outside period where Republican calendar was enforced 
		myElement.setAttribute("class", "outbounds")	// Set "outbounds" class: display shall change
	else myElement.removeAttribute("class");			// Else remove class: display shall be normal

	//  Update ISO week calendar - using its Date properties
	dateComponent = shiftDate.getIsoWeekCalUTCDate();
	document.isoweeks.year.value = dateComponent.year;
	document.isoweeks.week.value = dateComponent.week;
	document.isoweeks.day.value = dateComponent.day;	
	myElement = document.querySelector("#isoweeksline");
	if (shiftDate.valueOf() < gregSwitchDate.valueOf() ) 	// If target date is before gregorian calendar was enforced 
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
	
	// Lunar data frame

	// Update lunar parameters - using targetDate
	dateComponent = targetDate.getCEMoonDate();
	document.moon.age.value = dateComponent.age.toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2}); // age given as a decimal number
	document.moon.residue.value = (29.5305888310185 - dateComponent.age).toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2});
	document.moon.height.value = targetDate.getDraconiticHeight().toLocaleString(undefined,{maximumFractionDigits:3, minimumFractionDigits:3});
	document.moon.moontime.value = targetDate.getLunarTime().hours + "h " 
				+  ((targetDate.getLunarTime().minutes < 10) ? "0" : "") + targetDate.getLunarTime().minutes + "mn "
				+  ((targetDate.getLunarTime().seconds < 10) ? "0" : "") + targetDate.getLunarTime().seconds + "s";
	document.moon.moondate.value = targetDate.getLunarDateTime().date + " " 
				+  (++targetDate.getLunarDateTime().month) + "m";
	document.moon.CElunardate.value = 	Math.ceil(dateComponent.age);
	document.moon.CElunarmonth.value = 	++dateComponent.month;
	document.moon.CElunaryear.value = 	dateComponent.year;
	dateComponent = targetDate.getHegirianMoonDate();	
	document.moon.hegiriandate.value = 	Math.ceil(dateComponent.age);
	document.moon.hegirianmonth.value = ++dateComponent.month;
	document.moon.hegirianyear.value = 	dateComponent.year;
	
	// Update Delta T (seconds)
	document.deltat.delta.value = (targetDate.getDeltaT()/Chronos.SECOND_UNIT);
	
	// Navigation frame

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
	
	// Unicode frame - this frame is handled with putStringOnOptions

	// Display date string, following options
	putStringOnOptions();				

}
function putStringOnOptions() { // get Locale, calendar indication and Options given on page, print String; Minimum control.
	let valid = true; 	// by default, computations under Unicode are expected valid. Certains cases are known false.

	// Negotiate effective Locale from specified language code and calendar
	let Locale = document.LocaleOptions.Locale.value;
	let Calendar = document.LocaleOptions.Calendar.value;
	let timeZone = document.LocaleOptions.TimeZone.value;
	let myDisplay, Options; 		// to be computed later;
	
	if (Locale == ""){ 	// no language code specified; in case a specific calendar is specified, construct an effective Locale.
		if (Calendar !== "") {
			let askedOptions = new Intl.DateTimeFormat ();
			let usedOptions = askedOptions.resolvedOptions();
			Locale = usedOptions.locale.slice(0,5) + "-u-ca-" + Calendar}
		else Locale = undefined}
	else if (Calendar !== "") Locale = Locale + "-u-ca-" + Calendar;
	
	// Set presentation options from one of the standard presentations listed
	switch (document.LocaleOptions.Presentation.value) {
		case "long":
			Options = {weekday : "long", day : "numeric", month : "long", year : "numeric", era : "long",
					hour : "2-digit", minute : "2-digit", second : "2-digit"};
			break;
		case "textCumWeek":
			Options = {weekday : "long", day : "numeric", month: "long", year : "numeric", era : "short",
					hour : "2-digit", minute : "2-digit", second : "2-digit"};
			break;
		case "textSineWeek":
			Options = {weekday : undefined, day : "numeric", month: "long", year : "numeric", era : "short",
					hour : "2-digit", minute : "2-digit", second : "2-digit"};
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
	if (timeZone !== "") Object.defineProperty(Options, "timeZone", {enumerable : true, writable : true, value : timeZone});
	
	// Certain Unicode calendars do not give a proper result: set the flag.
	switch (Calendar) {	
		case "hebrew": valid = (toLocalDate(targetDate, Options).valueOf()
			>= -180799776000000); break;	// Computations are false before 1 Tisseri 1 AM  	
		case "indian": valid = (toLocalDate(targetDate, Options).valueOf() 
			>= -62135596800000); break;	// Computations are false before 01/01/0001 (gregorian)
		case "islamic":
		case "islamic-rgsa": valid = (toLocalDate(targetDate, Options).valueOf()
			>= -42521673600000); break; // Computations are false before Haegirian epoch
		}

	// Write Milesian string. No specific error shoud occur here.
	myDisplay = document.getElementById("milesianDisplay");
	myDisplay.innerHTML = targetDate.toMilesianLocaleDateString(Locale,Options);	

	//	Write date string. Catch error if navigator fails to handle toLocaleTimeString (MS Edge)
	try {
		myDisplay = document.getElementById("UnicodeString");
		myDisplay.innerHTML = (valid ? targetDate.toLocaleTimeString(Locale,Options) : milesianAlertMsg("invalidDate"));
		}
	catch (e) {	// If attempt to write Milesian string failed: this is caused by out-of-range
		myDisplay.innerHTML = milesianAlertMsg("invalidDate");
		}
}
function setDateToNow(){ // Self explanatory
    targetDate = new Date(); // set new Date object.
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
		if (year * 372 + month * 31 + day < 588808) {	// If specified date is prior to 25 10m 1582, reject change and keep current
			month++ ;
			alert (milesianAlertMsg("invalidDate") + '"' + day + ' ' + month + 'm ' + year + '"')
			}
		else {
		gregorianSwitch.year = year ; gregorianSwitch.month = month ; gregorianSwitch.date = day;
		setDisplay ();
			}
		}	
	setDisplay();	
}
function setLocalePresentationCalendar() {	// What happens when Locale-presentation-calendar option button hit
	setDisplay();	// set all, as Locale may change the way the first Milesian string is written
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
function setUTCHoursFixed (UTChours=0) { // set UTC time to the hours sepcified.
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
			targetDate.setFullYear(year, month, day); 	// Set date object from gregorian date indication, without changing time-in-the-day.
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
			targetDate.setTimeFromJulianCalendar(year, month, day); 	// Set date object from gregorian date indication, without changing time-in-the-day.
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
			targetDate.setTimeFromFrenchRev(year, month, day); 	// Set date object from gregorian date indication, without changing time-in-the-day.
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
			targetDate.setTimeFromIsoWeekCal(year, week, day); 	// Set date object from gregorian date indication, without changing time-in-the-day.
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

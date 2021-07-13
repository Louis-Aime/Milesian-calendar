/* Milesian Clock and converter functions
Character set is UTF-8.
These functions are associated with the Milesian clock and converter html page: 
They use the basic Milesian calendar functions, and the conversion functions of other calendar,
in order to display the Milesian on-line clock and to perform calendar conversion.
Associated with: 
*	MilesianClock.html
1. Common functions
*	CBCCE (the Cycle-Based Calendar Computation Engine)
*	MilesianAlertMsg
*	getRealTZmsOffset method
2. For conversions and clock operation
*	MilesianClockOperations
*	LunarClockOperation
*	MilesianDateProperties
*	JulianDateProperties
*	FrenchRevDateProperties
*	IsoWeekCalendarDateProperties
*	LunarDateProperties
*	ChronologicalCountConversion
3. For display, using Unicode standards
*	UnicodeBasic
*	UnicodeMilesianFormat (used to be: toMilesianLocaleDateString then UnicodeMilesian)
*	MilesianMonthNameString (indirectly - or access to the name base in XML)
*/
/* Version notes
	This .js file is highly related to the corresponding html code. 
	No code optimisation in this file. Common display function are possible.
*/
/* Version	M2021-07-22	external modules directly loaded from GitHub, not from local copy(this may be reverted)
	M2021-07-18 Fix bug when computing from UTC date-time fields
	M2021-07-09 Use IIFE for intial imports
	M2021-05-09 Suppress filter for bad calendrical computation cases of M2019-12-23
	M2021-03-11 Enhance display of Delta T
	M2021-02-15	Use calendrical-javascript modules
	M2021-01-15 Display seasons and year figures using timezone mode and system language
	M2021-01-09 - Adapt to Chronos and new modules architecture
		Use 11 dependant .js files instead of 14
		Group year signature figures
		Add wallclock indication
	M2020-06-03
		"min" instead of "mn"
	M2020-04-16
		Adapt display of Julian day and other series to microseconds
	M2020-01-18
		Handle micoseconds
	M2020-01-12
		Use strict
		Adapt julio-gregorian date display to enhanced julianFormat
	M2019-12-23
*		Use an external function of UnicodeBasic to filter bad calendrical computation cases.
	M2019-12-15
*		Display time zone in Unicode date string
	M2019-08-06
*		Change access to the lunar part of the clock
	M2019-07-27
*		No functional change, mention use of getRealTZmsOffset method
	M2019-06-14
* 		Enhance marks for non-valid dates of calendars
*		Change name of chronological counts and add one
	M2019-03-04
* 		Insert error check sequences for "New" dates and formatted dates - used for limitations set by Ms Edge
(See former versions log on GitHub)
*/
/* Copyright Miletus 2017-2021 - Louis A. de Fouquières
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
	modules,		// all modules here once imported
	milesian,	// = new MilesianCalendar ("milesian",pldrDOM), // A Milesian calendar with pldr data.
	julian,		// = new JulianCalendar ("julian"),	// An instantied Julian calendar, no pldr
	vatican,	// = new WesternCalendar ("vatican", "1582-10-15"),
	french,		// = new WesternCalendar ("french", "1582-12-20"),
	german,		// = new WesternCalendar ("german", "1700-03-01"),
	english,	// = new WesternCalendar ("english","1752-09-14"),
	frenchRev,	// = new FrenchRevCalendar ("frenchrev"),
	calendars;

(async function () {
	modules = await import ('./aggregate-all.js');
	let pldrString = await import ('https://louis-aime.github.io/calendrical-javascript/pldr.js');
	let	pldrDOM = await fetchDOM ("https://louis-aime.github.io/calendrical-javascript/pldr.xml")
			.then ( (pldrDOM) => pldrDOM ) // The pldr data used by the Milesian calendar (and possibly others).
			.catch ( (error) => { return pldrString.default() } );	// if error (no XML file) take default pldr 
	milesian = new modules.MilesianCalendar ("milesian",pldrDOM);
	julian = new modules.JulianCalendar ("julian");	// An instantied Julian calendar, no pldr
	vatican = new modules.WesternCalendar ("vatican", "1582-10-15");
	french = new modules.WesternCalendar ("french", "1582-12-20");
	german = new modules.WesternCalendar ("german", "1700-03-01");
	english = new modules.WesternCalendar ("english","1752-09-14");
	frenchRev = new modules.FrenchRevCalendar ("frenchrev");
	calendars = [milesian, julian, vatican, french, german, english, frenchRev];
	register.targetDate = new modules.ExtDate(milesian);
	register.shiftDate = new modules.ExtDate ( milesian, register.targetDate.getTime() - register.targetDate.getRealTZmsOffset() );
	register.customCalendar = milesian;
	register.askedOptions = new Intl.DateTimeFormat(undefined,register.Options);
	register.userOptions = register.askedOptions.resolvedOptions();
	register.milesianClock = new modules.SolarClock( document.querySelector("#clock2") );
	clockAnimate.clockRun(1);

	setDateToNow ();	// initiate after all modules are loaded
})();

/** clockAnimate : package for clock animation
*/
var clockAnimate = {
	clockPeriod : {}, // Tick generator
	clockDirection : 1, 	// Forward or reverse 
	changeDayOffset : function () { 
		let days = +document.control.shift.value;
		if (isNaN(days) || days <= 0) {
			alert ("Invalid input " + days);
			clockAnimate.clockRun(0);
			}
		else 
		{ 
			document.control.shift.value = days; // Confirm changed value
		}
	},
	setDayOffset : function (sign=1) {
		clockAnimate.changeDayOffset();	// Force a valid value in field
		let dayOffset = document.control.shift.value;	// fetch value from form
		let testDate = new Date(register.targetDate.valueOf());
		testDate.setTime (testDate.getTime()+sign*dayOffset*modules.Milliseconds.DAY_UNIT);
		if (isNaN(testDate.valueOf())) { 
			alert ("Date out of range");
			clockAnimate.clockRun(0);
			}
		else {
			register.targetDate = new modules.ExtDate(register.customCalendar, testDate.valueOf()); // register is global variable
			setDisplay();
		}
	},
	setDayOffsetPlus : function () {clockAnimate.setDayOffset(+1)},
	setDayOffsetMinus : function () {clockAnimate.setDayOffset(-1)},
	clockSet : function(direction = 1) {
		clockAnimate.clockDirection = direction;
		clockAnimate.clockRun (2);
		},
	clockRun : function(runSwitch = 0) { // Start or stop automatic clock run
		 // Begin with setting everything to off
		clockAnimate.off();
		document.run.off.setAttribute("class", document.run.off.getAttribute("class").replace("seton","textline"));
		document.run.on.setAttribute("class", document.run.on.getAttribute("class").replace("seton","textline"));
		document.run.back.setAttribute("class", document.run.back.getAttribute("class").replace("seton","textline"));
		document.run.forw.setAttribute("class", document.run.forw.getAttribute("class").replace("seton","textline"))
		switch (runSwitch) {
			case 2 : // quick runabout mode
				// Set the runabout to desired speed
				clockAnimate.clockPeriod = clockAnimate.clockDirection == 1
					? window.setInterval(clockAnimate.setDayOffsetPlus, 40000/document.run.speed.value)
					: window.setInterval(clockAnimate.setDayOffsetMinus, 40000/document.run.speed.value) ; 
				// change button color
				if (clockAnimate.clockDirection == 1) document.run.forw.setAttribute("class", document.run.forw.getAttribute("class").replace("textline","seton"))
				else document.run.back.setAttribute("class", document.run.back.getAttribute("class").replace("textline","seton"));
				break;
			case 1 : // run to indicate date and time
				clockAnimate.on(); 
				document.run.on.setAttribute("class", document.run.on.getAttribute("class").replace("textline","seton"));
				break;
			case 0 : // keep stopped
				document.run.off.setAttribute("class", document.run.off.getAttribute("class").replace("textline","seton"));
				break; 
			default : throw new Error ("Invalid option " + runSwitch);
		}
	},
	on : function () {
		window.clearInterval(clockAnimate.clockPeriod);
		setDateToNow();
		clockAnimate.clockPeriod = window.setInterval(setDateToNow , 5000);	// Update every 5 s
	},
	off : function () {
		window.clearInterval(clockAnimate.clockPeriod);
	}
}
/**	Time shift routines as a module (timeShift + myTimeShift)
*/
class timeShift {
	constructor () {}
	addedTime = 60000 // Time to add or substract, in milliseconds.
	changeAddTime() {
		let msecs = +document.timeShift.shift.value; 
		if (isNaN(msecs) || msecs <= 0) 
			alert ("Invalid input")
		else
			{ 
			this.addedTime = msecs; // Global variable updated
			document.timeShift.shift.value = msecs; // Confirm changed value
			}
		}
	addTime (sign = 1) { // addedTime ms is added or subtracted to or from the Timestamp.
		this.changeAddTime();	// Force a valid value in field
		let testDate = new Date(register.targetDate.valueOf());
		testDate.setTime (testDate.getTime() + sign * this.addedTime); 
		if (isNaN(testDate.valueOf())) alert ("Out of range")
		else {
			register.targetDate.setTime( testDate.valueOf() );
			setDisplay();
		}
	}
}
const myTimeShift = new timeShift;
/** remaining stuff for clock operation, to be redesigned in script packages 
*/
var register = { // set of global variables, used when updating calendar
		targetDate : new Date(),	// Reference UTC date
		customCalendar : milesian,	// initialisation
		lowerRepublicanDate : new Date (Date.UTC(1792, 8, 22, 0, 0, 0, 0)),	// Origin date for the French Republican calendar
		upperRepublicanDate : new Date (Date.UTC(1806, 0, 1, 0, 0, 0, 0)), // Upper limit of the Republican calendar
		TZSettings : {mode : "", msoffset : 0},	
		Options : {weekday : "long", day : "numeric", month: "long", year : "numeric", 
						hour : "numeric", minute : "numeric", second : "numeric"}, 	
		askedOptions : {},	// new Intl.DateTimeFormat(undefined,Options), 	
		userOptions : {},	// askedOptions.resolvedOptions()
		milesianClock : undefined
	}; 
function setDateToNow(){ // set current target date new to current custom calendar and to Now
	register.targetDate = new modules.ExtDate(register.customCalendar); 
	setDisplay ();
}
function setCalend() {	// set current custom calend to new value and compute fields
	register.customCalendar = calendars.find (item => item.id == document.custom.calend.value);  // change custom calendar
	register.targetDate = new modules.ExtDate(register.customCalendar, register.targetDate.valueOf());	// set custom calendar if changed, and set date.
	setDisplay();
}
function calcGregorian() {
	var 
	 day =  Math.round (document.gregorian.day.value),
	 month = Math.round (document.gregorian.monthname.value),
	 year =  Math.round (document.gregorian.year.value);
	 // HTML controls that day, month and year are numbers
	register.customCalendar = calendars.find (item => item.id == document.custom.calend.value);  // change custom calendar
	let testDate = new Date (register.targetDate.valueOf());
	switch (register.TZSettings.mode) {
		case "": 
			testDate.setFullYear(year, month-1, day); 	// Set date object from calendar date indication, without changing time-in-the-day.
			break;
		case "UTC" : testDate.setUTCFullYear(year, month-1, day);
			break;
	} 
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		// Here, no control of date validity, leave JS recompute the date if day of month is out of bounds
		register.targetDate = new modules.ExtDate(register.customCalendar, testDate.valueOf());	// set custom calendar if changed, and set date.
		setDisplay();
	}
}
function calcCustom() {
	var 
	 day =  Math.round (document.custom.day.value),
	 month = Math.round (document.custom.monthname.value),
	 year =  Math.round (document.custom.year.value),
	 testDate;
	 // HTML controls that day, month and year are numbers
	register.customCalendar = calendars.find (item => item.id == document.custom.calend.value);	// global variable
	switch (register.TZSettings.mode) {
		case "":  // Set date object from custom calendar date indication, and with time of day of currently displayed date.
			testDate = new modules.ExtDate (register.customCalendar, year, month, day, register.targetDate.getHours(), register.targetDate.getMinutes(), register.targetDate.getSeconds(), register.targetDate.getMilliseconds());
			break;
		case "UTC" : // // Set date object from custom calendar date indication, and with UTC time of day of currently displayed date.
			testDate = new modules.ExtDate (register.customCalendar, year, month, day);
			testDate.setUTCFullYear (testDate.getFullYear(), testDate.getMonth(), testDate.getDate()); // Ensure passed value are UTC converted
			testDate.setUTCHours ( register.targetDate.getUTCHours(), register.targetDate.getUTCMinutes(), 
							register.targetDate.getUTCSeconds(), register.targetDate.getUTCMilliseconds() );
			break;
	}
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		// Here, no control of date validity, leave JS recompute the date if day of month is out of bounds
		register.targetDate = new modules.ExtDate(register.customCalendar, testDate.valueOf());	// set custom calendar if changed, and set date.
		setDisplay();
		}
}
function calcJulianDay(){ // here, Julian Day is specified as a decimal number. Insert with the suitable Date setter.
	var j = (document.daycounter.julianday.value); // extract Julian Day, numeric value (not necessarily integer) expected.
	clockAnimate.off();	// stop clock engine (this routine is called from form, not from event
	j = j.replace(/\s/gi, ""); j = j.replace(/,/gi, "."); j = Number (j);
	if (isNaN (j)) alert ("Non numeric value" + ' "' + document.daycounter.julianday.value + '"')
	else {
		let jd = new modules.ExtCountDate ("julianDay","iso8601",0);
		jd.setFromCount(j);
		if (isNaN(jd.valueOf())) alert ("Date out of range")
		else {
			register.targetDate = new modules.ExtDate (register.customCalendar,jd.valueOf());
			setDisplay();
		}
	}
}
function compLocalePresentationCalendar() {	// Manage date string display parameters
	var 
		Locale = document.LocaleOptions.Language.value,
		Calendar = document.LocaleOptions.Calendar.value,
		timeZone = document.LocaleOptions.TimeZone.value;

	// Negotiate effective language code and display 
	try {
		register.askedOptions = Locale == "" ? new Intl.DateTimeFormat() : new Intl.DateTimeFormat (Locale);
		}
	catch (e) {	// Locale is not a valid language code
		alert ("Invalid locale" + ' "' + Locale + '"');
		document.LocaleOptions.Language.value = ''; // user-specified value back to blank
		register.askedOptions = new Intl.DateTimeFormat();	// and prepare to resolve language code with default value
		}
	register.userOptions = register.askedOptions.resolvedOptions(); 
	Locale = register.userOptions.locale; 	// Here Locale is no longer an empty string
	if (Locale.includes("-u-"))		// The Unicode extension ("-u-") is indicated in the specified locale, drop it
	Locale = Locale.substring (0,Locale.indexOf("-u-"));
	
	// Set presentation register.Options from one of the standard presentations listed.
	switch (document.LocaleOptions.DatePresentation.value) {
		case "long": 
			register.Options = {weekday : "long", day : "numeric", month : "long", year : "numeric", era : "long", eraDisplay : "always"}; break;
		case "standard":
			register.Options = {weekday : "long", day : "numeric", month: "long", year : "numeric", era : "long", eraDisplay : "auto"}; break;
		case "short":
			register.Options = {weekday : "short", day : "numeric", month: "short", year : "numeric", era : "short"}; break;
		case "narrow":
			register.Options = {weekday : "narrow", day : "numeric", month: "narrow", year : "numeric", era : "narrow"}; break;	
		case "numeric":
			register.Options = {day : "numeric", month : "numeric", year : "numeric", era : "narrow"}; break;
		case "2-digit":
			register.Options = {day : "2-digit", month : "2-digit", year : "numeric"}; break;
		case "year-2-digit":
			register.Options = {day : "2-digit", month : "2-digit", year : "2-digit", eraDisplay : "never"}; break;
		case "none": register.Options = {}
		}
	switch (document.LocaleOptions.TimePresentation.value) {
		case "total": register.Options.hour = "numeric"; register.Options.minute = "numeric"; register.Options.second = "numeric"; 
			register.Options.fractionalSecond = 3; register.Options.timeZoneName = "short"; break;
		case "detail": register.Options.hour = "numeric"; register.Options.minute = "numeric"; register.Options.second = "numeric"; 
			register.Options.timeZoneName = "long"; break;
		case "second": register.Options.hour = "numeric"; register.Options.minute = "numeric"; register.Options.second = "numeric"; break;
		case "minute": register.Options.hour = "numeric"; register.Options.minute = "numeric"; break;
		case "hour": register.Options.hour = "numeric"; break;
		case "hmstz": register.Options.hour = "2-digit"; register.Options.minute = "2-digit"; register.Options.second = "2-digit"; 
			register.Options.timeZoneName = "short"; break;
		case "hm": register.Options.hour = "2-digit"; register.Options.minute = "2-digit"; break;
		case "none": 
	}
	// Add Unicode calendar in options
	if (Calendar != "") register.Options.calendar = Calendar; // No error expected, since calendar is picked up from a list

	// Add time zone in register.Options
	if (timeZone != "") 
		register.Options.timeZone = timeZone ; 
	// is timeZone valid ?
	try {
		register.askedOptions = new Intl.DateTimeFormat (Locale, register.Options);
		}
	catch (e) {
		alert ("Invalid time zone" + ' "' + register.Options.timeZone + '"');
		document.LocaleOptions.TimeZone.value = '';
		delete register.Options.timeZone; // Delete property
		register.askedOptions = new Intl.DateTimeFormat (Locale, register.Options);	// Finally the options do not comprise the time zone
	}
	register.userOptions = register.askedOptions.resolvedOptions();
}
function setUTCHoursFixed (UTChours=0) { // set UTC time to the hours specified.
	if (typeof UTChours == undefined)  UTChours = document.UTCset.Compute.value;
	let testDate = new Date (register.targetDate.valueOf());
	testDate.setUTCHours(UTChours, 0, 0, 0);
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		register.targetDate.setTime (testDate.valueOf());
		setDisplay();
	}
}
function calcTime() { // Here the hours are deemed local hours
	var hours = Math.round (document.time.hours.value), mins = Math.round (document.time.mins.value), 
		secs = Math.round (document.time.secs.value), ms = Math.round (document.time.ms.value);
	if (isNaN(hours) || isNaN (mins) || isNaN (secs) || isNaN (ms)) 
		alert ("Invalid date " + '"' + document.time.hours.value + '" "' + document.time.mins.value + '" "' 
		+ document.time.secs.value + '.' + document.time.ms.value + '"')
	 else {
	  let testDate = new modules.ExtDate (register.customCalendar,register.targetDate.valueOf());
	  switch (register.TZSettings.mode) {
		case "" : testDate.setHours(hours, mins, secs, ms); break;
		case "UTC" : testDate.setUTCHours(hours, mins, secs, ms); break;
/*		case "Fixed" : 
			testDate = new Date(modules.ExtDate.fullUTC (document.gregorian.year.value, document.gregorian.monthname.value, document.gregorian.day.value));
			testDate.setUTCHours(hours, mins, secs, ms); 
			testDate.setTime(testDate.getTime() + register.TZSettings.msoffset);
*/		}
		if (isNaN(testDate.valueOf())) alert ("Out of range")
		else {
			register.targetDate = new modules.ExtDate (register.customCalendar,testDate.valueOf());
			setDisplay();
		}
	}
}	
function getMode() {
	// Initiate Time zone mode for the "local" time from main display
	register.TZSettings.mode = document.TZmode.TZcontrol.value;
	return register.TZSettings.mode
	/** register.TZSettings.msoffset is JS time zone offset in milliseconds (UTC - local time)
	 * Note that getTimezoneOffset sometimes gives an integer number of minutes where a decimal number is expected
	*/
}
function setDisplay () {	// Disseminate targetDate and time on all display fields

	// set displayed calendar to internal one
	document.custom.calend.value = register.customCalendar.id;

	// Initiate Time zone mode for the "local" time from main display
	register.TZSettings.mode = document.TZmode.TZcontrol.value;
/** register.TZSettings.msoffset is JS time zone offset in milliseconds (UTC - local time)
 * Note that getTimezoneOffset sometimes gives an integer number of minutes where a decimal number is expected
*/
	register.TZSettings.msoffset = register.targetDate.getRealTZmsOffset().valueOf();
	let
		systemSign = (register.TZSettings.msoffset > 0 ? -1 : 1), // invert sign because of JS convention for time zone
		absoluteRealOffset = - systemSign * register.TZSettings.msoffset,
		absoluteTZmin = Math.floor (absoluteRealOffset / modules.Milliseconds.MINUTE_UNIT),
		absoluteTZsec = Math.floor ((absoluteRealOffset - absoluteTZmin * modules.Milliseconds.MINUTE_UNIT) / modules.Milliseconds.SECOND_UNIT);

	switch (register.TZSettings.mode) {
		case "UTC" : 
			register.TZSettings.msoffset = 0; // Set offset to 0, but leave time zone offset on display
		case "" : 
			document.querySelector("#realTZOffset").innerHTML = (systemSign == 1 ? "+ ":"- ") + absoluteTZmin + " min " + absoluteTZsec + " s";
	}
	
	compLocalePresentationCalendar(); // Establish initial / recomputed date string display parameters 

	var shiftDate = new Date (register.targetDate.getTime() - register.TZSettings.msoffset);	// The UTC representation of targetDate date is the local date of TZ
	if (isNaN (shiftDate.valueOf())) { // targetDate may be in bounds, and shiftDate out of bounds.
		alert ("Out of range") ; return 
	}
	// Initiate milesian clock and milesian string with present time and date
	var myElement = document.querySelector("#clock2"),	// myElement is a work variable
		myCollection ;	// Another work variable, used later
	shiftDate = new modules.ExtDate (milesian, shiftDate.valueOf());
	register.milesianClock.setHands (shiftDate.year("UTC"), shiftDate.month("UTC"), shiftDate.day("UTC"),
		shiftDate.getUTCHours(), shiftDate.getUTCMinutes(), shiftDate.getUTCSeconds() ); // Display date on clock.
	register.milesianClock.setSeasons (shiftDate.year("UTC")); // Display also seasons.

	var dateComponent = shiftDate.getFields("UTC");	// Initiate a date decomposition in Milesian, to be used several times in subsequent code

/*
	// Update milesian field selector - using Date properties
	document.milesian.year.value = dateComponent.year;
    document.milesian.monthname.value = dateComponent.month;
    document.milesian.day.value = dateComponent.day;
*/
	
	// Update local time fields - using	Date properties
	document.time.hours.value = dateComponent.hours;
	document.time.mins.value = dateComponent.minutes;
	document.time.secs.value = dateComponent.seconds;
	document.time.ms.value = dateComponent.milliseconds;

	// Write date strings near the clock, using Unicode and Unicode-derived routines
	var 
		labelDate = new Intl.DateTimeFormat (undefined,{timeZone:"UTC",weekday:"long",day:"numeric",month:"long",year:"numeric"});
	// Write Milesian date string
	myElement = document.getElementById("clockmilesiandate"); 	// Milesian date element
	myElement.innerHTML = new modules.ExtDateTimeFormat (undefined,{timeZone:"UTC",weekday:"long",day:"numeric",month:"long",year:"numeric"},milesian).format (shiftDate);
	
	// Date conversion frame - other calendars than the Milesian
	
    //  Update Gregorian Calendar - using Date properties
    document.gregorian.year.value = shiftDate.getUTCFullYear();
    document.gregorian.monthname.value = shiftDate.getUTCMonth()+1;
    document.gregorian.day.value = shiftDate.getUTCDate();		

    //  Update custom calendar
	dateComponent = new modules.ExtDate (register.customCalendar, shiftDate.valueOf()).getFields("UTC");
    document.custom.year.value = register.customCalendar.fullYear(dateComponent);
    document.custom.monthname.value = dateComponent.month;
    document.custom.day.value = dateComponent.day;

	// Place marks that say that custom calendar was not valid
	myElement = document.querySelector("#customline");
	myCollection = myElement.getElementsByClassName("mutable");
	// first remove marks from another display
	for (let i = 0; i < myCollection.length; i++)
		myCollection[i].setAttribute("class", myCollection[i].getAttribute("class").replace(" outbounds",""))
	// Then check whether marks should be set
	if (typeof register.customCalendar.valid == "function" && !register.customCalendar.valid(dateComponent)) 
		for (let i = 0; i < myCollection.length; i++)
			myCollection[i].setAttribute("class", myCollection[i].getAttribute("class").replace(" outbounds","") + " outbounds");

	// Chronological fields frame
	// Display Julian Day field.
	let JD = new modules.ExtCountDate ("julianDay","iso8601",register.targetDate.valueOf()).getCount();
	document.daycounter.julianday.value = 
		JD.toLocaleString(undefined,{useGrouping:false, maximumFractionDigits:8}); 
	if (document.daycounter.julianday.value == "") // Because bug in Chromium
		document.daycounter.julianday.value = Math.round(JD*10E7)/10E7;
	// Display other chronological counts
	document.querySelector("#unixCountDisplay").innerHTML = register.targetDate.valueOf().toLocaleString();
	document.querySelector("#mjdDisplay").innerHTML = 
		new modules.ExtCountDate ("modifiedJulianDay","iso8601",register.targetDate.valueOf()).getCount().toLocaleString(undefined,{maximumFractionDigits:8});
	document.querySelector("#nasajdDisplay").innerHTML = 
		new modules.ExtCountDate ("nasaDay","iso8601",register.targetDate.valueOf()).getCount().toLocaleString(undefined,{maximumFractionDigits:8});
	document.querySelector("#spreadSheetsCountDisplay").innerHTML = 
		new modules.ExtCountDate ("sheetsCount","iso8601",register.targetDate.valueOf()).getCount().toLocaleString(undefined,{maximumFractionDigits:8});
	document.querySelector("#MicrosoftCountDisplay").innerHTML = 
		new modules.ExtCountDate ("MSBase","iso8601",register.targetDate.valueOf()).getCount().toLocaleString(undefined,{maximumFractionDigits:8});
	document.querySelector("#MacOSCountDisplay").innerHTML = 
		new modules.ExtCountDate ("macOSCount","iso8601",register.targetDate.valueOf()).getCount("macOSCount").toLocaleString(undefined,{maximumFractionDigits:8});
	
	// Unicode frame 
	// Display Locale (language code only) as obtained after negotiation process
	document.querySelector("#langCode").innerHTML = register.userOptions.locale.includes("-u-") 
		? register.userOptions.locale.substring (0,register.userOptions.locale.indexOf("-u-")) 
		: register.userOptions.locale ;
	document.querySelector("#CalendarCode").innerHTML = register.userOptions.calendar;	// Display calendar obtained after negotiation process
	document.querySelector("#timeZone").innerHTML = register.userOptions.timeZone;	// Display time zone as obtained after negotiation process
	
	// Print Unicode string, following already computed options.
 
	// let valid = modules.ExtDateTimeFormat.unicodeValidDateinCalendar(register.targetDate, register.userOptions.timeZone, register.userOptions.calendar); // Filter bugged date expressions
	//	Write date string. Catch error if navigator fails to handle writing routine (MS Edge)
	myElement = document.getElementById("UnicodeString");
	try { myElement.innerHTML = new modules.ExtDateTimeFormat(register.userOptions.locale, register.Options).format(register.targetDate); }
	catch (e) { myElement.innerHTML = e.message; }

	//	Custom calendar date string following options. Catch error if navigator fails, in this case write without time part.
	myElement = document.getElementById("CustomString");
	try	{ myElement.innerHTML = new modules.ExtDateTimeFormat(register.userOptions.locale, register.Options, register.customCalendar).format(register.targetDate); } 
	catch (e) { myElement.innerHTML = "ExtDateTimeFormat error: " + e; }

	//  Update week properties of custom calendar, using custom week properties
	document.getElementById ("weekerror").innerHTML = ""; 
	try {
		let weekFields = register.targetDate.getWeekFields(register.userOptions.timeZone);
		document.getElementById ("weekyear").innerHTML = register.targetDate.fullYear(register.userOptions.timeZone) + weekFields.weekYearOffset; 
		document.getElementById ("yearweek").innerHTML = weekFields.weekNumber;
		document.getElementById ("weekday").innerHTML = weekFields.weekday; 	// i'd prefer name
		document.getElementById ("weeksinyear").innerHTML = "(" + weekFields.weeksInYear + ")";
	}
	catch (e) { 
		document.getElementById ("weekerror").innerHTML = e; 
	}

	// Lunar data frame

	// Update lunar parameters - using register.targetDate
	dateComponent = modules.Lunar.getCEMoonDate( register.targetDate );
	register.milesianClock.setMoonPhase(dateComponent.age*Math.PI*2/29.5305888310185);
	document.moon.age.value = dateComponent.age.toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2}); // age given as a decimal number
	document.moon.residue.value = (29.5305888310185 - dateComponent.age).toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2});
	document.moon.angle.value = modules.Lunar.getDraconiticAngle(register.targetDate).toLocaleString(undefined,{maximumFractionDigits:3, minimumFractionDigits:3});		
	document.moon.height.value = modules.Lunar.getDraconiticHeight(register.targetDate).toLocaleString(undefined,{maximumFractionDigits:3, minimumFractionDigits:3});
	dateComponent = modules.Lunar.getLunarDateTime( register.targetDate );
	document.moon.moondate.value = dateComponent.day + " " 
				+  (dateComponent.month) + "m";
	try {
		document.moon.dracotime.value = new Date(shiftDate.valueOf() + modules.Lunar.getDraconiticSunTimeAngle(register.targetDate)).toLocaleTimeString(undefined,{timeZone:'UTC'});
	}
	catch (error) {
		document.moon.dracotime.value = "--:--:--";
	}
	try {
		document.moon.moontime.value = new Date(shiftDate.valueOf() + modules.Lunar.getLunarSunTimeAngle(register.targetDate)).toLocaleTimeString(undefined,{timeZone:'UTC'});
	}
	catch (error) {
		document.moon.moontime.value = "--:--:--";
	}

	dateComponent = modules.Lunar.getCELunarDate(shiftDate);				
	document.mooncalend.CElunardate.value = 	dateComponent.day;
	document.mooncalend.CElunarmonth.value = 	dateComponent.month;
	document.mooncalend.CElunaryear.value = 	dateComponent.year;
	dateComponent = modules.Lunar.getHegirianLunarDate(shiftDate);	
	document.mooncalend.hegiriandate.value = 	dateComponent.day;
	document.mooncalend.hegirianmonth.value = dateComponent.month;
	document.mooncalend.hegirianyear.value = 	dateComponent.year;
	
	// Update Delta T (seconds)
	let deltaT = modules.Lunar.getDeltaT(register.targetDate)/modules.Milliseconds.SECOND_UNIT,
		deltaTAbs = Math.abs(deltaT), deltaTSign = Math.sign(deltaT),
		deltaTAbsDate = new Date (deltaTAbs*1000),
		deltaTDays = Math.floor (deltaTAbsDate.valueOf() / modules.Milliseconds.DAY_UNIT) ;
	document.getElementById ("deltatsec").innerHTML = (deltaTSign == -1 ? "-" : "") + deltaTAbs.toLocaleString();
	document.getElementById ("deltathms").innerHTML = (deltaTSign == -1 ? "-" : "") 
			+ (deltaTDays >= 1 ? deltaTDays + " jours " : "")
			+ deltaTAbsDate.getUTCHours() + " h " + deltaTAbsDate.getUTCMinutes() + " min " + deltaTAbsDate.getUTCSeconds() + " s";
	
	// Yearly figures. Take milesian year.
	let milesianYear = new modules.ExtDate(milesian, register.targetDate.valueOf()).fullYear(register.TZSettings.TZmode);
	document.getElementById ("seasonsyear").innerHTML = milesianYear;
	computeSignature(milesianYear, "", register.TZSettings.mode);

}
window.onload = function () {	// Global initialisations done by async initial ()

	document.getElementById("customCalend").addEventListener("click", function (event) {
		event.preventDefault();
		setCalend()
	})
	document.gregorian.addEventListener("submit", function (event) {
		event.preventDefault();
		clockAnimate.clockRun(0);
		calcGregorian()
	})
	document.custom.addEventListener("submit", function (event) {
		event.preventDefault();
		clockAnimate.off();
		calcCustom()
	})
	document.control.addEventListener("submit", function (event) {
		event.preventDefault();
		clockAnimate.changeDayOffset()
	})
	document.control.now.addEventListener("click", function (event) {
		clockAnimate.clockRun(0);
		setDateToNow()
	})
	document.control.minus.addEventListener("click", function (event) {
		clockAnimate.clockRun(0);
		clockAnimate.setDayOffset(-1)
	})
	document.control.plus.addEventListener("click", function (event) {
		clockAnimate.clockRun(0);
		clockAnimate.setDayOffset(+1)
	})
	document.time.addEventListener("submit", function (event) {
		event.preventDefault();
		clockAnimate.clockRun(0);
		calcTime()
	})
	document.timeShift.addEventListener("submit", function (event) {
		event.preventDefault();
		clockAnimate.clockRun(0);
		myTimeShift.changeAddTime()
	})
	document.timeShift.minus.addEventListener("click", function (event) {
		clockAnimate.clockRun(0);
		myTimeShift.addTime(-1)
	})
	document.timeShift.plus.addEventListener("click", function (event) {
		clockAnimate.clockRun(0);
		myTimeShift.addTime(+1)
	}) 
	document.TZmode.addEventListener("submit", function (event) {
		event.preventDefault();
		getMode();
		setDisplay();
	})
	document.getElementById("h0").addEventListener("click", function (event) {
		clockAnimate.clockRun(0);
		setUTCHoursFixed(0)
	})
	document.getElementById("h12").addEventListener("click", function (event) {
		clockAnimate.clockRun(0);
		setUTCHoursFixed(12)
	})
	document.LocaleOptions.addEventListener ("submit", function (event) {
		event.preventDefault();
		compLocalePresentationCalendar();
		setDisplay()
	})
}

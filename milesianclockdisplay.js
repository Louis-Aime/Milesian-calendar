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
/* Version	M2021-08-05
		Reorganise dial and display, simplify
	M2021-07-22	
		External modules directly loaded from GitHub, not from local copy (this may be reverted)
		Clock animated every 1s. 
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
/** A utility for the undefined fields
*/
function undef (param) {
	return param == "" ? undefined : param
}
var
	modules,		// all modules here once imported
	milesian,	// the Milesian calendar (plays a special role)
	calendars = [],	// an array (pointers to) calendar objects
	targetDate = undefined, 	// new Date(),	// Reference UTC date
	customCalIndex = 0,	// initialisation
	switchingDate = { year : 1582, month : 12, day : 20 },
	TZ = "", 	// time zone for specifying a date; "" means "system", only alternative value is "UTC".
	TZOffset = 0,
	// TZSettings : {mode : "", msoffset : 0},	// deprecate
	Options = {weekday : "long", day : "numeric", month: "long", year : "numeric", 
			hour : "numeric", minute : "numeric", second : "numeric"}, 	
	askedOptions,	// new Intl.DateTimeFormat(undefined,Options), 	
	userOptions,	// askedOptions.resolvedOptions()
	clockFormat,
	dracoDateFormat,
	milesianClock;

(async function () {	// Fetching modules and XML data, initialising
	modules = await import ('./aggregate-all.js');
	let pldrString = await import ('https://louis-aime.github.io/calendrical-javascript/pldr.js');
	let	pldrDOM = await modules.fetchDOM ("https://louis-aime.github.io/calendrical-javascript/pldr.xml")
			.then ( (pldrDOM) => pldrDOM ) // The pldr data used by the Milesian calendar (and possibly others).
			.catch ( (error) => { return pldrString.default() } );	// if error (no XML file) take default pldr 
	milesian = new modules.MilesianCalendar ("milesian",pldrDOM);
	calendars.push (milesian);
	calendars.push (new modules.GregorianCalendar ("gregorian"));
	calendars.push (new modules.JulianCalendar ("julian"));
	calendars.push (new modules.WesternCalendar ("historic", modules.ExtDate.fullUTC(switchingDate.year, switchingDate.month, switchingDate.day)));
	calendars.push (new modules.FrenchRevCalendar ("frenchrev"));
	targetDate = new modules.ExtDate(milesian);
	askedOptions = new Intl.DateTimeFormat(undefined,Options);
	userOptions = askedOptions.resolvedOptions();
	dracoDateFormat = new modules.ExtDateTimeFormat (undefined, {year : "numeric", month : "short", day : "numeric",
																	timeZone : undef (TZ) }, milesian);
	milesianClock = new modules.SolarClock( document.querySelector("#mclock") );
	compLocalePresentationCalendar();
	clockFormat = new modules.ExtDateTimeFormat (undefined,{timeZone: undef(TZ),weekday:"long",day:"numeric",month:"long",year:"numeric"},milesian)
	clockAnimate.clockRun(1);	// start clock
})();

/** clockAnimate : package for clock animation
*/
const clockAnimate = {
		TICK_INTERVAL : 1000,		
		clockPeriod : {}, // Tick generator
		clockDirection : 1, 	// Forward or reverse 
		dayOffset : 1,		// initial value
		changeDayOffset : function () { 	// Controlled change of the day offset
			let days = +document.control.shift.value;
			if (isNaN(days) || days <= 0) {
				alert ("Invalid input: " + document.control.shift.value + "\nFormer value used");
				document.control.shift.value = clockAnimate.dayOffset;
				// clockAnimate.clockRun(0);
				}
			else 
			{ 
				document.control.shift.value = clockAnimate.dayOffset = days; // Confirm changed value
			}
		},
		setDayOffset : function (sign=1) {
			// clockAnimate.changeDayOffset();	// Force a valid value in field
			let testDate = new Date(targetDate.valueOf());
			testDate.setTime (testDate.getTime() + sign*clockAnimate.dayOffset*modules.Milliseconds.DAY_UNIT);
			if (isNaN(testDate.valueOf())) { 
				alert ("Date out of range");
				clockAnimate.clockRun(0);
				}
			else {
				targetDate = new modules.ExtDate(calendars[customCalIndex], testDate.valueOf());
				setDisplay();
			}
		},
		// Next two are for runabout mode
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
			clockAnimate.clockPeriod = window.setInterval(setDateToNow , clockAnimate.TICK_INTERVAL);	// Update every tick interval
		},
		off : function () {
			window.clearInterval(clockAnimate.clockPeriod);
		}
}
/**	Time shift routines as a module (timeShift + myTimeShift)
*/
class timeShift {
	constructor () {}
	addedTime = 60000 // Time to add or substract, in milliseconds, initial value.
	changeAddTime() {
		let msecs = +document.timeShift.shift.value; 
		if (isNaN(msecs) || msecs <= 0) 
			alert ("Invalid input: " + document.timeShift.shift.value)
		else
			{ 
			document.timeShift.shift.value = this.addedTime = msecs; // Global variable and form updated
			}
		}
	addTime (sign = 1) { // addedTime ms is added or subtracted to or from the Timestamp.
		// this.changeAddTime();	// Force a valid value in field -> no, do that in event listener function.
		let testDate = new Date(targetDate.valueOf());
		testDate.setTime (testDate.getTime() + sign * this.addedTime); 
		if (isNaN(testDate.valueOf())) alert ("Out of range")
		else {
			targetDate.setTime( testDate.valueOf() );
			setDisplay();
		}
	}
}
const myTimeShift = new timeShift;

function setDateToNow(){ // set current target date new to current custom calendar and to Now
	targetDate = new modules.ExtDate(calendars[customCalIndex]); 
	setDisplay ();
}
function calcCustomDate() {
	customCalIndex = calendars.findIndex (item => item.id == document.custom.calend.value);
	var myFields = {
			day : Math.round (document.custom.day.value),
			month : Math.round (document.custom.month.value),
			year : Math.round (document.custom.year.value),
		},
		testDate = new modules.ExtDate(calendars[customCalIndex], targetDate.valueOf());
	switch (TZ) {	// get time fields following time zone mode
		case "":  
			myFields.hours = targetDate.getHours();
			myFields.minutes = targetDate.getMinutes();
			myFields.seconds = targetDate.getSeconds();
			myFields.milliseconds = targetDate.getMilliseconds();
			break;
		case "UTC" : // // Set date object from custom calendar date indication, and with UTC time of day of currently displayed date.
			myFields.hours = targetDate.getUTCHours();
			myFields.minutes = targetDate.getUTCMinutes();
			myFields.seconds = targetDate.getUTCSeconds();
			myFields.milliseconds = targetDate.getUTCMilliseconds();
			break;
	}
	testDate.setFromFields(myFields, TZ);
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		// Here, no control of date validity, leave JS recompute the date if day of month is out of bounds
		targetDate = testDate; // new modules.ExtDate(calendars[customCalIndex], testDate.valueOf());
		setDisplay();
		}
}
function calcWeek() {
	customCalIndex = calendars.findIndex (item => item.id == document.custom.calend.value);
	var myFields = {
			weekYear : Math.round (document.week.weekyear.value),
			weekNumber : Math.round (document.week.weeknumber.value),
			weekday : Math.round (document.week.weekday.value)
		}, 
		testDate = new modules.ExtDate(calendars[customCalIndex], targetDate.valueOf());
	switch (TZ) {
		case "":  // Set date object from custom calendar week date indication, and with time of day of currently displayed date.
			myFields.hours = targetDate.getHours();
			myFields.minutes = targetDate.getMinutes();
			myFields.seconds = targetDate.getSeconds();
			myFields.milliseconds = targetDate.getMilliseconds();
			break;
		case "UTC" : // // Set date object from custom calendar date indication, and with UTC time of day of currently displayed date.
			myFields.hours = targetDate.getUTCHours();
			myFields.minutes = targetDate.getUTCMinutes();
			myFields.seconds = targetDate.getUTCSeconds();
			myFields.milliseconds = targetDate.getUTCMilliseconds();
			break;
	}
	testDate.setFromWeekFields( myFields, TZ );
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		// Here, no control of date validity, leave JS recompute the date if day of month is out of bounds
		targetDate = testDate; 	// new modules.ExtDate(calendars[customCalIndex], testDate.valueOf());	// set custom calendar if changed, and set date.
		setDisplay();
		}
}
function calcJulianDay(){ // here, Julian Day is specified as a decimal number. Insert with the suitable Date setter.
	var j = (document.daycounter.julianday.value); // extract Julian Day, numeric value (not necessarily integer) expected.
	j = j.replace(/\s/gi, ""); j = j.replace(/,/gi, "."); j = Number (j);
	if (isNaN (j)) alert ("Non numeric value" + ' "' + document.daycounter.julianday.value + '"')
	else {
		let jd = new modules.ExtCountDate ("julianDay","iso8601",0);
		jd.setFromCount(j);
		if (isNaN(jd.valueOf())) alert ("Date out of range")
		else {
			targetDate = new modules.ExtDate (calendars[customCalIndex],jd.valueOf());
			setDisplay();
		}
	}
}
function calcTime() {
	var hours = Math.round (document.time.hours.value), mins = Math.round (document.time.mins.value), 
		secs = Math.round (document.time.secs.value), ms = Math.round (document.time.ms.value);
	if (isNaN(hours) || isNaN (mins) || isNaN (secs) || isNaN (ms)) 
		alert ("Invalid date " + '"' + document.time.hours.value + '" "' + document.time.mins.value + '" "' 
		+ document.time.secs.value + '.' + document.time.ms.value + '"')
	 else {
	  let testDate = new modules.ExtDate (calendars[customCalIndex],targetDate.valueOf());
	  switch (TZ) {
		case "" : testDate.setHours(hours, mins, secs, ms); break;
		case "UTC" : testDate.setUTCHours(hours, mins, secs, ms); break;
		}
		if (isNaN(testDate.valueOf())) alert ("Out of range")
		else {
			targetDate = new modules.ExtDate (calendars[customCalIndex],testDate.valueOf());
			setDisplay();
		}
	}
}	
function setUTCHoursFixed (UTChours=0) { // set UTC time to the hours specified.
	if (typeof UTChours == undefined)  UTChours = document.UTCset.Compute.value;
	let testDate = new Date (targetDate.valueOf());
	testDate.setUTCHours(UTChours, 0, 0, 0);
	if (isNaN(testDate.valueOf())) alert ("Out of range")
	else {
		targetDate.setTime (testDate.valueOf());
		setDisplay();
	}
}

function compLocalePresentationCalendar() {	// Manage date string display parameters
	var 
		Locale = document.LocaleOptions.Language.value,
		Calendar = document.LocaleOptions.Calendar.value,
		timeZone = document.LocaleOptions.TimeZone.value,
		testDTF;

	// Negotiate effective language code and display 
	// Test if passed language is OK
	try {
		testDTF = new modules.ExtDateTimeFormat (undef(Locale))
	}
	catch (e) {
		alert (e);
		document.LocaleOptions.Language.value = "";
		return
	}
	Locale = testDTF.resolvedOptions().locale; 	// Here Locale is no longer an empty string
	if (Locale.includes("-u-"))		// The Unicode extension ("-u-") is indicated in the specified locale, drop it
	Locale = Locale.substring (0,Locale.indexOf("-u-"));

	// Set presentation Options from one of the standard presentations listed.
	switch (document.LocaleOptions.DatePresentation.value) {
		case "long": 
			Options = {weekday : "long", day : "numeric", month : "long", year : "numeric", era : "long", eraDisplay : "always"}; break;
		case "standard":
			Options = {weekday : "long", day : "numeric", month: "long", year : "numeric", era : "long", eraDisplay : "auto"}; break;
		case "short":
			Options = {weekday : "short", day : "numeric", month: "short", year : "numeric", era : "short"}; break;
		case "narrow":
			Options = {weekday : "narrow", day : "numeric", month: "narrow", year : "numeric", era : "narrow"}; break;	
		case "numeric":
			Options = {day : "numeric", month : "numeric", year : "numeric", era : "narrow"}; break;
		case "2-digit":
			Options = {day : "2-digit", month : "2-digit", year : "numeric"}; break;
		case "year-2-digit":
			Options = {day : "2-digit", month : "2-digit", year : "2-digit", eraDisplay : "never"}; break;
		case "none": Options = {}
		}
	switch (document.LocaleOptions.TimePresentation.value) {
		case "total": Options.hour = "numeric"; Options.minute = "numeric"; Options.second = "numeric"; 
			Options.fractionalSecond = 3; Options.timeZoneName = "short"; break;
		case "detail": Options.hour = "numeric"; Options.minute = "numeric"; Options.second = "numeric"; 
			Options.timeZoneName = "long"; break;
		case "second": Options.hour = "numeric"; Options.minute = "numeric"; Options.second = "numeric"; break;
		case "minute": Options.hour = "numeric"; Options.minute = "numeric"; break;
		case "hour": Options.hour = "numeric"; break;
		case "hmstz": Options.hour = "2-digit"; Options.minute = "2-digit"; Options.second = "2-digit"; 
			Options.timeZoneName = "short"; break;
		case "hm": Options.hour = "2-digit"; Options.minute = "2-digit"; break;
		case "none": 
	}
	// Add Unicode calendar in options
	if (Calendar != "") Options.calendar = Calendar; // No error expected, since calendar is picked up from a list

	// Add time zone in Options
	if (timeZone != "") 
		Options.timeZone = timeZone ; 
	// is timeZone valid ?
	try {
		testDTF = new Intl.DateTimeFormat (Locale, Options);
		}
	catch (e) {
		alert (e);
		delete Options.timeZone; // Delete property
		document.LocaleOptions.TimeZone.value = "";
		return
	}
	askedOptions = new modules.ExtDateTimeFormat (undef(Locale),Options,calendars[customCalIndex]);
	userOptions = askedOptions.resolvedOptions(); 
}

function setDisplay () {	// Disseminate targetDate and time on all display fields
	
	// establish variables used only for this display cycle
	var
		dateComponent = targetDate.getFields(TZ),
		milDate = new modules.ExtDate (milesian, targetDate.valueOf()),
		mildateComponent = milDate.getFields(TZ),	// Initiate a date decomposition in Milesian, to be used several times in subsequent code
		myElement = document.querySelector("#mclock"),	// myElement is a work variable
		myCollection;	// Another work variable, used later
	// Calendar specified via event listener
	// TZ = Time zone mode specified. Compute effective time zone offset
/** TZOffset is JS time zone offset in milliseconds (UTC - local time)
 * Note that getTimezoneOffset sometimes gives an integer number of minutes where a decimal number is expected
*/
	{
		TZOffset = targetDate.getRealTZmsOffset().valueOf();
		let
			systemSign = (TZOffset > 0 ? -1 : 1), // invert sign because of JS convention for time zone
			absoluteRealOffset = - systemSign * TZOffset,
			absoluteTZmin = Math.floor (absoluteRealOffset / modules.Milliseconds.MINUTE_UNIT),
			absoluteTZsec = Math.floor ((absoluteRealOffset - absoluteTZmin * modules.Milliseconds.MINUTE_UNIT) / modules.Milliseconds.SECOND_UNIT);

		switch (TZ) {
			case "UTC" : 
				TZOffset = 0; // Set offset to 0, but leave time zone offset on display
			case "" : 
				document.querySelector("#realTZOffset").innerHTML = (systemSign == 1 ? "+ ":"- ") + absoluteTZmin + " min " + absoluteTZsec + " s";
		}
	}
	// Formatting structures modifications are established at asynchronous init and by event. No recomputation here.

	// Update local time fields - using	Date properties
	document.time.hours.value = dateComponent.hours;
	document.time.mins.value = dateComponent.minutes;
	document.time.secs.value = dateComponent.seconds;
	document.time.ms.value = dateComponent.milliseconds;

    //  Update custom calendar

    document.custom.year.value = dateComponent.fullYear;
    document.custom.month.value = dateComponent.month;
    document.custom.day.value = dateComponent.day;
	document.week.weekyear.value = targetDate.weekYear(TZ); 
	document.week.weeknumber.value = targetDate.weekNumber(TZ);
	document.week.weekday.value = targetDate.weekday(TZ);
	document.week.weeksinyear.value = targetDate.weeksInYear(TZ);
	document.week.dayofweek.value = 
		new modules.ExtDateTimeFormat (undef (userOptions.locale), {weekday : "long", timeZone : undef(TZ)}, calendars[customCalIndex])
			.format(targetDate);

	// Place marks that say that custom calendar was not valid
	myElement = document.querySelector("#customline");
	myCollection = myElement.getElementsByClassName("mutable");
	// first remove marks from another display
	for (let i = 0; i < myCollection.length; i++)
		myCollection[i].setAttribute("class", myCollection[i].getAttribute("class").replace(" outbounds",""))
	// Then check whether marks should be set
	if (typeof calendars[customCalIndex].valid == "function" && !calendars[customCalIndex].valid(dateComponent)) 
		for (let i = 0; i < myCollection.length; i++)
			myCollection[i].setAttribute("class", myCollection[i].getAttribute("class").replace(" outbounds","") + " outbounds");

	// Julian Day and chronological fields
	let JD = new modules.ExtCountDate ("julianDay","iso8601",targetDate.valueOf()).getCount();
	document.daycounter.julianday.value = JD;
		// = JD.toLocaleString(undefined,{maximumFractionDigits:8}); // JD.toLocaleString(undefined,{useGrouping:false, maximumFractionDigits:8})
/*	if (document.daycounter.julianday.value == "") // Because bug in Chromium
		document.daycounter.julianday.value = Math.round(JD*10E7)/10E7;
*/
	document.querySelector("#unixCountDisplay").innerHTML = targetDate.valueOf().toLocaleString();
	document.querySelector("#mjdDisplay").innerHTML = 
		new modules.ExtCountDate ("modifiedJulianDay","iso8601",targetDate.valueOf()).getCount().toLocaleString(undefined,{maximumFractionDigits:8});
	document.querySelector("#nasajdDisplay").innerHTML = 
		new modules.ExtCountDate ("nasaDay","iso8601",targetDate.valueOf()).getCount().toLocaleString(undefined,{maximumFractionDigits:8});
	document.querySelector("#spreadSheetsCountDisplay").innerHTML = 
		new modules.ExtCountDate ("sheetsCount","iso8601",targetDate.valueOf()).getCount().toLocaleString(undefined,{maximumFractionDigits:8});
	document.querySelector("#MicrosoftCountDisplay").innerHTML = 
		new modules.ExtCountDate ("MSBase","iso8601",targetDate.valueOf()).getCount().toLocaleString(undefined,{maximumFractionDigits:8});
	document.querySelector("#MacOSCountDisplay").innerHTML = 
		new modules.ExtCountDate ("macOSCount","iso8601",targetDate.valueOf()).getCount("macOSCount").toLocaleString(undefined,{maximumFractionDigits:8});
	
	// Unicode frame 
	// Display Locale (language code only) as obtained after negotiation process
	document.querySelector("#langCode").innerHTML = userOptions.locale.includes("-u-") 
		? userOptions.locale.substring (0,userOptions.locale.indexOf("-u-")) 
		: userOptions.locale ;
	document.querySelector("#CalendarCode").innerHTML = userOptions.calendar;	// Display calendar obtained after negotiation process
	document.querySelector("#timeZone").innerHTML = userOptions.timeZone;	// Display time zone as obtained after negotiation process
	
	// Print Unicode string, following already computed options.
 	//	Write date string. Catch error if navigator fails to handle writing routine (MS Edge)
	myElement = document.getElementById("UnicodeString");
	try { myElement.innerHTML = new modules.ExtDateTimeFormat(userOptions.locale, Options).format(targetDate); }
	catch (e) { myElement.innerHTML = e.message; }

	//	Custom calendar date string following options. Catch error if navigator fails, in this case write without time part.
	myElement = document.getElementById("CustomString");
	try	{ myElement.innerHTML = askedOptions.format(targetDate); } 
	catch (e) { myElement.innerHTML = "ExtDateTimeFormat.format error: " + e; }
/*	Week properties: already in controlled fields
	//  Update week properties of custom calendar, using custom week properties
	document.getElementById ("weekerror").innerHTML = ""; 
	try {
		let weekFields = targetDate.getWeekFields(userOptions.timeZone);
		document.getElementById ("weekyear").innerHTML = weekFields.weekYear; 
		document.getElementById ("yearweek").innerHTML = weekFields.weekNumber;
		document.getElementById ("weekday").innerHTML = weekFields.weekday; 	// i'd prefer name
		document.getElementById ("weeksinyear").innerHTML = "(" + weekFields.weeksInYear + ")";
	}
	catch (e) { 
		document.getElementById ("weekerror").innerHTML = e; 
	}
*/
	// Lunar data frame

	// Update lunar parameters
	dateComponent = modules.Lunar.getCEMoonDate( targetDate );
	milesianClock.setMoonPhase(dateComponent.age*Math.PI*2/29.5305888310185);
	document.moon.age.value = dateComponent.age.toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2}); // age given as a decimal number
	document.moon.residue.value = (29.5305888310185 - dateComponent.age).toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2});
	dateComponent = modules.Lunar.getLunarDateTime( targetDate, TZ );
	document.moon.moondate.value = dateComponent.day + " " 
				+  (dateComponent.month) + "m";
	try {
		document.moon.moontime.value = new Date(targetDate.valueOf() + modules.Lunar.getLunarSunTimeAngle(targetDate))
						.toLocaleTimeString(undefined, {timeZone: undef(TZ)} );
	}
	catch (error) {
		document.moon.moontime.value = "--:--:--";
	}
		let [caput, cauda, eclipse] = modules.Lunar.getDraconiticNodes (targetDate);
		document.moon.caput.value = dracoDateFormat.format (caput);
		document.moon.cauda.value = dracoDateFormat.format (cauda);
		myElement = document.getElementById("EclipseField");
		if (eclipse) myElement.setAttribute("class", myElement.getAttribute("class").replace(" attention","") + " attention")
			else myElement.setAttribute("class", myElement.getAttribute("class").replace(" attention",""));
		document.moon.eclipseseason.value = eclipse;

	dateComponent = modules.Lunar.getCELunarDate(targetDate, TZ);
	document.mooncalend.CElunardate.value = 	dateComponent.day;
	document.mooncalend.CElunarmonth.value = 	dateComponent.month;
	document.mooncalend.CElunaryear.value = 	dateComponent.year;
	dateComponent = modules.Lunar.getHegirianLunarDate(targetDate, TZ);	
	document.mooncalend.hegiriandate.value = 	dateComponent.day;
	document.mooncalend.hegirianmonth.value = dateComponent.month;
	document.mooncalend.hegirianyear.value = 	dateComponent.year;
	
	// Update Delta T (seconds)
	let deltaT = modules.getDeltaT(targetDate)/modules.Milliseconds.SECOND_UNIT,
		deltaTAbs = Math.abs(deltaT), deltaTSign = Math.sign(deltaT),
		deltaTAbsDate = new Date (deltaTAbs*1000),
		deltaTDays = Math.floor (deltaTAbsDate.valueOf() / modules.Milliseconds.DAY_UNIT) ;
	document.getElementById ("deltatsec").innerHTML = (deltaTSign == -1 ? "-" : "") + deltaTAbs.toLocaleString();
	document.getElementById ("deltathms").innerHTML = (deltaTSign == -1 ? "-" : "") 
			+ (deltaTDays >= 1 ? deltaTDays + " jours " : "")
			+ deltaTAbsDate.getUTCHours() + " h " + deltaTAbsDate.getUTCMinutes() + " min " + deltaTAbsDate.getUTCSeconds() + " s";
	
	// Yearly figures. Take milesian year.
	let milesianYear = milDate.fullYear(TZ);
	document.getElementById ("seasonsyear").innerHTML = milesianYear;
	computeSignature(milesianYear, "", TZ);

	// Write Milesian date string near dial
	myElement = document.getElementById("clockmilesiandate"); 	// Milesian date element
	myElement.innerHTML = new modules.ExtDateTimeFormat 
		(undefined,{timeZone: undef(TZ), weekday:"long", day:"numeric", month:"long", year:"numeric"}, milesian).format(targetDate);
	// Finally update and display clock
	milesianClock.setHands (milDate.year(TZ), milDate.month(TZ), milDate.day(TZ),
		milDate.hours(TZ), milDate.minutes(TZ), milDate.seconds(TZ), caput.month(), caput.day() ); // Display date on clock.
	milesianClock.setSeasons (milDate.year("UTC")); // Display also seasons.
}

window.onload = function () {	// Initiate fields and set event listeners

	document.gregorianswitch.day.value = switchingDate.day;
	document.gregorianswitch.month.value = switchingDate.month;
	document.gregorianswitch.year.value = switchingDate.year;

	document.gregorianswitch.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		let 
			day =  Math.round (event.srcElement.elements.day.value),
			month = event.srcElement.elements.month.value,
			year =  Math.round (event.srcElement.elements.day.value),
			testDate = new modules.ExtDate (calendars.find(item => item.id == "gregorian"),modules.ExtDate.fullUTC(year, month, day)),
			index = calendars.findIndex (item => item.id == "historic");
		if ( (testDate.valueOf() >= Date.UTC(1582,9,15,0,0,0,0)) && (testDate.day() == day) ) 
			calendars[index] = new modules.WesternCalendar("historic", testDate.valueOf())
		else alert ("Invalid switching date to Gregorian calendar: " + day + '/' + month + '/' + year );
		// confirm current switching date
		[document.gregorianswitch.day.value, document.gregorianswitch.month.value, document.gregorianswitch.year.value ]
			= [ switchingDate.day, switchingDate.month, switchingDate.year ] = [ day, month, year ];
		if (calendars[customCalIndex].id == "historic") targetDate = new modules.ExtDate (calendars[index], targetDate.valueOf());	// sweep former historic calendar out of current data
		setDisplay();
	})	
		
	document.custom.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		clockAnimate.clockRun(0);
		calcCustomDate()
	})
	document.custom.calend.addEventListener("blur", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		customCalIndex = calendars.findIndex (item => item.id == document.custom.calend.value);  // change custom calendar
		targetDate = new modules.ExtDate(calendars[customCalIndex], targetDate.valueOf());	// set custom calendar if changed, and set date.
		setDisplay();
	})

	document.week.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		clockAnimate.clockRun(0);
		calcWeek()
	})
	document.daycounter.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		clockAnimate.clockRun(0);
		calcJulianDay()
	})

	document.control.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
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
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		clockAnimate.clockRun(0);
		calcTime()
	})

	document.timeShift.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		myTimeShift.changeAddTime()
	})
	document.timeShift.minus.addEventListener("click", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		clockAnimate.clockRun(0);
		myTimeShift.changeAddTime()
		myTimeShift.addTime(-1)
	})
	document.timeShift.plus.addEventListener("click", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		clockAnimate.clockRun(0);
		myTimeShift.changeAddTime()
		myTimeShift.addTime(+1)
	}) 

	document.TZmode.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		TZ = document.TZmode.TZcontrol.value;
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
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		compLocalePresentationCalendar();
		setDisplay()
	})
}

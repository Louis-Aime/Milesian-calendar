/* Milesian Clock and converter functions - on load part, end of HTML
Character set is UTF-8.
These functions are associated with the Milesian clock and converter html page: 
They use the basic Milesian calendar functions, and the conversion functions of other calendar,
in order to display the Milesian on-line clock and to perform calendar conversion.
Associated with: 
*	MilesianClock.html
/* Version notes
	This file is highly related to the corresponding html code. 
	This part is especially for setting the frame after HTML loading.
*/
/* Version	M2021-08-30 
see GitHub
*/
/* Copyright Louis A. de Fouquières https://github.com/Louis-Aime 2016-2022
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
*/
"use strict";
var
	jdcounterselector = "julianDayAtNight";	// for use with ExtCountDate

var
	milesian,	// the Milesian calendar (plays a special role)
	calendars = [],	// an array (pointers to) calendar objects
	targetDate = undefined, 	// new Date(),	// Reference UTC date
	customCalIndex = 0,	// initialised and later changed.
	switchingDate = { year : 1582, month : 10, day : 15 },
	TZ = "UTC", 	// time zone for specifying a date; "" means "system", only alternative value is "UTC". Only "UTC" used with converter.
	TZOffset = 0,
	// TZSettings : {mode : "", msoffset : 0},	// deprecate
	Options = {weekday : "long", day : "numeric", month: "long", year : "numeric", 
			hour : "numeric", minute : "numeric", second : "numeric"}, 	
	askedOptions,	// for custom calendar
	userOptions,	// 
	unicodeFormat,	// for Unicode selected calendar
	unicodeOptions,
	clockFormat,
	astroCalend,
	weekFormat,		// formater for day of week for current custom calendars
	DOWFormat,		// formater for the traditional week day, used for the yearly figures
	romanDateFormat,	// monthDay for julian and gregorian calendar
	lunarDateFormat, // monthDay to indicate a general astronomical event 
	dracoDateFormat,	// year month day
	seasonDateFormat,	// year month day hours minutes
	milesianClock;

function compLocalePresentationCalendar() {	// Manage date string display parameters
	var 
		Locale = document.LocaleOptions.Language.value,
		// Calendar = document.LocaleOptions.Calendar.value,
		// timeZone = document.LocaleOptions.TimeZone.value,
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
/*
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
*/
	/*
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
	*/
	// Formater for Milesian clock.
	clockFormat = new modules.ExtDateTimeFormat (Locale,{timeZone: undef(TZ),weekday:"long",day:"numeric",month:"long",year:"numeric"},milesian);

	// Compute formater for custom calendar
	askedOptions = new modules.ExtDateTimeFormat (undef(Locale),Options,calendars[customCalIndex]);
	userOptions = askedOptions.resolvedOptions(); 

	// Compute formater for Unicode. Used once, but computed options are useful
	unicodeFormat = new modules.ExtDateTimeFormat (undef(Locale),Options);	// unicode calendar in Options.calendar
	unicodeOptions = unicodeFormat.resolvedOptions();
	
	weekFormat = new modules.ExtDateTimeFormat (undef (Locale), {weekday : "long", timeZone : undef(TZ)}, calendars[customCalIndex]);

/*
	// Select calendar for astronomical data
	switch (document.LocaleOptions.astrocalendar.value) {
		case undefined : case "milesian" : astroCalend = milesian; break;
		case "custom"	: astroCalend = calendars[customCalIndex]; break;
		case "unicode"	: astroCalend = unicodeOptions.calendar; break; 
		default : throw new RangeError ("Unexpected value for calendar choice option: " + document.LocaleOptions.astrocalendar.value);
	}
	// fix astro date formaters
	DOWFormat = new modules.ExtDateTimeFormat (undef(Locale), 
			{ weekday : "long", calendar : "iso8601"});
	romanDateFormat = new modules.ExtDateTimeFormat (undef(Locale), 
			{month : "short", day : "numeric", calendar : "iso8601" });
	dracoDateFormat = new modules.ExtDateTimeFormat (undef(Locale), 
			{year : "numeric", month : "short", day : "numeric", timeZone : undef (TZ) }, astroCalend);
	seasonDateFormat = new modules.ExtDateTimeFormat (undef(Locale), 
			{year : "numeric", month : "short", day : "numeric", hour : "numeric", minute : "numeric", timeZone : undef (TZ) }, astroCalend);
	lunarDateFormat = new modules.ExtDateTimeFormat (undef(Locale), 
			{month : "short", day : "numeric", timeZone : undef (TZ) }, astroCalend);
*/
}

window.onload = function () {	// Initiate fields and set event listeners

	[ switchingDate.day, switchingDate.month, switchingDate.year ] 
		= [ document.gregorianswitch.day.value, document.gregorianswitch.month.value, document.gregorianswitch.year.value ];

	loadComplete.then (() => {
		milesian = new modules.MilesianCalendar ("milesian",pldrDOM);
		calendars.push (milesian);
		calendars.push (new modules.GregorianCalendar ("iso_8601"));
		calendars.push (new modules.JulianCalendar ("julian"));
		calendars.push (new modules.WesternCalendar ("historic", modules.ExtDate.fullUTC(switchingDate.year, switchingDate.month, switchingDate.day)));
		calendars.push (new modules.FrenchRevCalendar ("frenchrev",pldrDOM));
		customCalIndex = calendars.findIndex (item => item.id == document.custom.calend.value);  // set initial custom calendar - but calendars must exist !
		// targetDate = new modules.ExtDate(milesian);
		milesianClock = new modules.SolarClock( document.querySelector("#convclock") );
		compLocalePresentationCalendar();
		setDateToToday();	// initiate clock	
	});

	document.gregorianswitch.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		let 
			day =  Math.round (event.srcElement.elements.day.value),
			month = event.srcElement.elements.month.value,
			year =  Math.round (event.srcElement.elements.year.value),
			testDate = new modules.ExtDate (calendars.find(item => item.id == "iso_8601"),modules.ExtDate.fullUTC(year, month, day)),
			index = calendars.findIndex (item => item.id == "historic");
		if ( (testDate.valueOf() >= Date.UTC(1582,9,15,0,0,0,0)) && (testDate.day() == day) ) 
			calendars[index] = new modules.WesternCalendar("historic", testDate.valueOf())
		else alert ("Invalid switching date to Gregorian calendar: " + day + '/' + month + '/' + year );
		// confirm current switching date
		[document.gregorianswitch.day.value, document.gregorianswitch.month.value, document.gregorianswitch.year.value ]
			= [ switchingDate.day, switchingDate.month, switchingDate.year ] = [ day, month, year ];
		compLocalePresentationCalendar();	// because we changed one calendar, disseminate change.
		if (calendars[customCalIndex].id == "historic") targetDate = new modules.ExtDate (calendars[index], targetDate.valueOf());	
			// sweep former historic calendar out of current data
		setDisplay();
	})	
		
	document.custom.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		calcCustomDate()
	})
	document.custom.calend.addEventListener("blur", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		customCalIndex = calendars.findIndex (item => item.id == document.custom.calend.value);  // change custom calendar
		targetDate = new modules.ExtDate(calendars[customCalIndex], targetDate.valueOf());	// set custom calendar if changed, and set date.
		compLocalePresentationCalendar();
		setDisplay();
	})

	document.week.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		calcWeek()
	})
	document.daycounter.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		calcJulianDay()
	})

	document.control.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		clockAnimate.changeDayOffset()
	})
	document.control.now.addEventListener("click", function (event) {
		setDateToToday()
	})
	document.control.minus.addEventListener("click", function (event) {
		clockAnimate.setDayOffset(-1)
	})
	document.control.plus.addEventListener("click", function (event) {
		clockAnimate.setDayOffset(+1)
	})
/*
	document.time.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
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
*/
	document.LocaleOptions.addEventListener ("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		compLocalePresentationCalendar();
		setDisplay()
	})
}

/** Milesian converter functions, on load part;
 * These functions are associated with the Milesian converter html page: 
 * They use the basic Milesian calendar functions, and the conversion functions of other calendar,
 * in order to perform calendar conversion.
 * Here the general framework and the event listeners are set.
 * Only a few implementation comments are given here, since this code is mainly for demonstration purposes.
 * @file 
 * @version M2025-08-12 specific display for Unicode's 'iso8601' (differs from the standard and among browsers)
 * @author Louis A. de Fouquières https://github.com/Louis-Aime
 * @license MIT 2016-2025 
 * @see converter.html
*/ 
/* Copyright Louis A. de Fouquières https://github.com/Louis-Aime 2016-2025
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
	Time presentation option are not handled for this date converter.
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
	No astronomical data
*/
}

window.onload = function () {	// Initiate fields and set event listeners

	[ switchingDate.day, switchingDate.month, switchingDate.year ] 
		= [ document.gregorianswitch.day.value, document.gregorianswitch.month.value, document.gregorianswitch.year.value ];

	loadComplete.then (() => {
		milesian = new modules.MilesianCalendar ("milesian",pldrDOM);
		calendars.push (milesian);
		calendars.push (new modules.ISO8601Calendar ("iso_8601"));
		calendars.push (new modules.ProlepticGregorianCalendar ("prolepgreg"));
		calendars.push (new modules.JulianCalendar ("julian"));
		calendars.push (new modules.GregorianCalendar ("gregorian", modules.ExtDate.fullUTC(switchingDate.year, switchingDate.month, switchingDate.day), pldrDOM));
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
			index = calendars.findIndex (item => item.id == "gregorian");
		if ( (testDate.valueOf() >= Date.UTC(1582,9,15,0,0,0,0)) && (testDate.day() == day) ) 
			calendars[index] = new modules.GregorianCalendar("gregorian", testDate.valueOf(), pldrDOM)
		else alert ("Invalid switching date to Gregorian calendar: " + day + '/' + month + '/' + year );
		// confirm current switching date
		[document.gregorianswitch.day.value, document.gregorianswitch.month.value, document.gregorianswitch.year.value ]
			= [ switchingDate.day, switchingDate.month, switchingDate.year ] = [ day, month, year ];
		compLocalePresentationCalendar();	// because we changed one calendar, disseminate change.
		if (calendars[customCalIndex].id == "gregorian") targetDate = new modules.ExtDate (calendars[index], targetDate.valueOf());	
			// sweep former gregorian calendar out of current data
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
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		clockAnimate.changeDayOffset()
		clockAnimate.setDayOffset(-1)
	})
	document.control.plus.addEventListener("click", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		clockAnimate.changeDayOffset()
		clockAnimate.setDayOffset(+1)
	})
/*
	No time-related event listener
*/
	document.LocaleOptions.addEventListener ("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		compLocalePresentationCalendar();
		setDisplay()
	})
}

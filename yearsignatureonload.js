/* Milesian yearly characteristics figures - on load part, end of HTML
Character set is UTF-8.
These functions are associated with the page of yearly characteristics figures: 
They use the basic Milesian calendar functions, and the conversion functions of other calendar,
in order to display the Milesian on-line clock and to perform calendar conversion.
Associated with: 
*	yearsignaturepanel.html
/* Version notes
	This file is highly related to the corresponding html code. 
	This part is especially for setting the frame after HTML loading.
*/
/* Version M2021-08-30
(see GitHub)
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
	jdcounterselector = "julianDayAtNight";	// for use with ExtCountDate

var
	milesian,	// the Milesian calendar (plays a special role)
	calendars = [],	// an array (pointers to) calendar objects
	targetDate = undefined, 	// new Date(),	// Reference UTC date
	customCalIndex = 0,	// initialised and later changed.
	// switchingDate = { year : 1582, month : 12, day : 20 },
	TZ = "UTC", 	// time zone for specifying a date; "" means "system", only alternative value is "UTC". Only "UTC" used with converter.
	TZOffset = 0,
	// TZSettings : {mode : "", msoffset : 0},	// deprecate
	Options = {weekday : "long", day : "numeric", month: "long", year : "numeric", 
			hour : "numeric", minute : "numeric", second : "numeric"}, 	
	askedOptions,	// for custom calendar
	userOptions,	// 
/*
	unicodeFormat,	// for Unicode selected calendar
	unicodeOptions,
	clockFormat,
	weekFormat,		// formater for day of week for current custom calendars
	dracoDateFormat,	// year month day
*/
	astroCalend,
	romanDateFormat,	// monthDay for julian and gregorian calendar
	DOWFormat,		// formater for the traditional week day, used for the yearly figures
	lunarDateFormat, // monthDay to indicate a general astronomical event or a Easter date
	seasonDateFormat,	// year month day hours minutes
	Locale,				// undefined on purpose - for now
	milesianClock;

function undef (param) {
	return param == "" ? undefined : param
}

function displayDeltaT () {
	let deltaT = modules.getDeltaT(targetDate)/modules.Milliseconds.SECOND_UNIT,
		deltaTAbs = Math.abs(deltaT), deltaTSign = Math.sign(deltaT),
		deltaTAbsDate = new Date (deltaTAbs*1000),
		deltaTDays = Math.floor (deltaTAbsDate.valueOf() / modules.Milliseconds.DAY_UNIT) ;
	document.getElementById ("deltatsec").innerHTML = (deltaTSign == -1 ? "-" : "") + deltaTAbs.toLocaleString();
	document.getElementById ("deltathms").innerHTML = (deltaTSign == -1 ? "-" : "") 
			+ (deltaTDays >= 1 ? deltaTDays + " jours " : "")
			+ deltaTAbsDate.getUTCHours() + " h " + deltaTAbsDate.getUTCMinutes() + " min " + deltaTAbsDate.getUTCSeconds() + " s";
}

function compLocalePresentationCalendar () {
	astroCalend = calendars[customCalIndex];
	DOWFormat = new modules.ExtDateTimeFormat (undef(Locale), 
			{ weekday : "long", calendar : "iso8601"});
	romanDateFormat = new modules.ExtDateTimeFormat (undef(Locale), 
			{month : "short", day : "numeric", calendar : "iso8601" });
	lunarDateFormat = new modules.ExtDateTimeFormat (undef(Locale), 
			{month : "short", day : "numeric", timeZone : undef (TZ) }, astroCalend);
	seasonDateFormat = new modules.ExtDateTimeFormat (undef(Locale), 
			{year : "numeric", month : "short", day : "numeric", hour : "numeric", minute : "numeric", timeZone : undef (TZ) }, astroCalend);
}

window.onload = function () {	// Initiate fields and set event listeners
/*
	document.gregorianswitch.day.value = switchingDate.day;
	document.gregorianswitch.month.value = switchingDate.month;
	document.gregorianswitch.year.value = switchingDate.year;
*/
	loadComplete.then (() => {
		milesian = new modules.MilesianCalendar ("milesian",pldrDOM);
		calendars.push (milesian);
		calendars.push (new modules.GregorianCalendar ("iso_8601"));
		calendars.push (new modules.JulianCalendar ("julian"));
		calendars.push (new modules.FrenchRevCalendar ("frenchrev",pldrDOM));
		customCalIndex = calendars.findIndex (item => item.id == document.details.calend.value);  // set initial custom calendar - but calendars must exist !
		// targetDate = new modules.ExtDate(milesian);
		// milesianClock = new modules.SolarClock( document.querySelector("#convclock") );
		// compLocalePresentationCalendar();
		compLocalePresentationCalendar ();
		setYearToNow(milesian);
		displayDeltaT();
	});
/*
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
*/
	document.details.calend.addEventListener("blur", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		customCalIndex = calendars.findIndex (item => item.id == document.details.calend.value);  // change custom calendar
		targetDate = new modules.ExtDate(calendars[customCalIndex], targetDate.valueOf());	// set custom calendar if changed, to current date.
		compLocalePresentationCalendar();
		setYear (document.yearglobal.year.value);
		displayDeltaT();
	})
/*
	document.week.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		calcWeek()
	})
	document.daycounter.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		calcJulianDay()
	})
*/
	document.yearglobal.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		setYear(event.srcElement.elements.year.value);
		targetDate.setFromFields ({ year: event.srcElement.elements.year.value},"UTC");
		displayDeltaT();
	})
	document.yearglobal.plus.addEventListener("click", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		setYearOffset(+document.yearglobal.shift.value);
		targetDate.setFromFields ({ year: document.yearglobal.year.value},"UTC");
		displayDeltaT();
	})
	document.yearglobal.minus.addEventListener("click", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		setYearOffset(-document.yearglobal.shift.value);
		targetDate.setFromFields ({ year: document.yearglobal.year.value},"UTC");
		displayDeltaT();
	})
/*
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
	document.LocaleOptions.addEventListener ("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		compLocalePresentationCalendar();
		setDisplay()
	})
*/
}

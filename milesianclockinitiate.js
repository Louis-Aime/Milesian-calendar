/* Milesian Clock and converter functions - initiate part
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
	This part is especially for initialisation.
*/
/* Version	M2021-08-07
		Created from milesianclockdisplay.js

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
var	// global variables at document level.
	modules,		// all modules here once imported
	milesian,	// the Milesian calendar (plays a special role)
	calendars = [],	// an array (pointers to) calendar objects
	targetDate = undefined, 	// new Date(),	// Reference UTC date
	customCalIndex = 0,	// initialised and later changed.
	switchingDate = { year : 1582, month : 12, day : 20 },
	TZ = "", 	// time zone for specifying a date; "" means "system", only alternative value is "UTC".
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
	milesianClock = new modules.SolarClock( document.querySelector("#mclock") );
	customCalIndex = calendars.findIndex (item => item.id == document.custom.calend.value);  // change custom calendar
	compLocalePresentationCalendar();
	clockAnimate.clockRun(1);	// start clock
})();

window.onload = function () {	// Initiate fields and set event listeners

	document.gregorianswitch.day.value = switchingDate.day;
	document.gregorianswitch.month.value = switchingDate.month;
	document.gregorianswitch.year.value = switchingDate.year;

	document.gregorianswitch.addEventListener("submit", function (event) {
		event.preventDefault();		// necessary to avoid re-loading with multi-fields forms especially when fields are fetched from event.
		let 
			day =  Math.round (event.srcElement.elements.day.value),
			month = event.srcElement.elements.month.value,
			year =  Math.round (event.srcElement.elements.year.value),
			testDate = new modules.ExtDate (calendars.find(item => item.id == "gregorian"),modules.ExtDate.fullUTC(year, month, day)),
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
		clockAnimate.clockRun(0);
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

/* Milesian Clock and converter utility functions - excluding initialisation and global variables.
Character set is UTF-8.
Associated with: 
*	milesianClock.html
*/
/*	Related
	milesianclock.html
	milesianclockinitiate.js
	yearsignaturedisplay.js
	other modules have been made visible with the 'modules' object
*/
/* Version notes
	This .js file is highly related to the corresponding html code. 
	Not much code optimisation in this file. 
*/
/* Version	M2021-08-09	update routines for yearly figures
	M2021-08-07
		Reorganise dial and display, simplify
		split
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
// var declared in milesiandisplayinitiate.js

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
function setDateToToday() {	// similar to setDateToNow(), but set at 0 h UTC of today's date. For date converter.
	setDateToNow();
	targetDate.setUTCHours (0,0,0,0);
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
		let jd = new modules.ExtCountDate (jdcounterselector,"iso8601",0);
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

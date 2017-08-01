/* Display routines of the Milesian perpetual digital calendar,
// Character set of this file is UTF-8 (done at commit, verified)
// Display in French works well if HTML page uses ANSI ISO 8859-1
// Version M2017-07-02
// 
// to be used with the following .js files:
//   CalendarCycleComputationEngine.js (used by other .js files)
//   MilesianDateProperties.js
//	 LunarDateProperties.js
//	 IsoWeekCalendarDateProperties.js
//	 JulianDateProperties.js
// and with the suitable HTML page.
// This version is for French end users.
*/
/* Copyright Miletus 2016-2017 - Louis A. de Fouquières
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 1. The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 2. Changes with respect to any former version shall be documented.
//
// The software is provided "as is", without warranty of any kind,
// express of implied, including but not limited to the warranties of
// merchantability, fitness for a particular purpose and noninfringement.
// In no event shall the authors of copyright holders be liable for any
// claim, damages or other liability, whether in an action of contract,
// tort or otherwise, arising from, out of or in connection with the software
// or the use or other dealings in the software.
// Inquiries: www.calendriermilesien.org
*////////////////////////////////////////////////////////////////////////////////
var targetDate = new Date() ; // target date will be used to update everything

function setDisplay () { // Considering that targetDate time has been set to the desired date, this routines updates all form fields.
// All calendars use the standard JS routines or the routine of JS-Date-Properties. 
   var UnixTime = targetDate.getTime(), TimeZoneOffset = targetDate.getTimezoneOffset() // Originally arguments of the function.
   var LocalTime = UnixTime - TimeZoneOffset * Chronos.MINUTE_UNIT; // This time enables date computations as if the local time was UTC time.
   var displayDate = new Date (LocalTime); 
   var localJulianDay = Math.round(displayDate.getJulianDay()); // compute dates as of local using Julian day

// Set Julian Day, taken from targetDate   
   	document.daycounter.julianday.value = targetDate.getJulianDay().toLocaleString(undefined,{minimumFractionDigits:5}); // 

//	Write local and UTC time
	document.time.hours.value = targetDate.getHours();
	document.time.mins.value = targetDate.getMinutes();
	document.time.secs.value = targetDate.getSeconds(); 
	document.UTCtime.time.value = 
	  targetDate.getUTCHours() + "h "
	  + ((targetDate.getUTCMinutes() < 10) ? "0" : "") + targetDate.getUTCMinutes() + "mn " 
	  + ((targetDate.getUTCSeconds() < 10) ? "0" : "") + targetDate.getUTCSeconds() + "s";
   
   //  Update ISO week calendar - using its Date properties
   
	document.isoweeks.year.value = targetDate.getIsoWeekCalDate().year;
	document.isoweeks.week.value = targetDate.getIsoWeekCalDate().week;
	document.isoweeks.day.value = targetDate.getIsoWeekCalDate().day;
	
    //  Update Milesian Calendar - here we use Date properties

    document.milesian.year.value = targetDate.getMilesianDate().year; // uses the local variable - not UTC
    document.milesian.monthname.value = targetDate.getMilesianDate().month ; // Month value following JS habits: 0 to 11.
    document.milesian.day.value = targetDate.getMilesianDate().date;

    //  Update Julian Calendar - using Date properties 

    document.julian.year.value = targetDate.getJulianDate().year;
    document.julian.monthname.value = targetDate.getJulianDate().month;
    document.julian.day.value = targetDate.getJulianDate().date;

    //  Update Gregorian Calendar - using Date properties


    document.gregorian.year.value = targetDate.getFullYear();
    document.gregorian.monthname.value = targetDate.getMonth();
    document.gregorian.day.value = targetDate.getDate();		

	// Update Delta T (seconds)
	
	document.deltat.delta.value = (targetDate.getDeltaT()/Chronos.SECOND_UNIT); // 
	
	// Update lunar parameters - using targetDate

	document.moon.age.value = targetDate.getCEMoonDate().age.toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2}); // age given as a decimal number
	document.moon.residue.value = (29.5305888310185 - targetDate.getCEMoonDate().age).toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2});
	document.moon.moontime.value = targetDate.getLunarTime().hours + "h " 
				+  ((targetDate.getLunarTime().minutes < 10) ? "0" : "") + targetDate.getLunarTime().minutes + "mn "
				+  ((targetDate.getLunarTime().seconds < 10) ? "0" : "") + targetDate.getLunarTime().seconds + "s";
	document.moon.height.value = targetDate.getDraconiticHeight().toLocaleString(undefined,{maximumFractionDigits:3, minimumFractionDigits:3});
	document.moon.CElunarmonth.value = 	++targetDate.getCEMoonDate().month
	document.moon.CElunaryear.value = 	targetDate.getCEMoonDate().year
	document.moon.hegirianmonth.value = ++targetDate.getHegirianMoonDate().month
	document.moon.hegirianyear.value = 	targetDate.getHegirianMoonDate().year
}

function setDateToNow(){ // Self explanatory
    targetDate = new Date(); // set new Date object.
	setDisplay ();
}
	
function calcJulianDay(){ // here, Julian Day is specified as a decimal number. Insert with the suitable Date setter.
	var j = (document.daycounter.julianday.value); // extract Julian Day, numeric value (not necessarily integer) expected.
	j = j.replace(/\s/gi, ""); j = j.replace(/,/gi, "."); j = Number (j);
	if (isNaN (j)) {alert ("Valeur non numérique du jour julien : " + document.daycounter.julianday.value)}
	else {
		j =  Math.round ((j * Chronos.DAY_UNIT)/Chronos.SECOND_UNIT) * Chronos.SECOND_UNIT / Chronos.DAY_UNIT ; 
		// j rounded to represent an integer number of seconds, avoiding rounding up errors.
	targetDate.setTimeFromJulianDay (j); 
	setDisplay ();
	}
}
function calcISO() {
	var day =  Math.round (document.isoweeks.day.value);
	var week = Math.round (document.isoweeks.week.value);
	var year =  Math.round (document.isoweeks.year.value);
	if	( isNaN(day)  || isNaN (week) || isNaN (year))
	{ 
		alert ("Valeur non numérique dans cette date : " + document.isoweeks.year.value + " " + document.isoweeks.week.value + " " + document.isoweeks.day.value);
	} else {
		targetDate.setTimeFromIsoWeekCal (year,week,day);
		setDisplay ();
		}
}
function calcMilesian() {
	var day =  Math.round (document.milesian.day.value);
	var month = document.milesian.monthname.value;
	var year =  Math.round (document.milesian.year.value);
	if	( isNaN(day)  || isNaN (year ))
	{ 
		alert ("Valeur non numérique dans cette date : " + document.milesian.day.value + " " + document.milesian.monthname.value + "m " + document.milesian.year.value);
	} else {		
		targetDate.setTimeFromMilesian (year, month, day); // Set date object from milesian date indication, without changing time-in-the-day.
		setDisplay ();
		}
}
function calcGregorian() {
	var day =  Math.round (document.gregorian.day.value);
	var month = (document.gregorian.monthname.value);
	var year =  Math.round (document.gregorian.year.value);
	if	( isNaN(day)  || isNaN (year ))
	{ 
		alert ("Valeur non numérique dans cette date : " + document.gregorian.day.value + "/" + document.gregorian.monthname.value + "/" + document.gregorian.year.value);
	} else {
		targetDate.setFullYear(year, month, day); 	// Set date object from gregorian date indication, without changing time-in-the-day.
		setDisplay ();
		}
}
function calcJulian(){
	var day =  Math.round(document.julian.day.value);
	var month = new Number(document.julian.monthname.value); // month has to be a number.
	var year =  Math.round(document.julian.year.value);
	if	( isNaN(day)  || isNaN (year))
	{ 
		alert ("Valeur non numérique dans cette date : " + document.julian.day.value + "/" + document.julian.monthname.value + "/" + document.julian.year.value);
	} else {
			targetDate.setTimeFromJulianCalendar (year, month, day);
			setDisplay ();
			}
}
function SetDayOffset () { // Choice here: the days are integer, all 24h, so local time may change making this operation
	var days = Math.round (document.control.shift.value);
	if (isNaN(days)) {alert ("Valeur non entière du délai: " + document.control.shift.value);
	} else { 
	document.control.shift.value = days;
	targetDate.setUTCDate (targetDate.getUTCDate()+days);
	setDisplay();
	}
}
function addTime () { // A number of seconds is added (minus also possible) to the Timestamp.
	var secs = Math.round (document.UTCshift.time_offset.value);
	if (isNaN(secs)) {alert ("Valeur non entière du délai: " + document.UTCtime.time_offset.value);
	} else { 
	document.UTCshift.time_offset.value = secs;
	targetDate.setTime (targetDate.getTime()+secs*Chronos.SECOND_UNIT);
	setDisplay();
	}
}
function calcTime () { // Here the hours are deemed local hours
	var hours = Math.round (document.time.hours.value), mins = Math.round (document.time.mins.value), secs = Math.round (document.time.secs.value);
	if (isNaN(hours) || isNaN (mins) || isNaN (secs)) {
		alert ("Valeur non numérique de l'heure: " + document.time.hours.value + ":" + document.time.mins.value + ":" + document.time.secs.value);
	} else {
		targetDate.setHours(hours, mins, secs, 0); 
		// targetDate.setMinutes(mins); targetDate.setSeconds(secs); targetDate.setMilliseconds(0); Before Javascript 1.3
		setDisplay();	
	}
}
function setUTCHoursFixed (UTChours=0) { // set UTC time to the hours sepcified.
		if (typeof UTChours == undefined)  UTChours = document.UTCset.Compute.value;
		targetDate.setUTCHours(UTChours, 0, 0, 0); //targetDate.setUTCMinutes(0); targetDate.setSeconds(0); targetDate.setMilliseconds(0);
		setDisplay();	
}

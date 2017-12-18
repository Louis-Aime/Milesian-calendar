/* Milesian Solar Year Clock Hands
// Character set is UTF-8
// This package computes the month hand and day hand of the Milesian solar year clock.
*/////////////////////////////////////////////////////////////////////////////////////////////
/* Copyright Miletus 2017 - Louis A. de Fouquières
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
*/
// Other js necessary
//	MilesianClockOperations
//	MilesianDateProperties
//
var 
	targetDate = new Date(); // target date will be used to update everything

function setDisplay () {	// Disseminate targetDate and time on all display fields

	let dateComponent;	// Local result of date decomposition process, used several times

	// Initiate milesian clock and milesian string with present time and date
	let myElement = document.querySelector("#clock2");
	setSolarYearClockHands (myElement, targetDate.getMilesianDate().year, targetDate.getMilesianDate().month, targetDate.getMilesianDate().date,
		targetDate.getHours(), targetDate.getMinutes(), targetDate.getSeconds() );
		
	// Locale value for the next statements - not used anymore (because of Edge)
/*	let Locale = document.LocaleOptions.Locale.value; 
	if (Locale == "") Locale = undefined; 
*/
	// Main frame fields

	// Update milesian field selector - using Date properties
	dateComponent = targetDate.getMilesianDate();		// Get date-time component in local time
	document.milesian.year.value = dateComponent.year;
    document.milesian.monthname.value = dateComponent.month;
    document.milesian.day.value = dateComponent.date;
	
	// Update local time fields - using	Date properties
	document.time.hours.value = targetDate.getHours();
	document.time.mins.value = targetDate.getMinutes();
	document.time.secs.value = targetDate.getSeconds();
	
	// Set Milesian date string
	myElement = document.getElementById("milesiandate");
	myElement.innerHTML = targetDate.toMilesianLocaleDateString
		(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric"});

	// Display Gregorian date in non-editable part
	myElement = document.gregoriandate;
	myElement.year.value = targetDate.getFullYear();
	myElement.monthname.value = targetDate.getMonth();
	myElement.day.value = targetDate.getDate();

	// Date conversion frame
	
    //  Update Gregorian Calendar - using Date properties
    document.gregorian.year.value = targetDate.getFullYear();
    document.gregorian.monthname.value = targetDate.getMonth();
    document.gregorian.day.value = targetDate.getDate();		

    //  Update Julian Calendar - using Date properties 
	dateComponent = targetDate.getJulianDate();
    document.julian.year.value = dateComponent.year;
    document.julian.monthname.value = dateComponent.month;
    document.julian.day.value = dateComponent.date;

    //  Update Republican Calendar - using Date properties
	dateComponent = targetDate.getFrenchRevDate();
    document.republican.year.value = dateComponent.year;
    document.republican.monthname.value = dateComponent.month;
    document.republican.day.value = dateComponent.date;	

	//  Update ISO week calendar - using its Date properties
	dateComponent = targetDate.getIsoWeekCalDate();
	document.isoweeks.year.value = dateComponent.year;
	document.isoweeks.week.value = dateComponent.week;
	document.isoweeks.day.value = dateComponent.day;	

	// Set Julian Day 
   	document.daycounter.julianday.value = targetDate.getJulianDay();
	
	// Chronological fields frame
	
	// Display chronological counts
	myElement = document.querySelector("#unixCountDisplay");
	myElement.innerHTML = targetDate.valueOf();
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
	document.moon.CElunarmonth.value = 	++dateComponent.month
	document.moon.CElunaryear.value = 	dateComponent.year
	dateComponent = targetDate.getHegirianMoonDate();	
	document.moon.hegiriandate.value = 	Math.ceil(dateComponent.age);
	document.moon.hegirianmonth.value = ++dateComponent.month
	document.moon.hegirianyear.value = 	dateComponent.year
	
	// Update Delta T (seconds)
	document.deltat.delta.value = (targetDate.getDeltaT()/Chronos.SECOND_UNIT);
	
	// Navigation frame

	// Display UTC time
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
	let myDisplay, Options; 		// to be computed later;
	
	if (Locale == ""){ 	// no language code specified; in case a specific calendar is specified, construct an effectice Locale.
		if (Calendar !== "") {
			let askedOptions = new Intl.DateTimeFormat ();
			let usedOptions = askedOptions.resolvedOptions();
			Locale = usedOptions.locale.slice(0,5) + "-u-ca-" + Calendar}
		else Locale = undefined}
	else if (Calendar !== "") Locale = Locale + "-u-ca-" + Calendar;
	
	// Set presentation options from one of the standard presentation listed
	switch (document.LocaleOptions.Presentation.value) {
		case "long":
			Options = {weekday : "long", day : "numeric", month : "long", year : "numeric", era : "long"};
			break;
		case "textCumWeek":
			Options = {weekday : "long", day : "numeric", month: "long", year : "numeric", era : "short"};
			break;
		case "textSineWeek":
			Options = {weekday : undefined, day : "numeric", month: "long", year : "numeric", era : "short"};
			break;
		case "short":
			Options = {weekday : "short", day : "numeric", month: "short", year : "numeric", era : "narrow"};
			break;	
		case "numeric":
			Options = {weekday : undefined, day : "numeric", month : "numeric", year : "numeric", era : "narrow"};
		}
	
	// Certain calendars do not give a proper result: set the flag.
	switch (Calendar) {	
		case "hebrew": valid = (targetDate.valueOf()-targetDate.getTimezoneOffset() * Chronos.MINUTE_UNIT 
			>= -180799776000000); break;	// Computations are false before 1 Tisseri 1 AM  	
		case "indian": valid = (targetDate.valueOf()-targetDate.getTimezoneOffset() * Chronos.MINUTE_UNIT 
			>= -62135596800000); break;	// Computations are false before 01/01/0001 (gregorian)
		case "islamic":
		case "islamic-rgsa": valid = (targetDate.valueOf()-targetDate.getTimezoneOffset() * Chronos.MINUTE_UNIT
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
function addTime (sign) { // A number of seconds is added or substracted to or from the Timestamp.
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
	 else {
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
function calcMilesian() {
	var day =  Math.round (document.milesian.day.value);
	var month = document.milesian.monthname.value;
	var year =  Math.round (document.milesian.year.value);
	if	( isNaN(day)  || isNaN (year ))
		alert (milesianAlertMsg("invalidDate") + '"' + document.milesian.day.value + '" "' + document.milesian.year.value + '"')
	else {		
		targetDate.setTimeFromMilesian (year, month, day); // Set date object from milesian date indication, without changing time-in-the-day.
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
	else {
		targetDate.setFullYear(year, month, day); 	// Set date object from gregorian date indication, without changing time-in-the-day.
		setDisplay ();
		}
}
function calcJulian(){
	var day =  Math.round(document.julian.day.value);
	var month = new Number(document.julian.monthname.value); // month has to be a number.
	var year =  Math.round(document.julian.year.value);
	if	( isNaN(day)  || isNaN (year))
		alert (milesianAlertMsg("invalidDate") + '"' + document.julian.day.value + '" "' + document.julian.year.value + '"')
	else {
		targetDate.setTimeFromJulianCalendar (year, month, day);
		setDisplay ();
		}
}
function calcFrenchRev(){
	let day =  Math.round(document.republican.day.value);
	let month = new Number(document.republican.monthname.value); // month has to be a number.
	let year =  Math.round(document.republican.year.value);
	if	( isNaN(day)  || isNaN (year))
		alert (milesianAlertMsg("invalidDate") + '"' + document.republican.day.value + '" "' + document.republican.year.value + '"')
	else {
		targetDate.setTimeFromFrenchRev (year, month, day);
		setDisplay ();
		}
}
function calcISO() {
	var day =  Math.round (document.isoweeks.day.value);
	var week = Math.round (document.isoweeks.week.value);
	var year =  Math.round (document.isoweeks.year.value);
	if	( isNaN(day)  || isNaN (week) || isNaN (year))
		alert (milesianAlertMsg("invalidDate") + '"' + document.isoweeks.year.value + '" "' + document.isoweeks.week.value + '"')
	else {
		targetDate.setTimeFromIsoWeekCal (year,week,day);
		setDisplay ();
		}
}

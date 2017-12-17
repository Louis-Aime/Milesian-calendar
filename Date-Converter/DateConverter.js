/* DateConverter - Display routines of the Milesian date converter.
// Character set of this file is UTF-8 
// Error messages in another file fo coding compatbility
// Version M2017-12-26 : no reference to dependent files, adapt to Clock operation
// 
// to be used with the following .js files:
//	 MilesianAlertMsg.js (Error messages)
//   MilesianDateProperties.js
//	 IsoWeekCalendarDateProperties.js
//	 JulianDateProperties.js
//	 FrenchRevDateProperties.js
// and with the suitable HTML page.
// This version is for French end users.
*/
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
*////////////////////////////////////////////////////////////////////////////////
var convertDate = new Date() ; // This date will be used to update all displayed fields

function putStringOnOptions() { // get Locale, calendar indication and Options given on page, print String; No control.
	let Locale = document.LocaleOptions.Locale.value;
	let Calendar = document.LocaleOptions.Calendar.value;
	let Options; 		// to be computed later;
	let valid = true; 	// by default, computations under Unicode are expected valid. Certains cases are known false.
	if (Locale == ""){ 
		if (Calendar !== "") {
			let askedOptions = new Intl.DateTimeFormat ();
			let usedOptions = askedOptions.resolvedOptions();
			Locale = usedOptions.locale.slice(0,5) + "-u-ca-" + Calendar}
		else Locale = undefined}
	else if (Calendar !== "") Locale = Locale + "-u-ca-" + Calendar;
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
	switch (Calendar) {	// Certain calendars do not give a proper result;
		case "hebrew": valid = (convertDate.getJulianDay() > 347997); break;	// Computations are false before 1 Tisseri 1 AM
		case "indian": valid = (convertDate.getJulianDay() > 1721425); break;	// Computations are false before 01/01/0001 (gregorian)
		case "islamic":
		case "islamic-rgsa": valid = (convertDate.getJulianDay() > 1948438); break; // Computations are false before Haegirian epoch
		}

	//	Write date string. Catch error if navigator fails.

	let myDisplay = document.getElementById("milesianDisplay");
	try {
		myDisplay.innerHTML = convertDate.toMilesianLocaleDateString(Locale,Options);	
		myDisplay = document.getElementById("UnicodeString");
		myDisplay.innerHTML = (valid ? convertDate.toLocaleDateString(Locale,Options) : milesianAlertMsg("invalidDate"));
		}
	catch (e) {	// If attempt to write Milesian string failed: this is caused by out-of-range
		myDisplay.innerHTML = milesianAlertMsg("invalidDate");
		myDisplay = document.getElementById("UnicodeString");
		myDisplay.innerHTML = milesianAlertMsg("invalidDate");
		}
	finally { return }
}

function setDateDisplay () { // Considering that convertDate time has been set to the desired date, this routine updates all form fields.

	// Update Milesian CLDR display

	let dateComponent;	// Result of date decomposition process
	
    //  Update Milesian Calendar - here we use Date properties
	dateComponent = convertDate.getMilesianUTCDate();
    document.milesian.year.value = dateComponent.year; 
    document.milesian.monthname.value = dateComponent.month ; // Month value following JS habits: 0 to 11.
    document.milesian.day.value = dateComponent.date;

    //  Update Gregorian Calendar - using Date properties
    document.gregorian.year.value = convertDate.getUTCFullYear();
    document.gregorian.monthname.value = convertDate.getUTCMonth();
    document.gregorian.day.value = convertDate.getUTCDate();		

    //  Update Julian Calendar - using Date properties 
	dateComponent = convertDate.getJulianUTCDate();
    document.julian.year.value = dateComponent.year;
    document.julian.monthname.value = dateComponent.month;
    document.julian.day.value = dateComponent.date;

    //  Update Republican Calendar - using Date properties
	dateComponent = convertDate.getFrenchRevUTCDate();
    document.republican.year.value = dateComponent.year;
    document.republican.monthname.value = dateComponent.month;
    document.republican.day.value = dateComponent.date;	

	//  Update ISO week calendar - using its Date properties
	dateComponent = convertDate.getIsoWeekCalUTCDate();
	document.isoweeks.year.value = dateComponent.year;
	document.isoweeks.week.value = dateComponent.week;
	document.isoweeks.day.value = dateComponent.day;	

	// Compute Locale, Options, and Unicode string
		putStringOnOptions();

	// Set Julian Day, taken from convertDate
	let myLocale = document.LocaleOptions.Locale.value;
	if (myLocale == "") myLocale = undefined;
   	document.daycounter.julianday.value = convertDate.getJulianDay();
	
	// Set Milesian clock
	let clock = document.querySelector("#clock3");
	setSolarYearClockHands (clock, convertDate.getMilesianDate().year, convertDate.getMilesianUTCDate().month, convertDate.getMilesianUTCDate().date);

}

function setDateToToday(){ // Self explanatory
    convertDate = new Date(); // set new Date object.
	convertDate.setUTCHours(12,0,0,0); 	// set to today at noon UTC, to an integer value of Julian Day.
	setDateDisplay ();
}
	
function calcIntJulianDay(){ // here, Julian Day is specified as an integer number. Insert with the suitable Date setter.
	let j = (document.daycounter.julianday.value); // extract Julian Day, numeric value (not necessarily integer) expected.
	j = j.replace(/\s/gi, ""); j = j.replace(/,/gi, "."); j = Number.parseInt (j,10);	// Extract integer of base 10
	if (! Number.isInteger(j)) alert (milesianAlertMsg("nonInteger") + '"' + document.daycounter.julianday.value + '"')
		else {
		convertDate.setTimeFromJulianDay (j);	// Convert into JulianDay, considering Time Zone is UTC (offset = 0) 
		setDateDisplay ();
		}
}
function calcIntISO() {
	let day =  Math.round (document.isoweeks.day.value);
	let week = Math.round (document.isoweeks.week.value);
	let year =  Math.round (document.isoweeks.year.value);
	if	( isNaN(day)  || isNaN (week) || isNaN (year))
		alert (milesianAlertMsg("invalidDate") + '"' + document.isoweeks.year.value + '" "' + document.isoweeks.week.value + '"')
	else {
		convertDate.setUTCTimeFromIsoWeekCal (year,week,day, 12, 0, 0, 0);
		setDateDisplay ();
		}
}
function calcIntMilesian() {
	let day =  Math.round (document.milesian.day.value);
	let month = document.milesian.monthname.value;
	let year =  Math.round (document.milesian.year.value);
	if	( isNaN(day)  || isNaN (year ))
		alert (milesianAlertMsg("invalidDate") + '"' + document.milesian.day.value + '" "' + document.milesian.year.value + '"')
	else {		
		convertDate.setUTCTimeFromMilesian (year, month, day, 12, 0, 0, 0); 
		setDateDisplay ();
		}
}
function calcIntGregorian() {
	let day =  Math.round (document.gregorian.day.value);
	let month = (document.gregorian.monthname.value);
	let year =  Math.round (document.gregorian.year.value);
	if	( isNaN(day)  || isNaN (year ))
		alert (milesianAlertMsg("invalidDate") + '"' + document.gregorian.day.value + '" "' + document.gregorian.year.value + '"')
	else {
		convertDate.setUTCFullYear(year, month, day, 12, 0, 0, 0); 
		setDateDisplay ();
		}
}
function calcIntJulian(){
	let day =  Math.round(document.julian.day.value);
	let month = new Number(document.julian.monthname.value); // month has to be a number.
	let year =  Math.round(document.julian.year.value);
	if	( isNaN(day)  || isNaN (year))
		alert (milesianAlertMsg("invalidDate") + '"' + document.julian.day.value + '" "' + document.julian.year.value + '"')
	else {
		convertDate.setUTCTimeFromJulianCalendar (year, month, day, 12, 0, 0, 0);
		setDateDisplay ();
		}
}
function calcIntFrenchRev(){
	let day =  Math.round(document.republican.day.value);
	let month = new Number(document.republican.monthname.value); // month has to be a number.
	let year =  Math.round(document.republican.year.value);
	if	( isNaN(day)  || isNaN (year))
		alert (milesianAlertMsg("invalidDate") + '"' + document.republican.day.value + '" "' + document.republican.year.value + '"')
	else {
		convertDate.setUTCTimeFromFrenchRev (year, month, day, 12, 0, 0, 0);
		setDateDisplay ();
		}
}
function SetDayOffset (sign) { // Choice here: the days are integer, all 24h, so local time may change making this operation
	if (sign == undefined) sign = 1;	// Sign is either +1 or -1. Just in case it does not come as a parameter.
	let days = Math.round (document.control.shift.value); // number of days to add or substract is in control panel
	if (!Number.isInteger(days)) alert (milesianAlertMsg("nonInteger") + '"' + days + '"')
	else { 
		convertDate.setUTCDate (convertDate.getUTCDate()+ sign*days);
		setDateDisplay();
	}
}

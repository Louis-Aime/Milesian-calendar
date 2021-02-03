/* Milesian Year Signature Display
	Character set is UTF-8
	This package displays annual figures, in relation with YearSignatureDisplay.html
Required (directly)
	MilesianYearSignature
	Seasons
Contents
	Functions called by the MilesianYearSignature.html
*/
/* Version M2021-02-15	Use calendrical-javascript modules and application-specific modules
	M2021-01-24 Missing year field in year panel
	M2021-01-14 Tailor to language and time zone
	M2020-12-29	New signature routines
	M2020-02-01 : comput epact on 1 1m, use year range constraint for milesian epact
	M2020-01-12 : strict mode
	M2019-08-23: add seasons' computation
	M2019-07-27: update dependencies
	M2019-05-12: 
		Display day of week as a Date-formatted string, instead of a select field
		Display Roman date with an explicit month indication
	M2019-01-13: Suppress "Milesian" line, since Milesian figures are like Gregorian,
		and rework Easter date in milesian
	M2018-10-26: Enhance comments
	M2017-01-09: Display Gold number 1 to 19, not 0 to 18.
*/
/* Copyright Miletus 2017-2021 - Louis A. de Fouquières
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
1. The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.
2. Changes with respect to any former version shall be documented.

The software is provided "as is", without warranty of any kind,
express of implied, including but not limited to the warranties of
merchantability, fitness for a particular purpose and noninfringement.
In no event shall the authors of copyright holders be liable for any
claim, damages or other liability, whether in an action of contract,
tort or otherwise, arising from, out of or in connection with the software
or the use or other dealings in the software.
Inquiries: www.calendriermilesien.org
*/
"use strict";
// Modules are loaded in "main" program under the "modules" wrapper.
function romanDateFrom21March (offset) {
	let f = new Intl.DateTimeFormat(undefined,{month:"short", day:"numeric"});
	return (offset <= 10) 
		? f.format(new Date (1800, 2, (offset + 21))) 
		: f.format(new Date (1800, 3, (offset - 10)));
}
function milesianDateFrom30_3m (offset) {
	return	(offset <= -30 ? "<1 3m" :
		(offset <= 0 ? (30+offset) + " 3m" :
		(offset <= 31 ? (offset) + " 4m" : 
		(offset <= 61 ? (offset - 31) + " 5m" :
		(offset <= 92 ? (offset - 61) + " 6m" :
		(offset <= 122 ? (offset - 92) + " 7m" :
		(offset <= 153 ? (offset - 122) + " 8m" :
		(offset <= 183 ? (offset -153) + " 9m" :
		(offset <= 214 ? (offset - 183) + " 10m" :
		(offset <= 244 ? (offset - 214) + " 11m" :
		(offset <= 274 ? (offset - 244) + " 12m" : ">30 12m" ))))))))))) ;
}
function displayDOW (Day, lang) { // Yield the string of the day of the week of rank Day
	if (lang == "") lang = undefined;
	return new Intl.DateTimeFormat(lang, {weekday: "long"}).format (new Date (1970, 0, 4+Day))		
}
/* function displayYeartype (type) {
	var yearTypes = ["cave (et commune)", "longue (et commune)", "bissextile (et cave)"]
	return yearTypes [type];
}*/
function computeSignature(year, lang, timeZone) {
	if (lang == "") lang = undefined;
	if (timeZone == "") timeZone = undefined;
	// Begin with common and Julian calendar figures
	var signature = modules.julianSignature (year), m_signature = modules.milesianSignature (year);
	// The specified year
	document.yearglobal.year.value = year;
	// Set gold number
	document.yearglobal.gold.value = signature.goldNumber;
	// Julian figures
	document.details.j_type.value = signature.isLeap ? "bissextile" : "commune";
	document.details.j_day.value = displayDOW (signature.doomsday);
	document.details.j_epact.value = signature.epact;
	document.details.j_residue.value = signature.easterResidue;
	document.details.j_daynumber.value = signature.easterOffset;
	document.details.j_romandate.value = romanDateFrom21March(signature.easterOffset);
	document.details.j_milesiandate.value = milesianDateFrom30_3m(
		signature.easterOffset -2 +Math.floor(year/100) -Math.floor(year/400));
	// Gregorian and Milesian figures
	signature = modules.gregorianSignature (year);
	document.details.g_type.value = signature.isLeap ? "bissextile" : "commune";
	document.details.m_type.value = m_signature.isLeap ? "abondante" : "cave" ;
	document.details.g_day.value = displayDOW (signature.doomsday);
	document.details.g_epact.value = signature.epact;
	document.details.m_epact.value = m_signature.epact
	document.details.g_residue.value = signature.easterResidue;
	document.details.g_daynumber.value = signature.easterOffset;
	document.details.g_romandate.value = romanDateFrom21March(signature.easterOffset);
	document.details.g_milesiandate.value = milesianDateFrom30_3m(signature.easterOffset);
	// Seasons
	let seasonDisplay = new modules.ExtDateTimeFormat (lang, {
		timeZone: timeZone,
		year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "numeric"},milesian);
	try {
		document.seasons.winter1.value = seasonDisplay.format (modules.Seasons.tropicEvent(year,0)); 
		document.seasons.spring.value = seasonDisplay.format (modules.Seasons.tropicEvent(year,1)); 
		document.seasons.summer.value = seasonDisplay.format (modules.Seasons.tropicEvent(year,2)); 
		document.seasons.autumn.value = seasonDisplay.format (modules.Seasons.tropicEvent(year,3)); 
		document.seasons.winter2.value = seasonDisplay.format (modules.Seasons.tropicEvent(year,4)); 
	}
	catch (e) {		// seasons coulf not be computed, main reason is: year out of computational range
		document.seasons.winter1.value = 
		document.seasons.spring.value = 
		document.seasons.summer.value = 
		document.seasons.autumn.value = 
		document.seasons.winter2.value = "-- -- -- -- --";
	}
}
function setYear(year) {
	year = Math.round(year);	// Force to integer value
	if (isNaN (year)) alert ("non Integer: " + '"' + document.control.year.value + '"')
	else {
		document.control.year.value = +year;
		computeSignature (+year);
		}
}	
function setYearOffset(shift) {
	shift = Math.round(shift);	// Force to integer value
	let year = Math.round(document.control.year.value) + Math.round(shift);
	if (isNaN (year)) alert ("non Integer: " + '"' + document.control.shift.value + '" "' + document.control.year.value + '"')
	else if (year < -271820 || year > 275760) alert ("Year out of range")
	else { 
		document.control.year.value = year;
		computeSignature (year);
		}
}
function setYearToNow(){ // Self explanatory
    let targetDate = new modules.ExtDate(milesian); // Now in Milesian.
	setYear(targetDate.year());
}

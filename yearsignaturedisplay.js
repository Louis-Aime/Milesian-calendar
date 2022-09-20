/**
 * @file Milesian Year Signature Display routines.
 * This package displays annual figures, in relation with yearsignaturedisplay.html.
 * imported routines are accessed through object 'modules'.
 * Only a few implementation comments are given here, since this code is mainly for demonstration purposes.
 * @see yearsignaturedisplay.html
 * @version M2022-09-30
 * @author Louis A. de Fouquières https://github.com/Louis-Aime
 * @license MIT 2016-2022 
*/
//	Character set is UTF-8
/* Version	M2022-09-30 Fix Easter date display for multiple calendars
See GitHub for former versions
*/
/* Copyright Louis A. de Fouquières https://github.com/Louis-Aime 2016-2022
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
*/
"use strict";
// These routines complement general display routines. Modules are loaded in "main" program under the "modules" wrapper.
function romanDateFrom21March (offset) {
	return (offset <= 10) 
		? romanDateFormat.format(new Date (1800, 2, (offset + 21))) 
		: romanDateFormat.format(new Date (1800, 3, (offset - 10)));
}
function displayDOW (Day) { // Yield the string of the day of the week of rank Day. This one is limited to built-in calendar (traditional week)
	return DOWFormat.format (new modules.ExtDate ("iso8601", 1970, 1, 4+Day))
}
/* function displayYeartype (type) {
	var yearTypes = ["cave (et commune)", "longue (et commune)", "bissextile (et cave)"]
	return yearTypes [type];
}*/
function computeSignature(year) {	// Formaters are external
	// Begin with common and Julian calendar figures
	var signature = modules.julianSignature (year), m_signature = modules.milesianSignature (year);
	// The specified year
	document.yearglobal.year.value = year;
	// Set gold number
	document.yearglobal.gold.value = signature.goldNumber;
	// Julian figures
	document.details.j_type.value = signature.isLeap ? "bissextile" : "commune";
	document.details.j_day.value = displayDOW (signature.doomsday);
	document.details.j_dlet.value = signature.dominicalLetter;
	document.details.j_epact.value = signature.epact;
	document.details.j_residue.value = signature.easterResidue;
	document.details.j_daynumber.value = signature.easterOffset;
	document.details.j_romandate.value = romanDateFrom21March(signature.easterOffset);
	document.details.j_referdate.value = lunarDateFormat.format (signature.easterDate);
	// Gregorian and Milesian figures
	signature = modules.gregorianSignature (year);
	document.details.g_type.value = signature.isLeap ? "bissextile" : "commune";
	document.details.m_type.value = m_signature.isLeap ? "abondante" : "cave" ;
	document.details.g_day.value = displayDOW (signature.doomsday);
	document.details.g_dlet.value = signature.dominicalLetter;
	document.details.g_epact.value = signature.epact;
	document.details.m_epact.value = m_signature.epact
	document.details.g_residue.value = signature.easterResidue;
	document.details.g_daynumber.value = signature.easterOffset;
	document.details.g_romandate.value = romanDateFrom21March(signature.easterOffset);
	document.details.g_referdate.value = lunarDateFormat.format (signature.easterDate);
	// Seasons
	document.getElementById ("seasonsyear").innerHTML = year;
	try {
		document.seasons.winter1.value = seasonDateFormat.format (modules.tropicEvent(year,0)); 
		document.seasons.spring.value = seasonDateFormat.format (modules.tropicEvent(year,1)); 
		document.seasons.summer.value = seasonDateFormat.format (modules.tropicEvent(year,2)); 
		document.seasons.autumn.value = seasonDateFormat.format (modules.tropicEvent(year,3)); 
		document.seasons.winter2.value = seasonDateFormat.format (modules.tropicEvent(year,4)); 
	}
	catch (e) {		// seasons could not be computed, main reason is: year out of computational range
		document.seasons.winter1.value = 
		document.seasons.spring.value = 
		document.seasons.summer.value = 
		document.seasons.autumn.value = 
		document.seasons.winter2.value = "-- -- -- -- --";
	}
}
function setYear(year) {
	year = Math.round(year);	// Force to integer value
	if (isNaN (year)) alert ("non Integer: " + document.yearglobal.year.value)
	else {
		document.yearglobal.year.value = +year;
		computeSignature (+year);
		}
}	
function setYearOffset(shift) {
	shift = Math.round(shift);	// Force to integer value
	let year = Math.round(document.yearglobal.year.value) + Math.round(shift);
	if (year == NaN) alert ("non Integer: " + '"' + document.yearglobal.shift.value + '" "' + document.yearglobal.year.value + '"')
	else if (year < -271820 || year > 275760) alert ("Year out of range")
	else { 
		document.yearglobal.year.value = +year;
		// targetDate.setFromFields ({ year: year},"UTC");
		computeSignature (+year);
		}
}
function setYearToNow(myCalendar=milesian){ // Self explanatory
    targetDate = new modules.ExtDate(myCalendar); 
	// set to the middle of the year
	targetDate.setUTCHours (0, 0, 0, 0);
	targetDate.setFromFields ( { day: 1, month: 7 } ,"UTC"); 
	setYear(targetDate.fullYear());
}

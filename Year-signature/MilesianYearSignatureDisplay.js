/* Milesian Year Signature Display
	Character set is UTF-8
	This package displays annual figures, in relation with YearSignatureDisplay.html
Versions
	M2017-01-09: Display Gold number 1 to 19, not 0 to 18.
	M2018-10-26: Enhance comments
	M2019-01-13: Suppress "Milesian" line, since Milesian figures are like Gregorian,
		and rework Easter date in milesian
	M2019-05-12: 
		Display day of week as a Date-formatted string, instead of a select field
		Display Roman date with an explicit month indication
	M2019-07-27: update dependencies
Required (directly)
	MilesianYearSignature
	MilesianAlertMsg
Contents
	Functions called by the MilesianYearSignature.html
*/////////////////////////////////////////////////////////////////////////////////////////////
/* Copyright Miletus 2017-2018 - Louis A. de Fouquières
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
function displayDOW (Day) { // Yield the string of the day of the week of rank Day
	return new Intl.DateTimeFormat(undefined, {weekday: "long"}).format (new Date (1970, 0, 4+Day))		
}
function displayYeartype (type) {
	var yearTypes = ["cave (et commune)", "longue (et commune)", "bissextile (et cave)"]
	return yearTypes [type];
}
function computeSignature(year) {
	var signature = julianSignature (year);
	// Set gold number
	document.yearglobal.gold.value = positiveModulo (year, 19) + 1;
	// Julian figures
	document.julian.day.value = displayDOW (signature.doomsday);
	document.julian.epact.value = signature.epact;
	document.julian.residue.value = signature.easterResidue;
	document.julian.daynumber.value = signature.easterOffset;
	document.julian.romandate.value = romanDateFrom21March(signature.easterOffset);
	document.julian.milesiandate.value = milesianDateFrom30_3m(
		signature.easterOffset -2 +Math.floor(year/100) -Math.floor(year/400));
	// Gregorian figures
	signature = gregorianSignature (year);
	document.gregorian.day.value = displayDOW (signature.doomsday);
	document.gregorian.epact.value = signature.epact;
	document.gregorian.residue.value = signature.easterResidue;
	document.gregorian.daynumber.value = signature.easterOffset;
	document.gregorian.romandate.value = romanDateFrom21March(signature.easterOffset);
	document.gregorian.milesiandate.value = milesianDateFrom30_3m(signature.easterOffset);
	// Milesian rule + Gregorian modified comput
	signature = milesianSignature (year);
	// Set year type
	let type = (signature.isLeap ? 2 : 0) + (signature.isLong ? 1 : 0) ;
	document.yeartype.type.value = displayYeartype(type) ;
	document.milesianyearfigures.doomsday.value = displayDOW (signature.doomsday);
	document.milesianyearfigures.epact.value = signature.epact.toLocaleString(undefined,{minimumFractionDigits:1});
	document.milesianyearfigures.residue.value = signature.annualResidue.toLocaleString(undefined,{minimumFractionDigits:1});
}
function setYear(year) {
	year = Math.round(year);	// Force to integer value
	if (isNaN (year)) alert (milesianAlertMsg("nonInteger") + '"' + document.year.year.value + '"')
	else {
		document.year.year.value = +year;
		computeSignature (+year);
		}
}	
function setYearOffset(shift) {
	shift = Math.round(shift);	// Force to integer value
	let year = Math.round(document.year.year.value) + Math.round(shift);
	if (isNaN (year)) alert (milesianAlertMsg("nonInteger") + '"' + document.control.shift.value + '" "' + document.year.year.value + '"')
	else if (year < -271820 || year > 275760) alert (milesianAlertMsg("outOfRange"))
	else { 
		document.year.year.value = year;
		computeSignature (year);
		}
}
function setYearToNow(){ // Self explanatory
    let targetDate = new Date(); // set new Date object.
	setYear(targetDate.getMilesianDate().year);
}

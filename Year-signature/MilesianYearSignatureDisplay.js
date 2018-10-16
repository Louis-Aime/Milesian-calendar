/* Milesian Year Signature Display
	Character set is UTF-8
	This package displays annual figures, in relation with YearSignatureDisplay.html
Versions
	M2017-01-09: Display Gold number 1 to 19, not 0 to 18.
	M2018-10-26: Enhance comments
Required
	MilesianYearSignature
	MilesianDateProperties
	CBCCE
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
*////////////////////////////////////////////////////////////////////////////////
/*// Import CBCCE, MilesianDateProperties, and MilesianYearSignature, or make visible.
*///////////////////////////////////////////////////////////////////////////////

function romanDateFrom21March (offset) {
	return (offset <= 10) ? (21+offset)+"/03" : (offset - 10)+"/04";
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
function computeSignature(year) {
	var signature = julianSignature (year);
	// Set gold number
	document.yearglobal.gold.value = positiveModulo (year, 19) + 1;
	// Julian figures
	document.julian.day.value = signature.doomsday;
	document.julian.epact.value = signature.epact;
	document.julian.residue.value = signature.easterResidue;
	document.julian.daynumber.value = signature.easterOffset;
	document.julian.romandate.value = romanDateFrom21March(signature.easterOffset);
	document.julian.milesiandate.value = milesianDateFrom30_3m(
		signature.easterOffset-2+Math.floor(year/100)-Math.floor(year/400)+Math.floor((year+800)/3200));
	// Gregorian figures
	signature = gregorianSignature (year);
	document.gregorian.day.value = signature.doomsday;
	document.gregorian.epact.value = signature.epact;
	document.gregorian.residue.value = signature.easterResidue;
	document.gregorian.daynumber.value = signature.easterOffset;
	document.gregorian.romandate.value = romanDateFrom21March(signature.easterOffset);
	document.gregorian.milesiandate.value = milesianDateFrom30_3m(signature.easterOffset+Math.floor((year+800)/3200));
	// Milesian rule + Gregorian modified comput
	signature = milesianSignature (year);
	// Set year type
	let type = (signature.isLeap ? 2 : 0) + (signature.isLong ? 1 : 0) ;
	document.yeartype.type.value = type ;
	document.milesianyearfigures.doomsday.value = signature.doomsday;
	document.milesianyearfigures.epact.value = signature.epact.toLocaleString(undefined,{minimumFractionDigits:1});
	document.milesianyearfigures.residue.value = signature.annualResidue.toLocaleString(undefined,{minimumFractionDigits:1});
	document.milesian.day.value = signature.doomsday;
	document.milesian.residue.value = signature.easterResidue;
	document.milesian.daynumber.value = signature.easterOffset;
	document.milesian.romandate.value = romanDateFrom21March(signature.easterOffset);
	document.milesian.milesiandate.value = milesianDateFrom30_3m(signature.easterOffset);	
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
	else { 
		document.year.year.value = year;
		computeSignature (year);
		}
}
function setYearToNow(){ // Self explanatory
    let targetDate = new Date(); // set new Date object.
	setYear(targetDate.getMilesianDate().year);
}

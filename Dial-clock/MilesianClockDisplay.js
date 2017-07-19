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
var targetDate = new Date() ; // target date will be used to update everything

function setDisplay () {	// Disseminate targetDate on all display
	setSolarYearClockHands (targetDate.getMilesianDate().month, targetDate.getMilesianDate().date);
    document.milesian.dayofweek.value = targetDate.toLocaleDateString(undefined,{weekday:"long"});
	document.milesian.year.value = targetDate.getMilesianDate().year; // uses the local variable - not UTC
    document.milesian.monthname.value = targetDate.getMilesianDate().month ; // Month value following JS habits: 0 to 11.
    document.milesian.day.value = targetDate.getMilesianDate().date;
	document.milesian.gregoriandate.value = targetDate.toLocaleDateString
		(undefined,{weekday:"long",day:"numeric",month:"long",year:"numeric",era:"narrow"});
}
function setClock() {			// Extract day and month from display, then compute clock hands positions
	var day =  Math.round (document.milesian.day.value);
	var month = document.milesian.monthname.value;
	var year =  Math.round (document.milesian.year.value);
	if	( isNaN(day)  || isNaN (year ) )
	{ 
		alert ("Valeur non numérique dans cette date : " + document.milesian.day.value + " " + document.milesian.monthname.value + "m " + document.milesian.year.value);
	} else {		
		targetDate.setTimeFromMilesian (year, month, day); // Set date object from milesian date indication, without changing time-in-the-day.
		setDisplay();
		}
}
function setDateToNow(){ // Self explanatory
    targetDate = new Date(); // set new Date object.
	setDisplay();
} 
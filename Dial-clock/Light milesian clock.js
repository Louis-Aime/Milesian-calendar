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
var targetDate = new Date() ; // target date will be used to update everything

function setSolarYearClockHands(month = 0, day = 1) {
//  Set interfaces variables
var // Whatever form the hands may have, they are identified by name.
	monthHand = document.getElementById("monthhand"), 
	dayHand = document.getElementById("dayhand"); 
//	Set the angles of the "month hand" and of the "day hand" of the milesian solar clock	
	let halfDays = 60*month + 2*Math.floor(month/2) + 2*day;	
	// Number of half-days since beginning of year, at beginning of day i.e. at THE END of that day
	let	monthAngle = halfDays * 360 / 732, 			// Angle of month hand with respect to "12"
		dayAngle = 	 halfDays * 360 * 12 / 732;		// Angle of day hand with respect to "12"
	monthHand.transform.baseVal[0].setRotate(monthAngle,0,0);	// Use SVG interfaces to set angles
	dayHand.transform.baseVal[0].setRotate(dayAngle,0,0);
	return halfDays;	// control the computation parameters with the return value
}
/*	This part is specific to user interface
*/
function setDisplay () {	// Disseminate targetDate on all display
	setSolarYearClockHands (targetDate.getMilesianDate().month, targetDate.getMilesianDate().date);

}

function setDateToNow(){ // Self explanatory
    targetDate = new Date(); // set new Date object.
	setDisplay();
} 
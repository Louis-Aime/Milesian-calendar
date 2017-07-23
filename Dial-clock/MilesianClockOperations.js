/* Milesian Solar Year Clock Handler
// Character set is UTF-8
// Operations on Milesian solar year clock
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
function setSolarYearClockHands(clock, month = 0, day = 1, hour = 24, minutes = 0, seconds = 0) { 
//	On "clock" object, set all available hands (month, day, hour, minutes, seconds)
//  If no time in the day given, set hands at end of day.
//  If no date given, set to 1 1m.
	let halfDays = 60*month + 2*Math.floor(month/2) + 2*(day-1) + (hour + minutes/60 + seconds/3600)/12;	
	// Number of half-days since beginning of year, at beginning of day i.e. at THE END of that day
	let	monthAngle = halfDays * 360 / 732, 			// Angle of month hand with respect to vertical upright
		dayAngle = 	 halfDays * 360 * 12 / 732,		// Angle of day hand with respect to vertical upright
		hourAngle = hour*30, minuteAngle = minutes*6, secondAngle = seconds*6;
	let theHand = clock.querySelector(".monthhand");
	if (theHand !== null) theHand.transform.baseVal[0].setRotate(monthAngle,0,0);	// Use SVG interfaces to set angles
	theHand = clock.querySelector(".dayhand");
	if (theHand !== null) theHand.transform.baseVal[0].setRotate(dayAngle,0,0);
	theHand = clock.querySelector(".hourhand");
	if (theHand !== null) theHand.transform.baseVal[0].setRotate(hourAngle,0,0);
	theHand = clock.querySelector(".minutehand");
	if (theHand !== null) theHand.transform.baseVal[0].setRotate(minteAngle,0,0);
	theHand = clock.querySelector(".hourhand");
	if (theHand !== null) theHand.transform.baseVal[0].setRotate(secondAngle,0,0);
	return halfDays;	// control the computation parameters with the return value
}
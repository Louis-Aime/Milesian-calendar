/* Milesian Calendar Clock Handler
	Character set is UTF-8
	Operations on Milesian solar year clock - set clock hands to right angle
		may handle month, day, hour, minute and second hands. All hands do not need to exist.
Versions
	M2017-11-07: add an "am/pm" indicator
	M2017-12-26: add year indication, and change parameters list
	M2018-10-26: enhance comments
	M2018-11-11: Change name, JSDocs comments
Contents
	setMilesianCalendarClockHands (new name for setSolarYearClockHands)
	setSolarYearClockHands (deprecated)
*/
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
/** Stub in order to change name
 * @deprecated setSolarYearClockHands
*/
function setSolarYearClockHands(clock, year = undefined, month = 0, day = 1, hour = 24, minute = 0, second = 0, continuous = false) { 
	return setMilesianCalendarClockHands(clock, year, month, day, hour, minute, second, continuous)
}
/** Set the hands of a milesian (solar) clock, after the components of a milesian date.
 * @since M2018-11-11
 * @param {Object} clock - a graphical object that represents the clock, that the routine will set
 * if existing, these elements shall be set
 *   @member .yearDisplay where the year is displayed
 *   @member .clockhand.month a hand to be rotated, indicates the month
 *   @member .clockhand.day a hand to be rotated, indicates the day in month
 *   @member .clockhand.hour a hand to be rotated, indicates the hour (12 hours dial)
 *   @member .clockhand.minute a hand to be rotated, minutes
 *   @member .clockhand.seconds a hand to be rotated, seconds
 *   @member .ampm where "am" or "pm" shall be indicated
 * @param {number} year - year, displayed as is in .yearDisplay
 * @param {number} month - month, 0 (1m) by default
 * @param {number} day - date in month, 1 by default
 * @param {number} hour - hour, 0 to 24, 24 by default, which means end of day
 * @param {number} minute - minute, 0 to 59, 0 by default
 * @param {number} second - second, 0 to 59, 0 by default
 * @param {boolean} continous - is set, day and month hands shall move slightly during the day, 
 * if unset (default), hands move by one day quantum.
 * @return {number} number of half-days since beginning of year.
*/
function setMilesianCalendarClockHands(clock, year = undefined, month = 0, day = 1, hour = 24, minute = 0, second = 0, continuous = false) { 
	var timeUnits = ["month", "day", "hour", "minute", "second"] ;	// the time units enumerated.
	let 	halfDays = 60*month + 2*Math.floor(month/2) 
			+ (continuous ? 2*(day-1) + (hour + minute/60 + second/3600)/12 : 2*day);	
	// Number of half-days since beginning of year, at beginning of day i.e. at THE END of that day if no hour specified.
	let	angle =	{				// set of angle values
		"month" : halfDays * 360 / 732, 			// Angle of month hand with respect to vertical upright
		"day"	: halfDays * 360 * 12 / 732,		// Angle of day hand with respect to vertical upright
		"hour"	: hour*30 + minute/2, "minute" : minute*6+second/10, "second" : second*6
	};
	// Use SVG interfaces to set angles. Forced to use "getItem" instead of a simple [] array call, because of MS Edge (and probably Safari)
	for ( let i = 0; i < timeUnits.length; i++ ) {	// for all time units...
		let theHand = clock.querySelector(".clockhand."+timeUnits[i]);		// Find hand for this unit in this clock
		let theCenter = clock.querySelector(".center."+timeUnits[i]);		// Find the center of the hand
		if (theHand !== null) 
			theHand.transform.baseVal.getItem(0).setRotate(angle[timeUnits[i]],theCenter.x.baseVal.value,theCenter.y.baseVal.value);
	}
	let theAmPm = clock.querySelector(".ampm");			// Select the am/pm indicator, check whether existing.
	if (theAmPm !== null) theAmPm.innerHTML = (hour > 11 ? "pm" : "am");	// hour is 0 to 23. "am" from 0 to 11, "pm" from 12 to 23.
	let theYear = clock.querySelector(".yeardisplay");		// Select the year field, check whether existing.
	if (theYear !== null) theYear.innerHTML = Number.isInteger(year) ? year : "" ;
	return halfDays;	// control the computation parameters with the return value
}
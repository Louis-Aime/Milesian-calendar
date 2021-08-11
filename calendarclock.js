/* Calendar clock handler
	Character set is UTF-8
	Operations on a solar calendar clock - set clock hands to angle corresponding to solar date in year
		may handle month, day, hour, minute and second hands. All hands do not need to exist.
Contents
	setSolarCalendarClockHands (since M2020-12-30)
		setMilesianCalendarClockHands (deprecated)
		setSolarYearClockHands (deprecated)
*/
/* Version	M2021-08-02	Add a dragon hand
	M2021-07-29 adapt to calendrical Javascript
	M2021-02-15	Use as module, with calendrical-javascript modules
	M2020-12-30
		Group routines in a same module
		Define clock as class
		Month is 1 .. 12, not 0 .. 11
	M2020-01-12: 
		Display year number with a minimum of 3 digits, 
		Suppress deprecated SolarYearClockHands
		Use strict
	M2019-11-30: add seasons
	M2018-11-28: enhancement on lunar: fetch centre and radius of SVG moondisk.
	M2018-11-24: add lunar
	M2018-11-11: Change name, JSDocs comments
	M2018-10-26: enhance comments
	M2017-12-26: add year indication, and change parameters list
	M2017-11-07: add an "am/pm" indicator
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
import { default as ExtDate } from './extdate.js';
import {MilesianCalendar} from './calendars.js';
import { Seasons } from './seasons.js';
const milesian = new MilesianCalendar ("seasmilesian");
export class SolarClock {
	constructor (clock) {
		this.clock = clock;	// The dial and the elements to be moved
	}
	/** Set the hands of a solar calendar clock, after the components of a milesian date.
	 * @since M2021-08-02
	 * @param {Object} clock - a graphical object that represents the clock, that the routine will set
	 * if existing, these elements shall be set
	 *   @member .yearDisplay where the year is displayed
	 *   @member .clockhand.month a hand to be rotated, indicates the month
	 *   @member .clockhand.day a hand to be rotated, indicates the day in month
	 *   @member .clockhand.hour a hand to be rotated, indicates the hour (12 hours dial)
	 *   @member .clockhand.minute a hand to be rotated, minutes
	 *   @member .clockhand.seconds a hand to be rotated, seconds
	 *   @member .clockhand.dragon a hand to be rotated, represents the dragon i.e. the lunar nodes. 
	 *   @member .ampm where "am" or "pm" shall be indicated
	 * @param {number} year - year, displayed as is in .yearDisplay
	 * @param {number} month - month, 1 (1m) by default
	 * @param {number} day - date in month, 1 by default
	 * @param {number} hour - hour, 0 to 24, 24 by default, which means end of day
	 * @param {number} minute - minute, 0 to 59, 0 by default
	 * @param {number} second - second, 0 to 59, 0 by default
	 * @param (number) dragonMonth - if defined, the month part of the dragon equivalent date.
	 * @param (number) dragonDay -b if defined, the day part of the dragon equivalent date.
	 * @param {boolean} continous - if set, day and month hands shall move continuously during the day, if unset (default), day, month and dragon hands move by one day quantum.
	 * @return {number} number of half-days since beginning of year.
	*/
	setHands(year = undefined, month = 1, day = 1, hour = 24, minute = 0, second = 0, dragonMonth, dragonDay, continuous = false) { 
		var timeUnits = ["month", "day", "hour", "minute", "second", "dragon"] ;	// the time units enumerated.
		let 	halfDays = 60*(--month) + 2*Math.floor(month/2) 
					+ (continuous ? 2*(day-1) + (hour + minute/60 + second/3600)/12 : 2*day),
				dragon = dragonMonth == undefined || dragonDay == undefined ? 0 :
						(60 * (--dragonMonth) + 2*Math.floor(dragonMonth/2) + 2*dragonDay) * 360 / 732;
		// Number of half-days since beginning of year, at beginning of day i.e. at THE END of that day if no hour specified.
		let	angle =	{				// set of angle values
			"month" : halfDays * 360 / 732, 			// Angle of month hand with respect to vertical upright
			"day"	: halfDays * 360 * 12 / 732,		// Angle of day hand with respect to vertical upright
			"hour"	: hour*30 + minute/2, 
			"minute" : minute*6+second/10, 
			"second" : second*6,
			"dragon" : dragon
		};
		// Use SVG interfaces to set angles. Forced to use "getItem" instead of a simple [] array call, because of MS Edge (and probably Safari)
		for ( let i = 0; i < timeUnits.length; i++ ) {	// for all time units...
			let theHand = this.clock.querySelector(".clockhand."+timeUnits[i]);		// Find hand for this unit in this clock
			let theCenter = this.clock.querySelector(".center."+timeUnits[i]);		// Find the center of the hand
			if (theHand != null) 
				theHand.transform.baseVal.getItem(0).setRotate(angle[timeUnits[i]],theCenter.x.baseVal.value,theCenter.y.baseVal.value);
		}
		let theAmPm = this.clock.querySelector(".ampm");			// Select the am/pm indicator, check whether existing.
		if (theAmPm != null) theAmPm.innerHTML = (hour > 11 ? "pm" : "am");	// hour is 0 to 23. "am" from 0 to 11, "pm" from 12 to 23.
		let theYear = this.clock.querySelector(".yeardisplay");		// Select the year field, check whether existing.
		if (theYear != null) theYear.innerHTML = Number.isInteger(year) ? 
			new Intl.NumberFormat (undefined, {minimumIntegerDigits : 3, useGrouping : false}).format(year)
			: "";
		return halfDays;	// control the computation parameters with the return value
	}
	/** Mark the dates of solstices and equinox on the dial of the Milesian clock 
	 * @since M2019-08-23 (revised for typos M2019-11-30
	 * @param {Object} clock - a graphical object that represents the clock, that the routine will set
	 * if existing, these elements shall be set
	 *  @member .seasonmark.winter winter solstice
	 *  @member .seasonmark.spring spring equinox
	 *  @member .seasonmark.summer summer solstice
	 *  @member .seasonmark.autumn autumn equinox
	 * @param {number} year - year for which the seasons are set
	 * @return {boolean} true if seasons have been computed, false otherwise.
	*/
	setSeasons (year) {
		var 
			markList = ["winter", "spring", "summer", "autumn"],
			theCenter = this.clock.querySelector(".center.month"),
			success = true;
		try {
			for (let i = 0; i < markList.length ; i++) {
				let wdate = new ExtDate (milesian,Seasons.tropicEvent(year,i));
				let m = wdate.month()-1;
				let theMark = this.clock.querySelector(".seasonmark."+markList[i]);
				let angle = (m * 30 + Math.floor(m/2) + wdate.day()) * 60.0 / 61.0;
				if (theMark != null)
					theMark.transform.baseVal.getItem(0).setRotate(angle,
						theCenter.x.baseVal.value,theCenter.y.baseVal.value);
			}
		}
		catch (error) {
			success = false;
			let angle = 0;
			for (let i = 0; i < markList.length ; i++) {
				let theMark = this.clock.querySelector(".seasonmark."+markList[i]);
				if (theMark != null)
					theMark.transform.baseVal.getItem(0).setRotate(angle,
						theCenter.x.baseVal.value,theCenter.y.baseVal.value);
			}
		}
		return success;
	}
	/** set SVG display as to Moon age.
	 * @param {Object} moon - SVG object representing a moon defined with a lit image and a "path" shaded part
	 * @param {number} phase - Phase, in radians (2 * PI is one lunar cycle)
	*/
	setMoonPhase (phase) {	// a "moon" object is a child of this.
		let moon = this.clock.querySelector(".moon");
		if (moon == undefined) return "";
		if (phase < 0) throw "Out of bounds";
		var 
			// Which of the four main phase of the moon (0 to 3)
			quart = Math.floor (2*phase / Math.PI), 
			// moon disk object
			moonDisk = moon.querySelector(".moondisk"),
			// reference radius of the moon circle
			scaleRadius = moonDisk.getAttribute("r"),	
			// starting point, from the reference moon circle
			sx = moonDisk.getAttribute ("cx"), sy = moonDisk.getAttribute ("cy")-scaleRadius,
			// computed radius of the circle used for the moon phase
			secondRadius = scaleRadius/Math.max(0.01,Math.abs(Math.cos(phase))),
			// d attribute of path SVG object
			pathstring = "M " + sx + " " + sy
				+ " a " + secondRadius +" " + secondRadius + " 0 0 " 
				+ (quart % 2 == 0 ? 1 : 0) + " 0 " + 2*scaleRadius
				+ " a " + scaleRadius + " " + scaleRadius + " 0 0 " 
				+ (quart % 4 < 2 ? 1 : 0) + " 0 " + -2*scaleRadius + " z" ;
		return moon.querySelector(".moonphase").setAttribute("d",pathstring);
	}
}

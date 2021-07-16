/* Chronological count conversion
	Character set is UTF-8
	This module converts a legacy date-time counter into several well-known day counters
Contents
	export class ExtCountDate with new methods
		getCount ()
		setFromCount (count)
Required
	Milliseconds
	ExtDate
*/
/* Version	M2021-07-26	Adapt to calendrical-javascript
	M2021-02-15	Use as module, with calendrical-javascript modules
	M2021-01-07 adapt to new chronos, propose a setFromCount method.
	M2020-12-28	ExtCountDate as a class
	M2020-01-12 : strict mode
	M2019-06-14 : 
		add MSBase value, for Excel spreadsheets and MS databases
		change MacOS display
		include out of bounds display
	M2018-11-11 : JSDocs comments
	M2018-10-26 : Enhance comments
	M2017-12-27 : Initial
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
import { Milliseconds } from '/calendrical-javascript/chronos.js';
import { default as ExtDate } from '/calendrical-javascript/extdate.js';
/** Extend the ExtDate object to days counter with special behavior or contraints
 * @param {string} the desired counter, one of the following values
 * 		"julianDay" : 0 on M-004713-12-02T12:00:00Z (1 January -4712 at noon UTC)
 *		"julianDayAtNight" : 0 on M-004713-12-02T00:00:00Z (1 January -4712 at midnight UTC)
 *		"modifiedJulianDay" : 0 on M1858-11-27T00:00:00Z, i.e. : Julian Day - 2400000.5
 *		"nasaDay" : 0 on M1968-06-03T00:00:00Z, i.e. : Julian Day - 2440000.5
 *		"sheetsCount" (or "windowsCount") : 0 on M1900-01-10T00:00:00Z, i.e. on 1899-12-30Y00:00:00Z, used on most spreadsheets
 *		"MSBase" : Microsoft date baseline. Same as above, except that the time part is negative when the whole timestamp is negative.
 *		"macOSCount" : 0 on M1904-01-11T00:00:00Z, used on MacOS systems
*/
export class ExtCountDate extends ExtDate {
	constructor (countType, ...myArguments) {
		super (...myArguments);
		this.countType = countType;
		switch (countType) {
			case "julianDay" : this.countOffset = 210866760000000; break; 	// Julian Day 0 (12h UTC).
			case "julianDayAtNight" : this.countOffset = 210866803200000; break;
			case "modifiedJulianDay" : this.countOffset = 3506716800000; break;
			case "nasaDay" : this.countOffset = 50716800000; break;
			case "sheetsCount" : case "MSBase"  : this.countOffset = 2209161600000; break;
			case "macOSCount" :  this.countOffset = 2082844800000; break;
			default : throw ExtDate.unimplementedOption;
 		}
	}
/** Give the decimal value of one the following chronological counters 
 * @method getCount
 * @return {number} The desired counter, in decimal value
*/
	getCount = function () {
		// 2. Compute return value, and set to NaN if outside known bounds
		let count = (this.valueOf() + this.countOffset) / Milliseconds.DAY_UNIT;
		count = ((this.countType == "MSBase" && count < 0) || (this.countType == "macOSCount" && count < -1462 )) ? 2 * Math.floor(count) - count : count;
		switch (this.countType) {
			case "nasaDay" : if (count < -32767 || count > 32767) return NaN; break;
			case "macOSCount" : if (count <= -657435|| count >=	2957004) return NaN; break ;
			case "MSBase" : if (count <= -657435 || count >= 2958466) return NaN; break;
			default : 
		}
		return count;
	}
/** Set ExtCountDate object to the value corresponding to the decimal value of the specified counters. For MSBase, if -1 < counter value < 0, returns NaN
 * @method setFromCount
 * @param (number) the (decimal) number of days to convert
 * @return {number} The result of setTime method.
*/
	setFromCount = function (count) {
		if (isNaN (count)) throw ExtDate.notANumber;
		let countType = this.countType;
		if (countType == "macOSCount") {count += 1462; countType = "MSBase"};	// switch to MSBase for a simplier resolution
		if (countType == "MSBase") count =  count <= -1 ? 2 * Math.ceil(count) - count : ( count < 0 ? NaN : count );
		if (this.countType == "macOSCount") count -= 1462;	// back to original figure
		return this.setTime( Math.round(count * Milliseconds.DAY_UNIT)  - this.countOffset )
	}
}
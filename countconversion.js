/**
 * Chronological count conversion: 
	convert a legacy date-time counter into several well-known day counters
 * @module
 * @requires module:time-units
 * @requires module:extdate
 * @version M2024-04-25
 * @author Louis A. de Fouquières https://github.com/Louis-Aime
 * @license MIT 2016-2024
*/
//	Character set is UTF-8
/* Version (see also GitHub)
	M2024-04-25	Add SQL count of DAYS used in FROM_DAYS() and TO_DAYS() functions
	M2022-01-30 JSdoc
	M2021-07-29	Adapt to calendrical-javascript
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
/* Copyright Louis A. de Fouquières https://github.com/Louis-Aime 2016-2024
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
import { default as Milliseconds } from './time-units.js';
import { default as ExtDate } from './extdate.js';
/** Extend the ExtDate object to days counter with special behavior or contraints.
 * @class
 * @extends Date
 * @param {string} countType	- the desired counter, one of the following values: 
 * 		"julianDay" : 0 on M-004713-12-02T12:00:00Z (1 January -4712 at noon UTC);
 *		"julianDayAtNight" : 0 on M-004713-12-02T00:00:00Z (1 January -4712 at midnight UTC);
 *		"modifiedJulianDay" : 0 on M1858-11-27T00:00:00Z, i.e. : Julian Day - 2400000.5;
 *		"nasaDay" : 0 on M1968-06-03T00:00:00Z, i.e. : Julian Day - 2440000.5;
 *		"sheetsCount" (or "windowsCount") : 0 on M1900-01-10T00:00:00Z, i.e. on 1899-12-30Y00:00:00Z, used on most spreadsheets;
 *		"MSBase" : Microsoft date baseline. Same as above, except that the time part is negative when the whole timestamp is negative;
 *		"macOSCount" : 0 on M1904-01-11T00:00:00Z, used on MacOS systems.
 *		"SQLdays" : 0 on M0000-01-11, i.e. on ISO 0000-01-01. The count is the integer part (floor) of the result in days. 
			Values < 60 are considered invalid as long as SQL calendar is erroneous before 0000-03-01. 
			Values > 3_652_424 are considered invalid since SQL does not consider dates above 9999-12-31
 * @param {string | number[]} [...myArguments] the parameter or parameter list passed to Date. 
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
			case "SQLdays" : this.countOffset = 62167219200000; break;
			default : throw new RangeError("Unimplemented option: " + countType);
 		}
	}
/** Give the decimal value of the instantiated chronological counter
 * @return {number} The desired counter, in decimal value, or NaN if no value is available for this date (including erroneous dates)
*/
	getCount = function () {
		// 	Compute return value, and set to NaN if outside known bounds
		let count = (this.valueOf() + this.countOffset) / Milliseconds.DAY_UNIT;
		count = ((this.countType == "MSBase" && count < 0) || (this.countType == "macOSCount" && count < -1462 )) ? 2 * Math.floor(count) - count : count;
		switch (this.countType) {
			case "nasaDay" : if (count < -32767 || count > 32767) return NaN; break;
			case "macOSCount" : if (count <= -657435 || count >=	2957004) return NaN; break ;
			case "MSBase" : if (count <= -657435 || count >= 2958466) return NaN; break;
			case "SQLdays" : count = Math.floor(count); if (count < 60 || count > 3652424) return NaN;  break; 
			default : 
		}
		return count;
	}
/** Set ExtCountDate object to the value corresponding to the decimal value of the specified counters. For MSBase, if -1 < counter value < 0, returns NaN
 * @param (number) the (decimal) number of days to convert
 * @return {number} The result of setTime method.
*/
	setFromCount = function (count) {
		if (isNaN (count)) throw new TypeError ("A number is expected: " + count);
		let countType = this.countType;
		if (countType == "macOSCount") {count += 1462; countType = "MSBase"};	// switch to MSBase for a simplier resolution
		if (countType == "MSBase") count =  count <= -1 ? 2 * Math.ceil(count) - count : ( count < 0 ? NaN : count );
		if (this.countType == "macOSCount") count -= 1462;	// back to original figure
		if (countType == "SQLdays" && !Number.isInteger (count)) throw new TypeError ("An integer is expected: " + count);
		return this.setTime( Math.round(count * Milliseconds.DAY_UNIT) - this.countOffset );
	}
}
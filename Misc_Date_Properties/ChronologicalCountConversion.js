/* Chronological count conversion
	Character set is UTF-8
	This package, to be manually imported, converts the standard Unix time counter into several well-known day counters
Versions
	M2017-12-27 : Initial
	M2018-10-26 : Enhance comments
	M2018-11-11 : JSDocs comments
	M2019-06-14 : 
		add MSBase value, for Excel spreadsheets and MS databases
		change MacOS display
		include out of bounds display
Required
	No dependent file, all constants here (Day_Unit is defined again)
Contents
	getCount (count), method added to Date.
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
/** Give the decimal value of one the following chronological counters 
 * @method getCount
 * @param {string} the desired counter, one of the following values
 * 		"julianDay" : 0 on M-004713-12-02T12:00:00Z (1 January -4712 at noon UTC)
 *		"julianDayAtNight" : 0 on M-004713-12-02T00:00:00Z (1 January -4712 at midnight UTC)
 *		"modifiedJulianDay" : 0 on M1858-11-27T00:00:00Z, i.e. : Julian Day - 2400000.5
 *		"nasaDay" : 0 on M1968-06-03T00:00:00Z, i.e. : Julian Day - 2440000.5
 *		"sheetsCount" (or "windowsCount") : 0 on M1900-01-10T00:00:00Z, i.e. on 1899-12-30Y00:00:00Z, used on most spreadsheets
 *		"MSBase" : Microsoft date baseline. Same as above, except that the time part is negative when the whole timestamp is negative.
 *		"macOSCount" : 0 on M1904-01-11T00:00:00Z, used on MacOS systems
 * @return {number} The desired counter, in decimal value
*/
Date.prototype.getCount = function (countType) {
	const   
		DAY_UNIT = 86400000,	// number of ms in one day
		HALF_DAY_UNIT = 43200000,
		JULIAN_DAY_UTC12_EPOCH_OFFSET = +210866760000000; // Julian Day 0 (12h UTC).
	let convertMs = JULIAN_DAY_UTC12_EPOCH_OFFSET;	// initiate with Julian day expressed in ms
	// 1. Compute offset
	switch (countType) {
		case "julianDay" : break;
		case "julianDayAtNight" : convertMs += HALF_DAY_UNIT; break;
		case "modifiedJulianDay" : convertMs -= 2400000 * DAY_UNIT + HALF_DAY_UNIT; break;
		case "nasaDay" : convertMs -= 2440000 * DAY_UNIT + HALF_DAY_UNIT; break;
		case "sheetsCount" : case "MSBase"  : convertMs -= 2415018 * DAY_UNIT + HALF_DAY_UNIT; break;
		case "macOSCount" :  convertMs -= 2416480 * DAY_UNIT + HALF_DAY_UNIT; break;
		default : return NaN;
	}
	// 2. Compute return value, and set to NaN if outside known bounds
	let count = (this.valueOf() + convertMs) / DAY_UNIT;
	count = ((countType == "MSBase" && count < 0) || (countType == "macOSCount" && count < -1462 )) ? count = 2 * Math.floor(count) - count : count;
	switch (countType) {
		case "nasaDay" : if (count < -32767 || count > 32767) return NaN; break;
		case "macOSCount" : if (count <= -657435|| count >=	2957004) return NaN; break ;
		case "MSBase" : if (count <= -657435 || count >= 2958466) return NaN; break;
		default : 
	}
	return count;
}

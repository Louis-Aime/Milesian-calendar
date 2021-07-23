/* Computation of an estimate of Delta T, for astronomical computations with calendars
Character set is UTF-8
Contents: 
	getDeltaT : an estimate of DeltaT, defined as: 
				UTC = TT - DeltaT. UTC is former GMT.
		TT is Terrestrial Time, a uniform time scale defined with a second defined independently from Earth movements.
		DeltaT is erratic and difficult to compute, however, the general trend of DeltaT is due to the braking  of the Earth's daily revolution.
		This estimate of Delta T in seconds from the year expressed in Common Era is: -20 + 32 v², where v = (A – 1820) / 100.
		In this version, Delta T is computed from a fractional value of the time. The result is rounded to the nearest second.
*/
/* Version	M2021-08-02	Recover comments describing Delta T that had been lost when splitting.
	M2021-07-29 extracted and isolated from Lunar.js
	M2021-03-11	Update formula for average Delta D after Morrison and Stephenson 2021
*/
/* Copyright Miletus 2016-2021 - Louis A. de Fouquières
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
/* Requires: nothing
*/
"use strict";
	/** Compute an estimate of Delta T, defined as: UTC = TT - Delta T. The estimate is only the quadratic part of Delta T.
	 * @function getDeltaT
	 * @param {Date} the date where Delta T is estimated (estimation is per exact date, not per year)
	 * return {number} Delta T. Unit is milliseconds, result reflects an integer signed number of seconds
	*/
export default function	getDeltaT (theDate) { 
		const JULIAN_CENTURY_UNIT = 36525 * 86400000,
			SECOND_UNIT = 1000, 	// used with legacy Date object
			ORIGIN = new Date (1825, 0, 1); // 1 January 1825
		let century = (theDate.getTime() - ORIGIN.getTime()) / JULIAN_CENTURY_UNIT;
		return Math.round(century*century*31.4 - 10) * SECOND_UNIT; // Precision is not less than one second
	}

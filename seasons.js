/** Dates of tropical events for a given Milesian year.
These functions implement Jean Meeus' method for computing tropical events.
The code derives from Fourmilab's astro.js file (2015). 
Code has been modified in order to conform with strict mode.
 * @file
 * @requires module:getdeltat
 * @version M2021-08-20
 * @author Louis A. de Fouquières https://github.com/Louis-Aime
 * @license MIT 2016-2022
 */
//	Character set is UTF-8
/* Version	M2022-02-03 JSDoc
	M2021-08-27 key figures as constants.
	M2021-08-20 Hide internal functions and refer to DeltaT only
	M2021-07-29 Adapt to calendrical-javascript
	M2021-02-14	Use calendrical-javascript modules 
	M2020-12-29 Adapted to new Chronos and Lunar
	M2020-01-12 : strict mode implementation
	M2019-08-22: first version, extracted from a Fourmilab package
*/
/* Copyright Louis A. de Fouquières https://github.com/Louis-Aime 2016-2022
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
/* Part 1 - utilities 	*/

import { default as getDeltaT } from './deltat.js';

/** The lower value for the year parameter
 * @private
 * @const
 * @default -3000
 */
const
	LOWER_YEAR = -3000;

/** The highest value for the year parameter
 * @private
 * @const
 * @default +6000
 */
const
	UPPER_YEAR = +6000;

/** Convert degrees to radians
 * @private
 * @param {number} d - an angle in degrees
 * @return {number} the corresponding angle in radians
 */
function dtr(d) {return (d * Math.PI) / 180.0;}

/** Cosinus of an angle in degrees
 * @private
 * @param {number} d - an angle in degrees
 * @return {number} the cosinus of the angle
 */
function dcos(d) {return Math.cos(dtr(d));}

/* Part 2 - Seasons, the interface object */ 
/** interface object of two functions for computing equinoxes and solstices of a year.
 * @interface
 */
export const Seasons = {
	
	/** The Julian Day of a tropical event (equinox or solstice) of a given year.
	This function implements Jean Meeus' method for calculating equinox and solstices dates of a given year.
	This implementation is extracted from Fourmilab's astro functions (John Walker, http://www.fourmilab.ch/, September MIM)
	 * @static
	 * @function
	 * @param {number} year - the Gregorian year.
	 * @param {number} which - 0->March, 1->June, 2->September, 3->December, any other value -> Error.
	 * @return {number} the date of the event in Julian Day, Terrestrial Time.
	*/
 equinox (year, which) {
		//  Periodic terms to obtain true time
	const 
		EquinoxpTerms = new Array(
			485, 324.96,   1934.136,
			203, 337.23,  32964.467,
			199, 342.08,     20.186,
			182,  27.85, 445267.112,
			156,  73.14,  45036.886,
			136, 171.52,  22518.443,
			 77, 222.54,  65928.934,
			 74, 296.72,   3034.906,
			 70, 243.58,   9037.513,
			 58, 119.81,  33718.147,
			 52, 297.17,    150.678,
			 50,  21.02,   2281.226,
			 45, 247.54,  29929.562,
			 44, 325.15,  31555.956,
			 29,  60.93,   4443.417,
			 18, 155.12,  67555.328,
			 17, 288.79,   4562.452,
			 16, 198.04,  62894.029,
			 14, 199.76,  31436.921,
			 12,  95.39,  14577.848,
			 12, 287.11,  31931.756,
			 12, 320.81,  34777.259,
			  9, 227.73,   1222.114,
			  8,  15.45,  16859.074
									),
		JDE0tab1000 = new Array(
		   new Array(1721139.29189, 365242.13740,  0.06134,  0.00111, -0.00071),
		   new Array(1721233.25401, 365241.72562, -0.05323,  0.00907,  0.00025),
		   new Array(1721325.70455, 365242.49558, -0.11677, -0.00297,  0.00074),
		   new Array(1721414.39987, 365242.88257, -0.00769, -0.00933, -0.00006)
								),
		JDE0tab2000 = new Array(	// Meeus, ch. 18 (up to 3rd degree)
		   new Array(2451623.80984, 365242.37404,  0.05169, -0.00411, -0.00057),
		   new Array(2451716.56767, 365241.62603,  0.00325,  0.00888, -0.00030),
		   new Array(2451810.21715, 365242.01767, -0.11575,  0.00337,  0.00078),
		   new Array(2451900.05952, 365242.74049, -0.06223, -0.00823,  0.00032)
							);
	var deltaL, i, j, JDE0, JDE0tab, S, T, W, Y;
	if (!Number.isInteger(which) || which < 0 || which > 3) throw RangeError ("Invalid season parameter: " + which);

	/*  Initialise terms for mean equinox and solstices.  
	We have two sets: 
		one for years prior to 1000 
		and a second for subsequent years.  */

	if (year < 1000) {
		JDE0tab = JDE0tab1000;
		Y = year / 1000;
	} else {
		JDE0tab = JDE0tab2000;
		Y = (year - 2000) / 1000;
	}

	JDE0 =  JDE0tab[which][0] +
		   (JDE0tab[which][1] * Y) +
		   (JDE0tab[which][2] * Y * Y) +
		   (JDE0tab[which][3] * Y * Y * Y) +
		   (JDE0tab[which][4] * Y * Y * Y * Y);
	T = (JDE0 - 2451545.0) / 36525;	// JDE0 expressed in Julian centuries from 1/1/2000 - Meeus 13-1
	W = (35999.373 * T) - 2.47;		// M, Mean solar anomaly, Meeus ch. 16, without 2nd order term
	deltaL = 1 + (0.0334 * dcos(W)) + (0.0007 * dcos(2 * W));
	//  Sum the periodic terms for time T
	S = 0;
	for (i = j = 0; i < 24; i++) {
		S += EquinoxpTerms[j] * dcos(EquinoxpTerms[j + 1] + (EquinoxpTerms[j + 2] * T));
		j += 3;
	}
	return JDE0 + ((S * 0.00001) / deltaL);
  },

	/** Compute a tropical event of a Milesian year, result as a Date.
	Milesian year means the year beginning at a northern winter solstice and finishing at the next northern winter solstice.
	 * @static
	 * @param {number} year	- the Milesian year
	 * @param {number} which - the season, coded as:  
		0->Winter solstice at beginning of year, 
		1->Spring equinox, 
		2->Summer solstice, 
		3->Autumn equinox, 
		4->Winter solstice at end of year, 
		any other value -> Error.
	 * @return {Date} the date of the event (correction with an estimate of Delta T).
	*/
 tropicEvent (year, which) {
	const PosixJD = 2440587.5, DayUnit = 86400000;
	var JDE;
	if (!Number.isInteger(which) || which < 0 || which > 4) throw RangeError("Invalid value for season parameter: " + which);
	if (year < LOWER_YEAR || year > UPPER_YEAR) throw RangeError ("Year outside seasons' computation capabilities: " + year);
	if (which == 0) JDE = this.equinox (year-1,3)
		else JDE = this.equinox(year, which-1);
	let wdate = new Date(Math.round((JDE - PosixJD)*DayUnit));
	return new Date (wdate.valueOf() - getDeltaT(wdate));
  }
}

/* Year Signature of Julian, Gregorian and Milesian calendars
	Character set is UTF-8
	This set of functions, to be manually imported, computes year key figures.
Required
	Chronos
	(the Milesian calendar, as a reckoning system, is not required)
Each function returns a compound value with the yearly key figures for one calendar:
	julianSignature: for the Julian calendar,
	gregorianSignature: for the Gregorian calendar,
	milesianSignature: for the Milesian calendar.
Key figure include:
	doomsday : the weekday number of "0th March" or "0th 1m", see this information on this method by John Conway.
	easterResidue: number of days from 21st March (30th 3m for Milesian) to the computus Spring full moon.
	eaterOffset: number of days from 21st March (30th 3m) to Easter Sunday.
	epact: Julian / Gregorian computus epact, Milesian mean moon epact.
*/
/* Version M2021-02-15	Use as module, with calendrical-javascript modules
	M2020-12-29 
		Use Chronos.mod
		Derive Milesian signature from Gregorian figures, no more half-integer epact.
	M2020-01-12 : strict mode
	M2019-10-10: Reduced milesian epact is never 29.5, but rather 0.0
	M2019-07-27: Update dependencies, no new code
	M2019-06-28: Enhance Milesian epact computation, shall depend on UTC time only.
	M2019-05-12: Add the the milesiancomputusepact i.e. epact of the gregorian computus one day before 1 1m (not to be recommended)
	M2019-01-13: Milesian intercalation is same as Gregorian
	M2018-11-13: JSDoc comments
	M2018-10-26: enhance comments
	M2017-12-26
	M2017-06-04
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
import { Chronos } from './chronos.js';
/** key figures of a year of the Julian calendar
 * @param {number} year, integer number representing the year investigated
 * @return {Object.<string, number>} signature
 * {number} signature.doomsday - the doomsday or key day or "clavedi", key figure for weekday computations, a 0-7 integer.
 * {number} signature.epact - the age of the moon one day before 1st January, following Julian computus, a 0-29 integer.
 * {number} signature.easterResidue - the number of days from 21st March to computus next full moon, a 0-29 integer.
 * {number} signature.easterOffset - the number of days from 21st March to Easter Sunday, result of Easter computation.
 * {boolean} signature.isLong - whether this year is a leap year (366 days long).
*/
const 
	gregCalend = new Chronos (	// This signature generator works for Gregorian and Milesian
		{ 	// Decompose a Gregorian year figure
			timeepoch : 0, 
			coeff : [
			  {cyclelength : 400, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "quadrisaeculum"}, 
			  {cyclelength : 100, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "saeculum"},
			  {cyclelength : 4, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "quadriannum"}, 
			  {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "annum"}
			],
			canvas : [
				{name : "quadrisaeculum", init : 0},
				{name : "saeculum", init : 0},
				{name : "quadriannum", init : 0},
				{name : "annum", init : 0}
			]
		});
export function julianSignature (year) {
	const calend = new Chronos (
		 { 	// Decompose a Julian year figure //yearParams =
			timeepoch : 0, 
			coeff : [
			  {cyclelength : 4, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "quadriannum"}, 
			  {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "annum"}
			],
			canvas : [
				{name : "quadriannum", init : 0},
				{name : "annum", init : 0}
			]
		});
	var
		yearCoeff = calend.getObject (year),
		signature = {  // Result for this function
			// John Conway's Doomsday or key day for computing weekdays: 0th March.
			doomsday : Chronos.mod(-2*yearCoeff.quadriannum + yearCoeff.annum, 7), 
			gold : Chronos.mod (year, 19),	// This figure is the modulo i.e. 0 to 18
			goldNumber : 1,					// The displayed gold number, 1..19, computed later
			epact : 0, 		// Julian computus moon age one day before 1st January.
			easterResidue : 0, 	// Number of days from 21st March to computus 14th moon day.
			easterOffset : 0, 	// Number of days from 21st March to Easter Sunday.
			isLeap : yearCoeff.annum == 0	// whether this year is 366 days long
		};
	signature.goldNumber += signature.gold;
	signature.easterResidue = Chronos.mod (15 + 19*signature.gold, 30);
	signature.epact = Chronos.mod (23 - signature.easterResidue, 30);
	signature.easterOffset = 1 + signature.easterResidue + Chronos.mod(6 - signature.easterResidue - signature.doomsday, 7);
	return signature;
}
/** key figures of a year of the Gregorian calendar
 * @param {number} year, integer number representing the year investigated
 * @return {Object.<string, number>} signature
 * {number} signature.doomsday - the doomsday or key day or "clavedi", key figure for weekday computations, a 0-7 integer.
 * {number} signature.epact - the age of the moon one day before 1st January, following Gregorian computus, a 0-29 integer.
 * {number} signature.milesiancomputusepact - the age of the moon one day before 1 1m, following Gregorian computus, a 0-29 integer.
 * {number} signature.easterResidue - the number of days from 21st March to computus next full moon, a 0-29 integer.
 * {number} signature.easterOffset - the number of days from 21st March to Easter Sunday, result of Easter computation.
 * {boolean} signature.isLong - whether this year is a leap year (366 days long).
*/
export function gregorianSignature (year) {
	var
		yearCoeff = gregCalend.getObject (year),
		signature = {
					// John Conway's Doomsday or key day for computing weekdays: weekday of 0th March.
			doomsday : Chronos.mod(2*(1-yearCoeff.saeculum) - 2*yearCoeff.quadriannum + yearCoeff.annum, 7), 
					// Gregorian computus moon age one day before 1st January.
			gold : Chronos.mod (year, 19),	// This figure is the modulo i.e. 0 to 18
			goldNumber : 1,					// The displayed gold number, 1..19, computed later
			epact : 0, 		
			//milesiancomputusepact : 0,	// Gregorian computus moon age one day before 1 1m.
			easterResidue : 0,	 // Number of days from 21st March to computus 14th moon day.
			easterOffset : 0,	 // Number of days from 21st March to Easter Sunday.
			isLeap : yearCoeff.annum == 0 && (yearCoeff.quadriannum != 0 || yearCoeff.saeculum == 0)	// whether this year is 366 days long
		};
	signature.goldNumber += signature.gold;
	signature.easterResidue = Chronos.mod (15 + 19*signature.gold 	// Julian element
		+ 3*yearCoeff.quadrisaeculum + yearCoeff.saeculum 	// Metemptose
		- Math.floor ((8*(4*yearCoeff.quadrisaeculum + yearCoeff.saeculum) + 13) / 25 ) // Proemptose, Zeller computation
		, 30);
	signature.epact = Chronos.mod (23 - signature.easterResidue, 30);
	// signature.milesiancomputusepact = Chronos.mod (12 - signature.easterResidue, 30);
	signature.easterResidue -= Math.floor( (signature.gold + 11*signature.easterResidue) / 319 );
	signature.easterOffset = 1 + signature.easterResidue + Chronos.mod(6 - signature.easterResidue - signature.doomsday, 7);
	return signature;
}
/** key figures of a year of the Milesian calendar. Here no change with respect to Gregorian figures
 * @param {number} year, integer number representing the year investigated
 * @return {Object.<string, number>} signature
 * {number} signature.doomsday - the doomsday or key day or "clavedi", key figure for weekday computations, a 0-7 integer.
 * {number} signature.epact - the age of the moon one day before 1st January, following Julian computus, a 0-29 half-integer.
 * {number} signature.easterResidue - the number of days from 21st March to computus next full moon, a 0-29 integer.
 * {number} signature.easterOffset - the number of days from 21st March to Easter Sunday, result of Easter computation.
 * {boolean} signature.isLong - whether this year is a leap year (366 days long).
*/
export function milesianSignature (year) {
	var
		yearCoeff = gregCalend.getObject (year),
		signature = gregorianSignature (year); // initiate with Gregorian version
	signature.epact = Chronos.mod (signature.epact + 19, 30); 		// Math.round(doomhour.getCEMoonDate().age*2)/2; 	// Milesian epact is a half-integer 
	signature.isGregLeap = signature.isLeap;	// the Gregorian year of this number is leap; in this case, the corresponding Milesian year is not leap.
	// To check whether milesian year is leap, test next year
	yearCoeff = gregCalend.getObject (++year);
	signature.isLeap = yearCoeff.annum == 0 && (yearCoeff.quadriannum != 0 || yearCoeff.saeculum == 0);
	return signature;
}

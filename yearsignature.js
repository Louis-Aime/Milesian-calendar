/** Year Signature of Julian, Gregorian and Milesian calendars
Each function returns a compound value with the yearly key figures for the Julian, Gregorian of Milesian  calendar.
 * @module
 * @version M2021-08-07
 * @requires module:calendrical-javascript/chronos.Cbcce
 * @author Louis A. de Fouquières https://github.com/Louis-Aime
 * @license MIT 2016-2022
 */
//	Character set is UTF-8
/* 
*/
/* Version	M2022-01-28	JSDoc
	M2021-08-07 Dominical letter for leap years
	M2021-08-07	Add dominical letter
	M2021-07-29 Update external refs
	M2021-07-26	Update comments and links
	M2021-02-15	Use as module, with calendrical-javascript modules
	M2020-12-29 
		Use Cbcce.mod
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
import { Cbcce } from './chronos.js';
const // Gregorian solar intercalation rule
	gregCalend = new Cbcce (	
		{ 	// Decompose a year of the Dionysos era
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
		}),
	DominicalLetter = ['C','B','A','G','F','E','D'];	// Series of the Dominical Letter, index by Doomsday.
/** Structure of the returned object.
 * @typedef signature
 * @property {number} doomsday 			- the index doomsday or "clavedi" for the year, i.e. the index of weekday of "0 March", 21 March and other pivotal dates.
 * @property {string} dominicalLetter	- the key figure for weekday computations after the Roman method, corresponds to the day of the first Sunday in the year.
 * @property {number} gold				- year modulo 19, a key figure for Moon and Easter computation, a 0-18 integer.
 * @property {number} goldNumber		- the Gold Number, i.e. gold + 1.
 * @property {number} epact 			- the age of the moon one day before first day of the year and also one day before 1 March, a 0-29 integer.
 * @property {number} easterResidue 	- the number of days from 21st March to computus next full moon, a 0-29 integer.
 * @property {number} easterOffset  	- the number of days from 21st March to Easter Sunday, result of Easter computation.
 * @property {boolean} isLeap 			- whether this year is a leap year (366 days long).
 */
/** key figures of a year of the Julian calendar
 * @param {number} year - Algebraic integer year of Dionysos era.
 * @return {signature} key figures for the year.
*/
export function julianSignature (year) {
	const calend = new Cbcce (
		 { 	// Decompose a Julian year figure
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
			doomsday : Cbcce.mod(-2*yearCoeff.quadriannum + yearCoeff.annum, 7), 
			dominicalLetter : "",
			gold : Cbcce.mod (year, 19),	// This figure is the modulo i.e. 0 to 18
			goldNumber : 1,					// The displayed gold number, 1..19, computed later
			epact : 0, 		// Julian computus moon age one day before 1st January, after Dionysos' computus
			easterResidue : 0, 	// Number of days from 21st March to computus 14th moon day.
			easterOffset : 0, 	// Number of days from 21st March to Easter Sunday.
			isLeap : yearCoeff.annum == 0	// whether this year is 366 days long
		};
	signature.dominicalLetter = DominicalLetter[signature.doomsday] + (signature.isLeap ? DominicalLetter[(signature.doomsday+6) % 7] : "");
	signature.goldNumber += signature.gold;
	signature.easterResidue = Cbcce.mod (15 + 19*signature.gold, 30);
	signature.epact = Cbcce.mod (23 - signature.easterResidue, 30);
	signature.easterOffset = 1 + signature.easterResidue + Cbcce.mod(6 - signature.easterResidue - signature.doomsday, 7);
	return signature;
}
/** key figures of a year of the Gregorian calendar
 * @param {number} year - Algebraic integer year of Dionysos era.
 * @return {signature} key figures for the year.
*/
export function gregorianSignature (year) {
	var
		yearCoeff = gregCalend.getObject (year),
		signature = {
					// John Conway's Doomsday or key day for computing weekdays: weekday of 0th March.
			doomsday : Cbcce.mod(2*(1-yearCoeff.saeculum) - 2*yearCoeff.quadriannum + yearCoeff.annum, 7), 
					// Gregorian computus moon age one day before 1st January.
			dominicalLetter : "",
			gold : Cbcce.mod (year, 19),	// This figure is the modulo i.e. 0 to 18
			goldNumber : 1,					// The displayed gold number, 1..19, computed later
			epact : 0, 		
			//milesiancomputusepact : 0,	// Gregorian computus moon age one day before 1 1m.
			easterResidue : 0,	 // Number of days from 21st March to computus 14th moon day.
			easterOffset : 0,	 // Number of days from 21st March to Easter Sunday.
			isLeap : yearCoeff.annum == 0 && (yearCoeff.quadriannum != 0 || yearCoeff.saeculum == 0)	// whether this year is 366 days long
		};
	signature.dominicalLetter = DominicalLetter[signature.doomsday] + (signature.isLeap ? DominicalLetter[(signature.doomsday+6) % 7] : "");
	signature.goldNumber += signature.gold;
	signature.easterResidue = Cbcce.mod (15 + 19*signature.gold 	// Julian element
		+ 3*yearCoeff.quadrisaeculum + yearCoeff.saeculum 	// Metemptose
		- Math.floor ((8*(4*yearCoeff.quadrisaeculum + yearCoeff.saeculum) + 13) / 25 ) // Proemptose, Zeller computation
		, 30);
	signature.epact = Cbcce.mod (23 - signature.easterResidue, 30);
	// signature.milesiancomputusepact = Cbcce.mod (12 - signature.easterResidue, 30);
	signature.easterResidue -= Math.floor( (signature.gold + 11*signature.easterResidue) / 319 );
	signature.easterOffset = 1 + signature.easterResidue + Cbcce.mod(6 - signature.easterResidue - signature.doomsday, 7);
	return signature;
}
/** key figures of a year of the Milesian calendar. Mostly Gregorian figures.
 * @param {number} year - Algebraic integer year of Dionysos era.
 * @return {signature} key figures for the year.
*/
export function milesianSignature (year) {
	var
		yearCoeff = gregCalend.getObject (year),
		signature = gregorianSignature (year); // initiate with Gregorian version
	signature.epact = Cbcce.mod (signature.epact + 19, 30); 
	// To check whether milesian year is leap, test next year
	yearCoeff = gregCalend.getObject (++year);
	signature.isLeap = yearCoeff.annum == 0 && (yearCoeff.quadriannum != 0 || yearCoeff.saeculum == 0);
	return signature;
}

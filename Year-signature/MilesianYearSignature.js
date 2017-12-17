/* Milesian Year Signature
// Character set is UTF-8
// This set of functions, to be manually imported, computes year key figures.
// Package CBCCE is used.
// Each function returns a compound value with the yearly key figures for one calendar:
//  julianSignature: for the Julian calendar,
//  gregorianSignature: for the Gregorian calendar,
//  milesianSignature: for the Milesian calendar.
// Key figure include:
//  doomsday : the weekday number of "0th March" or "0th 1m", see this information on this method by John Conway.
//	easterResidue: number of days from 21st March (30th 3m for Milesian) to the computus Spring full moon.
//  eaterOffset: number of days from 21st March (30th 3m) to Easter Sunday.
//  epact: Julian / Gregorian computus epact, Milesian mean moon epact.
//  annualResidue: 29.5 minus epact (Milesian only).
// Version 1: M2017-06-04
// Version 2: M2017-12-26
//	Use CBCCE 
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
///////////////////////////////////////////////////////////////////////////////
// Import CBCCE, or make visible.
///////////////////////////////////////////////////////////////////////////////
function positiveModulo (dividend, divisor) {	// Positive modulo, with only positive divisor
	if (divisor <= 0) return ;	// Stop execution and return "Undefined"
	while (dividend < 0) dividend += divisor;
	while (dividend >= divisor) dividend -= divisor;
	return dividend
}

function julianSignature (year) {
	var
		yearParams = { 	// Decompose a Julian year figure
			timeepoch : 0, 
			coeff : [
			  {cyclelength : 4, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "quadriannum"}, 
			  {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "annum"}
			],
			canvas : [
				{name : "quadriannum", init : 0},
				{name : "annum", init : 0}
			]
		},
		signature = {  // Result for this function
			doomsday : 0, 	// John Conway's Doomsday or key day for computing weekdays: 0th March.
			epact : 0, 		// Julian computus moon age one day before 1st January.
			easterResidue : 0, 	// Number of days from 21st March to computus 14th moon day.
			easterOffset : 0, 	// Number of days from 21st March to Easter Sunday.
		},
		yearCoeff = cbcceDecompose (year, yearParams),
		gold = positiveModulo (year, 19);
	signature.doomsday = positiveModulo(-2*yearCoeff.quadriannum + yearCoeff.annum, 7);
	signature.easterResidue = positiveModulo (15 + 19*gold, 30);
	signature.epact = positiveModulo (23 - signature.easterResidue, 30);
	signature.easterOffset = 1 + signature.easterResidue + positiveModulo(6 - signature.easterResidue - signature.doomsday, 7);
	return signature;
}
function gregorianSignature (year) {
	var
		yearParams = { 	// Decompose a Gregorian year figure
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
		},
			signature = {  // Result for this function
			doomsday : 0, 	// John Conway's Doomsday or key day for computing weekdays: 0th March.
			epact : 0, 		// Gregorian computus moon age one day before 1st January.
			easterResidue : 0,	 // Number of days from 21st March to computus 14th moon day.
			easterOffset : 0,	 // Number of days from 21st March to Easter Sunday.
		},
		yearCoeff = cbcceDecompose (year, yearParams),
		gold = positiveModulo (year, 19);
	signature.doomsday = positiveModulo(2*(1-yearCoeff.saeculum) - 2*yearCoeff.quadriannum + yearCoeff.annum, 7);
	signature.easterResidue = positiveModulo (15 + 19*gold 	// Julian element
	+ 3*yearCoeff.quadrisaeculum + yearCoeff.saeculum 	// Metemptose
	- Math.floor ((8*(4*yearCoeff.quadrisaeculum + yearCoeff.saeculum) + 13) / 25 ) // Proemptose, Zeller computation
	, 30);
	signature.epact = positiveModulo (23 - signature.easterResidue, 30);
	signature.easterResidue -= Math.floor( (gold + 11*signature.easterResidue) / 319 );
	signature.easterOffset = 1 + signature.easterResidue + positiveModulo(6 - signature.easterResidue - signature.doomsday, 7);
	return signature;
}
function milesianSignature (year) {
	var
		yearParams = { 	// Decompose a Milesian year figure for doomsday and Easter computus.
			timeepoch : -800, 
			coeff : [
			  {cyclelength : 3200, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "era"},
			  {cyclelength : 400, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "quadrisaeculum"}, 
			  {cyclelength : 100, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "saeculum"},
			  {cyclelength : 4, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "quadriannum"}, 
			  {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "annum"}
			],
			canvas : [
				{name : "era", init : 0},
				{name : "quadrisaeculum", init : 0},
				{name : "saeculum", init : 0},
				{name : "quadriannum", init : 0},
				{name : "annum", init : 0}
			]
			},
			signature = {  // Result for this function
			doomsday : 0, 	// John Conway's Doomsday or key day for computing weekdays: 0th March.
			epact : 0, 		// Milesian epact: mean moon age at 7:30 (a.m.) one day before 1 1m.
			annualResidue : 0,	// 29.5 minus Milesian epact
			easterResidue : 0, // Number of days from 30 3m to (milesian modified) computus 14th moon day.
			easterOffset : 0, // Number of days from 30 3m to Easter Sunday.
			},
			yearCoeff = cbcceDecompose (year, yearParams),
			gold = positiveModulo (year, 19),
			doomhour = new Date (0);
		doomhour.setUTCHours (7); doomhour.setUTCMinutes (30); doomhour.setTimeFromMilesian (year, 0, 0); 
		signature.doomsday = positiveModulo (-yearCoeff.era + 2*(1-yearCoeff.saeculum) - 2*yearCoeff.quadriannum + yearCoeff.annum, 7);
		signature.epact = Math.round(doomhour.getCEMoonDate().age*2)/2; 	// Milesian epact is a half-integer 
		signature.annualResidue = 29.5 - signature.epact;
		signature.easterResidue = positiveModulo (15 + 19*gold 			// Julian element, minus 
		+ yearCoeff.era*25 + 3*(yearCoeff.quadrisaeculum) + yearCoeff.saeculum - 6 // Metemptose, including era impact; -6 because centuries are counted from -800
		- Math.floor ((8*(32*yearCoeff.era + 4*yearCoeff.quadrisaeculum + yearCoeff.saeculum - 8) + 13) / 25 ) // Proemptose, modified Zeller computation
		, 30);
		signature.easterResidue -= Math.floor( (gold + 11*signature.easterResidue) / 319 );
		signature.easterOffset =  1 + signature.easterResidue + positiveModulo(6 - signature.easterResidue - signature.doomsday, 7);
	return signature;
}

/* The Calendar Shift Cycle Computation Engine (CCCE)
// 
// Character set is UTF-8
//
// This package perform similar functions to CalendarCycleComputationEngine 
// except that it is adapted to calendar which "shift" the intercalation year by one on a regular basis.
// This version is particularly usefull for the extended French Revolutionary calendar
// for which a longer ("sextile") year occur ordinarly every 4 year, but sometimes after 5 years, building 33 years cycles.
// the rank of a day within a year, and then hours, minutes, seconds and milliseconds.
//
// Note: This package must be used together with Calendar Cycle Computation Engine.
//
// Version 1 : M2017-12-23
// Version 1: tested for the French Revolutionary calendar
//
*//////////////////////////////////////////////////////////////////////////////////////////////
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
*////////////////////////////////////////////////////////////////////////////////
//
// Parameter object structure: same as in Calendar Cycle Computation Engine. 
//
/* Parameter object structure. Replace # with numbers or literals.
var decomposeParameterExample = {
	timeepoch : #, origin time in milliseconds (or in the suitable unit) to be used for the decomposition, with respect to 1/1/1970 00:00 UTC.
	coeff : [ // This array holds the coefficient used to decompose a time stamp into time cycles like eras, quadrisaeculae, centuries etc.
		{cyclelength : #, //length of the cycle, expressed in milliseconds.
		ceiling : #, // Infinity, or the maximum number of cycles of this size minus one in the upper cycle; 
				// the last cycle may hold a different number of subcycles.
		subCycleShift : #, number (-1, 0 or +1) to add to the ceiling of the cycle of the next level when the ceiling is reached at this level.
			// For instance: the 128-year larger cycle holds three 33-year plus one 29-years subcycle: set -1; 
			// The 33 years cycle is 8 franciades, 7 of 4 years and 1 of 5 years : +1.
			// The 29 years cycle is (8-1) franciades, 6 of 4 years and the last one of 5 years, use +1 as well.
		multiplier : #, // multiplies the number of cycle of this level to convert into target units.
		target : #, // the unit (e.g. "year") of the decomposition element at this level. 
		} ,
		{ // similar elements at the lower cycle level 
		} // end of array element
	], // End of this array, but not end of object
	canvas : [ // this last array is the canvas of the decomposition , e.g. "year", "month", "date", with suitable properties at each level.
		{ name : #, // the name of the property at this level, which must match one target property of the coeff component,
		init : #, // value of this component at epoch, and lowest value (except for the first component), e.g. 0 for month, 1 for date, 0 for hours, minutes, seconds.
		} // End of array element (only two properties)
	] // End of second array
}	// End of object.

// Constraints: 
//	1. 	The cycles and the canvas elements shall be definined from the larger to the smaller 
//		e.g. (for French Revolutionary calendar): 33 years cycle, then Franciade (4 to 5 years), then years, the month etc.
//	2. 	The same names shall be used for the "coeff" and the "canvas" properties, otherwise applications may return "NaN".
//
*/		
/////////////////////////////////////////////
// csceDecompose : from time serie figure to decomposition
///////////////////////////////////////////// 
function csceDecompose (quantity, params) { // from a chronological number, build an compound object holding the elements as required by cparams.
  quantity -= params.timeepoch; // set quantity to decompose into cycles to the right value.
  var result = new Object(); // Construct intitial result 
  for (let i = 0; i < params.canvas.length; i++) {	// Define property of result object (a date or date-time)
    Object.defineProperty (result, params.canvas[i].name, {enumerable : true, writable : true, value : params.canvas[i].init});
  }
  let addCycle = 0; 	// flag that upper cycle has one element more or less (5 years franciade or 13 months luni-solar year)
  for (let i = 0; i < params.coeff.length; ++i) {	// Perform decomposition by dividing by the successive cycle length
    let r = 0; // r is the computed quotient for this level of decomposition
    if (params.coeff[i].cyclelength == 1) r = quantity; // avoid performing a trivial divison by 1.
    else {		// at each level, search at the same time the quotient (r) and the modulus (quantity)
      while (quantity < 0) {
        --r; 
        quantity += params.coeff[i].cyclelength;
      }
	  let ceiling = params.coeff[i].ceiling + addCycle;
      while ((quantity >= params.coeff[i].cyclelength) && (r < ceiling)) {
        ++r; 
        quantity -= params.coeff[i].cyclelength;
      }
	  addCycle = (r == ceiling ? params.coeff[i].subCycleShift : 0); // if at "intercalation" section, add or substract possibly 1 to the ceiling of next cycle
    }
    result[params.coeff[i].target] += r*params.coeff[i].multiplier; // add result to suitable part of result array	
  }	
  return result;
}
////////////////////////////////////////////
// csceCompose: from compound object to time serie figure.
////////////////////////////////////////////
function csceCompose (cells, params) { // from an object cells structured as params.canvas, compute the chronological number
	var quantity = params.timeepoch ; // initialise Unix quantity to computation epoch
	for (let i = 0; i < params.canvas.length; i++) { // cells value shifted as to have all 0 if at epoch
		cells[params.canvas[i].name] -= params.canvas[i].init
	}
//	Unlike ccceCompose, decomposition is top-down. 
	let currentTarget = params.coeff[0].target; 	// Set to uppermost unit used for date (year, most often)
	let currentCounter = cells[params.coeff[0].target];	// This counter shall hold the successive remainders
	let addCycle = 0; 	// This flag says whether there is an additionnal period at end of cycle, e.g. a 5th year in the Franciade
	for (let i = 0; i < params.coeff.length; i++) {
		let f = 0;				// Number of "target" values (number of years, to begin with)
		if (currentTarget != params.coeff[i].target) {	// If we go to the next level (e.g. year to month), reset variables
			// if (currentCounter != 0) alert ("Error csceCompose, i, currentCounter: ", i, currentCounter); // Debug only
			currentTarget = params.coeff[i].target;
			currentCounter = cells[currentTarget];
		}
		let ceiling = params.coeff[i].ceiling + addCycle;
		while (currentCounter < 0) {
			--f;
			currentCounter += params.coeff[i].multiplier;
		}
		while ((currentCounter >= params.coeff[i].multiplier) && (f < ceiling)) {
			++f;
			currentCounter -= params.coeff[i].multiplier;
		}
		addCycle = (f == ceiling) ? params.coeff[i].subCycleShift : 0;
		quantity += f * params.coeff[i].cyclelength;
	}
	return quantity ;	
} 
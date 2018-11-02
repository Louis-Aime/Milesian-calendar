/* The Cycle-based Calendar Computation Engine/ CBCCE
Character set is UTF-8

The functions of this package perform intercalation computations for calendars that set intercalation elements following regular cycles.
This applies to the Milesian calendar, that adds or subtracts intercalary days only at end of cycles (sequences of years, of months etc.).
This applies also to calendars that shift the long year by one at cyclic periods 
e.g. the long year comes after 5 years instead of 4 years in certain circumstances.
A possible algorithmic implementation of the French Revolutionary "Franciade" uses such cycles.
For other calendars, including Gregorian and Julian, this routines may be used to compute
the rank of a day within a "shifted year" where the intercalary day is at end of year, and then hours, minutes, seconds and milliseconds.
Computations of months for non-Milesian solar calendars require separate algorithms, as the cycle of month is generally not regular.
The principles of these routines are explained in "L'heure milésienne", a book by Louis-Aimé de Fouquières, www.calendriermilesien.org.

Contents:
	Chronos: a set of useful calendar constants, the number of milliseconds in a second, minute, hour and day.
	cbcceDecompose (quantity, params) : object containing the elements of the date in the target calendar
		quantity:  a Posix time stamp to be converted into a complete date
		params : the parameter object of the target calendar
	cbcceCompose (cells, params) : Posix time stamp corresponding to the UTC date expressed in a calendar 
		cells: the numeric elements of the expressed date
		params : the parameter object of the target calendar
Versions:
	Version 1 : M2017-06-26
		This version is an extension of the original "Calendar Cycle Computation Engine" and replaces it.
	Version 2 : M2018-05-28
		Comments enhanced
	Version 3 : M2018-11-02
		Catch case where the time stamp passed to cbcceDecompose is "NaN"
	Version 4 : M2018-11-11
		Extract Day_milliseconds (not used, still available in another file)
		JSDoc comments
*/
/* Copyright Miletus 2016-2018 - Louis A. de Fouquières
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
/** Parameter object structure. Replace # with numbers or literals.
 * var decomposeParameterExample = {
 *	timeepoch : #, // origin time in milliseconds (or in the suitable unit) to be used for the decomposition, with respect to 1/1/1970 00:00 UTC.
 *	coeff : [ // This array holds the coefficient used to decompose a time stamp into time cycles like eras, quadrisaeculae, centuries etc.
 * 		{cyclelength : #, 	// length of the cycle, expressed in milliseconds.
 *		ceiling : #, 		// Infinity, or the maximum number of cycles of this size minus one in the upper cycle; 
 *							// the last cycle may hold an intercalary unit.
 *		subCycleShift : #, 	// number (-1, 0 or +1) to add to the ceiling of the cycle of the next level when the ceiling is reached at this level.
 *		multiplier : #, 	// multiplies the number of cycles of this level to convert into target units.
 *		target : #, 		// the unit (e.g. "year") of the decomposition element at this level. 
 *		} ,					// end of cycle description
 *		{ 		// similar elements at a lower cycle level 
 *		} 		// end of cycle description
 *	], // End of this array, but not end of object
 *	canvas : [ // this last array is the canvas of the decomposition , e.g. "year", "month", "date", with suitable properties at each level.
 *		{ name : #,	// the name of the property at this level, which must match one target property of the coeff component,
 *		init : #, 	// value of this component at epoch, and lowest value (except for the first component), 
 *					// e.g. 0 for month, 1 for date, 0 for hours, minutes, seconds.
 *		} // End of array element (only two properties)
 *	] // End of second array
 * }	// End of object.
*/
/** Constraints: 
 *	1. 	The cycles and the canvas elements shall be defined from the largest to the smallest
 *		e.g. four-century, then century, then four-year, then year, etc.
 *	2. 	The same names shall be used for the "coeff" and the "canvas" properties, otherwise functions shall give erroneous results.
*/
/** Set of constants used in calendar computations with Unix/Posix time stamps
 * @member {number} DAY_UNIT number of ms in one day
 * @member {number} HOUR_UNIT number of ms in one hour
 * @member {number} MINUTE_UNIT number of ms in one minute
 * @member {number} SECOND_UNIT number of ms in one second
*/
var Chronos = { 
  DAY_UNIT : 86400000, 
  HOUR_UNIT : 3600000,
  MINUTE_UNIT : 60000,
  SECOND_UNIT : 1000
}
/** Build a compound object from a time stamp holding the elements as required by a given cycle hierarchy model.
 * @param {number} quantity: a time stamp representing the date to convert.
 * @param {Object} params: the representation of the calendar structure and its connection to the time stamp.
 * @returns {Object} the calendar elements in the structure that params prescribes.
*/
function cbcceDecompose (quantity, params) {
  if (!isNaN (quantity)) quantity -= params.timeepoch; // set at initial value the quantity to decompose into cycles. Else leave NaN.
  var result = new Object(); // Construct initial compound result 
  for (let i = 0; i < params.canvas.length; i++) {	// Define property of result object (a date or date-time)
    Object.defineProperty (result, params.canvas[i].name, {enumerable : true, writable : true, value : params.canvas[i].init});
  }
  let addCycle = 0; 	// flag that upper cycle has one element more or less (i.e. a 5 years franciade or 13 months luni-solar year)
  for (let i = 0; i < params.coeff.length; ++i) {	// Perform decomposition by dividing by the successive cycle length
    if (isNaN(quantity)) 
		result[params.coeff[i].target] = NaN	// Case where time stamp is not a number, e.g. out of bounds.
	else {
		let r = 0; 		// r is the computed quotient for this level of decomposition
		if (params.coeff[i].cyclelength == 1) r = quantity; // avoid performing a trivial division by 1.
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
		  addCycle = (r == ceiling) ? params.coeff[i].subCycleShift : 0; // if at last section of this cycle, add or subtract 1 to the ceiling of next cycle
		}
		result[params.coeff[i].target] += r*params.coeff[i].multiplier; // add result to suitable part of result array	
	}
  }	
  return result;
}
/** Compute the time stamp from the element of a date in a given calendar.
 * @param {Object} cells: the numeric elements of the date.
 * @param {Object} params: the representation of the calendar structure and its connection to the time stamp.
 * @returns {number} the time stamp
*/
function cbcceCompose (cells, params) { // from an object cells structured as params.canvas, compute the chronological number
	var quantity = params.timeepoch ; // initialise Unix quantity to computation epoch
	for (let i = 0; i < params.canvas.length; i++) { // cells value shifted as to have all 0 if at epoch
		cells[params.canvas[i].name] -= params.canvas[i].init
	}
	let currentTarget = params.coeff[0].target; 	// Set to uppermost unit used for date (year, most often)
	let currentCounter = cells[params.coeff[0].target];	// This counter shall hold the successive remainders
	let addCycle = 0; 	// This flag says whether there is an additional period at end of cycle, e.g. a 5th year in the Franciade or a 13th month
	for (let i = 0; i < params.coeff.length; i++) {
		let f = 0;				// Number of "target" values (number of years, to begin with)
		if (currentTarget != params.coeff[i].target) {	// If we go to the next level (e.g. year to month), reset variables
			currentTarget = params.coeff[i].target;
			currentCounter = cells[currentTarget];
		}
		let ceiling = params.coeff[i].ceiling + addCycle;	// Ceiling of this level may be increased 
															// i.e. Franciade is 5 years if at end of upper cycle
		while (currentCounter < 0) {	// Compute f, number of cycles of this level. Cells[currentTarget] may hold a negative figure.
			--f;
			currentCounter += params.coeff[i].multiplier;
		}
		while ((currentCounter >= params.coeff[i].multiplier) && (f < ceiling)) {
			++f;
			currentCounter -= params.coeff[i].multiplier;
		}
		addCycle = (f == ceiling) ? params.coeff[i].subCycleShift : 0;	// If at end of this cycle, the ceiling of the lower cycle may be increased or decreased.
		quantity += f * params.coeff[i].cyclelength;				// contribution to quantity at this level.
	}
	return quantity ;	
}
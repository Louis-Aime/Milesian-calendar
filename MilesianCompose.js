/* Milesian Compose and decompose routines.
// Character set is UTF-8
//
// The function of this package performs decompositions suitable to calendar computations.
// The Milesian calendar, given its regulars month, is able to use totally this principle.
// For other calendars, including Gregorian and Julian, this routines may be used to compute
// the rank of a day within a year, and then hours, minutes, seconds and milliseconds.
// Computations on months require more specific algorithms.
// The principles of these routines are explained in "L'heure milésienne",
// a book by Louis-Aimé de Fouquières.
*//////////////////////////////////////////////////////////////////////////////////////////////
/* Copyright Miletus 2016-2017 - Louis A. de Fouquières
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
/* Parameter object structure. Replace # with numbers or literals.
const decomposeParameterExample = {
	timeepoch : #, origin time in milliseconds (or in the suitable unit) to be used for the decomposition, with respect to 1/1/1970 00:00 UTC.
	coeff : [ // This array holds the coefficient used to decompose a time stamp into time cycles like eras, quadrisaeculae, centuries etc.
		{cyclelength : #, //length of the cycle, expressed in milliseconds.
		ceiling : #, // Infinity, or the maximum number of cycles of this size in the upper cycle; the last cycle may hold an intercalary unit.
		multiplier : #, // multiplies the number of cycle of this level to convert into target units.
		targer : #, // the unit (e.g. "year") of the decomposition element at this level. 
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
*/
var // A selection of composition objects
// Former Unix_Day_Time_Coeff
Day_milliseconds = { 	// To convert a time or a duration to and from days + milliseconds in day.
	timeepoch : 0, 
	coeff : [ // to be used with a Unix timestamp in ms. Decompose into days and milliseconds in day.
	  {cyclelength : 86400000, ceiling : Infinity, multiplier : 1, target : "day_number"}, 
	  {cyclelength : 1, ceiling : Infinity, multiplier : 1, target : "milliseconds_in_day"}
	],
	canvas : [
		{name : "day_number", init : 0},
		{name : "milliseconds_in_day", init : 0},
	]
} ,
Milesian_time_params = { // To be used with a Unix timestamp in ms. Decompose into Milesian years, months, date, hours, minutes, seconds, ms
	timeepoch : -188395804800000, // Unix timestamp of 1 1m -4000 00h00 UTC in ms
	coeff : [ 
	  {cyclelength : 100982160000000, ceiling : Infinity, multiplier : 3200, target : "year"},
	  {cyclelength : 12622780800000, ceiling : Infinity, multiplier : 400, target : "year"},
	  {cyclelength : 3155673600000, ceiling :  3, multiplier : 100, target : "year"},
	  {cyclelength : 126230400000, ceiling : Infinity, multiplier : 4, target : "year"},
	  {cyclelength : 31536000000, ceiling : 3, multiplier : 1, target : "year"},
	  {cyclelength : 5270400000, ceiling : Infinity, multiplier : 2, target : "month"},
	  {cyclelength : 2592000000, ceiling : 1, multiplier : 1, target : "month"}, 
	  {cyclelength : 86400000, ceiling : Infinity, multiplier : 1, target : "date"},
	  {cyclelength : 3600000, ceiling : Infinity, multiplier : 1, target : "hours"},
	  {cyclelength : 60000, ceiling : Infinity, multiplier : 1, target : "minutes"},
	  {cyclelength : 1000, ceiling : Infinity, multiplier : 1, target : "seconds"},
	  {cyclelength : 1, ceiling : Infinity, multiplier : 1, target : "milliseconds"}
	],
	canvas : [ 
		{name : "year", init : -4000},
		{name : "month", init : 0},
		{name : "date", init : 1},
		{name : "hours", init : 0},
		{name : "minutes", init : 0},
		{name : "seconds", init : 0},
		{name : "milliseconds", init : 0},
	]
} ,
//
// Former Milesian_date_coeff and canvas
//
Milesian_date_JD_params = {  // To be used with a timestamp in integer days. Decomposes into year, month, date.
	timeepoch : 260081, // 1 1m -4000 in Julian Day
	coeff : [
		  {cyclelength : 1168775, ceiling : Infinity, multiplier : 3200, target : "year"},
		  {cyclelength : 146097, ceiling : Infinity, multiplier : 400, target : "year"},
		  {cyclelength : 36524, ceiling :  3, multiplier : 100, target : "year"},
		  {cyclelength : 1461, ceiling : Infinity, multiplier : 4, target : "year"},
		  {cyclelength : 365, ceiling : 3, multiplier : 1, target : "year"},
		  {cyclelength : 61, ceiling : Infinity, multiplier : 2, target : "month"},
		  {cyclelength : 30, ceiling : 1, multiplier : 1, target : "month"}, 
		  {cyclelength : 1, ceiling : Infinity, multiplier : 1, target : "date"}
	],
	canvas : [ // Timestamp is 0 on 1 1m -4000, month is in the JS way (0 to 11), date starts at 1.
		{name : "year", init : -4000},
		{name : "month", init : 0},
		{name : "date", init : 1}
	]
} ,
CE_Moon_params = { // to be used with a Unix timestamp in ms. Decompose into moon years, moon months and moon age.
	timeepoch : -62167873955000, // from the mean new moon of 3 1m 0 at 10:07:25 Terrestrial Time.
	coeff : [ 
		 {cyclelength : 30617314500, ceiling : Infinity, multiplier : 1, target : "year"}, // this cycle length is 12 mean lunar months
		 {cyclelength : 2551442875, ceiling : Infinity, multiplier : 1, target : "month"}, // this cycle length is one mean lunar month
		 {cyclelength : 86400000, ceiling : Infinity, multiplier : 1, target : "age"},
		 {cyclelength : 1, ceiling : Infinity, multiplier : 1.157407407E-8, target : "age"}
	], 
	canvas : [
		{name : "year", init : 0},
		{name : "month", init : 0},
		{name : "age", init : 0}
	]
} ,
Lunar_Year_Month_Params = { // to be used in order to change lunar calendar epoch, without changing lunar age.
// Usage of this parameter set: change between Common Era and Hegirian moon calendar, 7688 lunar month offset.
	timeepoch : 0, // put the timeepoch in the parameter call.
	coeff : [
		{cyclelength : 12, ceiling : Infinity, multiplier : 1, target : "year"},
		{cyclelength : 1,  ceiling : Infinity, multiplier : 1, target : "month"}
	],
	canvas : [
		{name : "year", init :0},
		{name : "month", init : 0}		
	]
}
/////////////////////////////////////////////
// milesianDecompose : from time serie figure to decomposition
///////////////////////////////////////////// 
function milesianDecompose (quantity, params) { // from a chronological number, build an compound object holding the elements as required by cparams.
  quantity -= params.timeepoch; // set quantity to decompose into cycles to the right value.
  var result = new Object(); // Construct intitial result 
  for (let i = 0; i < params.canvas.length; i++) {
    Object.defineProperty (result, params.canvas[i].name, {enumerable : true, writable : true, value : params.canvas[i].init});
  }
  for (let i = 0; i < params.coeff.length; ++i) {
    let r = 0; // r is computed quotient for this level of decomposition
    if (params.coeff[i].cyclelength == 1) r = quantity; // avoid performing a trivial divison by 1.
    else {
      while (quantity < 0) {
        --r; 
        quantity += params.coeff[i].cyclelength;
      }
      while ((quantity >= params.coeff[i].cyclelength) && (r < params.coeff[i].ceiling)) {
        ++r; 
        quantity -= params.coeff[i].cyclelength;
      }
    }
    result[params.coeff[i].target] += r*params.coeff[i].multiplier; // add result to suitable part of result array	
  }	
  return result;
}
////////////////////////////////////////////
// milesianCompose: from compound object to time serie figure.
////////////////////////////////////////////
function milesianCompose (cells, params) { // from an object structured as params.canvas, compute the chronological number
	var quantity = params.timeepoch ; // initialise quantity
	for (let i = 0; i < params.canvas.length; i++) { // cells value shifted as to have all 0 if at epoch
		cells[params.canvas[i].name] -= params.canvas[i].init
	}
	for (let i = params.coeff.length-1; i >= 0; --i) { // consolidate from small to large
		let factor = (params.coeff[i].multiplier == 1 ? params.coeff[i].cyclelength :
		params.coeff[i].cyclelength - 
									(params.coeff[i+1].cyclelength * params.coeff[i].multiplier / params.coeff[i+1].multiplier )
									);
		quantity += Math.floor(cells[params.coeff[i].target] / params.coeff[i].multiplier) * factor;
	}
	return quantity ;	
}
/* Day_milliseconds : a very simple example of CBCCE canvas.
Versions
	M2018-11-11: extracted from original CBCCE file
Contents
	Day_milliseconds, a CBCCE parameter object
*/
var
/**
 * @description conversion from Posix timestamp to days + milliseconds in day, and the reverse, with CBCCE
*/
Day_milliseconds = { 	// To convert a time or a duration to and from days + milliseconds in day.
	timeepoch : 0, 
	coeff : [ // to be used with a Unix timestamp in ms. Decompose into days and milliseconds in day.
	  {cyclelength : 86400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "day_number"}, 
	  {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "milliseconds_in_day"}
	],
	canvas : [
		{name : "day_number", init : 0},
		{name : "milliseconds_in_day", init : 0},
	]
}
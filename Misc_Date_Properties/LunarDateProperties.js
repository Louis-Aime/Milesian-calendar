/* Lunar Date properties
Character set is UTF-8
This code, to be manually imported, set properties representing lunar phases to object Date
Versions 
	M2017-12-26 replace CalendarCycleComputationEngine with CBCCE.
	M2018-05-28 enhanced comments and add a more lunar calendar functions
	M2018-10-26 fix typos
Required:
	Package CBCCE is used.
Contents: methods for Date.prototype
	getDeltaT : an estimate of DeltaT, defined as: UTC = TT - DeltaT. UTC is former GMT, 
		TT is Terrestrial Time, a uniform time scale defined with a second defined independently from Earth movements.
		DeltaT is erratic and difficult to compute, however, the general trend of DeltaT is due to the braking  of the Earth's daily revolution.
		This estimate of Delta T in seconds from the year expressed in Common Era is: -20 + 32 v², where v = (A – 1820) / 100.
		In this version, Delta T is computed from a fractional value of the time. The result is rounded to the nearest second.
	getCEMoonDate : the date expressed in mean Moon coordinates, i.e. lunar year, lunar month, decimal moon day, lunar hour shift.
		Common Era Moon date year 0, month 0, age 0 is : 3 1m 0 at 10h 07 mn 25 s UTC. 
	getCELunarDate: the Moon date at 0h UTC at this calendar date.
	getHegirianMoonDate : same as above, with Hegirian epoch i.e. 6 8m 621 14h 7 mn 48s, so that first evening of first moon month of year 1 is 26 7m 622.
	getHegirianLunarDate : the Hegirian date at 0h UTC at this calendar date. 
	getLunarTime (timezone offset in mins, the caller's by default) : gives lunar time (H, m, s). 
		At a given lunar time, the mean moon is at the same azimut as the sun at this (solar) time.
	getDraconiticHeight : a very rough estimate of the height of the moon (-5° to +5°). 
		When height is around 0 at new or full moon, eclipse is possible.
	There is no setter function in this package.
*/////////////////////////////////////////////////////////////////////////////////////////////
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
/*
1. Basic tools of this package
*/
// Import CalendarCycleComputationEngine, or make visible. 
var
CE_Moon_params = { // to be used with a Unix timestamp in ms. Decompose into moon years, moon months and fractional moon age.
	timeepoch : -62167873955000, // from the mean new moon of 3 1m 0 at 10:07:25 Terrestrial Time.
	coeff : [ 
		 {cyclelength : 30617314500, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "year"}, // this cycle length is 12 mean lunar months
		 {cyclelength : 2551442875, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}, // this cycle length is one mean lunar month
		 {cyclelength : 86400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "age"},		// one day
		 {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1.157407407E-8, target : "age"}	// one millisecond
	], 
	canvas : [
		{name : "year", init : 0},
		{name : "month", init : 0},
		{name : "age", init : 0}
	]
} ,
CE_Lunar_params = { // to be used with a Unix timestamp in ms. Decompose into moon years, moon months, integer moon age, and milliseconds
	timeepoch : -62167873955000, // from the mean new moon of 3 1m 0 at 10:07:25 Terrestrial Time.
	coeff : [ 
		 {cyclelength : 30617314500, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "year"}, // this cycle length is 12 mean lunar months
		 {cyclelength : 2551442875, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}, // this cycle length is one mean lunar month
		 {cyclelength : 86400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "date"},		// one day
		 {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "time"}	// one millisecond
	], 
	canvas : [
		{name : "year", init : 0},
		{name : "month", init : 0},
		{name : "date", init : 1},
		{name : "time", init : 0}
	]
} ,
Lunar_Year_Month_Params = { // to be used in order to change lunar calendar epoch, without changing lunar age.
// Usage of this parameter set: change between Common Era and Hegirian moon calendar, 7688 lunar month offset.
	timeepoch : 0, // put the timeepoch in the parameter call.
	coeff : [
		{cyclelength : 12, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "year"},
		{cyclelength : 1,  ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}
	],
	canvas : [
		{name : "year", init :0},
		{name : "month", init : 0}		
	]
}, 
Draconitic_Params = { // to estimate the heighth of the moon. Around 0 at New Moon or Full Moon means possibility of eclipse
	timeepoch : 993094200000, // An approximate date of mean moon at 0, rising on its draconitic cycle 
			// Proposition #1 : 993094200000 (2001-06-21T03:30Z) after a paper of Patrick Rocher (IMCCE 2005). This value is estimated form a plot.
			// Proposition #2 : (tbc)
	coeff : [
		{cyclelength : 2351135835, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "cycle"}, // the length of the draconitic cycle
		{cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "phase"},		
		],
	canvas : [
		{name : "cycle", init :0},
		{name : "phase", init : 0}		
		]
}
//
// 2. Properties added to Date object
//
Date.prototype.getDeltaT = function () { // This function is "smoothed", i.e. computed from the exact value of date. The result are by quanta of one second.
	const JULIAN_CENTURY_UNIT = 36525 * 86400000;	
	var origin = new Date (1820, 0, 1) // 1 January 1820
	let century = (this.getTime() - origin.getTime()) / JULIAN_CENTURY_UNIT;
	return Math.round(century*century*32 - 20) * Chronos.SECOND_UNIT; // Result as an integer number of seconds.	
}
Date.prototype.getCEMoonDate = function () {	// The complete moon date coordinate at this date. Moon day may change during a calendar day.
	return cbcceDecompose (this.getTime()+this.getDeltaT(), CE_Moon_params);
}
Date.prototype.getCELunarDate = function () {	// The lunar date coordinate at this date, 0h UTC
	let refDate = new Date (this.valueOf());
	refDate.setUTCHours(0,0,0,0);	// Set to same UTC date at 0h
	return cbcceDecompose (refDate.getTime()+refDate.getDeltaT(), CE_Lunar_params);
}
Date.prototype.getHegirianMoonDate = function () {
	const HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET = 7688 ; 
	let moonDate = cbcceDecompose (this.getTime()+this.getDeltaT(), CE_Moon_params);
	let age = moonDate.age ;
	moonDate = cbcceDecompose (cbcceCompose (moonDate, Lunar_Year_Month_Params) - HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET, Lunar_Year_Month_Params);
	return { 'year' : moonDate.year , 'month' : moonDate.month , 'age' : age};
}
Date.prototype.getHegirianLunarDate = function () {
	const HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET = 7688 ; 
	let refDate = new Date (this.valueOf());
	refDate.setUTCHours(0,0,0,0);	// Set to same UTC date at 0h
	let moonDate = cbcceDecompose (refDate.getTime()+refDate.getDeltaT(), CE_Lunar_params);
	let lDate = moonDate.date;
	moonDate = cbcceDecompose (cbcceCompose (moonDate, Lunar_Year_Month_Params) - HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET, Lunar_Year_Month_Params);
	return { 'year' : moonDate.year , 'month' : moonDate.month , 'date' : lDate}
}
Date.prototype.getLunarTime = function (timeZone = this.getTimezoneOffset()) { // Shift local time to lunar time. You may specify another time zone in minutes
	let timeOffset = this.getCEMoonDate().age * Chronos.DAY_UNIT * Chronos.DAY_UNIT / CE_Moon_params.coeff[1].cyclelength;
    let fakeDate = cbcceDecompose (this.getTime() - timeZone * Chronos.MINUTE_UNIT - timeOffset, Milesian_time_params);
	return {hours : fakeDate.hours, minutes : fakeDate.minutes, seconds : fakeDate.seconds};
}
Date.prototype.getLunarDateTime = function (timeZone = this.getTimezoneOffset()) { // Shift local time to lunar time. You may specify another time zone in minutes
	// Each of the Sun's (mean) position on the Ecliptic circle is identified with the number of days since Summer solstice: 0 to 364.
	const 	yearCycle = 31557600000,		// Duration of a year (365,25 days) in milliseconds
			sideralMoonCycle = 2360594880 ; // Sideral cycle of the Moon (27,3217 days) in milliseconds 		
	let thisAge = this.getCEMoonDate().age;
	let dayOffset = (thisAge * yearCycle / sideralMoonCycle) % yearCycle;	
		// The number of days to add to the date of new moon, to obtain the date where the Sun shall be at the Moon's present position on the Ecliptic
	let fakeDate = cbcceDecompose (this.getTime() + Math.round((dayOffset - thisAge) * Chronos.DAY_UNIT), Milesian_time_params);
	let timeOffset = thisAge * Chronos.DAY_UNIT * Chronos.DAY_UNIT / CE_Moon_params.coeff[1].cyclelength;
    let fakeTime = cbcceDecompose (this.getTime() - timeZone * Chronos.MINUTE_UNIT - timeOffset, Milesian_time_params);
	return {month: fakeDate.month, date: fakeDate.date, hours : fakeTime.hours, minutes : fakeTime.minutes, seconds : fakeTime.seconds};
}
Date.prototype.getDraconiticHeight = function () {
	let moonDraconitic = cbcceDecompose (this.getTime() + this.getDeltaT(), Draconitic_Params);
	let alpha = 2*Math.PI*moonDraconitic.phase/Draconitic_Params.coeff[0].cyclelength
	return 5 * Math.sin (alpha);
}

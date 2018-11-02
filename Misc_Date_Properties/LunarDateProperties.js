/* Lunar Date properties
Character set is UTF-8
This code, to be manually imported, set properties representing lunar phases to object Date
Versions 
	M2017-12-26 replace CalendarCycleComputationEngine with CBCCE.
	M2018-05-28 enhanced comments and add a more lunar calendar functions
	M2018-10-26 fix typos
	M2018-11-10 new value for draconitic cycle, found in Wikipedia
	M2018-11-12 JSdoc comments + add dacronitic routines
Required:
	Package CBCCE.
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
/** CBCCE parameters to be used with a Unix timestamp in ms. Decompose into moon years, moon months and fractional moon age.
* Reference date is 3 1m 0 at 10:07:25 Terrestrial Time, using the quadratic estimation of Delta T.
*/
CE_Moon_params = { // 
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
/** CBCCE parameters to be used with a Unix timestamp in ms. Decompose into moon years, moon months, integer moon age, and milliseconds
* Reference date is 3 1m 0 at 10:07:25 Terrestrial Time, using the quadratic estimation of Delta T.
*/
CE_Lunar_params = {
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
/** CBCCE parameters to be used in order to change lunar calendar epoch, without changing lunar age.
* Usage of this parameter set: change between Common Era and Hegirian moon calendar, 7688 lunar month offset.
* timeepoch base is 0.
*/
Lunar_Year_Month_Params = {
	timeepoch : 0, 
	coeff : [
		{cyclelength : 12, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "year"},
		{cyclelength : 1,  ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}
	],
	canvas : [
		{name : "year", init :0},
		{name : "month", init : 0}		
	]
}, 
/** CBCCE parameters to be used  to estimate the height of the moon. Around 0 at New Moon or Full Moon means possibility of eclipse.
 * @todo Find and source a 0 value.
*/
Draconitic_Params = { //
	timeepoch : 993094200000, // An approximate date of mean moon at 0, rising on its draconitic cycle 
			// Proposition #1 : 993094200000 (2001-06-21T03:30Z) after a paper of Patrick Rocher (IMCCE 2005). This value is estimated form a plot.
			// Proposition #2 : (tbc)
	coeff : [
		{cyclelength : 2351135879, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "cycle"}, // the length of the draconitic cycle
			// varia : 2351135835 (after Patrick Rocher)
		{cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "phase"} // one milliseconds		
		],
	canvas : [
		{name : "cycle", init :0},
		{name : "phase", init : 0}		
		]
}
/*
 2. Properties added to Date object
*/
/** Compute an estimate of Delta T, defined as: UTC = TT - Delta T. The estimate is only the quadratic part of Delta T.
 * @method getDeltaT
 * @param {Date} the date where Delta T is estimated (estimation is per exact date, not per year)
 * return {number} Delta T, an integer signed number of seconds
*/
Date.prototype.getDeltaT = function () { 
	const JULIAN_CENTURY_UNIT = 36525 * 86400000;	
	var origin = new Date (1820, 0, 1) // 1 January 1820
	let century = (this.getTime() - origin.getTime()) / JULIAN_CENTURY_UNIT;
	return Math.round(century*century*32 - 20) * Chronos.SECOND_UNIT; // Result as an integer number of seconds.	
}
/** The complete moon date coordinate at this date and time UTC. Moon age may change during a calendar day. 
 * Origin morning of 3 1m 000
 * an adjustement to Terrestrial Time (TT) is applied
 * @method getCEMoonDate
 * @return {{year: number, month: number, age: number}}
*/
Date.prototype.getCEMoonDate = function () {	// 
	return cbcceDecompose (this.getTime()+this.getDeltaT(), CE_Moon_params);
}
/** The lunar "common era" calendar date coordinate at this date, 0h UTC. First day of this calendar is 4 1m 000 
 * First day of this lunar calendar is on 4 1m 000, and is expressed day 1 month 1 year 0.
 * an adjustement to Terrestrial Time (TT) is applied
 * @method getCELunarDate
 * @return {{year: number, month: number, date: number (1 to 30), time: number of milliseconds}}
*/
Date.prototype.getCELunarDate = function () {	// The lunar date coordinate at this date, 0h UTC
	let refDate = new Date (this.valueOf());
	refDate.setUTCHours(0,0,0,0);	// Set to same UTC date at 0h
	return cbcceDecompose (refDate.getTime()+refDate.getDeltaT(), CE_Lunar_params);
}
/** The complete moon date coordinate at this date and time UTC. Moon age may change during a calendar day. 
 * Origin evening of 25 7m 622
 * an adjustement to Terrestrial Time (TT) is applied
 * @method getHegirianMoonDate
 * @return {{year: number, month: number, date: number (1 to 30), time: number of milliseconds}}
*/Date.prototype.getHegirianMoonDate = function () {
	const HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET = 7688 ; 
	let moonDate = cbcceDecompose (this.getTime()+this.getDeltaT(), CE_Moon_params);
	let age = moonDate.age ;
	moonDate = cbcceDecompose (cbcceCompose (moonDate, Lunar_Year_Month_Params) - HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET, Lunar_Year_Month_Params);
	return { 'year' : moonDate.year , 'month' : moonDate.month , 'age' : age};
}
/** The lunar "mean" Hegirian calendar date coordinate at this date, 0h UTC. 
 * First day of this lunar calendar is on 26 7m 622, and is expressed day 1 month 1 year 1.
 * It corresponds to 1 9 641 of CE lunar calendar
 * an adjustement to Terrestrial Time (TT) is applied
 * @method getHegirianLunarDate
 * @return {{year: number, month: number, date: number (1 to 30), time: number of milliseconds}}
*/
Date.prototype.getHegirianLunarDate = function () {
	const HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET = 7688 ; 
	let refDate = new Date (this.valueOf());
	refDate.setUTCHours(0,0,0,0);	// Set to same UTC date at 0h
	let moonDate = cbcceDecompose (refDate.getTime()+refDate.getDeltaT(), CE_Lunar_params);
	let lDate = moonDate.date;
	moonDate = cbcceDecompose (cbcceCompose (moonDate, Lunar_Year_Month_Params) - HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET, Lunar_Year_Month_Params);
	return { 'year' : moonDate.year , 'month' : moonDate.month , 'date' : lDate}
}
/** Lunar time is such that the moon is at the same place in the sky that the sun at this time, the same day; 
 * effects of time zone and daylight saving time rules are taken into account
 * @method getLunarTime
 * @param {number} timeZoneOffset - Offset from UTC due to time zone, in minutes, by default system time zone offset
 * @return {{hours: number, minutes: number, seconds: number}} the lunar time
*/
Date.prototype.getLunarTime = function (timeZoneOffset = this.getTimezoneOffset()) { 
	let timeOffset = this.getCEMoonDate().age * Chronos.DAY_UNIT * Chronos.DAY_UNIT / CE_Moon_params.coeff[1].cyclelength;
    let fakeDate = cbcceDecompose (this.getTime() - timeZoneOffset * Chronos.MINUTE_UNIT - timeOffset, Milesian_time_params);
	return {hours : fakeDate.hours, minutes : fakeDate.minutes, seconds : fakeDate.seconds};
}
/** Lunar date and time is such that the moon is at the same place on the Ecliptic that the sun at that date and time.
 * the moon is rising for lunar dates from 1 1m to 31 6m, falling for lunar dates from 1 7m to last day of the year.
 * @method getLunarDateTime
 * @param {number} timeZoneOffset - Offset from UTC due to time zone, in minutes, by default system time zone offset
 * @return  {{month: number, date: number, hours: number, minutes: number, seconds: number}} Date + time corresponding to the Lunar date.
*/
Date.prototype.getLunarDateTime = function (timeZoneOffset = this.getTimezoneOffset()) {
	// Each of the Sun's (mean) position on the Ecliptic circle is identified with the number of days since Summer solstice: 0 to 364.
	const 	yearCycle = 31557600000,		// Duration of a year (365,25 days) in milliseconds
			sideralMoonCycle = 2360594880 ; // Sideral cycle of the Moon (27,3217 days) in milliseconds 		
	let thisAge = this.getCEMoonDate().age;
	let dayOffset = (thisAge * yearCycle / sideralMoonCycle) % yearCycle;	
		// The number of days to add to the date of new moon, to obtain the date where the Sun shall be at the Moon's present position on the Ecliptic
	let fakeDate = cbcceDecompose (this.getTime() + Math.round((dayOffset - thisAge) * Chronos.DAY_UNIT), Milesian_time_params);
	let timeOffset = thisAge * Chronos.DAY_UNIT * Chronos.DAY_UNIT / CE_Moon_params.coeff[1].cyclelength;
    let fakeTime = cbcceDecompose (this.getTime() - timeZoneOffset * Chronos.MINUTE_UNIT - timeOffset, Milesian_time_params);
	return {month: fakeDate.month, date: fakeDate.date, hours : fakeTime.hours, minutes : fakeTime.minutes, seconds : fakeTime.seconds};
}
/** Draconitic angle between the rising node of the moon and the moon itself
 * @method getDraconiticAngle
 * @return angle in decimal degrees
*/
Date.prototype.getDraconiticAngle = function () {
	return 360 * cbcceDecompose (this.getTime() + this.getDeltaT(), Draconitic_Params).phase / Draconitic_Params.coeff[0].cyclelength
}
/** Draconitic time, i.e. the time were the rising node is at same place that the sun at that time the same day.
 * @method getDraconiticTime
 * @param {number} timeZoneOffset - Offset from UTC due to time zone, in minutes, by default system time zone offset
 * @return {{hours: number, minutes: number, seconds: number}} the draconitic time
*/
Date.prototype.getDraconiticTime = function (timeZoneOffset = this.getTimezoneOffset()) {
	let timeOffset = // get time angle of the draconitic rise node with respect to the mean moon in ms
		cbcceDecompose (this.getTime() + this.getDeltaT(), Draconitic_Params).phase * Chronos.DAY_UNIT / Draconitic_Params.coeff[0].cyclelength 
		// Deduct moon time, for a shift with respect to the sun
		- this.getCEMoonDate().age * Chronos.DAY_UNIT * Chronos.DAY_UNIT / CE_Moon_params.coeff[1].cyclelength;
    let fakeDate = cbcceDecompose (this.getTime() - timeZoneOffset * Chronos.MINUTE_UNIT + timeOffset, Milesian_time_params);
	return {hours : fakeDate.hours, minutes : fakeDate.minutes, seconds : fakeDate.seconds};
}
/** Rough estimation of Draconitic height
 * @method getDraconiticHeight
 * @return {number} a rough estimate of the height of the Moon with respect to the Ecliptic circle, in degrees
*/
Date.prototype.getDraconiticHeight = function () { 
	let alpha = 2*Math.PI* cbcceDecompose (this.getTime() + this.getDeltaT(), Draconitic_Params).phase / Draconitic_Params.coeff[0].cyclelength
	return 5 * Math.sin (alpha);
}

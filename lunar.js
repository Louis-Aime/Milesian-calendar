/* Lunar computations for calendars
Character set is UTF-8
Lunar characteristics for calendrical clocks
Contents: 
	MoonDate : a collection of numeric constants for the Moon (not exported ?)
	class moonCalend: a class of calendars that takes Delta T into account.
		astroDate is a legacy date shifted by Delta T
	const Lunar: a collection of function and object for computing lunar dates and simplified coordinates.
			TT is Terrestrial Time, a uniform time scale defined with a second defined independently from Earth movements.
			DeltaT is erratic and difficult to compute, however, the general trend of DeltaT is due to the braking  of the Earth's daily revolution.
			This estimate of Delta T in seconds from the year expressed in Common Era is: -20 + 32 v², where v = (A – 1820) / 100.
			In this version, Delta T is computed from a fractional value of the time. The result is rounded to the nearest second.
		getCEMoonDate : the date expressed in mean Moon coordinates, i.e. lunar year, lunar month, decimal moon day, lunar hour shift.
			Common Era Moon date year 0, month 0, age 0 is : 3 1m 0 at 10h 07 mn 25 s UTC. 
		getCELunarDate: the Moon date at 0h UTC at this calendar date.
		getHegirianMoonDate : same as above, with Hegirian epoch i.e. 6 8m 621 14h 7 mn 48s, so that first evening of first moon month of year 1 is 26 7m 622.
		getHegirianLunarDate : the Hegirian date at 0h UTC at this calendar date. 
		getLunarTime (timezone offset in milliseconds, the caller's system defautl by default) : gives lunar time (H, m, s). 
			At a given lunar time, the mean moon is at the same azimut as the sun at this (solar) time.
		DEPRECATE getDraconiticAngle : Angle between Draco and moon in degrees
		DEPRECATE getDraconiticSunTimeAngle : Angle between Draco and the sun, in milliseconds
		DEPRECATE getDraconiticTime : local time where ascending node is at place of sun the same day
		DEPRECATE getDraconiticHeight : a very rough estimate of the height of the moon (-5,145° to +5,145°). 
			When height is around 0 at new or full moon, eclipse is possible.
		getDraconiticNodes : dates in same year where sun is aligned or opposite with lunar nodes.
		There is no setter function in this package.
*/
/* Version	M2021-08-01 Group lunar data and organise Draconitic data
	M2021-07-29 import getDeltaT (through aggregates)
	M2021-07-26 adapt to new module architecture
	M2021-03-11	Update formula for average Delta D after Morrison and Stephenson 2021, and draconitic data
	M2021-02-15	Use as module, with calendrical-javascript modules
	M2021-01-06 adapt to new chronos
	M2020-12-29 Embedd in one object
	M2020-12-29 
		Use new Chronos object (now Cbcce)
		Use ExtDate object
	M2020-01-12 : strict mode
	M2019-07-27 : adapt to getRealTZmsOffset located in another package
	M2018-11-16 : adapt to TZ in ms rather than in mn
	M2018-11-12 : JSdoc comments + add dacronitic routines
	M2018-11-10 : new value for draconitic cycle, found in Wikipedia
	M2018-10-26 : fix typos
	M2018-05-28 : enhanced comments and add a more lunar calendar functions
	M2017-12-26 : replace names.
*/
/* Copyright Miletus 2016-2021 - Louis A. de Fouquières
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
/* Requires: 
	Milliseconds object
	class Cbcce, 
	class ExtDate,
	class MilesianCalendar
	getDeltaT function
*/
"use strict";
import { getDeltaT } from './aggregate-all.js';
import {Cbcce, Milliseconds} from './aggregate-all.js';
import {ExtDate} from './aggregate-all.js';
import {MilesianCalendar} from './aggregate-all.js';
const milesian = new MilesianCalendar ("moonmilesian");	// no pldr needed
/*	1. A class for computations using Terrestrial Time
*/
class astroCalend {		// Calendrical computations with adjustement to Terrestrial Time (TT). For astronomical cycles.
	constructor (params) {
		this.clockwork = new Cbcce ( params )
	}
	astroDate = function (theDate) { 
		return this.clockwork.getObject (theDate.getTime() + getDeltaT(theDate))
	}
}
/*	2. Astronomical data used with the Cycle Based Calendar Computation Engine (CBCCE)
*/
const CbcceParam = {
	HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET : 7688, 
	/** CBCCE parameters for the tropical year. 
	*/
	Tropical_year_params : {
		timeepoch : 945820800000,	// Convention: 1 1m 2000 0 h UTC (22/12/1999). Solstice took place at 7 h 43.
		coeff : [
			 {cyclelength : 31556925250, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "year"}, // one tropical year in 2000.
			 {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "phase"}	// one millisecond
		],
		canvas : [
			{name : "year", init :0},
			{name : "phase", init : 0}
		]
	},
	/** CBCCE parameters to be used with a Unix timestamp in ms. Decompose into moon years, moon months and fractional moon age.
	* Reference date is 3 1m 0 at 10:07:25 Terrestrial Time, using the quadratic estimation of Delta T.
	*/
	CE_Moon_params : { // 
		timeepoch : -62167873955000, // from the mean new moon of 3 1m 0 at 10:07:25 Terrestrial Time.
		coeff : [ 
			 {cyclelength : 30617314500, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "year"}, // this cycle length is 12 mean lunar months
			 {cyclelength : 2551442875, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}, // this cycle length is one mean lunar month
			 {cyclelength : 86400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "age"},		// one day
			 {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1.157407407E-8, target : "age"}	// one millisecond
		], 
		canvas : [
			{name : "year", init : 0},
			{name : "month", init : 1},
			{name : "age", init : 0}
		]
	},
	/** CBCCE parameters to be used with a Unix timestamp in ms. Decompose into moon years, moon months, integer moon age, and milliseconds
	* Reference date is 3 1m 0 at 10:07:25 Terrestrial Time, using the quadratic estimation of Delta T.
	*/
	CE_Lunar_params : {
		timeepoch : -62167873955000, // from the mean new moon of 3 1m 0 at 10:07:25 Terrestrial Time.
		coeff : [ 
			 {cyclelength : 30617314500, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "year"}, // this cycle length is 12 mean lunar months
			 {cyclelength : 2551442875, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}, // this cycle length is one mean lunar month
			 {cyclelength : 86400000, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "day"},		// one day
			 {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "time"}	// one millisecond
		], 
		canvas : [
			{name : "year", init : 0},
			{name : "month", init : 1},
			{name : "day", init : 1},
			{name : "time", init : 0}
		]
	} ,
	/** CBCCE parameters to be used with a Unix timestamp in ms. Decompose into moon month, and phase in milliseconds
	* Reference date is 3 1m 0 at 10:07:25 Terrestrial Time, using the quadratic estimation of Delta T.
	*/
	Moon_Phase_params : {
		timeepoch : -62167873955000, // from the mean new moon of 3 1m 0 at 10:07:25 Terrestrial Time.
		coeff : [ 
			 {cyclelength : 2551442875, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}, // this cycle length is one mean lunar month
			 {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "phase"}	// in milliseconds
		], 
		canvas : [
			{name : "month", init : 0},
			{name : "phase", init : 0}
		]
	} ,
	/** CBCCE parameters to be used in order to change lunar calendar epoch, without changing lunar age.
	* Usage of this parameter set: change between Common Era and Hegirian moon calendar, 7688 lunar month offset.
	* timeepoch base is 0.
	*/
	Lunar_Year_Month_Params : {
		timeepoch : 0, 
		coeff : [
			{cyclelength : 12, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "year"},
			{cyclelength : 1,  ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}
		],
		canvas : [
			{name : "year", init :0},
			{name : "month", init : 1}
		]
	}, 
	/** CBCCE parameters to be used for the Draconitic position of the Moon.
	 * @todo Find and source a 0 value.
	*/
	Lunar_Draconitic_Params : { //
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
	},
	/** CBCCE parameters for the Draconitic cycle with respect to the tropical year
	*/
	Solar_Draconitic_Params : { 
		timeepoch : 1296734400000,	// M2011-02-15 12h An approximate date of caput draconis at winter solstice.
		coeff : [
			{cyclelength : 585600065921, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "tropicsaros"}, // one pseudo-saros or one cycle on the ecliptic		
			{cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "phase"} // one milliseconds		
			],
		canvas : [
			{name : "tropicsaros", init :0},
			{name : "phase", init : 0}
			]
	},
	/** Conversion from Posix timestamp to days + milliseconds in day, and the reverse, with CBCCE
	*/
	Day_milliseconds : { 	// To convert a time or a duration to and from days + milliseconds in day.
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
}
/*	3. The routine grouped in a single object that can become a module.
*/
export const Lunar = {
	/* 3.1. Class instantiations
	*/
	TropicalCalend : new astroCalend (CbcceParam.Tropical_year_params),	// Analyse an instant as coordinates on the tropical year.
	CEMoon : new astroCalend (CbcceParam.CE_Moon_params), // Lunar year, month (1..12), decimal age.
	CELunar : new astroCalend (CbcceParam.CE_Lunar_params), // Lunar year, month (1..12), day, time in day in ms.
	MoonPhase : new astroCalend (CbcceParam.Moon_Phase_params), // Lunar month, moon phase in ms.
	Draco : new astroCalend (CbcceParam.Lunar_Draconitic_Params), // Draconitic cycle, Draconitic phase in ms.
	SolarDraco : new astroCalend (CbcceParam.Solar_Draconitic_Params),
	LunarCalend : new Cbcce (CbcceParam.Lunar_Year_Month_Params), // (Lunar_year; month) <> lunar_month
	DayMSCalend : new Cbcce (CbcceParam.Day_milliseconds),	// Timestamp <> (Day;  ms)
	/* 3.2. User functions
	*/
	/** getTropicalDate: the date in the tropical cycle
	*/
	getTropicalDate (theDate) {
		return this.TropicalCalend.astroDate (theDate);
	},
	/** getCEMoonDate: The complete moon date coordinate at this date and time UTC. Moon age may change during a calendar day. 
	 * Origin morning of 3 1m 000
	 * an adjustement to Terrestrial Time (TT) is applied
	 * @param (Date) UTC date of computation
	 * @return {{year: integer, month: integer, age: number}} age is a decimal figure
	*/
	getCEMoonDate (theDate) {	// 
		return this.CEMoon.astroDate (theDate);
	},
	/** The lunar Milesian era calendar date coordinate at this date, 0h UTC. First day of this calendar is 4 1m 000 
	 * First day of this lunar calendar is on 4 1m 000, and is expressed day 1 month 1 year 0.
	 * an adjustement to Terrestrial Time (TT) is applied
	 * @param (Date) UTC date of computation
	 * @return {{year: number, month: number, date: integer number (1 to 30), time: number of milliseconds}}
	*/
	getCELunarDate (theDate) {	// The lunar date coordinate at this date, 0h UTC
		let refDate = new Date (theDate.valueOf());
		refDate.setUTCHours(0,0,0,0);	// Set to same UTC date at 0h
		return this.CELunar.astroDate (refDate);
	},
	/** The complete moon date coordinate at this date and time UTC. Moon age may change during a calendar day. 
	 * Origin evening of 25 7m 622
	 * an adjustment to Terrestrial Time (TT) is applied
	 * @param (Date) UTC date of computation
	 * @return {{year: number, month: number, date: number (1 to 30), time: number of milliseconds}}
	*/
	getHegirianMoonDate (theDate) {
		let moonDate = CEMoon.astroDate (theDate);
		let age = moonDate.age ;
		moonDate = this.LunarCalend.getObject (this.LunarCalend.getNumber (moonDate) - CbcceParam.HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET);
		return { 'year' : moonDate.year , 'month' : moonDate.month , 'age' : age};
	},
	/** The lunar "mean" Hegirian calendar date coordinate at this date, 0h UTC. 
	 * First day of this lunar calendar is on 26 7m 622, and is expressed day 1 month 1 year 1.
	 * It corresponds to 1 9 641 of CE lunar calendar
	 * an adjustment to Terrestrial Time (TT) is applied
	 * @param (Date) UTC date of computation
	 * @return {{year: number, month: number, date: number (1 to 30), time: number of milliseconds}}
	*/
	getHegirianLunarDate (theDate) { 
		let moonDate = this.getCELunarDate (theDate); //cbcceDecompose (refDate.getTime()+refDate.getDeltaT(), CE_Lunar_params);
		let lunarDay = moonDate.day;
		moonDate = this.LunarCalend.getObject (this.LunarCalend.getNumber (moonDate) - CbcceParam.HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET);
		return { 'year' : moonDate.year , 'month' : moonDate.month , 'day' : lunarDay}
	},
	/** getLunarTime was deprecated. Take time section of getLunarDateTime. is such that the moon is at the same place in the sky that the sun at this time, the same day; 
	*/
	/** Angle between the moon position and the sun position.
	 * @method LunarSunTimeAngle
	 * @return {number} delay to add to current time in order to get lunar time
	*/
	getLunarSunTimeAngle (theDate) {
		let msOffset = 
			- Math.round(Milliseconds.DAY_UNIT * this.MoonPhase.astroDate (theDate).phase / CbcceParam.Moon_Phase_params.coeff[0].cyclelength);
		return this.DayMSCalend.getObject (msOffset).milliseconds_in_day ; 
	},
	/** Lunar date and time is such that the moon is at the same place on the Ecliptic that the sun at that date and time.
	 * the moon is rising for lunar dates from 1 1m to 31 6m, falling for lunar dates from 1 7m to last day of the year.
	 * @method getLunarDateTime
	 * @param (Date) UTC date of computation
	 * @param {number} timeZoneOffset - Offset from UTC due to time zone, in milliseconds, by default system time zone offset
	 * @return  {{month: number, date: number, hours: number, minutes: number, seconds: number}} Date + time corresponding to the Lunar date.
	*/
	getLunarDateTime (theDate, timeZoneOffset = theDate.getRealTZmsOffset()) {
		// Each of the Sun's (mean) position on the Ecliptic circle is identified with the number of days since Winter solstice: 0 to 364.
		const 	yearCycle = 31557600000,		// Duration of a year (365,25 days) in milliseconds
				sideralMoonCycle = 2360594880 ; // Sideral cycle of the Moon (27,3217 days) in milliseconds 		
		let thisAge = this.getCEMoonDate(theDate).age;
		let dayOffset = (thisAge * yearCycle / sideralMoonCycle) % yearCycle;	
			// The number of days to add to the date of new moon, to obtain the date where the Sun shall be at the Moon's present position on the Ecliptic
		let fakeDate = new ExtDate (milesian, theDate.getTime() + Math.round((dayOffset - thisAge) * Milliseconds.DAY_UNIT)).getFields("UTC");
		let timeOffset = thisAge * Milliseconds.DAY_UNIT * Milliseconds.DAY_UNIT / CbcceParam.CE_Moon_params.coeff[1].cyclelength;
		let fakeTime = new ExtDate (milesian, theDate.getTime() - timeZoneOffset - timeOffset).getFields("UTC");
		return {month: fakeDate.month, day: fakeDate.day, hours : fakeTime.hours, minutes : fakeTime.minutes, seconds : fakeTime.seconds};
	},
	/** Draconitic angle between the rising node of the moon and the moon itself // DEPRECATE
	 * @param (Date) UTC date of computation
	 * @return {number} angle in decimal degrees
	*/
	getDraconiticAngle (theDate) {
		return 360 * this.Draco.astroDate (theDate).phase / CbcceParam.Lunar_Draconitic_Params.coeff[0].cyclelength
	},
	/** Draconitic time angle between the rising node of the moon and the sun	// DEPRECATE
	 * @param (Date) UTC date of computation
	 * @return {number} delay to add to current time in order to get Draconitic time
	*/
	getDraconiticSunTimeAngle (theDate) {
		return Math.round 
		 (Milliseconds.DAY_UNIT * this.Draco.astroDate (theDate).phase / CbcceParam.Lunar_Draconitic_Params.coeff[0].cyclelength)
		 + this.getLunarSunTimeAngle(theDate)
	},
	/** Rough estimation of Draconitic height // DEPRECATE
	 * @param (Date) UTC date of computation
	 * @return {number} a rough estimate of the height of the Moon with respect to the Ecliptic circle, in degrees
	*/
	getDraconiticHeight (theDate) {
		const MEANINCLINATION = 5.145; 	// mean inclination of the lunar orbit in degrees
		let alpha = 2*Math.PI* this.Draco.astroDate (theDate).phase / CbcceParam.Lunar_Draconitic_Params.coeff[0].cyclelength
		return MEANINCLINATION * Math.sin (alpha);
	},
	/** Estimate position of caput draconis at this date, and of cauda draconis, as two Milesian dates in same year (time of day is not estimated)
	 * @param (Date) theDate: from where I want the estimate
	 * @return (Array) two dates, caput draconis and cauda draconis in same year.
	*/
	getDraconiticNodes (theDate) {
		const 
			YEAR = CbcceParam.Tropical_year_params.coeff[0].cyclelength,
			HALF_YEAR = Math.floor (YEAR / 2),
			DRACO_CYCLE = CbcceParam.Solar_Draconitic_Params.coeff[0].cyclelength,
			DRACO_RADIUS = 18 * Milliseconds.DAY_UNIT;
		let 
			milesianYear = new ExtDate(milesian, theDate.valueOf()).year() + 1,
			// year = TropicalCalend.astroDate(theDate).year,
			draco = Lunar.SolarDraco.astroDate(theDate),	// two fields + 'phase'
			yearPhase = Math.floor (draco.phase * YEAR / DRACO_CYCLE),
			yearReference = new ExtDate (milesian); // cannot use Temporal.PlainDate.from() yet 
		yearReference.setFromFields({year : milesianYear, month : 1, day : 5} ,'UTC');	// UTC newyear instant + 5 days is always after solstice
		let
			solstitial = Lunar.TropicalCalend.astroDate (yearReference), // distance between newyear + 5 days instant and (mean) solstice.
			caputDate = new ExtDate (milesian, yearReference.valueOf() - yearPhase - solstitial.phase),
			caudaOffset = (caputDate.month <= 6 ? HALF_YEAR : - HALF_YEAR),
			caudaDate = new ExtDate (milesian, caputDate.valueOf() + caudaOffset),
			eclipseSeason = Math.abs(theDate.valueOf() - caputDate.valueOf()) <= DRACO_RADIUS || Math.abs(theDate.valueOf() - caudaDate.valueOf()) <= DRACO_RADIUS;
		return [ caputDate, caudaDate, eclipseSeason ]
	}
}


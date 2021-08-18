/* Lunar computations for calendars
Character set is UTF-8
Lunar characteristics for calendrical clocks
Contents: 
	class astroCalend: a class of calendars that gives results in Terrestrial Time (TT), using the (imported) DeltaT function.
	const AstroParam : a collection of constants and objects with constant values for the computations of this module.
	const Lunar: a collection of function and object for computing lunar dates and simplified coordinates. Most often, parameter is a Date object.
		getTemperedDate : the date expressed in mean calendar year + phase in ms. 
		getCEMoonDate : the date expressed in mean Moon coordinates, i.e. lunar year, lunar month, decimal moon day, lunar hour shift.
			Common Era Moon date year 0, month 0, age 0 is : 3 1m 0 at 10h 07 mn 25 s UTC. 
		getCELunarDate: the Moon date at 0h UTC at this calendar date.
		getHegirianMoonDate : same as above, with Hegirian epoch i.e. 6 8m 621 14h 7 mn 48s, so that first evening of first moon month of year 1 is 26 7m 622.
		getHegirianLunarDate : the Hegirian date at 0h UTC at this calendar date. 
		getLunarSunTimeAngle : angle between Sun and Moon, in order to compute a "Moon time"
			At a given lunar time, the mean moon is at the same azimut as the sun at this (solar) time.
		getLunarDateTime : date and time that correspond to the moon's position in the sky and with respect to the time zone
		getDraconiticNodes : dates in same year where sun is aligned or opposite with lunar nodes.
		With AstroCalend, a setter function is provided. No other setter function is provided in this package.
*/
/* Version	M2021-08-28: 
		Correct usage of Delta T; was wrongly used/
		Set Draco parameters after studying the referential of eclipses: no false negative.
	M2021-08-26 Tune Draco parameters (probably not last attempt)
	M2021-08-20	Refer to deltat instead of aggregate, isolate internal functions.
	M2021-08-06	Tune Draco on a small sample of eclipses.
	M2021-08-01 Group lunar data and organise Draconitic data, update comments
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
/* Requires (imported): 
	Milliseconds object,
	class Cbcce, 
	class ExtDate,
	class MilesianCalendar,
	getDeltaT function
*/
"use strict";
import { default as getDeltaT } from './deltat.js';
import { default as Milliseconds } from './time-units.js';
import {Cbcce} from './chronos.js';
import {default as ExtDate} from './extdate.js';
import {MilesianCalendar} from './calendars.js';
const milesian = new MilesianCalendar ("moonmilesian");	// no pldr needed
/*	1. A class for computations using Terrestrial Time
*/
class astroCalend {		// Computations of astronomical cycles using Terrestrial Time (TT) and conversion to UTC (Greenwich clock time) by Delta T adjustement. 
	// UTC = TT - Delta T, and TT = UTC + Delta T
	// astroCoordinates gives the astronomical coordinates at an UTC date. This date is first converted to a TT instant.
	constructor (params) {
		this.clockwork = new Cbcce ( params )
	}
	astroCoordinates = function (theDate, TZ="UTC") {
		// Subtracting getRealTZmsOffset converts the wallclock time into UTC, in such a way that lunar dates change when dates change locally.
		// theDate is an UTC date. It is converted into a TT date before decomposing into astronomical cycle.
		return this.clockwork.getObject (theDate.getTime() - theDate.getRealTZmsOffset(TZ) + getDeltaT(theDate))
	}
	UTCDate = function (theFields, TZ="UTC") {
		// The date of an astronominal event (lunar or other) is first computed as a TT instant, then converted into an UTC date-time, and finally shifted as local time if necessary.
		let instant = this.clockwork.getNumber (theFields),
			myDate = new ExtDate ("iso8601", instant);
		return new Date (instant - getDeltaT (myDate) + myDate.getRealTZmsOffset(TZ))
	}
}
/*	2. Astronomical data used with the Cycle Based Calendar Computation Engine (CBCCE)
*/
const
	HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET = 7688,
	YEAR = 31556952000, 	// Length of a mean year used as UTC time reference, here the Gregorian mean year
	HALF_YEAR = YEAR / 2,
	TEMPERED_YEAR_REF = 945820800000,	// Convention: 1 1m 2000 0 h UTC (22/12/1999). 
	MEAN_LUNAR_YEAR = 30617314500,	// the length of 12 lunar months.
	MEAN_LUNAR_MONTH = 2551442875,	// the length of a mean lunar month.
	MEAN_SIDERAL_MOON_MONTH = 2360594880,	// One mean sideral moon month (27,3217 days).
	NEW_MOON_REF = -62167873955000,	// Mean new moon of 3 1m 0 at 10:07:25 Terrestrial Time.
	CAPUT_DRACONIS_REF = 1297296000000,	// 22 2m 2011 00:00 UTC, date of caput draconis at begin of cycle, synchro at  the Gregorian year of origin 1 1m 2000.
	DRACO_CYCLE = 587355840000,	// Time for the dragon to make a complete revolution up to the same mean Gregorian place. Estimated from farest eclipses to 6798,1 days.
	DRACO_RADIUS = 21.1 * Milliseconds.DAY_UNIT,	// the half-length of each "eclipse season", each side of the caput or the cauda.
	/** CBCCE parameters for the time counter in year + phase. 
	*/
	Tempered_year_params = {
		timeepoch : TEMPERED_YEAR_REF,
		coeff : [
			 {cyclelength : YEAR , ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "year"}, // one regular year, always the same duration.
			 {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "phase"}	// one millisecond
		],
		canvas : [
			{name : "year", init : 2000},
			{name : "phase", init : 0}
		]
	},
	/** CBCCE parameters to be used with a Unix timestamp in ms. Decompose into moon years, moon months and fractional moon age.
	* Reference date is 3 1m 0 at 10:07:25 Terrestrial Time, using the quadratic estimation of Delta T.
	*/
	CE_Moon_params = { // 
		timeepoch : NEW_MOON_REF,
		coeff : [ 
			 {cyclelength : MEAN_LUNAR_YEAR, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "year"}, // this cycle length is 12 mean lunar months
			 {cyclelength : MEAN_LUNAR_MONTH, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}, // this cycle length is one mean lunar month
			 {cyclelength : Milliseconds.DAY_UNIT, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "age"},		// one day
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
	CE_Lunar_params = {
		timeepoch : NEW_MOON_REF, 
		coeff : [ 
			 {cyclelength : MEAN_LUNAR_YEAR, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "year"}, // this cycle length is 12 mean lunar months
			 {cyclelength : MEAN_LUNAR_MONTH, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}, // this cycle length is one mean lunar month
			 {cyclelength : Milliseconds.DAY_UNIT, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "day"},		// one day
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
	Moon_Phase_params = {
		timeepoch : NEW_MOON_REF,
		coeff : [ 
			 {cyclelength : MEAN_LUNAR_MONTH, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "month"}, // this cycle length is one mean lunar month
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
	Lunar_Year_Month_Params = {
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
	/** CBCCE parameters for the Draconitic cycle with respect to the reference year
	*/
	Solar_Draconitic_Params = { 
		timeepoch : CAPUT_DRACONIS_REF,
		coeff : [
			{cyclelength : DRACO_CYCLE, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "cycle"}, // one cycle of Draco on the ecliptic		
			{cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "phase"} // one milliseconds		
			],
		canvas : [
			{name : "cycle", init : 0},
			{name : "phase", init : 0}
			]
	},
	/** Conversion from Posix timestamp to days + milliseconds in day, and the reverse, with CBCCE
	*/
	Day_milliseconds = { 	// To convert a time or a duration to and from days + milliseconds in day.
		timeepoch : 0, 
		coeff : [ // to be used with a Unix timestamp in ms. Decompose into days and milliseconds in day.
		  {cyclelength : Milliseconds.DAY_UNIT, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "day_number"}, 
		  {cyclelength : 1, ceiling : Infinity, subCycleShift : 0, multiplier : 1, target : "milliseconds_in_day"}
		],
		canvas : [
			{name : "day_number", init : 0},
			{name : "milliseconds_in_day", init : 0},
		]
	};
/*	3. Class instantiations
*/
const
	TemperedCalend = new astroCalend (Tempered_year_params),	// Instant expressed in (tropical_year; ms)
	CEMoon = new astroCalend (CE_Moon_params), // Lunar year, month (1..12), decimal age.
	CELunar = new astroCalend (CE_Lunar_params), // Lunar year, month (1..12), day, time in day in ms.
	MoonPhase = new astroCalend (Moon_Phase_params), // Lunar month, moon phase in ms.
	SolarDraco = new astroCalend (Solar_Draconitic_Params),	// Number of draconitic cycles since CAPUT_DRACONIS_REF, phase in cycle in ms
	LunarCalend = new Cbcce (Lunar_Year_Month_Params), // (Lunar_year; month) <> lunar_month
	DayMSCalend = new Cbcce (Day_milliseconds);	// Timestamp <> (Day;  ms)

	/* 4. Exported functions
	*/
export const Lunar = {
	/** getTemperedDate: the date in the tempered cycle
	*/
	getTemperedDate (theDate) {	// this a totally astronomical concept, no TZ.
		return TemperedCalend.astroCoordinates (theDate);
	},
	/** getCEMoonDate: The complete moon date coordinate at this date and time UTC. Moon age may change during a calendar day. 
	 * Origin morning of 3 1m 000
	 * an adjustement to Terrestrial Time (TT) is applied
	 * @param (Date) UTC date of computation
	 * @return {{year: integer, month: integer, age: number}} age is a decimal figure
	*/
	getCEMoonDate (theDate, TZ) {	// This a calendar, result depends on TZ
		return CEMoon.astroCoordinates (theDate, TZ);
	},
	/** The lunar Milesian era calendar date coordinate at this date, 0h UTC. First day of this calendar is 4 1m 000 
	 * First day of this lunar calendar is on 4 1m 000, and is expressed day 1 month 1 year 0.
	 * an adjustement to Terrestrial Time (TT) is applied
	 * @param (Date) UTC date of computation
	 * @return {{year: number, month: number, date: integer number (1 to 30), time: number of milliseconds}}
	*/
	getCELunarDate (theDate, TZ) {	// The lunar date coordinate at this date,
		let refDate = new ExtDate ("iso8601", theDate.valueOf() - theDate.getRealTZmsOffset(TZ));
		refDate.setUTCHours(0,0,0,0);	// Set to same UTC date at 0h
		return CELunar.astroCoordinates (refDate);
	},
	/** The complete moon date coordinate at this date and time UTC. Moon age may change during a calendar day. 
	 * Origin evening of 25 7m 622
	 * an adjustment to Terrestrial Time (TT) is applied
	 * @param (Date) UTC date of computation
	 * @return {{year: number, month: number, date: number (1 to 30), time: number of milliseconds}}
	*/
	getHegirianMoonDate (theDate, TZ) {
		let moonDate = CEMoon.astroCoordinates (theDate, TZ);
		let age = moonDate.age ;
		moonDate = LunarCalend.getObject (LunarCalend.getNumber (moonDate) - HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET);
		return { 'year' : moonDate.year , 'month' : moonDate.month , 'age' : age};
	},
	/** The lunar "mean" Hegirian calendar date coordinate at this date, 0h UTC. 
	 * First day of this lunar calendar is on 26 7m 622, and is expressed day 1 month 1 year 1.
	 * It corresponds to 1 9 641 of CE lunar calendar
	 * an adjustment to Terrestrial Time (TT) is applied
	 * @param (Date) UTC date of computation
	 * @return {{year: number, month: number, date: number (1 to 30), time: number of milliseconds}}
	*/
	getHegirianLunarDate (theDate, TZ) { 
		let moonDate = this.getCELunarDate (theDate, TZ); 
		let lunarDay = moonDate.day;
		moonDate = LunarCalend.getObject (LunarCalend.getNumber (moonDate) - HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET);
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
			- Math.round(Milliseconds.DAY_UNIT * MoonPhase.astroCoordinates (theDate, "UTC").phase / MEAN_LUNAR_MONTH);
		return DayMSCalend.getObject (msOffset).milliseconds_in_day ; 
	},
	/** Lunar date and time is such that the moon is at the same place on the Ecliptic that the sun at that date and time.
	 * the moon is rising for lunar dates from 1 1m to 31 6m, falling for lunar dates from 1 7m to last day of the year.
	 * @method getLunarDateTime
	 * @param (Date) Instant of computation
	 * @return (Date) Instant that corresponds to the Lunar date.
	 * Note that the time of the returned instant is the lunar time. When getting this time, DST applies following lunar Date.
	*/
	getLunarDateTime (theDate) {
		// Each of the Sun's (mean) position on the Ecliptic circle is identified with the number of days since Winter solstice: 0 to 364.
		let thisAge = this.getCEMoonDate(theDate, "UTC").age;
		// Date where the Sun shall be at the Moon's present position on the Ecliptic: add to the date of new moon a conversion of the age of moon to the SUN's cycle. 
		let lunarDate = new Date (theDate.valueOf() + Math.round((((thisAge * YEAR / MEAN_SIDERAL_MOON_MONTH) % YEAR) - thisAge) * Milliseconds.DAY_UNIT));
		// Lunar time: the time is shifted back by the moon's age, converted in the day cycle.
		let lunarTime = new Date (theDate.valueOf() - thisAge * Milliseconds.DAY_UNIT * Milliseconds.DAY_UNIT / MEAN_LUNAR_MONTH);
		lunarDate.setUTCHours (lunarTime.getUTCHours(), lunarTime.getUTCMinutes(), lunarTime.getUTCSeconds())
		return lunarDate;
	},
	/** Estimate position of caput draconis at this date, and of cauda draconis, as two Milesian dates in same year (time of day is not estimated)
	 * @param (Date) theDate: from where I want the estimate
	 * @return (Array) two dates, caput draconis and cauda draconis in same year.
	*/
	getDraconiticNodes (theDate) { // This a non-TZ concept. The date generated may be interpreted with a time-zone.
		let 
			dracoYear = theDate.getUTCFullYear() + 1, //new ExtDate(milesian, theDate.valueOf()).year("UTC") + 1,
			draco = SolarDraco.astroCoordinates(theDate),	// Draco cycle number + phase within cycle at theDate
			yearPhase = Math.floor (draco.phase * YEAR / DRACO_CYCLE),	// The phase of the Draco cycle expressed in a reference year cycle
			caputDate = new Date ( TemperedCalend.UTCDate({year : dracoYear, phase : 0}).valueOf() - yearPhase );
						// new ExtDate (milesian, TemperedCalend.UTCDate({year : dracoYear, phase : 0}) - yearPhase );
		// caputDate.setTime (caputDate.valueOf() - getDeltaT(caputDate));	// back to UTC scale.
		// Now check which side and how far caputDate is from theDate, if necessary choose a more suitable.
		let caputPos = caputDate.valueOf() - theDate.valueOf();
		if (Math.abs (caputPos) > HALF_YEAR) {
			dracoYear -= Math.sign (caputPos);	// find year where caput is nearer to theDate
			caputDate.setTime (TemperedCalend.UTCDate({year : dracoYear, phase : 0}).valueOf() - yearPhase );
			// caputDate.setTime (caputDate.valueOf() - getDeltaT(caputDate));
			caputPos = caputDate.valueOf() - theDate.valueOf();
		}
		// Choose a cauda that wraps theDate with caput
		let 
			caudaOffset = (caputPos < 0 ? HALF_YEAR : - HALF_YEAR),
			caudaDate = new Date (caputDate.valueOf() + caudaOffset),
			eclipseSeason = Math.abs(theDate.valueOf() - caputDate.valueOf()) <= DRACO_RADIUS 
						|| Math.abs(theDate.valueOf() - caudaDate.valueOf()) <= DRACO_RADIUS;
		return [ caputDate, caudaDate, eclipseSeason ]
	}
}

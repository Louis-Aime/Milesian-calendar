/* Milesian properties added to Date
// Character set is UTF-8
// This code, to be manually imported, set properties to object Date for the Milesian calendar.
// Package MilesianCompose is used.
//	getMilesianDate : the day date as a three elements object: .year, .month, .date; .month is 0 to 11. Conversion is in local time.
//  getMilesianUTCDate : same as above, in UTC time.
//  getJulianDay : the decimal Julian Day, from the UTC time.
//  getDeltaT : an estimate of DeltaT, defined as: UTC = TT - DeltaT. UTC is former GMT, 
//		TT is Terrestrial Time, a uniform time scale defined with a second defined independantly from Earth movements.
//		DeltaT is erratic and difficult to compute, however, the general trend of DeltaT is due to the braking  of the Earth's daily revolution.
// 		This estimate of Delta T from the year expressed in Common Era is: -20 + 32 v², where v = (A – 1820) / 100
// 		Caution: this function compute DeltaT from the Milesian year, not the Gregorian one !
//  getCEMoonDate : the date expressed in mean Moon coordinates, i.e. lunar year, lunar month, decimal moon day, lunar hour shift.
//  	Common Era Moon date year 0, month 0, age 0 is : 3 1m 0 at 10h 07 mn 25 s. 
//  getHegirianMoonDate : same as above, with Hergiian epoch i.e. 6 8m 621 14h 7 mn 48s, so that first evening of first moon month of year 1 is 26 7m 622.
//  getLunarTime (timezone offset in mins, the caller's by default) : gives lunar time (H, m s) by difference with the local time. You may change the time zone, 0 is UTC.
//  setTimeFromMilesian (year, month, date, hours, minutes, seconds, milliseconds) : set Time from milesian date + local hour.
//  setUTCTimeFromMilesian (year, month, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
//  toIntlMilesianDateString : return a string with the date elements in Milesian: (day) (month)"m" (year), month 1 to 12.
//  toUTCIntlMilesianDateString : same as above, in UTC time zone.
// There is no setMoonDate function.
*/////////////////////////////////////////////////////////////////////////////////////////////
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
/*// Import MilesianCompose, or make visible.
*////////////////////////////////////////////////////////////////////
var Chronos = { // Set of chronological constants used at several places in this package
  DAY_UNIT : 86400000, // One day in Unix time units
  HOUR_UNIT : 3600000,
  MINUTE_UNIT : 60000,
  SECOND_UNIT : 1000,
  JULIAN_DAY_UTC0_EPOCH_OFFSET : 210866803200000 // Julian Day 0 at 0h00 UTC.
}
//
Date.prototype.getMilesianDate = function () {
  return milesianDecompose (this.getTime() - (this.getTimezoneOffset() * Chronos.MINUTE_UNIT), Milesian_time_params);
  //ComputeMilesianArray(this.getTime() - (this.getTimezoneOffset() * Chronos.MINUTE_UNIT));
}
Date.prototype.getMilesianUTCDate = function () {
  return milesianDecompose (this.getTime(), Milesian_time_params);
  //ComputeMilesianArray(this.getTime());
}
Date.prototype.getJulianDay = function () { // From this Unix time stamp, give Julian day in decimal. This is always a UTC-based time. Integer values at 12h UTC (noon).
  return (this.getTime() + Chronos.JULIAN_DAY_UTC0_EPOCH_OFFSET - (12 * Chronos.HOUR_UNIT)) / Chronos.DAY_UNIT;
}
Date.prototype.getDeltaT = function () { // Computed after the Milesian year.
	let Y = (this.getMilesianUTCDate().year-1820);
	return (Math.round((Y*Y*32)/10000) - 20) * Chronos.SECOND_UNIT; // Computations on integer only, granularity of one year, result as an integer number of seconds.	
}
Date.prototype.getCEMoonDate = function () {
//	return ComputeMoonArray (this.getTime()+this.getDeltaT());
	return milesianDecompose (this.getTime()+this.getDeltaT(), CE_Moon_params);
}
Date.prototype.getHegirianMoonDate = function () {
	const HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET = 7688 ; 
	var moonDate = milesianDecompose (this.getTime()+this.getDeltaT(), CE_Moon_params);
	var age = moonDate.age ;
	moonDate = milesianDecompose (milesianCompose (moonDate, Lunar_Year_Month_Params) - HEGIRIAN_TO_CE_LUNAR_MONTH_OFFSET, Lunar_Year_Month_Params);
	return { 'year' : moonDate.year , 'month' : moonDate.month , 'age' : age};
//	return ComputeMoonArray (this.getTime()+this.getDeltaT(),Hegirian_Moon_params);
}
Date.prototype.getLunarTime = function (timeZone = this.getTimezoneOffset()) { // Shift local time to lunar time. You may specify another time zone in minutes
	var timeOffset = this.getCEMoonDate().age * Chronos.DAY_UNIT * Chronos.DAY_UNIT / CE_Moon_params.coeff[1].cyclelength;
    var fakeDate = milesianDecompose (this.getTime() - timeZone * Chronos.MINUTE_UNIT - timeOffset, Milesian_time_params);
	return {hours : fakeDate.hours, minutes : fakeDate.minutes, seconds : fakeDate.seconds};
}
Date.prototype.setTimeFromMilesian = function (year, month, date, 
                                               hours = this.getHours(), minutes = this.getMinutes(), seconds = this.getSeconds(),
                                               milliseconds = this.getMilliseconds()) {
  this.setTime(milesianCompose({
	  'year' : year, 'month' : month, 'date' : date, 'hours' : hours, 'minutes' : minutes + this.getTimezoneOffset(), 'seconds' : seconds,
	  'milliseconds' : milliseconds
	  }, Milesian_time_params));
    //setTimeFromMilesianAndOffset (year, month, date, hours, minutes, seconds, milliseconds, this.getTimezoneOffset() * Chronos.MINUTE_UNIT));
  return this.valueOf();
}
Date.prototype.setUTCTimeFromMilesian = function (year, month = 0, date = 1,
                                               hours = this.getHours(), minutes = this.getMinutes(), seconds = this.getSeconds(),
                                               milliseconds = this.getMilliseconds()) {
  this.setTime(milesianCompose({
	  'year' : year, 'month' : month, 'date' : date, 'hours' : hours, 'minutes' : minutes, 'seconds' : seconds,
	  'milliseconds' : milliseconds
	  }, Milesian_time_params));
   return this.valueOf();
}
Date.prototype.setTimeFromJulianDay = function (julianDay) {
	this.setTime (Math.round(julianDay*Chronos.DAY_UNIT) - Chronos.JULIAN_DAY_UTC0_EPOCH_OFFSET + 12 * Chronos.HOUR_UNIT);
  return this.valueOf();
}
Date.prototype.toIntlMilesianDateString = function () {
	var dateElements = milesianDecompose (this.getTime()- (this.getTimezoneOffset() * Chronos.MINUTE_UNIT), Milesian_time_params );
	return dateElements.date+" "+(++dateElements.month)+"m "+dateElements.year;
}
Date.prototype.toUTCIntlMilesianDateString = function () {
	var dateElements = milesianDecompose (this.getTime(), Milesian_time_params );
	return dateElements.date+" "+(++dateElements.month)+"m "+dateElements.year;
}

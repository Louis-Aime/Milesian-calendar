//////////////////////////////////////////////////////////////////////////////
// Character set of this file is UTF-8
//
// Conversion routines using the Julian Day to and from
// the Julian calendar adn the ISO week calendar. 
// Copyright Miletus 2016 - Louis A. de Fouquières
// This routines cover the Julian and ISO calendars, 
// they are mainly due to John Walker, http://www.fourmilab.ch/documents/calendar/
//
// The conversion with the Milesian calendar calls the methods added to the global Date object.
// Version 2 (2017) - only conversion routines to external calendars.
//
// These routines belong to the public domain as expressed by their original author.
// The changes here are essentially: use only an integer julian day for the computations.
//
// Computations regarding the Milesian calendar have been newly developed 
// as additional properties of the Date Javascript object.
// See www.calendriermilesien.org for details.
///////////////////////////////////////////////////////////////////////////////
//
function long_milesian_year (year) { // boolean, says whether year (milesian) is 366 days long or not.
year += 801;
return (((year % 4) == 0) && (((year % 100) != 0) || ((year % 400) == 0)) && ((year % 3200) != 0)) ; 
}
//
function milesian_to_jd (year, month, day) { // similar to gregorian_to_jd; we keep this one, direct and simple.
year = +year; month = +month; day = +day;
	year += 4000; //set to milesian year origin;
	--month;
	return (260080 + year*365 + intdiv(year,4) - intdiv(year,100) + intdiv(year,400) - intdiv(year,3200)
		+ month*30 +intdiv(month,2)) +day;	
}
//
//
function jd_to_milesian (jd){ // similar to jd_to_gregorian for the Milesian calendar. We write it with Date element.
var cc, year, month, milday = new Date();
jd = Math.round(jd); // jd must be un number;
milday.setTimeFromJulianDay(jd); 
return new Array (milday.getMilesianUTCDate().year, ++milday.getMilesianUTCDate().month, milday.getMilesianUTCDate().date);
}
//
/////////////////////Gregorian calendar
//

function leap_gregorian(year)
{
    return ((year % 4) == 0) &&
            (!(((year % 100) == 0) && ((year % 400) != 0)));
}

//  GREGORIAN_TO_JD  --  Determine Julian day number from Gregorian calendar date

var GREGORIAN_EPOCH = 1721426; //1721425.5;

function gregorian_to_jd(year, month, day)
{
    return (GREGORIAN_EPOCH - 1) +
           (365 * (year - 1)) +
           Math.floor((year - 1) / 4) +
           (-Math.floor((year - 1) / 100)) +
           Math.floor((year - 1) / 400) +
           Math.floor((((367 * month) - 362) / 12) +
           ((month <= 2) ? 0 :
                               (leap_gregorian(year) ? -1 : -2)
           ) +
           day);
}
//  JD_TO_GREGORIAN  --  Calculate Gregorian calendar date from Julian day

function jd_to_gregorian(jd) {
    var cc, wjd, depoch, quadricent, dqc, cent, dcent, quad, dquad,
        yindex, dyindex, year, yearday, leapadj;

    wjd = Math.round (jd); // Math.floor(jd - 0.5) + 0.5;
    depoch = wjd - GREGORIAN_EPOCH;
    cc = decompose_cycle (depoch, 146097);
	quadricent = cc [0]; dqc = cc[1];
    cc = decompose_cycle (dqc, 36524);
	cent = cc [0]; dcent = cc[1];
    cc = decompose_cycle (dcent, 1461);
    quad = cc [0]; dquad = cc[1];
    cc = decompose_cycle (dquad, 365);
    yindex = cc [0]; 
//	yindex = Math.floor(dquad / 365);
    year = (quadricent * 400) + (cent * 100) + (quad * 4) + yindex;
    if (!((cent == 4) || (yindex == 4))) {
        year++;
    }
    yearday = wjd - gregorian_to_jd(year, 1, 1);
    leapadj = ((wjd < gregorian_to_jd(year, 3, 1)) ? 0
                                                  :
                  (leap_gregorian(year) ? 1 : 2)
              );
    month = Math.floor((((yearday + leapadj) * 12) + 373) / 367);
    day = (wjd - gregorian_to_jd(year, month, 1)) + 1;

    return new Array(year, month, day);
}
//  ISO_TO_JULIAN  --  Return Julian day of given ISO year, week, and day

function n_weeks(weekday, jd, nthweek)
{
    var j = 7 * nthweek;

    if (nthweek > 0) {
        j += previous_weekday(weekday, jd);
    } else {
        j += next_weekday(weekday, jd);
    }
    return j;
}

function iso_to_julian(year, week, day)
{
    return day + n_weeks(0, gregorian_to_jd(year - 1, 12, 28), week);
}

//  JD_TO_ISO  --  Return array of ISO (year, week, day) for Julian day

function jd_to_iso(jd)
{
    var year, week, day;

    year = jd_to_gregorian(jd - 3)[0];
    if (jd >= iso_to_julian(year + 1, 1, 1)) {
        year++;
    }
    week = Math.floor((jd - iso_to_julian(year, 1, 1)) / 7) + 1;
    day = jwday(jd);
    if (day == 0) {
        day = 7;
    }
    return new Array(year, week, day);
}

//  ISO_DAY_TO_JULIAN  --  Return Julian day of given ISO year, and day of year

function iso_day_to_julian(year, day)
{
    return (day - 1) + gregorian_to_jd(year, 1, 1);
}

//  JD_TO_ISO_DAY  --  Return array of ISO (year, day_of_year) for Julian day

function jd_to_iso_day(jd)
{
    var year, day;

    year = jd_to_gregorian(jd)[0];
    day = Math.floor(jd - gregorian_to_jd(year, 1, 1)) + 1;
    return new Array(year, day);
}

///////////////////////////// Julian calendar
//
//  JULIAN_TO_JD  --  Determine Julian day number from Julian calendar date
//
/////////////////////////////////////////////

var JULIAN_EPOCH = 1721424; //1721423.5 ;

function leap_julian(year) // changed from Fourmilab. Here years are considered "astronomical years".
{
//	return mod(year, 4) == ((year > 0) ? 0 : 3); usable with hereforementionned mod function, if using historical years.
	return ((year % 4) == 0);
}

function julian_to_jd (year, month, day) {

    /* WE DO NOT Adjust negative (B.C.) common era years to the zero-based notation we use.  */
 /*   if (year < 1) {
        year++;
    }
*/
    /* Algorithm as given in Meeus, Astronomical Algorithms, Chapter 7, page 61 */
    if (month <= 2) {
        year--;
        month += 12;
    }
	return ((Math.floor((365.25 * (year + 4716))) +
            Math.floor((30.6001 * (month + 1))) +
            day) - 1524); //1524.5
}

//  JD_TO_JULIAN  --  Calculate Julian calendar date from Julian day

function jd_to_julian(td) {
    var z, a, alpha, b, c, d, e, year, month, day;

//    td += 0.5;
    z = Math.round(td);

    a = z;
    b = a + 1524;
    c = Math.floor((b - 122.1) / 365.25);
    d = Math.floor(365.25 * c);
    e = Math.floor((b - d) / 30.6001);

    month = Math.floor((e < 14) ? (e - 1) : (e - 13));
    year = Math.floor((month > 2) ? (c - 4716) : (c - 4715));
    day = b - d - Math.floor(30.6001 * e);

    /*  If year is less than 1, subtract one to convert from
        a zero based date system to the common era system in
        which the year -1 (1 B.C.E) is followed by year 1 (1 C.E.).  */
	// LAF: I do not make this conversion

 /*   if (year < 1) {
        year--;
    }
*/
    return new Array(year, month, day);
}
// Other calendars here...
//
//
////////////////////////////////////////////////////////////
//
// Basic cycle decomposition,  i.e. division with positive divisor and positive remainder.
// If arguments (in particular divisor are not in expected range, result is set to "undefined")
//
function intdiv (argument, divisor) {  
var cycle = 0;
if ((divisor > 0) && !isNaN (argument) && !isNaN (divisor)) {
while (argument < 0) {
	argument += divisor;
	cycle--;
};
while (argument >= divisor) {
	argument -= divisor;
	cycle++;
	};
	}
	else {cycle = undefined;};
return cycle;
}
//
function mod (argument, divisor) {  // the modulus, always positive.
if ((divisor > 0) && !isNaN (argument) && !isNaN (divisor)) {
while (argument < 0) {
	argument += divisor;
};
while (argument >= divisor) {
	argument -= divisor;
	};
	}
	else {argument = undefined;};
return argument;
}
//
function decompose_cycle (argument, divisor) {
var cycle = 0;
if ((divisor > 0) && !isNaN (argument) && !isNaN (divisor)) {
while (argument < 0)  {
	argument += divisor;
	cycle--;
	};
while (argument >= divisor) {
	argument -= divisor;
	cycle++;
	};
	}
	else { cycle = undefined; argument = undefined; };
return new Array (cycle, argument);
}
//
function decompose_cycle_ceiling  (argument, divisor, ceiling) { 
// final argument is authorised to be = divisor if it is was originally equal to (ceiling * divisor)
cycle = 0;
if (!isNaN (argument) && !isNaN (divisor) && (divisor > 0) && (argument >= 0) && (argument <= ceiling * divisor)) {
ceiling--; // in practical, test is performed against ceiling - 1
while (argument >= divisor && cycle < ceiling) {
	argument -= divisor;
	cycle++;
	};
	}
	else { cycle = undefined ; argument = undefined;};
return new Array (cycle, argument);
}
//
// Basic weekdays utilities
//  JWDAY  --  Calculate day of week from Julian day

function jwday(j) {
	j = Math.round(j); // just in case, reset to an integer number value.
    return mod (++j, 7);
}
/*  WEEKDAY_BEFORE  --  Return Julian date of given weekday (0 = Sunday)
                        in the seven days ending on jd.  */

function weekday_before(weekday, jd)
{
    return jd - jwday(jd - weekday);
}

/*  SEARCH_WEEKDAY  --  Determine the Julian date for: 

            weekday      Day of week desired, 0 = Sunday
            jd           Julian date to begin search
            direction    1 = next weekday, -1 = last weekday
            offset       Offset from jd to begin search
*/

function search_weekday(weekday, jd, direction, offset)
{
    return weekday_before(weekday, jd + (direction * offset));
}

//  Utility weekday functions, just wrappers for search_weekday

function nearest_weekday(weekday, jd)
{
    return search_weekday(weekday, jd, 1, 3);
}

function next_weekday(weekday, jd)
{
    return search_weekday(weekday, jd, 1, 7);
}

function next_or_current_weekday(weekday, jd)
{
    return search_weekday(weekday, jd, 1, 6);
}

function previous_weekday(weekday, jd)
{
    return search_weekday(weekday, jd, -1, 1);
}

function previous_or_current_weekday(weekday, jd)
{
    return search_weekday(weekday, jd, 1, 0);
}

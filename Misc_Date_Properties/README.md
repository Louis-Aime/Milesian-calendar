# Misc_Date_Properties
These modules define additional methods to the JS object Date, 
which enables you to easily handle calendars or cycles that are not (yet) available from the Unicode CLDR project.
They all use packages of Basic_Commmon.

## LunarDateProperties.js: get information about mean lunar cycle
Package CBCCE is used.
* getDeltaT : an estimate of DeltaT, defined as: UTC = TT - DeltaT. UTC is former GMT, 
TT is Terrestrial Time, a uniform time scale defined with a second defined independantly from Earth movements.
DeltaT is erratic and difficult to compute, however, the general trend of DeltaT is due to the braking  of the Earth's daily revolution.
This estimate of Delta T in seconds from the year Y expressed in Common Era is: -20 + 32 v², where v = (Y – 1820) / 100. 
In this version, Delta T is computed from a fractional value of the time. 
The result is rounded to the nearest second, and may change within a year.
* getCEMoonDate : the date expressed in mean Moon coordinates, i.e. lunar year, lunar month, decimal moon day, lunar hour shift. 
The "Common Era" (CE) mean moon origin, i.e. year 0, month 0, age 0 is : year 0 month 1m day 3 at 10h 07 mn 25 s. 
* getCELunarDate : the date expressed as of a lunar calendar, with which 
each lunar month begins the UTC day after a mean new moon occurs. 
* getHegirianMoonDate : same as above, with Hegirian epoch i.e. 6 8m 621 14h 7 mn 48s, 
so that first evening of first moon month of year 1 is 26 7m 622, (julian 14 July 622).
Thus day one is 27 7m 622, julian 15 July 622, proleptic gregorian 18 July 622.
* getHegirianLunarDate : the date expressed as of a lunar calendar, with which 
each lunar month begins the UTC day after a mean new moon occurs. Calendar origin is same as Haegirian.
* getLunarTime (timezone offset in mins, the caller's by default) : gives lunar time (h, m, s). 
At a given lunar time, the mean moon is at the same azimut as the sun at this (solar) time.
* getLunarDateTime (timezone offset in mins, the caller's by default) : gives lunar date and time.
Time is as above, date reflects the moon's position on the ecliptic, the same as the sun's at this (solar) date.
* draconiticHeight : an estimate of th height of the moon (-5° to +5°). When height is around 0 at new or full moon, eclipse is possible.

There is no setter function in this package.
  
## JulianDateProperties.js: Julian calendar and Julian Day properties added to Date object
Package CBCCE is used.
* getJulianCalendarDate : the day date as a three elements object: .year, .month, .date; .month is 0 to 11. Conversion is in local time.
* getJulianCalendarUTCDate : same as above, in UTC time.
* getJulianDay : the decimal Julian Day, from the UTC time.
* setTimeFromJulianCalendar (year, month, date, hours, minutes, seconds, milliseconds) : set Time from julian calendar date + local hour.
* setUTCTimeFromJulianCalendar (year, month, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
* setTimeFromJulianDay (julianDay) : Set time from an integer or a fractionnal Julian day.
* setJulianDay (julianDay[, timeZoneOffset]) : Set date from an integer (if not, rounded) Julian day, wihtout changing time of day. Considered from the local time zone, or from the time zone offset specified in minutes.

## ISOWeekCalendarDateProperties.js: computations on ISO 8601 week calendar
Package CBCCE and MilesianDateProperties are used.
* getIsoWeekCalDate : the day date as a three elements object: .year, .week, .date; .week is 1 to 53. Conversion is in local time.
* getUTCIsoWeekCalDate : same as above, in UTC time.
* setTimeFromIsoWeekCal (year, week, date, hours, minutes, seconds, milliseconds) : set Time from ISO week calendar date + local hour.
* setUTCTimeFromIsoWeekCal (year, week, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
* toIsoWeekCalDateString : return a string with the date elements in IsoWeekCal: yyyy-www-dd
* toUTCIsoWeekCalDateString : same as above, in UTC time zone.

## FrenchRevDateProperties.js: date properties for the French revolutionary calendar
Package CBCCE is used.
* getFrenchRevDate : the day date as a three elements object: .year, .month, .date; .month is 0 to 12. Conversion is in local time.
Month 12 is for the Complementary days.
* getUTCFrenchRevDate :  same as above, in UTC time.
* setTimeFromFrenchRev (year, month, date, hours, minutes, seconds, milliseconds) : set Time from rev. calendar date + local hour.
* setUTCTimeFromFrenchRev : (year, month, date, hours, minutes, seconds, milliseconds) : same as above, from UTC
* toIntlFrenchRevDateString : return a string with the date elements in Revolutionary
* toUTCIntlFrenchRevDateString : same as above, in UTC.

## ChronologicalCountConversion.js : date prototype for chronological counts
Package CBCCE is used.
* getCount (countType) : the chronological count of a date, deemed UTC date.

Values for countType:
* "julianDay": the Julian Day, value 0 on 1 Jan. 4713 B.C. at 12:00 noon UTC.
* "modifiedJulianDay" : 2 400 000.5 days later (integer values à 00:00).
* "nasaDay" : 40 000 days after modified Julian Day.
* "sheetsCount" : 0 on 30 Dec. 1899 at 00:00.
* "MSBase" : same as "sheetsCount, and convert to the special Microsoft count with neagive numbers
* "masOSCount" : 0 on 1 Jan. 1904 at 00:00.



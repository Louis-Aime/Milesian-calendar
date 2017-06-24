# Date properties in JavaScript

These modules give new methods to the JS object Date, which enables you to easily handle calendars or cycles that are not (yet) available from the LCDR project.

## CalendarCycleComputationEngine.js : basic tools for calendar computations
The Compose and Decompose computation principle is explained in *l'Heure Milésienne* (Edilivre) by Louis-Aimé de Fouquières, p. 94 [http://www.calendriermilesien.org/l-heure-milesienne.html].
* ccceDecompose takes a date-time value in milliseconds and yields an object with the parts of a date following a decomposition canvas.
* ccceCompose takes the object and computes the corresponding date-time Unix number of milliseconds since Unix epoch.
* Chronos is a passive object with four usefull values for calendar computations:
    * DAY_UNIT : one day in Unix time units (milliseconds),
    * HOUR_UNIT : one hour in Unix time units,
    * MINUTE_UNIT : one minute,
    * SECOND_UNIT : one second. 
This function is used in all other packages of this repository.
  
## MilesianDateProperties.js: methods for the Milesian calendar.
Package CalendarCycleComputationEngine is used.
* getMilesianDate : the day date as a three elements object: .year, .month, .date; .month is 0 to 11. Conversion is in local time.
* getMilesianUTCDate : same as above, in UTC time.
* setTimeFromMilesian (year, month, date, hours, minutes, seconds, milliseconds) : set Time from milesian date + local hour.
* setUTCTimeFromMilesian (year, month, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
* toIntlMilesianDateString : return a string with the date elements in Milesian: (day) (month)"m" (year), month 1 to 12.
* toUTCIntlMilesianDateString : same as above, in UTC time zone.
* toMilesianLocaleDateString ([locale, [options]]) : return a string with date and time, according to locale and options.

## LunarDateProperties.js: get information about mean lunar cycle
Package CalendarCycleComputationEngine is used.
* getDeltaT : an estimate of DeltaT, defined as: UTC = TT - DeltaT. UTC is former GMT, 
TT is Terrestrial Time, a uniform time scale defined with a second defined independantly from Earth movements.
 DeltaT is erratic and difficult to compute, however, the general trend of DeltaT is due to the braking  of the Earth's daily revolution. This estimate of Delta T in seconds from the year expressed in Common Era is: -20 + 32 v², where v = (A – 1820) / 100. In this version, Delta T is computed from a fractional value of the time. The result is rounded to the nearest second.
* getCEMoonDate : the date expressed in mean Moon coordinates, i.e. lunar year, lunar month, decimal moon day, lunar hour shift. 
   * Common Era Moon date year 0, month 0, age 0 is : 3 1m 0 at 10h 07 mn 25 s. 
* getHegirianMoonDate : same as above, with Hergiian epoch i.e. 6 8m 621 14h 7 mn 48s, so that first evening of first moon month of year 1 is 26 7m 622, (julian 14 July 622), so day one is 27 7m 622, julian 15 July 622, proleptic gregorian 18 July 622.
* getLunarTime (timezone offset in mins, the caller's by default) : gives lunar time (H, m, s). At a given lunar time, the mean moon is at the same azimut as the sun at this (solar) time.
* draconitic_height (value of date object): an estimate of th height of the moon (-5° to +5°). When height is around 0 at new or full moon, eclipse is possible.

There is no setter function in this package.
  
## JulianDateProperties.js: Julian calendar and Julian Day properties added to Date object
Package CalendarCycleComputationEngine is used.
* getJulianCalendarDate : the day date as a three elements object: .year, .month, .date; .month is 0 to 11. Conversion is in local time.
* getJulianCalendarUTCDate : same as above, in UTC time.
* getJulianDay : the decimal Julian Day, from the UTC time.
* setTimeFromJulianCalendar (year, month, date, hours, minutes, seconds, milliseconds) : set Time from julian calendar date + local hour.
* setUTCTimeFromJulianCalendar (year, month, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
* setTimeFromJulianDay (julianDay) : Set time from an integer or a fractionnal Julian day
* setJulianDay (julianDay[, timeZoneOffset]) : Set date frome an integer (if not, rounded) julian day, wihtout changing time of day. Considered from the local time zone, or from the time zone offset specified in minutes.

## ISOWeekCalendarDateProperties.js: computations on ISO 8601 week calendar
Package CalendarCycleComputationEngine and MilesianDateProperties are used.
* getIsoWeekCalDate : the day date as a three elements object: .year, .week, .date; .week is 1 to 53. Conversion is in local time.
* getIsoWeekCalUTCDate : same as above, in UTC time.
* setTimeFromIsoWeekCal (year, week, date, hours, minutes, seconds, milliseconds) : set Time from ISO week calendar date + local hour.
* setUTCTimeFromIsoWeekCal (year, week, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
* toIsoWeekCalDateString : return a string with the date elements in IsoWeekCal: yyyy-Www-dd
* toUTCIsoWeekCalDateString : same as above, in UTC time zone.

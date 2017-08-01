# Basic Common

These modules define additional methods to the JS object Date, which enables you to easily handle the Milesian calendar.

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

## MilesianAlertMsg
Object used with "Alert" commands of other modules. 
This module should be re-encoded for sites that do not use the UTF-8 character set.

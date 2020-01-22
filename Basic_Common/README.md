# Basic Common

These modules define additional methods to the JS object Date, which enables you to easily handle the Milesian calendar.
## milesian.css
A light css for all modules, in particular for the clock.

## CBCCE.js, Cycle-Based Calendar Computation Engine : basic tools for calendar computations
The Compose and Decompose computation principle is explained in *l'Heure Milésienne* (Edilivre) by Louis-Aimé de Fouquières, p. 94 [http://www.calendriermilesien.org/l-heure-milesienne.html].
However the principles have been extended to handle calendar architectures where at any level the last unit of a cycle may be shorter or longer than the other.
* cbcceDecompose takes a date-time value in milliseconds (or any other unit) 
and yields an object with the parts of a date following a decomposition canvas.
* cbcceCompose takes the object and computes the corresponding serial number, e.g. date-time Unix number of milliseconds since Unix epoch.
* Chronos is a passive object with four usefull values for calendar computations:
    * DAY_UNIT : one day in Unix time units (milliseconds),
    * HOUR_UNIT : one hour in Unix time units,
    * MINUTE_UNIT : one minute,
    * SECOND_UNIT : one second. 
This function is used in "DateProperties" packages of this repository.
  
## MilesianDateProperties.js: methods for the Milesian calendar.
Package CCBCCE is used.
* getMilesianDate : the day date as a three elements object: .year, .month, .date; .month is 0 to 11. Conversion is in local time.
* getUTCMilesianDate : same as above, in UTC time.
* setTimeFromMilesian (year, month, date, hours, minutes, seconds, milliseconds) : set Time from milesian date + local hour.
* setUTCTimeFromMilesian (year, month, date, hours, minutes, seconds, milliseconds) : same but from UTC time zone.
* toIntlMilesianDateString : return a string with the date elements in Milesian: (day) (month)"m" (year), month 1 to 12.
* toUTCIntlMilesianDateString : same as above, in UTC time zone.

## MilesianAlertMsg
Object used with "Alert" commands or in string construction of other modules. Error messages in several languages are generated. 
This module should be re-encoded for sites that do not use the UTF-8 character set.

## RealTZmsOffset.js: a method for precise Timezone offset computation
The method getRealTZmsOffset computes the real offset between a local hour and UTC in ms (not in minutes !)
Since local time before TZ were enforced is now taken into account, 
using TZOffset gives different results in different browsers.
Hence this method.

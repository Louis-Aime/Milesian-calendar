# Milesian Locale: compute Milesian date string following CLDR project model.
The content are experimental, and shall be refined until integration to Common Locale Data Repository (CLDR) is possible.

First objective: set the months names for a set of languages as defined [here](http://www.calendriermilesien.org/mois.html).
## MilesianMonthNames.xml : the database of Milesian month names in different languages
This file is no more used in this implementation. It has been transferred to [Milesian_Datasets](https://github.com/Louis-Aime/Milesian_datasets).
## milesianMonthNamesString.js 
The Milesian month names object stored as a string, and parsed upon initialisation.
## UnicodeMilesianFormat.js
Take benefit of the Unicode calendar environment and propose a Milesian string elaboration routine using the CLDR.
### unicodeCalendarHandled (calendar)
If user specifies calendar, which calendar will he get
### toLocalDate (Date, [Options])
Set an object containing a Date object to the date where the Sun is in the same position from the "timezone" as at Greenwich
at the given date, and an "accuracy" indication: with weak-browsers, it is not always possible to get the exact result. 
In other words, set a Date as a "local" date, "local" meaning: as it is specified with the timeZone value of Otpion.
This function is not directly connected with the Milesian calendar, but is very usefull for computations on time zones.
### milesianFormatToParts
A method to Intl.DateTimeFormat, with the same effect than .formatToParts, but the parts will be of the milesian date.
### milesianFormat
A method to Intl.DateTimeFormat, with the same effect than .format, but yields the string of a milesian date.
### toMilesianString ([Locale,[Options]])
this method is deprecated, and no longer available.

MilesianDateProperties.js is used.

see [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString] 
for details on Locale and Options passed to Intl.DateTimeFormat ()

## UnicodeTester.html, UnicodeTester.js, UnicodeTesterDebug.js
A simple demonstration page that uses the abone functions and enables it to understand how Unicode calendars 
are rendered with several browsers.
Module UnicodeTesterDebug.js is a variant to UnicodeTester.js, for debug purposes.

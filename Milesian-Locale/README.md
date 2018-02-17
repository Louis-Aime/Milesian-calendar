# Milesian Locale: compute Milesian date string following CLDR project model.
The content are experimental, and shall be refined until integration to Common Locale Data Repository (CLDR) is possible.

First objective: set the months names for a set of languages as defined [here](http://www.calendriermilesien.org/mois.html).
## MilesianMonthNames.xml : the database of Milesian month names in different languages
This file is no more used in this implementation. It has been transferred to [Milesian_Datasets](https://github.com/Louis-Aime/Milesian_datasets).
## milesianMonthNamesString.js 
The Milesian month names object stored as a string, and parsed upon initialisation.
## UnicodeMilesian.js
Take benefit of the Unicode calendar environment and propose a Milesian string elaboration routine using the CLDR.
### toLocalDate (Date, [Options])
Set a Date object to the date where the Sun is in the same position from the "timezone" as at Greenwich at the given date. 
In other words, set a Date as a "local" date, "local" meaning: as it is specified with the timeZone value of Otpion.
This function is not directly connected with the Milesian calendar, but is very usefull for computations on time zones.
### toMilesianString.js ([Locale,[Options]])
a method for the Date object.

MilesianDateProperties.js is used.

toMilesianDateString ([Locale,[Options]]) is a Date method that generates the string as specified with Locale and Options 
(see [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString] for details).

The code of this function is not optimal. The only idea is to show a demonstrator on a few languages.

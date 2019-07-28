# Milesian Locale: compute Milesian date string following Unicode CLDR project model.
The content are experimental, and shall be refined until integration to Common Locale Data Repository (CLDR) is possible.
First objective: set the months names for a set of languages as defined [here](http://www.calendriermilesien.org/mois.html).

## MilesianMonthNames.xml : the database of Milesian month names in different languages
This file is not used in this implementation. It has been transferred to [XMLLoad](https://github.com/Louis-Aime/Milesian-calendar/tree/master/XMLLoad).

## milesianMonthNamesString.js 
The Milesian month names object stored as a string, and parsed upon initialisation.

## UnicodeBasics.js
A basic access routines that the user misses when developping an additionnal calendar
### unicodeCalendarHandled (calendar)
If user specifies calendar, which calendar will he get after system negotiation
### toResolvedLocalDate
Yields a "best fit" local date for a named time zone and a the given date. 
The result is a Date object whose UTC value is the *local* date.

## UnicodeMilesianFormat.js
Take benefit of the Unicode calendar environment and propose a Milesian string elaboration routine using the CLDR.
### milesianFormatToParts
A method to Intl.DateTimeFormat, with the same effect than .formatToParts, but the parts will be of the milesian date.
### milesianFormat
A method to Intl.DateTimeFormat, with the same effect than .format, but yields the string of a milesian date.

MilesianDateProperties.js is used.

see [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString] 
for details on Locale and Options passed to Intl.DateTimeFormat ()

## UnicodeTester.html, UnicodeTester.js
A simple demonstration page that uses the above functions 
and enables it to understand how Unicode calendars are displayed

## Installation
Require:
* Basic_Common

1. Extract Basic_Common into a directory of your computer. You may extract all, it does not matter.
1. Extract this directory and into the same directory.
1. Launch "UnicodeTester" in our browser, and enjoy.

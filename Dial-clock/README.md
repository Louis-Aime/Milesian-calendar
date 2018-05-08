# Milesian clock

A demonstrator of milesian date display on a dial that looks very much like the traditional hour display, 
except that the two hands display the month and the date, instead of the hour and the minutes.
Here a small dial display the traditional hour and minute hands, updated every 20 seconds. 
The main Milesian clock offer conversion and date display facilities that were in different pages.

# Installation
1. Extract MilesianDateProperties and CalendarCycleComputationEngine from JS-Date-properties into a directory of your computer. 
You may extract all, it does not matter. 
1. Extract all .js and .html files of Dial-clock into the same directory. 
1. Launch "LightMilesianClock" in our browser. You obtain today's Milesian date. 
You may choose the .svg or the .html version.
A small dial displays hour and minute. It is updated every 20 seconds.
1. Launch "MilesianClock" in our browser. It shows today's Milesian date on the dial. You may then change dates, convert from/to several calendars that were ounce used in France, and convert to any Unicode handled language and calendar.

# Notices
  * MS Internet Explorer does not work at all (does not handle default parameter values)
  * Tested on Firefox, Chrome, Edge and Safari.
  * It it possible to use several clocks independently.
  * The clocks may handle not only year, month and days, but also time of day: hours, minutes, seconds, and an am/pm indicator. 
  Authors may omit any hand.

How it looks like, and inquiries: http://www.calendriermilesien.org/horloge-milesienne.html

Note: this stand-alone version is not so nice as the online version, that uses frameworks, but the functions are identical.

# Contents
 * MilesianClock.html: the complete clock and converter. Use Cadran_milesien_600 and all .js files, 
 plus .js files of Basic_Common, Milesian-locale, Misc_Date_Properties.
 * LightMilesianClock.html: the light milesian clock. display time and day. 
 Use Cadran_milesien_600, MilesianClockOperations, plus .js files of Basic_Common.
 * LightMilesianClock.svg: same as above.
 * MilesianClockDisplay and	MilesianClockDisplayCompEntries.js are button functions of MilesianClock.html,  
 splitted in files of less than 20 kb.
 * MilesianClockOperations.js: the commands of the Milesian Clock hands and text indications
 
 ## MilesianClockOperations.js
 ### setSolarYearClockHands (clock, year = undefined, month = 0, day = 1, hour = 24, minute = 0, second = 0, continuous = false)
 set the hands of a solar clock to the parameters. 
  * clock: the svg object to modify
  * year, month, day, hour, minute, second: the day-time element to display.
  * continuous: if true, the day hand works continuously. 
  If false or by default, the day hand stays on the same indication for 24 hours. 

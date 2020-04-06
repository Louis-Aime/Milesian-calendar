# Milesian clock

A demonstrator of milesian date display on a dial that looks very much like the traditional hour display, 
except that the two hands display the month and the date, instead of the hour and the minutes.
Here a small dial display the traditional hour and minute hands, updated every 20 seconds. 
The main Milesian clock offer conversion and date display facilities that were in different pages.

# Installation
1. Extract all files except \*.md from the following directories into a same directory of your computer:
    * Basic_Common 
    * Dial-clock (this directory)
    * Converter
    * Milesian-Locale
    * Misc_Date_Properties
    * (You may extract all material from all files, this will not disturb) 
1. Launch "LightMilesianClock" in your browser. You may choose the .svg or the .html version.
You obtain today's Milesian date. A small dial displays hour and minute. It is updated every 20 seconds.
1. Launch "MilesianClock" in your browser. It shows today's Milesian date on the dial. 
You may then change dates, times and time zone, convert from/to several calendars that were ounce used in France, 
and convert to any Unicode handled language and calendar.

# Notices
* MS Internet Explorer does not work at all (does not handle default parameter values)
* Tested on Firefox, Chrome, MS Edge, Safari, and Samsung Internet
* It it possible to use several clocks independently.
* The clocks may handle not only year, month and days, but also time of day: hours, minutes, seconds, and an am/pm indicator. 
  Authors may omit any hand.
* Season's marks added (see in Converter package)

How it looks like, and inquiries: http://www.calendriermilesien.org/horloge-milesienne.html

# Contents
 * MilesianClock.html: the complete clock and converter. Use Cadran_milesien_600 and all .js files, 
 plus .js files of Basic_Common, Milesian-locale, Misc_Date_Properties.
 * LightMilesianClock.html: the light milesian clock. display time and day. 
 Use Cadran_milesien_600, MilesianClockOperations, plus .js files of Basic_Common.
 * LightMilesianClock.svg: same as above.
 * MilesianClockDisplay.js: updating functions for MilesianClock.html. The input functions are in .html,
 this file only holds display routines.
 * MilesianClockOperations.js: the commands of the Milesian Clock hands and text indications.
 * LunarClockOperations.js: the commands for the Moon part of the clock.
 * Milesian_dial_2936.png: the fixed part dial of the clock. In former version, was Cadran_milesien_600.png with a poor definition.
 * Luna_disk.jpg: an image fo the Moon used as background for the Moon part of the clock.
 

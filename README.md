# Milesian-calendar
Computations and conversion routines demonstrating the Milesian calendar.

**Version note: after a large amount of works, most essential routine are "modularized". Subrepositories are no longer used. Present file needs update.**

Objective: demonstrate that the Milesian calendar as defined in
[*L'Heure milésienne*, by Louis-Aimé de Fouquières (Edilivre)](http://www.calendriermilesien.org/l-heure-milesienne.html)
can be handled by simple enhancement of web standard objects, in particular
* JS Date object,
* Unicode international routines: Locale and Options for toDateString,
* Graphic tools for displaying and using analog clocks.

Learn more about the advantages of the Milesian calendar in the herefore mentionned book and on [http://www.calendriermilesien.org].

English readers are invited to read [The Milesian calendar in short](https://github.com/Louis-Aime/Milesian-calendar/blob/master/The%20Milesian%20calendar%20in%20short.pdf) (4 pages) available in this repository.

The routines are grouped in subfolders by features.
* Basic_Common: minimum used by other modules. 
* The subfolders with .html files are "demonstrators". They require the contents of other subfolders. 
* Each subfloder holds a README files describing the contents and the necessary associated files.

In order to demonstrate the routines, you may extract all software and data pieces in a same diretory, and launch the .html files.

## Basic_Common
Properties and method are added to the standard JS Date object, 
in order to specify dates with Milesian figure or get the Milesian figure from a Date,
and other small utilities for general calendrical calculations.
Used by all other modules.

## Misc_Date_Properties
Other modules enable Date computation in non-CLDR calendars, or other informations. 
* Julian calendar (not one of Unicode)
* ISO 8601 week calendar
* Lunar calendars and data
* Season computations: solstices and equinoxes
Require 
* CBCCE.js.

## Milesian Locale 
Format Milesian date string in different languages, following Common Locales Data Repository (CLDR) of Unicode.
Generate also date string of any calendar and language proposed by Unicode.
Note that differences among navigators and bugs in Unicode-provided algorithms are visible.

A test HTML page is provided.

## Year-signature
Compute the key figures associated with a year:
* John Conway's doomsday, 
* Milesian epact and residue
* Dates of solstices and equinoxes
* Easter date in Julian and Gregorian 

Require: 
* Basic_Common
* Misc_Date_Properties: only LunarDateProperties.js is used.

## Dial-clock
The "Milesian clock".

Require 
* Basic_Common
* Misc_Date_Properties (complete) 
* Milesian Locale

This is a "Milesian clock", with month, day, hour and minute hands. Seconds are also possible. 
The package demonstrates also how to convert dates to/from gregorian, julian and Milesian calendars, Julian Day, 
and to any Unicode calendar, or other "series", and finally giving moon and Delta T coordinates.

## Converter 
A simplified version of the Milesian clock, handles dates only. 
The dates of solstices and equinoxes are displayed as marks on the dial.                                                                        

Require 
* Basic_Common
* Misc_Date_Properties (complete) 
* Milesian Locale

## XMLLoad
Routines for loading the Milesian calendar's characteristics from a remote site with XMLHttpRequest.

## Bribes
Short codes pieces, not used in this packages, but potentially usufull for calendrical computations.

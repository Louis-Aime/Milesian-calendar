# Milesian-calendar
Computations and conversion routines demonstrating the Milesian calendar.

Objective: demonstrate that the Milesian calendar as defined in
[*L'Heure milésienne*, by Louis-Aimé de Fouquières (Edilivre)](http://www.calendriermilesien.org/l-heure-milesienne.html)
can be handled by simple enhancement of web standard objects, in particular
* JS Date object,
* Unicode international routines: Locale and Options for toDateString,
* Graphic tools for displaying and using analog clocks.

Learn more about the advantages of the Milesian calendar in the herefore mentionned book and on [http://www.calendriermilesien.org].

English readers are invited to read [The Milesian calendar in short] (4 pages) in the main repository.

The routines are grouped in subfolders by features.
* Basic_Common: minimum used by other modules. 
* The subfolders with .html files are "demonstrators". They require the contents of other subfolders. 
* Each subfloder holds a README files describing the contents and the necessary associated files.

In order to demonstrate the routines, you may extract all software and data pieces in a same diretory, and launch the .html files.

## Basic_Common
Properties and method are added to the standard JS Date object, 
in order to specify dates with Milesian figure or get the Milesian figure from a Date. 
The modules are:
### CBCCE.js
A computation module for converting from Timestamp to calendar representation and the reverse, with any calendar 
that can be described in terms of hierarchy of cycles, with an intercalary element (a day, a year, a cycle of years...) 
inserted or omitted at end of each cycle, under the principle of postfix intercalation. This works for the Milesian calendar. 
This works too for the julian and gregorian calendars, provided that we let the "roman" year begin on 1 March,
as it used to be before Julius Caesar's reform, and provided that we use a specific function for decomposition in "roman" months.
See [*L'Heure Milésienne* by Louis-Aimé de Fouquières (Edilivre)](http://www.calendriermilesien.org/l-heure-milesienne.html) p. 94 for details.
### MilesianDateProperties.js
Getters, Setters and simple string generator for the Milesian calendar. 
Run in a similar way to Date methods, see [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date].
### MilesianAlertMsg.js
Messages used in "Alert" JS commands. 
This file, and only this one, should be recoded for sites not using UTF-8 character sets.

## Misc_Date_Properties
Other modules enable Date computation in non-CLDR calendars, or other informations. Use CalendarCycleComputationEngine.js.
### JulianDateProperties.js
Computation with the Julian calendar, and with the Julian Day Number (see [https://en.wikipedia.org/wiki/Julian_day]).
### IsoWeekCalendarDateProperties.js
Computation on the ISO 8601 week calendar, the calendar in weeks resulting from the ISO 8601 norm. 
In principle, Common Locale Data Repository (CLDR) provide ways to make such computations. This is just a simplier way.
### LunarDateProperties.js
Getters of coordinates of a mean moon, and of an estimate of the "Delta Time" used by astronomers. 
Enables to anticipate possible eclipses in a similar way to the [Antikythera mechanism](https://en.wikipedia.org/wiki/Antikythera_mechanism)

## Milesian Locale 
Format Milesian date string in different languages, following CLDR project model
Requires 
* Basic_Common files.

Demonstrate the "computation" of a string expressing a Milesian date following locales and options 
as specified by Common Locales Data Repository (CLDR) of Unicode.

Generate also a date string with the standard CDLR routines in any Unicode-supported language and calendar.
Thus, this package may be used as a converter from Milesian into any Unicode-registred calendar.
Note that differences among navigators and bugs in Unicode-provided algorithms are visible.

## Year-signature
Requires: 
* Basic_Common
* Misc_Date_Properties: only LunarDateProperties.js is used.

Compute the key figures associated with a year, including John Conway's doomsday, Milesian epact, and Easter date. 

## Dial-clock
Requires 
* Basic_Common
* Misc_Date_Properties (complete) 
* Milesian Locale

This is a "Milesian clock", with month, day, hour and minute hands. Seconds are also possible. 
The package demonstrates also how to convert dates to/from gregorian, julian and Milesian calendars, Julian Day, 
and to any Unicode calendar, or other "serie", and finally giving moon and Delta T coordinates.

## Converter 
Requires 
* Basic_Common
* Misc_Date_Properties (complete) 
* Milesian Locale

A simplified version of the Milesian clock, handles dates only.

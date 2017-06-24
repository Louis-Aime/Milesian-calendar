# Milesian-calendar
Computations and conversion routines demonstrating the Milesian calendar.

The routines are grouped in subfolders by "project", even if GitHub projects are not always specified. Each subfloder holds a README files describing the contents.

## JS-Date-Properties
Properties and method are added to the standard JS Date object, in order to specify dates with Milesian figure or get the Milesian figure from a Date. The essential modules are:
### CalendarCycleComputationEngine.js
A computation package able to convert from Timestamp to calendar representation and the reverse, with any calendar 
that can be described in terms of hierarchy of cycles, with an intercalary element (a day, generally) 
inserted or omitted at end of each cycle, under the principle of postfix intercalation. This works for the Milesian calendar. 
This works too for the julian and gregorian calendars, provided that we let the "roman" year begin on 1 March,
as it used to be before Julius Caesar's reform. See *L'Heure Milésienne* by Louis-Aimé de Fouquières (Edilivre)
[http://www.calendriermilesien.org/l-heure-milesienne.html] p. 94 for details.
### MilesianDateProperties.js
Getters, Setters and simple string generator for the Milesian calendar. 
Run in a similar way to Date methods, see [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date].

Other modules enable Date computation in non-CLDR calendars, or other informations:
### JulianDateProperties.js
Computation with the Julian calendar, and with the Julian Day Number (see [https://en.wikipedia.org/wiki/Julian_day]).
### IsoWeekCalendarDateProperties.js
Computation on the ISO 8601 week calendar, the calendar in weeks resulting from the ISO 8601 norm. 
In principle, Common Locale Data Repository (CLDR) provide ways to make such computations. This is just a simplier way.
### LunarDateProperties.js
Getters of coordinates of a mean moon, and of an estimate of the "Delta Time" used by astronomers. 
Enables to anticipate possible eclipses in a similar way to the Antikythera mechanism [https://en.wikipedia.org/wiki/Antikythera_mechanism]

## Milesian Locale: compute Milesian date string following CLDR project model
Requires CalendarCycleComputationEngine.js and MilesianDateProperties.js
Generate Milesian Date strings in different languages, as specified in the Common Locale Data Repository (CDLR) project.

## Year-signature
Requires CalendarCycleComputationEngine.js, MilesianDateProperties.js, LunarDateProperties.js
Compute the key figures associated with a year, including John Conway's doomsday, Milesian epact, and Easter date. 
An HTML desmonstrator is provided.

## Numeric-clock
Requires all JS-Date-Properties and all Milesian Locale. 

This is a "Milesian clock", demonstrating how to convert dates to/from gregorian, julian and Milesian calendars, 
and giving moon and Delta T coordinates.

# Milesian-calendar
Computations and conversion routines using the Milesian calendar.

**Version note: after a large amount of works, most essential routine are "modularized". Subrepositories are no longer used.**

Reference:
[*L'Heure milésienne*, by Louis-Aimé de Fouquières (Edilivre)](http://www.calendriermilesien.org/l-heure-milesienne.html)

The former by simple enhancement of web standard objects, in particular
* JS environment,
* Unicode international routines
* Graphic tools for displaying and using analog clocks.

Learn more about the advantages of the Milesian calendar in the herefore mentionned book and on [http://www.calendriermilesien.org].

English readers are invited to read [The Milesian calendar in short](https://github.com/Louis-Aime/Milesian-calendar/blob/master/The%20Milesian%20calendar%20in%20short.pdf) (4 pages) available in this repository.

Subfolder _docs_ is a demonstration implementation, use https://louis-aime.github.io/Milesian-calendar/

Subfolder _XMLLoad_ is a variant for loading the _pldr_ (private locale data registry) from a remote source.

You may download all files from this folder and test by launching any html file in any browser.

## Basic calendrical computations.
 * chronos.js: base calendrical computations in order to define calendars, includes the "Cycle Based Calendar Computation Engine", and a class for computations on weeks.
 * dateextended.js: extension of Date and of Intl.DateTimeFormat.
 * pldr.js: private extension of Unicode's CLDR.
 
## Calendar definition
calendars.js: classes defining several calendars not defined in Unicode:
 * the Milesian calendar,
 * the Julian calendar,
 * the Western generic calendar: Julian until some date on or after ISO 1582-10-15, Gregorian afterwards. Switching date is specified at construction,
 * IsoWeek: the week coordinates after ISO8601 standard.

calendarinstant.js: instantiation of those class.

## Complement around calendars
Other modules enable Date computation in non-CLDR calendars, or other informations. 
* Lunar data,
* Season computations: solstices and equinoxes,
* Conversion to and from day counters,
* Year signature : John Conway's doomsday, Gregorian epact, Easter in Julian and Gregorian calendars

## Utilities for calendar and clock computations
 * calendarclock.js: handling a year clock
 
## Demo pages
 * Milesian clock: reading today's date in Milesian and other calendars all around the world, converting to other calendars and languages.
 * Ligne Milesian clock: a tiny version
 * Dateextendtest: test pages for extension of JS tools.
 
 ## XMLLoad
 In XMLLoad subfolder. To be used as a variant. Enable reading calendar data from an external site with XMLHttpRequet


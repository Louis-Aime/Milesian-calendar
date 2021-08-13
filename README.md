# Milesian-calendar
Computations and conversion routines using the Milesian calendar.

Applications are usable through [these GitHub pages](https://louis-aime.github.io/Milesian-calendar/).

Reference:
[*L'Heure milésienne*, by Louis-Aimé de Fouquières (Edilivre)](http://www.calendriermilesien.org/l-heure-milesienne.html)

The former by simple enhancement of web standard objects, in particular
* JS environment,
* Unicode international routines
* Graphic tools for displaying and using analog clocks.

Learn more about the advantages of the Milesian calendar in the herefore mentionned book and on [http://www.calendriermilesien.org].

English readers are invited to read [The Milesian calendar in short](https://github.com/Louis-Aime/Milesian-calendar/blob/master/The%20Milesian%20calendar%20in%20short.pdf) (4 pages) available in this repository.

You may download these files from the Release manager and test by launching any html file in any browser (except pldr_loader)

## Basic calendrical computations and calendar definitions
The submodule calendrical-javascript is used, see calendrical-javascript.

The referenced modules include: 
 * a simple fetcher program: turns an XML file into a DOM: XMLHttpRequest wrapped in a Promise.
 * chronos: basic calendrical computation, including the "Cycle Bases Calendrical Computation Engine, and also safe div and mod computations.
 * dateextended: objects ExtDate and ExtDateTimeFormat, with more possibilities than Date and Intl.DateTimeFormat
 * several "custom" calendar (not Unicode built-in):
   * the Milesian calendar,
   * the Julian calendar,
   * the Western generic calendar: Julian until some date on or after ISO 1582-10-15, Gregorian afterwards. Switching date is specified at construction,
   * IsoWeek: the week coordinates after ISO8601 standard.

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
 * load-modules-and-write: test pages for extension of JS tools.

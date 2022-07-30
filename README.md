# Milesian-calendar
Calendar computations, display and conversion routines. 
Use julian and gregorian calendars, as well as the French republic calendar and the Milesian calendar. 

JSDoc documentation and application are available from [these GitHub pages](https://louis-aime.github.io/Milesian-calendar/).

References:
[*L'Heure milésienne*, by Louis-Aimé de Fouquières (Edilivre)](http://www.calendriermilesien.org/l-heure-milesienne.html).

English readers are invited to read 
[The Milesian calendar in short](https://github.com/Louis-Aime/Milesian-calendar/blob/master/The%20Milesian%20calendar%20in%20short.pdf) 
(4 pages) available in this repository.

This Html/Javascript application uses ES2016 modules. It requires an http server application.

## Basic calendrical computations and calendar definitions
The submodule calendrical-javascript is used, see [calendrical-javascript](https://github.com/Louis-Aime/calendrical-javascript).

## Complement around calendars
Other modules enable Date computation in non-CLDR calendars, or other informations. 
- Lunar data,
- Eclipse prediction: "seasons" where eclipses may occur,
- Season computations: solstices and equinoxes,
- Conversion to and from day counters,
- Year signature : John Conway's doomsday, Gregorian epact, Easter in Julian and Gregorian calendars.

## Utilities for calendar and clock computations
 - calendarclock.js: handling a year clock.
 
## Demo pages
 - Milesian clock: reading today's date in Milesian and other calendars all around the world, converting to other calendars and languages.
 - Light Milesian clock: a tiny version
 - load-modules-and-write: test pages for extension of JS tools.

# Milesian-calendar
Calendar computations, display and conversion routines. 
Use Julian, Gregorian, iso 8601 and Persian calendars, as well as the French republic calendar, the Milesian calendar, and the Julian Day.
Dates may be read in all calendars and languages managed by Unicode, and also in various day numbering systems.
Lunar data, solstices and equinoxes, eclipse forecast, week and Easter date computation keys are also given.

JSDoc documentation and application are available on-line from [these GitHub pages](https://louis-aime.github.io/Milesian-calendar/).

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
Each demonstration page is made of an HTML page that uses the modules.
The pages are in French. However an English version of the Milesian clock is also provided.
 - Milesian clock: reading today's date in Milesian and other calendars all around the world, converting to other calendars and languages.
 - Date converter: convert any date into any language and calendar managed by Unicode.
 - Light Milesian clock: a tiny version of the Milesian clock, without command.
 - Yearly figures: John Conway's doomsday, Gregorian epact, Seasons, Easter.
 - Simple Milesian date display: today's date in Milesian in your language.

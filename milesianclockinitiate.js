/** 
 * @file Milesian Clock and converter functions - launcher part.
 * This routine loads the modules necessary for html applications.
 * @requires module:fetchdom
 * @requires module:pldr
 * @requires module:time-units
 * @requires module:extdate
 * @requires module:extdatetimeformat
 * @requires module:calendars
 * @requires module:deltat
 * @requires module:seasons
 * @requires module:calendarclock
 * @requires module:countconversion
 * @requires module:lunar
 * @requires module:yearsignature
 * @version M2022-10-26
 * @author Louis A. de Fouquières https://github.com/Louis-Aime
 * @license MIT 2016-2022
*/
// Character set is UTF-8.
/* Version	M2022-10-26 10 s timeout for loading XML file
*/
/* Copyright Louis A. de Fouquières https://github.com/Louis-Aime 2016-2022
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sub-license, or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
1. The above copyright notice and this permission notice shall be included
   in all copies or substantial portions of the Software.
2. Changes with respect to any former version shall be documented.

The software is provided "as is", without warranty of any kind,
express of implied, including but not limited to the warranties of
merchantability, fitness for a particular purpose and non-infringement.
In no event shall the authors of copyright holders be liable for any
claim, damages or other liability, whether in an action of contract,
tort or otherwise, arising from, out of or in connection with the software
or the use or other dealings in the software.
*/
"use strict";
var	// global variables at document level.
	// all modules here once imported
	// pldrDOM,		// imported PLDR
	modules,	// imported modules
	pldrDOM;	// pldrDOM,


const // Promises of loading initial files. This a temporary version fills 'modules' and 'calendrical'
	calendrical = {},
	loadCalendrical = Promise.all([
		import ('./fetchdom.js').then (
			(value) => value.default ('https://louis-aime.github.io/calendrical-javascript/pldr.xml', 10000),
			(error) => { throw 'Error loading standard modules' }		// failure fetching pldr as XML file, fallback in next step
			).then (
				(value) => { pldrDOM = calendrical.pldrDOM = value },			// fetching XML file has succeeded.
				(error) => {							// fetching XML has failed, we use the fallback value
					console.log ('Error fetching xml pldr file: ' + error + '\nfetching local pldr.js');
					return import ("./pldr.js").then ( (value) => pldrDOM = calendrical.pldrDOM = value.default () ) 
					}
				),
		import ('./time-units.js').then ( (value) => calendrical.TimeUnits = value.default ),
		import ('./extdate.js').then ( (value) => calendrical.ExtDate = value.default ),
		import ('./extdatetimeformat.js').then ( (value) => calendrical.ExtDateTimeFormat = value.default ),
		import ('./calendars.js').then ( (value) => Object.assign (calendrical, value) )
		]),

	loadMilesian = Promise.all ([ 
		import ('./deltat.js').then ( (value) => calendrical.getDeltaT = value.default ),
		import ('./seasons.js').then ( (value) => Object.assign (calendrical, value) ),
		import ('./calendarclock.js').then ( (value) => Object.assign (calendrical, value) ),
		import ('./countconversion.js').then ( (value) => Object.assign (calendrical, value) ),
		import ('./lunar.js').then ( (value) => Object.assign (calendrical, value) ),
		import ('./yearsignature.js').then ( (value) => Object.assign (calendrical, value) ),
		]),

	loadComplete = Promise.all ([
		loadCalendrical,
		loadMilesian.then ( (value) => { modules = calendrical ; modules.Milliseconds = calendrical.TimeUnits } )
		]);




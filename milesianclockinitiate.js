/* Milesian Clock and converter functions - initiate part
Character set is UTF-8.
These functions are associated with the Milesian clock and converter html page: 
They use the basic Milesian calendar functions, and the conversion functions of other calendar,
in order to display the Milesian on-line clock and to perform calendar conversion.
Associated with: 
*	MilesianClock.html
*/
/* Version notes (follow GitHub)
	This file aims ar created an adequate environment for several milesian clock applications.. 
	This part is especially for initialisation.
*/
/* Version	M2021-08-07
		Created from milesianclockdisplay.js

*/
/* Copyright Miletus 2017-2021 - Louis A. de Fouquières
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

Inquiries: www.calendriermilesien.org
*/
"use strict";
var	// global variables at document level.
	// all modules here once imported
	// pldrDOM,		// imported PLDR
	modules,	// imported modules
	pldrDOM;	// pldrDOM,


const // Promises of loading initial files.
	modulesload = import ("./milesian_current_modules.js")
		.then ( (modulesload) =>  { modules = modulesload } ),
	pldrload  = import ("https://louis-aime.github.io/calendrical-javascript/fetchdom.js").then	// import pldr loader then standard pldr from xml
		( (value) => value.default ("https://louis-aime.github.io/calendrical-javascript/pldr.xml", 1000), // success importing fetchDOM, see next .then
			(error) => {							// failure importing fetchDOM, error taken from next step
				throw 'fetchdom module not available';
				//return import (".pldr.js").then ( (value) => pldrDOM = value.default () ) // this is done next step
			}
		) .then (
			(value) => { pldrDOM = value },			// fetching XML file has succeeded.
			(error) => {							// fetching XML has failed, we use the fallback value
				console.log ('Error fetching pldrDOM: ' + error + '\nfetching pldr.js');
				return import ("./pldr.js").then ( (value) => pldrDOM = value.default () ) 
					}
			),
	loadComplete = Promise.all([modulesload, pldrload]);



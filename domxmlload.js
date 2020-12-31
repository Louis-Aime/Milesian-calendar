/* DOM XML load: load an external XML file into a DOM.
	Charset: UTF-8
A generalised way of creating a DOM from an XML file.
Built from milesianXMLLoad, formerly MilesianCommonSettings
This package is left for experimental purposes.
Requires:
	Access to milesianMonthNames.XML on a suitable server
	CBCCE
	MilesianDateProperties
	UnicodeMilesianFormat.js (in order to issue a milesian date string)
Details about XML file access
	The XML dataset shall reside on a server that allows GET method,
	otherwise this JS script shall reside on the same domain than the XML file.
Instructions
	1.	A common HTML page shall call "initiateMilesianNames" passing the XML dataset resource as parameter.
		See "DateString_initiator.html" on GitHub as an example.
	2.	After initialisation:
		Common object milesianNames holds the names used in Milesian calendar, in LDML
		Status of milesianNamesRequest can be read
		All HMTL objects with "MilesianDateString" in their class attribute hold today's Milesian date string as textContent
		methods added to Intl.DateTimeFormat are able to compute any Milesian date string of any date and with any Locale and Option
*/
/* Version M2021-01-11 - simplify and make it reusable
	M2018-11-11: JSDoc Comments
	M2018-10-29: Comments updates, put console display in comments
	M2018-05-21: adapted to new Milesian date formatter (methods added to Intl.DateTimeFormat)
	M2017-08-23: general algorithm

*/
/* Copyright Miletus 2017-2021 - Louis A. de Fouquières
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
	1. The above copyright notice and this permission notice shall be included
	in all copies or substantial portions of the Software.
	2. Changes with respect to any former version shall be documented.

The software is provided "as is", without warranty of any kind,
express of implied, including but not limited to the warranties of
merchantability, fitness for a particular purpose and noninfringement.
In no event shall the authors of copyright holders be liable for any
claim, damages or other liability, whether in an action of contract,
tort or otherwise, arising from, out of or in connection with the software
or the use or other dealings in the software.
Inquiries: www.calendriermilesien.org
*/
/** On initializing this class, a call to the specified resource is fired. Once finished, the .DOM fields holds the fetched data.
*/
class DOMFromXML {
	constructor (callback, XMLResource) {
		var XMLRequest = new XMLHttpRequest();	// Request object. Cannot be reinitiated. State can be read from another script.
		XMLRequest.addEventListener ("load", // load external file into a DOM parameter that is passed through the callback
			function (event) {
				let DOM = XMLRequest.responseXML;
				callback(DOM);		// Callback does whatever is usefull here, e.g.: write something with elements fetched from external dataset, or write to console;
			})
		XMLRequest.open("GET", XMLResource);
		XMLRequest.send();
	}
}
	
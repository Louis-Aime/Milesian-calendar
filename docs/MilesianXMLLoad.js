/* MilesianXMLLoad for application that use XML resources for the Milesian calendar.
	Charset: UTF-8
Former name: MilesianCommonSettings
Alternate way of constructing the names of the Milesian months
in various languages, by fetching an XML files possibly located on a remote server, 
rather than reading a long string.
This package is left for experimental purposes.
Versions 
	M2017-08-23: general algorithm
	M2018-05-21: adapted to new Milesian date formatter (methods added to Intl.DateTimeFormat)
	M2018-10-29: Comments updates, put console display in comments
	M2018-11-11: JSDoc Comments
Requires:
	Access to milesianMonthNames.XML on a suitable server
	CBCCE
	MilesianDateProperties
	UnicodeMilesianFormat.js (in order to issue a milesian date string)
Details about XML file access
	The XML dataset containing the Milesian names shall reside on a server that allows GET method,
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
/* Copyright Miletus 2017-2018 - Louis A. de Fouquières
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
/** milesianNames is the DOM object (document) containing the Unicode characteristics of the Milesian calendar.
*/
var milesianNames ;  
var milesianNamesRequest = new XMLHttpRequest();	// Request object. Variant: a const object, cannot be reinitiated.
													//	As a global object, any script can read the state of the request.
/** function that fetches the XML file and then updates date string elements
 * @todo test in real conditions, which requires a CORS compatible server
*/													
function initiateMilesianNames (milesianDataSet) {	// Fetch resource that contains month names.
	milesianNamesRequest.addEventListener ("load", function (event) {	// Catching "loaded" status: request has succeeded, we use the data.
		milesianNames = milesianNamesRequest.responseXML ;				// Put data in reusable object.
		// console.log ("XML Milesian names loaded");	// Report on console, for checking.

		// Next code fires recomputation of milesian date string in document.
		let milesianTodayString = new Intl.DateTimeFormat(	// Date formatter object
			undefined, {				// use system default Locale value
				weekday : "long",		// weekday in full
				day		: "numeric",	// day of month in numeric
				month	: "long",		// name of Milesian month in full and in language set with Locale
				year	: "numeric"		// year in full numeric
										// by default : no era
			}).milesianFormat(new Date());
		let dateStrings = document.getElementsByClassName ("MilesianDateString");	// update whatever string in document intended to hold date.
		// console.log ("MilesianDateString figure: " + dateStrings.length); // How many strings to change
		for ( let i=0; i < dateStrings.length; i++ ) dateStrings[i].textContent = milesianTodayString ;
	})		// End of event listener registration

	// next statements build the last part of the initialisation process
	milesianNamesRequest.open("GET", milesianDataSet); 	// Call to local resource: avoid CORS control; the call is asynchronous
	milesianNamesRequest.send();
}
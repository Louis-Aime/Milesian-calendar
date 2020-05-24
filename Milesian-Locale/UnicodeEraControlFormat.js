/* Experimental: a new Option for the display of era.
	Character set is UTF-8
This is an experimental method for DateTimeFormat.
It uses an extra Boolean option, "exceptCurrentEra" 
If the option is set or missing, era is displayed as required following resolved .era option, but only if era of date is not era of today.
That is, if date is in same era as today, the era part is not displayed.
Versions
	M2020-03-12 Initial version
		Version note: at this time, for most calendar era is displayed even if .era is not set.
Contents
	Intl.DateTimeFormat.prototype.conditionalEraFormat : : return a string with date and time, according to DateTimeFormat, but hidding era if necessary.
Required:
	Intl object
*/
/* Copyright Miletus 2020 - Louis A. de Fouquières
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sub-license, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:
	1. The above copyright notice and this permission notice shall be included
	in all copies or substantial portions of the Software.
	2. Changes with respect to any former version shall be documented.

The software is provided "as is", without warranty of any kind,
express of implied, including but not limited to the warranties of
merchantability, fitness for a particular purpose and non infringement.
In no event shall the authors of copyright holders be liable for any
claim, damages or other liability, whether in an action of contract,
tort or otherwise, arising from, out of or in connection with the software
or the use or other dealings in the software.
Inquiries: www.calendriermilesien.org
*/
"use strict";
/** @description a .format method that issues a string representing a Japanese calendar date.
 * @param {Date object} myDate - the date to display, like for standard Intl.DateTimeFormat.format method.
 * @param (Boolean) exceptCurrentEra - if set, then era shall not be displayed if it is the same as today's date.
 * @returns {string} the date following the Unicode options, except for the display of era.
*/
Intl.DateTimeFormat.prototype.conditionalEraFormat = function (myDate, exceptCurrentEra = true) { 
	var
		myOptions = this.resolvedOptions();
	if (exceptCurrentEra && myOptions.era != null) {
		let 
			myComponents = this.formatToParts(myDate),
			todaysComponents = this.formatToParts(new Date());
		for (let i = 0; i <  myComponents.length; i++) {
			if (myComponents[i].type == "era" && myComponents[i].value == todaysComponents[i].value) delete myOptions.era;
		}
		return new Intl.DateTimeFormat(myOptions.locale, myOptions).format(myDate)
	} else return this.format(myDate);
}	
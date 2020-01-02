/* JS Date TZ Offset getter: get the effective Timezone offset in ms. 
Replaces Date.prototype.getTimezoneOffset, which in certains cases yields an integer number of minutes whereas the real offset contains seconds.
	Character set is UTF-8
Versions
	M 2018-11-16
		The (only) function is added to UnicodeBasic.js 
	M2019-07-27
		Separate getRealTZmsOffset from UnicodeBasic, since this function has nothing to do with display routines.
	M2020-01-12
		Strict mode
Contents
	getRealTZmsOffset : the real time zone offset, in milliseconds, due to a bug in Chrome version of TZOffset.
Required
	Access to "Chronos" object.
*/
/* Copyright Miletus 2018-2020 - Louis A. de Fouquières
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
/** Compute the system time zone offset at this date, in ms.
 * rationale: with Chrome (and others ?), the TZOffset returned value losses the seconds. 
 * @returns {number} the time zone offset in milliseconds: UTC - local (same sign as TimezoneOffset)
*/
Date.prototype.getRealTZmsOffset = function () {
/** Gregorian coordinates of the system local date */
	let localCoord = 
		{year: this.getFullYear(), month: this.getMonth(), date: this.getDate(), 
		hours: this.getHours(), minutes: this.getMinutes(), seconds: this.getSeconds(), milliseconds: this.getMilliseconds()};
/** UTC Date constructed with the local date coordinates */
	let localDate = new Date (0); 
	localDate.setUTCFullYear (localCoord.year, localCoord.month, localCoord.date); 
	localDate.setUTCHours (localCoord.hours, localCoord.minutes, localCoord.seconds, localCoord.milliseconds);
	return this.valueOf() - localDate.valueOf()
}
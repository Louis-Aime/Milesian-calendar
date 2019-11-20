/* Season on clock */
/* Copyright Miletus 2019 - Louis A. de Fouquières
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
/** Mark the dates of solstices and equinox on the dial of the Milesian clock 
 * @since M2019-08-23 (revised for typos M2019-11-30
 * @param {Object} clock - a graphical object that represents the clock, that the routine will set
 * if existing, these elements shall be set
 *  @member .seasonmark.winter winter solstice
 *  @member .seasonmark.spring spring equinox
 *  @member .seasonmark.summer summer solstice
 *  @member .seasonmark.autumn autumn equinox
 * @param {number} year - year for which the seasons are set
 * @return {boolean} true if seasons have been computed, false otherwise.
*/
function setSeasonsOnClock (clock, year) {
	var 
		markList = ["winter", "spring", "summer", "autumn"],
		wdate = new Date(0), // working date object
		theCenter = clock.querySelector(".center.month"),
		success = Number.isInteger(year) && year >= -5000 && year <= 9000;
	for (let i = 0; i < markList.length ; i++) {
		wdate.setTime(tropicEvent(year,i));
		let m = wdate.getUTCMilesianDate().month;
		let theMark = clock.querySelector(".seasonmark."+markList[i]);
		let angle = success ? (m * 30 + Math.floor(m/2) + wdate.getUTCMilesianDate().date) * 60.0 / 61.0 : 0;
		if (theMark !== null)
			theMark.transform.baseVal.getItem(0).setRotate(angle,
				theCenter.x.baseVal.value,theCenter.y.baseVal.value);
	}
	return success;
}
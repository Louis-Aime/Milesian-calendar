/* Milesian Lunar Clock Handler
	Character set is UTF-8
	Operations on Lunar clock 
Versions
	M2018-11-24: experimental
	M2018-11-28: enhancement: fetch centre and radius of SVG moondisk.
Contents
	setMoonPhase
*/
/* Copyright Miletus 2018 - Louis A. de Fouquières
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
/** set SVG display as to Moon age.
 * @param {Object} moon - SVG object representing a moon defined with a lit image and a "path" shaded part
 * @param {number} phase - Phase, in radians (2 * PI is one lunar cycle)
*/
function setMoonPhase (moon, phase) {
	if (phase < 0) throw "Out of bounds";
	var 
		// Which of the four main phase of the moon (0 to 3)
		quart = Math.floor (2*phase / Math.PI), 
		// moon disk object
		moonDisk = moon.querySelector(".moondisk"),
		// reference radius of the moon circle
		scaleRadius = moonDisk.getAttribute("r"),	
		// starting point, from the reference moon circle
		sx = moonDisk.getAttribute ("cx"), sy = moonDisk.getAttribute ("cy")-scaleRadius,
		// computed radius of the circle used for the moon phase
		secondRadius = scaleRadius/Math.max(0.01,Math.abs(Math.cos(phase))),
		// d attribute of path SVG object
		pathstring = "M " + sx + " " + sy
			+ " a " + secondRadius +" " + secondRadius + " 0 0 " 
			+ (quart % 2 == 0 ? 1 : 0) + " 0 " + 2*scaleRadius
			+ " a " + scaleRadius + " " + scaleRadius + " 0 0 " 
			+ (quart % 4 < 2 ? 1 : 0) + " 0 " + -2*scaleRadius + " z" ;
	return moon.querySelector(".moonphase").setAttribute("d",pathstring);
}
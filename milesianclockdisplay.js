/* Milesian Clock and converter functions - excluding initialisation and global variables.
Character set is UTF-8.
Associated with: 
*	milesianClock.html
*/
/*	Related
	milesianclock.html
	milesianclockinitiate.js
	yearsignaturedisplay.js
	other modules have been made visible with the 'modules' object
*/
/* Version notes
	This .js file is highly related to the corresponding html code. 
	Not much code optimisation in this file. 
*/
/* Version	M2021-08-29 - see details on GitHub
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

function setDisplay () {	// Disseminate targetDate and time on all display fields
	
	// establish variables used only for this display cycle
	var
		dateComponent = targetDate.getFields(TZ),
		milDate = new modules.ExtDate (milesian, targetDate.valueOf()),
		mildateComponent = milDate.getFields(TZ),	// Initiate a date decomposition in Milesian, to be used several times in subsequent code
		myElement = document.querySelector("#mclock"),	// myElement is a work variable
		myCollection;	// Another work variable, used later
	// Calendar specified via event listener
	// TZ = Time zone mode specified. Compute effective time zone offset
/* TZOffset is JS time zone offset in milliseconds (UTC - local time)
 * Note that getTimezoneOffset sometimes gives an integer number of minutes where a decimal number is expected
*/
	{
		TZOffset = targetDate.getRealTZmsOffset().valueOf();
		let
			systemSign = (TZOffset > 0 ? -1 : 1), // invert sign because of JS convention for time zone
			absoluteRealOffset = - systemSign * TZOffset,
			absoluteTZmin = Math.floor (absoluteRealOffset / modules.Milliseconds.MINUTE_UNIT),
			absoluteTZsec = Math.floor ((absoluteRealOffset - absoluteTZmin * modules.Milliseconds.MINUTE_UNIT) / modules.Milliseconds.SECOND_UNIT);

		switch (TZ) {
			case "UTC" : 
				TZOffset = 0; // Set offset to 0, but leave time zone offset on display
			case "" : 
				document.querySelector("#realTZOffset").innerHTML = (systemSign == 1 ? "+ ":"- ") + absoluteTZmin + " min " + absoluteTZsec + " s";
		}
	}
	// Formatting structures modifications are established at asynchronous init and by event. No recomputation here.

	// Update local time fields - using	Date properties
	document.time.hours.value = dateComponent.hours;
	document.time.mins.value = dateComponent.minutes;
	document.time.secs.value = dateComponent.seconds;
	document.time.ms.value = dateComponent.milliseconds;

    //  Update custom calendar

    document.custom.year.value = dateComponent.fullYear;
    document.custom.month.value = dateComponent.month;
    document.custom.day.value = dateComponent.day;
	document.week.weekyear.value = targetDate.weekYear(TZ); 
	document.week.weeknumber.value = targetDate.weekNumber(TZ);
	document.week.weekday.value = targetDate.weekday(TZ);
	document.week.weeksinyear.value = targetDate.weeksInYear(TZ);
	document.week.dayofweek.value = weekFormat.format(targetDate);

	// Place marks that say that custom calendar was not valid
	myElement = document.querySelector("#customline");
	myCollection = myElement.getElementsByClassName("mutable");
	// first remove marks from another display
	for (let i = 0; i < myCollection.length; i++)
		myCollection[i].setAttribute("class", myCollection[i].getAttribute("class").replace(" outbounds",""))
	// Then check whether marks should be set
	if (typeof calendars[customCalIndex].valid == "function" && !calendars[customCalIndex].valid(dateComponent)) 
		for (let i = 0; i < myCollection.length; i++)
			myCollection[i].setAttribute("class", myCollection[i].getAttribute("class").replace(" outbounds","") + " outbounds");

	// Julian Day and chronological fields
	let JD = new modules.ExtCountDate (jdcounterselector,"iso8601",targetDate.valueOf()).getCount();
	document.daycounter.julianday.value = JD;
		// = JD.toLocaleString(undefined,{maximumFractionDigits:8}); // JD.toLocaleString(undefined,{useGrouping:false, maximumFractionDigits:8})
/*	if (document.daycounter.julianday.value == "") // Because bug in Chromium
		document.daycounter.julianday.value = Math.round(JD*10E7)/10E7;
*/
	document.querySelector("#unixCountDisplay").innerHTML = targetDate.valueOf().toLocaleString();
	document.querySelector("#mjdDisplay").innerHTML = 
		new modules.ExtCountDate ("modifiedJulianDay","iso8601",targetDate.valueOf()).getCount().toLocaleString(undefined,{maximumFractionDigits:8});
	document.querySelector("#nasajdDisplay").innerHTML = 
		new modules.ExtCountDate ("nasaDay","iso8601",targetDate.valueOf()).getCount().toLocaleString(undefined,{maximumFractionDigits:8});
	document.querySelector("#spreadSheetsCountDisplay").innerHTML = 
		new modules.ExtCountDate ("sheetsCount","iso8601",targetDate.valueOf()).getCount().toLocaleString(undefined,{maximumFractionDigits:8});
	document.querySelector("#MicrosoftCountDisplay").innerHTML = 
		new modules.ExtCountDate ("MSBase","iso8601",targetDate.valueOf()).getCount().toLocaleString(undefined,{maximumFractionDigits:8});
	document.querySelector("#MacOSCountDisplay").innerHTML = 
		new modules.ExtCountDate ("macOSCount","iso8601",targetDate.valueOf()).getCount("macOSCount").toLocaleString(undefined,{maximumFractionDigits:8});
	
	// Display Locale (language code only) as obtained after negotiation process
	document.querySelector("#langCode").innerHTML = userOptions.locale.includes("-u-") 
		? userOptions.locale.substring (0,userOptions.locale.indexOf("-u-")) 
		: userOptions.locale ;
	document.querySelector("#CalendarCode").innerHTML = userOptions.calendar;	// Display calendar obtained after negotiation process
	document.querySelector("#timeZone").innerHTML = userOptions.timeZone;	// Display time zone as obtained after negotiation process
	
	// Print Unicode string, following already computed options.
 	//	Write date string. Catch error if navigator fails to handle writing routine (MS Edge)
	myElement = document.getElementById("UnicodeString");
	try { myElement.innerHTML = unicodeFormat.format(targetDate); }
	catch (e) { myElement.innerHTML = e.message; }
	document.getElementById("unicodecalname").innerHTML = unicodeOptions.calendar;

	//	Custom calendar date string following options. Catch error if navigator fails, in this case write without time part.
	document.getElementById("customcalname").innerHTML = askedOptions.calendar.id;
	myElement = document.getElementById("CustomString");
	try	{ myElement.innerHTML = askedOptions.format(targetDate); } 
	catch (e) { myElement.innerHTML = "ExtDateTimeFormat.format error: " + e; }
/*	Week properties: already in controlled fields
	//  Update week properties of custom calendar, using custom week properties
	document.getElementById ("weekerror").innerHTML = ""; 
	try {
		let weekFields = targetDate.getWeekFields(userOptions.timeZone);
		document.getElementById ("weekyear").innerHTML = weekFields.weekYear; 
		document.getElementById ("yearweek").innerHTML = weekFields.weekNumber;
		document.getElementById ("weekday").innerHTML = weekFields.weekday; 	// i'd prefer name
		document.getElementById ("weeksinyear").innerHTML = "(" + weekFields.weeksInYear + ")";
	}
	catch (e) { 
		document.getElementById ("weekerror").innerHTML = e; 
	}
*/
	// Lunar data frame

	// Update lunar parameters
	dateComponent = modules.Lunar.getCEMoonDate( targetDate );
	milesianClock.setMoonPhase(dateComponent.age*Math.PI*2/29.5305888310185);
	document.moon.age.value = dateComponent.age.toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2}); // age given as a decimal number
	document.moon.residue.value = (29.5305888310185 - dateComponent.age).toLocaleString(undefined,{maximumFractionDigits:2, minimumFractionDigits:2});

	document.moon.moondate.value = lunarDateFormat.format(modules.Lunar.getLunarDateTime( targetDate ));
	try {

		document.moon.moontime.value = new Date(targetDate.valueOf() + modules.Lunar.getLunarSunTimeAngle(targetDate))
						.toLocaleTimeString(undefined, {timeZone: undef(TZ)} );
	}
	catch (error) {
		document.moon.moontime.value = "--:--:--";
	}
		let [caput, cauda, eclipse] = modules.Lunar.getDraconiticNodes (targetDate);
		document.moon.caput.value = dracoDateFormat.format (caput);
		document.moon.cauda.value = dracoDateFormat.format (cauda);
		myElement = document.getElementById("EclipseField");
		if (eclipse) myElement.setAttribute("class", myElement.getAttribute("class").replace(" attention","") + " attention")
			else myElement.setAttribute("class", myElement.getAttribute("class").replace(" attention",""));
		document.moon.eclipseseason.value = eclipse;

	dateComponent = modules.Lunar.getCELunarDate(targetDate, TZ);
	document.mooncalend.CElunardate.value = 	dateComponent.day;
	document.mooncalend.CElunarmonth.value = 	dateComponent.month;
	document.mooncalend.CElunaryear.value = 	dateComponent.year;
	dateComponent = modules.Lunar.getHegirianLunarDate(targetDate, TZ);	
	document.mooncalend.hegiriandate.value = 	dateComponent.day;
	document.mooncalend.hegirianmonth.value = dateComponent.month;
	document.mooncalend.hegirianyear.value = 	dateComponent.year;
	
	// Update Delta T (seconds)
	let deltaT = modules.getDeltaT(targetDate)/modules.Milliseconds.SECOND_UNIT,
		deltaTAbs = Math.abs(deltaT), deltaTSign = Math.sign(deltaT),
		deltaTAbsDate = new Date (deltaTAbs*1000),
		deltaTDays = Math.floor (deltaTAbsDate.valueOf() / modules.Milliseconds.DAY_UNIT) ;
	document.getElementById ("deltatsec").innerHTML = (deltaTSign == -1 ? "-" : "") + deltaTAbs.toLocaleString();
	document.getElementById ("deltathms").innerHTML = (deltaTSign == -1 ? "-" : "") 
			+ (deltaTDays >= 1 ? deltaTDays + " jours " : "")
			+ deltaTAbsDate.getUTCHours() + " h " + deltaTAbsDate.getUTCMinutes() + " min " + deltaTAbsDate.getUTCSeconds() + " s";
	
	// Yearly figures. Take milesian year.
	computeSignature(mildateComponent.year);		// Recompute all year-specific elements

	// Write Milesian date string near dial
	myElement = document.getElementById("clockmilesiandate"); 	// Milesian date element
	myElement.innerHTML = clockFormat.format(targetDate);
	// Finally update and display clock
	milesianClock.setHands (targetDate, TZ, caput); // Display date on clock.
	milesianClock.setSeasons (mildateComponent.year); // Display also seasons.
}

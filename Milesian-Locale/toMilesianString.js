/* Milesian properties added to Date in order to generate date strings
// Character set is UTF-8
// This code, to be manually imported, set properties to object Date for the Milesian calendar, especially to generate date strings
// Version M2017-12-28 catches MS Edge generated error
// Version M2017-12-26 formal update of M2017-07-04 concerning dependent files
//  toMilesianLocaleDateString ([locale, [options]]) : return a string with date and time, according to locale and options.
// Necessary files:
//	MilesianMonthNames.xml: fetched source of month names - may be provided by milesianMonthNamesString
//	MilesianDateProperties.js (and dependent files)
//	MilesianALertMsg
*/////////////////////////////////////////////////////////////////////////////////////////////
/* Copyright Miletus 2016-2017 - Louis A. de Fouquières
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 1. The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 2. Changes with respect to any former version shall be documented.
//
// The software is provided "as is", without warranty of any kind,
// express of implied, including but not limited to the warranties of
// merchantability, fitness for a particular purpose and noninfringement.
// In no event shall the authors of copyright holders be liable for any
// claim, damages or other liability, whether in an action of contract,
// tort or otherwise, arising from, out of or in connection with the software
// or the use or other dealings in the software.
// Inquiries: www.calendriermilesien.org
*////////////////////////////////////////////////////////////////////////////////
//
// 1. Basic tools of this package
//
// Access to XML file: not working the same way an all platform, is not used is such.
// In file milesianMonthNamesString.js, const pldr is declared, and milesianNames is constructed.
// Note: take care that text items from milesianNames be in the proper chararcter set.
//
// 1.2 Utility simple function
//
function pad(number) {	// utility function, pad 2-digit integer numbers. No control.
	return ( number < 10 ) ? ('0' + number) : number;
}
//
// 2. Methods added to Date object for Milesian dates
//
//////////////////////////////////////////////////////
// The following method elaborate a string giving the date in Milesian, under several locales and options.
// This method is a makeup, the result is not totally in line with the expected results of such functions.
// It just show that these layouts are possible.
//////////////////////////////////////////////////////

Date.prototype.toMilesianLocaleDateString = function (locales = undefined, options = undefined) {

	// if milesianNames not yet established, or not loaded, then return empty (may be this should by settled with an error)
	if (milesianNames == undefined) return ""; else {	

	// Initialise string parts
	let str = ""; 	// the final string for this date;
	let wstr = "", dstr = "", mstr = "", ystr = "" ; // components of date string
//	let tstr = "", tzstr = ""; 	// components of time string. Not used.	
	let wsep = " ", msep = " ", ysep = " ";	// separators of date elements, "/", ", " or " ".
	
	// Establish effective options through "negotiation"
	if (options == undefined) var askedOptions = new Intl.DateTimeFormat (locales)	// require locale and option from present implementation;
	else var askedOptions = new Intl.DateTimeFormat (locales, options); // Computed object from asked locales and options
	var usedOptions = askedOptions.resolvedOptions(); // resolve options to use after "negotiation": 
	// example of standard usedOptions: { locale: "fr-FR", calendar: "gregory", numberingSystem: "latn", timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", year: "numeric" }
	// while specifiying option, you may suppress year, month or day.
	
	// Get effective language and country, and set whether month should come before day
	let lang = usedOptions.locale[0] + usedOptions.locale[1], country = usedOptions.locale[3] + usedOptions.locale[4]; // Decompose Locales string.
	let monthDay = false;	// true for languages and countries where month comes before day.
	

	// Compute weekday if desired. Computation does not trust toLocaleDateString, as TimezoneOffset may be lost.
	if (usedOptions.weekday !== undefined) {
		// toLocaleDateString takes a different timeZone into account that plain JS. So we build an UTC date corresponding to the timeZone date.
		let LocalTime = new Date(); 
		LocalTime.setTime(this.valueOf() - this.getTimezoneOffset() * Chronos.MINUTE_UNIT); // This time enables date computations as if the local time was UTC time.
		try {	// As MS Edge may throw a range error for any date before 0001-01-01, error is catched and wstr set to blank
			// construct weekday with asked language, and in gregorian calendar
			wstr = LocalTime.toLocaleDateString ((lang+"-u-ca-gregory"), {timeZone : "UTC", weekday : usedOptions.weekday}); 
			}
		catch (e) {
			wstr = "";	// case of date range error: weekday set to blank, computations continue
		}
	}

	// Compute year
	switch (usedOptions.year) {	// Compute year string
		case "numeric": ystr = this.getMilesianDate().year; break;
		case "2-digit": ystr = this.getMilesianDate().year % 100; break;
		default : break; }
		
	// Compute year separator
	if (ystr !== "") switch (lang) {	// Language dependent year separator, if month is not numeric
		case "en" : switch (country) { 	// Depending on English-speaking countries, a comma may be necessary
			case "US" : case "CA" : ysep = ", "; monthDay = true; break;
			default : ysep = " "; break
			}; break;		
		case "es" : case "pt" : ysep = " de "; break;
		}
	
	// Compute separator between month and day, depending on month option.
	switch (usedOptions.month) {	
		case "numeric": case "2-digit" : msep = "/"; break;
		case "narrow": case "short" : case "long" : 
			switch (lang) { 		// If month is not a numeric value, there a sign or text. Here we use shortcuts.
				case "es" : case "pt": msep = " de "; break; 
				case "de" : msep = ". "; break; 	// In German, you have to put a dot after the day number. 
				default : msep = " "; break; } 
			break;
		default : break; }
	if (msep == "/" && ysep !== "") ysep = "/"; // If there is a year element, and month element is numeric, year separator shall always be "/"

	// Compute month part of string 
	let Xpath1 = "", node = undefined;	// will be used for searching the month's names in the Locale data registry
	switch (usedOptions.month) {	
//		case "numeric": mstr = this.getMilesianDate().month+1; break; That is the "easy" way, we do not use it. Numeric should give 1m, 2m etc, like "narrow".
		case "2-digit": mstr = pad (this.getMilesianDate().month+1); break;
		case "narrow":	// Only the international (Latin) value can be used in this case
			Xpath1 = "/pldr/ldmlBCP47/calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='narrow']/month[@type="
				+ (this.getMilesianDate().month+1) + "]";
			node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
			mstr = node.stringValue;
			break;
		case "short": case "numeric" :	// Only the international "xm" format, where x is 1 to 12, is used in these cases.
			Xpath1 = "/pldr/ldmlBCP47/calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='abbreviated']/month[@type="
				+ (this.getMilesianDate().month+1) + "]";
			node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
			mstr = node.stringValue;
			break;
		case "long":	// By default, take the Latin name;
			Xpath1 = "/pldr/ldmlBCP47/calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type="
				+ (this.getMilesianDate().month+1) + "]";
			node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
			mstr = node.stringValue;
			// Search if a national ("Locale") name exists
			Xpath1 = "/pldr/ldml/identity/language[@type=" + "'"+lang+"'"+ "]/../calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='wide']/month[@type="
				+ (this.getMilesianDate().month+1) + "]";
			node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
			if (node.stringValue !== "") mstr = node.stringValue; // If found, replace Latin name with language-dependant.
			break;
		default : break; }
		
	// Compute day string, a plain numeric or 2-digit string.	
	switch (usedOptions.day) {	
		case "numeric": dstr = this.getMilesianDate().date; break;	// no blank
		case "2-digit": dstr = pad (this.getMilesianDate().date); break;
		default : break; }
		
//	Finally we do not compute the Time part, since it is a Date (only) function.
/*	if (usedOptions.hour !== undefined || usedOptions.minute !== undefined || usedOptions.hour !== undefined) 
		tstr = new Intl.DateTimeFormat (usedOptions.locale, {hour : usedOptions.hour, minute : usedOptions.minute, second : usedOptions.second}).format(this);
*/	

	//Compute weekday separator, which depends on language
	if (wstr !== "" && dstr !== "") switch (lang) {	
		case "en": case "de": case "es": case "pt": wsep = ", "; break;
		case "da": wsep = (usedOptions.month == "numeric" || usedOptions.month == "2-digit") ? " " : " den "; break;
		default : wsep = " "; break;	} 

	// Concatenate string
	str += wstr + wsep;		// Weekday element
	if (monthDay)   // Construct day and month in order specified
			{ if (mstr !== "") {str += mstr + ((dstr !=="") ? msep + dstr : "")} else str += dstr }
			else  
			{ if (mstr !== "") {str += ((dstr !=="") ? dstr + msep : "" ) + mstr} else str += dstr}	;	
	str += ysep + ystr ;	// Add year separator and year

	return str; }
}

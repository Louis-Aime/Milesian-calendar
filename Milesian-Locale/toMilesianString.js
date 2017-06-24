/* Milesian properties added to Date in order to generate date strings
// Character set is UTF-8
// This code, to be manually imported, set properties to object Date for the Milesian calendar, especially to generate date strings
// Version M2017-07-03
// File MilesianMonthNames.xml is not used in this version, the file has been stringified as "pldr".
//  toMilesianLocaleDateString ([locale, [options]]) : return a string with date and time, according to locale and options.
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
// The next constant is a "private locale date registry", pldr, a reference file in xml, to be parsed into a DOM.
const pldr =
'<?xml version="1.0" encoding="UTF-8" ?> <pldr> <ldmlBCP47> <calendar type="milesian"> <months> <monthContext type="format"> <default type="abbreviated"/>	<monthWidth type="wide"> <month type="1" draft="unconfirmed">unemis</month> <month type="2" draft="unconfirmed">secundemis</month> <month type="3" draft="unconfirmed">tertemis</month> <month type="4" draft="unconfirmed">quartemis</month> <month type="5" draft="unconfirmed">quintemis</month> <month type="6" draft="unconfirmed">sextemis</month> <month type="7" draft="unconfirmed">septemis</month> <month type="8" draft="unconfirmed">octemis</month> <month type="9" draft="unconfirmed">novemis</month> <month type="10" draft="unconfirmed">decemis</month> <month type="11" draft="unconfirmed">undecemis</month> <month type="12" draft="unconfirmed">duodecemis</month> </monthWidth> <monthWidth type="abbreviated"> <month type="1" draft="unconfirmed">1m</month> <month type="2" draft="unconfirmed">2m</month> <month type="3" draft="unconfirmed">3m</month> <month type="4" draft="unconfirmed">4m</month> <month type="5" draft="unconfirmed">5m</month> <month type="6" draft="unconfirmed">6m</month> <month type="7" draft="unconfirmed">7m</month> <month type="8" draft="unconfirmed">8m</month> <month type="9" draft="unconfirmed">9m</month> <month type="10" draft="unconfirmed">10m</month> <month type="11" draft="unconfirmed">11m</month> <month type="12" draft="unconfirmed">12m</month> </monthWidth> <monthWidth type="narrow"> <month type="1" draft="unconfirmed">U</month> <month type="2" draft="unconfirmed">S</month> <month type="3" draft="unconfirmed">T</month> <month type="4" draft="unconfirmed">Q</month> <month type="5" draft="unconfirmed">Q</month> <month type="6" draft="unconfirmed">S</month> <month type="7" draft="unconfirmed">S</month> <month type="8" draft="unconfirmed">O</month> <month type="9" draft="unconfirmed">N</month> <month type="10" draft="unconfirmed">D</month> <month type="11" draft="unconfirmed">U</month> <month type="12" draft="unconfirmed">D</month> </monthWidth> </monthContext> <monthContext type="stand-alone"> <default type="abbreviated"/> <monthWidth type="abbreviated"> <month type="1" draft="unconfirmed">1m</month> <month type="2" draft="unconfirmed">2m</month> <month type="3" draft="unconfirmed">3m</month> <month type="4" draft="unconfirmed">4m</month> <month type="5" draft="unconfirmed">5m</month> <month type="6" draft="unconfirmed">6m</month> <month type="7" draft="unconfirmed">7m</month> <month type="8" draft="unconfirmed">8m</month> <month type="9" draft="unconfirmed">9m</month> <month type="10" draft="unconfirmed">10m</month> <month type="11" draft="unconfirmed">11m</month> <month type="12" draft="unconfirmed">12m</month> </monthWidth> <monthWidth type="narrow"> <month type="1" draft="unconfirmed">U</month> <month type="2" draft="unconfirmed">S</month> <month type="3" draft="unconfirmed">T</month> <month type="4" draft="unconfirmed">Q</month> <month type="5" draft="unconfirmed">Q</month> <month type="6" draft="unconfirmed">S</month> <month type="7" draft="unconfirmed">S</month> <month type="8" draft="unconfirmed">O</month> <month type="9" draft="unconfirmed">N</month> <month type="10" draft="unconfirmed">D</month> <month type="11" draft="unconfirmed">U</month> <month type="12" draft="unconfirmed">D</month> </monthWidth> </monthContext> </months> <quarters> <quarterContext type="format"> <quarterWidth type="abbreviated"> <quarter type="1" draft="unconfirmed">T1</quarter> <quarter type="2" draft="unconfirmed">T2</quarter> <quarter type="3" draft="unconfirmed">T3</quarter> <quarter type="4" draft="unconfirmed">T4</quarter> </quarterWidth> <quarterWidth type="wide"> <quarter type="1" draft="unconfirmed">primum spatium trimestre</quarter> <quarter type="2" draft="unconfirmed">secundum spatium trimestre</quarter> <quarter type="3" draft="unconfirmed">tertium spatium trimestre</quarter> <quarter type="4" draft="unconfirmed">quartum spatium trimestre</quarter> </quarterWidth> </quarterContext> <quarterContext type="stand-alone"> <quarterWidth type="abbreviated"> <quarter type="1" draft="unconfirmed">T1</quarter> <quarter type="2" draft="unconfirmed">T2</quarter> <quarter type="3" draft="unconfirmed">T3</quarter> <quarter type="4" draft="unconfirmed">T4</quarter> </quarterWidth> <quarterWidth type="wide"> <quarter type="1" draft="unconfirmed">primo spatio trimestre</quarter> <quarter type="2" draft="unconfirmed">secundo spatio trimestre</quarter> <quarter type="3" draft="unconfirmed">tertio spatio trimestre</quarter> <quarter type="4" draft="unconfirmed">quarto spatio trimestre</quarter> </quarterWidth> </quarterContext> </quarters> </calendar> </ldmlBCP47> <ldml> <identity> <language type="fr"/> <calendar type="milesian"> <months> <monthContext type="format"> <default type="abbreviated"/> <monthWidth type="wide"> <month type="1" draft="unconfirmed">unème</month> <month type="2" draft="unconfirmed">secundème</month> <month type="3" draft="unconfirmed">tertème</month> <month type="4" draft="unconfirmed">quartème</month> <month type="5" draft="unconfirmed">quintème</month> <month type="6" draft="unconfirmed">sextème</month> <month type="7" draft="unconfirmed">septème</month> <month type="8" draft="unconfirmed">octème</month> <month type="9" draft="unconfirmed">novème</month> <month type="10" draft="unconfirmed">decème</month> <month type="11" draft="unconfirmed">undécème</month> <month type="12" draft="unconfirmed">duodécème</month> </monthWidth> </monthContext> <monthContext type="stand-alone"> <default type="abbreviated"/> <monthWidth type="wide"> <month type="1" draft="unconfirmed">unème</month> <month type="2" draft="unconfirmed">secundème</month> <month type="3" draft="unconfirmed">tertème</month> <month type="4" draft="unconfirmed">quartème</month> <month type="5" draft="unconfirmed">quintème</month> <month type="6" draft="unconfirmed">sextème</month> <month type="7" draft="unconfirmed">septème</month> <month type="8" draft="unconfirmed">octème</month> <month type="9" draft="unconfirmed">novème</month> <month type="10" draft="unconfirmed">decème</month> <month type="11" draft="unconfirmed">undécème</month> <month type="12" draft="unconfirmed">duodécème</month> </monthWidth> </monthContext> </months> </calendar> </identity> <identity> <language type="en"/> <calendar type="milesian"> <months> <monthContext type="format"> <default type="abbreviated"/> <monthWidth type="wide"> <month type="1" draft="unconfirmed">Firstem</month> <month type="2" draft="unconfirmed">Secondem</month> <month type="3" draft="unconfirmed">Thirdem</month> <month type="4" draft="unconfirmed">Fourthem</month> <month type="5" draft="unconfirmed">Fifthem</month> <month type="6" draft="unconfirmed">Sixthem</month> <month type="7" draft="unconfirmed">Seventhem</month> <month type="8" draft="unconfirmed">Eighthem</month> <month type="9" draft="unconfirmed">Ninthem</month> <month type="10" draft="unconfirmed">Tenthem</month> <month type="11" draft="unconfirmed">Eleventhem</month> <month type="12" draft="unconfirmed">Twelfthem</month> </monthWidth> </monthContext> <monthContext type="stand-alone"> <default type="abbreviated"/> <monthWidth type="wide"> <month type="1" draft="unconfirmed">Firstem</month> <month type="2" draft="unconfirmed">Secondem</month> <month type="3" draft="unconfirmed">Thirdem</month> <month type="4" draft="unconfirmed">Fourthem</month> <month type="5" draft="unconfirmed">Fifthem</month> <month type="6" draft="unconfirmed">Sixthem</month> <month type="7" draft="unconfirmed">Seventhem</month> <month type="8" draft="unconfirmed">Eighthem</month> <month type="9" draft="unconfirmed">Ninthem</month> <month type="10" draft="unconfirmed">Tenthem</month> <month type="11" draft="unconfirmed">Eleventhem</month> <month type="12" draft="unconfirmed">Twelfthem</month> </monthWidth> </monthContext> </months> </calendar> </identity> </ldml></pldr>'
//
// Next suppressed lines opened the original xml files with XMLHttpRequest.
//	
var parser = new DOMParser (); // Transforming pldr object into a DOM
var milesianNames = parser.parseFromString(pldr, "application/xml"); // milesianNames is the document containing the month names of the Milesian calendar, in several languages
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
	let str = ""; 	// the final string for this date;
	let wstr = "", dstr = "", mstr = "", ystr = "", tstr = "", tzstr = ""; // components of date string
	let wsep = "", msep = "", ysep = "";	// separators of date elements, "/", ", " or " ".
	if (options == undefined) var askedOptions = new Intl.DateTimeFormat (locales)	// require locale and option from present implementation;
	else var askedOptions = new Intl.DateTimeFormat (locales, options);
	var usedOptions = askedOptions.resolvedOptions(); // the options used after negotiation: 
	// example of standard usedOptions: { locale: "fr-FR", calendar: "gregory", numberingSystem: "latn", timeZone: "Europe/Paris", day: "2-digit", month: "2-digit", year: "numeric" }
	// while specifiying option, you may suppress year, month or day.
	let lang = usedOptions.locale[0] + usedOptions.locale[1], country = usedOptions.locale[3] + usedOptions.locale[4];
	let Xpath1 = "", node = undefined;	// will be used for searching the month's names in the Locale data registry
	// Compute weekday if desired
	if (usedOptions.weekday !== undefined) wstr = this.toLocaleDateString (usedOptions.locale, {weekday : usedOptions.weekday}); // construct weekday using existing data;
	// Compute year
	switch (usedOptions.year) {	// Compute year string
		case "numeric": ystr = this.getMilesianDate().year; break;
		case "2-digit": ystr = this.getMilesianDate().year % 100; break;
		default : break; }
	if (ystr !== "") switch (lang) {	// Language dependent year separator, in month is not numeric
		case "en" : ysep = ", "; break;
		case "es" : ysep = " de "; break;
		default : ysep = " "; break};
	switch (usedOptions.month) {	// Compute separator between month and day
		case "numeric": case "2-digit" : msep = "/"; break;
		case "narrow": case "short" : case "long" : 
			switch (lang) { 
				case "es" : msep = " de "; break; 
				default : msep = " "; break; } 
			break;
		default : break; }
	if (msep == "/" && ysep !== "") ysep = "/"; // If there is a year element, and month element is numeric, year separator shall always be "/"
	switch (usedOptions.month) {	// Compute month part of string 
		case "numeric": mstr = this.getMilesianDate().month+1; break;
		case "2-digit": mstr = pad (this.getMilesianDate().month+1); break;
		case "narrow":	// Only the international (Latin) value can be used in this case
			Xpath1 = "/pldr/ldmlBCP47/calendar[@type='milesian']/months/monthContext[@type='format']/monthWidth[@type='narrow']/month[@type="
				+ (this.getMilesianDate().month+1) + "]";
			node = milesianNames.evaluate(Xpath1, milesianNames, null, XPathResult.STRING_TYPE, null);
			mstr = node.stringValue;
			break;
		case "short":	// Only the international "xm" format, where x is 1 to 12, is used in this case.
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
	switch (usedOptions.day) {
		case "numeric": dstr = this.getMilesianDate().date; break;
		case "2-digit": dstr = pad (this.getMilesianDate().date); break;
		default : break; }	
	if (usedOptions.hour !== undefined || usedOptions.minute !== undefined || usedOptions.hour !== undefined) 
		tstr = new Intl.DateTimeFormat (usedOptions.locale, {hour : usedOptions.hour, minute : usedOptions.minute, second : usedOptions.second}).format(this);
	if (wstr !== "" && dstr !== "") switch (lang) {	//Compute weekday separator, which depends on language
		case "en" : wsep = ", "; break;
		case "de" : wsep = " den "; break;
		default : wsep = " "; break;	} 
	// Begin forming the complete string
	str += wstr + wsep;
	if (country == "US") { 
		if (mstr !== "") {str += mstr + ((dstr !=="") ? msep + dstr : "")} else str += dstr;
	} else {
		if (mstr !== "") {str += ((dstr !=="") ? dstr + msep : "" ) + mstr} else str += dstr;
	};
	str += ysep + ystr + ((tstr !== "") ? " " + tstr : "");
	return str; 
}

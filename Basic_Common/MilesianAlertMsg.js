/* MilesianAlertMsg
Language dependant messages to be used with Milesian demonstrator routines
This version UTF-8 to be recoded as necessary
Contents
	function milesianAlertMsg (inputError) : return a string with an error message in current system language
Versions
	M2017-12-23, changes from M2017-08:
		Delete MilesianAlertMsg object (no longer used)
		Suppress ":" at end of messages, but leave " " (blank character)
	M2018-05
		Enhance messages in German
		New message entries: 
			invalidCode (for e formatting option)
			browserError (after error catched because browser does not handle certain JS objects, like Unicode formatter objects)
	M2018-11-02
		New message entry : outOfRange	
	M2018-11-11 : JSdoc comments, make code simplier
	M2020-01-12 : strict mode
Required:
	No other file required
*/
/* Copyright Miletus 2017-2020 - Louis A. de Fouquières
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
/** Gives a string of a message in the language set by Locale.
 * @param {string} inputError - the name of the message
 * available messages: invalidInput, nonNumeric, nonInteger, invalidDate, invalidCode, browserError, outOfRange
 * @return {string} the suitable message, in the language set with the locale, or in English
 * languages are : en, fr, de, es, pt.
*/
function milesianAlertMsg (inputError) {	// Prepare an error message in suitable language
	var	languages = [ "en", "fr", "de", "es", "pt" ];
	var errorMsg = {
		"invalidInput": {
			en : "Invalid input ",
			fr : "Saisie invalide ",
			de : "Ungültige Eingabe ",
			es : "Entrada inválida ",
			pt : "Entrada inválida "
			},
		"nonNumeric" : { 
			en	: "Non numeric input ",
			fr	: "Saisie non numérique ",
			de	: "Nicht numerische Eingabe ",
			es	: "Entrada no numérica ",
			pt	: "Entrada não numérica "
			},
		"nonInteger" : {
			en	: "Non integer input ",
			fr	: "Saisie non entière ",
			de	: "Nicht ganzzahlige Zahl",
			es	: "Entrada no entera ",
			pt	: "Entrada não inteira "
			},
		"invalidDate" : {
			en	: "Invalid date or time ",
			fr	: "Date ou heure non valide ",
			de	: "Ungültiges Datum oder Uhrzeit ",
			es	: "Fecha o hora no válida ",
			pt	: "Data ou hora inválida "
			},
		"invalidCode" : {
			en	: "Invalid code ",
			fr	: "Code non valide ",
			de	: "Ungültiger Code ",
			es	: "Código inválido ",
			pt	: "Código inválido "
			},
		"browserError" : {
			en	: "Internet browser error ",
			fr	: "Erreur du navigateur ",
			de	: "Internetbrowser Fehler ",
			es	: "Error de navegador ",
			pt	: "Erro no navegador "
			},
		"outOfRange" : {
			en	: "Date or value out of range ",
			fr	: "Date ou valeur hors limites ",
			de	: "Datum oder Wert außerhalb Bereichs ",
			es	: "Fecha o valor fuera de límites ",
			pt	: "Data ou valor fora do intervalo "	
			}
		};
	let usedLang = "en";
	let lang = new Intl.DateTimeFormat().resolvedOptions().locale.substring(0,2);
	for (let i = 0; i < languages.length; i++) if (lang == languages[i]) usedLang = lang; // Set usedLang to one of our languages, else to "en".
	return errorMsg[inputError][usedLang];
}
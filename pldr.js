/* pldr.js  Private Locale Data Register as a DOM
Charset UTF-8. This file contains non-ANSI characters.
Contents:
	pldr: stringified version of an XML document organising non built-in calendar data for the Unicode tools 
	pldrDOM: a DOM object parsed from pldr.
Notes:
	1. If this file is used for Web site, consider changing "const" to "var" in order to avoid constant redeclaration error,
	2. pldrDOM must be declared after pldr.
	3. With certain CMS, this file could not be exposed as a module. pldrDOM has to be made visible from a web page.
*/
/* Version	M2020-12-27 no export
	M2020612-08 use export
	M2020-11-18:	No "numeric" monthWidth in stand-alone monthContext, formatToParts shall build 1 or 2 digit numbers
	M2020-10-28: adapted and names changed for the new packaged version of calendar routines
	M2020-01-12: strict mode
	M2019-07-24: Control bidirectionnal issues by inserting Unicode FSI & PDI characters
	M2018-11-11: Enhance comments, put JSDoc comments.
	M2018-06-04
		Build an original narrow type
		type format monthWidth numeric differs from type stand-alone.
	M2017: Build month names in Latin (default), fr, en, de, es, pt

*/
/* Copyright Miletus 2016-2020 - Louis A. de Fouquières
Inquiries: www.calendriermilesien.org
*/
"use strict";
/** Stringified XML base, consisting in 2 blocks: 
 * ldmlBCP47 declares Milesian calendar general item, 
 * ldml declares language specific names
*/
const pldrstring =
'<?xml version="1.0" encoding="UTF-8" ?>\
<!-- Milesian month names definition - non language-specific section  -->\
<!-- <!DOCTYPE ldmlBCP47 SYSTEM "../../common/dtd/ldmlBCP47.dtd"> -->\
<pldr> <!-- Private locale data registry - for makeup -->\
<ldmlBCP47>\
<calendar type="milesian"> <!-- name will have to be registred -->\
	<months>\
	<monthContext type="format">\
	<default type="abbreviated"/> <!-- Is it necessary ? -->\
		<monthWidth type="wide">\
			<month type="1" draft="unconfirmed">⁨unemis⁩</month>\
			<month type="2" draft="unconfirmed">⁨secundemis⁩</month>\
			<month type="3" draft="unconfirmed">⁨tertemis⁩</month>\
			<month type="4" draft="unconfirmed">⁨quartemis⁩</month>\
			<month type="5" draft="unconfirmed">⁨quintemis⁩</month>\
			<month type="6" draft="unconfirmed">⁨sextemis⁩</month>\
			<month type="7" draft="unconfirmed">⁨septemis⁩</month>\
			<month type="8" draft="unconfirmed">⁨octemis⁩</month>\
			<month type="9" draft="unconfirmed">⁨novemis⁩</month>\
			<month type="10" draft="unconfirmed">⁨decemis⁩</month>\
			<month type="11" draft="unconfirmed">⁨undecemis⁩</month>\
			<month type="12" draft="unconfirmed">⁨duodecemis⁩</month>\
		</monthWidth>\
		<monthWidth type="abbreviated"> <!-- short international explicit notation -->\
			<month type="1" draft="unconfirmed">⁨1m⁩</month>\
			 <month type="2" draft="unconfirmed">⁨2m⁩</month>\
			 <month type="3" draft="unconfirmed">⁨3m⁩</month>\
			 <month type="4" draft="unconfirmed">⁨4m⁩</month>\
			 <month type="5" draft="unconfirmed">⁨5m⁩</month>\
			 <month type="6" draft="unconfirmed">⁨6m⁩</month>\
			 <month type="7" draft="unconfirmed">⁨7m⁩</month>\
			 <month type="8" draft="unconfirmed">⁨8m⁩</month>\
			 <month type="9" draft="unconfirmed">⁨9m⁩</month>\
			 <month type="10" draft="unconfirmed">⁨10m⁩</month>\
			 <month type="11" draft="unconfirmed">⁨11m⁩</month>\
			 <month type="12" draft="unconfirmed">⁨12m⁩</month>\
		</monthWidth>\
		<monthWidth type="narrow"> <!-- unambiguous coding system with only one letter -->\
			 <month type="1" draft="unconfirmed">⁨P⁩</month>\
			 <month type="2" draft="unconfirmed">⁨S⁩</month>\
			 <month type="3" draft="unconfirmed">⁨T⁩</month>\
			 <month type="4" draft="unconfirmed">⁨C⁩</month>\
			 <month type="5" draft="unconfirmed">⁨Q⁩</month>\
			 <month type="6" draft="unconfirmed">⁨X⁩</month>\
			 <month type="7" draft="unconfirmed">⁨E⁩</month>\
			 <month type="8" draft="unconfirmed">⁨O⁩</month>\
			 <month type="9" draft="unconfirmed">⁨N⁩</month>\
			 <month type="10" draft="unconfirmed">⁨D⁩</month>\
			 <month type="11" draft="unconfirmed">⁨U⁩</month>\
			 <month type="12" draft="unconfirmed">⁨Z⁩</month>\
		</monthWidth>\
		<monthWidth type="numeric"> 	<!-- under "format" type, i.e. with compound date string, "numeric" width is like "abbreviated" -->	\
			 <month type="1" draft="unconfirmed">⁨1m⁩</month>\
			 <month type="2" draft="unconfirmed">⁨2m⁩</month>\
			 <month type="3" draft="unconfirmed">⁨3m⁩</month>\
			 <month type="4" draft="unconfirmed">⁨4m⁩</month>\
			 <month type="5" draft="unconfirmed">⁨5m⁩</month>\
			 <month type="6" draft="unconfirmed">⁨6m⁩</month>\
			 <month type="7" draft="unconfirmed">⁨7m⁩</month>\
			 <month type="8" draft="unconfirmed">⁨8m⁩</month>\
			 <month type="9" draft="unconfirmed">⁨9m⁩</month>\
			 <month type="10" draft="unconfirmed">⁨10m⁩</month>\
			 <month type="11" draft="unconfirmed">⁨11m⁩</month>\
			 <month type="12" draft="unconfirmed">⁨12m⁩</month>\
		</monthWidth>\
	</monthContext>\
	<monthContext type="stand-alone">\
		<default type="abbreviated"/>\
		<monthWidth type="wide">\
			<month type="1" draft="unconfirmed">⁨unemis⁩</month>\
			<month type="2" draft="unconfirmed">⁨secundemis⁩</month>\
			<month type="3" draft="unconfirmed">⁨tertemis⁩</month>\
			<month type="4" draft="unconfirmed">⁨quartemis⁩</month>\
			<month type="5" draft="unconfirmed">⁨quintemis⁩</month>\
			<month type="6" draft="unconfirmed">⁨sextemis⁩</month>\
			<month type="7" draft="unconfirmed">⁨septemis⁩</month>\
			<month type="8" draft="unconfirmed">⁨octemis⁩</month>\
			<month type="9" draft="unconfirmed">⁨novemis⁩</month>\
			<month type="10" draft="unconfirmed">⁨decemis⁩</month>\
			<month type="11" draft="unconfirmed">⁨undecemis⁩</month>\
			<month type="12" draft="unconfirmed">⁨duodecemis⁩</month>\
		</monthWidth>\
		 <monthWidth type="abbreviated">\
			 <month type="1" draft="unconfirmed">⁨1m⁩</month>\
			 <month type="2" draft="unconfirmed">⁨2m⁩</month>\
			<month type="3" draft="unconfirmed">⁨3m⁩</month>\
			<month type="4" draft="unconfirmed">⁨4m⁩</month>\
			<month type="5" draft="unconfirmed">⁨5m⁩</month>\
			<month type="6" draft="unconfirmed">⁨6m⁩</month>\
			<month type="7" draft="unconfirmed">⁨7m⁩</month>\
			<month type="8" draft="unconfirmed">⁨8m⁩</month>\
			<month type="9" draft="unconfirmed">⁨9m⁩</month>\
			<month type="10" draft="unconfirmed">⁨10m⁩</month>\
			 <month type="11" draft="unconfirmed">⁨11m⁩</month>\
			 <month type="12" draft="unconfirmed">⁨12m⁩</month>\
		</monthWidth>\
		<monthWidth type="narrow"> <!-- same unambiguous coding system with only one letter -->\
			 <month type="1" draft="unconfirmed">⁨P⁩</month>\
			 <month type="2" draft="unconfirmed">⁨S⁩</month>\
			 <month type="3" draft="unconfirmed">⁨T⁩</month>\
			 <month type="4" draft="unconfirmed">⁨C⁩</month>\
			 <month type="5" draft="unconfirmed">⁨Q⁩</month>\
			 <month type="6" draft="unconfirmed">⁨X⁩</month>\
			 <month type="7" draft="unconfirmed">⁨E⁩</month>\
			 <month type="8" draft="unconfirmed">⁨O⁩</month>\
			 <month type="9" draft="unconfirmed">⁨N⁩</month>\
			 <month type="10" draft="unconfirmed">⁨D⁩</month>\
			 <month type="11" draft="unconfirmed">⁨U⁩</month>\
			 <month type="12" draft="unconfirmed">⁨Z⁩</month>\
		</monthWidth>\
		</monthContext>\
	</months>\
	<quarters>\
	  <quarterContext type="format">\
		 <quarterWidth type="abbreviated">\
			 <quarter type="1" draft="unconfirmed">⁨T1m⁩</quarter>\
			 <quarter type="2" draft="unconfirmed">⁨T2m⁩</quarter>\
			 <quarter type="3" draft="unconfirmed">⁨T3m⁩</quarter>\
			 <quarter type="4" draft="unconfirmed">⁨T4m⁩</quarter>\
		</quarterWidth>\
		<quarterWidth type="wide">\
			 <quarter type="1" draft="unconfirmed">⁨primum spatium trimestre⁩</quarter>\
			 <quarter type="2" draft="unconfirmed">⁨secundum spatium trimestre⁩</quarter>\
			 <quarter type="3" draft="unconfirmed">⁨tertium spatium trimestre⁩</quarter>\
			 <quarter type="4" draft="unconfirmed">⁨quartum spatium trimestre⁩</quarter>\
		</quarterWidth>\
	  </quarterContext>\
	  <quarterContext type="stand-alone">\
		 <quarterWidth type="abbreviated">\
			 <quarter type="1" draft="unconfirmed">⁨T1m⁩</quarter>\
			 <quarter type="2" draft="unconfirmed">⁨T2m⁩</quarter>\
			 <quarter type="3" draft="unconfirmed">⁨T3m⁩</quarter>\
			 <quarter type="4" draft="unconfirmed">⁨T4m⁩</quarter>\
		</quarterWidth>\
		<quarterWidth type="wide">\
			 <quarter type="1" draft="unconfirmed">⁨primo spatio trimestre⁩</quarter>\
			 <quarter type="2" draft="unconfirmed">⁨secundo spatio trimestre⁩</quarter>\
			 <quarter type="3" draft="unconfirmed">⁨tertio spatio trimestre⁩</quarter>\
			 <quarter type="4" draft="unconfirmed">⁨quarto spatio trimestre⁩</quarter>\
		</quarterWidth>\
	  </quarterContext>\
	</quarters>\
  </calendar>\
</ldmlBCP47>\
<!-- Here starts the ldml part - language-specific -->\
<ldml>\
	<identity>\
		<language type="fr"/>\
		<calendar type="milesian">\
			<months>\
			  <monthContext type="format">\
				<default type="abbreviated"/> <!-- Is it necessary ? -->\
				<monthWidth type="wide">\
					<month type="1" draft="unconfirmed">unème</month>\
					<month type="2" draft="unconfirmed">secondème</month>\
					<month type="3" draft="unconfirmed">tertème</month>\
					<month type="4" draft="unconfirmed">quartème</month>\
					<month type="5" draft="unconfirmed">quintème</month>\
					<month type="6" draft="unconfirmed">sextème</month>\
					<month type="7" draft="unconfirmed">septème</month>\
					<month type="8" draft="unconfirmed">octème</month>\
					<month type="9" draft="unconfirmed">novème</month>\
					<month type="10" draft="unconfirmed">décème</month>\
					<month type="11" draft="unconfirmed">onzème</month>\
					<month type="12" draft="unconfirmed">douzème</month>\
				</monthWidth>\
			  </monthContext>\
			  <monthContext type="stand-alone">\
				<default type="abbreviated"/> <!-- Is it necessary ? -->\
				<monthWidth type="wide">\
					<month type="1" draft="unconfirmed">unème</month>\
					<month type="2" draft="unconfirmed">secondème</month>\
					<month type="3" draft="unconfirmed">tertème</month>\
					<month type="4" draft="unconfirmed">quartème</month>\
					<month type="5" draft="unconfirmed">quintème</month>\
					<month type="6" draft="unconfirmed">sextème</month>\
					<month type="7" draft="unconfirmed">septème</month>\
					<month type="8" draft="unconfirmed">octème</month>\
					<month type="9" draft="unconfirmed">novème</month>\
					<month type="10" draft="unconfirmed">décème</month>\
					<month type="11" draft="unconfirmed">onzème</month>\
					<month type="12" draft="unconfirmed">douzème</month>\
				</monthWidth>\
			  </monthContext>\
			</months>\
		</calendar>\
	</identity>\
	<identity>\
		<language type="en"/>\
		<calendar type="milesian">\
			<months>\
			  <monthContext type="format">\
				<default type="abbreviated"/> <!-- Is it necessary ? -->\
				<monthWidth type="wide">\
					<month type="1" draft="unconfirmed">Firstem</month>\
					<month type="2" draft="unconfirmed">Secondem</month>\
					<month type="3" draft="unconfirmed">Thirdem</month>\
					<month type="4" draft="unconfirmed">Fourthem</month>\
					<month type="5" draft="unconfirmed">Fifthem</month>\
					<month type="6" draft="unconfirmed">Sixthem</month>\
					<month type="7" draft="unconfirmed">Seventhem</month>\
					<month type="8" draft="unconfirmed">Eighthem</month>\
					<month type="9" draft="unconfirmed">Ninthem</month>\
					<month type="10" draft="unconfirmed">Tenthem</month>\
					<month type="11" draft="unconfirmed">Eleventhem</month>\
					<month type="12" draft="unconfirmed">Twelfthem</month>\
				</monthWidth>\
			  </monthContext>\
			  <monthContext type="stand-alone">\
				<default type="abbreviated"/> <!-- Is it necessary ? -->\
				<monthWidth type="wide">\
					<month type="1" draft="unconfirmed">Firstem</month>\
					<month type="2" draft="unconfirmed">Secondem</month>\
					<month type="3" draft="unconfirmed">Thirdem</month>\
					<month type="4" draft="unconfirmed">Fourthem</month>\
					<month type="5" draft="unconfirmed">Fifthem</month>\
					<month type="6" draft="unconfirmed">Sixthem</month>\
					<month type="7" draft="unconfirmed">Seventhem</month>\
					<month type="8" draft="unconfirmed">Eighthem</month>\
					<month type="9" draft="unconfirmed">Ninthem</month>\
					<month type="10" draft="unconfirmed">Tenthem</month>\
					<month type="11" draft="unconfirmed">Eleventhem</month>\
					<month type="12" draft="unconfirmed">Twelfthem</month>\
				</monthWidth>\
			  </monthContext>\
			</months>\
		</calendar>\
	</identity>\
	<identity>\
		<language type="de"/>\
		<calendar type="milesian">\
			<months>\
			  <monthContext type="format">\
				<default type="abbreviated"/> <!-- Is it necessary ? -->\
				<monthWidth type="wide">\
					<month type="1" draft="unconfirmed">Erstme</month>\
					<month type="2" draft="unconfirmed">Zweitme</month>\
					<month type="3" draft="unconfirmed">Drittme</month>\
					<month type="4" draft="unconfirmed">Viertme</month>\
					<month type="5" draft="unconfirmed">Fünftme</month>\
					<month type="6" draft="unconfirmed">Sechstme</month>\
					<month type="7" draft="unconfirmed">Siebentme</month>\
					<month type="8" draft="unconfirmed">Achtme</month>\
					<month type="9" draft="unconfirmed">Neuntme</month>\
					<month type="10" draft="unconfirmed">Zehntme</month>\
					<month type="11" draft="unconfirmed">Elftme</month>\
					<month type="12" draft="unconfirmed">Zwölftme</month>\
				</monthWidth>\
			  </monthContext>\
			  <monthContext type="stand-alone">\
				<default type="abbreviated"/> <!-- Is it necessary ? -->\
				<monthWidth type="wide">\
					<month type="1" draft="unconfirmed">Erstme</month>\
					<month type="2" draft="unconfirmed">Zweitme</month>\
					<month type="3" draft="unconfirmed">Drittme</month>\
					<month type="4" draft="unconfirmed">Viertme</month>\
					<month type="5" draft="unconfirmed">Fünftme</month>\
					<month type="6" draft="unconfirmed">Sechstme</month>\
					<month type="7" draft="unconfirmed">Siebentme</month>\
					<month type="8" draft="unconfirmed">Achtme</month>\
					<month type="9" draft="unconfirmed">Neuntme</month>\
					<month type="10" draft="unconfirmed">Zehntme</month>\
					<month type="11" draft="unconfirmed">Elftme</month>\
					<month type="12" draft="unconfirmed">Zwölftme</month>\
				</monthWidth>\
			  </monthContext>\
			</months>\
		</calendar>\
	</identity>\
	<identity>\
		<language type="es"/>\
		<calendar type="milesian">\
			<months>\
			  <monthContext type="format">\
				<default type="abbreviated"/> <!-- Is it necessary ? -->\
				<monthWidth type="wide">\
					<month type="1" draft="unconfirmed">primerem</month>\
					<month type="2" draft="unconfirmed">segondem</month>\
					<month type="3" draft="unconfirmed">tercerem</month>\
					<month type="4" draft="unconfirmed">cuartem</month>\
					<month type="5" draft="unconfirmed">quintem</month>\
					<month type="6" draft="unconfirmed">sextem</month>\
					<month type="7" draft="unconfirmed">séptimem</month>\
					<month type="8" draft="unconfirmed">octavem</month>\
					<month type="9" draft="unconfirmed">novenem</month>\
					<month type="10" draft="unconfirmed">décimem</month>\
					<month type="11" draft="unconfirmed">undécimem</month>\
					<month type="12" draft="unconfirmed">duodécimem</month>\
				</monthWidth>\
			  </monthContext>\
			  <monthContext type="stand-alone">\
				<default type="abbreviated"/> <!-- Is it necessary ? -->\
				<monthWidth type="wide">\
					<month type="1" draft="unconfirmed">primerem</month>\
					<month type="2" draft="unconfirmed">segondem</month>\
					<month type="3" draft="unconfirmed">tercerem</month>\
					<month type="4" draft="unconfirmed">cuartem</month>\
					<month type="5" draft="unconfirmed">quintem</month>\
					<month type="6" draft="unconfirmed">sextem</month>\
					<month type="7" draft="unconfirmed">séptimem</month>\
					<month type="8" draft="unconfirmed">octavem</month>\
					<month type="9" draft="unconfirmed">novenem</month>\
					<month type="10" draft="unconfirmed">décimem</month>\
					<month type="11" draft="unconfirmed">undécimem</month>\
					<month type="12" draft="unconfirmed">duodécimem</month>\
				</monthWidth>\
			  </monthContext>\
			</months>\
		</calendar>\
	</identity>\
	<identity>\
		<language type="pt"/>\
		<calendar type="milesian">\
			<months>\
			  <monthContext type="format">\
				<default type="abbreviated"/> <!-- Is it necessary ? -->\
				<monthWidth type="wide">\
					<month type="1" draft="unconfirmed">primeirem</month>\
					<month type="2" draft="unconfirmed">segundem</month>\
					<month type="3" draft="unconfirmed">terceirem</month>\
					<month type="4" draft="unconfirmed">quartem</month>\
					<month type="5" draft="unconfirmed">quintem</month>\
					<month type="6" draft="unconfirmed">sextem</month>\
					<month type="7" draft="unconfirmed">sétimem</month>\
					<month type="8" draft="unconfirmed">oitavem</month>\
					<month type="9" draft="unconfirmed">nonem</month>\
					<month type="10" draft="unconfirmed">décimem</month>\
					<month type="11" draft="unconfirmed">undécimem</month>\
					<month type="12" draft="unconfirmed">duodécimem</month>\
				</monthWidth>\
			  </monthContext>\
			  <monthContext type="stand-alone">\
				<default type="abbreviated"/> <!-- Is it necessary ? -->\
				<monthWidth type="wide">\
					<month type="1" draft="unconfirmed">primeirem</month>\
					<month type="2" draft="unconfirmed">segundem</month>\
					<month type="3" draft="unconfirmed">terceirem</month>\
					<month type="4" draft="unconfirmed">quartem</month>\
					<month type="5" draft="unconfirmed">quintem</month>\
					<month type="6" draft="unconfirmed">sextem</month>\
					<month type="7" draft="unconfirmed">sétimem</month>\
					<month type="8" draft="unconfirmed">oitavem</month>\
					<month type="9" draft="unconfirmed">nonem</month>\
					<month type="10" draft="unconfirmed">décimem</month>\
					<month type="11" draft="unconfirmed">undécimem</month>\
					<month type="12" draft="unconfirmed">duodécimem</month>\
				</monthWidth>\
			  </monthContext>\
			</months>\
		</calendar>\
	</identity>	\
  </ldml>\
</pldr>'

/** The pldrstring parsed to a DOM.
*/
var pldrDOM = new DOMParser().parseFromString(pldrstring, "application/xml");
//export { pldrDOM as default }
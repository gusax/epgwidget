# EPG tv-widget #
_EPG-widgeten visar tvtablåer i Dashboard. EPG-widgeten är efterföljaren till Xmltv-widgeten. Välj tablåer fritt bland de tillgängliga kanalerna från tv.swedb.se, och kombinera dessa med personliga filmbetyg från filmtipset.se._

![http://epgwidget.googlecode.com/svn/trunk/docs/Front.jpg](http://epgwidget.googlecode.com/svn/trunk/docs/Front.jpg)

## Nuvarande funktionalitet ##
  1. Välj fritt från alla de [kanaler](http://tv.swedb.se/xmltv/channels.html) som finns att tillgå från [tv.swedb.se](http://tv.swedb.se). Inget medlemskap behövs för att välja vilka kanaler du vill ha.<br />
  1. Medlemmar på [Filmtipset.se](http://www.filmtipset.se) kan automatiskt få personliga filmbetyg på de filmer som finns i tablån. Ange medlemsnumret (OBS: EJ användarnamn!) på baksidan. Med reservation för felträffar och att en del kanaler ännu inte hanteras av Filmtipset.<br />
  1. Nya kanaler dyker automatiskt upp i listan av kanaler på baksidan.<br />
  1. Översiktsvy över de för tillfället pågående programmen (nu, nästa, senare) för de kanaler som valts ut i kanallistan.<br />
  1. Heldagsvy som visar alla dagens program för utvald kanal. (För närvarande enbart dagens program, se [bugg 20](http://code.google.com/p/epgwidget/issues/detail?id=20))<br />
  1. Information om utvalt program vid klick på programtiteln.<br />
  1. Stöd för upp till 10 kanallistor. Kanallistor kan kopplas till en geografisk plats. Vid byte av plats (tex efter resa till sommarstugan) så skiftar epgwidgeten automatiskt kanallista. Automatiskt byte baserat på geografisk plats kräver användarens tillåtelse. Standard är ej tillåtet, ändra på baksidan. Manuella byten av kanallista är också möjligt, för den som föredrar detta. (Version >= 20100207)<br />
  1. Skalbart gränssnitt som kan göras större för ökad läsbarhet (förutsatt att listan fortfarande får plats på skärmen efter förstoringen).<br />
  1. Automatisk bakgrundsnedladdning av tablåer. (Internetanslutning behövs under nedladdningen.)<br />
  1. Läser tablåer från hårddisken. (Ingen konstant internetuppkoppling behövs, förutom under nedladdning av tablåer.)<br />
  1. Tar bort gamla tablåer automatiskt. (Även gamla tablåer från Xmltv-widgeten tas bort automatiskt.)<br />
  1. Långa programtitlar scrollas automatiskt i sidled om man pekar på dem.<br />
  1. Hoppa upp till 24 timmar framåt i tiden genom att skriva in önskat klockslag med fyra siffror (2030 för 20:30, 0615 för 06:15 osv). Suddtangenten (backspace) återgår till realtid.<br />
  1. Fungerar även på "icke-svenskt" Mac OS. Får då engelskt gränssnitt.<br />
  1. Programtablån visas i realtid och start- och sluttider räknas ut relativt datorns tidszon. Förutsatt att datorns tidszon är korrekt inställd så bör EPG därför automagiskt anpassa sig till exempelvis Åland och Finland, vilka inte ligger i samma tidszon som Sverige.<br />
  1. Kanalerna i kanallistan går att scrolla ifall de blir för många för att få plats på skärmen. (Version >= 20080826)<br />
  1. Växla mellan flera olika finfina teman till framsidan (Version >= 20080915)

## Planerad funktionalitet ##
  * Möjlighet att kunna se mer än bara dagens program i heldagsvyn. ([Bugg 20.](http://code.google.com/p/epgwidget/issues/detail?id=20))

  * "Semesterläge" - samtliga tillgängliga tablåer för kanalerna i kanallistan laddas ner till hårddisken (runt 14 dagars tablåer, istället för de normala 4 dagarna). EPG-widgeten fungerar då i 14 dagar utan att behöva internetuppkoppling. I dagsläget kan detta dock justeras manuellt vid behov.

## Eventuellt framtida funktionalitet ##
  * iPod Touch-/iPhonekompatibilitet. I dagsläget omöjligt att genomföra som ett gratisprogram eftersom Apple kräver 99 dollar om året för ett certifikat. Som webapp däremot...

  * Just nu-vy som visar programmen listade efter när de började istället för efter vilken kanal de går på. Som EPGn i Telias iptv.

## Ratad funktionalitet ##
  * Fjärrstyrning av en Dreambox (kanalbyte, programmering och borttagning av inspelningar). Vill hellre göra detta på en smartphone eller liknande, som man faktiskt skulle kunna ha som fjärrkontroll.

  * Överföring av de flesta teman från [Xmltv-](http://www-und.ida.liu.se/~gusax840/xmltv) till EPG-widgeten. ([Bugg 19.](http://code.google.com/p/epgwidget/issues/detail?id=19)) Struken, se kommentarer i [bugg 19](http://code.google.com/p/epgwidget/issues/detail?id=19).

  * Rektangelvy (dvs programmen visas som block istället för som en tabell med texter). Tar förmodligen upp alltför stor plats för att vara användbart. Struken, tar för stor plats.

  * Programpåminnelser. Meningslöst om man inte kan spela in programmen också. Vore dock snärtigt med en påminnelse efter att inspelningen är färdig.

  * Fjärrstyrning av Eyetv. Inte intressant eftersom jag inte har nån Eyetv. (Inte sant - jag har en, men jag använder den inte för Dreamboxen är mycket smidigare.)

[![](http://petition.stopsoftwarepatents.eu/banner/681004690616/ssp-362-60.gif)](http://petition.stopsoftwarepatents.eu/681004690616/)
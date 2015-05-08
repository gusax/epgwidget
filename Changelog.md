# Changelog för EPG-widgeten #
Läs så här:
  * Beskrivning av gjord ändring (buggnummer om sådant finnes)

Senaste ändringarna ligger alltid överst.



---

## Nästa version ##
_Nya funktioner_
  * Det är nu möjligt att byta dag i heldagsvyn genom att klicka på pilarna åt höger (nästa dag) eller vänster (föregående dag). Även piltangenterna går bra att använda. ([20](http://code.google.com/p/epgwidget/issues/detail?id=20))

  * Laddar nu ner eventuella uppdateringar även för kanalloggor. Har du Safari 4 och Leopard eller Snow Leopard måste du logga ut och logga in igen för att befintliga loggor ska uppdateras (i de fall de har uppdaterats). Har du Tiger eller Leopard med Safari 3 installerat så ska loggorna bytas ut automatiskt om de har ändrats. ([5](http://code.google.com/p/epgwidget/issues/detail?id=5))

  * Filmer som man själv betygsatt på filmtipset.se har nu en bock efter titeln (innan betygstjärnorna), så det är möjligt att skilja på verkliga betyg och de förmodade betygen.

  * Matchningen mot filmtipset.se hanterar nu titlar som i tablån börjar med "Film:", "Nattfilm:", "Filmklubben:" osv.

_Rättade buggar_

  * HD-program på SVT-kanalerna markeras nu som HD-program igen (om den funktionen är påslagen på baksidan).

  * Bättre titelmatchning mot Filmtipset.se . Tidigare versioner missade filmer med åäö och andra liknande tecken.

## 20100213 ##
_Nya funktioner_

_Rättade buggar_
  * Widgeten startar nu ordentligt även i Tiger ([92](http://code.google.com/p/epgwidget/issues/detail?id=92))

  * Hittade en omväg runt cachningsbuggen i Safari 4, så man kan nu uppgradera widgeten utan att behöva logga in och logga ut / starta om Dock. Tyvärr innebar det att "uppstartsanimationen" (punkterna) behövde tas bort. Så att widgeten blir osynlig ett tag under uppstarten är ett normalt beteende.

## 20100207 ##
_Nya funktioner_
  * Stöd för flera kanallistor. Upp till 10 kanallistor kan sparas. ([10](http://code.google.com/p/epgwidget/issues/detail?id=10), [74](http://code.google.com/p/epgwidget/issues/detail?id=74))

  * Baksidan: Kanallistor går att koppla till specifika geografiska platser, och EPG kan då byta kanallista automatiskt.

> Om man exempelvis tar med sin bärbara dator till mormor på släktmiddag (ett säkert tillfälle då man vill fly in i tvns värld), kan man skapa en kanallista specifikt för mormors tvutbud. Denna lista kopplas sedan till mormors adress. När man kommer hem byter EPG automatiskt tillbaka till den kanallista som är kopplad till ditt hem (lista 1 om du inte valt något annat). Nästa gång man besöker mormor byter EPG automatiskt till mormors kanallista igen - så länge inte mormor flyttat förstås.

> OBS 1: Denna funktion **kräver att EPG ges tillåtelse ta reda på din position**, något som **du aktivt måste tillåta** av säkerhetskäl. **Ingen information om var du befinner dig skickas till mig**, min egen mormor, Henrik Pontén på Antipiratbyrån eller något annat likaledes oönskat. Det går utmärkt att själv granska källkoden för att verifiera detta. Positioneringstjänsten som används finns på adress [ipinfodb.com](http://ipinfodb.com).

> OBS 2: **Fungerar ej om du surfar via 3G-modem eller 3G-mobiltelefon**! I alla fall inte via Tre, för där påstås man jämt befinna sig i Stockholm. Antagligen går all datatrafik i mobilnätet in och ut där, och därför blir positioneringen fel.

> OBS 3: Positioneringen funkar bra på stora avstånd (orter) men verkar vara lite sisådär om man går till grannen. Har du ett tips på en bättre (och gratis!) positioneringstjänst än [ipinfodb.com](http://ipinfodb.com) så mottages det tacksamt.

  * Baksidan: Byt kanallista manuellt via rullgardinsmenyn högst upp till höger.

  * Framsidan: Byt kanallista manuellt genom att hålla inne cmd (Apple-tangenten) och därefter trycka på någon av siffertangenterna. Håll innne cmd och tryck på siffra 1 för kanallista 1 osv. Observera att siffra 0 går till kanallista 10.

  * Framsidan: Om tablåer saknas skrivs det ut på framsidan, tillsammans med en knapp man kan trycka på för att försöka ladda ner tablåer. ([30](http://code.google.com/p/epgwidget/issues/detail?id=30), [90](http://code.google.com/p/epgwidget/issues/detail?id=90) och [91](http://code.google.com/p/epgwidget/issues/detail?id=91)).

  * Lade till mjuk scrollning på framsidan samt listan med valbara kanaler på baksidan. (Fungerar ej i Tiger. Vissa effekter kräver Safari 4 i Leopard.)

  * Tog bort SVTB/Kunskapskanalen och lade till SVTB/SVT24. SVT har tydligen möblerat om lite i kanalutbudet, och nu ska Kunskapskanalen sända mer och SVT24 mindre.

  * Lade till Canal Plus Sport 1/SF-kanalen.

_Rättade buggar_
  * Framsidan: Tablåer läses nu in korrekt även mellan kl 00 och 01 samt 00 och 02. ([70](http://code.google.com/p/epgwidget/issues/detail?id=70))

  * Framsidan: Klick på osynliga program ur nu-nästa-senare öppnar inte längre programinfo när man är i heldagsvyn.

  * Baksidan: Rättade felstavning, medlemskap heter det.

## 20091028 ##
_Nya funktioner_
  * Framsidan: Kopierade temat Orange från Xmltv-widgeten. Det blir det sista tema som kopieras därifrån, de andra är för fula (undantaget det transparenta temat som är för krångligt att kopiera - vill nån fixa det så maila mig.) ([19](http://code.google.com/p/epgwidget/issues/detail?id=19))

  * Framsidan: Provar nu även söka utan "the" om man inte får träff första gången i Filmtipsets tvtablå. På del filmer (The Bourne Supremacy exempelvis) saknas "The" i tvtablåerna nämligen. ([86](http://code.google.com/p/epgwidget/issues/detail?id=86))

  * Framsidan: Gömmer zoom-knapparna (AAA) om kanallistan är så lång att det ändå inte går att zooma.

  * Baksidan: Toon Disney omdöpt till Disney XD.

  * Baksidan: SF-kanalen tillagd bland filmkanalerna.

_Rättade buggar_
  * Filmtipset: Pga ett missförstånd användes tidigare alltid Filmtipsets uträknade betyg oavsett om du satt ett betyg själv eller ej. Det är inte längre fallet. Från och med nu kommer ditt eget satta betyg alltid alltid att ha företräde framför Filmtipsets uträknade dito (dvs så som det naturligtvis skulle ha varit från början). Använder du Filmtipset för att se om filmer du redan sett en gång, bör du absolut uppdatera till den här versionen.

  * Framsidan: Texten "Uppdatering tillgänglig" är nu läsbar i plasttemat.

  * Framsidan: Lyckades få bort glappet mellan sista kanalen och bottenramen när man gör widgeten större. Beror egentligen på att Safari räknar fel, men med den här lösningen så får Safari väl räkna fel då.

  * Baksidan: Det är inte lägre möjligt att fylla i nåt medlemsnummer från Filmtipset om man inte samtidigt bockat i att man faktiskt vill visa filmbetygen därifrån.

  * Tablånedladdaren: Tablåerna laddas nu ner korrekt även på PowerPC-datorer med vanliga Leopard och senaste säkerhetsuppdateringen. Pga en bugg i php 5.2.10 för PowerPC som Apple skickade med senaste säkerhetsuppdateringen till vanliga Leopard så blev årtalet 0000 istället för 2009 tidigare. **Om du har PowerPC och uppdaterat Leopard måste du installera denna version!** (Eller så kan du uppdatera php till version 5.3.0 om du tycker det är roligare.)

## 20090921 ##
_Nya funktioner_
  * Framsidan: Möjlighet att samköra information från [Filmtipset.se](http://www.filmtipset.se) med tvtablåerna, och visa (förvånansvärt träffande) personligt anpassade betyg på de filmer som går på tv. Valet av aftonfilm har aldrig varit lättare! Medlemsskap på Filmtipset.se krävs, men det är å andra sidan en förutsättning för att betygsättningen ska funka optimalt. Ange medlemsnummer (OBS: EJ användarnamn! Medlemsnumret - i grått - hittar du [här](http://www.filmtipset.se/yourpage.cgi)) och aktivera funktionen på baksidan. Stjärnor (1 - 5) efter filmtiteln anger hur pass bra filmen förmodligen är.

  * Baksidan: SVT Europa omdöpt till SVT World.

  * Baksidan: Viasat Hockey tillagd bland sportkanalerna.

  * Baksidan: Borttagna kanaler ligger nu på andra position i listan av kanalgrupper. Tidigare låg den sist och var lätt att missa om man inte tittade efter den speciellt.

_Rättade buggar_
  * Inforutan, framsidan och baksidan: rättade scrollningen i Safari 4 slutliga versionen, dvs icke beta. ([80](http://code.google.com/p/epgwidget/issues/detail?id=80) och [81](http://code.google.com/p/epgwidget/issues/detail?id=81))

  * Baksidan: Flyttade timglaset som dyker upp när man laddar ner tablåer till rätt ställe.

  * Tablånedladdare: Av någon anledning kunde trams laddas ner från helt felaktiga adresser, om en kanal saknade logga. Det ska inte längre vara möjligt. ([83](http://code.google.com/p/epgwidget/issues/detail?id=83))

  * Baksidan: Knapparna längst ner i behåll-/raderarutan man får upp vid första installationen ska nu inte längre hamna utanför skärmen. ([82](http://code.google.com/p/epgwidget/issues/detail?id=82))



---

## 20090531 ##
_Nya funktioner_
  * Framsidan: Lade till tonade övergångar mellan nu-nästa-senare- och heldagsvyn samt animerad progressbar i inforutan. (Fungerar ej i Tiger, vissa effekter kräver Safari 4 i Leopard.)

  * Baksidan: Lade till TV1000 Drama och TV7 i listan med kända kanaler.

_Rättade buggar_
  * Intern logik: Tog bort en funktion som kunde orsaka att widgeten kraschade vid timeout i XMLHttpRequest om man hade Safari 4 installerad.

  * Inforutan: Det går nu att scrolla texten i inforutan även i Safari 4.

  * Baksidan: Lade till en text för att förtydliga att tablåerna kommer från tv.swedb.se . ([72](http://code.google.com/p/epgwidget/issues/detail?id=72))


---



## 20090131 ##
_Nya funktioner_
  * Baksidan: Kanalerna är nu grupperade efter tema, istället för att bara ligga huller om buller i en lång lista. Dokumentär, sport, musik osv. För att få lite mer översikt över de nya grupperingarna har baksidan gjorts bredare. ([2](http://code.google.com/p/epgwidget/issues/detail?id=2))

  * Baksidan: Kanaler som dyker upp på servern efter senaste uppdateringen av widgeten hamnar automatiskt i gruppen "Nya", överst i listan. Förhoppningsvis blir det då lättare att avgöra om någon ny kanal har dykt upp. ([2](http://code.google.com/p/epgwidget/issues/detail?id=2))

  * Baksidan: Borttagna eller omdöpta kanaler hamnar nu i gruppen "Borttagna eller omdöpta" längst ner i listan. Det går pga detta också att ta bort försvunna eller omdöpta kanaler från baksidan, en funktion som saknades tidigare. ([61](http://code.google.com/p/epgwidget/issues/detail?id=61))

  * Baksidan: Äntligen visas namnet på konstnären som gjort utseendet bredvid utseendets namn i rullgardinsmenyn. Äras den som äras bör! Ursäkta dröjsmålet. ([43](http://code.google.com/p/epgwidget/issues/detail?id=43))

  * Baksidan: Det går nu att scrolla kanallistan både med piltangenterna och med mellanslag (se nästa punkt).

  * Framsidan: Det går nu att scrolla framsidan upp och ner med mellanslagstangenten. Tryck på mellanslag för att scrolla ett stort hopp nedåt i kanallistan, håll inne shift och tryck på mellanslag för att scrolla ett stort hopp uppåt. Samma kortkommando som i Firefox mao.

  * Framsidan: Bytte så standardutseendet numer är "Plast" istället för "Orange HC".

_Rättade buggar_
  * Baksidan: Kanallistan uppdateras nu varje gång man tar fram widgeten, oavsett vilken sida som är vänd framåt. Tidigare uppdaterades den enbart om man hade baksidan uppe när man tog fram dashboard.

  * Framsidan: Dagsvyn ligger inte längre kvar ovanpå nu-nästa-senare-vyn om man vänder widgeten fram och tillbaka när heldagsvyn är synlig. ([62](http://code.google.com/p/epgwidget/issues/detail?id=62))

  * Framsidan: Loggorna bör inte längre flimra i Tiger när man pekar med muspekare på dem, för att öppna heldagsvyn tex. Det bör heller inte längre vara så svårt att ta sig ur heldagsvyn. Detta har gjort att utseendet i heldagsvyn ändrats en smula. ([54](http://code.google.com/p/epgwidget/issues/detail?id=54))


---



## 20081207 ##
_Nya funktioner_
  * Baksidan: Lade till möjligheten att scrolla listan med kanaler med scrollhjul/pekplatta, så man slipper klicka på pilknapparna. (En del av [2](http://code.google.com/p/epgwidget/issues/detail?id=2))

  * Framsidan: För att lättare kunna skilja agnarna från vetet går det nu att visa en liten HD-symbol bakom titeln på de program som på SVT HD faktiskt sänds i HD. Slå av och på denna funktion på baksidan. **OBS! Enbart SVT HD** stöds än så länge, men tanken är att även andra kanaler som blandar HD-program med uppskalade diton (TV4 HD, TV1000 HD) skall stödjas efter en kommande uppdatering på tablåservern.

  * Framsidan: Nytt kortkommando: Alt + T tvingar fram en ominstallation av tablånedladdaren. Ska normalt sett aldrig behöva användas.

  * Heldagsvyn: Heldagsvyn (klicka på kanalloggorna) försöker nu scrolla upp tablån för att göra det pågående programmet synligt i alla lägen. Tidigare behövde man, speciellt på långa tablåer, scrolla fram det pågående programmet själv.

_Rättade buggar_
  * Baksidan: Första gången man startar widgeten har flera personer råkat ut för att baksidan fastnar på "Laddar ner kanaler". Efter mycket, mycket, mycket felsökande hittades orsaken: mapparna som widgeten laddar ner filer till hinner vissa gånger inte skapas i tid. Man försöker alltså ladda ner till en mapp som inte existerar. Detta är nu korrigerat, så att widgeten alltid försöker skapa målmappen innan nedladdning sker. ([63](http://code.google.com/p/epgwidget/issues/detail?id=63))

  * Baksidan: Om kanallistan inte kan laddas ner meddelas man numer om detta, istället för att det ska stå "Laddar ner kanaler..." i tid och evighet. ([37](http://code.google.com/p/epgwidget/issues/detail?id=37))

  * Baksidan: Att ta bort kanaler funkar nu ordentligt, en kanal ska inte längre kunna vara avbockad på baksidan samtidigt som den sedan ändå syns på framsidan. ([15](http://code.google.com/p/epgwidget/issues/detail?id=15))

  * Baksidan: Man behöver inte längre pricka bocken bredvid "Göm avverkad tid (%)", det räcker att trycka på texten precis som i listan med kanaler.

  * Framsidan: Om kanallistan är försvunnen när man startar widgeten första gången, vänder den automatiskt på sig och visar baksidan. På baksidan står det sedan att kanallistan inte kunde laddas ner. Detta är ett bättre beteende än tidigare, då framsidan istället listade samtliga kanaler som "borttagna eller omdöpta". (Samma bugg som ovan, [37](http://code.google.com/p/epgwidget/issues/detail?id=37))


  * Tablånedladdare: Filen med kanaler blev tidigare oavsiktligt raderad vid varje försök att kontakta tablåservern. Detta ledde ovillkorligen till att kanalerna såg ut att vara försvunna i widgeten om man någon gång råkade uppdatera utan att vara ansluten till internet. Detta fel är nu åtgärdat, och kanallistan skall inte längre försvinna om att man tillfälligt saknar internetanslutning. ([56](http://code.google.com/p/epgwidget/issues/detail?id=56))


---



## 20080915 ##
_Nya funktioner_
  * Baksidan: Det går nu att bocka bort %-visningen av avverkad tid om man inte vill se den informationen på framsidan.

  * Baksidan: Lade till möjlighet att byta utseende på framsidan för den som så önskar. För närvarande finns Orange HC och Plast att välja på, resten är på väg. (Fixat [11](http://code.google.com/p/epgwidget/issues/detail?id=11), börjat på [19](http://code.google.com/p/epgwidget/issues/detail?id=19))

  * Framsidan: Automatisk kontroll av nya versioner. När en ny version läggs ut visas numer ett meddelande ("Uppdatering tillgänglig!") på framsidan så man slipper kolla upp det själv. Klicka på texten "Uppdatering tillgänglig!" för att komma till relevant blogginlägg där alla ändringar står beskrivna. Eller alt-klicka om du litar på mig och bara vill ha filen direkt :-) ([39](http://code.google.com/p/epgwidget/issues/detail?id=39))

  * Framsidan: Ändrade uppstarten av widgeten för att undvika att widgeten blir osynlig under tiden den startar. Lade även till en liten animation, så man ser att det händer nåt.

  * Framsidan: Sänkte genomskinligheten för att öka läsbarheten ytterligare.

  * Inforutan: Delar nu upp tid kvar av ett program / tid fram till ett program startar i timmar och minuter (dvs istället för börjar om 130 min så står det nu börjar om 2 tim 10 min). ([24](http://code.google.com/p/epgwidget/issues/detail?id=24))

_Rättade buggar_
  * Framsidan: Procenttalet som anger hur mycket tid av ett program som förflutit kräver inte längre att man i Tiger vänder widgeten fram och tillbaka för att synas. ([53](http://code.google.com/p/epgwidget/issues/detail?id=53))

  * Inforutan: Tid fram till ett program startar räknas nu ut ordentligt. Tidigare räknades fel tid ut, så tiden som stod där var inte tid tills programmet började utan tiden tills programmet slutade.

  * Inforutan: Inforutans text är inte längre osynlig i Tiger. ([52](http://code.google.com/p/epgwidget/issues/detail?id=52))


---



## 20080826 ##
_Nya funktioner_
  * Framsidan: Indikator i procent på hur lång tid som ett program pågått.

  * Framsidan: Kanalerna på framsidan går nu att scrolla igenom ifall de blir för många. Man kan därför ha hur många kanaler man vill utan att widgeten blir jätteliten. Det antal kanaler som går att se på skärmen samtidigt beror dock fortfarande på hur hög upplösning skärmen har på höjden. (På en macbook får tex 18 och en halv kanal plats på höjden.) Använd pekplattan, scrollhjulet på musen eller pil upp och ner för att scrolla. Om inforutan är öppen så scrollar pilarna den istället. Om inforutan är öppen och man pekar på programmet som beskrivs så scrollar pekplattan och mushjulet den istället.

  * Framsidan: Heldagsvyn (samtliga program för en kanal) går också att scrolla nu. I heldagsvyn går det pga nån konstig bugg i Safari inte att scrolla kanalerna vid sidan av programmen, vet inte vad som är fel. Det funkar i Firefox :-/ ([48](http://code.google.com/p/epgwidget/issues/detail?id=48))

_Rättade buggar_
  * Framsidan: Kanaler som försvinner eller döps om går nu att ta bort från framsidan. Tidigare fick man bara ett meddelande om att kanalen försvunnit, men det gick inte att ta bort kanalen.

  * Framsidan: Det ska i heldagsvyn inte längre vara möjligt att få fram framtida program som ser ut som att de redan har slutat (tidigare kunde man få fram först gråa, sen vita och sen gråa programnamn en gång till).

  * Filnamn osv: Inkonsekventa skiftlägen på filnamn och mappar fixade. Widgeten går nu att installera även på ett skiftlägeskänsligt filsystem, tidigare startade den inte ens. ([50](http://code.google.com/p/epgwidget/issues/detail?id=50), tack till Johan Backlund)


---



## 20080630 ##
_Nya funktioner_
  * Framsidan & baksidan: En laddningssymbol (ett timglas) visas nu när tablåer öppnas, kanaler läggs till samt om man trycker på T för att tvinga fram en nedladdning av tablåer.  Obs: med en tillräckligt rapp dator kommer det förmodligen knappt hinna visas innan det försvinner.

  * Grabbern: Om filen med alla kanalerna i blir korrupt bör grabbern nu kunna kasta denna, så att den inte av misstag hindrar en ny och korrekt fil från att laddas ner.

_Rättade buggar_
  * Framsidan: Lade till tredje argumentet false till addEventListener, så nu fungerar tablåerna på framsidan i Firefox igen. Bra för testning.

  * Baksidan: Lade till bortglömda .gz-filändelser som glömdes bort i förra versiones rättning. Felet kunde leda till att man (om man aldrig haft widgeten installerad tidigare) fastnade på "laddar ner kanaler" på baksidan. ([47](http://code.google.com/p/epgwidget/issues/detail?id=47))

  * Inforutan: Widgeten reserverar inte längre allt utrymme under inforutan om inforutan inte är synlig. Det gör i sin tur att det nu fungerar mycket bättre att svepa in från höger med muspekaren och att EPG inte stjäl fokus från närliggande widgets. (Det blir dock fortfarande lite skumt om man har inforutan framme.)


---



## 20080606 ##
_Nya funktioner_
  * Framsidan: Det går nu att tvinga fram en nedladdning av nya tablåer genom att trycka på T-tangenten (T för Tablåer). Det finns dock än så länge ingen indikering i guit på att så sker - så vänta 10 sek (exakt tid beror på vad för internetuppkoppling du har), ta bort dashboard och ta fram det igen så ska förhoppningsvis de flesta tablåer vara på plats. Saknas några så vänta nån sekund till, göm dashboard och ta fram det igen. Du behöver inte trycka T en gång till. (Och ja, det kommer visas nån laddningssymbol i en senare version.)

  * Grabbern (scriptet som laddar ner tablåer i bakgrunden): tar nu bort korrupta tablåer och korrupta loggor (jippi!) innan den försöker uppdatera filerna. Funkar även om man trycker på T.

  * Grabbern: Uppdatering av grabbern skall passera obemärkt förbi (förutsatt att man inte haft problem innan, då kanske det kan bli märkbart).

_Rättade buggar_
  * Framsidan: Kortkommandot [⌘-, ](.md) för att öppna baksidan funkar nu utan att man behöver vända på widgeten genom att klicka på i-et en gång först.

  * Baksidan: Texten "Laddar ner kanaler..." hamnar inte längre utanför baksidan. ([45](http://code.google.com/p/epgwidget/issues/detail?id=45))

  * Grabbern: Grabbern lägger nu på .gz på tablåfilsnamnet så att tablånedladdningen inte längre upphör ifall man råkar hamna på den tredje tablåservern. Den tredje tablåservern måste ha tablånamn.js.gz nämligen, det räcker inte med bara tablånamn.js. ([46](http://code.google.com/p/epgwidget/issues/detail?id=46))

  * Grabbern: Den automatiska nedladdningen av tablåer har nu 10 sekunders fördröjning (så att airport ska hinna koppla upp innan nedladdningen påbörjas). Denna fördröjning satt av misstag på den manuella nedladdningen tidigare.


---



## 20080601 ##
_Nya funktioner_
  * Framsidan: Framsidan är nu mindre genomskinlig än den var innan (för ökad läsbarhet).

  * Framsidan: Snabbknapp för att öppna baksidan: [⌘-, ](.md).

  * Inforutan: Det går nu att hålla ner piltangenterna för att scrolla texten i inforutan (man slipper pumpa på knappen).

  * Baksidan: Snabbknapp för att öppna framsidan: [Enter ](.md).

  * Baksidan: Baksidan är inte längre transparent. Enbart framsidan påverkas av transparensinställningarna.

  * Orange HC (skin) : Transparensen flyttad från css till javascript (så att man ska kunna justera den själv i en kommande version.)

_Rättade buggar_
  * Framsidan: Även det numeriska tangentbordet accepteras när man matar in klockslag. ([44](http://code.google.com/p/epgwidget/issues/detail?id=44))

  * Baksidan: Bloglänken korrigerad ([42](http://code.google.com/p/epgwidget/issues/detail?id=42))


---



## 20080518 ##
_Nya funktioner_
  * Framsidan: Det går nu att hoppa upp till 24 timmar framåt i tiden genom att skriva in klockslaget med fyra siffror (1945 för att hoppa till 19:45, 0600 för 06:00 osv). Suddtangenten, backspace, återställer klockan (eller så kan man ta bort och ta fram Dashboard igen).

  * Framsidan: Uppdateringen är nu synkad med klockan, så framsidan ska rita om sig så fort minuten på klockan ändrar sig. Tidigare var uppdateringens styrd av när man tog fram dashboard senast. ([16](http://code.google.com/p/epgwidget/issues/detail?id=16))

  * Framsidan: Tog bort hjälpbubblorna från programtitlarna i listan. De var jämt ivägen ändå, lade sig ovanpå titlarna man försökte läsa, täckte inforutan, osv.

  * Inforutan: Det går nu att använda piltangenterna (upp och ner) för att scrolla texten upp och ner.

  * Baksidan: Klar-texten nere till höger tänds nu upp när man pekar på den, för att indikera att man kan klicka på texten.

  * Baksidan: Länkar till [hemsidan](http://epgwidget.googlecode.com) och [bloggen](http://epgwidget.blogspot.com) på baksidan.

  * Baksidan: Versionsnumret skrivs nu ut överst på baksidan.

  * Övrigt: Versionsnumret står även i info.plist, så förhoppningsvis står det "vill du ersätta EPG med en nyare version" när man installerar ny version i Dashboard i fortsättningen.

_Rättade buggar_
  * Inforutan: Positionen på texten ska nu alltid återställas, istället för att som tidigare börja på det stället dit man scrollade sist. (33)

  * Baksidan: Kanallistan scrollar nu inte längre förbi sista platsen utan stannar när sista kanalen dykt upp.

  * Baksidan: Bytte håll på pilarna i kanallistan, de gick åt fel håll jämfört med inforutan innan.


---



## 20080426 ##
_Nya funktioner_
  * Inforutan: Flyttade positioneringen från CSS till javascript.

  * Inforutan: Konstruktorn tar nu bort sig själv. Sparar minne.

  * Inforutan: Lade till scrollpilar, sänker därför prion på scrollbaren. (26)

  * Framsidan: Gjorde hjälptexterna ovanpå programtitlarna kortare, så att de inte ska täcka så stor del av inforutan.

  * Framsidan: Långa programtitlar scrollas nu i programlistan om man pekar på dem.

_Rättade buggar_
  * Inga.


---



## 20080324 ##
_Nya funktioner_
  * Inga.

_Rättade buggar_
  * Nedladdning av listan med kanaler från servern sker nu automatiskt vid första uppstart om listan saknas.

  * Grabbern kräver nu inte längre att användarnamnet är gusax840 för att funka :-)

  * Grabbern installeras nu när man startar widgeten för första gången. (31)


---



## 20080302 ##
  * Första versionen (som gick att ladda ner som zipfil)
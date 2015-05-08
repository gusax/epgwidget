# Kända fel #
  * **Rätt versionsnummer står på baksidan men utlovade nya funktioner verkar saknas eller så ser widgeten konstig ut efter uppdatering** : Safari 4 (ingår som standard i Snow Leopard, kan installeras frivilligt i vanliga Leopard) sparar undan källkodsfilerna till widgeten även i Dashboard. Det gör att om du uppdaterar någon widget (vilken som helst, inklusive epgwidgeten) så måste du antingen starta om datorn, logga ut och logga in eller köra killall Dock i terminalen för att Safari ska kasta sina lagrade filer. Om du inte använder Safari för att surfa på internet så kan du få bort problemet på vanliga Leopard genom att återgå till Safari 3. För Snow Leopard finns inte det alternativet.

  * **Alla kanaler påstås ha blivit omdöpta** : Pga ett fel i tablånedladdaren kunde kanallistan råka tas bort om man inte var uppkopplad mot internet just då tablånedladdaren kördes. Detta fel är rättat i alla versioner större än 20080915. Får du detta fel - uppgradera till en nyare version!

  * **Kanallistan dyker inte upp / Alla kanaler påstås blivit omdöpta** : Tablåservern fick vid några tillfällen för sig att skicka ut konstig information om tablåfilerna, som gjorde att tablåfilerna inte packades upp. Detta visade sig oftast genom att framsidan påstod att alla kanaler blivit omdöpta. Enda sättet att få widgeten att funka igen är att köra "killall Dock" utan citationstecken, då Dashboard tydligen cachar den felaktiga filen och vägrar uppdatera till den nya.

  * **Problem i Tiger (Mac OS 10.4)** : Widgeten har lite egenheter för sig i Tiger. De största felen åtgärdade i version 20080915, resten åtgärdas i kommande versioner.

  * **Glapp i kanallistan om man gör widgeten större** : Pga en bugg (ett räknefel) i Safari 4 blir det ett glapp mellan sista kanalen i kanallistan och den nedersta ramen. Fixat i version 20091028.

  * **Nedladdning av tablåer** : Man verkar vara tvungen att logga ut & logga in igen inom två dagar från att widgeten har installerats första gången, annars går inte bakgrundsnedladdningen igång och man tappar tablåerna.

  * **Intensivt hårddiskrassel** : Bakgrundsnedladdningen rensar även upp gamla tablåer från Xmltv-widgeten, så om Xmltvwidgeten varit installerad en lång tid kan det rassla rätt bra i hårddisken första gången den automatiska nedladdningen tömmer tablåmappen.

  * **Heldagsvyn** : Man kan inte byta dag i heldagsvyn.

  * **Scrollbars** : Scrollbars fattas här och var.

  * **Uppdatering slutar fungera** : Om man laddar om widgeten så kan uppdateringen ibland sluta fungera. Detta märks speciellt om man har inforutan öppen. Normalt sett ska inforutan stängas när man tar bort Dashboard, men om uppdateringen slutar funka så kommer inforutan vara kvar när man tar fram Dashboard igen. Stäng av widgeten och öppna den igen för att åtgärda (det brukar inte hjälpa att bara ladda om den med äpple-R)
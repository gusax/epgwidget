# Ta bort (avinstallera) widgeten #
Motsvarade inte widgeten dina förväntningar, eller krånglar den och du vill börja om från början? Har du slutat se på tv, tycker tvinfo funkar bättre eller kanske tom har en digitalbox med en vettig epg inbyggd? Eller känner du dig möjligen frånvarande och svår att nå?
Då kanske lösningen för dig är att avinstallera EPG från din dator.

### För att ta bort EPG fullständigt från din dator, gör följande: ###
  1. Ta fram Dashboard.
  1. Klicka på det lilla plusset i nedersta vänstra hörnet.
  1. Klicka på "Widgetar" (den ligger längst till vänster på sida 1).
  1. Scrolla till EPG i listan, klicka på den runda röda minusknappen.
  1. Bekräfta att du vill kasta EPG i papperskorgen.
  1. Ta bort inställningsfilen ~/Bibliotek/Preferences/**widget-se.bizo.widget.epg.plist**
  1. Stäng av den automatiska nedladdningen av tablåer, som startar tablånedladdningen en gång om dagen, genom att kasta ~/Bibliotek/LaunchAgents/**se.bizo.epgwidget.grabber.plist**
  1. Om du har gamla Xmltv installerad, och ämnar fortsätta använda den, så töm papperskorgen nu och hoppa sedan till nästa punkt. Om du inte har Xmltv installerad, ta även bort mappen där alla tablåer ligger: ~/Bibliotek/Xmltv. Töm sedan papperskorgen och gå till nästa punkt.
  1. Om du ämnar ominstallera widgeten behöver du starta om Dashboard genom att skriva in "killall Dock" i terminalen (eller logga ut och logga in igen). Om du inte tänker ominstallera så kan du hoppa till nästa punkt.
  1. Klart!

### Filer och mappar som skapas av EPG vid installation ###
Dessa filer och mappar måste kastas för att lyckas med en komplett av- eller ominstallation.
  * ~/Bibliotek/Preferences/**widget-se.bizo.widget.epg.plist** (kanallista osv, cachas av Dashboard i Leopard, se notis sist på sidan)
  * ~/Bibliotek/LaunchAgents/**se.bizo.epgwidget.grabber.plist** (schemalagd aktivitet som startar nedladdning av tablåer en gång om dagen)
  * ~/Bibliotek/Xmltv (Innehåller alla nedladdade tablåer och loggor.)

Om du tar bort se.bizo.epgwidget.grabber.plist (första punkten) så kan du även behöva starta om Dashboard genom att skriva in "killall Dock" i terminalen. Detta pga att Dashboard i Leopard verkar cacha filerna.
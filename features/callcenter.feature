# language: de

Funktionalität: Callcenter
  Um Termine auszumachen
  Als Callcentermitarbeiter
  Muss ich der Lage sein, eingehende Anrufe der Ordination zu übermitteln.

  Szenario: Neuer Anruf
    Angenommen ich bin auf der Hauptseite
    Und ich gehe auf "Neuer Anruf"
    Und ich gebe bei "Nachname" "Schwarz" ein
    Und ich gebe bei "Vorname" "Sabine" ein
    Und ich gebe bei "Telefon" "0660 123456789" ein
    Und ich gebe bei "Grund" "Termin heute von 18:00 auf 19:00 verschieben" ein
    Und es ist 16:00 Uhr
    Angenommen ich klicke auf "Anruf speichern"
    Dann sollte bei "Nachname" nichts stehen
    Angenommen ich klicke auf "Offene Anrufe"
    Dann sollte ich "Sabine Schwarz" sehen
    Und sollte ich "0660 123456789" sehen
    Und sollte ich "Termin heute von 18:00 auf 19:00 verschieben" sehen
    Und sollte ich "16:00" sehen

# EKV Fast Lane website · conceptversie ter bespreking

Statische versie van de pagina-opzet v0.1 (Home, vier doelgroepen, Achtergrond) met een reactielaag.
Geen build-stap nodig: gewone HTML, CSS en JavaScript.

## Inhoud

| Bestand | Wat |
|---|---|
| `index.html` | Home |
| `gemeenten.html`, `conceptaanbieders.html`, `certificering.html`, `opdrachtgevers.html` | Doelgroeppagina's |
| `achtergrond.html` | Achtergrond |
| `contact.html`, `bedankt.html` | Contactformulier (Netlify-formulier `contact`) en bedankpagina |
| `opmerkingen.js`, `opmerkingen.css` | Reactielaag |
| `netlify.toml` | Publiceert de map zoals hij is; zet `noindex` zodat zoekmachines de concept niet oppikken |

## Online zetten

1. Maak een nieuwe repository op GitHub (bijv. `ekv-fast-lane-site`) en upload de inhoud van deze map (Add file › Upload files).
2. Netlify › Add new site › Import an existing project › GitHub › kies de repository. Build command leeg laten, publish directory `.`.
3. **Zet formulierdetectie aan:** Netlify › je site › Forms › *Enable form detection*. Deploy daarna opnieuw (Deploys › Trigger deploy). Zonder deze stap komen verstuurde opmerkingen nergens aan.
4. Optioneel: Forms › Form notifications › e-mail bij elke nieuwe opmerking.

## Contactformulier

- De knoppen "Neem contact op" en "Aanmelden als koploper" en het menu-item Contact openen `contact.html`, met het juiste onderwerp al gekozen.
- Inzendingen komen in Netlify onder Forms › `contact` (na het aanzetten van formulierdetectie). Zet een e-mailmelding aan zodat je ze niet mist.
- Het formulier verzamelt persoonsgegevens: regel de privacyverklaring en AVG-afspraken met De Bouwcampus voordat de link breed gedeeld wordt.

## Zo werkt reageren

- Een lezer klikt rechtsonder op **Reageren**, vult de eerste keer zijn naam in en klikt daarna op een onderdeel van de pagina (sectie, stap, kaart, vraag).
- Opmerkingen staan meteen als oranje bolletje bij het onderdeel en in het paneel **Opmerkingen**. Ze worden bewaard in de browser van de lezer.
- **Verstuur** stuurt nieuwe opmerkingen naar Netlify (formulier `opmerkingen`: naam, pagina, onderdeel, opmerking, tijd). Je vindt ze onder Forms en kunt ze als CSV exporteren.
- Lukt versturen niet (bijv. formulierdetectie staat uit, of de lezer opent het bestand lokaal), dan kan de lezer **Download .txt** of **Download .json** gebruiken en het bestand mailen.
- **Importeer .json** laat opmerkingen van anderen zien (paars, alleen-lezen). Handig om alle reacties in één overzicht te zien.

## Let op

- De site is openbaar voor iedereen die de link heeft. Deel de link alleen met het team.
- Het nieuwsbriefformulier op Home is een demo en verstuurt niets.
- Teksten tussen [haken] zijn placeholders. De vouchersectie is bewust geparkeerd.
- Netlify Forms heeft een gratis maandlimiet op het aantal inzendingen; controleer je plan als er veel wordt gereageerd.

## Versie 18 oktober 2026: beeld en vouchersectie (informatie)
- Beeld: alle placeholders vervangen door stockfoto's in `img/` (geschaald, 15 Shutterstock-beelden). Overzicht welk beeld waar staat: zie beeldoverzicht in de chat/projectnotitie. Praktijkblokken Ommoord, Parkstad en GMR dragen het label "voorbeeldbeeld" tot er projectfoto's zijn.
- Vouchers: vouchers.html (overzicht), vouchers-regeling-1 t/m 5.html, vouchers-gemeenten.html, vouchers-voorwaarden.html, vouchers-vragen.html. Geen aanvraagpagina en geen formulieren; die volgen bij de opening.
- Nieuw Netlify-formulier `vouchers-interesse` (op overzicht, regelingpagina's en gemeentenpagina). Na uploaden: Forms > formulierdetectie opnieuw laten lopen, en bij dit formulier een eigen notificatie-adres instellen.
- Pagina samen-versnellen.html (probleem, IOP, plek van EKV Fast Lane), IOP-blok op de home, IOP-logo met regel in de footer van elke pagina, menu-item "Waarom".
- Nog open: logo De Bouwcampus (gestippeld kader; checken of het mag blijven), link privacyverklaring.
- 18 okt, ronde 2 (opmerkingen Jaap 1 okt): rollen in ketenvolgorde (CI's, bouwers, corporaties & ontwikkelaars, gemeenten) in menu, kaarten en footer; certificering.html alleen CI's en schemabeheerders; kwaliteitsborgers en omgevingsdiensten op gemeenten.html; 2x2 (fase x spoor) bij "Jouw rol" gemeenten; aantoonbaarheid en capaciteit als rode draad; "hybride" vervangen door "gedeeltelijke dekking"; Wkb-nuance (gevolgklasse 1); disclaimer kennisbank; geen nieuwsrubriek, wel nieuwsbrief. Koplopergemeente blijft de term.
- Let op: gen_vouchers.py en gen_waarom.py nemen header/footer over uit gemeenten.html; apply_jaap.py daarna opnieuw draaien voor de menuvolgorde.
- 19 okt, eindproduct: reactielaag verwijderd (opmerkingen.js/.css en verborgen formulier), werkversie-meldingen weg, placeholders vervangen, privacy.html toegevoegd, "Algemene voorwaarden". Nieuwsbriefformulier is nu een echt Netlify-formulier (`nieuwsbrief`). Netlify-formulieren: contact, nieuwsbrief, vouchers-interesse; na upload formulierdetectie opnieuw laten lopen. Kennisproducten staan op "Op aanvraag" (contactformulier) tot de bestanden online staan. Bouwcampus-logo is een tekstmerk tot het logobestand er is.

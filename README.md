# 🎯 OsumaOnni — Reserviläisammunnan tuloskortti

Selaimessa toimiva tuloskortti- ja tuloslaskentasovellus reserviläisammuntaan.
Kaikki tiedot pysyvät **vain omalla laitteellasi** — sovelluksessa ei ole taustapalvelinta.

**➡️ Sovellus: https://samihanninen.github.io/OsumaOnni/**

> 🚧 **Kehitys jatkuu.** Sovellus on käytettävissä, mutta usean kirjaajan tulosten
> yhdistäminen (linkki, QR-koodi ja tiedosto) on vielä työn alla. Muut toiminnot ovat
> valmiita ja testattuja.

Sovellus on selainversio Nummi-Pusulan Reserviläiset ry:n Excel-tuloskortista.
Excel-versio vaatii Excel 2021:n tai Microsoft 365:n (`SORTBY`, `FILTER`, `SEQUENCE`),
sen kilpailijamäärän kasvattaminen vaatii käsityötä, eikä 43 sarakkeen taulukko ole
käytettävissä puhelimella ampumaradalla. Tämä versio korjaa nämä kolme asiaa.

---

## Ominaisuudet

- **Neljä lajia RESUL:n virallisten sääntöjen mukaisesti** (versiot 1.6 / 2025):

  | Laji | Ase | Kilpasarjat | Tulos | Etäisyys | Asento |
  |---|---|---|---|---|---|
  | **RA1** | itselataava kivääri, 5,45–8,00 mm | 2 × 10 ls | parempi sarja | 150 m | makuu |
  | **RA2** | itselataava kivääri, 5,45–8,00 mm | 3 × 6 ls | sarjojen summa | 150 m | makuu |
  | **RA3** | itselataava pistooli, väh. 9,00 mm | 2 × 10 ls | parempi sarja | 25 m | seisten |
  | **RA4** | itselataava pistooli, väh. 9,00 mm | 2 × 10 ls (tuplat) | parempi sarja | 25 m | seisten |

- **Vakio- ja avoin luokka** erikseen — avoimessa luokassa optiikka on sallittu, joten
  tulokset lasketaan ja järjestetään luokittain erikseen
- **Ikäsarjat H ja H50**
- **Napakymppi** (`*`) ja **ohilaukaus** (`-`) — napakymppi on 10 pistettä ja kirjautuu
  napalaskuriin tasatulosten ratkaisemista varten
- **Sijoitukset virallisen tasatulossäännön mukaan** — iskemien määrä, sitten napakympit,
  kympit, ysit jne.; parempi-sarja-lajeissa tarvittaessa myös huonompi sarja. Sijoilla 9→
  tasatulokset jaetaan sukunimen mukaisessa aakkosjärjestyksessä
- **Sääntörikkeet** −2 pistettä kerrallaan; turvallisuusrike mitätöi tuloksen
- **Yhdistys- ja joukkuekilpailu** — lajikohtainen ja yhteistulos, parhaiden 3 kilpailijan
  summa (joukkueen koko sääntöjen mukaan 3 ampujaa)
- **Sarjarakenne on muokattavissa** — säännöt muuttuvat, joten laukausmäärät ja sarjojen
  määrä ovat asetuksia, ei koodia
- **Yksi kilpailijalista** — nimi ja yhdistys kirjataan kertaalleen, lajit valitaan rastittamalla
- **Ei kilpailijarajaa** — Excel-version 50 kilpailijan katto poistuu
- **Mobiilikäyttö** — puhelimella iso näppäimistö, tietokoneella Excelin tapainen taulukko
- **Monta kirjaajaa** — useampi henkilö voi kirjata tuloksia omalla laitteellaan ja tulokset yhdistetään yhdelle laitteelle
- **Offline** — asennettavissa kotivalikkoon ja toimii ilman verkkoyhteyttä
- **Vienti ja tuonti Excel-tiedostona** — tulokset saa ulos ja takaisin sisään

---

## Käyttöohje

1. **Kisatiedot** — kirjaa kisan nimi, järjestäjä, paikka, päivämäärä ja vastuuhenkilöt.
   Valitse kisatyyppi; se ratkaisee lasketaanko kilpailutulos summana vai parhaana sarjana.
2. **Kilpailijat** — lisää kilpailijat: nimi, yhdistys ja lajit joihin hän osallistuu.
   Yhdistyksen nimi ehdotetaan aiemmin syötetyistä, joten kirjoitusasu pysyy samana.
3. **Syöttö** — valitse laji ja syötä laukaukset. Sarjan summa, navat ja kilpailutulos
   päivittyvät heti. Merkitse napakymppi `*`:llä ja huti `-`:llä.
4. **Sijoitukset** — henkilökohtaiset tulokset järjestyksessä, tasatulokset napojen mukaan.
5. **Yhdistykset** — yhdistyskilpailun tilanne lajeittain ja yhteistuloksena.
6. **Vienti** — lataa tai jaa tulokset Excel-tiedostona. **Tee tämä kisan aikana säännöllisesti.**

---

## Tietosuoja ja tietojen säilyminen

Sovellus tallentaa tiedot **ainoastaan käyttämäsi laitteen selaimen localStorage-muistiin.**
Mitään ei lähetetä minnekään: ei taustapalvelinta, ei tilastointia, ei evästeitä
seurantaan. Tiedot eivät siirry laitteiden välillä.

⚠️ **Tämä tarkoittaa myös sen, että tiedot katoavat**, jos tyhjennät selaimen
sivustotiedot, käytät yksityistä selausikkunaa tai poistat sovelluksen. Selain voi
myös itse poistaa tietoja tilan säästämiseksi.

**Vie tulokset tiedostoon säännöllisesti kisan aikana.** Sovellus muistuttaa tästä
automaattisesti: jos vientiä ei ole tehty lainkaan tai siitä on yli 30 minuuttia, sivun
ylälaidassa näkyy huomautus.

### Asentaminen laitteeseen

Sovellus kannattaa asentaa kotivalikkoon (*Lisää Koti-valikkoon* / *Asenna sovellus*):

- se toimii silloin **kokonaan ilman verkkoyhteyttä** — myös tulosten vienti Exceliin
- selain karsii tallennettuja tietoja epätodennäköisemmin kuin tavallisessa välilehdessä
- sovellus avautuu omana ikkunanaan ilman selaimen osoitepalkkia

Päivitykset eivät asennu itsestään kesken kisan: uudesta versiosta tulee ilmoitus, ja
päivityksen ajankohdan valitset itse. Kirjatut tulokset säilyvät päivityksessä.

---

## Tulosten vienti ja tuonti

Vienti tuottaa `.xlsx`-tiedoston, joka noudattaa alkuperäisen Excel-tuloskortin
välilehtirakennetta:

| Välilehti | Sisältö | Muokattavissa |
|---|---|---|
| `Tuloskortti RA1`–`RA4` | Kilpailijat ja laukaukset | ✅ **Kyllä — aidot Excel-kaavat.** Kun korjaat laukauksen, sarjan summa, navat ja kilpailutulos laskeutuvat uudelleen kuten Excel-versiossa |
| `Kisatiedot` | Kisan perustiedot ja asetukset | ✅ Kyllä |
| `Sijoitukset RA1`–`RA4` | Sijoitukset | ℹ️ Tilannekuva — päivittyy kun tiedosto tuodaan takaisin sovellukseen |
| `Yhdistys …` | Yhdistyskilpailu | ℹ️ Tilannekuva — kuten yllä |
| `_meta` | Versiotiedot | Ei |

Tuonti lukee **vain** `Tuloskortti`-välilehtien nimet ja laukaukset ja laskee kaiken
muun uudelleen. Näin järjestäjän käsin tekemät korjaukset siirtyvät sovellukseen
sellaisenaan, eikä vanhentunut sijoitusvälilehti voi sotkea tuloksia.

**Näin virheen korjaaminen onnistuu myös jälkikäteen**, vaikka selaimen muisti olisi
tyhjentynyt: avaa viety tiedosto Excelissä, korjaa laukaus ja tuo tiedosto takaisin.

### Tulosten lähettäminen

- **Puhelimella** — *Jaa*-painike antaa tiedoston puhelimen jakovalikkoon, josta se
  lähtee sähköpostin liitteenä esimerkiksi Gmailissa tai Outlookissa.
- **Tietokoneella** — tiedosto ladataan ja sovellus voi avata valmiin sähköpostiluonnoksen.

> ℹ️ **Liitetiedostoa ei voi lisätä automaattisesti tietokoneella.** `mailto:`-linkit
> eivät tue liitteitä missään selaimessa, joten työpöydällä tiedosto pitää liittää
> sähköpostiin itse. Puhelimen jakovalikko sen sijaan hoitaa liitteen suoraan.

---

## Monta kirjaajaa samassa kisassa

Kun tuloksia kirjaa useampi henkilö samaan aikaan eri laitteilla, tulokset yhdistetään
lopuksi yhdelle laitteelle — ja sieltä yhteen Excel-tiedostoon.

### Näin se toimii

1. **Päälaite luo kisan** — kisatiedot ja kilpailijalista syötetään kertaalleen.
2. **Kilpailijalista jaetaan** kirjaajien laitteille (linkkinä, QR-koodina tai tiedostona).
3. **Jokaiselle kirjaajalle oma osuus** — esimerkiksi laji (RA1 yhdelle, RA2 toiselle) tai
   oma kojeryhmä. Kun osuudet eivät mene päällekkäin, yhdistäminen on ristiriidatonta.
4. **Kirjaajat syöttävät tulokset** omilla laitteillaan, myös ilman verkkoyhteyttä.
5. **Tulokset yhdistetään päälaitteelle** — päälaite lukee kirjaajien osatulokset ja
   yhdistää ne. Lopuksi vienti Exceliin sisältää kaikkien kirjaamat tulokset.

### Yhdistämistavat

| Tapa | Miten | Sopii |
|---|---|---|
| **Linkki** | Kirjaaja saa jakolinkin ja lähettää sen esim. WhatsAppilla; päälaite avaa linkin | Helpoin — ei kameraa eikä tiedostoja |
| **QR-koodi** | Kirjaaja näyttää koodin, päälaite lukee sen kameralla | **Toimii täysin ilman verkkoyhteyttä** — paras ampumaradalla |
| **Tiedosto** | Pieni tiedosto AirDropilla, Nearby Sharella tai sähköpostilla | Varmin, ei kokorajaa |

### Ristiriidat

Yhdistäminen ei koskaan ylikirjoita tuloksia huomaamatta. Jos kaksi laitetta on
kirjannut saman kilpailijan saman sarjan eri tuloksin, sovellus näyttää ne rinnakkain
ja kysyy kumpi jää voimaan. Tyhjän päälle kirjoitetaan aina huomautuksetta, ja saman
tuloksen yhdistäminen uudelleen ei muuta mitään — saman koodin voi lukea kahdesti
turvallisesti.

> 🔒 **Tietosuojahuomio:** QR-koodi on ainoa tapa, jossa tiedot eivät poistu paikalta.
> Linkki ja tiedosto kulkevat sen sovelluksen kautta, jolla ne lähetät (esim. WhatsApp).
> Omaa palvelinta ei ole missään tavassa.

---

## Teknologiat

| Osa-alue | Valinta | Miksi |
|---|---|---|
| Käyttöliittymä | [Vue 3](https://vuejs.org/) + TypeScript | Selkeä komponenttijako näppäimistön ja taulukon välillä |
| Käännöstyökalu | [Vite](https://vite.dev/) | Nopea kehitys, `base`-polku GitHub Pagesille |
| Tila | [Pinia](https://pinia.vuejs.org/) + [pinia-plugin-persistedstate](https://prazdevs.github.io/pinia-plugin-persistedstate/) | localStorage-tallennus ilman omaa koodia |
| Reititys | [Vue Router](https://router.vuejs.org/) (hash-tila) | Toimii GitHub Pagesilla ilman uudelleenohjauskiertoteitä |
| Offline | [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) | Asennettava sovellus, toimii ilman verkkoa |
| Excel-tiedostot | [ExcelJS](https://github.com/exceljs/exceljs) | Ainoa selainkirjasto joka **kirjoittaa** monivälilehtisen tiedoston kaavoineen ja **lukee** sen takaisin |
| QR-koodit | [qrcode](https://github.com/soldair/node-qrcode) + [jsQR](https://github.com/cozmo/jsQR) | Koodien luonti ja luku; jsQR varalla iOS-Safarissa, josta puuttuu `BarcodeDetector` |
| Pakkaus | [pako](https://github.com/nodeca/pako) | Suurten osatulosten tiivistäminen QR-koodiin |
| Yksikkötestit | [Vitest](https://vitest.dev/) | Laskennan vastaavuus alkuperäiseen Exceliin |
| Selaintestit | [Playwright](https://playwright.dev/) | Ajaa myös WebKitiä, joten näppäimistö on testattavissa iPhone-näkymässä |
| Laatu | [ESLint](https://eslint.org/) (flat config) + [Prettier](https://prettier.io/) | — |
| Julkaisu | GitHub Actions → GitHub Pages | Julkaisu tapahtuu CI:ssä, ei kehityskoneelta |

ExcelJS on kokoluokkaa 900 kB, joten se ladataan vasta kun tuloksia viedään tai
tuodaan (`await import('exceljs')`). Sovelluksen käynnistyminen ei siitä hidastu.

### Laskennan vastaavuus

Kaikki pisteytyslogiikka on tiedostoissa `src/core/` puhtaana TypeScriptinä ilman
riippuvuutta käyttöliittymäkirjastoon. Testit vertaavat laskentaa alkuperäisen
Excel-tiedoston tunnettuihin arvoihin, joten tulokset vastaavat Excel-versiota.

---

## Kehitys

Vaatii Node.js:n (versio tiedostossa `.nvmrc`).

```bash
npm install         # asenna riippuvuudet
npm run dev         # kehityspalvelin
npm run test:unit   # yksikkötestit (laskennan vastaavuus)
npm run test:e2e    # selaintestit (Chromium + WebKit + iPhone-näkymä)
npm run lint        # tarkistus
npm run type-check  # TypeScript
npm run build       # tuotantoversio hakemistoon dist/
npm run preview     # esikatsele tuotantoversiota
npm run kuvakkeet   # luo sovelluskuvakkeet uudelleen
```

Sovelluskuvakkeet piirretään ohjelmallisesti (`scripts/luo-kuvakkeet.mjs`): kuvake on
ampumataulu eli sisäkkäisiä renkaita, joten se syntyy pikseleittäin ilman
kuvankäsittelykirjastoa. Näin kuvakkeet ovat toistettavissa eikä projektiin tarvitse
tuoda binäärejä, joiden alkuperää ei voi tarkistaa.

Julkaisu tapahtuu automaattisesti, kun muutokset viedään `main`-haaraan.

---

## Kiitokset / Credits

### 💡 sra-koe — Matti Pöllä

Idea toteuttaa tuloslaskenta paikallisesti toimivana selainsovelluksena GitHub
Pagesissa tuli **Matti Pöllän** ([@mpolla](https://github.com/mpolla)) projektista
[**sra-koe**](https://github.com/mpolla/sra-koe) — SRA-ampumakokeen pisteytyssovellus,
joka osoitti että tämä lähestymistapa toimii: ei palvelinta, tiedot vain omalla
laitteella, ja silti käyttökelpoinen ampumaradan olosuhteissa. Kiitos ideasta ja
esimerkistä! 🙏

**Huom:** sra-koe-projektissa ei ole lisenssitiedostoa, joten siihen pätevät
tekijänoikeuden oletusehdot (kaikki oikeudet pidätetään). Tähän projektiin **ei ole
kopioitu koodia** sra-koe-projektista. Kiitos koskee ideaa ja lähestymistapaa —
toteutus on kirjoitettu itsenäisesti.

---

The idea of building the scoring as a local-first browser app hosted on GitHub Pages
came from **Matti Pöllä**'s ([@mpolla](https://github.com/mpolla))
[**sra-koe**](https://github.com/mpolla/sra-koe) — a scoring app for the SRA shooting
test, which demonstrated that the approach works: no server, data stays on the
device, and still usable in real range conditions. Thank you for the idea and the
example! 🙏

**Note:** sra-koe has no license file and is therefore all-rights-reserved by
default. **No code has been copied** from it into this project. The credit is for the
idea and approach — the implementation here was written independently.

### 📋 Alkuperäinen Excel-tuloskortti

Sovellus perustuu Nummi-Pusulan Reserviläiset ry:n Excel-tuloskorttiin.
Tekijä: Sami Hänninen.

---

## Lisenssi

[![CC BY-SA 4.0](https://img.shields.io/badge/Lisenssi-CC%20BY--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-sa/4.0/deed.fi)

Creative Commons **Nimeä-JaaSamoin 4.0 Kansainvälinen** (CC BY-SA 4.0) — sama lisenssi
kuin alkuperäisessä Excel-tuloskortissa, jonka pohjalta tämä on tehty.

**Saat vapaasti:**
- ✔ **Jakaa** — kopioida ja levittää sovellusta missä tahansa välineessä tai muodossa
- ✔ **Muokata** — muuntaa, muokata ja rakentaa tämän pohjalle mihin tahansa tarkoitukseen

**Ehdoilla:**
- ▶ **Nimeä tekijä** — mainitse Nummi-Pusulan Reserviläiset ry alkuperäisenä tekijänä
- ▶ **JaaSamoin** — jos muokkaat tai jaat tätä, käytä samaa CC BY-SA 4.0 -lisenssiä

Lisenssin täydet ehdot suomeksi: https://creativecommons.org/licenses/by-sa/4.0/deed.fi

© Nummi-Pusulan Reserviläiset ry

---

## Palaute

Palaute ja parannusideat: [GitHub Issues](https://github.com/samihanninen/OsumaOnni/issues)

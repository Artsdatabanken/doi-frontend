# doi-frontend
Tar inn DOI-api, presenterer dem som om det er en del av hjemmesiden

## Hvor finner jeg den?
- Testversjon: https://doi.test.artsdatabanken.no/
- Lokalt: siden den er ei enkeltfil, gå til din egen filbane der du klonet og åpne index.html

## Hva består den av?
Denne er omtrent så enkel som det er mulig å få en nettside. Den har en html, et par javascript og css-stylesheets. Man trenger med andre ord ikke installere noe for å kjøre, men kan åpne index.html i nettleseren så er alt på plass. 

Headeren og footeren henter den inn med javascript fra apiet til hjemmesiden, og dytter inn. Det er helt sikkert ikke helt sikkerhets-optimalt at vi tillater å injisere data fra et api. Men det er det vi gjør. En vakker dag kan vi bruke tid på å fikse opp det. Se f.eks denne:
https://labs.tadigital.com/index.php/2020/04/10/safe-ways-to-inject-html-through-javascript/

## deployment
I utgangspunktet overføres alle filer og kataloger, i prosjektet, til webserveren. Ekskuderinger gjøres i filen deploy.sh og med følgende kommando:
rsync -avr --exclude='*.sh' --exclude='*.yml' --exclude='/dump' --exclude='node_modules' --exclude='README.md' . dump

Merk at du kan sjekke inn, uten å rulle ut kode til webserveren, f.eks. om du bare oppdaterer dokumentasjonen, ved å legge til [ci skip] inne i commit-meldingen eks:
git commit -m "Oppdaterer readme [ci skip]"

## Følg med på Traivs
Travis bygger hver gang noe legges i main. 
Ønsker du å se om bygget er ferdig? 
Ta en titt her da vel:
https://travis-ci.com/github/Artsdatabanken/doi-frontend/builds/
Du må logge inn med din github-bruker.

## Opprette en DOI
Åpne Artskart med f.eks. denne linken [https://test.artsdatabanken.no/artskart2boci/#map/427864,7623020/3/background/greyMap/filter/{%22TaxonGroupIds%22:[7,23,5,15,14],%22IncludeSubTaxonIds%22:true,%22YearFrom%22:2019,%22YearTo%22:2019,%22Categories%22:[11,12,13,14,15,1,2,3,4,5,6,7,8,10],%22Found%22:[2],%22NotRecovered%22:[2],%22Img%22:[1]}](https://test.artsdatabanken.no/artskart2boci/#map/427864,7623020/3/background/greyMap/filter/{%22TaxonGroupIds%22:[7,23,5,15,14],%22IncludeSubTaxonIds%22:true,%22YearFrom%22:2019,%22YearTo%22:2019,%22Categories%22:[11,12,13,14,15,1,2,3,4,5,6,7,8,10],%22Found%22:[2],%22NotRecovered%22:[2],%22Img%22:[1]})

Trykk på _Liste_ -> _Eksport_. Velg eksporttype.

Da opprettes en eksportjobb med en DOI. Klikk på link til DOI for å se DOI'en.


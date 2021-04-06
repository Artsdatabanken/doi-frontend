# doi-frontend
Tar inn DOI-api, presenterer dem som om det er en del av hjemmesiden

## Hva består den av?
Denne er omtrent så enkel som det er mulig å få en nettside. Den har en html, en javascript og css-stylesheets. Man trenger med andre ord ikke installere noe for å kjøre, men kan åpne index.html i nettleseren så er alt på plass. Rett og slett fordi den ikke skal gjøre så mye avansert.

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
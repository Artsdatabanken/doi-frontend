


var languageObjects = {"nb":"Norsk (bokmål)","nn":"Norsk (nynorsk)", "en":"English"};
var languages = Object.keys(languageObjects);
var lang = "nb";

function languageSupport(){
    changeLanguage("nb");
}

function changeLanguage(newLang) {
    lang = newLang;

    // show selected elements by new language
    const selector = '[lang="'+newLang+'"]:not(html)';
    const toShow = document.querySelectorAll(selector);
    toShow.forEach(x=>showLang(x,true));
    toShow.forEach(x=>showLang(x,true));

    // selectors for the supported languages (excluding top html element)
    const allSupported = ['[lang="nn"]:not(html)', '[lang="nb"]:not(html)', '[lang="en"]:not(html)'];

    // remove the one we want to show from list of elements to hide
    if (allSupported.indexOf(selector) !== -1) {
        allSupported.splice(allSupported.indexOf(selector), 1);
    }

    // Hide the objects :)
    const toHide = document.querySelectorAll(allSupported);
    toHide.forEach(x=>showLang(x,false));
    toHide.forEach(x=>showLang(x,false));

    // update language of body
    document.documentElement.setAttribute('lang', newLang);
  }

  function showLang(node, show){
    if(show){
        node.classList.remove('lang-hide');
        node.ariaHidden = "false";
    }else{
        node.classList.add('lang-hide');
        node.ariaHidden = "true";
    }
  }


  function translate(key, node){
    try{
    if(translations[key]){
        languages.forEach(language => {
        const newElement = document.createElement('span');
        newElement.setAttribute('lang', language);
        const text = translations[key][language];
        if(text){
            newElement.innerText = translations[key][language];
        }else{
            console.info("translate missing for ", key, language )
            newElement.innerText = key;
        }
        showLang(newElement, lang === language)
        node.appendChild(newElement);
    });
    }else{
        console.info("translate missing for: ", key)
        node.innerText = key;
    }
    return node;
    }catch(err){
        console.error("failed at translations")
    }
}

const translations = {
    Taxons:{
        "nn": "Takson",
        "nb": "Takson",
        "en": "Taxons"
    },
    Areas:{
        "nn": "Områder",
        "nb": "Områder",
        "en": "Areas"
    },
    Tags:{
        "nn": "Andre filtere",
        "nb": "Andre filtere",
        "en": "Tags"
    },
    Year:{
        "nn": "År",
        "nb": "År",
        "en": "Year"
    },
    NotRecovered:{
        "nn": "ikkje gjenfunnet",
        "nb": "ikke gjenfunnet",
        "en": "not recovered"
    },
    Absent:{
        "nn": "ikkjefunnet",
        "nb": "ikke funnet",
        "en": "absent"
    },
    Inverted:{
        "nn": "uten ",
        "nb": "uten ",
        "en": "without "
    },
    HasImage:{
        "nn": "har bilde",
        "nb": "har bilde ",
        "en": "has image"
      },
    eastBoundLongitude:{
        "nn": "austlig lengdegrad",
        "nb": "østlig lengdegrad",
        "en": "east bound Longitude"
    },
    northBoundLatitude:{
        "nn": "nordlig breddegrad",
        "nb": "nordlig breddegrad",
        "en": "north bound latitude"
    },
    southBoundLatitude:{
        "nn": "sørlig breddegrad",
        "nb": "sørlig breddegrad",
        "en": "south bound latitude"
    },
    westBoundLongitude:{
        "nn": "vestlig lengdegrad",
        "nb": "vestlig lengdegrad",
        "en": "west bound Longitude"
    },
    geoLocations:{
        "nn": "Geolokasjoner",
        "nb": "Geolokasjoner",
        "en": "Geo locations"
    },
    CreatorsSourceType:{
        "nn": "Opphav kilde type",
        "nb": "Opphav kilde type",
        "en": "Creators Source Type"
    },
    CreatorsSourceName:{
        "nn": "Opphav kilde namn",
        "nb": "Opphav kilde navn",
        "en": "Creators Source Name"
    },
    ExportType:{
        "nn": "Eksporttype",
        "nb": "Eksporttype",
        "en": "Export type"
    }    ,
    Language:{
        "nn": "Språk",
        "nb": "Språk",
        "en": "Language"
    } ,
    resourceTypeGeneral:{
        "nn": "Datatype",
        "nb": "Datatype",
        "en": "Data type"
    },
    Size:{
        "nn": "Storleik",
        "nb": "Størrelse",
        "en": "Size"
    },
    Title:{
        "nn": "Tittel",
        "nb": "Tittel",
        "en": "Title"
    },
    PublicationYear:{
        "nn": "Publiseringsår",
        "nb": "Publiseringsår",
        "en": "Publication year"
    },
    Publisher:{
        "nn": "Publisert av",
        "nb": "Publisert av",
        "en": "Publisher"
    },
    State:{
        "nn": "Status",
        "nb": "Status",
        "en": "State"
    },
    resourceType:{
        "nn": "Ressurstype",
        "nb": "Ressurstype",
        "en": "Resource type"
    },
    Unspontaneus:{
        "nn": "uspontan",
        "nb": "uspontan",
        "en": "unspontaneus"
    },
    UnsureIdentification:{
        "nn": "usikker bestemming",
        "nb": "usikker bestemmelse",
        "en": "unsure identification"
    },
    Validated:{
        "nn": "validert",
        "nb": "validert",
        "en": "validated"
    },
    Institutions:{
        "nn": "Institusjoner",
        "nb": "Institusjoner",
        "en": "Institutions"
    },
    BasisOfRecords:{
        "nn": "Basis of records (Darwin Core)",
        "nb": "Basis of records (Darwin Core)",
        "en": "Basis of records (Darwin Core)"
    },
    Months:{
        "nn": "Måneder",
        "nb": "Måneder",
        "en": "Months"
    }

    


    
}

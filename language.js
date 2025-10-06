


const languages = ["nn", "nb", "en"];

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
    }
}
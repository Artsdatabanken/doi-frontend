
function languageSupport(){
    changeLanguage("nb");
    
    
}

function changeLanguage(newLang) {    

    // show selected elements by new language
    const selector = '[lang="'+newLang+'"]:not(html)';
    const toShow = document.querySelectorAll(selector);
    toShow.forEach(x=>x.classList.remove('lang-hide'));
    toShow.forEach(x=>x.ariaHidden = "false");

    // selectors for the supported languages (excluding top html element) 
    const allSupported = ['[lang="nn"]:not(html)', '[lang="nb"]:not(html)', '[lang="en"]:not(html)'];

    // remove the one we want to show from list of elements to hide
    if (allSupported.indexOf(selector) !== -1) {
        allSupported.splice(allSupported.indexOf(selector), 1);
    }

    // Hide the objects :)
    const toHide = document.querySelectorAll(allSupported);
    toHide.forEach(x=>x.classList.add('lang-hide'));
    toHide.forEach(x=>x.ariaHidden = "true");
   
    // update language of body
    document.documentElement.setAttribute('lang', newLang);

  }
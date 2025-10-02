

function languageSupport(){
    changeLanguage("nb");
}

function changeLanguage(newLang) {
    console.log("changeLanguage to:", newLang)
    
    const selector = '[lang="'+newLang+'"]:not(html)';
    const allSupported = ['[lang="nn"]:not(html)', '[lang="nb"]:not(html)', '[lang="en"]:not(html)'];

    if (allSupported.indexOf(selector) !== -1) {
        allSupported.splice(allSupported.indexOf(selector), 1);
    }

    const toHide = document.querySelectorAll(allSupported);
    toHide.forEach(x=>x.classList.add('lang-hide'));
    toHide.forEach(x=>x.classList.remove('lang-show'));
    toHide.forEach(x=>x.ariaHidden = "true");
   
    const toShow = document.querySelectorAll(selector);
    toShow.forEach(x=>x.classList.remove('lang-hide'));
    toShow.forEach(x=>x.classList.add('lang-show'));
    toShow.forEach(x=>x.ariaHidden = "false");

    document.documentElement.setAttribute('lang', newLang);

  }
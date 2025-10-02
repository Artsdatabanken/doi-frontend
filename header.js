function appendHeader(){
    let header = document.createElement('div');
    header.classList.add("page-wrapper");
    header.classList.add("header-elements");
    
    let nav = document.createElement('nav');
    nav.classList.add("header-bar");     
    nav.innerHTML = "<a href='https://artsdatabanken.no' class='logo-container'>" + 
    createAdbLogo() + createChevron() +"</a>" + createTitle();
    
    header.appendChild(nav);   
    header.appendChild(createLanguageToggler());
    header.appendChild(createLanguageDropDown());

    return header;
}

function createTitle(){
    return '<a class="header-title" href="index.html"><span>Artsdatabanken DOI</span></a>';
}

function createAdbLogo(){
    return'<svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">'
    + '<path d="M10.2964 20.3063C4.77713 20.3063 0.285685 15.815 0.285685 10.296C0.285685 4.77699 4.77713 0.285709 10.2964 0.285709C15.8156 0.285709 20.307 4.77699 20.307 10.296H17.7811C17.7811 6.17054 14.4249 2.81442 10.2993 2.81442C6.17364 2.81442 2.81739 6.17054 2.81739 10.296C2.81739 14.4215 6.17364 17.7805 10.2993 17.7805V20.3063H10.2964Z" fill="#262F31" />'
    + '<path d="M20.307 20.3071H13.4377V17.8045H17.8043V13.438H20.307V20.3071Z" fill="#E55440" />'
    + '<path d="M13.1183 11.8697C13.9857 11.8697 14.689 11.1665 14.689 10.2991C14.689 9.43162 13.9857 8.72842 13.1183 8.72842C12.2508 8.72842 11.5476 9.43162 11.5476 10.2991C11.5476 11.1665 12.2508 11.8697 13.1183 11.8697Z" fill="#262F31" />'
    + '</svg>';
}

function createChevron(){
    return '<svg width="14" height="80" viewBox="0 0 14 80" fill="none" xmlns="http://www.w3.org/2000/svg">'
    + '<path d="M1.97561 0.00069053L13.6911 40.0003L1.97561 80H0.00069053L11.7162 40.0003L0 0L1.97561 0.00069053Z" fill="#F2DFC5" /></svg>';
}

function createLanguageToggler(){
    const newButton = document.createElement('button');
    newButton.textContent = 'Språkvalg';
    newButton.addEventListener("click", () => {
        toggleLanguages();       
      });
    return newButton;
}

function createLanguageDropDown(){
    const container = document.createElement('div');
    container.setAttribute("id", "lang-container");
    container.classList.add('lang-hide');
    container.appendChild(createLanguageButtons("Norsk (bokmål)","nb"));
    container.appendChild(createLanguageButtons("Norsk (nynorsk)","nn"));
    container.appendChild(createLanguageButtons("English","en"));
    return container;
}

function createLanguageButtons(language,code){
    const newButton = document.createElement('button');
    newButton.textContent = language;
    newButton.addEventListener("click", () => {
        console.log(language, code);
        changeLanguage(code);
       
      });
    return newButton;
}

function toggleLanguages(){
    const langDiv = document.getElementById("lang-container");    
    if(langDiv.classList.contains('lang-hide')){
        langDiv.classList.remove('lang-hide');
    }else{
        langDiv.classList.add('lang-hide');
    }   

}


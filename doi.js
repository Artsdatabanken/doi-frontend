/*

If there is DOI-data: Doi presentation
Fetches data from api, presents by adding it to the html either by appending in blank divs,
or replacing the existing text.

*/

// Startup
window.addEventListener('load', function() {
    runApiCall();
    languageSupport();
    appendData("header",appendHeader())
})

// Change parameter/navigate between pages
window.onhashchange = function() {
    console.info("Updated doi-parameter, re-fetch")
    runApiCall();
}

// If no parameter - show frontpage, otherwise run the doi page
function runApiCall(){
    let guid = getGuid();
    if(guid == "" || guid == "#" || guid == "undefined"){
        console.info("NO GUID - show default page");
        try{
            pageSetup(false);
            showFrontPage();
        }catch(err){
            console.error("Show frontpage failed")
        }

    }else{
        getDoiData();
    }
}


// Fetch DOI data from api.
function getDoiData(isRerun){
    // Obtaining the relevant doi to look up.
    // Is its own function as it was called from several places. No longer is tho.
    let url = 'https://doiapi.'+detectTest()+'artsdatabanken.no/api/Doi/getDoiByGuid/'+getGuid();
    fetch(url)
    .then((response) => {
        return response.json()
    })
    .then((data) => {
        handleDoiData(data,isRerun);
    })
    .catch((err) => {
        pageSetup(false);
        showFrontPage();
    })

}

// Start presenting the DOI-page
function handleDoiData(data,isRerun){
    // Prep the page
    emptyAppenders();
    let attributes = data.data.attributes;

    pageSetup(true);
    if(!isRerun){
        // If the function is a rerun (update), dont hide the progressbar
        // Users will then be interested to know it reached finished state.
        hideProgressbar(attributes);
    }

    let desc = unWrapDescriptions(attributes.descriptions,"descriptionType","description");
    // Main Content


    addTimeDetails(attributes);
    addIngressData(attributes,desc);
    //addGeoLocation(attributes);
    addFiles(attributes,desc); // Download dataset is a part of addFiles, and lives in the sidebar.
    addDoi(desc);
    addDescriptions(desc);
    addImageSources(desc);


    // Sidebar
    addGeneralData(attributes);
    //addFileInfo(attributes,desc);
    addCitation(attributes);
    addArtskartUrl(desc);
    // addStats(attributes);
    // addTypes(attributes);

    //console.log("All data loaded")
}

// During dataset generation this checks for more data and updated progress
function getTimeUpdate(submitted,created,updated,valid){
    let timeout = 30000;
    try{
        setTimeout(function(){
            // Obtaining the relevant doi to look up.
            let url = 'https://doiapi.'+detectTest()+'artsdatabanken.no/api/Doi/getDatesByGuid/'+getGuid();
            fetch(url)
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                // UPDATE THESE WHEN NEW API
                let newsubmitted = data.Submitted || false;
                let newcreated = data.Created || false;
                let newupdated = data.Updated || false;
                let newvalid = data.Valid || false;
                let trigger_page_update = false;

                if(newsubmitted && !submitted){
                    // Should never trigger,
                    // we should always have a submitted
                    trigger_page_update = true;
                    //console.log("Rerun change at SUBMITTED")
                }else if(newcreated && !created){
                    // Received a new created date where we used to have none
                    trigger_page_update = true;
                    //console.log("Rerun change at CREATED?")
                }else if(newvalid){ // && !valid){
                    // Received a new valid date where we used to have none
                    // There should be no case where we previously had a valid date
                    trigger_page_update = true;
                    //console.log("Rerun change at VALID?");
                }else if(created && !newvalid){
                    // We have not received new valid date, but we do have a created date
                    // Time to check if we should update based on previous update date
                    if(newupdated!=updated.toString()){
                        // If the date is different, the newest will always be the newest,
                        // So no need to check more advanced than that.
                        trigger_page_update = true;
                        //console.log(">> Rerun change at UPDATED?")
                    }
                }

                // IF VALID ITS OUR LAST RUN
                // The logic here is that all fields must be updated, which means
                // That all page must reload each rerun. But on last rerun, keep progressbar
                if(trigger_page_update){
                    //console.info(">>rerun: update page")
                    getDoiData(true);
                }else{
                    //console.info(">>rerun: check again in timeout")
                    getTimeUpdate(submitted,created,valid)
                }
            })
            .catch((err) => {
                console.error("failed at fetch valid")
            })
        }, timeout);
    }catch(err){
        console.error("error in timechecker")
    }
}

// Data formatters



function hideProgressbar(attributes){
    try{
        let dates = attributes.dates;
        for(let i in dates){
            if(dates[i].dateType == "Valid"){
                // PROGRESSBAR HIDE
                updateStyle(document.getElementById("notyetvalid"),"display","none");
            }
        }
    }catch(err){
        console.error("Failed at hideProgressbar")
    }
}

function formatDate(date){
    return new Date(date).toLocaleDateString("nb-no", {hour: '2-digit', minute: '2-digit'});
}

function updateStyle(selector,styleselector,style){
    try{
        //console.log("styleselector",selector,styleselector,style)
        selector.style[styleselector] = style;
    }catch(err){
        console.error("error in changing style for", selector, styleselector,style);
    }
}

function changeClass(selector,className){
    try{
        selector.className = className;
    }catch(err){
        console.error("error in adding class for", selector, className);
    }
}

function addTimeDetails(attributes){
    try{
        let dates = unWrap(attributes.dates,"dateType","date");

        // HEADER TEXT
        addData("Time.Created",formatDate(dates.Created));
        //addData("Time.Updated",formatDate(dates.Updated));
        addData("Time.Valid",formatDate(dates.Valid));

        let text = "loading";
        // PROGRESS BAR
        if(dates.Submitted){
            addData("Progress.Submitted",formatDate(dates.Submitted));
            changeClass($("Progress.Submitted").parentElement,"done");
            updateStyle($("#progressindicator"),"width","20%");
            text = "Dette datasettet har blitt bestilt. Det vil si at eksporten står i kø for å opprettes. Men du kan likevel sniktitte på datane som er tilgjengelige så langt.";
        }else{
            changeClass($("Progress.Submitted").parentElement,"next");
            addData("Progress.Submitted","-");
        }

        if(dates.Created){
            addData("Progress.Created",formatDate(dates.Created));
            changeClass($("Progress.Created").parentElement,"done");
            updateStyle($("#progressindicator"),"width","50%");
            text = "Dette datasettet er ikke helt ferdig generert ennå, så det kan mangle data nedenfor. Men du kan likevel sniktitte på datane som er tilgjengelige så langt.";
        }else{
            changeClass($("Progress.Created").parentElement,"next");
            addData("Progress.Created","-");
        }

        if(dates.Valid){
            addData("Progress.Valid",formatDate(dates.Valid));
            changeClass($("Progress.Valid").parentElement,"done");
            updateStyle($("#progressindicator"),"width","100%");
            text = "Dette datasettet er ferdigeksportert.";
        }else{
            changeClass($("Progress.Valid").parentElement,"next");
            addData("Progress.Valid","-");
            getTimeUpdate(dates.Submitted||false,dates.Created||false,dates.Updated||false,dates.Valid||false);
        }
        addData("progresstext",text);

    }catch(err){
        console.error("Failed at times")
    }
}

function addIngressData(attributes,desc){
    try{

        addData("Ingress.count",desc['Count']||0);
        /*
        addData("Titles.type",attributes.titles[0].title);
        addData("Creators.sourcename",attributes.creators[0].name);
        addData("publisher",attributes.publisher);
        addData("Time.year",attributes.publicationYear);
        */
    }catch(err){
        console.error("Failed at Ingress")
    }
}


function addFiles(attributes,desc){
    // Also contains doi-sources which are duplicated in descriptions.doi
    // They are placed here due to the doi-system tracking the use through this parameter
    // But we instead fetch them from descriptions, as they there contain more data.
    // A bit unnecessary grouping, but ensures that anything relevant is found,
    // and anything doi is excluded
    try{
        let unwrappedRelatedIdentifiers = unWrap(attributes.relatedIdentifiers,"relatedIdentifierType",false);
        let relatedurls = unwrappedRelatedIdentifiers["URL"];

        for (let i in relatedurls){
            let item = relatedurls[i];
            if(item.resourceTypeGeneral=="Image"){
                const image = document.createElement('img');
                image.src  = item.relatedIdentifier;
                const closebutton = document.createElement('button');
                closebutton.innerHTML= "<span class='material-icons'>fullscreen</span>";
                closebutton.id = "fullscreenbutton";
                closebutton.className = "icon-button";
                // Make image BIG
                $("#img.appender").addEventListener('click',function(e){
                    let target = $("#img.appender");
                    let body = document.getElementsByTagName("BODY")[0];
                    if(target.className == "fullscreen"){
                        target.className = "sectionimage"
                        body.className = "";
                        closebutton.innerHTML = "<span class='material-icons'>fullscreen</span>";
                    }else{
                        target.className = "fullscreen";
                        body.className = "freeze-scroll";
                        closebutton.innerHTML = "<span class='material-icons'>fullscreen_exit</span>";
                    }
                });
                appendData('img.appender',closebutton);
                appendData('img.appender',image);
            }else if(item.resourceTypeGeneral=="Dataset"){
                const languages = ['nb', 'en'];
                for (let key in languages) {
                    if (!languages.hasOwnProperty(key)) {
                        continue;
                    }
                    const lang = languages[key];                 

                    let format = attributes.formats.toString().replace("application/","");//TODO                    
                    let innerformat = desc['ExportType'];                    
                    const label = lang == 'nb' ? "Last ned datasett" : "Download dataset";

                    // Make downloadbutton
                    let buttontext = "<span>" + label + " <br/>"+convertBytes(attributes.sizes)+" ("+format+"/"+innerformat+")</span>";
                    let material = "<span class='material-icons'>download</span>";
                    const zipurl = item.relatedIdentifier;

                    const downloadButton = createDownloadButton(zipurl);
                    downloadButton.innerHTML = material + buttontext;
                    
                    appendData('zip.appender.'+lang,downloadButton);
                }
            }
        }
    }catch(err){
        console.error("Failed in addFiles")
    }
}

function createDownloadButton(url){
    const newButton = document.createElement('button');
    newButton.className="primary";
    newButton.addEventListener("click", () => {
        download(url);
      });
    return newButton;
}

function download(url) {
    const a = createLink(url);
    a.download = url.split('/').pop()
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  function createLink(url,doitext) {
    const a = document.createElement('a')
    a.href = url;
    if(doitext){
        a.textContent = doitext;
    }
    return a;
  }


function addDoi(desc){
    // Contains all source datasets. Also those without a doi, but of doi-type data.
    // If a doi is missing, it will instead contain an id.
    try{
        let doi = desc['DOI'] || [];
        // Text formatting:
        if(doi.length!=1){
            let these = document.getElementsByClassName('contributor-plural');
        for (let element of these){
                element.style.display="inline";
                // TODO ANDLE ARIAS FOR THIS
         }
        }
        addData("Nr.Sources",doi.length);
        for (let i in doi){
            let items = doi[i].split("|");
            let contributer = document.createElement('li');
            contributer.className = "listitem";
            let numberline = "(<span> "+ items[1]+" element)</span>";
            let nameline = "<span>"+ items[2]+"</span>";
            contributer.innerHTML =  + " " +nameline;

            let link = items[0];           
            if(link.includes("https")){
                let doitext = link.replace("https://doi.org/","");
                getCitation(doitext);
                contributer.id = doitext;
                contributer.appendChild(createLink(link,doitext));
            }
            appendData('doi.appender',contributer);
        }
    }catch(err){
        console.error("Failed in doi")
    }
}

function getCitation(doi){
    let url = 'https://doiapi.artsdatabanken.no/api/Doi/getcitation/'+doi;
    console.info("running fetch ",url)
    fetch(url)
    .then((response) => {
        return response.text();
    })
    .then((data) => {
        let object = $("#"+doi);
        object.classList.add("hascitation");
        let newelement = document.createElement('span');
        let splitted = data.split("https");
        let link = "https"+splitted[1];
        let citation = splitted[0]+"<a href='"+link+"'>"+link+"</a>";
        newelement.className = "citation";
        newelement.innerHTML = "<br/>"+citation;

        //object.style.background = "lightgrey";
        object.appendChild(newelement);
        return data;
    })
    .catch((err) => {
        return doi;
    })

}

function addArtskartUrl(desc){
    try{
        let artskartelement = desc['ArtskartUrl'][0];
        let artskartLink = document.getElementById("artskartLink");
        artskartLink.href = artskartelement;
        console.info("updated artskarturl")        
    }catch(err){
        console.error("Failed at artskarturl;")
    }
}

function addImageSources(desc){
    try{
        //console.log(desc);
    // TODO
    let CoverageSource = desc.CoverageSource;
    let finishedstring = "";
    let sourceowners = {};
    for (let i in CoverageSource){
        let source = CoverageSource[i].split("|");
        let name = source[0];
        let owner = source[1];
        let url = source[2];

        // Re-wrap to better suit the display
        let exists = sourceowners[owner] || null;
        if(exists){
            sourceowners[owner]["name"].push(name);
        }else{
            let dict = {};
            dict["url"] = url;
            dict["name"] = [name];
            sourceowners[owner] = dict;
        }
    }
    for (let owner in sourceowners){
        let source = sourceowners[owner];
        let url = source.url || "";
        let names = source.name || [];

        let namestring = "";
        for(let i in names){
            let comma = "";
            if(i<=names.length-1&&names.length>1){
                comma = ", "
            }
            namestring += "<span>"+names[i]+comma+"</span>";
        }
        finishedstring += "<span class='img-source'><a href='"+url+"'>"+owner+"</a>"+namestring+"</span>"
    }
    addData("img.source",finishedstring)
    }catch(err){
        console.error("failed at img source")
    }

}

function addDescriptions(desc){
    try{
        let count = desc['Count'] || 0;
        addData("Descriptions.count",count);
        let descriptioncontent = desc['Description'] || null;
        if(descriptioncontent){
            descriptioncontent = JSON.parse(descriptioncontent);
            // TODO: ADD MORE THINGS THAT LIMIT. Need list and example data
            // TODO: FIlter is currently not displayed, due to changing structure.
            for(let i in descriptioncontent){
                if (i== "Areas"){
                    addAreas(descriptioncontent[i],"area");
                }else if(i == "Geometry"){
                    addAreas(descriptioncontent[i],"geometry");
                }else if(i == "Tags"){
                    //addTags(descriptioncontent.Tags); TODO FIX THIS FILTERS
                }else if(i == "Taxons"){
                    addTaxons(descriptioncontent.Taxons); // INTO INGRESS = ADDITIONS
                    // IF MORE THAN 3, add to the filterlist
                }
                else{
                    if(descriptioncontent[i] != ""){
                        let span = document.createElement('span');
                        span.id = "Descriptions."+i;
                        addDescriptionItems(descriptioncontent[i],span,i);
                        appendData("Descriptions.other",span)
                        updateStyle($('tags_other'),"display","inline-block");
                    }
                }
            }
        }
    }catch(err){
        console.error("failed at descriptions")
    }
}

function addTags(tags){
    try{

        // TODO: AWAIT API CORRECTIONS

        // USE CASE: NOT RECOVERED AND ABSENT ("Ikke gjenfunnet" og "Ikke funnet");
        // Cases are hardcoded, so using their ID.
        // 5 = Absent, 6 = not recovered

        let speciesdata = true;
        let absent = !tags[5].inverted;
        let notrecovered = !tags[6].inverted
        let casenumber = 0;

        if(!absent && !notrecovered && speciesdata){
            casenumber = 1;
        }else if(absent && !notrecovered && speciesdata){
            casenumber = 2;
        }else if(!absent && notrecovered && speciesdata){
            casenumber = 3;
        }
        else if(absent && notrecovered && speciesdata){
            casenumber = 4;
        }else if(absent && notrecovered && !speciesdata){
            casenumber = 5;
        }else if(absent && !notrecovered && !speciesdata){
            casenumber = 5;
        }else if(!absent && notrecovered && !speciesdata){
            casenumber = 5;
        }


        //console.log(absent, notrecovered, casenumber)

        let absence_items = document.getElementsByClassName("tags_absence");
        for (let element of absence_items){
            casenumber = "tags_case_" + casenumber;
            if(element.className.includes(casenumber)){
                element.style.display="inline";
            }
         }


/*
        console.log(tags[5].name)
        console.log(tags[5].inverted)
        console.log(tags[6].name)
        console.log(tags[6].inverted)
*/

    }catch(err){
        console.error("failed at tags")
    }
}

function addAreas(what,where){
        try{
            if(what){
                if(Object.keys(what).length>0){
                    updateStyle($('tags_'+where),"display","inline-block");
                    addDescriptionItems(what,"Descriptions."+where);
                } else{
                    console.error("nope to areas")
                }
            }

        }catch(err){
            console.error("failed at add"+where)
        }
}

function addDescriptionItems(what,where,title){
    try{

        if( typeof what === 'string' ) {
            what = [ what ];
        }
        let whatarray = Object.keys(what);
        let endresult = "";

        if(title){
            let link = " http://rs.tdwg.org/dwc/terms/";
            let formattedtitle = title.replace(/([A-Z])/g, ' $1').trim()
            link += title.charAt(0).toLowerCase() + title.slice(1);
            let lastletter = link.substring(link.length - 1,link.length);
            if(lastletter == "s"){
                link = link.substring(0, link.length - 1);
            }

            endresult += "<a href="+link+" class='contenttitle'>"+formattedtitle+":</a> ";
        }

        for(let i in whatarray){
            let key = whatarray[i];
            let item = what[key];
            // Here we may need specific things for different fields
            let content = item.name || item;
            if(item.code){
                content = item.code += " - "+ content;
            }
            if(item.inverted){
                content = "not " + content;
            }

            let writestring = "<span>"+content+"</span>";

            // Handle different lengths of lists (plurality)
            if(whatarray.length > 2 && i < whatarray.length - 2){
                writestring += ", ";
            }
            if(i == whatarray.length - 2 && whatarray.length > 1){
                // -2 because 0 index vs 2nd last item in length
                let lang_nn_nb = "<span class='nb nn lang-show'> og </span>";
                let lang_eng = "<span class='en'> and </span>";
                writestring += lang_nn_nb + lang_eng;
            }
            endresult += writestring;

        }

        endresult += ". ";
            if(title){
                endresult += "</br>";
            }
        addData(where,endresult)

    }catch(err){
        console.error("failed at addDescriptionItems")
    }
}

function addTaxons(taxons){
    try{
        if(taxons){
             // TAXONS
        let lang_nn_nb = "<span class='nb nn lang-show'>av </span>";
        let lang_eng = "<span class='en'> of </span>";
        let ingresstaxons = lang_nn_nb + lang_eng;
        let taxonarray = Object.keys(taxons);
        if(taxonarray.length < 3){
            for(let i in taxonarray){
                let key = taxonarray[i];
                let taxon = taxons[key];
                let name = "<span class='nb nn lang-show'>"+taxon.name +" </span>" || "";
                let taxonformat = name+"<i>"+taxon.scientificname+"</i> "+taxon.author;
                if(i == 0 && taxonarray.length > 2){
                    taxonformat += ", ";
                }
                if(i == taxonarray.length - 2 && taxonarray.length > 1){
                    // -2 because 0 index vs 2nd last item in length
                    let lang_nn_nb = "<span class='nb nn lang-show'> og </span>";
                    let lang_eng = "<span class='en'> and </span>";
                    taxonformat += lang_nn_nb + lang_eng;
                }
                ingresstaxons += taxonformat;
            }
            addData("ingress.taxons",ingresstaxons)
        }
        }
    }catch(err){
        console.error("failed at taxons")
    }
}


function addGeneralData(attributes){
    try{
        // DOI URL
        // URL is always the non-test version as it's from api.
        let shortcutLink = document.createElement('li');
        shortcutLink.textContent=attributes.doi;
        appendData('Attributes.doi',shortcutLink);   

        reLink(true)
        let headerdoi = "DOI: "+ attributes.doi;
        addData('header-doi',headerdoi);
        //addData("Attributes.url",attributes.url);
        //addData("data.Id",data.data.id);
        //addData("data.Type",data.data.type);
        //addData("Attributes.prefix",attributes.prefix);
        //addData("Attributes.suffix",attributes.suffix);
        //addData("Attributes.identifiers",attributes.identifiers);
    }catch(err){
        console.error("General data failed")
    }
}


function reLink(addLink){
    // activate and deactivate element in breadcrumb
    try{        
        const reLinked = document.getElementById("reLinked");
        const unLinked = document.getElementById("unLinked");
        let activate = reLinked;
        let unactivate = unLinked;
        if(!addLink){   
            activate = unLinked;
            unactivate =  reLinked;
        }
        showOrHide(activate,true);
        activate.innerHTML = unactivate.innerHTML;
        showOrHide(unactivate,false);         
    }catch(err){
        console.error("unLink failed")
    }
}

function addFileInfo(attributes,desc){
    try{
        addData("Descriptions.ExportType",desc['ExportType']);
        addData("Size",convertBytes(attributes.sizes));
        addData("Attributes.formats",attributes.formats); // TODO: OMPLASSER
        let apiurl = 'https://doiapi.'+detectTest()+'artsdatabanken.no/api/Doi/getDoiByGuid/'+getGuid();
        let apilink = "<a href="+apiurl+" >"+attributes.source+"</a>";
        addData('Api.link',apilink);
        addData("Titles.lang",attributes.titles[0].lang);
        addData("Attributes.state",attributes.state);
        //addData("Creators.sourcetype",attributes.creators[0].nameType);
        //addData("Attributes.version",attributes.version);
        //addData("Attributes.metadataVersion",attributes.metadataVersion);
        //addData("Attributes.schemaVersion",attributes.schemaVersion);
    }catch(err){
        console.error("File info failed")
    }

}

function addTypes(attributes){
    try{
        addData("Attributes.types.resourceTypeGeneral",attributes.types.resourceTypeGeneral);
        addData("Attributes.types.schemaOrg",attributes.types.schemaOrg);
        addData("Attributes.types.bibtex",attributes.types.bibtex);
        addData("Attributes.types.citeproc",attributes.types.citeproc);
        addData("Attributes.types.ris",attributes.types.ris);
    }catch(err){
        console.error("Types failed")
    }
}

function addCitation(attributes){
    try{
        let accesseddate = "yyyy-mm-dd";
        let dates = attributes.dates;
        for(let i in dates){
            if(dates[i].dateType == "Created"){
                accesseddate = dates[i].date.split("T")[0];
            }
        }
        addData("citationDate",accesseddate);
        addData("citationYear",attributes.publicationYear);
        addData("citationPublisher",attributes.publisher);
        addData("citationCreator",attributes.creators[0].name);
        addData("citationURL",attributes.types.resourceTypeGeneral);
        addData("citationDataset",getDoiUrl(attributes));
    }catch(err){
        console.error("citation failed")
    }

}

function addStats(attributes){
    try{
        addData("Attributes.viewCount",attributes.viewCount);
        addData("Attributes.downloadCount",attributes.downloadCount);
        addData("Attributes.referenceCount",attributes.referenceCount);
        addData("Attributes.citationCount",attributes.citationCount);
        addData("Attributes.partCount",attributes.partCount);
        addData("Attributes.partOfCount",attributes.partOfCount);
        addData("Attributes.versionCount",attributes.versionCount);
        addData("Attributes.versionOfCount",attributes.versionOfCount);
    }catch(err){
        console.error("Satistics failed")
    }

}

function addGeoLocation(attributes){
    try{
        let geoLocations = attributes.geoLocations[0];
        addData("geoLocationBox.eastBoundLongitude",geoLocations.geoLocationBox.eastBoundLongitude);
        addData("geoLocationBox.northBoundLatitude",geoLocations.geoLocationBox.northBoundLatitude);
        addData("geoLocationBox.southBoundLatitude",geoLocations.geoLocationBox.southBoundLatitude);
        addData("geoLocationBox.westBoundLongitude",geoLocations.geoLocationBox.westBoundLongitude);
    }catch(err){
        console.error("geolocations failed")
    }
}


// Help Functions

function $(id){
    if(id[0]=="."){
        return document.getElementsByClassName(id.substring(1));
    }else if(id[0]=="#"){
        return document.getElementById(id.substring(1));
    }
    return document.getElementById(id);
}

function getGuid(){
    let guid = window.location.hash;
    return guid.replace("#","");
}

function detectTest(){
    // Detect if we're running on test or not
    let url = window.location.href;
    if(url.includes("test") || (url.includes("index")|| url.includes("artskart"))
    ){
        return "test."
    }
    return "";
}

function getDoiUrl(attributes){
    // Create doi-url if state != draft
    if(attributes.state === "draft") {
        return attributes.url;
    }
    if (detectTest() !== ""){
        return "https://handle.stage.datacite.org/"+attributes.doi;
    }
    return "https://doi.org/"+attributes.doi;
}

function convertBytes(x){
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let l = 0, n = parseInt(x, 10) || 0;
    while(n >= 1024 && ++l){
        n = n/1024;
    }
    //include a decimal point and a tenths-place digit if presenting
    //less than ten of KB or greater units
    return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
}

function unWrap(wrapped,criteria,content){
    try{
        // Looping and bundling by type to easier use relevant data only
        if(wrapped == undefined || criteria == undefined || content == undefined) {
            console.error("error in unwrap",criteria,content)
            return null;
        }
        let unwrapped = {};
        for(let i in wrapped){
            let item = wrapped[i];
            let key = item[criteria] || null;
            if (content == "TechnicalInfo"){
                item = item.split("#");
                key = item[0];
                item = item.slice(1).join("#");
            }
            else if(content !== false){
                item = item[content];
            }

            let exists = unwrapped[key] || null;
            if(exists){
                unwrapped[key].push(item);
            }else{
                unwrapped[key] = [item];
            }
        }
        return unwrapped;
    }catch(err){
        console.error("unwrap failed")
    }

}

function unWrapDescriptions(wrapped,criteria,content){
    wrapped = unWrap(wrapped,criteria,content)["TechnicalInfo"];
    return unWrap(wrapped,criteria,"TechnicalInfo");
}

function addData(id,content){
    if(content!= undefined && id!= undefined){
        try{
            let object = document.getElementById(id) || id;
            object.innerHTML = content;
        }
        catch(err){
            console.error("failed for id: ",id,"and content:" ,content)
        }
    }else{
        // To avoid entire page breaking down if one error occurs
        try{
            document.getElementById(id).innerHTML = "Ikke oppgitt";}
        catch(err){
            console.error("failed for id: ",id,"and content:" ,content)
        }
    }
}

function appendData(id,content){
    if(content!= undefined && id!= undefined ){
        try{
            document.getElementById(id).appendChild(content);
        } catch(err){
            console.error("failed for id: ",id,"and content:" ,content);
        }

    }else{
        // To avoid entire page breaking down if one error occurs
        console.error("no such content ", id,content);
    }
}

function emptyAppenders(){
    try{
        // Empty appenders: 
        document.getElementById("img.appender").innerHTML = "";
        document.getElementById("zip.appender.nb").innerHTML = "";
        document.getElementById("zip.appender.en").innerHTML = "";        
        document.getElementById("artskartLink").href = "";        
        document.getElementById("doi.appender").innerHTML = "";
        document.getElementById("Descriptions.other").innerHTML = "";
        //document.getElementById("Api.link").innerHTML = "";
    }catch(err){
        console.error("failed at emptying appenders")
    }
}

function pageSetup(activate){
    try{
        showOrHide(document.getElementById("nodata"),!activate);
        for (let el of document.getElementsByClassName("section")){
            showOrHide(el,activate);
        }
        for (let el of document.getElementsByClassName("inlinesection")){
            showOrHide(el,activate);
        }

        for (let el of document.getElementsByClassName("ingress")){
            showOrHide(el,activate);
        }        
        showOrHide(document.getElementById("timedetails"),activate);        
    }catch(err){
        console.error("failed at pageSetup")
    }
}

function showOrHide(element,activate){
    // activate = boolean
    try{        
        if(activate){
            element.classList.remove('hidden');
            element.ariaHidden = "false";
        }else{
            element.ariaHidden = "true";
            element.classList.add('hidden');        
        }               
    }catch(err){
        console.error("showOrHide failed for element:", element)
    }

}
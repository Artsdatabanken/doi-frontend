/* 

If there is DOI-data: Doi presentation
Fetches data from api, presents by adding it to the html either by appending in blank divs, 
or replacing the existing text. 

*/

// Startup
window.addEventListener('load', function() {
    runApiCall();
    getHeaderMenu();
    getFooter();
    languageSupport();
})

// Change parameter/navigate between pages 
window.onhashchange = function() { 
    console.info("Updated doi-parameter, re-fetch")
    runApiCall();
}

window.addEventListener('click', function(e) {
    // Closes dropdown menu when clicking outside it. 
    if (document.getElementById('headermenu')){
        if (!document.getElementById('headermenu').contains(e.target)) {
            document.getElementById("Omoss").style.display = "none";
            document.getElementById("Meny").style.display = "none";
            //document.getElementById("English").style.display = "none";
        }

        if(e.target.id == "navbar-mobile"){
            let drop = document.getElementById("headermenu");
            if(drop.className == "hide"){
                drop.className = "show"
            }else{
                drop.className = "hide"
            }
        }

   }
})

function languageSupport(){
    changeLanguage("nn");
    changeLanguage("nb");
    changeLanguage("en");
}

function changeLanguage(lang){    
    let id = "lang-" + lang;
    let classselector = "."+ lang;
    document.getElementById(id).addEventListener('click',function(e){   
        let these = document.querySelectorAll(classselector);
        let those = document.querySelectorAll('.lang-show');
        those.forEach(x=>x.classList.replace('lang-show','lang-hide'));  
        these.forEach(x=>x.classList.remove('lang-hide'));
        these.forEach(x=>x.classList.add('lang-show'));     
        
        let them = document.querySelectorAll('.languageselector button');
        them.forEach(x=>x.className = "lang-not-chosen");  

        let thisone = document.getElementById(id);
        thisone.className = "lang-chosen";  
    });


}


// If no parameter - show frontpage, otherwise run the doi page
function runApiCall(){
    let guid = getGuid();
    if(guid == "" || guid == "#" || guid == "undefined"){
        console.log("NO GUID - show default page");
        try{           
            hideAndShow("none");
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
        hideAndShow("none");
        showFrontPage();
    })

}

// Start presenting the DOI-page
function handleDoiData(data,isRerun){
    // Prep the page
    emptyAppenders();    
    let attributes = data.data.attributes;      

    hideAndShow("show");
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
    addAreas(desc);        
    addDescriptions(desc);


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
        console.log("error in timechecker")
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

        addData("Ingress.count",desc['Count']);
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
                closebutton.id = "fullscreenbutton"
                
                
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
                let zipurl = item.relatedIdentifier;
                let zip = document.createElement('div');
                let format = attributes.formats.toString().replace("application/","");//TODO
                console.log(format)
                let innerformat = desc['ExportType'];
                console.log(desc['ExportType'])
                
                let buttontext = "<span>Last ned datasett <br/>"+convertBytes(attributes.sizes)+" ("+format+"/"+innerformat+")</span>";
                let material = "<span class='material-icons'>download</span>";
                zip.innerHTML = "<a href="+zipurl+" class='biglink downloadlink'>"+material+buttontext+"</a>";
                appendData('zip.appender',zip);
            }
        }
    }catch(err){
        console.error("Failed in addFiles")
    }    
}


function addDoi(desc){
    // Contains all source datasets. Also those without a doi, but of doi-type data.
    // If a doi is missing, it will instead contain an id.
    try{
        let doi = desc['DOI'];           
        // Text formatting:
        let datacontributors = doi.length+" dataleverandør";
        if(doi.length>1){
            datacontributors +="er";
        }
        addData("Nr.Sources",datacontributors);       
        for (let i in doi){
            let items = doi[i].split("|");
            let div = document.createElement('div');
            div.className = "listitem";
            let link = items[0];
            let linkline = ""; // There is an id here, but what type? what it do?
            
            if(link.includes("https")){
                let doitext = link.replace("https://doi.org/","");
                linkline = "<a href="+link+">"+doitext+"</a>";                
            }           

            let numberline = "<span> ("+ items[1]+" element)</span></br>";
            let nameline = "<span>"+ items[2]+"</span>";            
            div.innerHTML = nameline+numberline+linkline;
            appendData('doi.appender',div);
        }
    }catch(err){
        console.error("Failed in doi")
    }
}

function addArtskartUrl(desc){
    try{
        let artskartelement = desc['ArtskartUrl'][0];
        let a = document.createElement('div');
        let launch = "<span class='material-icons'>launch</span>";
        a.innerHTML = "<a href="+artskartelement+" class='biglink artskartlink'>"+launch+"<span>Se oppdatert utvalg <br/>i Arskart </span></a>";       
        appendData('a.appender',a);
    }catch(err){
        console.error("Failed at artskarturl;")
    }
}

function addAreas(desc){
    try{
        // Add areas if exists
        let areas = desc['Areas'];   
        if(areas && areas.length >0)   { 
            let ar = document.createElement('div');
            ar.innerHTML = "<h3> Områder </h3>";
                for (let i in areas){
                    ar.innerHTML += "<span>"+areas[i]+"</span>";
                }
            appendData('area.appender',ar);
        }
    }catch(err){
        console.error("failed at areas")
    }
}



function addDescriptions(desc){
    try{
        addData("Descriptions.count",desc['Count']);

        let descriptioncontent = JSON.parse(desc['Description']);
        let taxons = descriptioncontent.Taxons;
        let tags = descriptioncontent.Tags;
        let geometry = descriptioncontent.Geometry;
        //console.log(descriptioncontent)

        addData("Descriptions.geometry",geometry);
        addData("Descriptions.tags",tags);
        addData("Descriptions.taxons",taxons);
    }catch(err){
        console.error("failed at descriptions")
    }
}

function addGeneralData(attributes){
    try{
        // DOI URL 
        // URL is always the non-test version as it's from api.
        let crumbdivider = "<span class='breadcrumbdivider'>> </span>"
        let doilink = crumbdivider+"<li class='in-breadcrumb'><a href="+getDoiUrl(attributes)+" >"+attributes.doi+"</a></li>";      
        updateStyle($('Attributes.doi'),"display","inline-block");
        addData('Attributes.doi',doilink);
        addData('header-doi',attributes.doi);
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

        attributes.dates
        let year = "("+attributes.publicationYear+")";
        
        let citation = attributes.publisher+" "+year+". "
        +attributes.creators[0].name+". " 
        + attributes.types.resourceTypeGeneral
        +" "+getDoiUrl(attributes)
        +" accessed via artsdatabanken.no"
        +" on "+accesseddate+".";

        addData("citation",citation);
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
    if(url.includes("test") || url.includes("index")){
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
    console.log(wrapped)
    wrapped = unWrap(wrapped,criteria,content)["TechnicalInfo"];
    
    return unWrap(wrapped,criteria,"TechnicalInfo");
}


function addData(id,content){
    if(content!= undefined && id!= undefined){
        try{
            document.getElementById(id).innerHTML = content;}
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

function hideAndShowActions(param,otherparam){
    try{
        for (let el of document.getElementsByClassName("section")){
            updateStyle(el,"display",param)
        }

        for (let el of document.getElementsByClassName("ingress")){
            updateStyle(el,"display",param)
        }
        updateStyle(document.getElementById("nodata"),"display",otherparam);
        updateStyle(document.getElementById("timedetails"),"display",param);
    }catch(err){
        console.error("failed at hideandshowactions")
    }   
}

function emptyAppenders(){
    try{
        // Empty appenders:
        document.getElementById("img.appender").innerHTML = "";
        document.getElementById("zip.appender").innerHTML = "";
        document.getElementById("a.appender").innerHTML = "";
        document.getElementById("doi.appender").innerHTML = "";
        document.getElementById("area.appender").innerHTML = "";
        //document.getElementById("Api.link").innerHTML = "";
    }catch(err){
        console.error("failed at emptying appenders")
    }
}

function hideAndShow(which){
    if(which == "show"){
        hideAndShowActions("inline-block","none");
    }else{
        hideAndShowActions("none","inline-block");

    }
}

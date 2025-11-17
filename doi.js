/*

If there is DOI-data: Doi presentation
Fetches data from api, presents by adding it to the html either by appending in blank divs,
or replacing the existing text.

*/

var testing = true;
// No jquery, but use the $ shorthand (custom function) to ensure error-handling.

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

// Actions/Eventlisteners
function getTimeUpdate(submitted,created,updated,valid){
    console.info("check for updates");
    let timeout = 30000;
    try{
        setTimeout(function(){
            // Obtaining the relevant doi to look up.
            let url = 'https://doi.'+detectTest()+'artsdatabanken.no/api/Doi/getDatesByGuid/'+getGuid();
            fetch(url)
            .then((response) => {
                return response.json()
            })
            .then((data) => {
                resetPage();
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
                console.error("failed at fetch valid",err)
            })
        }, timeout);
    }catch(err){
        console.error("error in timechecker",err)
    }
}

function updateProgress(type,dateObject){
    try{    
        if(dateObject){
            const width = type === "Submitted"?"18%":(type === "Created"?"50%":"100%");
            addData("Progress."+type,formatDate(dateObject)); 
            changeClass($("#Progress."+type).parentElement,"done");
            updateStyle($("#progressindicator"),"width",width);
            showElement($('#Progress.status.'+type),false);  
        }
    }catch(err){
        console.error("failed at update progress", err)
    }
}

function showProgressBar(attributes,isRerun){
    if(!isRerun){
        // If the function is a rerun (update), dont hide the progressbar
        // Users will then be interested to know it reached finished state.
        const testProgressBar = false;
        try{
            let dates = attributes.dates;           
            const valid =  dates.find(date => date.dateType === 'Valid');
            //showElement($('#notyetvalid'),!valid||testProgressBar);
        }catch(err){
            console.error("Failed at hideProgressbar",err)
        }      
    }
}

function download(url) {
    const a = makeLink(url);
    a.download = url.split('/').pop()
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}


// URL handling

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

function detectTest(){
    // Detect if we're running on test or not
    let url = window.location.href;
    if(
        url.includes("test") || // test environment
        url.includes("doi-frontend") // localhost
    ){
        return "test."
    }
    return "";
}

function getGuid(){
    let guid = window.location.hash;
    return guid.replace("#","");
}

// API CALLS

function runApiCall(){
    // If no parameter - show frontpage, otherwise run the doi page
    let guid = getGuid();
    if(guid == "" || guid == "#" || guid == "undefined"){
        try{
            pageSetup(false);
            showFrontPage();
        }catch(err){
            console.error("Show frontpage failed",err)
        }
    }else{
        getDoiData();
    }
}

function getCitation(doi,appendTo){   
    let url = 'https://doi.'+detectTest()+'artsdatabanken.no/api/Doi/getcitation/'+doi;
    fetch(url)
    .then((response) => {
        return response.text();
    })
    .then((data) => {        
        if(data !== ""){
            console.log(data)
            let newelement = document.createElement('span');
            let splitted = data.split("https");
            let link = "https"+splitted[1];
            let citation = splitted[0]+"<a href='"+link+"'>"+link+"</a>";
            newelement.className = "citation";
            newelement.innerHTML = "<br/>"+citation;
            console.log(newelement);
            appendTo.appendChild(newelement);
        }else{
            console.log("empty data")
        }     
        
    })
    .catch((err) => {
        console.error("getCitation: ",err)
        return doi;        
    })
}

function getDoiData(isRerun){
    // Obtaining the relevant doi to look up.
    // Is its own function as it was called from several places. No longer is tho.
    let url = 'https://doi.'+detectTest()+'artsdatabanken.no/api/Doi/getDoiByGuid/'+getGuid();
    fetch(url)
    .then((response) => {
        return response.json()
    })
    .then((data) => {
        handleDoiData(data,isRerun);
    })
    .catch((err) => {
        console.error(err);
        pageSetup(false);
        showFrontPage();
    })
 }

// Update existing DOM-items

function updateImage(url){
    const image = document.createElement('img');
    image.src  = url;
    // make button
    const closebutton = document.createElement('button');
    const material = document.createElement('span');
    material.className = "material-icons-outlined";
    material.textContent = "open_in_full";
    closebutton.appendChild(material);    
    closebutton.id = "fullscreenbutton";
    closebutton.className = "icon-button";

    // Make image BIG
    $("#img.appender").addEventListener('click',function(e){
        let target = $("#img.appender");
        let body = document.getElementsByTagName("BODY")[0];
        if(target.className == "fullscreen"){
            target.className = "sectionimage"
            body.className = "";
            closebutton.innerHTML = "<span class='material-icons-outlined'>open_in_full</span>";
        }else{
            target.className = "fullscreen";
            body.className = "freeze-scroll";
            closebutton.innerHTML = "<span class='material-icons-outlined'>close</span>";
        }
    });
    appendData('img.appender',closebutton);
    appendData('img.appender',image);
}

function updateDownloadButton(attributes,desc,url){
    let format = attributes.formats.toString().replace("application/","");//TODO
    let innerformat = desc['ExportType'];
    
    // Update downloadbutton
    let buttontext = " (" +convertBytes(attributes.sizes)+", "+format+"/"+innerformat+")";
    addData('zip.appender',buttontext);

    const downloadButton = $("#downloadButton");
    downloadButton.addEventListener("click", () => {
        download(url);
        });                
}

function updateBreadCrumb(addLink){
    // activate and deactivate element in breadcrumb
    try{
        const reLinked = $("#reLinked");
        const unLinked = $("#unLinked");
        let activate = reLinked;
        let unactivate = unLinked;
        if(!addLink){
            activate = unLinked;
            unactivate =  reLinked;
        }
        showElement(activate,true);
        activate.innerHTML = unactivate.innerHTML;
        showElement(unactivate,false);
    }catch(err){
        console.error("unLink failed")
    }
}
    
// Format, convert and extract data
function formatDate(date){
    return new Date(date).toLocaleDateString("nb-no", {hour: '2-digit', minute: '2-digit'});
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

function $(id){
    try{
        if(id[0]=="."){
            return document.getElementsByClassName(id.substring(1));
        }else if(id[0]=="#"){
            return document.getElementById(id.substring(1));
        }else{
            console.error("code was missing '#' or '.' in $ shorthand. try matching anyways", id);
            try{
                if(document.getElementById(id)){
                    return document.getElementById(id);
                }else{
                    return document.getElementsByClassName(id);
                }
            }catch(err){
                console.error(err, "could not find html object", id)
            }

        }
    }catch(err){
        console.error(err, "could not find html object", id)
    }
}

// Make DOM Objects

function makePairElements(title,content){
  let dd = document.createElement('dd');
  dd.textContent=content;
  return makeDataPairObjects(title,title,dd);
}

function makeLocationSpan(title,content,source){
  try{
    const outerDiv = document.createElement('div');
    translate(title, outerDiv);
    outerDiv.className = "tag";
    const contentSpan = document.createElement('span');
    contentSpan.innerText = content;
    contentSpan.className = "add-space";
    outerDiv.appendChild(contentSpan);
    source.appendChild(outerDiv);
  }catch(err){
    console.error(err, "failed at makeLocationSpan")
  }
}

function makeDataPairObjects(containerId,title,dd){
// CONTENT has to be a created dd-object.
try{
    // Make outer container
    const div = document.createElement('div');
    div.id = containerId;

    // Make key
    const dt = document.createElement('dt');
    translate(title, dt);
    // attach stuff
    div.appendChild(dt)
    div.appendChild(dd)
    return div;

}catch(err){
    console.error("failed at make data pair objects")
}
}

function makeTags(containerId,title,dd){
// CONTENT has to be a created dt-object.
try{
    showElement($('#tags_other'),true);
    const data = makeDataPairObjects(containerId,title,dd);
    appendData("Descriptions.other",data);

}catch(err){
    console.error("failed at make makeTags")
}
}

function makeLink(url,text) {
    const a = document.createElement('a')
    a.href = url;
    if(text){
        a.textContent = text;
    }
    return a;
}

function makeDescriptionItems(descriptionElement,title){
    try{
        // TITLE
        let key = title;
        if(title){
            let formattedtitle = title.replace(/([A-Z])/g, ' $1').trim()
            key = formattedtitle;
            // const link = makeTagLink(title);
        }
        // CONTENT
        const dd = document.createElement('dd');
        if( typeof descriptionElement === 'string' ) {
            descriptionElement = [ descriptionElement ];
        }
        const decriptionList = Object.keys(descriptionElement);
       // console.log("element",descriptionElement, title)
        for(let i in decriptionList){
            const key = decriptionList[i];
            const item = descriptionElement[key];
            //console.log(key,item)
            // Here we may need specific things for different fields
            let text = item.name || item;
            // make tag
            const span = document.createElement('span');
            span.className="tag";
            if(item.code){
                // Redlist/Alienlist uses "code" instead of name
                text = item.code + " - " + text; 
            }
            if(item.inverted === "true"){
                translate("Inverted", span);
            }
            if(text === ""){
                text = decriptionList[0];
            }
            translate(text, span);
            dd.appendChild(span);
        }

        makeTags("Descriptions."+title,title,dd);


    }catch(err){
        console.error("failed at makeDescriptionItems")
    }
}

function makeTagLink(title){
    // NO IDEA WHEN THIS SHOULD BE USED
    let link = " http://rs.tdwg.org/dwc/terms/"
        + title.charAt(0).toLowerCase() + title.slice(1);
        let lastletter = link.substring(link.length - 1,link.length);
        if(lastletter == "s"){
            link = link.substring(0, link.length - 1);
        }
        return " <a href="+link+" class='contenttitle'> (link) :</a> ";
}


// Handle specific content


function addDoi(desc){
    // Contains all source datasets. Also those without a doi, but of doi-type data.
    // If a doi is missing, it will instead contain an id.
    try{
        let doi = desc['DOI'] || [];
        // Text formatting:
        if(doi.length!=1){
            let these = $('.contributor-plural');
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
            let numberline = "<span> ("+ items[1]+" element)</span>";
            let nameline = "<span>"+ items[2]+"</span>";
            contributer.innerHTML = nameline + numberline;

            let link = items[0];
            if(link.includes("https")){
                console.log(link)
                let doitext = link.replace("https://doi.org/","");                
                contributer.id = doitext;
                contributer.appendChild(makeLink(link,doitext));
                // getCitation was here but it makes a citation which seems.. wrong?          
            }
            appendData('doi.appender',contributer);
        }
    }catch(err){
        console.error("Failed in doi",err)
    }
}

function addTimeDetails(attributes){
    try{
        let dates = unWrap(attributes.dates,"dateType","date");
        // HEADER TEXT
        addData("Time.Created",formatDate(dates.Created));
        addData("Time.Valid",formatDate(dates.Valid));
        updateProgress("Submitted",dates.Submitted);
        updateProgress("Created",dates.Created);
        //updateProgress("Valid",dates.Valid);
        if(!dates.Valid){
            getTimeUpdate(dates.Submitted||false,dates.Created||false,dates.Updated||false,valid||false);
        }
    }catch(err){
        console.error("Failed at times", err)
    }
}

function addIngressData(desc){
    try{
        addData("Ingress.count",desc['Count']||0);
    }catch(err){
        console.error("Failed at Ingress",err)
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
            const item = relatedurls[i];
            const url = item.relatedIdentifier;
            if(item.resourceTypeGeneral=="Image"){
                updateImage(url);
                
            }else if(item.resourceTypeGeneral=="Dataset"){
                updateDownloadButton(attributes,desc,url);               
            }
        }
    }catch(err){
        console.error("Failed in addFiles",err)
    }
}

function addFileInfo(attributes,desc){
    try{
        showElement($('#File'),true);
        appendData("FileInfo",makePairElements("ExportType",desc['ExportType']));
        appendData("FileInfo",makePairElements("Size",convertBytes(attributes.sizes)));
        appendData("FileInfo",makePairElements("Format",attributes.formats));
        appendData("FileInfo",makePairElements("Language",attributes.titles[0].lang)); //Titles.lang
        appendData("FileInfo",makePairElements("Title",attributes.titles[0].title)); //Titles.lang
        appendData("FileInfo",makePairElements("State",attributes.state));
        appendData("FileInfo",makePairElements("CreatorsSourceType",attributes.creators[0].nameType));
        appendData("FileInfo",makePairElements("CreatorsSourceName",attributes.creators[0].name));
        appendData("FileInfo",makePairElements("Publisher",attributes.publisher));
        appendData("FileInfo",makePairElements("PublicationYear",attributes.publicationYear));

        // THOSE BELOW, What are they
        //appendData("FileInfo",makePairElements("version",attributes.version));
        //appendData("FileInfo",makePairElements("metadataVersion",attributes.metadataVersion));
        //appendData("FileInfo",makePairElements("schemaVersion",attributes.schemaVersion));
    }catch(err){
        console.error("File info failed",err)
    }
}

function addGeoLocation(attributes){
    try{
        const geoLocations = attributes.geoLocations[0];
        const dd = document.createElement('dd');
        makeLocationSpan("eastBoundLongitude", geoLocations.geoLocationBox.eastBoundLongitude,dd);
        makeLocationSpan("northBoundLatitude", geoLocations.geoLocationBox.northBoundLatitude,dd);
        makeLocationSpan("southBoundLatitude", geoLocations.geoLocationBox.southBoundLatitude,dd);
        makeLocationSpan("westBoundLongitude", geoLocations.geoLocationBox.westBoundLongitude,dd);
      
        if( geoLocations.geoLocationPlace !== null){
            makeLocationSpan("geoLocationPlace", geoLocations.geoLocationPlace,dd);
        }
        if( geoLocations.geoLocationPoint !== null){
            makeLocationSpan("pointLongitude", geoLocations.geoLocationPoint.pointLongitude,dd);
            makeLocationSpan("pointLatitude", geoLocations.geoLocationPoint.pointLatitude,dd);
        }

        makeTags("geoLocations","geoLocations",dd);
    }catch(err){
        console.error("geolocations failed",err)
    }
}

function addStats(attributes){
    try{      
      console.info("Swap showStats to true to re-add statistics. They seem not to be tracked.")
      const showStats = false;
      if(showStats){      
        showElement($('#Stats'),true); 
        appendData("Statistics",makePairElements("viewCount",attributes.viewCount));
        appendData("Statistics",makePairElements("downloadCount",attributes.downloadCount));
        appendData("Statistics",makePairElements("referenceCount",attributes.referenceCount));
        appendData("Statistics",makePairElements("citationCount",attributes.citationCount));
        appendData("Statistics",makePairElements("partCount",attributes.partCount));
        appendData("Statistics",makePairElements("partOfCount",attributes.partOfCount));
        appendData("Statistics",makePairElements("versionCount",attributes.versionCount));
        appendData("Statistics",makePairElements("versionOfCount",attributes.versionOfCount));
        }else{
            showElement($('#Stats'),false); 
        }

    }catch(err){
        console.error("Satistics failed", err)
    }

}

function addTypes(attributes){
    try{
      showElement($('#Types'),true);
      for(let el in attributes.types){
        appendData("Types.appender",makePairElements(el,attributes.types[el]));
      }
    }catch(err){
        console.error("Types failed",err)
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

function addGeneralData(attributes){
    try{
        // DOI URL
        // URL is always the non-test version as it's from api.
        let shortcutLink = document.createElement('li');
        shortcutLink.textContent=attributes.doi;
        appendData('Attributes.doi',shortcutLink);

        updateBreadCrumb(true);
        let headerdoi = "DOI: "+ attributes.doi;
        addData('header-doi',headerdoi);
    }catch(err){
        console.error("General data failed",err)
    }
}

function addMiscData(attributes){
    // removed html for this one as data is m ostly duplicate of other things
    try{
        //showElement($('#General'),true);
        appendData("GeneralData",makePairElements("Url",attributes.url));
        appendData("GeneralData",makePairElements("identifiers",attributes.identifiers));
        appendData("GeneralData",makePairElements("id",data.data.id));
        appendData("GeneralData",makePairElements("type",data.data.type));
        //addData("Attributes.prefix",attributes.prefix);
        //addData("Attributes.suffix",attributes.suffix);
    }catch(err){
        console.error("addMiscData data failed",err)
    }
}

function addArtskartUrl(desc){
    try{
        let url = desc['ArtskartUrl'][0];
        let artskartLink = $("#artskartLink");
        // While we wait for API to update their url...        
        url = url.replace("https://test.artsdatabanken.no/artskart2boci/","https://artskart.test.artsdatabanken.no/");
        url = url.replace("https://artsdatabanken.no/artskart2boci/","https://artskart.artsdatabanken.no/");
        artskartLink.href = url;
    }catch(err){
        console.error("Failed at artskarturl;", err)
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
            for(let title in descriptioncontent){
                if(descriptioncontent[title] != ""){
                    makeDescriptionItems(descriptioncontent[title],title);
                }
            }
        }
    }catch(err){
        console.error("failed at descriptions")
    }
}


// DOM handlers: Add, Append, Show/Hide, change look

function addData(id,content){
    if(content!= undefined && id!= undefined){
        try{
            let object = $("#"+id) || id;
            object.innerHTML = content;
        }
        catch(err){
            console.error("failed for id: ",id,"and content:" ,content)
        }
    }else{
        // To avoid entire page breaking down if one error occurs
        try{
            $("#"+id).innerHTML = "Ikke oppgitt";}
        catch(err){
            console.error("failed for id: ",id,"and content:" ,content)
        }
    }
}

function appendData(id,content){
    if(content!= undefined && id!= undefined ){
        try{
            $("#"+id).appendChild(content);
        } catch(err){
            console.error("failed for id: ",id,"and content:" ,content);
        }
    }else{
        // To avoid entire page breaking down if one error occurs
        console.error("no such content ", id,content);
    }
}

function showElement(element,activate){
    // Use this to hide/and show elements that are not language based.
    // To toggle lanuage, use showLang() instead
    try{
        if(element === null || element === undefined){
            console.info("Trying to handle empty element")
            return;
        }

        if(activate){
            element.classList.remove('hidden');
            element.ariaHidden = "false";
        }else{
            element.ariaHidden = "true";
            element.classList.add('hidden');
        }
    }catch(err){
        console.error("showElement failed for element:", element)
    }
}

function updateStyle(selector,styleselector,style){
    try{
        selector.style[styleselector] = style;
    }catch(err){
        console.error("error in changing style for", selector, styleselector,style, err);
    }
}

function changeClass(selector,className){
    try{
        selector.className = className;
    }catch(err){
        console.error("error in adding class for", selector, className);
    }
}

// PAGE SETUP

function resetPage(){
    try{
        // Empty appenders:
        $("#img.appender").innerHTML = "";
        $("#zip.appender").innerHTML = "";
        $("#artskartLink").href = "";
        $("#doi.appender").innerHTML = "";
        $("#Descriptions.other").innerHTML = "";

        const child = $("#noReset");

        $("#FileInfo").innerHTML = "";
        $("#FileInfo").appendChild(child);
        $("#Statistics").innerHTML = "";
        $("#Types.appender").innerHTML = "";

        /* Hide before content load */
        showElement($("#tags_other"),false);

        /* text formatting */
        document.querySelectorAll('.contributor-plural').forEach(x => showElement(x,false));

    }catch(err){
        console.error("failed at emptying appenders",err)
    }
}

function pageSetup(activate){
    try{
        showElement($("#nodata"),!activate);
        for (let el of $(".section")){
            showElement(el,activate);
        }
        for (let el of $(".inlinesection")){
            showElement(el,activate);
        }

        for (let el of $(".ingress")){
            showElement(el,activate);
        }
        showElement($("#timedetails"),activate);
    }catch(err){
        console.error("failed at pageSetup",err)
    }
}

// Start presenting the DOI-page
function handleDoiData(data,isRerun){
    // Prep the page
    resetPage();
    const attributes = data.data.attributes;
    pageSetup(true);
    showProgressBar(attributes,isRerun);   

    const desc = unWrapDescriptions(attributes.descriptions,"descriptionType","description");
    // Main Content
    addTimeDetails(attributes);
    addIngressData(desc);
    addGeoLocation(attributes);
    addFiles(attributes,desc); // Download dataset is a part of addFiles, and lives in the sidebar.
    addDoi(desc);
    addDescriptions(desc);
    addImageSources(desc);
    addGeneralData(attributes);
    addFileInfo(attributes,desc);
    addCitation(attributes);
    addArtskartUrl(desc);
    addStats(attributes);
    addTypes(attributes);
}

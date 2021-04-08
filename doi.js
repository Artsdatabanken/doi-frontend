/* Fetches data from api, presents by adding it to the html either by appending in blank divs, 
or replacing the existing text. */

// Startup
getDoiData();

// Listeners for when to re-run 
window.onhashchange = function() { 
    console.info("Updated doi-parameter, re-fetch")
    getDoiData();
}

// Data Obtainers
function getDoiData(){   
    // Obtaining the relevant doi to look up.
    let url = 'https://doiapi.'+detectTest()+'artsdatabanken.no/api/Doi/getDoiByGuid/'+getGuid();

    fetch(url)
    .then((response) => {
        return response.json()
    })
    .then((data) => {        
        console.info("Starting data fetch")
        // Prep the page
        emptyAppenders();
        
        let attributes = data.data.attributes;  
        

        hideAndShow("show");
        isValid(attributes);
        let desc = unWrap(attributes.descriptions,"descriptionType","description");          

        // Main Content
        addTimeDetails(attributes);
        addIngressData(attributes);
        addGeoLocation(attributes);
        addFiles(attributes);
        addDoi(desc);
        addArtskartUrl(desc);
        addAreas(desc);        
        addDescriptions(desc);

        // Sidebar
        addGeneralData(attributes);
        addFileInfo(attributes,desc);
        addCitation(attributes);
        // addStats(attributes);
        // addTypes(attributes); 
        console.info("All data loaded")
        // End of all :)
        
    })
    .catch((err) => {
        hideAndShow("none")
    })

}

// Data formatters

function isValid(attributes){
    console.log("?")
    try{
        let dates = attributes.dates;
        for(let i in dates){
            if(dates[i].dateType == "Valid"){
                document.getElementById("notyetvalid").style.display = "none";
            }
        }
    }catch{
        console.error("Failed at isValid")
    }
}

function addTimeDetails(attributes){
    try{
        let dates = attributes.dates;
        for(let i in dates){
            let date = new Date(dates[i].date).toLocaleDateString("nb-no", {hour: '2-digit', minute: '2-digit'});
            addData("Time."+dates[i].dateType,date);
            addData("Time."+dates[i].dateType+"2",date);
        }
    }catch{
        console.error("Failed at times")
    }
}

function addIngressData(attributes){
    try{
        addData("Titles.type",attributes.titles[0].title);   
        addData("Creators.sourcename",attributes.creators[0].name);
        addData("publisher",attributes.publisher);
        addData("Time.year",attributes.publicationYear);
    }catch{
        console.error("Failed at Ingress")
    }
}


function addFiles(attributes){
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
                appendData('img.appender',image);
            }else if(item.resourceTypeGeneral=="Dataset"){
                let zipurl = item.relatedIdentifier;
                let zip = document.createElement('div');
                let material = "<span class='material-icons'>download</span>";
                zip.innerHTML = "<a href="+zipurl+" class='biglink downloadlink'>"+material+"<span>Last ned datasett </span><span>"+convertBytes(attributes.sizes)+"</span></a>";
                appendData('zip.appender',zip);
            }
        }
    }catch{
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
    }catch{
        console.error("Failed in doi")
    }
}

function addArtskartUrl(desc){
    try{
        let artskartelement = desc['ArtskartUrl'][0];
        let a = document.createElement('div');
        let launch = "<span class='material-icons'>launch</span>";
        a.innerHTML = "<a href="+artskartelement+" class='biglink artskartlink'>"+launch+"<span>Se oppdatert utvalg i Arskart </span></a>";       
        appendData('a.appender',a);
    }catch{
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
    }catch{
        console.log("failed at areas")
    }
}



function addDescriptions(desc){
    try{
        addData("Descriptions.count",desc['Count']);
        addData("Descriptions.Description",desc['Description']);
    }catch{
        console.error("failed at descriptions")
    }
}

function addGeneralData(attributes){
    try{
        // DOI URL 
        // URL is always the non-test version as it's from api.
        let doilink = "<a href="+attributes.url+" >"+attributes.doi+"</a>";        
        addData('Attributes.doi',doilink);
        addData("Guid",getGuid());        
        addData("Attributes.state",attributes.state);
        //addData("Attributes.url",attributes.url);
        //addData("data.Id",data.data.id);
        //addData("data.Type",data.data.type);
        //addData("Attributes.prefix",attributes.prefix);
        //addData("Attributes.suffix",attributes.suffix);
        //addData("Attributes.identifiers",attributes.identifiers);
    }catch{
        console.error("General data failed")
    }
}

function addFileInfo(attributes,desc){
    try{
        addData("Descriptions.ExportType",desc['ExportType']);
        addData("Size",convertBytes(attributes.sizes));
        addData("Attributes.formats",attributes.formats);
        let apiurl = 'https://doi.'+detectTest()+'artsdatabanken.no/api/Doi/getDoiByGuid/'+getGuid();
        let apilink = "<a href="+apiurl+" >"+attributes.source+"</a>";        
        addData('Api.link',apilink);
        addData("Titles.lang",attributes.titles[0].lang);
        //addData("Creators.sourcetype",attributes.creators[0].nameType);  
        //addData("Attributes.version",attributes.version);
        //addData("Attributes.metadataVersion",attributes.metadataVersion);
        //addData("Attributes.schemaVersion",attributes.schemaVersion);
    }catch{
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
    }catch{
        console.error("Types failed")
    }
   
}

function addCitation(attributes){

    try{
        let accesseddate = "yyyy-mm-dd";
        let dates = attributes.dates;
        for(let i in dates){
            if(dates[i].dateType == "Updated"){
                accesseddate = dates[i].date.split("T")[0];
            }
            
        }

        attributes.dates
        let year = "("+attributes.publicationYear+")";
        
        let citation = attributes.publisher+" "+year+". "
        +attributes.creators[0].name+". " 
        + attributes.types.resourceTypeGeneral
        +" https://doi.org/"+attributes.doi
        +" accessed via artsdatabanken.no"
        +" on "+accesseddate+".";

        addData("citation",citation);
    }catch{
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
    }catch{
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
    }catch{
        console.error("geolocations failed")
    }
}


// Help Functions


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
    // Looping and bundling by type to easier use relevant data only
    if(wrapped == undefined || criteria == undefined || content == undefined) {
        console.error("error in unwrap",criteria,content)
        return null;
    }
    let unwrapped = {};
    for(let i in wrapped){
        let item = wrapped[i];                
        let iwrap = item[criteria];
        let exists = unwrapped[iwrap] || null;    
        let newitem = item;
        if(content !== false){
            newitem = item[content];
        }           

        if(exists){
            unwrapped[item[criteria]].push(newitem);                    
        }else{
            unwrapped[item[criteria]] = [newitem];
        }                
    }    
    return unwrapped;   
}

function addData(id,content){
    if(content!= undefined && id!= undefined){
        try{
            document.getElementById(id).innerHTML = content;}
        catch{
            console.error("failed for id: ",id,"and content:" ,content)
        }
    }else{
        // To avoid entire page breaking down if one error occurs
        try{
            document.getElementById(id).innerHTML = "Ikke oppgitt";}
        catch{
            console.error("failed for id: ",id,"and content:" ,content)
        }
    }            
}

function appendData(id,content){
    
    if(content!= undefined && id!= undefined ){
        try{
            document.getElementById(id).appendChild(content);
        } catch{
            console.error("failed for id: ",id,"and content:" ,content);
        }
        
    }else{
        // To avoid entire page breaking down if one error occurs
        console.error("no such content ", id,content);
    }            
}

function hideAndShowActions(param,otherparam){
    document.getElementById("ingress").style.display = otherparam;
    document.getElementById("timedetails").style.display = param;

    for (let el of document.getElementsByClassName("section")){
        el.style.display=param;
    }

    for (let el of document.getElementsByClassName("ingress")){
        el.style.display=param;
    }

}

function emptyAppenders(){
    // Empty appenders:
    document.getElementById("img.appender").innerHTML = "";
    document.getElementById("zip.appender").innerHTML = "";
    document.getElementById("a.appender").innerHTML = "";
    document.getElementById("doi.appender").innerHTML = "";
    document.getElementById("area.appender").innerHTML = "";
    document.getElementById("Api.link").innerHTML = "";
    
}

function hideAndShow(which){
    if(which == "show"){
        hideAndShowActions("inline-block","none");
    }else{
        hideAndShowActions("none","inline-block");

    }
}

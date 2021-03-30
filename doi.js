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

function getDoiData(){        

    // Obtaining the relevant doi to look up.
    let url = 'https://doi.'+detectTest()+'artsdatabanken.no/api/Doi/getDoiByGuid/'+getGuid();

    fetch(url)
    .then((response) => {
        return response.json()
    })
    .then((data) => {

        function addData(id,content){
            if(content!= undefined && id!= undefined){
                document.getElementById(id).innerHTML = content;
            }else{
                // To avoid entire page breaking down if one error occurs
                console.error("no such content ", id,content);
            }            
        }

        function appendData(id,content){
            if(content!= undefined && id!= undefined ){
                document.getElementById(id).appendChild(content);
            }else{
                // To avoid entire page breaking down if one error occurs
                console.error("no such content ", id,content);
            }            
        }
        
        function unWrap(wrapped,criteria,content){
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


        // Work with JSON data here
        addData("data.Id",data.data.id);
        addData("data.Type",data.data.type);

        let attributes = data.data.attributes;

        // DOI URL 
        addData("Attributes.doi",attributes.doi);
        addData("Guid",getGuid());
        addData("Attributes.prefix",attributes.prefix);
        addData("Attributes.suffix",attributes.suffix);
        addData("Attributes.identifiers",attributes.identifiers);
        addData("Creators.sourcename",attributes.creators[0].name);
        addData("Creators.sourcetype",attributes.creators[0].nameType);

        // Data Creators
        addData("Titles.type",attributes.titles[0].title);
        addData("Titles.lang",attributes.titles[0].lang);
        addData("Attributes.formats",attributes.formats);
        addData("publisher",attributes.publisher);

        // TIME
        addData("Time.year",attributes.publicationYear);
        let dates = attributes.dates;
        for(let i in dates){
            addData("Time."+dates[i].dateType,dates[i].date);
        }
        
        // GEOLOCATION
        let geoLocations = attributes.geoLocations[0];
        addData("geoLocationBox.eastBoundLongitude",geoLocations.geoLocationBox.eastBoundLongitude);
        addData("geoLocationBox.northBoundLatitude",geoLocations.geoLocationBox.northBoundLatitude);
        addData("geoLocationBox.southBoundLatitude",geoLocations.geoLocationBox.southBoundLatitude);
        addData("geoLocationBox.westBoundLongitude",geoLocations.geoLocationBox.westBoundLongitude);

        // ATTRIBUTES
        // Data explaining the dataset

        // Misc
        addData("Attributes.isActive",attributes.isActive);
        addData("Attributes.state",attributes.state);
        addData("Attributes.viewCount",attributes.viewCount);
        addData("Attributes.downloadCount",attributes.downloadCount);
        addData("Attributes.referenceCount",attributes.referenceCount);
        addData("Attributes.citationCount",attributes.citationCount);
        addData("Attributes.partCount",attributes.partCount);
        addData("Attributes.partOfCount",attributes.partOfCount);
        addData("Attributes.versionCount",attributes.versionCount);
        addData("Attributes.versionOfCount",attributes.versionOfCount);
        
        // Related Identifiers
        // Also contains doi-sources which are duplicated in descriptions.doi
        // They are placed here due to the doi-system tracking the use through this parameter
        // But we instead fetch them from descriptions, as they there contain more data.

        let relatedIdentifiers = attributes.relatedIdentifiers;
        let unwrappedRelatedIdentifiers = unWrap(relatedIdentifiers,"relatedIdentifierType",false);

        // A bit unnecessary grouping, but ensures that anything relevant is found, 
        // and anything doi is excluded
        let relatedurls = unwrappedRelatedIdentifiers["URL"];
        let size = convertBytes(attributes.sizes);

        for (let i in relatedurls){
            let item = relatedurls[i];
            if(item.resourceTypeGeneral=="Image"){
                const image = document.createElement('img');
                image.src  = item.relatedIdentifier;
                appendData('img.appender',image);
            }else if(item.resourceTypeGeneral=="Dataset"){
                let zipurl = item.relatedIdentifier;
                let zip = document.createElement('div');
                zip.className = "listitem";
                zip.innerHTML = "<a href="+zipurl+" >"+"<span>Last ned datasett </span><span>"+size+"</span></a>";
                appendData('zip.appender',zip);
            }
        }

        // Descriptions
        // Contains an abundance of descriptive data. 
        // Looping and bundling by type to easier use relevant data only

        let desc = unWrap(attributes.descriptions,"descriptionType","description");     

        // Descriptions.doi
        // Contains all source datasets. Also those without a doi, but of doi-type data.
        // If a doi is missing, it will instead contain an id.

        let doi = desc['DOI'];
       
        for (let i in doi){
            let items = doi[i].split("|");
            let div = document.createElement('div');
            div.className = "listitem";

            let link = items[0];
            let linkline = ""; // There is an id here, but what type? what it do?
            
            if(link.includes("https")){
                let doitext = link.replace("https://doi.org/","");
                linkline = "<a href="+link+"/>"+doitext+"</a>";                
            }           

            let numberline = "<span> ("+ items[1]+" element)</span></br>";
            let nameline = "<span>"+ items[2]+"</span>";            
            div.innerHTML = nameline+numberline+linkline;
            appendData('doi.appender',div);
        }

        let artskartelement = desc['ArtskartUrl'][0];
        let a = document.createElement('div');
        a.className = "listitem";
        a.innerHTML = "<a href="+artskartelement+" >"+"Artskartlenke"+"</a>";
        appendData('a.appender',a);
      

        // End of all :)
        
    })
    .catch((err) => {
        // Do something for an error here
    })
}

getDoiData();


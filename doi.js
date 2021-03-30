console.log("obtain data")
getDoiData = () => {        

    // Obtaining the relevant doi to look up.
    let doi = window.location.hash;
    doi = doi.replace("#","");
    let url = 'https://doi.test.artsdatabanken.no/api/Doi/getDoiByGuid/'+doi;


    fetch(url)
    .then((response) => {
        return response.json()
    })
    .then((data) => {

        function addData(id,content){
            if(content!= undefined && content != null){
                document.getElementById(id).innerHTML = content;
            }else{
                // To avoid entire page breaking down if one error occurs
                console.error("no such content ", id,content);
            }            
        }

        function appendData(id,content){
            if(content!= undefined && content != null){
                document.getElementById(id).appendChild(content);
            }else{
                // To avoid entire page breaking down if one error occurs
                console.error("no such content ", id,content);
            }            
        }

        // Work with JSON data here
        addData("data.Id",data.data.id);
        addData("data.Type",data.data.type);

        let attributes = data.data.attributes;

        // DOI URL 
        addData("Attributes.doi",attributes.doi);
        addData("Attributes.prefix",attributes.prefix);
        addData("Attributes.suffix",attributes.suffix);
        addData("Attributes.identifiers",attributes.identifiers);
        addData("Creators.sourcename",attributes.creators[0].name);
        addData("Creators.sourcetype",attributes.creators[0].nameType);

        // Data Creators
        addData("Titles.type",attributes.titles[0].title);
        addData("Titles.lang",attributes.titles[0].lang);
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
        for (let i in relatedIdentifiers){
            let item = relatedIdentifiers[i];
            //console.log(item)
            if(item.resourceTypeGeneral=="Image"){
                //console.log("add image time")
                const image = document.createElement('img');
                image.src  = item.relatedIdentifier;
                appendData('img.appender',image);
            }
        }

        // Descriptions
        // Contains an abundance of descriptive data. 
        // Looping and bundling by type to easier use relevant data only

        let desc = {};
        for(let i in attributes.descriptions){
            let item = attributes.descriptions[i];
            let exists = desc[item.descriptionType] || null;

            if(exists){
                desc[item.descriptionType].push(item.description);
                
            }else{
                desc[item.descriptionType] = [item.description];
            }
            
        }        

        

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


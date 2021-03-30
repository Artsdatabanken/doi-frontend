console.log("obtain data")
getDoiData = () => {        
    let url = 'https://doi.test.artsdatabanken.no/api/Doi/getDoiByGuid/f6490faa-570c-fd17-070e-f635804b0159';
    fetch(url)
    .then((response) => {
        return response.json()
    })
    .then((data) => {
        // Work with JSON data here
        console.log("sucessfully fetched data")
        document.getElementById("data.Id").innerHTML = data.data.id;
        document.getElementById("data.Type").innerHTML = data.data.type;

        let attributes = data.data.attributes;

        document.getElementById("Attributes.doi").innerHTML = attributes.doi;
        document.getElementById("Attributes.prefix").innerHTML = attributes.prefix;
        document.getElementById("Attributes.suffix").innerHTML = attributes.suffix;
        document.getElementById("Attributes.identifiers").innerHTML = attributes.identifiers;


        document.getElementById("Creators.sourcename").innerHTML = attributes.creators[0].name;
        document.getElementById("Creators.sourcetype").innerHTML = attributes.creators[0].nameType;

        // Data Creators
        document.getElementById("Titles.type").innerHTML = attributes.titles[0].title;
        document.getElementById("Titles.lang").innerHTML = attributes.titles[0].lang;
        document.getElementById("publisher").innerHTML = attributes.publisher;

        // TIME
        document.getElementById("Time.year").innerHTML = attributes.publicationYear;
        let dates = attributes.dates;
        for(let i in dates){
            document.getElementById("Time."+dates[i].dateType).innerHTML = dates[i].date;
        }
        
        // GEOLOCATION
        let geoLocations = attributes.geoLocations[0];
        document.getElementById("GeoLocations.pointLongitude").innerHTML = geoLocations.geoLocationPoint.pointLongitude;
        document.getElementById("GeoLocations.pointLatitude").innerHTML = geoLocations.geoLocationPoint.pointLatitude;

        document.getElementById("geoLocationBox.eastBoundLongitude").innerHTML = geoLocations.geoLocationBox.eastBoundLongitude;
        document.getElementById("geoLocationBox.northBoundLatitude").innerHTML = geoLocations.geoLocationBox.northBoundLatitude;
        document.getElementById("geoLocationBox.southBoundLatitude").innerHTML = geoLocations.geoLocationBox.southBoundLatitude;
        document.getElementById("geoLocationBox.westBoundLongitude").innerHTML = geoLocations.geoLocationBox.westBoundLongitude;

        // MISC DATA
        document.getElementById("Attributes.isActive").innerHTML = attributes.isActive;
        document.getElementById("Attributes.state").innerHTML = attributes.state;
        document.getElementById("Attributes.viewCount").innerHTML = attributes.viewCount;
        document.getElementById("Attributes.downloadCount").innerHTML = attributes.downloadCount;
        document.getElementById("Attributes.referenceCount").innerHTML = attributes.referenceCount;
        document.getElementById("Attributes.citationCount").innerHTML = attributes.citationCount;
        document.getElementById("Attributes.partCount").innerHTML = attributes.partCount;
        document.getElementById("Attributes.partOfCount").innerHTML = attributes.partOfCount;
        document.getElementById("Attributes.versionCount").innerHTML = attributes.versionCount;
        document.getElementById("Attributes.versionOfCount").innerHTML = attributes.versionOfCount;
        document.getElementById("Attributes.created").innerHTML = attributes.created;
        document.getElementById("Attributes.registered").innerHTML = attributes.registered;
        document.getElementById("Attributes.published").innerHTML = attributes.published;
        document.getElementById("Attributes.updated").innerHTML = attributes.updated;

        let relatedIdentifiers = attributes.relatedIdentifiers;
        for (let i in relatedIdentifiers){
            let item = relatedIdentifiers[i];
            //console.log(item)
            if(item.resourceTypeGeneral=="Image"){
                //console.log("add image time")
                const image = document.createElement('img');
                image.src  = item.relatedIdentifier;
                document.getElementById('img.appender').appendChild(image);
            }
        }

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
        
        console.log(desc);

        let doi = desc['DOI'];
       
        for (let i in doi){
            let items = doi[i].split("|");
            let div = document.createElement('div');
            div.className = "listitem";

            let link = items[0];
            let linkline = "";// There is an id here, but what type? what it do?
            
            if(link.includes("https")){
                let doitext = link.replace("https://doi.org/","");
                linkline = "<a href="+link+"/>"+doitext+"</a>";                
            }
            

            let numberline = "<span> ("+ items[1]+" element)</span></br>";
            let nameline = "<span>"+ items[2]+"</span>";            
            div.innerHTML = nameline+numberline+linkline;
            document.getElementById('doi.appender').appendChild(div);
        }

        let artskartelement = desc['ArtskartUrl'][0];
        let a = document.createElement('div');
        a.className = "listitem";
        a.innerHTML = "<a href="+artskartelement+" >"+"Artskartlenke"+"</a>";
        document.getElementById('a.appender').appendChild(a);
      
        
    })
    .catch((err) => {
        // Do something for an error here
    })
}

getDoiData();


// Lets pretend this is a part of the main site
function getHeaderMenu(){       
    try{
        console.log("making header menu")
        // Obtaining the relevant doi to look up.
        let url = "https://www.artsdatabanken.no/api/Content/224883";
        fetch(url)
        .then((response) => {
            return response.json()
        })
        .then((data) => {     
            try{
                let apimenus = data.Records;            
                for (let i in apimenus){
                    let item = apimenus[i];
                    let id = item.Values.toString().replace(" ","");

                    // Using createelement to enable attachment of eventlistener
                    let menubutton = document.createElement('button');
                    menubutton.className = "menuitems";

                    // Generate the dropdowncontent 
                    let newdropdown ="<ul class='dropdown' id='"+id+"' style='display:none'>";                
                    let subitems = item.References;
                    
                    for(let j in subitems){
                        subitem = subitems[j];
                        
                        let infotext = "";
                        let link = null;
                        for(let k in subitem.Records){
                            let subsub = subitem.Records[k];
                           if( subsub.Label == "MenuInfoText"){
                            infotext = subsub.Values.toString();
                            infotext = "<span>"+infotext+"</span>";
                           }else{
                            link = subsub.Values.toString();
                           }
                           
                        }
                        let name = subitem.Heading;
                        let external = "";
                        
                        let url = "https://artsdatabanken.no"+subitem.Url;
                        if(!subitem.Heading){
                            name= subitem.Header.Content;                           
                            if(link[0] == "/"){
                                link = "https:" + link;
                            }
                            external = " <b class='material-icons'>open_in_new</b>";
                            url = link;
                        }

                        
                        
                        newdropdown += "<li><a href='"+url+"'>"+name+external+infotext+"</a></li>";

                    }                
                    newdropdown +="</ul>";
                    menubutton.innerHTML = item.Values+newdropdown; // attach it

                    // Toggle the relevant dropdownmenu
                    menubutton.addEventListener('click',function(e){
                        let target = e.target.querySelector('.dropdown');
                        if(target.style.display == "none"){
                            target.style.display = "block";
                        }else{
                            target.style.display = "none";
                        }
                    });

                    // Add to page
                    appendData('headermenu',menubutton);
                }
            }catch(err){
                console.error("failed at headermenu")
            }        
        })
        .catch((err) => {
            console.error("failed obtaining headermenu")
        })
    }catch{
        console.log("error in headermenu")
    }
}
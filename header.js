window.addEventListener('click', function(e) {
    // Closes dropdown menu when clicking outside it. 
    if (document.getElementById('headermenu')){
        if (!document.getElementById('headermenu').contains(e.target)) {
            document.getElementById("Omoss").style.display = "none";
            document.getElementById("Meny").style.display = "none";
            document.getElementById("English").style.display = "none";
        }
    }
})

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
                    let buttonname = item.Values;
                    let dropicon = " <span class='material-icons'>arrow_drop_down</span>";
                    if(buttonname == "English"){
                        // TODO : WHEN DECIDED HOW WE WANT IT: MAKE THE ENGLISH BUTTON
                        //menubutton.className += " englishbutton";
                        //menubutton.innerHTML = "<img src='https://www.artsdatabanken.no/Content/Images/english.svg'></img>"
                    }
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
                    
                    // ADD ALL BUTTONCNTENT
                    menubutton.innerHTML = buttonname+dropicon+ newdropdown; // attach it

                    // Toggle the relevant dropdownmenu
                    menubutton.addEventListener('click',function(e){
                        let target = e.target;
                        if(target.className =="material-icons"){
                            target = target.parentElement;
                        }
                        target = target.querySelector('.dropdown');
                        let siblings = $(".dropdown");
                        let show = false;
                        if(target && target.style.display == "none"){
                            show = true;
                        }
                        for(let i in siblings){
                            // hide all the siblings before dealing with the current
                            let sibling = siblings[i];
                            if(sibling.style){
                                sibling.style.display = "none";
                            }                            
                        }
                        if(show){
                            target.style.display = "block";
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
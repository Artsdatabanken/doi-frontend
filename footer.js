

// Lets pretend this is a part of the main site
function getFooter(){       
    try{
        console.log("making header menu")
        // Obtaining the relevant doi to look up.
        let url = "https://www.artsdatabanken.no/api/Content/224885";
        fetch(url)
        .then((response) => {
            return response.json()
        })
        .then((data) => {     
            try{
               let footer = document.getElementById('footer');
               footer.innerHTML = data.Body;
                  
                
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
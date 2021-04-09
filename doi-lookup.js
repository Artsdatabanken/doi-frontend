/* If theres no doi data */


function addListData(){
    try{


        let url = 'https://doiapi.'+detectTest()+'artsdatabanken.no/api/Doi/getAllIds';
        addData("find.doi","Henter inn data ...");   
        fetch(url)
        .then((response) => {
            return response.json()
        })
        .then((data) => {        
           try{
            let items = "";
            for (let key in data){
                 let doiurl = '#'+data[key];
                items += "<a href="+doiurl+" class='doilink'>"+key+"<span> "+data[key]+"</span></a>";
             }
             addData("find.doi",items);
           }catch{
               console.error("Failed at presenting data from doi")
           }

          
            
        })
        .catch((err) => {
            addData("find.doi","Fikk ikke til å slå opp data");   
        })
    


        
    }catch{
        console.error("Failed at Ingress")
    }
}


// Data Obtainers
function showFrontPage(){
    console.log("SHOW FRONTPAGE")
    addListData()
    
}

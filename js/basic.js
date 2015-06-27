var offsetElementTop;
var checkBorderTop;

var offsetElementBottom;
var checkBorderBottom;



$( document ).ready(function() {
    FastClick.attach(document.body);
     
    screenHeight = $(window).height();
    screenWidth = $(window).width();

    createSkala();


    offsetElementTop = $(".top").offset()
    checkBorderTop = offsetElementTop.top + $(".top").outerHeight();

    offsetElementBottom = $(".bottom").offset()
    checkBorderBottom = offsetElementBottom.top
    console.log(checkBorderBottom);

    $(".top").click(function(){
        setPosition(12, 0);
    })

    $(".bottom").click(function(){
        setPosition(12, 105);
    })

});

$(window).resize(function(){
    screenHeight = $(window).height();
    screenWidth = $(window).width();	
});


function createSkala(){
    for (i = 2; i <= 100; i+=2) { 
        newIndex = i;
        
        $(".skalaUl").append("<li class='skalaLi' id='li" + newIndex + "'></li>" );
    }
    
    setScaleOpacity(50)
}

function setScaleOpacity(border){

    $(".skalaLi").each(function(index){


        var id = $(this).attr("id").substring(2);
        
        var newOpacity = 0;
        

        if (border > 85) {
            border = 85
        }
        
        if (border < 16) {
            border = 16
        }

        var borderHigh = border + 1;
        
        if ( id <= border){
            newOpacity = map(id, 15, border, 0, 1)
        }else{
            newOpacity = map(id, borderHigh, 87, 1, 0)
        }
        
        $(this).css({"opacity":newOpacity})
    })
}

function setIconHeight(percentage, pixelPosition){
    var iconHeight = 200; //die default iconheight
    
    percentage = 100-percentage;


    //checkif snap und damit grenzen setzen.

    var newHeight = map(percentage, 0, 100, 20, iconHeight);
    
    switch (checkIfSnap(pixelPosition)){ //checkifSnap auch parentID übergeben
        case 1:
            $(".iconLayer").addClass("animatedHeight")
            $(".iconLayer").css({"height" : iconHeight + "px"})
            setTimeout(function(){$(".iconLayer").removeClass("animatedHeight")}, 150);
            break;
        case -1:
            $(".iconLayer").addClass("animatedHeight")
            $(".iconLayer").css({"height" : 0 + "px"})
            setTimeout(function(){$(".iconLayer").removeClass("animatedHeight")}, 150);
            break;
        case 0:
            $(".iconLayer").css({"height" : newHeight + "px"})
            break;
    }
    

}


function checkIfSnap(mouseY){
    if(mouseY < checkBorderTop ){
	    return 1
    }else if (mouseY > checkBorderBottom){
	    return -1
    }else {
	    return 0
    }
}



function updateScale(mouseY){
    // berechnen auf welchem prozentpunkt die maus steht
    // alle darunter ausfüllen
    
    var newMousePosition = mouseY - offsetElementTop.top;
    var limit = checkBorderBottom + $(".bottom").height() - offsetElementTop.top;
    
    var percentage = Math.round((newMousePosition/limit)*100);
    
    for (i = 0; i < percentage; i++){
	    $("#li" + i).removeClass("selected");
    }
    
    for (i = percentage; i <= 100; i++){
	    $("#li" + i).addClass("selected");
    }
    
    setScaleOpacity(percentage);
    setIconHeight(percentage, mouseY);
    
}





function getPosition(parentid){

    return 50
}



function setPosition(parentId, percentagePosition){
    //newPosition sollte ein Wert in Prozent sein



    //Umrechnen des Prozentwertes in ein Pixelwert
    var topBorder = offsetElementTop.top;
    var bottomBorder = offsetElementBottom.top + $(".bottom").outerHeight();
    var wholeDistance = bottomBorder - topBorder;
    
    var pixelPosition = wholeDistance * (percentagePosition/100);


    switch (checkIfSnap(pixelPosition)){ //checkifSnap auch parentID übergeben
        case 1:
            $(".bottom").removeClass("selected")
            $(".top").addClass("selected")

            $(".textOverlay").animate({top:offsetElementTop.top-75}, {duration: 325, step: function( now, fx ){ updateScale(now+37.5) }});
            break;
        case -1:
            $(".bottom").addClass("selected")
            $(".top").removeClass("selected")
            $(".textOverlay").animate({top:checkBorderBottom-75}, {duration: 325, step: function( now, fx ){ updateScale(now+150) }});
            console.log("thisone");
            break;
        case 0:
            $(".bottom").removeClass("selected")
            $(".top").removeClass("selected")
            $(".textOverlay").animate({top:pixelPosition-$(".textOverlay").height()}, {duration: 325, step: function( now, fx ){ updateScale(now+37.5) }});

            break;
    }

}


function map(value, low1, high1, low2, high2) {
	return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}


function setSnapMode(snappedToId){
    console.log(snappedToId + " in");
    
    switch (snappedToId){
        case "greenleaf":
            $(".handleCircle").addClass("greenCircle");
            break;
    }
    
    
}

function resetSnapMode(snappedToId){
    console.log(snappedToId + " out");

    switch (snappedToId){
        case "greenleaf":
        case "all":
            $(".handleCircle").removeClass("greenCircle");
            break;
    }
    
    
}









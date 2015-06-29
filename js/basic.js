var offsetElementTop;
var checkBorderTop;

var offsetElementBottom;
var checkBorderBottom;



$( document ).ready(function() {
    $("#inputFieldSetPosition").keyup(function (e) {
        if (e.keyCode == 13) {
            var setTo = parseInt($("#inputFieldSetPosition").val());
            setPosition(1, setTo);
        }
    });
    
    
    FastClick.attach(document.body);
     
    screenHeight = $(window).height();
    screenWidth = $(window).width();

    createSkala();

    offsetElementTop = $(".top").offset()
    checkBorderTop = offsetElementTop.top + $(".top").outerHeight();

    offsetElementBottom = $(".bottom").offset()
    checkBorderBottom = offsetElementBottom.top

    $(".top").click(function(){
		if(!longPressed){
	        var parentString = $(this).parent().attr("id");
	        var setPositionOn = getParentNumber(parentString)
	
	        setPosition(setPositionOn, 0);
		}
    })

    $(".bottom").click(function(){
		if(!longPressed){
	        var parentString = $(this).parent().attr("id");
	        var setPositionOn = getParentNumber(parentString);
	
	        setPosition(setPositionOn, 105);
		}
    })

});

$(window).resize(function(){
    screenHeight = $(window).height();
    screenWidth = $(window).width();	
});


function createSkala(){

    $(".skalaUl").each(function(index){
        for (i = 2; i <= 100; i+=2) { 
            newIndex = i;
            $(this).append("<li class='skalaLi' id='li" + newIndex + "'></li>" );
        }
        var parentParentId = $(this).parent().parent().attr("id");
        setScaleOpacity(50, parentParentId);
    })

}

function setScaleOpacity(border, parentId){
    
    var targetParentId = getParentId(parentId);
    
    $("#" + targetParentId + " .skalaLi").each(function(index){

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

function setIconHeight(percentage, pixelPosition, parentId){
    var iconHeight = 200; //die default iconheight

    percentage = 100-percentage;
    var targetParentId = getParentId(parentId);
    
    //checkif snap und damit grenzen setzen.

    var newHeight = map(percentage, 0, 100, 20, iconHeight);
    
    switch (checkIfSnap(pixelPosition)){ //checkifSnap auch parentID übergeben
        case 1:
            $("#" + targetParentId + " .iconLayer").addClass("animatedHeight")
            $("#" + targetParentId + " .iconLayer").css({"height" : iconHeight + "px"})
            setTimeout(function(){$("#" + targetParentId + " .iconLayer").removeClass("animatedHeight")}, 150);
            break;
        case -1:
            $("#" + targetParentId + " .iconLayer").addClass("animatedHeight")
            $("#" + targetParentId + " .iconLayer").css({"height" : 0 + "px"})
            setTimeout(function(){$("#" + targetParentId + " .iconLayer").removeClass("animatedHeight")}, 150);
            break;
        case 0:
            $("#" + targetParentId + " .iconLayer").css({"height" : newHeight + "px"})
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



function updateScale(mouseY, parentId){
    // berechnen auf welchem prozentpunkt die maus steht
    // alle darunter ausfüllen
    
    console.log(mouseY);
    
    var targetParentId = getParentId(parentId);
    
    var newMousePosition = mouseY - offsetElementTop.top;
    var limit = checkBorderBottom + $(".bottom").height() - offsetElementTop.top;
    
    var percentage = Math.round((newMousePosition/limit)*100);
    
    for (i = 0; i < percentage; i++){
	    $("#" + targetParentId + " #li" + i).removeClass("selected");
    }
    
    for (i = percentage; i <= 100; i++){
	    $("#" + targetParentId + " #li" + i).addClass("selected");
    }
    
    switch (checkIfSnap(mouseY)){
        case -1:
            currentVal[parentId] = 105;
            break;
        case 1:
            currentVal[parentId] = 0;
            break;
        case 0:
            currentVal[parentId] = percentage;
            break;
    }
    
    setScaleOpacity(percentage, parentId);
    setIconHeight(percentage, mouseY, parentId);
    
}


function getParentId(parentId){
    switch (parentId) {
        case 0:
            return "mainJal"
            break;
        case 1:
            return "mainLight"
            break;
        case 2:
            return "mainTemp"
            break;
    }
}

function getParentNumber(parentString){
    switch (parentString) {
        case "mainJal":
            return 0
            break;
        case "mainLight":
            return 1
            break;
        case "mainTemp":
            return 2
            break;
    }
}


function setPosition(parentId, percentagePosition){
    //newPosition sollte ein Wert in Prozent sein

    var targetParentId = getParentId(parentId);
    


    //Umrechnen des Prozentwertes in ein Pixelwert
    var topBorder = offsetElementTop.top;
    console.log("top" + topBorder);
    
    var bottomBorder = offsetElementBottom.top + $(".bottom").outerHeight();
    console.log(bottomBorder);
    
    var wholeDistance = bottomBorder - topBorder;
    console.log("whole" + wholeDistance);
    
    var pixelPosition = topBorder + wholeDistance * (percentagePosition/100);
    console.log(pixelPosition);


    switch (checkIfSnap(pixelPosition)){ //checkifSnap auch parentID übergeben
        case 1:
            $("#" + targetParentId + " .bottom").removeClass("selected")
            $("#" + targetParentId + " .top").addClass("selected")
            $("#" + targetParentId + " .textOverlay").animate({top:0}, {duration: 325, step: function( now, fx ){ updateScale(now + 76 + 37.5, parentId) }});
            break;
        case -1:
            $("#" + targetParentId + " .bottom").addClass("selected")
            $("#" + targetParentId + " .top").removeClass("selected")
            $("#" + targetParentId + " .textOverlay").animate({top:bottomBorder - $(".bottom").outerHeight() - topBorder}, {duration: 325, step: function( now, fx ){ updateScale(now + 76 + 37.5, parentId) }});
            break;
        case 0:
            $("#" + targetParentId + " .bottom").removeClass("selected")
            $("#" + targetParentId + " .top").removeClass("selected")
            $("#" + targetParentId + " .textOverlay").animate({top:pixelPosition-76-37.5}, {duration: 325, step: function( now, fx ){ updateScale(now+76+37.5, parentId) }});

            break;
    }

}


function map(value, low1, high1, low2, high2) {
	return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}


function setSnapMode(snappedToId, targetParentId){
    
    switch (snappedToId){
        case "greenleaf":
            $("#" + targetParentId + " .handleCircle").addClass("greenCircle");
            break;
    }
    
    
}

function resetSnapMode(snappedToId, targetParentId){

    switch (snappedToId){
        case "greenleaf":
        case "all":
            $("#" + targetParentId + " .handleCircle").removeClass("greenCircle");
            break;
    }
    
    
}









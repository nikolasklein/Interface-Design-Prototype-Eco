var offsetElementTop;
var checkBorderTop;

var offsetElementBottom;
var checkBorderBottom;

var cmdPressed = false;

var ghostPosition = 0;
var moveToGhost = false;

var greenLeafVal = [75, 24, 46];
var settingGreenLeaf = false;

var detailLightSet = false;
var settingsSet = false;
var detailDragging = false;
        
        
$(window).keydown(function(e){
    var code = e.keyCode || e.which;
    if(code == 91 || code == 93) {
        cmdPressed = true;
    }
    
    if (code == 83) {

    }
    if (code == 68) {

    }
    
})

function toggleDetailLight(){
    if(detailLightSet){
        $(".detailLight").css({"opacity" : 0});
        $(".detailLight").removeClass("shown");
        detailLightSet = false;
        $(".mainwrapper").css({"width" : "368px"});
        $("#mainLight .iconLayer").css({"left" : "119.5px", "transform" : "scale(1)"});
    }else{
        $(".detailLight").css({"opacity" : 1});
        $(".detailLight").addClass("shown");
        detailLightSet = true;
        $("#mainJal").css({"width" : "10%"});
        $("#mainTemp").css({"width" : "10%"});
        $("#mainLight .iconLayer").css({"left" : "380px", "transform" : "scale(1.02)"});
        $("#mainLight").css({"width" : "80%"});
    }
}

function toggleSettings(){
    if(settingsSet){
        $(".detailSettings").css({"opacity" : 0});
        $(".detailSettings").removeClass("shown");
        settingsSet = false;
    }else{
        $(".detailSettings").css({"opacity" : 1});
        $(".detailSettings").addClass("shown");
        settingsSet = true;
    }
}

$(window).keyup(function(e){
    var code = e.keyCode || e.which;
    if(code == 91 || code == 93) { //Enter keycode
        cmdPressed = false;
    }
})

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
	
	        setPosition(setPositionOn, 0, true);
		}
    })

    $(".bottom").click(function(){
		if(!longPressed){
	        var parentString = $(this).parent().attr("id");
	        var setPositionOn = getParentNumber(parentString);
	
	        setPosition(setPositionOn, 100, true);
		}
		if($(this).hasClass("saveable")){
    		$(this).addClass("savedButton");
		}
    })
    
    $("#mainLight .iconOverlay").click(function(){
        toggleDetailLight();
    })

    $(".detailLight").click(function(){
        toggleDetailLight();
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
    
    var topNumber = 85;
    var bottomNumber = 16;
    
    if(detailDragging){
        topNumber = 95;
        bottomNumber = 5;
    }
    
    $("#" + targetParentId + " .skalaLi").each(function(index){

        var id = $(this).attr("id").substring(2);
        
        var newOpacity = 0;
        

        if (border > topNumber) {
            border = topNumber
        }
        
        if (border < bottomNumber) {
            border = bottomNumber
        }

        var borderHigh = border + 1;
        
        if ( id <= border){
            newOpacity = map(id, bottomNumber-1, border, 0, 1)
        }else{
            newOpacity = map(id, borderHigh, topNumber+1, 1, 0)
        }
        
        $(this).css({"opacity":newOpacity})
    })
}

function setIconHeight(percentage, pixelPosition, parentId){
    var iconHeight = 200; //die default iconheight

    percentage = 100-percentage;
    var targetParentId = getParentId(parentId);
    
    //checkif snap und damit grenzen setzen.

    var mappingBottom = 0;
    var maxTop = 0;
    var maxBottom = iconHeight;
    
    if(parentId == 1){
        mappingBottom = 20;
    }

    var newHeight = map(percentage, 0, 100, mappingBottom, iconHeight);
    
    if (parentId == 0) {
        /*
        newHeight = map(percentage, 100, 0, mappingBottom, iconHeight);
        maxBottom = maxTop;
        maxTop = iconHeight;
*/
    }

    
    switch (checkIfSnap(pixelPosition)){ //checkifSnap auch parentID übergeben
        case 1:
            $("#" + targetParentId + " .iconLayer").addClass("animatedHeight")
            $("#" + targetParentId + " .iconLayer").css({"height" : maxBottom + "px"})
            setTimeout(function(){$("#" + targetParentId + " .iconLayer").removeClass("animatedHeight")}, 150);
            break;
        case -1:
            $("#" + targetParentId + " .iconLayer").addClass("animatedHeight")
            $("#" + targetParentId + " .iconLayer").css({"height" : maxTop + "px"})
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



function updateScale(mouseY, parentId, savePrevPosition, updateGhost){
    // berechnen auf welchem prozentpunkt die maus steht
    // alle darunter ausfüllen
    
    
    var targetParentId = getParentId(parentId);
    
    var newMousePosition = mouseY - offsetElementTop.top;
    var limit = checkBorderBottom + $(".bottom").height() - offsetElementTop.top;
    
    var percentage = Math.round((newMousePosition/limit)*100);

    if(updateGhost){
        $("#" + targetParentId + " .ghost").css({"top" : mouseY-76-$(".bottom").height()/2 + "px"});
        ghostPosition = percentage;
    }

    
    
    if(parentId != 2){ // != 2 >> Jal und Licht
        
        for (i = 0; i < percentage; i++){
    	    $("#" + targetParentId + " #li" + i).removeClass("selected");
        }
        
        for (i = percentage; i <= 100; i++){
    	    $("#" + targetParentId + " #li" + i).addClass("selected");
        }
    }else if(parentId == 2) {


        var topScaleBorder, bottomScaleBorder;
        var heating;
        
        if(settingGreenLeaf){
        //    savePrevPosition = greenLeafVal[parentId];
        }
        
        if (percentage > savePrevPosition) {
            topScaleBorder = percentage;
            bottomScaleBorder = savePrevPosition;
            heating = false;

            if(moveToGhost || settingGreenLeaf){
                heating = true;
            }

        }else{
            topScaleBorder = savePrevPosition;
            bottomScaleBorder = percentage;
            heating = true;
            if(moveToGhost || settingGreenLeaf){
                heating = false;
            }
        }
        
        if(heating){
            $("#" + targetParentId + " .ghostIcon").addClass("heating");
            $("#" + targetParentId + " .ghostIcon").removeClass("cooling");
        }else{
            $("#" + targetParentId + " .ghostIcon").addClass("cooling");
            $("#" + targetParentId + " .ghostIcon").removeClass("heating");
        }
        

        
        for (i = 0; i < bottomScaleBorder; i++){
    	    $("#" + targetParentId + " #li" + i).removeClass("selected");
        }
        
        for (i = bottomScaleBorder; i >= bottomScaleBorder && i <= topScaleBorder; i++){
    	    $("#" + targetParentId + " #li" + i).addClass("selected");
    	    if(heating){
        	    $("#" + targetParentId + " #li" + i).addClass("heating");
        	    $("#" + targetParentId + " #li" + i).removeClass("cooling");
    	    }else{
        	    $("#" + targetParentId + " #li" + i).removeClass("heating");
        	    $("#" + targetParentId + " #li" + i).addClass("cooling");
    	    }
        }
        
        for (i = topScaleBorder; i <= 100; i++){
            $("#" + targetParentId + " #li" + i).removeClass("selected");
        }
    }
    

    if(updateGhost){
        switch (checkIfSnap(mouseY)){
            case -1:
                currentVal[parentId] = 100;
                break;
            case 1:
                currentVal[parentId] = 0;
                break;
            case 0:
                currentVal[parentId] = percentage;
                break;
        }
        
    }else{

    
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


function setPosition(parentId, percentagePosition, setTextOverlay, longDuration, prevPosition){
    //newPosition sollte ein Wert in Prozent sein

    var targetParentId = getParentId(parentId);
    
    
    if(longDuration == undefined){
        longDuration = 325;
    }

    //Umrechnen des Prozentwertes in ein Pixelwert
    var topBorder = offsetElementTop.top;
    
    var bottomBorder = offsetElementBottom.top + $(".bottom").outerHeight();
    
    var wholeDistance = bottomBorder - topBorder;
    
    var pixelPosition = topBorder + wholeDistance * (percentagePosition/100);


    switch (checkIfSnap(pixelPosition)){ //checkifSnap auch parentID übergeben
        case 1:
            $("#" + targetParentId + " .bottom").removeClass("selected")
            $("#" + targetParentId + " .top").addClass("selected")
            if(!setTextOverlay){
                $("#" + targetParentId + " .textOverlay").animate({top:0}, {duration: longDuration});
            }else{
                $("#" + targetParentId + " .textOverlay").animate({top:0}, {duration: longDuration, step: function( now, fx ){ updateScale(now + 76 + 37.5, parentId) }});
            }
            break;
        case -1:
            $("#" + targetParentId + " .bottom").addClass("selected")
            $("#" + targetParentId + " .top").removeClass("selected")
            if(!setTextOverlay){
                $("#" + targetParentId + " .textOverlay").animate({top:bottomBorder - $(".bottom").outerHeight() - topBorder}, {duration: longDuration});
            }else{
                $("#" + targetParentId + " .textOverlay").animate({top:bottomBorder - $(".bottom").outerHeight() - topBorder}, {duration: longDuration, step: function( now, fx ){ updateScale(now + 76 + 37.5, parentId) }});
            }
            break;
        case 0:
            $("#" + targetParentId + " .bottom").removeClass("selected")
            $("#" + targetParentId + " .top").removeClass("selected")
            if(!setTextOverlay){
                $("#" + targetParentId + " .textOverlay").animate({top:pixelPosition-76-37.5}, {duration: longDuration});
            }else{
                $("#" + targetParentId + " .textOverlay").animate({top:pixelPosition-76-37.5}, {duration: longDuration, step: function( now, fx ){ updateScale(now+76+37.5, parentId, prevPosition) }});
            }
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
        case "allGreen":
            $(".handleCircle").addClass("greenCircle");
            break;
    }
    
    
}

function resetSnapMode(snappedToId, targetParentId){

    switch (snappedToId){
        case "greenleaf":
        case "all":
            $("#" + targetParentId + " .handleCircle").removeClass("greenCircle");
            break;
        case "allGreen":
            $(".handleCircle").removeClass("greenCircle");
            $("#3").removeClass("visible");
            menuReset();
            break;
    }
    
    
}



function savePosition(newPosition, parentId, oldPosition){
    moveToGhost = true;

    if(!settingGreenLeaf){
        setPosition(parentId, oldPosition, true, 325, ghostPosition);
    }
    
    var animationDuration;

    targetParentId = getParentId(parentId);
    
    if(parentId == 2){
        var newDegree = parseInt(map(newPosition, 100, 0, 18, 24));
        $("#" + targetParentId + " .ghostIcon").html(newDegree);
        animationDuration = 5000;
    }

    if(parentId == 0){
        var mappedPosition = 100-currentVal[0]
        $("#" + targetParentId + " .ghostIcon").html(mappedPosition);
        animationDuration = 3000;
    }
    
    if(settingGreenLeaf){
        $("#" + targetParentId + " .greenleaf").removeClass("hidden");
        $("#" + targetParentId + " .ghost").addClass("hidden");
    }else{
        $("#" + targetParentId + " .greenleaf").addClass("hidden");
        $("#" + targetParentId + " .ghost").removeClass("hidden");
    }

    $("#" + targetParentId + " .skala").removeClass("hidden");
    
    setTimeout(function(){
        if(!settingGreenLeaf){
            setPosition(parentId, newPosition, true, animationDuration, ghostPosition);
        }else{
            setPosition(parentId, newPosition, true, animationDuration, 100-greenLeafVal[parentId]);
        }


        moveToGhost = true;

        if(settingGreenLeaf){

            setTimeout(function(){
                // Callback when Transition finished
                moveToGhost = false;
            }, animationDuration);
        }else{
            setTimeout(function(){
                // Callback when Transition finished
                
                $("#" + targetParentId + " .greenleaf").addClass("hidden");
                $("#" + targetParentId + " .ghost").addClass("hidden");
                $("#" + targetParentId + " .skala").addClass("hidden");
                
                moveToGhost = false;
            }, animationDuration);
        }

    }, 500);
}




function setToGreenLeaf(){
    settingGreenLeaf = true;
    
    savePosition(100-greenLeafVal[0], 0, 100-currentVal[0]);
    setPosition(1, 100-greenLeafVal[1], true);
    savePosition(100-greenLeafVal[2], 2, currentVal[2]);
    
    setTimeout(function(){
        setSnapMode("allGreen", 0);

        $(".greenleaf").addClass("hidden");
        $(".skala").addClass("hidden");

        settingGreenLeaf = false;
    }, 5000)
}

var buttonsSetToSave = false;

function setButtonsToSave(hiding){
    if (!hiding) {
        $(".bottom .content").html("SPEICHERN");
        $(".bottom").addClass("saveable");
        buttonsSetToSave = true;
        
    }else{
        $(".bottom .content").each(function(){
            var newID = $(this).attr("id");
            $(this).html(newID);
        })
        $(".bottom").removeClass("saveable");
        $(".savedButton").removeClass("savedButton");
        buttonsSetToSave = false;
    }
}



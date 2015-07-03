	
	(function ($) {
    // Detect touch support

    $.support.touch = 'ontouchend' in document;
    // Ignore browsers without touch support
    if (!$.support.touch) {
    return;
    }
    var mouseProto = $.ui.mouse.prototype,
        _mouseInit = mouseProto._mouseInit,
        touchHandled;

    function simulateMouseEvent (event, simulatedType) { //use this function to simulate mouse event
    // Ignore multi-touch events
        if (event.originalEvent.touches.length > 1) {
        return;
        }
        event.preventDefault(); // use this to prevent scrolling during ui use

    var touch = event.originalEvent.changedTouches[0],
        simulatedEvent = document.createEvent('MouseEvents');
    // Initialize the simulated mouse event using the touch event's coordinates
    simulatedEvent.initMouseEvent(
        simulatedType,    // type
        true,             // bubbles                    
        true,             // cancelable                 
        window,           // view                       
        1,                // detail                     
        touch.screenX,    // screenX                    
        touch.screenY,    // screenY                    
        touch.clientX,    // clientX                    
        touch.clientY,    // clientY                    
        false,            // ctrlKey                    
        false,            // altKey                     
        false,            // shiftKey                   
        false,            // metaKey                    
        0,                // button                     
        null              // relatedTarget              
        );

    // Dispatch the simulated event to the target element
    event.target.dispatchEvent(simulatedEvent);
    }
    mouseProto._touchStart = function (event) {
    var self = this;
    // Ignore the event if another widget is already being handled
    if (touchHandled || !self._mouseCapture(event.originalEvent.changedTouches[0])) {
        return;
        }
    // Set the flag to prevent other widgets from inheriting the touch event
    touchHandled = true;
    // Track movement to determine if interaction was a click
    self._touchMoved = false;
    // Simulate the mouseover event
    simulateMouseEvent(event, 'mouseover');
    // Simulate the mousemove event
    simulateMouseEvent(event, 'mousemove');
    // Simulate the mousedown event
    simulateMouseEvent(event, 'mousedown');
    };

    mouseProto._touchMove = function (event) {
    // Ignore event if not handled
    if (!touchHandled) {
        return;
        }
    // Interaction was not a click
    this._touchMoved = true;
    // Simulate the mousemove event
    simulateMouseEvent(event, 'mousemove');
    };
    mouseProto._touchEnd = function (event) {
    // Ignore event if not handled
    if (!touchHandled) {
        return;
    }
    // Simulate the mouseup event
    simulateMouseEvent(event, 'mouseup');
    // Simulate the mouseout event
    simulateMouseEvent(event, 'mouseout');
    // If the touch interaction did not move, it should trigger a click
    if (!this._touchMoved) {
      // Simulate the click event
      simulateMouseEvent(event, 'click');
    }
    // Unset the flag to allow other widgets to inherit the touch event
    touchHandled = false;
    };
    mouseProto._mouseInit = function () {
    var self = this;
    // Delegate the touch handlers to the widget's element
    self.element
        .on('touchstart', $.proxy(self, '_touchStart'))
        .on('touchmove', $.proxy(self, '_touchMove'))
        .on('touchend', $.proxy(self, '_touchEnd'));

    // Call the original $.ui.mouse init method
    _mouseInit.call(self);
    };
})(jQuery); //function for enabling jquery-ui dragging for touch screen devices

	$(function() {

        var starttime;
        var lastMousePosition;
        var lastTime;

        var speedArray = [];
        var timeArray = [];
        
        var snappedId;
        
        var dragParentId = "";
        var dragParentNumber = 0;

        var savePrevPosition;
        var notAnyMore = false;

        function setSnapElements(dragParentId){
            $( ".textOverlay" ).draggable( "option", "snap", false);
            $( ".textOverlay" ).draggable( "option", "snap", ".top, .bottom, #" + dragParentId + " .greenleaf");
        }
        
        
	    $( ".textOverlay" ).draggable({ 
	    	axis: "y",
	    	scroll: false,
	    	handle: ".handle",
	    	containment: "parent",
            cursorAt: { top: 37.5, left: 37.5 },
            snapTolerance: 37.5,
            snap: ".top, .bottom",
            snapMode: "inner",
	        start: function(event, ui){
    	        resetSnapMode("allGreen", 0);
    	        //hier ein getdragParentId()
    	        //diese ID dann vor alle Elemente setzen, dann läuft das automatisch ab
                dragParentId = $(this).parent().attr("id");
                dragParentNumber = getParentNumber(dragParentId);

                savePrevPosition = currentVal[dragParentNumber];

                $("#" + dragParentId + " .textOverlay").removeClass("textTransparent");
                $("#" + dragParentId + " .skala").removeClass("hidden");
                $("#" + dragParentId + " .top, " + "#" + dragParentId + " .bottom").addClass("onlyBorder");
                $("#" + dragParentId + " .iconLayer").addClass("hideBg");
                $("#" + dragParentId + " .ghost").addClass("hidden");
                

                setSnapElements(dragParentId);

                detailDragging = true;
                dragSnapped = false;
	        },	    	
	        drag: function(event, ui) {

                var greenLeafOffset = $("#" + dragParentId + " .greenleaf").offset();
                var greenLeafMouse = greenLeafOffset.top+$("#" + dragParentId + " .greenleaf").outerHeight()/2;
                
				var mousePosition = event.pageY;
                var newPercentage = 100-parseInt(((mousePosition-76)/545)*100);
                var greenLeafPercentage = 100-parseInt(((greenLeafMouse-76)/545)*100);
                
                switch (checkIfSnap(mousePosition)){
                    case 1:
                        $("#" + dragParentId + " .bottom").removeClass("selected")
                        $("#" + dragParentId + " .top").addClass("selected")
                        $("#" + dragParentId + " .textOverlay").addClass("selected");
                        detailDragging = false;
                        if(!dragSnapped){$("#" + dragParentId + " .textOverlayText").html($("#" + dragParentId + " .top .content").attr("id"));}
                        break;
                    case -1:
                        $("#" + dragParentId + " .bottom").addClass("selected")
                        $("#" + dragParentId + " .top").removeClass("selected")
                        $("#" + dragParentId + " .textOverlay").addClass("selected");
                        detailDragging = false;
                            if(!dragSnapped){$("#" + dragParentId + " .textOverlayText").html($("#" + dragParentId + " .bottom .content").attr("id"));}
                        break;
                    case 0:
                        $("#" + dragParentId + " .top").removeClass("selected")
                        $("#" + dragParentId + " .bottom").removeClass("selected")
                        $("#" + dragParentId + " .textOverlay").removeClass("selected");
                        detailDragging = true;
                        if(dragParentNumber != 2){
                            if(!dragSnapped){
                                $("#" + dragParentId + " .textOverlayText").html("<span class='overlayValue'>" + newPercentage + "</span><span class='overlaySmall'>%</span>");
                            }else{
                                $("#" + dragParentId + " .textOverlayText").html("<span class='overlayValue'>" + greenLeafPercentage + "</span><span class='overlaySmall'>%</span>");
                            }
                        }else{
                            
                            if(!dragSnapped){
                                var newDegree = parseInt(map(newPercentage, 0, 100, 18, 24));
                                $("#" + dragParentId + " .textOverlayText").html("<span class='overlayValue'>" + newDegree + "</span><span class='overlaySmall'>°C</span>");
                            }else{
                                var newDegree = parseInt(map(greenLeafPercentage, 0, 100, 18, 24));
                                $("#" + dragParentId + " .textOverlayText").html("<span class='overlayValue'>" + newDegree + "</span><span class='overlaySmall'>°C</span>");
                            }
                        }
                        break;
                }
                //Snap Check Test

                var snapped = $(this).data('ui-draggable').snapElements;
                var snapMode = $(this).data('ui-draggable').options.snapMode;
                var thisElementOffset = $(this).offset()


                /* Pull out only the snap targets that are "snapping": */
                var snappedTo = $.map(snapped, function(element) {
                    //wenn element.snapping && beide offsettops den gleichen wert haben zählts.
                    var snapped = false;

                    if (element.top == thisElementOffset.top){
                        snapped = true;
                    }

                    return snapped ? element.item : null;
                });

                //nicht nur mousePosition, sondern auch dragParentId
                if(snappedTo.length < 1){
                    updateScale(mousePosition, dragParentNumber, savePrevPosition, true);
                    if(dragSnapped){
                        resetSnapMode(snappedId, dragParentId);
                        snappedId = "";
                        dragSnapped = false;
                    }
                }else{
                    if(!dragSnapped){
                        // fix the snappedTo Bug by calling the function with the values
                        // write a snappedTo - function with ID
    
                        var snappedElement = $(snappedTo[0]);
                        var newOffset = snappedElement.offset();
                        var newOffsetTop = newOffset.top + 35
    
                        updateScale(newOffsetTop, dragParentNumber);


                        snappedId = snappedElement.attr("id");
                        
                        setSnapMode(snappedId, dragParentId);

                        dragSnapped = true;
                    }
                }
	        },
	        stop: function(event, ui){
                $("#" + dragParentId + " .skala").addClass("hidden");
                $("#" + dragParentId + " .textOverlay").addClass("textTransparent");
                $("#" + dragParentId + " .top, " + "#" + dragParentId + " .bottom").removeClass("onlyBorder");
                $("#" + dragParentId + " .iconLayer").removeClass("hideBg");
                
                detailDragging = false;
                
                if(dragParentNumber != 1){
                    savePosition(currentVal[dragParentNumber], dragParentNumber, savePrevPosition);
                }
                //savePosition(dragParentId) - abhängig von den Werten eine Funktion schreiben, die dann die Verschiebungen steuert (evtl. über setInterval)
    	        // > wenn die neue Einstellung dann gespeichert werden soll - kopieraktionen und sowas starten lassen
    	        




			}
	    });

	    $( ".main" ).draggable({ 
	    	axis: "y",
	    	scroll: false,
            snapTolerance: 37.5,
            snapMode: "inner",
	        start: function(event, ui){

                //dragParentId speichern und in den folgenden Abfragen verwenden
                dragParentId = $(this).parent().attr("id");
                dragParentNumber = getParentNumber(dragParentId);
                
                savePrevPosition = currentVal[dragParentNumber];

            	a=ui.offset.top;
            	defaultpostop = ui.position.top;

                $("#" + dragParentId + " .top, " + "#" + dragParentId + " .bottom").addClass("onlyBorderButText");
                $("#" + dragParentId + " .handleCircle").addClass("handleCircleSmall");
                $("#" + dragParentId + " .skala").removeClass("hidden");
                $("#" + dragParentId + " .greenleaf").addClass("hidden");
                $("#" + dragParentId + " .ghost").addClass("hidden");
                
    	        resetSnapMode("allGreen", 0);
                
                starttime = new Date();
                timeArray = [];
                speedArray = [];
                
                lastMousePosition = false;
                
                savePrevPosition = currentVal[dragParentNumber];
                
                resetSnapMode("all", dragParentId);
                
                setSnapElements(dragParentId);

	        },	    	
	        drag: function(event, ui) {

            	ui.position.top  = defaultpostop;
				var mousePosition = event.pageY;
				
				if(!lastMousePosition){
    				lastMousePosition = mousePosition;
				}
				
				
				//evtl. hier geschwindigkeit ausrechnen um flicken zu erkennen #nicetohave
				
                var midTime = new Date();
                var midFulltime = midTime - lastTime;
                var midMoved = mousePosition - lastMousePosition;
                var midSpeed = midMoved/midFulltime;
                timeArray.push(midTime);
                speedArray.push(midSpeed);

                

                
                
                //checkIfSnap(mousePosition) > darin sinnvoll auslesen wo die grenzen sind
                //returns 1 für snapToTop, 0 für nothing, -1 für snapToBottom

                //read mouseposition to change .textOverlay
                
                switch (checkIfSnap(mousePosition)){ //checkifSnap auch dragParentId übergeben
                    case 1:
                        $("#" + dragParentId + " .bottom").removeClass("selected")
                        $("#" + dragParentId + " .top").addClass("selected")

                        $("#" + dragParentId + " .textOverlay").css({"top" : 0 + "px"})
                        $("#" + dragParentId + " .textOverlay").addClass("selected");
                        break;
                    case -1:
                        $("#" + dragParentId + " .bottom").addClass("selected")
                        $("#" + dragParentId + " .top").removeClass("selected")

                        $("#" + dragParentId + " .textOverlay").css({"top" : checkBorderBottom-75 + "px"})
                        $("#" + dragParentId + " .textOverlay").addClass("selected");
                        break;
                    case 0:
                        $("#" + dragParentId + " .bottom").removeClass("selected")
                        $("#" + dragParentId + " .top").removeClass("selected")

                        $("#" + dragParentId + " .textOverlay").css({"top" : mousePosition-75-($(".textOverlay").height()/2) + "px"})
                        $("#" + dragParentId + " .textOverlay").removeClass("selected");

                        break;
                }




                
                //dragParentId in updateScale einbauen
                updateScale(mousePosition, dragParentNumber, savePrevPosition, true);
                
                lastMousePosition = mousePosition;
                lastTime = midTime;


	        },
	        stop: function(event, ui){

                $("#" + dragParentId + " .top," + "#" + dragParentId + " .bottom").removeClass("onlyBorderButText");
                $("#" + dragParentId + " .handleCircle").removeClass("handleCircleSmall");
                $("#" + dragParentId + " .skala").addClass("hidden");
                
                var fullSpeed = 0;
                var speedCount = 0;
                var endTime = new Date();
                
                for (i = 0; i < timeArray.length; i++){
                    
                    if(endTime - timeArray[i] < 300){
                        fullSpeed += speedArray[i];
                        speedCount++;
                    }

                }
                
                if(dragParentNumber != 1 && cmdPressed){
                    savePosition(currentVal[dragParentNumber], dragParentNumber, savePrevPosition);
                }else{
                    setTimeout(function(){$("#" + dragParentId + " .greenleaf").removeClass("hidden");}, 200);
                }
                
                var fullAvgSpeed = fullSpeed/speedCount;
                
                
                if(fullAvgSpeed > 0.5){
                    $("#" + dragParentId + " .bottom").click();
                }else if(fullAvgSpeed < -0.5){
                    $("#" + dragParentId + " .top").click();
                }

                
                //savePosition(dragParentId) - abhängig von den Werten eine Funktion schreiben, die dann die Verschiebungen steuert (evtl. über setInterval)
    	        // > wenn die neue Einstellung dann gespeichert werden soll - kopieraktionen und sowas starten lassen
			}
	    });
	    
	    
	    
	    
	    
	    
});


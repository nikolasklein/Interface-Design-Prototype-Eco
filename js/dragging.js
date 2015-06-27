	
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

	    $( ".textOverlay" ).draggable({ 
	    	axis: "y",
	    	scroll: false,
	    	handle: ".handle",
	    	containment: "parent",
            snap: ".top, .bottom, .greenleaf",
            cursorAt: { top: 37.5, left: 37.5 },
            snapTolerance: 37.5,
            snapMode: "inner",
	        start: function(event, ui){
    	        
    	        //hier ein getParentID()
    	        //diese ID dann vor alle Elemente setzen, dann läuft das automatisch ab
    	        
    	        
                $(".textOverlay").removeClass("textTransparent");
                $(".skala").removeClass("hidden");
                $(".top, .bottom").addClass("onlyBorder");
                $(".iconLayer").addClass("hideBg");
                
                dragSnapped = false;
	        },	    	
	        drag: function(event, ui) {
				var topUI = ui.position.top-$(window).scrollTop();
                var newPercentage = 100-parseInt((topUI/430)*100);
				var mousePosition = event.pageY;
                
                
				if(newPercentage > 2 && newPercentage < 98){
    				$(".textOverlayText").html(newPercentage + "%");
                }else if(newPercentage < 2){
    				$(".textOverlayText").html("AUS");
                }else if(newPercentage > 98){
    				$(".textOverlayText").html("AN");
                }
                
                switch (checkIfSnap(mousePosition)){
                    case 1:
                        $(".bottom").removeClass("selected")
                        $(".top").addClass("selected")
                        break;
                    case -1:
                        $(".bottom").addClass("selected")
                        $(".top").removeClass("selected")
                        break;
                    case 0:
                        $(".top").removeClass("selected")
                        $(".bottom").removeClass("selected")
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

                //nicht nur mousePosition, sondern auch parentID
                if(snappedTo.length < 1){
                    updateScale(mousePosition);
                    if(dragSnapped){
                        resetSnapMode(snappedId);
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
    
                        updateScale(newOffsetTop);


                        snappedId = snappedElement.attr("id");
                        
                        setSnapMode(snappedId);

                        dragSnapped = true;
                    }
                    
                }

                
	        },
	        stop: function(event, ui){
                $(".skala").addClass("hidden");
                $(".textOverlay").addClass("textTransparent");
                $(".top, .bottom").removeClass("onlyBorder");
                $(".iconLayer").removeClass("hideBg");
                
                
                //savePosition(parentID) - abhängig von den Werten eine Funktion schreiben, die dann die Verschiebungen steuert (evtl. über setInterval)
    	        // > wenn die neue Einstellung dann gespeichert werden soll - kopieraktionen und sowas starten lassen


			}
	    });

	    $( ".main" ).draggable({ 
	    	axis: "y",
	    	scroll: false,
            snapTolerance: 37.5,
            snapMode: "inner",
	        start: function(event, ui){

                //parentID speichern und in den folgenden Abfragen verwenden

            	a=ui.offset.top;
            	defaultpostop = ui.position.top;

                $(".top, .bottom").addClass("onlyBorderButText");
                $(".handleCircle").addClass("handleCircleSmall");
                
                starttime = new Date();
                timeArray = [];
                speedArray = [];
                
                lastMousePosition = false;
                
                resetSnapMode("all");
                
	        },	    	
	        drag: function(event, ui) {

            	ui.position.top  = defaultpostop;
				var mousePosition = event.pageY;
				
				if(!lastMousePosition){
    				lastMousePosition = mousePosition;
				}


				var topUI = ui.position.top-$(window).scrollTop();
				
				
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
                
                switch (checkIfSnap(mousePosition)){ //checkifSnap auch parentID übergeben
                    case 1:
                        $(".bottom").removeClass("selected")
                        $(".top").addClass("selected")

                        $(".textOverlay").css({"top" : 0 + "px"})
                        break;
                    case -1:
                        $(".bottom").addClass("selected")
                        $(".top").removeClass("selected")

                        $(".textOverlay").css({"top" : checkBorderBottom-75 + "px"})
                        break;
                    case 0:
                        $(".bottom").removeClass("selected")
                        $(".top").removeClass("selected")

                        $(".textOverlay").css({"top" : mousePosition-75-($(".textOverlay").height()/2) + "px"})

                        break;
                }




                
                //parentID in updateScale einbauen
                updateScale(mousePosition)
                
                lastMousePosition = mousePosition;
                lastTime = midTime;


	        },
	        stop: function(event, ui){

                $(".top, .bottom").removeClass("onlyBorderButText");
                $(".handleCircle").removeClass("handleCircleSmall");
                
                var fullSpeed = 0;
                var speedCount = 0;
                var endTime = new Date();
                
                for (i = 0; i < timeArray.length; i++){
                    
                    if(endTime - timeArray[i] < 300){
                        fullSpeed += speedArray[i];
                        speedCount++;
                    }

                }
                
                var fullAvgSpeed = fullSpeed/speedCount;
                
                
                if(fullAvgSpeed > 0.5){
                    $(".bottom").click();
                }else if(fullAvgSpeed < -0.5){
                    $(".top").click();
                }

                
                //savePosition(parentID) - abhängig von den Werten eine Funktion schreiben, die dann die Verschiebungen steuert (evtl. über setInterval)
    	        // > wenn die neue Einstellung dann gespeichert werden soll - kopieraktionen und sowas starten lassen
			}
	    });
	    
	    
	    
	    
	    
	    
});


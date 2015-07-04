//VARIABLES
var counter;
var longPressed=false;
var activeButton;
var greenLeaf=false;

//SYSTEM
var systemActive=false;
var systemButton=false;
var reConnected=true;
var interval;
var intervalSet=false;


//VARIABLES SLOTS 
var slots=[false,false,false,false ];

//ARRAYS
var jalVal=[0,0,0,0];
var lightVal=[0,0,0,0];
var tempVal=[0,0,0,0];

var currentVal=[0,0,0];
var arduino;


$(document).ready(function() {
startArduino();

function startArduino(){
    var IOBoard = BO.IOBoard;
    var IOBoardEvent = BO.IOBoardEvent;
    var Button = BO.io.Button;
    var ButtonEvent = BO.io.ButtonEvent;
    
    // Set to true to print debug messages to console
    BO.enableDebugging = false; 
    
    // If you are not serving this file from the same computer
    // that the Arduino board is connected to, replace
    // window.location.hostname with the IP address or hostname
    // of the computer that the Arduino board is connected to.
    var host = "172.17.11.198";
    
    
    arduino = new IOBoard(host, 8887);
    
    // Listen for the IOBoard READY event which indicates the IOBoard
    // is ready to send and receive data
    arduino.addEventListener(IOBoardEvent.READY, onReady);
    arduino.addEventListener(IOBoardEvent.DISCONNECTED,setConnect);

    
    function onReady(event) {
        // Remove the event listener because it is no longer needed
        arduino.removeEventListener(IOBoardEvent.READY, onReady);
    
        // Enable the analog pin so we can read its value
        arduino.enableAnalogPin(0);
    	
    	var button1 = new Button(arduino, arduino.getDigitalPin(2));
    	button1.addEventListener(ButtonEvent.PRESS, onPress);
    	button1.addEventListener(ButtonEvent.RELEASE, onRelease);
    	var button2= new Button(arduino, arduino.getDigitalPin(3));
    	button2.addEventListener(ButtonEvent.PRESS, onPress);
    	button2.addEventListener(ButtonEvent.RELEASE, onRelease);
    	var button3= new Button(arduino, arduino.getDigitalPin(4));
    	button3.addEventListener(ButtonEvent.PRESS, onPress);
    	button3.addEventListener(ButtonEvent.RELEASE, onRelease);
    	var button4= new Button(arduino, arduino.getDigitalPin(5));
    	button4.addEventListener(ButtonEvent.PRESS, onPress);
    	button4.addEventListener(ButtonEvent.RELEASE, onRelease);
    	var button5= new Button(arduino, arduino.getDigitalPin(6));
    	button5.addEventListener(ButtonEvent.PRESS, onPress);
    	button5.addEventListener(ButtonEvent.RELEASE, onRelease);
    	var button6= new Button(arduino, arduino.getDigitalPin(7));
    	button6.addEventListener(ButtonEvent.PRESS, onPress);
    	button6.addEventListener(ButtonEvent.RELEASE, onRelease);
    	var schalter = new Button(arduino, arduino.getDigitalPin(8));
        schalter.addEventListener(ButtonEvent.PRESS, startSystem);
    	schalter.addEventListener(ButtonEvent.RELEASE, endSystem);
    }
}
    
    function onPress(evt) {
    	// get a reference to the target which is the button that 
    	// triggered the event
    	var btn = evt.target;
    	var btnNumber=btn._pin.number-1;
    		console.log(btnNumber);
        
        setButtonsToSave(true);
    
    	// display the state on the page
    	menuReset();
    	if(btnNumber!=3){
    		if(slots[btnNumber-1]){
    			$("#"+(btnNumber)).addClass("visible"); //NUR ACTIVE WENN STATUS EIGNESPEICHERT
    		}
    		startCounter(btnNumber);
    	}else{
    		if(!greenLeaf){
    		 	$("#"+(btnNumber)).addClass("visible"); //NUR ACTIVE WENN STATUS EIGNESPEICHERT
    			greenLeaf=true;
                setToGreenLeaf();
    		}
    	}
    	
    	if(btnNumber == 6){
            toggleSettings();
    	}
    }
    
    function longPress(btnNumber){
    	longPressed=true;
    	activeButton=btnNumber;
    	statusReset(btnNumber);
    	$("#"+(btnNumber)+" .slots").addClass("pressed");
    	if(!slots[btnNumber-1]){ //ÜBERPRÜFUNG OB SLOT EINGESPEICHERTEN WERT HAT
    		slots[btnNumber-1]=true;
    		$("#"+(btnNumber)).addClass("visible");
    		$("#"+(btnNumber)).addClass("saved");
    	}
    	setButtonsToSave(false);
    }
    
    function startCounter(btnNumber){
    	var count = 25;
    
    	counter = setInterval(timer, 10); //10 will  run it every 100th of a second
    	
    	function timer()
    	{
    		if (count <= 0)
    		{
    			longPress(btnNumber);
    			clearInterval(counter);
    			return;
    		 }
    		 count--;
    	}	
    }
    
    function onRelease(evt){
    	var btn=evt.target;
    	var btnNumber=btn._pin.number-1;
    	if(btnNumber!=3){
			resetSnapMode("allGreen", 0);
    		console.log("RELEASE");
            setButtonsToSave(true);

    			console.log(jalVal)
    			console.log(lightVal)
    			console.log(tempVal)

    		if(!longPressed&&slots[btnNumber-1]){ //Wenn nicht in speichermodus, dann werte setzen
    			console.log("CHECK"+btnNumber);
    			

    			
    			if($("#j"+ btnNumber).hasClass("active")) {

                    var setToJalValue;
                    
					if(btnNumber < 3){
    					setToJalValue = jalVal[btnNumber-1];
					}else{
    					setToJalValue = jalVal[btnNumber-2];
					}

	                setPosition(0, setToJalValue, true);
	                console.log(btnNumber+"j saved"+setToJalValue);
                };
                
                if($("#l"+ btnNumber).hasClass("active")) {

                    var setToLightValue;
                    
					if(btnNumber < 3){
    					setToLightValue = lightVal[btnNumber-1];
					}else{
    					setToLightValue = lightVal[btnNumber-2];
					}

	                setPosition(1, setToLightValue, true);
	                console.log(btnNumber+"l saved"+setToLightValue);
                };             

				if($("#t"+ btnNumber).hasClass("active")) {
                    var setToTempValue;
                    
					if(btnNumber < 3){
    					setToTempValue = tempVal[btnNumber-1];
					}else{
    					setToTempValue = tempVal[btnNumber-2];
					}
	                setPosition(2, setToTempValue, true);
	                console.log(btnNumber+"t saved"+setToTempValue);
                };
    		}
    		longPressed=false;
    		var isSaved=checkSaved(btnNumber);
    		if(!isSaved){
    	        resetSnapMode("allGreen", 0);
    			$("#"+(btnNumber)).removeClass("visible");
    			$("#"+(btnNumber)).removeClass("saved");
    			slots[btnNumber-1]=false;
    			console.log("RESET");
    		}
    		$("#"+(btnNumber)+" .slots").removeClass("pressed");
    		clearInterval(counter);
    		activeButton=0;
    	}
    }
    
    
    //SAVE VALUES
    function saveJal(btnNumber){
    	switch (btnNumber) {
    		case 1:
    			jalVal[0]=currentVal[0];
    		break;
    		case 2:
    			jalVal[1]=currentVal[0];
    		break;
    		case 4:
    			jalVal[2]=currentVal[0];
    		break;
    		case 5:
    			jalVal[3]=currentVal[0];
    		break;	
    	}
    	updateJal(currentVal[0],btnNumber);
    }
    
    function saveLight(btnNumber){
    	switch (btnNumber) {
    		case 1:
    			lightVal[0]=currentVal[1];
    		break;
    		case 2:
    			lightVal[1]=currentVal[1];
    		break;
    		case 4:
    			lightVal[2]=currentVal[1];
    		break;
    		case 5:
    			lightVal[3]=currentVal[1];
    		break;	
    	}
    	updateLight(currentVal[1],btnNumber);
    }
    
    function saveTemp(btnNumber){
    	switch (btnNumber) {
    		case 1:
    			tempVal[0]=currentVal[2];
    		break;
    		case 2:
    			tempVal[1]=currentVal[2];
    			
    		break;
    		case 4:
    			tempVal[2]=currentVal[2];
    		break;
    		case 5:
    			tempVal[3]=currentVal[2];
    		break;	
    	}
    	updateTemp(currentVal[2],btnNumber);
    }
    
    //UPDATE VALUEBARS
    
    function updateJal(value,btnNumber){
    	$("#j"+btnNumber).addClass("active");
    	console.log("wert"+Math.floor(currentVal[0]/2));
    	$("#j"+ btnNumber +" li").eq(Math.floor(currentVal[0]/20)).addClass("active");
    }
    
    function updateLight(value,btnNumber){
    	$("#l"+btnNumber).addClass("active");
    	$("#l"+ btnNumber +" li").eq(Math.floor(currentVal[1]/20)).addClass("active");
    }
    
    function updateTemp(value,btnNumber){
    	$("#t"+btnNumber).addClass("active");
    	$("#t"+ btnNumber +" li").eq(Math.floor(currentVal[2]/20)).addClass("active");
    }
    
    //GET VALUES
    function getJal(btnNumber){
    	switch (btnNumber) {
    		case 1:
    			return jalVal[0];
    		break;
    		case 2:
    			return jalVal[1];
    		break;
    		case 4:
    			return jalVal[2];
    		break;
    		case 5:
    			return jalVal[3];
    		break;	
    	}
    }
    
    function getLight(btnNumber){
    	switch (btnNumber) {
    		case 1:
    			return lightVal[0];
    		break;
    		case 2:
    			return lightVal[1];
    		break;
    		case 4:
    			return lightVal[2];
    		break;
    		case 5:
    			return lightVal[3];
    		break;	
    	}
    }
    
    function getTemp(btnNumber){
    	switch (btnNumber) {
    		case 1:
    			return tempVal[0];
    		break;
    		case 2:
    			return tempVal[1];
    		break;
    		case 4:
    			return tempVal[2];
    		break;
    		case 5:
    			return tempVal[3];
    		break;	
    	}
    }
    
    //CLICK EVENTS
    $(".saveJal").click(function(event){
    	saveJal(activeButton);
    });
    
    $(".saveLight").click(function(event){
    	saveLight(activeButton);
    });
    
    $(".saveTemp").click(function(event){
    	saveTemp(activeButton);
    });
    
    //OVERWRIDE STATUS
    function statusReset(btnNumber){
    	$("#t"+ btnNumber +" li").each(function(){
    			if($(this).hasClass("active")) {
    				$(this).removeClass("active");
    			}
    	});
    	
    	$("#l"+ btnNumber +" li").each(function(){
    			if($(this).hasClass("active")) {
    				$(this).removeClass("active");
    			}
    	});
    	
    	$("#j"+ btnNumber +" li").each(function(){
    			if($(this).hasClass("active")) {
    				$(this).removeClass("active");
    			}
    	});
    	
    	$("#l"+ btnNumber).removeClass("active");
    	$("#j"+ btnNumber).removeClass("active");
    	$("#t"+ btnNumber).removeClass("active");
    	
    	switch (btnNumber) { //RESET ARRAY
    		case 1:
    			tempVal[0]=0;
    			lightVal[0]=0;
    			jalVal[0]=0;
    		break;
    		case 2:
    			tempVal[1]=0;
    			lightVal[1]=0;
    			jalVal[1]=0;
    		break;
    		case 4:
    			tempVal[2]=0;
    			lightVal[2]=0;
    			jalVal[2]=0;
    		break;
    		case 5:
    			tempVal[3]=0;
    			lightVal[3]=0;
    			jalVal[3]=0;
    		break;	
    	}
    }
    
    //CHECK NOTHING SAVED
    function checkSaved(btnNumber){
    	switch (btnNumber) {
    		case 1:
    			if(lightVal[0]==0&&jalVal[0]==0&&tempVal[0]==0){
    				return false;	
    			}
    			else{
    				return true;	
    			}
    		break;
    		case 2:
    			if(lightVal[1]==0&&jalVal[1]==0&&tempVal[1]==0){
    				return false;	
    			}
    			else{
    				return true;	
    			}
    		break;
    		case 4:
    			if(lightVal[2]==0&&jalVal[2]==0&&tempVal[2]==0){
    				return false;	
    			}
    			else{
    				return true;	
    			}
    		break;
    		case 5:
    			if(lightVal[3]==0&&jalVal[3]==0&&tempVal[3]==0){
    				return false;	
    			}
    			else{
    				return true;	
    			}
    		break;
    	}
    	console.log("none");
    }
    
    function startSystem(){
    	if(!systemButton){
    		if(!systemActive){
    			$(".overlay").addClass("inactive");
    			startInterval();
    			systemActive=true;
    		}
    		else{
    			$(".overlay").removeClass("inactive");
    			systemActive=false;
    		}
    		systemButton=true;
    	}
    }
    
    function endSystem(){
    		systemButton=false;
    }
    
    function setConnect(){
    	console.log("ABBRUCH");
	 	if(reConnected){
		 	reConnected=false;
	 	}
    }
    
    function startInterval(){
	    interval=setInterval(function(){
			if(systemActive&&!reConnected){
		    startArduino();
		    			reConnected=true;
		    console.log("NEU");
	    }
		},4000);
    }

});

    
    //RESET
    //TOGGLE ACTIVE STATUS
    function menuReset(btnNumber){
    	$("#navigation ul li").each(function(){
    			if($(this).hasClass("visible")) {
    				$(this).removeClass("visible");
    			}
    			if(btnNumber!=3){
    				greenLeaf=false;	
    			}
    	});
    }
    
   
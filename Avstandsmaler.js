//Video
(function() {
  "use strict"

  function rgbWithinRange(r, g, b) {
  	var rmin = getValue("minred") ;
  	var rmax = getValue("maxred") ;
  	var gmin = getValue("mingreen") ;
  	var gmax = getValue("maxgreen") ;
  	var bmin = getValue("minblue") ;
  	var bmax = getValue("maxblue") ;

    var withinRange =
	  r > rmin&&
      r < rmax &&
      g > gmin&&
      g < gmax &&
      b > bmin &&
      b < bmax;
    return withinRange;
  }

  function update() {
    ctx.drawImage(video, 0, 0, width, height);

    var tracker = new Tracker(-1, -1);

    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imgData.data;
    var px, red, green, blue;
    var distance = 0;
    var myFrequency = 0;


    for (var x = 0; x < width; ++x) {
      for (var y = 0; y < height; ++y) {
        px = (x + y * width) * 4;

        red = data[px];
        green = data[px + 1];
        blue = data[px + 2];

        if (rgbWithinRange(red, green, blue)) {
          if (tracker.left == -1) {
            tracker.left = x;
            tracker.right = x;
            tracker.top = y;
            tracker.bottom = y;
          } else {
            tracker.left = Math.min(x, tracker.left);
            tracker.right = Math.max(x, tracker.right);
            tracker.top = Math.min(y, tracker.top);
            tracker.bottom = Math.max(y, tracker.bottom);
          }
        }
      }
    }
    if (tracker.left != -1) {
      ctx.strokeStyle = "red";
      ctx.fillStyle = "red";
      ctx.strokeRect(tracker.left, tracker.top, tracker.right - tracker.left, tracker.bottom - tracker.top);

      var pixels = (tracker.right - tracker.left);
      //var focal = 20;
      //var length = 10;
      var focalLength = getValue("focalLength");
//      var distance = (focal * length) / pixels;
      distance = focalLength * 10 / pixels;
      console.log(distance);
      
      myFrequency = distance * 10;

    }
    if(myFrequency < 20000)
    {
	    oscillator.frequency.value = myFrequency;
    }

    ctx.fillRect(0, height - distance, 50, distance);
    var distanceString = String(Math.round(distance)) + " cm";
    var distanceMeasuredDiv = document.getElementById("distanceMeasured");
    distanceMeasured.innerHTML = distanceString;

  }


  //----------------------------------------------------------------------------
  function Tracker(x, y) {
    this.left = x;
    this.right = x;
    this.top = y;
    this.bottom = y;
  }

  function run() {

    var dt = 0;
    var oldtime = window.performance.now()
    var loop = function() {
      var newtime = window.performance.now();
      dt = (newtime - oldtime) / 1000;
      update();
      oldtime = newtime;
      window.requestAnimationFrame(loop);
    }
    window.requestAnimationFrame(loop);
  }

  function getValue(id) {
    var value = document.getElementById(id).value;
    return Number(value);
  }

  function updateSlider(sliderId, sliderValueId) {
    var slider = document.getElementById(sliderId);
    var output = document.getElementById(sliderValueId);
    output.innerHTML = slider.value;
    slider.oninput = function() {
      output.innerHTML = this.value;
    }
  }
  var streaming = false;

  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");
  var width = canvas.width;
  var height = canvas.height;

  var video = document.createElement('video');

  updateSlider("minred", "minredValue");
  updateSlider("maxred", "maxredValue");
  updateSlider("mingreen", "mingreenValue");
  updateSlider("maxgreen", "maxgreenValue");
  updateSlider("minblue", "minblueValue");
  updateSlider("maxblue", "maxblueValue");
  updateSlider("focalLength", "focalLengthValue");


  video.setAttribute('autoplay', true);

  video.addEventListener('canplay', function(ev) {
    if (!streaming) {
      streaming = true;
    }
  }, false);

  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false
  }).then(function(stream) {
    video.srcObject = stream;
    video.play();
  }).catch(function(err) {});

  run();
})()

//Sound

/////////////////////////////////////////////////////////////////////////////////////////
//LYD blir konfigurert nedenfor
/////////////////////////////////////////////////////////////////////////////////////////
//Lyd på web er ikke helt standardisert enda, derfor må vi prøve å lage
//en lydcontext på mange foskjellige måter. Avhengig av hvilken
//nettleser vi bruker vil en av de mest sannsynlig virke.
//Les om hvilke nettlesere som støttes her: http://caniuse.com/#feat=audio-api

var gainValue = 1.0;
var gainNode = null; //Denne blir definert senere.
var oscillator = null; //Denne blir også definert senere.

var contextClass = (window.AudioContext ||
  window.webkitAudioContext ||
  window.mozAudioContext ||
  window.oAudioContext ||
  window.msAudioContext);

//Hvis lyd støttes oppretter vi en lydkontekst og en forsterker (gain)
if (contextClass) 
{
  var context = new contextClass();

  //Forsterkeren kan lages på to måter avhengig av nettleser.
  //Dersom createGain funksjonen finnes bruker vi den. Hvis ikke bruker vi createGainNode
  if(context.createGain)
  {
	gainNode = context.createGain();
  }
  else
  {
	gainNode = context.createGainNode();
  }

  //Lag en oscillator
  oscillator = context.createOscillator();

  //Koble til forsterkeren
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  //I begynnelsen var det ingen lyd (frekvens 0)
  oscillator.frequency.value = 0;

  //To ulike måter å starte oscillatoren på avhengig av nettleser.
  //Dersom start funksjonen finnes bruker vi den, hvis ikke bruker vi noteOn
  //Verdien 0 betyr at oscillatoren skal starte med en gang (altså etter 0 ms)
  if(oscillator.start)
  {
	oscillator.start(0);
  }
  else
  {
	  oscillator.noteOn(0);
  }
} 
else 
{
	alert("Lyd ikke støttet!");
}

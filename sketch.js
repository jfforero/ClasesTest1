let letters = [];
let recognition;
let listening = false;

let gravity = 0.5;
let floorY;

let fontSize = 32;
let selectedFont = "Arial";

// ----------------------------
// WAIT FOR DOM (fix null error)
// ----------------------------
window.addEventListener("DOMContentLoaded", () => {

  const sizeSlider = document.getElementById("sizeSlider");
  const fontSelect = document.getElementById("fontSelect");

  if (sizeSlider) {
    fontSize = parseInt(sizeSlider.value);

    sizeSlider.addEventListener("input", (e) => {
      fontSize = parseInt(e.target.value);
    });
  }

  if (fontSelect) {
    selectedFont = fontSelect.value;

    fontSelect.addEventListener("change", (e) => {
      selectedFont = e.target.value;
    });
  }
});

// ----------------------------
// P5 SETUP
// ----------------------------
function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);

  floorY = height - 40;

  // Speech Recognition
  let SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = "en-US";

    recognition.onresult = function (event) {
      let transcript =
        event.results[event.results.length - 1][0].transcript;
      addLetters(transcript);
    };
  } else {
    alert("Speech Recognition not supported in this browser.");
  }
}

// ----------------------------
// DRAW LOOP
// ----------------------------
function draw() {
  background(20);

  floorY = height - 40;

  // Draw floor
  fill(80);
  rect(0, floorY, width, 40);

  for (let i = letters.length - 1; i >= 0; i--) {
    letters[i].update();
    letters[i].display();

    if (letters[i].shouldDelete) {
      letters.splice(i, 1);
    }
  }
}

// ----------------------------
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ----------------------------
function mousePressed() {
  if (!listening && recognition) {
    recognition.start();
    listening = true;
  }
}

// ----------------------------
function keyPressed() {
  if (key === " ") {
    for (let l of letters) {
      l.falling = true;
    }
  }
}

// ----------------------------
function addLetters(text) {
  for (let char of text) {
    if (char !== " ") {
      letters.push(new FloatingLetter(char));
    }
  }
}

// =====================================================
// FLOATING LETTER CLASS
// =====================================================
class FloatingLetter {
  constructor(char) {
    this.char = char;
    this.x = random(width);
    this.y = random(height / 2);
    this.vx = random(-2, 2);
    this.vy = random(-1, 1);
    this.falling = false;
    this.hitFloorTime = null;
    this.shouldDelete = false;
  }

  update() {
    let letterHeight = fontSize;

    if (!this.falling) {
      // Floating motion
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > floorY - letterHeight / 2)
        this.vy *= -1;

    } else {
      // Falling motion
      this.vy += gravity;
      this.y += this.vy;

      if (this.y > floorY - letterHeight / 2) {
        this.y = floorY - letterHeight / 2;
        this.vy = 0;

        if (!this.hitFloorTime) {
          this.hitFloorTime = millis();
        }

        // Delete after 4 seconds
        if (millis() - this.hitFloorTime > 4000) {
          this.shouldDelete = true;
        }
      }
    }
  }

  display() {
    fill(255);
    textSize(fontSize);
    textFont(selectedFont);
    text(this.char, this.x, this.y);
  }
}
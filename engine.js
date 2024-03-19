let __running = true;
// if there's a game ID in the search params, fetch it
let __gameID = new URLSearchParams(window.location.search).get("game");
if (__gameID) {
  fetch(`https://game.leady.in/api/games/${__gameID}`)
    .then((res) => res.json())
    .then((data) => {
      let prevCode = localStorage.getItem("code");
      let prevSprites = localStorage.getItem("sprites");
      localStorage.setItem("code", data.data.attributes.code);
      localStorage.setItem(
        "sprites",
        JSON.stringify(data.data.attributes.sprites)
      );
      if (
        prevCode !== data.data.attributes.code ||
        prevSprites != JSON.stringify(data.data.attributes.sprites)
      )
        location.reload();
    });
}

__code = new URLSearchParams(window.location.search).get("code");
if (!__code) __code = localStorage.getItem("code");
if (!__code) {
  console.log("No code found");
  __code = `//setup//
//update//`;
}
// setup listeners for joystick and buttons
window.addEventListener("message", (e) => {
  if (e.data.type === "joystick") {
    let x = e.data.x;
    let y = e.data.y;
    __joystick = { x, y };
  }
  if (e.data.type === "button") {
    if (e.data.state) {
      __pressedButtons[e.data.button] = true;
      __heldButtons[e.data.button] = true;
    } else {
      __pressedButtons[e.data.button] = false;
      __heldButtons[e.data.button] = false;
    }
  }
});
// disable scrollinng
window.addEventListener(
  "keydown",
  function (e) {
    if (
      ["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(
        e.code
      ) > -1
    ) {
      e.preventDefault();
    }
  },
  false
);

console.log("Starting Engine");
__canvasCreated = false;
__gameSize = 128;

__camera = {
  x: 0,
  y: 0,
  zoom: 1,
  setPosition: (x, y) => {
    __camera.x = x;
    __camera.y = y;
  },
  translate: (x, y) => {
    __camera.x += x;
    __camera.y += y;
  },
  scale: (zoom) => {
    __camera.zoom += zoom;
  },
  setScale: (zoom) => {
    __camera.zoom = zoom;
  },
};

__pressedKeys = [];
__heldKeys = [];
__pressedButtons = {
  A: false,
  B: false,
  SELECT: false,
  START: false,
};
__heldButtons = {
  A: false,
  B: false,
  SELECT: false,
  START: false,
};

__joystick = { x: 0, y: 0 };

// __gloablsFN = __code.split("//globals//")[1].split("//setup//")[0];
__gloablsFN = __code.split("//setup//")[1].split("//update//")[0];
__updateFN = __code.split("//update//")[1];

__sprites = JSON.parse(localStorage.getItem("sprites")) || [];
__soundEffects = JSON.parse(localStorage.getItem("soundEffects")) || [];

__palette = {
  0: "#000",
  1: "#9D9D9D",
  2: "#BE2633",
  3: "#E06F8B",
  4: "#493C2B",
  5: "#A46422",
  6: "#EB8931",
  7: "#F7E26B",
  8: "#2F484E",
  9: "#44891A",
  a: "#A3CE27",
  b: "#1B2632",
  c: "#005784",
  d: "#31A2F2",
  e: "#B2DCEF",
  f: "#fff",
};

NET = {
  // networking
  connect: (game_name, room_name = "lobby") => {
    try {
      partyConnect("wss://realtime.leady.in", game_name, room_name);
    } catch (e) {
      console.log(e.stack);
    }
  },
  isHost: () => partyIsHost(),
  // shared data
  getGlobal: (obj_name, initial_state = {}) =>
    partyLoadShared(obj_name, initial_state),
  setGlobal: (obj_name, data) => partySetShared(obj_name, data),
  getMy: (initial_state = {}) => partyLoadMyShared(initial_state),
  getOthers: () => partyLoadGuestShareds(),
  // events
  on: (event, callback) => partySubscribe(event, callback),
  emit: (event, data) => partyEmit(event, data),
  off: (event, callback) => partyUnsubscribe(event, callback),
};

// p5.js functions -------------------------------------------------------------

function preload() {
  if (__gloablsFN.length > 0) {
    try {
      const __globals = new Function(__gloablsFN);
      __globals.apply(this, window);
    } catch (e) {
      console.log(e.stack);
      Log(e.stack);
    }
  }
}

function setup() {
  _resizeCanvas();

  let font = loadFont("./ponderosa.regular.ttf", () => {
    //Monofett-Regular
    textSize(10);
    textFont(font);
  });

  // if (__setupFN.length == 0) return;
  // try {
  //   const __setup = new Function(__setupFN);
  //   __setup.apply(window);
  // } catch (e) {
  //   console.log(e);
  //   Log(e.stack);
  // }
}

function windowResized() {
  _resizeCanvas();
}

function draw() {
  if (__updateFN.length == 0) {
    background("#261010");
    textAlign(CENTER);
    fill("#D4CFD0");
    text("No code found", 64, 64);
  } else {
    background("#fff");
    // camera translate and zoom
    push();
    translate(__camera.x, __camera.y);
    scale(__camera.zoom);
    // fill("#D4CFD0");
    deltaTime = deltaTime / 1000;
    // call update
    if (__running) {
      try {
        const __update = new Function(__updateFN);
        __update.apply(this);
      } catch (e) {
        console.log(e.stack);
        Log(e.stack);
        __running = false;
      }
    }
    // reset keys buffer
    __pressedKeys = [];
    __pressedButtons = {
      A: false,
      B: false,
      SELECT: false,
      START: false,
    };
    pop();
  }
}

function mousePressed() {
  userStartAudio();
}

function keyPressed() {
  __pressedKeys[keyCode] = true;
  __heldKeys[keyCode] = true;

  // set joystick on arrow keys
  if (keyCode === LEFT_ARROW) __joystick.x = -100;
  if (keyCode === RIGHT_ARROW) __joystick.x = 100;
  if (keyCode === UP_ARROW) __joystick.y = -100;
  if (keyCode === DOWN_ARROW) __joystick.y = 100;

  // set buttons
  if (keyCode === 90) {
    __pressedButtons["A"] = true;
    __heldButtons["A"] = true;
  }
  if (keyCode === 88) {
    __pressedButtons["B"] = true;
    __heldButtons["B"] = true;
  }
  if (keyCode === 65) {
    __pressedButtons["SELECT"] = true;
    __heldButtons["SELECT"] = true;
  }
  if (keyCode === 83) {
    __pressedButtons["START"] = true;
    __heldButtons["START"] = true;
  }
}

function keyReleased() {
  __heldKeys[keyCode] = false;

  // set joystick on arrow keys
  if (keyCode === LEFT_ARROW && __joystick.x < 0) __joystick.x = 0;
  if (keyCode === RIGHT_ARROW && __joystick.x > 0) __joystick.x = 0;
  if (keyCode === UP_ARROW && __joystick.y < 0) __joystick.y = 0;
  if (keyCode === DOWN_ARROW && __joystick.y > 0) __joystick.y = 0;

  // set buttons
  if (keyCode === 90) {
    __pressedButtons["A"] = false;
    __heldButtons["A"] = false;
  }
  if (keyCode === 88) {
    __pressedButtons["B"] = false;
    __heldButtons["B"] = false;
  }
  if (keyCode === 65) {
    __pressedButtons["SELECT"] = false;
    __heldButtons["SELECT"] = false;
  }
  if (keyCode === 83) {
    __pressedButtons["START"] = false;
    __heldButtons["START"] = false;
  }
}

// Engine functions ------------------------------------------------------------

function getJoystick(dimension) {
  if (dimension === "x") {
    return Number(__joystick.x);
  }
  if (dimension === "y") {
    return Number(__joystick.y);
  }
  return {
    x: Number(__joystick.x),
    y: Number(__joystick.y),
  };
}

function input(keyCode) {
  return __pressedKeys[keyCode];
}

function inputDown(keyCode) {
  return __heldKeys[keyCode];
}

function buttonPressed(button) {
  return __pressedButtons[button];
}

function buttonReleased(button) {
  return __heldButtons[button];
}

function buttonDown(button) {
  return __heldButtons[button];
}

function setColor(color) {
  fill(_col(color));
  stroke(_col(color));
}

function bgColor(color) {
  background(_col(color));
}

function pixel(x, y, color) {
  noStroke();
  let c = _col(color);
  fill(c);
  square(x, y, 1);
}

function saveSprite(sprite, index) {
  __sprites[index] = sprite;
  localStorage.setItem("sprites", JSON.stringify(__sprites));
}

function getSprite(index, scale = 1) {
  let sprite = __sprites[index] || "";
  return spriteString(sprite, scale);
}

function createAnimation(frameFrom, frameTo, scale) {
  let frames = [];
  let currentFrame = 0;
  let frameDelay = 0;
  let onEnd = null;
  let loop = true;

  for (let i = frameFrom; i <= frameTo; i++) {
    frames.push(getSprite(i, scale));
  }
  return {
    frames,
    currentFrame,
    frameDelay,
    play: (x, y, speed) => {
      if (!frames.length) return;
      if (loop || (!loop && currentFrame < frames.length - 1)) {
        frameDelay += (speed || 1) * deltaTime;
      }
      if (frameDelay >= 1) {
        frameDelay = 0;
        currentFrame++;
        if (currentFrame == frames.length - 1) if (onEnd) onEnd();
        if (currentFrame > frames.length - 1) {
          if (loop) currentFrame = 0;
          else currentFrame = frames.length - 1;
        }
      }
      image(frames[currentFrame], x, y);
    },
    stop: () => {
      currentFrame = 0;
      frameDelay = 0;
    },
    pause: () => {
      frameDelay = 0;
    },
    onEnd: (fn) => {
      onEnd = fn;
    },
    loop: (val) => {
      loop = val;
    },
  };
}

function saveSFX(sfx, name) {
  let encoded = sfxr.b58encode(sfx);
  __soundEffects[name] = encoded;
  localStorage.setItem("soundEffects", JSON.stringify(__soundEffects));
}

function loadSFX(name) {
  if (__soundEffects[name] == null) throw new Error("Sound effect not found");
  return sfxr.toAudio(__soundEffects[name])
}



function addCollider(type, width, height) {
  // add a collider to the object calling this function
  if (type != "box" && type != "circle") {
    throw new Error("Invalid collider type");
  }
  this.collider = {
    type,
    width,
    height: height || width,
    onCollision: (object) => {
      if (object.collider == null) throw new Error("Object has no collider");
      if (this.collider.type == "circle" && object.collider.type == "circle") {
        return collideCircleCircle(
          this.x,
          this.y,
          this.collider.width,
          object.x,
          object.y,
          object.collider.width
        );
      }
      if (this.collider.type == "box" && object.collider.type == "circle") {
        return collideRectCircle(
          this.x,
          this.y,
          this.collider.width,
          this.collider.height,
          object.x,
          object.y,
          object.collider.width
        );
      }
      if (this.collider.type == "circle" && object.collider.type == "box") {
        return collideRectCircle(
          object.x,
          object.y,
          object.collider.width,
          object.collider.height,
          this.x,
          this.y,
          this.collider.width
        );
      }
      if (this.collider.type == "box" && object.collider.type == "box") {
        return collideRectRect(
          this.x,
          this.y,
          this.collider.width,
          this.collider.height,
          object.x,
          object.y,
          object.collider.width,
          object.collider.height
        );
      }
    },
  };
}

function createSoundTrack(bpm, notes) {
  // note format: "NoteOctave#duration_velocity" or "-" for pause
  let synth = new p5.PolySynth();
  let part = new p5.Part();
  let phrase = new p5.Phrase(
    "",
    (time, noteString) => {
      // console.log(time, noteString, bpm, bpm / 10);
      // if (noteString == "-") console.log("Pause");
      if (noteString != "-") {
        let [noteAndDuration, velocity = 10] = noteString.split("_");
        let [note, duration = 1] = noteAndDuration.split("#");
        synth.play(
          note,
          Number(velocity),
          time,
          Number(duration) / Number(bpm)
        );
      }
    },
    notes.split(" ")
  );

  part.addPhrase(phrase);
  part.setBPM(bpm);

  return {
    play: function () {
      part.start();
    },
    stop: function () {
      part.stop();
    },
  };
}

// Utils -----------------------------------------------------------------------

Log = (msg) => {
  // post to window
  console.log(msg);
  window.parent.postMessage({ type: "log", detail: msg }, "*");
};

function _resizeCanvas() {
  if (!__canvasCreated) {
    createCanvas(__gameSize, __gameSize);
    __canvasCreated = true;
  } else resizeCanvas(__gameSize, __gameSize);
  noSmooth();
}

function cameraSetPosition(x, y) {
  __camera.setPosition(x, y);
}

function cameraMove(x, y) {
  __camera.translate(x, y);
}

function cameraZoom(zoom) {
  __camera.scale(zoom);
}

function cameraSetZoom(zoom) {
  __camera.setScale(zoom);
}

function _col(c) {
  if (c instanceof p5.Color) return c;
  let clr = __palette[c];
  // if transparent
  if (clr === "" || c === "." || c === " ") {
    return color(0, 0, 0, 0);
  }
  return color(clr || c);
}

function getColor(c) {
  return _col(c);
}

function randomColor() {
  let keys = Object.keys(__palette);
  return __palette[keys[Math.floor(Math.random() * keys.length)]];
}

function spriteString(txt, scale = 1) {
  let lines = txt; // accepts 2D arrays of characters
  if (typeof txt == "string") {
    txt = txt.trim();
    txt = txt.replace(/\r*\n\t+/g, "\n"); // trim leading tabs
    txt = txt.replace(/\s+$/g, ""); // trim trailing whitespace
    lines = txt.split("\n");
  }
  let w = 0;
  for (let line of lines) {
    if (line.length > w) w = line.length;
  }
  let h = lines.length;
  let img = createImage(w * scale, h * scale);
  img.loadPixels();

  for (let i = 0; i < lines.length; i++) {
    for (let j = 0; j < lines[i].length; j++) {
      for (let sX = 0; sX < scale; sX++) {
        for (let sY = 0; sY < scale; sY++) {
          let c = _col(lines[i][j]);
          img.set(j * scale + sX, i * scale + sY, c);
        }
      }
    }
  }

  img.updatePixels();
  img.w = img.width;
  img.h = img.height;
  return img; // return the p5 graphics object
}

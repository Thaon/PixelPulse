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
__pressedButtons = [];
__heldButtons = [];

__joystick = { x: 0, y: 0 };

__code = localStorage.getItem("code");
if (!__code) {
  console.log("No code found");
  __code = `//globals//
//setup//
//update//`;
}
__gloablsFN = __code.split("//globals//")[1].split("//setup//")[0];
__setupFN = __code.split("//setup//")[1].split("//update//")[0];
__updateFN = __code.split("//update//")[1];

__sprites = JSON.parse(localStorage.getItem("sprites")) || [];

__palette = {
  a: "aqua",
  b: "black",
  c: "crimson",
  d: "darkviolet",
  e: "peachpuff",
  f: "olive",
  g: "green",
  h: "hotpink",
  i: "indigo",
  j: "navy",
  k: "khaki",
  l: "lime",
  m: "magenta",
  n: "brown",
  o: "orange",
  p: "pink",
  q: "turquoise",
  r: "red",
  s: "skyblue",
  t: "tan",
  u: "blue",
  v: "violet",
  w: "white",
  x: "gold",
  y: "yellow",
  z: "gray",
};

NET = {
  // networking
  connect: (game_name, room_name = "lobby") => {
    partyConnect("wss://realtime.leady.in", game_name, room_name);
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

// Utils -----------------------------------------------------------------------

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

function colorPal(c) {
  if (c instanceof p5.Color) return c;
  let clr = __palette[c];
  // if transparent
  if (clr === "" || c === "." || c === " ") {
    return color(0, 0, 0, 0);
  }
  return color(clr || c);
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
          let c = colorPal(lines[i][j]);
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

getJoystick = (dimension) => {
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
};

// p5.js functions -------------------------------------------------------------

function preload() {
  if (__gloablsFN.length > 0) {
    const __globals = new Function(__gloablsFN);
    __globals.apply(this, window);
  }
}

function setup() {
  _resizeCanvas();

  let font = loadFont("./ponderosa.regular.ttf", () => {
    //Monofett-Regular
    textSize(7);
    textFont(font);
  });

  if (__setupFN.length == 0) return;
  const __setup = new Function(__setupFN);
  __setup.apply(window);

  rectMode(CORNER);
  ellipseMode(CENTER);
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
    background("#212123");
    // camera translate and zoom
    push();
    translate(64 - __camera.x, 64 - __camera.y);
    scale(__camera.zoom);
    // fill("#D4CFD0");
    deltaTime = deltaTime / 1000;
    // call update
    const __update = new Function(__updateFN);
    __update.apply(this);
    // reset keys buffer
    __pressedKeys = [];
    __pressedButtons = [];
    pop();
  }
}

function keyPressed() {
  __pressedKeys[keyCode] = true;
  __heldKeys[keyCode] = true;
}

function buttonPressed(button) {
  return __pressedButtons[button];
}

function keyReleased() {
  __heldKeys[keyCode] = false;
}

function buttonReleased(button) {
  return __heldButtons[button];
}

function buttonDown(button) {
  return __heldButtons[button];
}

// Engine functions ------------------------------------------------------------

function input(keyCode) {
  return __pressedKeys[keyCode];
}

function char(letter, x, y) {
  text(letter, x, y);
}

function pixel(x, y, color) {
  noStroke();
  let c = colorPal(color);
  fill(c);
  square(x, y, 1);
}

function getSprite(index) {
  let sprite = __sprites[index] || "";
  return spriteString(sprite);
}

function createAnimation(frameFrom, frameTo) {
  let frames = [];
  let currentFrame = 0;
  let frameDelay = 0;
  let onEnd = null;
  let loop = true;

  for (let i = frameFrom; i <= frameTo; i++) {
    frames.push(getSprite(i));
  }
  return {
    frames,
    currentFrame,
    frameDelay,
    play: (x, y, speed) => {
      if (!frames.length) return;
      if (loop || (!loop && currentFrame < frames.length - 1)) {
        frameDelay += (speed || 1) * (deltaTime / 1000);
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
        // calculate distance between the two circles
        let distance = dist(this.x, this.y, object.x, object.y);
        return distance < this.collider.width / 2 + object.collider.width / 2;
      }
      if (this.collider.type == "box" && object.collider.type == "circle") {
        // calculate distance between the box and the circle
        let closestX = constrain(
          object.x,
          this.x,
          this.x + this.collider.width
        );
        let closestY = constrain(
          object.y,
          this.y,
          this.y + this.collider.height
        );
        let distance = dist(object.x, object.y, closestX, closestY);
        return distance < object.collider.width / 2;
      }
      if (this.collider.type == "circle" && object.collider.type == "box") {
        // calculate distance between the box and the circle
        let closestX = constrain(
          this.x,
          object.x,
          object.x + object.collider.width
        );
        let closestY = constrain(
          this.y,
          object.y,
          object.y + object.collider.height
        );
        let distance = dist(this.x, this.y, closestX, closestY);
        return distance < this.collider.width / 2;
      }
      if (this.collider.type == "box" && object.collider.type == "box") {
        return (
          this.x < object.x + object.collider.width &&
          this.x + this.collider.width > object.x &&
          this.y < object.y + object.collider.height &&
          this.y + this.collider.height > object.y
        );
      }
    },
  };
}

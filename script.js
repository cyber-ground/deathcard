'use strict';
import {console_color,console_red,console_orange,console_yellow,console_green,
  console_blue,console_purple,console_magenta,console_cyan} from './logColor.js';


//-------------------------------------------------------------------------------------
//*                            ----- DEATH CARD -----
//-------------------------------------------------------------------------------------

const container = document.querySelector('.container');
  const cards = document.querySelectorAll('.card');
    const backFaces = document.querySelectorAll('.back-face');
      const gameClearMessage = document.querySelector('.game-clear');
      const gameOverMessage = document.querySelector('.game-over');
    const startBtn = document.querySelector('.start-btn');
  const gaugesCounter = document.querySelector('.gauges-container');
    const circles = document.querySelectorAll('.unMatched-circle');
  const dots = document.querySelectorAll('.deathCount-circle');

  let firstCard, secondCard, iid_colored, rafId;
  let id_bgmHowl, tid_hauntedHowl, tid_unmatchedHowl;
  let tid_providenceHowl, tid_gameClearHowl;
  let [hasFlippedCard, lockBoard, gameStart] = [false, false, false]; 
  let [touch, startGame, entered] = [false, false, false];
  let [matched, unMatched, deathCount] = [0,0,0];   

  var bgmHowl = new Howl({src: ['mp3/bgm.mp3'], loop: true, volume: 0.1});
  var flipCardHowl = new Howl({src: ['mp3/flipCard.mp3'], volume: 0.5});
  var unmatchedHowl = new Howl({src: ['mp3/unmatched.mp3'], volume: 0.5});
  var matchedHowl = new Howl({src: ['mp3/matched.mp3'], volume: 1});
  var saviorHowl = new Howl({src: ['mp3/savior.mp3'], volume: 0.2});
  var guidanceHowl = new Howl({src: ['mp3/guidance.mp3'], volume: 0.2});
  var providenceHowl = new Howl({src: ['mp3/providence.mp3'], volume: 0.3});
  var gameClearHowl = new Howl({src: ['mp3/gameClear.mp3'], volume: 0.3});
  var badOmenHowl = new Howl({src: ['mp3/badOmen.mp3'], volume: 0.3});
  var deathHowl = new Howl({src: ['mp3/death.mp3'], volume: 0.5});
  var prologueHowl = new Howl({src: ['mp3/prologue.mp3'], volume: 1});
  var gameOverHowl = new Howl({src: ['mp3/gameOver.mp3'], volume: 0.3});
  var hauntedHowl = new Howl({src: ['mp3/haunted.mp3'], volume: 0.3});
  var timelineHowl = new Howl({src: ['mp3/timeline.mp3'], loop: true, volume: 1});

  const targetHowls = [bgmHowl, flipCardHowl, unmatchedHowl, saviorHowl, guidanceHowl, providenceHowl, gameClearHowl, badOmenHowl, deathHowl, prologueHowl, gameOverHowl, hauntedHowl, timelineHowl];

  let iid_howl = setInterval(() => { 
    if(getLoadingState()) {
      btnEnter.classList.add('visible');
      clearInterval(iid_howl);
    } 
  }, 100);

  function getLoadingState() {
    let loadingState = true;
    targetHowls.forEach(howl => {
      loadingState = loadingState && howl._state === 'loaded';
    });
    return loadingState;
  }

const mobile = navigator.userAgent.match(/iPhone|Android.+Mobile/);
let portrait = window.matchMedia('(orientation: portrait)').matches;
let defaultHeight;
let menubar;  

if(portrait) { defaultHeight = innerHeight}
else { defaultHeight = innerWidth}

//* touch Callout Prevention Events ---------------------

function evtPreventDefault() {
  container.addEventListener('touchstart', e => e.preventDefault());
  cards.forEach(card => {
    card.addEventListener('touchstart', e => e.preventDefault());
  });
}

gameClearMessage.addEventListener('touchstart', e => e.preventDefault());
gameOverMessage.addEventListener('touchstart', e => e.preventDefault());

startBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  startBtn.click();
});

  const imgs = document.querySelectorAll('img');
imgs.forEach(img => {
  img.addEventListener('touchstart', (e) => {
    if(startGame) {
      if(!touch) { touch = true; e.stopPropagation();}
    }
  });
  img.addEventListener('mousedown', () => {
    img.style.pointerEvents = 'none';
    setTimeout(() => { img.style.pointerEvents = 'all'}, 500);
  });
  img.addEventListener('touchend', () => {
    setTimeout(() => { touch = false}, 150);
  });
});

//* startBtn & event ---------------------------------

  startBtn.classList.add('visible'); //*>
startBtn.addEventListener('click', function () {
  id_bgmHowl = bgmHowl.play();
  startBtn.classList.remove('visible');
  startBtn.classList.add('active');
  cards.forEach(card => {card.addEventListener('click', flipCard)});
  if(gameStart) {
    clearInterval(iid_colored); clearTimeout(tid_hauntedHowl);
    clearTimeout(tid_providenceHowl); clearTimeout(tid_gameClearHowl);
    gameClearHowl.stop(); gameOverHowl.stop(); hauntedHowl.stop();
    backFaces.forEach(backFace => backFace.classList.remove('black'));
    circles.forEach(circle => circle.classList.remove('activeCircle'));
    dots.forEach(dot => dot.classList.remove('activeCircle'));
    setTimeout(() => { shuffleCards(); colored()}, 500);
    gameClearMessage.classList.remove('visible');
    gameOverMessage.classList.remove('visible');
    cards.forEach(card => {
      card.style.transform = '';
      card.classList.remove('flip');
      card.style.pointerEvents = 'initial';
    });
    [hasFlippedCard, lockBoard] = [false, false]; 
    [matched, unMatched, deathCount] = [0,0,0];
  } else { setTimeout(() => { timelineHowl.stop()}, 500)}
  [gameStart, startGame] = [true, true]; //*startGameForTouch
});

function flipCard() {
  if(lockBoard) return;            
  if(this === firstCard) return;
  if(gameStart) { evtPreventDefault()}     
  this.classList.add('flip');
  this.style.pointerEvents = 'none'; //* forTouch
  flipCardHowl.play();
  if(!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    firstCardAngelFlip(); 
    firstCardDeathFlip(); 
  } else {
    hasFlippedCard = false;
    secondCard = this;
    checkForMatch();
    secondCardDeathFlip(); 
  }
}

//* check for match & unmatched ------------

function checkForMatch() {
  let isMatch = firstCard.dataset.framework === 
    secondCard.dataset.framework;
  isMatch ? matchedCards() : unMatchedCards();
}

function matchedCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  setTimeout(() => { matchedHowl.play()}, 500);
  matched++;
    unMatched--; 
    if(unMatched <= 0) { unMatched = 0}
    circles[unMatched].classList.remove('activeCircle');
  deathCount--; 
  if(deathCount <= 0) { deathCount = 0}
  dots[deathCount].classList.remove('activeCircle'); 
    gameClear();
  // console.log('card-matched = ' + matched); //* log
  // console.log('matched-release-deathCount = ' + deathCount); //* log
  // console.log('matched-release-unMatched =  ' + unMatched); //* log
}

function unMatchedCards() {
  lockBoard = true;
  tid_unmatchedHowl = setTimeout(() => { unmatchedHowl.play()}, 1000);
  if(secondCard.dataset.framework === 'angel') { guidanceHowl.play()}
  setTimeout(() => {
    firstCard.classList.remove('flip'); 
    secondCard.classList.remove('flip'); 
    firstCard.style.pointerEvents = 'initial'; //*
    secondCard.style.pointerEvents = 'initial'; //*
    lockBoard = false;
    firstCard = null;
    unMatched++; 
    if(unMatched === 1) { 
      circles[0].classList.add('activeCircle');
    } 
    circles[unMatched - 1].classList.add('activeCircle'); 
    secondCardAngelFlip(); 
    gameOverCounter();
  }, 1000);
  // console.log('unmatched card = ' + unMatched); //* log
}

//* death --------------------------------------

function firstCardDeathFlip() {
  if(firstCard.dataset.framework === 'death card') {
    lockBoard = true;
    deathCount++; 
    deathCardHowl();
    if(deathCount === 1) {
      dots[0].classList.add('activeCircle');
    } 
    dots[deathCount - 1].classList.add('activeCircle'); 
    deathCountCounter();
    setTimeout(() => {
      firstCard.classList.remove('flip');
      firstCard.style.pointerEvents = 'initial'; //*
      [hasFlippedCard, lockBoard] = [false, false]; 
      firstCard = null;
    }, 1000);
    setTimeout(() => { replaceColored()}, 1000);
    setTimeout(() => { colored(); shuffleCards()}, 1500);
    // console.log('deathCount = ' + deathCount); //* log
  }
}

function deathCardHowl() {
  if(deathCount > 1) { setTimeout(() => deathHowl.play(), 500)} 
  else { setTimeout(() => badOmenHowl.play(), 500)}
}

function secondCardDeathFlip() {
  if(secondCard.dataset.framework === 'death card') {
    deathCount++;
    deathCardHowl();
    if(deathCount === 1) {
      dots[0].classList.add('activeCircle');
    } 
    dots[deathCount - 1].classList.add('activeCircle');
    deathCountCounter();
    setTimeout(() => { colored(); shuffleCards()}, 1500);
    // console.log('deathCount = ' + deathCount); //* log
  }
}

function deathCountCounter() {
  if(deathCount >= 2) { 
    if(firstCard.dataset.framework === 'death card') {
      firstCard.style.transform = 'rotateY(180deg) rotateX(50deg)'; 
    } else {
      firstCard.style.transform = 'rotateY(180deg) rotateX(50deg)';
      secondCard.style.transform = 'rotateY(180deg) rotateX(50deg)';
    }
    abortOnceShuffleCards();
    setTimeout(() => gameOver(), 600);
  }; 
}

//* game play messages -----------------------

function gameClear() {
  if(matched === cards.length / 2 - 1) {
    disableCards();
    startGame = false;
    firstCard = null;
    bgmHowl.fade(0.1, 0, 1000, id_bgmHowl);
    setTimeout(() => { gameClearMessage.classList.add('visible')}, 500);
    setTimeout(() => startBtn.classList.add('visible'), 3500);
    tid_gameClearHowl = setTimeout(() => { gameClearHowl.play()}, 5500);
    tid_providenceHowl = setTimeout(() => { let id_providenceHowl = providenceHowl.play(); 
      providenceHowl.fade(0.3, 0, 7800, id_providenceHowl) 
    }, 800);
  }
}

function gameOver() {
  disableCards();
  startGame = false;
  clearTimeout(tid_unmatchedHowl);
  bgmHowl.fade(0.1, 0, 2000, id_bgmHowl);
  gameOverMessage.classList.add('visible');
  if(deathCount <= 1) {
    prologueHowl.play();
    setTimeout(() => gameOverHowl.play(), 1800);
  } else { 
    setTimeout(() => gameOverHowl.play(), 900); 
    tid_hauntedHowl = setTimeout(() => hauntedHowl.play(), 17700);
  }
  setTimeout(() => iid_colored = setInterval(() => colored(), 800), 500);
  setTimeout(() => startBtn.classList.add('visible'), 3500);
}

function gameOverCounter() {   
  if(unMatched === 8 && deathCount !== 2) {  
    gameOver();                 
  }                                                             
}

function disableCards() {
  cards.forEach(card => {
    card.removeEventListener('click', flipCard);
  });
} 

//* angel ------------------------------------------

function firstCardAngelFlip() { 
  if(firstCard.dataset.framework === 'angel') {
    lockBoard = true;
    setTimeout(() => saviorHowl.play(), 300);
    setTimeout(() => {
      firstCard.classList.remove('flip');
      firstCard.style.pointerEvents = 'initial'; //*
      firstCard = null;
      hasFlippedCard = false; 
      setTimeout(() => {
        replaceColored();
        shuffleCards();
        lockBoard = false;
      }, 500);
    }, 1000);
    deathCount--;
    if(deathCount <= 0) {deathCount = 0}
    dots[deathCount].classList.remove('activeCircle'); // release deathCount  
    if(unMatched <= 0) {unMatched = 0}
      gaugesResetter();
    // console.log('angel-release-unMatched = ' + unMatched); //* log
    // console.log('angel-release-deathCount = ' + deathCount); //* log
  }
}

function secondCardAngelFlip() { 
  if(secondCard.dataset.framework === 'angel') {
    unMatched--;
    circles[unMatched].classList.remove('activeCircle');
    // console.log('angel-released-unMatched = ' + unMatched); //* log
  }
}

function gaugesResetter() {
  circles.forEach(circle => { 
    circle.classList.remove('activeCircle');
  });
  switch(unMatched) {  
    case 7: case 6: case 5: case 4: case 3:
      unMatched = unMatched - 3;
      activeCircleAdd(); break;
    case 2:
      unMatched = unMatched - 2;
      activeCircleAdd(); break;
    case 1:
      unMatched = unMatched - 1;
    activeCircleAdd(); break;
  }  

  function activeCircleAdd() {
    for (let i = 0; i < unMatched; i++) {  
      circles[i].classList.add('activeCircle');
    } 
  }
} 

//* colored ------------------------------------------

function colored() {
  const num = [];
  for (let i = 0; i < cards.length; i++) {
    num[i] = i;
  }
  const colorOne = 
  num.splice(Math.floor(Math.random() * num.length), 1)[0];
  const colorTwo = 
  num.splice(Math.floor(Math.random() * num.length), 1)[0];
  backFaces[colorOne].classList.add('black');
  backFaces[colorTwo].classList.add('black');
} colored();

function resetColored() {
  backFaces.forEach(backFace => {
    backFace.classList.remove('black');
  });
}

function replaceColored() {
  let coloredCount = 0;
  backFaces.forEach(backFace => {
    if(backFace.classList.contains('black')) {
      coloredCount++;
    }
  }); resetColored();
    const Length = Math.floor(coloredCount/2);
  for (let i = 0; i < Length; i++) { colored()}
}

function abortOnceShuffleCards() {
  let temp = shuffleCards;
  shuffleCards = function () {
    shuffleCards = temp;
  }
}

// ------------------------------------------

function abortShuffleCards() {
  shuffleCards = function () {
    shuffleCards = null;
  }
}

function abortColored() {
  colored = function () {
    colored = null;
  }
} 

//* shuffle ---------------------------------------------------

function shuffleCards() {
  const number = [];
  for (let i = 0; i < cards.length; i++) {
    number[i] = i;
    // console.log(number); //* log
  }
  number.sort(value => { return  0.5 - Math.random()});
  // console.log(number); //* log
  cards.forEach(card => {
    const orderNumber = 
    number.splice(Math.floor(Math.random() * number.length), 1);
    card.style.order = orderNumber;
    // console.log(orderNumber); //* log
  });
}
shuffleCards();

//------------------------------------------------------
//* shuffle 1. ---

// (function shuffleCards() {
//   const number = [];
//   for (let i = 0; i < cards.length; i++) {
//     number[i] = i;
//   } console.log(number);
//   cards.forEach(card => {
//     card.style.order = number.sort(value => {
//       return 0.5 - Math.random();
//     })[0]; console.log(number);
//   });
// })();

//------------------------------------------------------
//* shuffle 2. ---

// (function shuffleCards() {
//   cards.forEach(card => {
//     const randomNumber = Math.floor(Math.random() * cards.length);
//     card.style.order = randomNumber;
//   });
// })();

//* splashScreen & btnEnter ------------------------------

  const splashScreen = document.querySelector('.splash-screen');
    splashScreen.addEventListener('touchstart', e => e.preventDefault());
  const btnEnter = document.querySelector('.btnEnter');

  btnEnter.addEventListener('touchstart', (e) => {
    if(touch) { e.preventDefault()}
  });

  btnEnter.addEventListener('touchend', (e) => {
    touch = true;
    setTimeout(() => {
      if(!btnEnter.classList.contains('inactive')) {
        touch = false;
      }
    }, 500);
  });

  btnEnter.addEventListener('click', () => {
    if(!entered) { entered = true;
      document.body.classList.add('active');
      timeline();
    }
  });

  function timeline() {
    setTimeout(() => { canvas.classList.add('activate'); animate()}, 2000); //*
    let fadeId = timelineHowl.play();
    timelineHowl.fade(0.5, 0, 9000, fadeId);
    setTimeout(() => {
      btnEnter.classList.add('inactive');
      splashScreen.classList.add('transfigure');
      btnEnter.addEventListener('transitionend', () => btnEnter.remove());
    }, 0);
    setTimeout(() => { cancelAnimationFrame(rafId)}, 7500);
    setTimeout(() => {
      startBtn.classList.add('activate');
      gaugesCounter.classList.add('activate');
      container.classList.add('activate');
      splashScreen.classList.add('inactive');
      splashScreen.addEventListener('animationend', () => splashScreen.remove());
      document.body.classList.remove('active');
      setTimeout(() => { startBtn.click()}, 0);
      canvas.remove();
    }, 8000);
  }

//* canvas ------------------------------------------------------------------------

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d', { willReadFrequently: true});
  let width = getComputedStyle(splashScreen).width;
  let height = getComputedStyle(splashScreen).height;
    canvas.width = parseFloat(width.slice(0,-2));
    canvas.height = parseFloat(height.slice(0,-2));
  

class Drip {
  constructor(effect) {
    this.effect = effect;
    this.x = this.effect.width * 0.5;
    this.y = this.effect.height * 0.5;
    this.radius = Math.random() * 80 + 10; //bc40
    this.vx = (Math.random() - 0.5) * 20;
    this.vy = (Math.random() - 0.5) * 8; //bc20
    this.ease = 0.9;
    this.friction = 0.8;
    this.color = '#f00';
    //* dripping effect ---
    this.y = -this.radius;
    this.gv = Math.random() * 0.0005;
    this.gravity = 0;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
    ctx.fill();
  }
  wallDetect() {
    //* dripping effect ---
    if(this.x > this.effect.width - this.radius
      || this.x < this.radius) { this.vx *= -1 * this.friction}
    // if(this.y > this.effect.height + this.radius) {
    //   this.y = -this.radius;
    //   this.gravity = 0;
    //   this.vy = Math.random()/4 + .05;
    // }
  }
  update() {
    this.wallDetect();
    //* dripping effect ---
    if(this.y > this.radius) {
      this.gravity += this.gv;
      this.vy += this.gravity;
    }
    this.x += this.vx;
    this.y += this.vy;
  }
  reposition() {
    const px = this.x + this.radius;
    const py = this.y + this.radius;
    if(px > this.effect.width) { this.x += -100}
    if(py > this.effect.height) { this.y += -100}
  }
}

class Effect {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.drips = [];
  }
  init(amount) {
    for (let i = 0; i < amount; i++) {
      this.drips.push(new Drip(this));
    }
  }
  draw(ctx) {
    this.drips.forEach(drip => { drip.draw(ctx)});
  }
  update() {
    this.drips.forEach(drip => { drip.update()});
  }
  resize(newWidth, newHeight) {
    this.width = newWidth;
    this.height = newHeight;
    this.drips.forEach(drip => { drip.reposition()});
  }
}

const effect = new Effect(canvas.width, canvas.height);
  if(mobile) { effect.init(30)}
    else { effect.init(80)}

  function animate() {
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    // ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.draw(ctx);
    effect.update();
    rafId = requestAnimationFrame(animate);
  } 

  window.addEventListener('resize', () => {
    width = getComputedStyle(splashScreen).width;
    height = getComputedStyle(splashScreen).height;
    canvas.width = parseFloat(width.slice(0,-2));
    canvas.height = parseFloat(height.slice(0,-2));
    effect.resize(canvas.width, canvas.height);
    if(mobile) { detectViewport()}
  });

  function detectViewport() { 
    if(portrait) {
      if(innerHeight > defaultHeight) {
        menubar = false;
        splashScreen.classList.add('menubarHidden');
        // btnEnter.style.color = "#0f0"; 
      } else if(innerHeight === defaultHeight) { 
        menubar = true;
        splashScreen.classList.remove('menubarHidden');
        // btnEnter.style.color = "#f00";
      }
    } 
    falseOrientation();
  } detectViewport();
  
  function falseOrientation() {
    if(!portrait) {
      if(innerHeight > defaultHeight) {
        menubar = false;
        splashScreen.classList.add('menubarHidden');
        // btnEnter.style.color = "#0af";
      } else if(innerHeight < defaultHeight) { 
        menubar = true;
        splashScreen.classList.remove('menubarHidden');
        // btnEnter.style.color = "#f0f";
      }
      if(menubar) {
        portrait = window.matchMedia('(orientation: portrait)').matches;
        if(portrait) { defaultHeight = innerHeight}
      }
    } 
  }

//---------------------------------------------------------------------------------------------------

































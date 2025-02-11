'use strict';
import {console_color,console_red,console_orange,console_yellow,console_green,
  console_blue,console_purple,console_magenta,console_cyan} from './logColor.js';


//---------------------------------------------------------------------------------------------------
//*                                     ----- DEATH CARD -----
//---------------------------------------------------------------------------------------------------

  const container = document.querySelector('.container');
const cards = document.querySelectorAll('.card');
  const backFaces = document.querySelectorAll('.back-face');
    const gameClearMessage = document.querySelector('.game-clear');
      const gameOverMessage = document.querySelector('.game-over');
    const startBtn = document.querySelector('.start-btn');
  const circles = document.querySelectorAll('.unMatched-circle');
const dots = document.querySelectorAll('.deathCount-circle');

let firstCard, secondCard;
  let hasFlippedCard = false; 
    let lockBoard = false;
  let gameStart = false;
  let touch = false;
  let startGame = false;
  let matched = 0;
  let unMatched = 0;
  let deathCount = 0;
  let tid_unmatchedHowl; 
  let tid_hauntedHowl;
  let iid_colored;
  let id_bgmHowl;

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

//* touchCalloutPreventionEvents ---
container.addEventListener('touchstart', e => e.preventDefault());
cards.forEach(card => {
  card.addEventListener('touchstart', e => e.preventDefault());
});
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
      if(!touch) { touch = true; e.stopPropagation()}
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

//* --------------------------------------------------------
//* game start & flip card ---

  startBtn.classList.add('js_visible'); //*>
startBtn.addEventListener('click', function () {
  id_bgmHowl = bgmHowl.play();
  startBtn.classList.remove('js_visible');
  startBtn.classList.add('active');
  cards.forEach(card => {card.addEventListener('click', flipCard)});
  if(gameStart) {
    clearInterval(iid_colored);
    clearTimeout(tid_hauntedHowl);
    gameClearHowl.stop(); gameOverHowl.stop(); hauntedHowl.stop();
    backFaces.forEach(backFace => backFace.classList.remove('js_black'));
    circles.forEach(circle => circle.classList.remove('js_activeCircle'));
    dots.forEach(dot => dot.classList.remove('js_activeCircle'));
    setTimeout(() => { shuffleCards(); colored()}, 500);
    gameClearMessage.classList.remove('js_visible');
    gameOverMessage.classList.remove('js_visible');
    cards.forEach(card => {
      card.style.transform = '';
      card.classList.remove('js_flip');
    });
    hasFlippedCard = false; 
    lockBoard = false;
    matched = 0;
    unMatched = 0;
    deathCount = 0;
  }
  gameStart = true; //*
  startGame = true; //* forTouch
});

function flipCard() {
  if(lockBoard) return;            
  if(this === firstCard) return;     
  this.classList.add('js_flip');
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

//------------------------------------------
//* check for match & unmatched ---

function checkForMatch() {
  let isMatch = firstCard.dataset.framework === 
    secondCard.dataset.framework;
  isMatch ? matchedCards() : unMatchedCards();
}

function matchedCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  setTimeout(() => {matchedHowl.play()}, 500);
  matched++;
    unMatched--; 
    if(unMatched <= 0) {unMatched = 0}
    circles[unMatched].classList.remove('js_activeCircle');
  deathCount--; 
  if(deathCount <= 0) {deathCount = 0}
  dots[deathCount].classList.remove('js_activeCircle'); 
    gameClear();
  // console.log('card-matched = ' + matched); //* log
  // console.log('matched-release-deathCount = ' + deathCount); //* log
  // console.log('matched-release-unMatched =  ' + unMatched); //* log
}

function unMatchedCards() {
  lockBoard = true;
  tid_unmatchedHowl = setTimeout(() => { unmatchedHowl.play() }, 1000);
  if(secondCard.dataset.framework === 'angel') { guidanceHowl.play()}
  setTimeout(() => {
    firstCard.classList.remove('js_flip'); 
    secondCard.classList.remove('js_flip'); 
    lockBoard = false;
    firstCard = null;
    unMatched++; 
    if(unMatched === 1) { 
      circles[0].classList.add('js_activeCircle');
    } 
    circles[unMatched - 1].classList.add('js_activeCircle'); 
    secondCardAngelFlip(); 
    gameOverCounter();
  }, 1000);
  // console.log('unmatched card = ' + unMatched); //* log
}

//------------------------------------------
//* death flipped actions ---

function firstCardDeathFlip() {
  if(firstCard.dataset.framework === 'death card') {
    lockBoard = true;
    deathCount++; 
    deathCardHowl();
    if(deathCount === 1) {
      dots[0].classList.add('js_activeCircle');
    } 
    dots[deathCount - 1].classList.add('js_activeCircle'); 
    deathCountCounter();
    setTimeout(() => {
      firstCard.classList.remove('js_flip');
      lockBoard = false;
      firstCard = null;
      hasFlippedCard = false; 
    }, 1000);
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
      dots[0].classList.add('js_activeCircle');
    } 
    dots[deathCount - 1].classList.add('js_activeCircle');
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

//------------------------------------------
//* game play messages ---

function gameClear() {
  if(matched === cards.length / 2 - 1) {
    disableCards();
    startGame = false;
    firstCard = null;
    bgmHowl.fade(0.1, 0, 1000, id_bgmHowl);
    setTimeout(() => { gameClearMessage.classList.add('js_visible')}, 500);
    setTimeout(() => startBtn.classList.add('js_visible'), 3500);
    setTimeout(() => { gameClearHowl.play()}, 5500);
    setTimeout(() => { let id_providenceHowl = providenceHowl.play(); 
      providenceHowl.fade(0.3, 0, 7800, id_providenceHowl) 
    }, 800);
  }
}

function gameOver() {
  disableCards();
  startGame = false;
  clearTimeout(tid_unmatchedHowl);
  bgmHowl.fade(0.1, 0, 2000, id_bgmHowl);
  gameOverMessage.classList.add('js_visible');
  if(deathCount <= 1) {
    prologueHowl.play();
    setTimeout(() => gameOverHowl.play(), 1800);
  } else { 
    setTimeout(() => gameOverHowl.play(), 900); 
    tid_hauntedHowl = setTimeout(() => hauntedHowl.play(), 17700);
  }
  setTimeout(() => iid_colored = setInterval(() => colored(), 800), 500);
  setTimeout(() => startBtn.classList.add('js_visible'), 3500);
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

//------------------------------------------
//* angel actions ---

function firstCardAngelFlip() { 
  if(firstCard.dataset.framework === 'angel') {
    lockBoard = true;
    setTimeout(() => saviorHowl.play(), 300);
    setTimeout(() => {
      firstCard.classList.remove('js_flip');
      firstCard = null;
      hasFlippedCard = false; 
      setTimeout(() => {
        for (let i = 0; i < cards.length; i++) {
          backFaces[i].classList.remove('js_black');
          backFaces[i].classList.remove('js_black');
        }
        colored();
        shuffleCards();
        lockBoard = false;
      }, 500);
    }, 1000);
    deathCount--;
    if(deathCount <= 0) {deathCount = 0}
    dots[deathCount].classList.remove('js_activeCircle'); // release deathCount  
    if(unMatched <= 0) {unMatched = 0}
      gaugesResetter();
    // console.log('angel-release-unMatched = ' + unMatched); //* log
    // console.log('angel-release-deathCount = ' + deathCount); //* log
  }
}

function secondCardAngelFlip() { 
  if(secondCard.dataset.framework === 'angel') {
    unMatched--;
    circles[unMatched].classList.remove('js_activeCircle');
    // console.log('angel-released-unMatched = ' + unMatched); //* log
  }
}

function gaugesResetter() {
  circles.forEach(circle => { 
    circle.classList.remove('js_activeCircle');
  }); 
  switch(unMatched) {  
    case 7: case 6: case 5: case 4: case 3:
      unMatched = unMatched - 3;
      activeCircleAdd();
      break;
    case 2:
      unMatched = unMatched - 2;
      activeCircleAdd();
      break;
    case 1:
      unMatched = unMatched - 1;
      activeCircleAdd();
      break;
  }  

  function activeCircleAdd() {
    for (let i = 0; i < unMatched; i++) {  
      circles[i].classList.add('js_activeCircle');
    } 
  }
}

//------------------------------------------
//* colored ---

function colored() {
  const num = [];
  for (let i = 0; i < cards.length; i++) {
    num[i] = i;
  }
  const colorOne = 
  num.splice(Math.floor(Math.random() * num.length), 1)[0];
  const colorTwo = 
  num.splice(Math.floor(Math.random() * num.length), 1)[0];
  backFaces[colorOne].classList.add('js_black');
  backFaces[colorTwo].classList.add('js_black');
} colored();

function abortOnceShuffleCards() {
  let temp = shuffleCards;
  shuffleCards = function () {
    shuffleCards = temp;
  }
}

//------------------------------------------

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

//------------------------------------------
//* shuffle 1. ---

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
//* shuffle 2. ---

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
//* shuffle 3. ---

// (function shuffleCards() {
//   cards.forEach(card => {
//     const randomNumber = Math.floor(Math.random() * cards.length);
//     card.style.order = randomNumber;
//   });
// })();

//--------------------------------------------------------------------------

//------------------------------------------------------------------------------
//---------------------------------------------------------------------------
// この console.log で取得される 要素の概念は 重要参考例になっている!!
// function disableCards() {
//   firstCard.removeEventListener('click', flipCard);
//   secondCard.removeEventListener('click', flipCard);
//   // console.log(firstCard.children[0].src); // match要素のsrc取得
//   // console.log(secondCard);
//   gameClear();
// }
//---------------------------------------------------------------------------
//------------------------------------------------------------------------------
// console.log ---

// 1. Hit-deathFlipped = 1 first clicked で death card を引いた カウント;
// 1. Hit-deathFlipped = 2  二連続で death card を引いたら 即GAME OVER

// 3. release-deathFlipped = 0  二連続で death card を引かず カウントがリセット;

// 4. card-matched =  ;  引いたカードが matched 揃ったカウント;
// 引いたカードが matched で deathCount-- と unMatched-- となる; 
// matched-release-deathFlip =  ;
// matched-release-deathCount =  ;
// matched-release-unMatched =   ;

// 5. deathCount =  ;  2枚目に引いたカードが death card のカウント;
// 今現在は deathCount = 6 で GAME OVER;

// 6. unMatched =  ;  引いたカードが 不揃いだった カウント;
// 今現在は unMatched = 10 で GAME OVER;


//---------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------------------------

// before Modify ---
// function colored() {
//   const num = [];
//   for (let i = 0; i < cards.length; i++) {
//     num[i] = i;
//   }
//   const colorOne = 
//   num.splice(Math.floor(Math.random() * num.length), 1)[0];
//   const colorTwo = 
//   num.splice(Math.floor(Math.random() * num.length), 1)[0];
//     backFaces[colorOne].classList.add('js_black');
//     backFaces[colorTwo].classList.add('js_black');
//   // cancel用 使う時は一番上に //
//   // for (let i = 0; i < cards.length; i++) {
//   //   backFaces[i].classList.remove('js_black');
//   //   backFaces[i].classList.remove('js_black');
//   // }
//   // backFaces.forEach(backFace => {
//   //   backFace.classList.remove('js_black');
//   //   backFace.classList.remove('js_black');
//   // });
//   // console.log(colorOne);
//   // console.log(colorTwo);
// }
// colored();

//---------------------------------------------------------------------------------------------------




















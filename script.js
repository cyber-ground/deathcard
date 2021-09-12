'use strict';



//---------------------------------------------------------------------------------------------------

//                                     ----- DEATH CARD -----
//---------------------------------------------------------------------------------------------------


const cards = document.querySelectorAll('.memory-card');
  const backFaces = document.querySelectorAll('.back-face');
  const gameClearMessage = document.querySelector('.game-clear');
    const gameOverMessage = document.querySelector('.game-over');
      const startBtn = document.querySelector('.start-btn');
      const angel = document.querySelector('.angel');
    const death = document.querySelector('.death');
  const circles = document.querySelectorAll('.unMatched-circle');
const dots = document.querySelectorAll('.deathCount-circle');

let firstCard, secondCard;
  let hasFlippedCard = false; 
    let lockBoard = false;
    let matched = 0;
  let unMatched = 0;
let deathCount = 0;


//------------------------------------------
// events ---

  cards.forEach(card => {
    card.addEventListener('click', flipCard);
  });

  startBtn.addEventListener('click', function () {
    window.location.reload();
  });
  
//------------------------------------------
// card flip actions ---

function flipCard() {
    if(lockBoard) return;            
    if(this === firstCard) return;     
  this.classList.add('js_flip');
  if(!hasFlippedCard) {
    hasFlippedCard = true;
    firstCard = this;
    angelFlipped(); 
    firstCardDeathFlip(); 
  } else {
    hasFlippedCard = false;
    secondCard = this;
    checkForMatch();
    secondCardDeathFlipped(); 
  }
}

//------------------------------------------
// check card match actions ---

function checkForMatch() {
  let isMatch = firstCard.dataset.framework === 
    secondCard.dataset.framework;
  isMatch ? matchedCards() : unMatchedCards();
}

function matchedCards() {
  firstCard.removeEventListener('click', flipCard);
  secondCard.removeEventListener('click', flipCard);
  matched++;
    unMatched--; 
    if(unMatched <= 0) {unMatched = 0}
    circles[unMatched].classList.remove('js_activeCircle');
  deathCount--; 
  if(deathCount <= 0) {deathCount = 0}
  dots[deathCount].classList.remove('js_activeCircle'); 
    gameClear();
  console.log('card-matched = ' + matched); // console.log
  console.log('matched-release-deathCount = ' + deathCount);
  console.log('matched-release-unMatched =  ' + unMatched);
}

function unMatchedCards() {
  lockBoard = true;
  setTimeout(() => {
    firstCard.classList.remove('js_flip'); 
    secondCard.classList.remove('js_flip'); 
      lockBoard = false;
      firstCard = null;
    unMatched++; 
    if(unMatched === 1) { // angel release 3 version
      circles[0].classList.add('js_activeCircle');
    } 
    circles[unMatched - 1].classList.add('js_activeCircle'); // angel release 3 version
    angelRelease(); 
    gameOverCounter();
  }, 1000);  // unflip speed 1500 
  console.log('unmatched card = ' + unMatched); // console.log
}

//------------------------------------------
// death flipped actions ---

function firstCardDeathFlip() {
  if(firstCard.dataset.framework === 'death card') {
    lockBoard = true;
    deathCount++; 
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
      setTimeout(() => {
        colored();
        shuffleCards();
      }, 500);
    }, 1000);
    console.log('deathCount = ' + deathCount); // console.log
  }
}

function secondCardDeathFlipped() {
  if(secondCard.dataset.framework === 'death card') {
    deathCount++;
  if(deathCount === 1) {
    dots[0].classList.add('js_activeCircle');
  } 
    dots[deathCount - 1].classList.add('js_activeCircle'); 
    deathCountCounter();
  setTimeout(() => {
    colored(); /////////
    shuffleCards();
  }, 1500); // または0 unflip
    console.log('deathCount = ' + deathCount); // console.log
  }
}

function deathCountCounter() {
  if(deathCount >= 2) { 
    if(firstCard.dataset.framework === 'death card') {
      firstCard.style.transform = 'rotateY(180deg) rotateX(50deg)'; 
    } else {
      firstCard.style.transform = 'rotateY(180deg) rotateX(50deg)'; // 考慮中!
      secondCard.style.transform = 'rotateY(180deg) rotateX(50deg)';
    }
    abortShuffleCards();
    setTimeout(() => {
      gameOver(); 
    }, 600);
  }; 
}

//------------------------------------------
// game play messages ---

function gameClear() {
  if(matched === cards.length / 2 - 1) {  
    setTimeout(() => {                      
      gameClearMessage.classList.add('js_displayBlock');
      disableCards();
      setTimeout(() => {
        startBtn.classList.add('js_displayBlock');
      }, 3000);
    }, 500);
  }
}

function gameOver() {
  gameOverMessage.classList.add('js_displayBlock');                                
  disableCards();    
  setTimeout(() => {
    colored(); 
      setInterval(() => { 
        colored(); 
      setTimeout(() => {
        startBtn.classList.add('js_displayBlock');                                                
      }, 3000);  // before change 5000
    }, 300);
  }, 500);
}

function gameOverCounter() {   
  if(unMatched === 8) {  
    gameOver();                     
  }                                                             
}

function disableCards() {
  cards.forEach(card => {                       
    card.removeEventListener('click', flipCard);
  });
} // GAME CLEAR. GAME OVER.時に クリックを解除!

//------------------------------------------
// angel actions ---

function angelFlipped() { // firstCard angel flipped //
  if(firstCard.dataset.framework === 'angel') {
    lockBoard = true;
    setTimeout(() => {
      firstCard.classList.remove('js_flip');
      lockBoard = false;
      firstCard = null;
      hasFlippedCard = false; 
      setTimeout(() => {
        for (let i = 0; i < cards.length; i++) {
          backFaces[i].classList.remove('js_black');
          backFaces[i].classList.remove('js_black');
        }
        colored();
        shuffleCards();
      }, 500);
    }, 1000);

    deathCount--;
    if(deathCount <= 0) {deathCount = 0}
    dots[deathCount].classList.remove('js_activeCircle'); // deathCount release //
    // unMatched = 0; // angel release all gauge version // 初期仕様 unMatched -= 3; 
    if(unMatched <= 0) {unMatched = 0}
    // circles.forEach(circle => { // angel release all gauge version //
    //   circle.classList.remove('js_activeCircle');
    // });
      gaugesResetter();
    console.log('angel-release-unMatched = ' + unMatched);
    console.log('angel-release-deathCount = ' + deathCount);
  }
}

function angelRelease() { // secondCard angel flipped //
  if(secondCard.dataset.framework === 'angel') {
    unMatched--;
    circles[unMatched].classList.remove('js_activeCircle');
    console.log('angel-released-unMatched = ' + unMatched);
  }
}

function gaugesResetter() {
  circles.forEach(circle => { 
    circle.classList.remove('js_activeCircle');
  }); // 上の unMatched = 0; comment out! 
  // forEachで cancelして switch文で classList.add 戻し //
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
  // angel release 3 gauge version ---  //
  // 上の forEachで cancelした後 ここif文で classList.add 戻し //
    // if(unMatched === 7 || unMatched === 6 || unMatched === 5 || 
    //   unMatched === 4 || unMatched === 3) { 
    //     unMatched = unMatched - 3;
    //     activeCircleAdd();
    // } else if(unMatched === 2) {
    //     unMatched = unMatched - 2;
    //     activeCircleAdd();
    // } else if(unMatched === 1){
    //     unMatched = unMatched - 1;
    //     activeCircleAdd();
    // }
  function activeCircleAdd() {
    for (let i = 0; i < unMatched; i++) {  
      circles[i].classList.add('js_activeCircle');
    } 
  }
}

//------------------------------------------
// colored ---

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
  // cancel用 使う時は一番上に //
  // for (let i = 0; i < cards.length; i++) {
  //   backFaces[i].classList.remove('js_black');
  //   backFaces[i].classList.remove('js_black');
  // }
  // backFaces.forEach(backFace => {
  //   backFace.classList.remove('js_black');
  //   backFace.classList.remove('js_black');
  // });
  // console.log(colorOne);
  // console.log(colorTwo);
}
colored();

function abortColored() {
  colored = function () {
    colored = null;
  }
} 

function abortShuffleCards() {
  shuffleCards = function () {
    shuffleCards = null;
  }
}

  //----------------------------------
  //次の一回だけ!functionを停止!
  // function abortShuffleCards() {
  //   let temp = shuffleCards;
  //   shuffleCards = function () {
  //     shuffleCards = temp;
  //   }
  // } 
  //----------------------------------

//------------------------------------------
// shuffle 1. ---

function shuffleCards() {
  const number = [];
  for (let i = 0; i < cards.length; i++) {
    number[i] = i;
  }
  number.sort(value => {
    return  0.5 - Math.random();
  });
  // console.log(number);
  cards.forEach(card => {
    const orderNumber = 
    number.splice(Math.floor(Math.random() * number.length), 1);
    card.style.order = orderNumber;
    // console.log(orderNumber);
  });
}
shuffleCards();

//------------------------------------------------------
// shuffle 2. ---

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
// shuffle 3. ---

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

























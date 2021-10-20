"use strict";

let activeIndex = sessionList.active;
const session = sessionList.list[activeIndex];
//repeats timer function every specified time interval
let updateTimerHandle;
//creates global variable to the timers initilisation
let startTime;
//global timeout handler
let timerDelay;
//defines whether or not the timer animation should cease
let cancelled = false;
//how long the user must hold space for the timer to initiate
let spaceDownThreshold = 400;
//colours for the clock
let startColor = "#32CD30";
let holdColor = "#FF0000";
let defaultColor = "white";
//retrives DOM elements
let clock;
const ao5 = document.getElementById("ao5");
const ao12 = document.getElementById("ao12");
const menus = document.getElementById("tool-bar");
const statIcon = document.getElementById("stat-icon");
const plusTwo = document.querySelector("#plusTwo");
const dnf = document.querySelector("#DNF");
dnf.style.display = "none";
plusTwo.style.display = "none";

//fill averages on screen
ao5.innerHTML = session.getAverage(5);
ao12.innerHTML = session.getAverage(12);

statIcon.addEventListener("click", () => {
  updateLSData(sessionKey, sessionList);
  window.location.href = "./stats.html";
});

/*timer code*/
function formatTime(totalMiliSec) {
  let dispMinutes = Math.floor(totalMiliSec / 60000);
  let dispSeconds = Math.floor((totalMiliSec % 60000) / 1000);
  let dispMiliSec = totalMiliSec % 1000;
  dispMiliSec = `00${dispMiliSec}`.substr(-3);
  if (dispMinutes > 0) {
    dispSeconds = `0${dispSeconds}`.substr(-2);
    return `${dispMinutes}:${dispSeconds}.${dispMiliSec}`;
  } else {
    return `${dispSeconds}.${dispMiliSec}`;
  }
}

//starts the timer and sets callback function to update the timer every time the browser screen refreshes
function startTimer() {
  cancelled = false;
  startTime = Date.now();
  requestAnimationFrame(updateTimer);
}

//updates the timer
function updateTimer() {
  if (!cancelled) {
    console.log("the timer is still updating");
    let timeElapsed = Date.now() - startTime;
    clock.innerHTML = formatTime(timeElapsed);
    updateTimerHandle = requestAnimationFrame(updateTimer);
  }
}

//once the space key is held down, this turns the clock red until spaceDownThreshold has passed
function setDelay(e) {
  if (e.key === " ") {
    removeEventListener("keydown", setDelay);
    clock.style.color = holdColor;
    timerDelay = setTimeout(timerReady, spaceDownThreshold);
    //If the user releases the space bar before the timing threshold, then timerReady will not run
    addEventListener("keyup", clearDelay);
  }
}

//if space is released before required time interval, then the timer start action is cancelled
function clearDelay(e) {
  if (e.key === " ") {
    removeEventListener("keyup", clearDelay);
    clearTimeout(timerDelay);
    clock.style.color = defaultColor;
    addEventListener("keydown", setDelay);
  }
}

//runs if user has held space bar for required spaceDownThreshold (waits for space release to start timer)
function timerReady() {
  // console.clear()
  removeEventListener("keyup", clearDelay);
  clock.style.color = startColor;
  //everything is hidden to simplify the timer
  scramble.style.display = "none";
  averages.style.display = "none";
  menus.style.display = "none";
  plusTwo.style.display = "none";
  dnf.style.display = "none";
  document.body.style.cursor = "none";

  addEventListener("keyup", confirmStart);
}

//starts the timer
function confirmStart(e) {
  if (e.key === " ") {
    removeEventListener("keyup", confirmStart);
    clock.style.color = defaultColor;
    startTimer();
    addEventListener("keydown", stopTimer);
  }
}

function processSolve(solveTime) {
  let currentSolve = new Solve(solveTime, currentScramble);
  session.add(currentSolve);
  updateLSData(sessionKey, sessionList);
  //update averages
  ao5.innerHTML = session.getAverage(5);
  ao12.innerHTML = session.getAverage(12);
  //generate new scramble
  currentScramble = scrambleGen(scrambleNotation);
  scrambleToHTML(currentScramble);
  console.log("this entire global code has ran");
  //active penalty buttons
  dnf.addEventListener("click", addDNF);
  plusTwo.addEventListener("click", addPlusTwo);
  plusTwo.style.display = "inline-block";
  dnf.style.display = "inline-block";
}
//runs when space is clicked to stop timer
function stopTimer() {
  removeEventListener("keydown", stopTimer);
  plusTwo.style.display = "";
  dnf.style.display = "";
  cancelled = true;
  console.log("timer has been stopped");
  const solveTime = Date.now() - startTime;
  clock.innerHTML = formatTime(solveTime);
  //redisplay all components that were hidden
  scramble.style.display = "";
  averages.style.display = "";
  menus.style.display = "";
  document.body.style.cursor = "auto";
  //store solve
  processSolve(solveTime);
  resetTimer();
}

//resets timer function
function resetTimer() {
  removeEventListener("keyup", resetTimer);
  addEventListener("keydown", setDelay);
}

function addDNF() {
  dnf.removeEventListener("click", addDNF);
  const recentSolve = session.solveList[session.solveList.length - 1];
  console.log(recentSolve);
  recentSolve.time = Infinity;
  recentSolve.penalty = "DNF";
  console.log(recentSolve);
  if (clock) clock.innerHTML = recentSolve.toString();
  dnf.style.display = "none";
  plusTwo.style.display = "none";
  updateLSData(sessionKey, sessionList);
}

function addPlusTwo() {
  plusTwo.removeEventListener("click", addPlusTwo);
  const recentSolve = session.solveList[session.solveList.length - 1];
  console.log(recentSolve.time);
  console.log("This line ran");
  recentSolve.time = recentSolve.time + 2000;
  recentSolve.penalty = "+2";
  if (clock) clock.innerHTML = recentSolve.toString();
  dnf.style.display = "none";
  plusTwo.style.display = "none";
  updateLSData(sessionKey, sessionList);
}

function addManualSolve(e) {
  if (e.key === 'Enter') {
    console.log('this worked')
    const manualTimeRef = document.querySelector('#name');
    const solveTime = Number(manualTimeRef.value) * 1000;
    //store solve
    processSolve(solveTime);
    manualTimeRef.value = '';
    manualTimeRef.blur();
  }
}

//if statment to determine if manual entry is true
if (settings.manualEntry) {
  console.log(settings.manualEntry)
  plusTwo.style.display = "";
  dnf.style.display = "";
  addEventListener("keydown", addManualSolve);
  document.querySelector('.timer').innerHTML = `<div class="form__group field">
  <input autocomplete="off" type="input" class="form__field" placeholder="Name" name="name" id="name" required />
  <label for="name" class="form__label">Time (in seconds)</label>
</div>`;

} else {
  //waits for a key down, then sets a delay to run timerReady after delay
  addEventListener("keydown", setDelay);
  document.querySelector('.timer').innerHTML = '<h1 id="clock">0.000</h1>'
  clock = document.getElementById("clock")

}

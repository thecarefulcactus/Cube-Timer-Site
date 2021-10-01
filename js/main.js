"use strict"

//repeats timer function every specified time interval
let updateTimerHandle;
//creates global variable to the timers initilisation
let startTime;
//global timeout handler
let timerDelay;
//defines whether or not the timer animation should cease
let cancelled = false;
//the button that was used to stop the timer
let buttonStop;
//how long the user must hold space for the timer to initiate
let spaceDownThreshold = 400;
//colours for the clock
let startColor = '#32CD30';
let holdColor = '#FF0000';
let defaultColor = 'white';
//retrives DOM elements
let clock = document.getElementById('clock');
let scramble = document.getElementById('scramble');
let ao5 = document.getElementById('ao5');
let ao12 = document.getElementById('ao12');
let menus = document.getElementById('tool-bar');

ao5.innerHTML = session.getAverage(5);
ao12.innerHTML = session.getAverage(12);
//starts the timer and sets callback function to update the timer every time the browser screen refreshes
function startTimer() {
    cancelled = false;
    startTime = Date.now();
    requestAnimationFrame(updateTimer);
}

//updates the timer
function updateTimer() {
    if (!cancelled) {
        console.log('the timer is still updating')
        let timeElapsed = Date.now() - startTime;
        clock.innerHTML = formatTime(timeElapsed);
        updateTimerHandle = requestAnimationFrame(updateTimer);
    }
}

//waits for a key down, then sets a delay to run timerReady after delay
addEventListener("keydown", setDelay);

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
    console.clear()
    removeEventListener("keyup", clearDelay);
    clock.style.color = startColor;
    //everything is hidden to simplify the timer
    scramble.style.display = 'none';
    averages.style.display = 'none';
    menus.style.display = 'none';
    document.body.style.cursor = 'none';
    addEventListener("keyup", confirmStart);
}

//starts the timer
function confirmStart(e) {
    if (e.key === " ") {
        removeEventListener("keyup", confirmStart);
        clock.style.color = defaultColor;
        startTimer();
        addEventListener("keydown", stopTimer, { once: true });
    }
}

//runs when space is clicked to stop timer
function stopTimer(e) {
    buttonStop = e;
    cancelled = true;
    console.log('timer has been stopped');
    let solveTime = Date.now() - startTime;
    clock.innerHTML = formatTime(solveTime);
    //redisplay all components that were hidden
    scramble.style.display = 'block';
    averages.style.display = 'block';
    menus.style.display = 'block';
    document.body.style.cursor = 'auto';
    let currentSolve = new Solve(solveTime);
    session.addSolve(currentSolve);
    updateLSData(sessionKey, session);
    ao5.innerHTML = session.getAverage(5);
    ao12.innerHTML = session.getAverage(12);
    addEventListener("keyup", resetTimer);
}

//resets timer function
function resetTimer(e) {
    if (e.key === buttonStop.key) {
        removeEventListener("keyup", resetTimer);
        addEventListener("keydown", setDelay);
        console.log("this shouldn't run if the glitch has occured");
    }
}
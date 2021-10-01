"use strict";

let sessionKey = 'yourBeefsYourMuttons';

//takes total miliseconds and returns a formatted string to display
function formatTime(totalMiliSec) {
    let dispSeconds = Math.floor(totalMiliSec / 1000);
    let dispMiliSec = totalMiliSec % 1000;
    dispMiliSec = `00${dispMiliSec}`.substr(-3);
    return `${dispSeconds}.${dispMiliSec}`;
}

/**
 * checkLSData function
 * Used to check if any data in LS exists at a specific key
 * @param {string} key LS Key to be used
 * @returns true or false representing if data exists at key in LS
 */
function checkLSData(key) {
    if (localStorage.getItem(key) != null) {
        return true;
    }
    return false;
}
/**
 * retrieveLSData function
 * Used to retrieve data from LS at a specific key. 
 * @param {string} key LS Key to be used
 * @returns data from LS in JS format
 */
function retrieveLSData(key) {
    let data = localStorage.getItem(key);
    try {
        data = JSON.parse(data);
    }
    catch (err) { }
    finally {
        return data;
    }
}
/**
 * updateLSData function
 * Used to store JS data in LS at a specific key
 * @param {string} key LS key to be used
 * @param {any} data data to be stored
 */
function updateLSData(key, data) {
    let json = JSON.stringify(data);
    localStorage.setItem(key, json);
}

class Solve {
    constructor(solveTime) {
        this._solveTime = solveTime;
        this._date = new Date;
    }
    get date() {
        return this._date;
    }
    get time() {
        return this._solveTime;
    }
    fromData(data) {
        this._date = data._date;
        this._solveTime = data._solveTime;
    }
}

class Session {
    constructor(sessionName, solveList, solveType) {
        this._solveList = solveList;
        this._solveType = solveType;
        this._sessionName = sessionName;
        this._date = new Date;
    }
    get solveList() {
        return this._solveList;
    }
    get solveType() {
        return this._solveType;
    }
    get sessionName() {
        return this._sessionName;
    }
    get date() {
        return this._date;
    }
    addSolve(solve) {
        this._solveList.push(solve);
    }
    getAverage(numberOfSolves) {
        if (this._solveList.length >= numberOfSolves) {
            let end = this._solveList.length + 1;
            let start = end - numberOfSolves - 1;
            let chosenSolves = this._solveList.slice(start, end);
            let sum = 0;
            for (let i = 0; i < chosenSolves.length; i++) {
                sum += chosenSolves[i].time;
            }
            return formatTime(Math.round(sum / chosenSolves.length));
        } else {
            return '--';
        }
    }
    fromData(data) {
        this._solveList = [];
        let storedSolveList = data._solveList;
        for (let i = 0; i < storedSolveList.length; i++) {
            let solve = new Solve();
            solve.fromData(storedSolveList[i]);
            this._solveList.push(solve);
        }
    }
}

let session;
let data;

if (checkLSData(sessionKey)) {
    session = new Session()
    data = retrieveLSData(sessionKey)
    console.log(data);
    session.fromData(data);
} else {
    session = new Session('Session 1', [], "3x3");
}
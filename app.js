const timer = document.querySelector("#timer"),
  tbody = document.querySelector("tbody"),
  table = document.querySelector("table"),
  h1 = document.querySelector("h1"),
  clearBtn = document.querySelector("#clear"),
  deleteBtn = document.querySelector("#delete"),
  select = document.querySelector("#types");

let milSec = 0,
  seconds = 0,
  minutes = 0,
  numberOfSolves = 0,
  saveTime = 0,
  keyPressed = 0;
let timeArr = [];
let running = false;
let type = ["333"];

const addTime = (timeText) => {
  timeArr.unshift(timeText);
  numberOfSolves++;
  let current = tbody.innerHTML;
  tbody.innerHTML = "";
  tbody.innerHTML += milSecondsToString(timeText, numberOfSolves) + current;
};

const milSecondsToString = (timeText, len) => {
  const times = milSecondsToArray(timeText);
  const ao5 = milSecondsToArray(getAvg(timeArr, 5));
  const ao12 = milSecondsToArray(getAvg(timeArr, 12));
  if (len < 5) {
    return `
      <tr>
        <td>${len}</td>
        <td>${times[2]}${times[1]}.${times[0]}</td>
        <td>-</td>
        <td>-</td>
      </tr>
    `;
  } else if (len < 12) {
    return `
      <tr>
        <td>${len}</td>
        <td>${times[2]}${times[1]}.${times[0]}</td>
        <td>${ao5[2]}${ao5[1]}.${ao5[0]}</td>
        <td>-</td>
      </tr>
    `;
  } else {
    return `
      <tr>
        <td>${len}</td>
        <td>${times[2]}${times[1]}.${times[0]}</td>
        <td>${ao5[2]}${ao5[1]}.${ao5[0]}</td>
        <td>${ao12[2]}${ao12[1]}.${ao12[0]}</td>
      </tr>
    `;
  }
};

const milSecondsToArray = (input) => {
  let tableMilSec = input % 100;
  let tableSec = Math.floor((input % 6000) / 100);
  let tableMin = Math.floor(input / 6000);

  let tableMilSecDisplay = tableMilSec < 10 ? "0" + tableMilSec : tableMilSec;
  let tableSecDisplay =
    tableMin > 0 && tableSec < 10 ? "0" + tableSec : tableSec;
  let tableMinDisplay = tableMin > 0 ? tableMin + ":" : "";
  return [tableMilSecDisplay, tableSecDisplay, tableMinDisplay];
};

const getTime = () => {
  timeArr.forEach((t) => {
    numberOfSolves++;
    tbody.innerHTML += milSecondsToString(t, numberOfSolves);
  });
};

const getAvg = (arr, number) => {
  let newArr = [];
  for (let i = 0; i < number; i++) {
    newArr.push(arr[i]);
  }

  let max = Math.max(...newArr);
  let min = Math.min(...newArr);
  let index1 = newArr.indexOf(max);
  newArr.splice(index1, 1);
  let index2 = newArr.indexOf(min);
  newArr.splice(index2, 1);

  let sum = 0;
  newArr.forEach((element) => {
    sum += element;
  });
  return (sum / (number - 2)).toFixed();
};

var cstimerScrambler = (function () {
  if (!window.Worker) {
    // not available due to browser capability
    return {};
  }
  var worker = new Worker("cstimer.js");
  var callbacks = {};
  var msgid = 0;

  worker.onmessage = function (e) {
    //data: [msgid, type, ret]
    var data = e.data;
    var callback = callbacks[data[0]];
    delete callbacks[data[0]];
    callback && callback(data[2]);
  };

  //[type, length, state]
  function getScramble(args, callback) {
    ++msgid;
    callbacks[msgid] = callback;
    worker.postMessage([msgid, "scramble", args]);
    return msgid;
  }

  return {
    getScramble: getScramble,
  };
})();

function startTimer() {
  table.classList.add("hide");
  clearBtn.classList.add("hide");
  h1.classList.add("hide");
  deleteBtn.classList.add("hide");
  select.classList.add("hide");
  saveTime = 0;
  milSec = 0;
  seconds = 0;
  minutes = 0;
  interval = setInterval(() => {
    milSec++;
    saveTime++;
    if (milSec >= 100) {
      milSec = 0;
      seconds++;
    }
    if (seconds >= 60) {
      seconds = 0;
      minutes++;
    }
    if (milSec < 10) {
      displayMilseconds = "0" + milSec;
    } else {
      displayMilseconds = milSec;
    }
    if (minutes < 1) {
      timer.innerText = `${seconds}.${displayMilseconds}`;
    } else {
      if (seconds < 10) {
        timer.innerText = `${minutes}:0${seconds}.${displayMilseconds}`;
      } else {
        timer.innerText = `${minutes}:${seconds}.${displayMilseconds}`;
      }
    }
  }, 10);
  running = true;
}

function stopTimer() {
  h1.classList.remove("hide");
  table.classList.remove("hide");
  clearBtn.classList.remove("hide");
  deleteBtn.classList.remove("hide");
  select.classList.remove("hide");
  clearInterval(interval);
  clearBtn.blur();
  addTime(saveTime);
  getScramble();
  localStorage.setItem("timeArr", JSON.stringify(timeArr));
}

window.addEventListener("keydown", (event) => {
  keyPressed++;
  if (running === true && keyPressed === 1) {
    if (!event.repeat) {
      stopTimer();
    }
  }
  if (event.code === "Space") {
    if (running === false) {
      timer.style.color = "green";
    } else {
      timer.style.color = "black";
    }
  }
});

window.addEventListener("keyup", (event) => {
  timer.style.color = "black";
  if (running === true) {
    running = false;
  } else if (event.code == "Space") {
    startTimer();
  }
  keyPressed = 0;
});

window.addEventListener("touchstart", (event) => {
  if (running === false) {
    timer.style.color = "green";
  } else {
    timer.style.color = "black";
    stopTimer();
  }
});

window.addEventListener("touchend", (event) => {
  timer.style.color = "black";
  if (running === true) {
    running = false;
  } else {
    startTimer();
  }
});

const getScramble = () => {
  cstimerScrambler.getScramble(type, (scramble) => {
    let text = scramble.replaceAll("\\n", "<br>");
    h1.innerHTML = text;
  });
};

const resetTime = () => {
  timeArr = [];
  numberOfSolves = 0;
  tbody.innerHTML = "";
  localStorage.clear();
};

clearBtn.addEventListener("click", resetTime);

// deleteBtn.addEventListener("click", () => {
//   timeArr.shift();
//   localStorage.setItem("timeArr", timeArr);
//   tbody.lastElementChild.removeChild();
// });

select.addEventListener("change", () => {
  switch (select.value) {
    case "22":
      type = ["222so"];
      break;
    case "33":
      type = ["333"];
      break;
    case "44":
      type = ["444wca"];
      break;
    case "55":
      type = ["555wca", 60];
      break;
    case "66":
      type = ["666wca", 60];
      break;
    case "77":
      type = ["777wca", 60];
      break;
    case "mega":
      type = ["mgmp", 70];
      break;
    case "pyra":
      type = ["pyrso"];
      break;
  }
  getScramble();
  select.blur();
});

const existingTimes = JSON.parse(localStorage.getItem("timeArr"));
let timeData = existingTimes || [];
timeData.forEach((t) => addTime(t));
getScramble();

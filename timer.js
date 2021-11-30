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

var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.checkStringArgs = function (z, Qa, n) {
  if (null == z)
    throw new TypeError(
      "The 'this' value for String.prototype." +
        n +
        " must not be null or undefined"
    );
  if (Qa instanceof RegExp)
    throw new TypeError(
      "First argument to String.prototype." +
        n +
        " must not be a regular expression"
    );
  return z + "";
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.defineProperty =
  $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties
    ? Object.defineProperty
    : function (z, Qa, n) {
        z != Array.prototype && z != Object.prototype && (z[Qa] = n.value);
      };
$jscomp.getGlobal = function (z) {
  return "undefined" != typeof window && window === z
    ? z
    : "undefined" != typeof global && null != global
    ? global
    : z;
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.polyfill = function (z, Qa, n, Xa) {
  if (Qa) {
    n = $jscomp.global;
    z = z.split(".");
    for (Xa = 0; Xa < z.length - 1; Xa++) {
      var c = z[Xa];
      c in n || (n[c] = {});
      n = n[c];
    }
    z = z[z.length - 1];
    Xa = n[z];
    Qa = Qa(Xa);
    Qa != Xa &&
      null != Qa &&
      $jscomp.defineProperty(n, z, {
        configurable: !0,
        writable: !0,
        value: Qa,
      });
  }
};
$jscomp.polyfill(
  "String.prototype.startsWith",
  function (z) {
    return z
      ? z
      : function (z, n) {
          var Qa = $jscomp.checkStringArgs(this, z, "startsWith");
          z += "";
          for (
            var c = Qa.length,
              Ua = z.length,
              a = Math.max(0, Math.min(n | 0, Qa.length)),
              f = 0;
            f < Ua && a < c;

          )
            if (Qa[a++] != z[f++]) return !1;
          return f >= Ua;
        };
  },
  "es6",
  "es3"
);
$jscomp.findInternal = function (z, Qa, n) {
  z instanceof String && (z = String(z));
  for (var Xa = z.length, c = 0; c < Xa; c++) {
    var Ua = z[c];
    if (Qa.call(n, Ua, c, z)) return { i: c, v: Ua };
  }
  return { i: -1, v: void 0 };
};
$jscomp.polyfill(
  "Array.prototype.find",
  function (z) {
    return z
      ? z
      : function (z, n) {
          return $jscomp.findInternal(this, z, n).v;
        };
  },
  "es6",
  "es3"
);
$jscomp.arrayIteratorImpl = function (z) {
  var Qa = 0;
  return function () {
    return Qa < z.length ? { done: !1, value: z[Qa++] } : { done: !0 };
  };
};
$jscomp.arrayIterator = function (z) {
  return { next: $jscomp.arrayIteratorImpl(z) };
};
$jscomp.makeIterator = function (z) {
  var Qa =
    "undefined" != typeof Symbol && Symbol.iterator && z[Symbol.iterator];
  return Qa ? Qa.call(z) : $jscomp.arrayIterator(z);
};
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.polyfill(
  "Promise",
  function (z) {
    function Qa() {
      this.batch_ = null;
    }
    function n(a) {
      return a instanceof c
        ? a
        : new c(function (f, w) {
            f(a);
          });
    }
    if (z && !$jscomp.FORCE_POLYFILL_PROMISE) return z;
    Qa.prototype.asyncExecute = function (a) {
      null == this.batch_ && ((this.batch_ = []), this.asyncExecuteBatch_());
      this.batch_.push(a);
      return this;
    };
    Qa.prototype.asyncExecuteBatch_ = function () {
      var a = this;
      this.asyncExecuteFunction(function () {
        a.executeBatch_();
      });
    };
    var Xa = $jscomp.global.setTimeout;
    Qa.prototype.asyncExecuteFunction = function (a) {
      Xa(a, 0);
    };
    Qa.prototype.executeBatch_ = function () {
      for (; this.batch_ && this.batch_.length; ) {
        var a = this.batch_;
        this.batch_ = [];
        for (var f = 0; f < a.length; ++f) {
          var w = a[f];
          a[f] = null;
          try {
            w();
          } catch (T) {
            this.asyncThrow_(T);
          }
        }
      }
      this.batch_ = null;
    };
    Qa.prototype.asyncThrow_ = function (a) {
      this.asyncExecuteFunction(function () {
        throw a;
      });
    };
    var c = function (a) {
      this.state_ = 0;
      this.result_ = void 0;
      this.onSettledCallbacks_ = [];
      var f = this.createResolveAndReject_();
      try {
        a(f.resolve, f.reject);
      } catch (w) {
        f.reject(w);
      }
    };
    c.prototype.createResolveAndReject_ = function () {
      function a(a) {
        return function (h) {
          w || ((w = !0), a.call(f, h));
        };
      }
      var f = this,
        w = !1;
      return { resolve: a(this.resolveTo_), reject: a(this.reject_) };
    };
    c.prototype.resolveTo_ = function (a) {
      if (a === this)
        this.reject_(new TypeError("A Promise cannot resolve to itself"));
      else if (a instanceof c) this.settleSameAsPromise_(a);
      else {
        a: switch (typeof a) {
          case "object":
            var f = null != a;
            break a;
          case "function":
            f = !0;
            break a;
          default:
            f = !1;
        }
        f ? this.resolveToNonPromiseObj_(a) : this.fulfill_(a);
      }
    };
    c.prototype.resolveToNonPromiseObj_ = function (a) {
      var f = void 0;
      try {
        f = a.then;
      } catch (w) {
        this.reject_(w);
        return;
      }
      "function" == typeof f
        ? this.settleSameAsThenable_(f, a)
        : this.fulfill_(a);
    };
    c.prototype.reject_ = function (a) {
      this.settle_(2, a);
    };
    c.prototype.fulfill_ = function (a) {
      this.settle_(1, a);
    };
    c.prototype.settle_ = function (a, f) {
      if (0 != this.state_)
        throw Error(
          "Cannot settle(" +
            a +
            ", " +
            f +
            "): Promise already settled in state" +
            this.state_
        );
      this.state_ = a;
      this.result_ = f;
      this.executeOnSettledCallbacks_();
    };
    c.prototype.executeOnSettledCallbacks_ = function () {
      if (null != this.onSettledCallbacks_) {
        for (var a = 0; a < this.onSettledCallbacks_.length; ++a)
          Ua.asyncExecute(this.onSettledCallbacks_[a]);
        this.onSettledCallbacks_ = null;
      }
    };
    var Ua = new Qa();
    c.prototype.settleSameAsPromise_ = function (a) {
      var f = this.createResolveAndReject_();
      a.callWhenSettled_(f.resolve, f.reject);
    };
    c.prototype.settleSameAsThenable_ = function (a, f) {
      var w = this.createResolveAndReject_();
      try {
        a.call(f, w.resolve, w.reject);
      } catch (T) {
        w.reject(T);
      }
    };
    c.prototype.then = function (a, f) {
      function w(a, f) {
        return "function" == typeof a
          ? function (f) {
              try {
                T(a(f));
              } catch (oa) {
                h(oa);
              }
            }
          : f;
      }
      var T,
        h,
        n = new c(function (a, f) {
          T = a;
          h = f;
        });
      this.callWhenSettled_(w(a, T), w(f, h));
      return n;
    };
    c.prototype["catch"] = function (a) {
      return this.then(void 0, a);
    };
    c.prototype.callWhenSettled_ = function (a, f) {
      function w() {
        switch (c.state_) {
          case 1:
            a(c.result_);
            break;
          case 2:
            f(c.result_);
            break;
          default:
            throw Error("Unexpected state: " + c.state_);
        }
      }
      var c = this;
      null == this.onSettledCallbacks_
        ? Ua.asyncExecute(w)
        : this.onSettledCallbacks_.push(w);
    };
    c.resolve = n;
    c.reject = function (a) {
      return new c(function (f, w) {
        w(a);
      });
    };
    c.race = function (a) {
      return new c(function (f, w) {
        for (
          var c = $jscomp.makeIterator(a), h = c.next();
          !h.done;
          h = c.next()
        )
          n(h.value).callWhenSettled_(f, w);
      });
    };
    c.all = function (a) {
      var f = $jscomp.makeIterator(a),
        w = f.next();
      return w.done
        ? n([])
        : new c(function (a, h) {
            function c(f) {
              return function (h) {
                T[f] = h;
                Ta--;
                0 == Ta && a(T);
              };
            }
            var T = [],
              Ta = 0;
            do
              T.push(void 0),
                Ta++,
                n(w.value).callWhenSettled_(c(T.length - 1), h),
                (w = f.next());
            while (!w.done);
          });
    };
    return c;
  },
  "es6",
  "es3"
);
$jscomp.polyfill(
  "String.prototype.endsWith",
  function (z) {
    return z
      ? z
      : function (z, n) {
          var Qa = $jscomp.checkStringArgs(this, z, "endsWith");
          z += "";
          void 0 === n && (n = Qa.length);
          for (
            var c = Math.max(0, Math.min(n | 0, Qa.length)), Ua = z.length;
            0 < Ua && 0 < c;

          )
            if (Qa[--c] != z[--Ua]) return !1;
          return 0 >= Ua;
        };
  },
  "es6",
  "es3"
);
$jscomp.polyfill(
  "Array.prototype.fill",
  function (z) {
    return z
      ? z
      : function (z, n, Xa) {
          var c = this.length || 0;
          0 > n && (n = Math.max(0, c + n));
          if (null == Xa || Xa > c) Xa = c;
          Xa = Number(Xa);
          0 > Xa && (Xa = Math.max(0, c + Xa));
          for (n = Number(n || 0); n < Xa; n++) this[n] = z;
          return this;
        };
  },
  "es6",
  "es3"
);
$jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
$jscomp.initSymbol = function () {
  $jscomp.initSymbol = function () {};
  $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol);
};
$jscomp.Symbol = (function () {
  var z = 0;
  return function (Qa) {
    return $jscomp.SYMBOL_PREFIX + (Qa || "") + z++;
  };
})();
$jscomp.initSymbolIterator = function () {
  $jscomp.initSymbol();
  var z = $jscomp.global.Symbol.iterator;
  z || (z = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));
  "function" != typeof Array.prototype[z] &&
    $jscomp.defineProperty(Array.prototype, z, {
      configurable: !0,
      writable: !0,
      value: function () {
        return $jscomp.iteratorPrototype($jscomp.arrayIteratorImpl(this));
      },
    });
  $jscomp.initSymbolIterator = function () {};
};
$jscomp.initSymbolAsyncIterator = function () {
  $jscomp.initSymbol();
  var z = $jscomp.global.Symbol.asyncIterator;
  z ||
    (z = $jscomp.global.Symbol.asyncIterator =
      $jscomp.global.Symbol("asyncIterator"));
  $jscomp.initSymbolAsyncIterator = function () {};
};
$jscomp.iteratorPrototype = function (z) {
  $jscomp.initSymbolIterator();
  z = { next: z };
  z[$jscomp.global.Symbol.iterator] = function () {
    return this;
  };
  return z;
};
$jscomp.iteratorFromArray = function (z, Qa) {
  $jscomp.initSymbolIterator();
  z instanceof String && (z += "");
  var n = 0,
    Xa = {
      next: function () {
        if (n < z.length) {
          var c = n++;
          return { value: Qa(c, z[c]), done: !1 };
        }
        Xa.next = function () {
          return { done: !0, value: void 0 };
        };
        return Xa.next();
      },
    };
  Xa[Symbol.iterator] = function () {
    return Xa;
  };
  return Xa;
};
$jscomp.polyfill(
  "Array.prototype.keys",
  function (z) {
    return z
      ? z
      : function () {
          return $jscomp.iteratorFromArray(this, function (z) {
            return z;
          });
        };
  },
  "es6",
  "es3"
);
$jscomp.polyfill(
  "Math.log10",
  function (z) {
    return z
      ? z
      : function (z) {
          return Math.log(z) / Math.LN10;
        };
  },
  "es6",
  "es3"
);
var isInWorker =
  "undefined" !== typeof WorkerGlobalScope && self instanceof WorkerGlobalScope;
function execBoth(z, Qa, n) {
  return !isInWorker && z
    ? z.apply(this, n || [])
    : isInWorker && Qa
    ? Qa.apply(this, n || [])
    : {};
}
function execWorker(z, Qa) {
  return execBoth(void 0, z, Qa);
}
function execMain(z, Qa) {
  return execBoth(z, void 0, Qa);
}
execWorker(function () {
  self.$ = {
    isArray:
      Array.isArray ||
      function (z) {
        return "array" === jQuery.type(z);
      },
    noop: function () {},
  };
});
execMain(function () {
  window.onerror = function (n, z, c, Ua, a) {
    void 0 == a && (a = {});
    var f = "";
    try {
      f = $.fingerprint();
    } catch (T) {}
    var w = "";
    try {
      w = LZString.compressToEncodedURIComponent(localStorage.properties);
    } catch (T) {}
    $.post("bug.php", {
      version: CSTIMER_VERSION,
      fp: f,
      msg: n,
      url: z,
      line: c,
      col: Ua,
      stack: a.stack,
      prop: w,
    });
    console.log(CSTIMER_VERSION, f, n, z, c, Ua, a);
  };
  for (
    var z =
        "CSTIMER_VERSION LANG_SET LANG_STR LANG_CUR OK_LANG CANCEL_LANG RESET_LANG ABOUT_LANG ZOOM_LANG BUTTON_TIME_LIST BUTTON_OPTIONS BUTTON_EXPORT BUTTON_DONATE PROPERTY_SR PROPERTY_USEINS PROPERTY_USEINS_STR PROPERTY_VOICEINS PROPERTY_VOICEINS_STR PROPERTY_VOICEVOL PROPERTY_PHASES PROPERTY_TIMERSIZE PROPERTY_USEMILLI PROPERTY_SMALLADP PROPERTY_SCRSIZE PROPERTY_SCRMONO PROPERTY_SCRLIM PROPERTY_SCRALIGN PROPERTY_SCRALIGN_STR PROPERTY_SCRFAST PROPERTY_SCRKEYM PROPERTY_SCRCLK PROPERTY_SCRCLK_STR PROPERTY_WNDSCR PROPERTY_WNDSTAT PROPERTY_WNDTOOL PROPERTY_WND_STR EXPORT_DATAEXPORT EXPORT_TOFILE EXPORT_FROMFILE EXPORT_TOSERV EXPORT_FROMSERV EXPORT_FROMOTHER EXPORT_USERID EXPORT_INVID EXPORT_ERROR EXPORT_NODATA EXPORT_UPLOADED EXPORT_CODEPROMPT EXPORT_ONLYOPT EXPORT_ACCOUNT EXPORT_LOGINGGL EXPORT_LOGINWCA EXPORT_LOGOUTCFM EXPORT_LOGINAUTHED IMPORT_FINAL_CONFIRM BUTTON_SCRAMBLE BUTTON_TOOLS IMAGE_UNAVAILABLE TOOLS_SELECTFUNC TOOLS_CROSS TOOLS_EOLINE TOOLS_ROUX1 TOOLS_222FACE TOOLS_GIIKER TOOLS_IMAGE TOOLS_STATS TOOLS_HUGESTATS TOOLS_DISTRIBUTION TOOLS_TREND TOOLS_METRONOME TOOLS_CFMTIME TOOLS_SOLVERS TOOLS_SYNCSEED TOOLS_SYNCSEED_SEED TOOLS_SYNCSEED_INPUT TOOLS_SYNCSEED_30S TOOLS_SYNCSEED_HELP TOOLS_SYNCSEED_DISABLE TOOLS_SYNCSEED_INPUTA OLCOMP_UPDATELIST OLCOMP_VIEWRESULT OLCOMP_VIEWMYRESULT OLCOMP_START OLCOMP_SUBMIT OLCOMP_SUBMITAS OLCOMP_WCANOTICE OLCOMP_OLCOMP OLCOMP_ANONYM OLCOMP_ME OLCOMP_WCAACCOUNT OLCOMP_ABORT OLCOMP_WITHANONYM PROPERTY_IMGSIZE TIMER_INSPECT TIMER_SOLVE PROPERTY_USEMOUSE PROPERTY_TIMEU PROPERTY_TIMEU_STR PROPERTY_PRETIME PROPERTY_ENTERING PROPERTY_ENTERING_STR PROPERTY_INTUNIT PROPERTY_INTUNIT_STR PROPERTY_COLOR PROPERTY_COLORS PROPERTY_VIEW PROPERTY_VIEW_STR PROPERTY_UIDESIGN PROPERTY_UIDESIGN_STR COLOR_EXPORT COLOR_IMPORT COLOR_FAIL PROPERTY_FONTCOLOR_STR PROPERTY_COLOR_STR PROPERTY_FONT PROPERTY_FONT_STR PROPERTY_FORMAT PROPERTY_USEKSC PROPERTY_NTOOLS PROPERTY_AHIDE SCRAMBLE_LAST SCRAMBLE_NEXT SCRAMBLE_SCRAMBLE SCRAMBLE_LENGTH SCRAMBLE_INPUT PROPERTY_VRCSPEED PROPERTY_VRCMP PROPERTY_VRCMPS PROPERTY_GIIKERVRC PROPERTY_GIISOK_DELAY PROPERTY_GIISOK_DELAYS PROPERTY_GIISOK_KEY PROPERTY_GIISOK_MOVE PROPERTY_GIISOK_MOVES PROPERTY_GIISBEEP PROPERTY_GIIRST PROPERTY_GIIRSTS CONFIRM_GIIRST PROPERTY_GIIAED scrdata SCRAMBLE_NOOBST SCRAMBLE_NOOBSS STATS_CFM_RESET STATS_CFM_DELSS STATS_CFM_DELMUL STATS_CFM_DELETE STATS_COMMENT STATS_REVIEW STATS_DATE STATS_SSSTAT STATS_CURROUND STATS_CURSESSION STATS_CURSPLIT STATS_EXPORTCSV STATS_SSMGR_TITLE STATS_SSMGR_NAME STATS_SSMGR_DETAIL STATS_SSMGR_OPS STATS_SSMGR_ORDER STATS_SSMGR_ODCFM STATS_SSMGR_SORTCFM STATS_ALERTMG STATS_PROMPTSPL STATS_ALERTSPL STATS_AVG STATS_SOLVE STATS_TIME STATS_SESSION STATS_SESSION_NAME STATS_SESSION_NAMEC STATS_STRING STATS_PREC STATS_PREC_STR STATS_TYPELEN STATS_STATCLR STATS_ABSIDX STATS_XSESSION_DATE STATS_XSESSION_NAME STATS_XSESSION_SCR STATS_XSESSION_CALC STATS_RSFORSS PROPERTY_PRINTSCR PROPERTY_PRINTDATE PROPERTY_SUMMARY PROPERTY_IMRENAME PROPERTY_SCR2SS PROPERTY_SS2SCR PROPERTY_SS2PHASES PROPERTY_STATINV PROPERTY_STATAL PROPERTY_STATALU PROPERTY_DELMUL PROPERTY_TOOLSFUNC PROPERTY_TRIM PROPERTY_TRIM_MED PROPERTY_STKHEAD PROPERTY_HIDEFULLSOL PROPERTY_IMPPREV PROPERTY_AUTOEXP PROPERTY_AUTOEXP_OPT PROPERTY_SCRASIZE MODULE_NAMES BGIMAGE_URL BGIMAGE_INVALID BGIMAGE_OPACITY BGIMAGE_IMAGE BGIMAGE_IMAGE_STR SHOW_AVG_LABEL USE_LOGOHINT TOOLS_SCRGEN SCRGEN_NSCR SCRGEN_PRE SCRGEN_GEN".split(
          " "
        ),
      Qa = 0;
    Qa < z.length;
    Qa++
  )
    window[z[Qa]] = window[z[Qa]] || "|||||||||||||||";
  window.requestAnimFrame = (function () {
    return (
      window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (n, z) {
        return window.setTimeout(n, 1e3 / 60);
      }
    );
  })();
  window.localStorage || (window.localStorage = {});
  "properties" in localStorage ||
    "https:" == location.protocol ||
    "localhost" == location.hostname ||
    (location.href =
      "https:" + location.href.substring(location.protocol.length));
  window.performance &&
    window.performance.now &&
    ($.now = function () {
      return Math.floor(window.performance.now());
    });
  $.urlParam = function (n) {
    n = new RegExp("[?&]" + n + "=([^&#]*)").exec(window.location.href);
    return null == n ? null : n[1] || 0;
  };
  $.hashParam = function (n) {
    n = new RegExp("[#&]" + n + "=([^&#]*)").exec(window.location.hash);
    return null == n ? null : n[1] || 0;
  };
  $.clearUrl = function (n) {
    var z = new RegExp("[?&](" + n + "=[^&#]*&?)").exec(window.location.href);
    n = n
      ? location.href.replace(z[1], "").replace(/\?$/, "")
      : location.pathname;
    history && history.replaceState
      ? history.replaceState(void 0, void 0, n)
      : (location.href = n);
  };
  $.clearHash = function (n) {
    var z = new RegExp("[#&](" + n + "=[^&#]*&?)").exec(window.location.href);
    n = n
      ? location.href.replace(z[1], "").replace(/#$/, "")
      : location.pathname + location.search;
    history && history.replaceState
      ? history.replaceState(void 0, void 0, n)
      : (location.href = n);
  };
  $.clipboardCopy = function (n, z) {
    var c = $("<textarea>" + n + "</textarea>").appendTo(document.body);
    c.focus().select();
    var Ua = !1;
    try {
      Ua = document.execCommand("copy");
    } catch (a) {}
    c.remove();
    return Ua;
  };
  $.fingerprint = function () {
    var n =
        window.screen &&
        [
          Math.max(screen.height, screen.width),
          Math.min(screen.height, screen.width),
          screen.colorDepth,
        ].join("x"),
      z = new Date().getTimezoneOffset(),
      c = $.map(navigator.plugins, function (c) {
        return [
          c.name,
          c.description,
          $.map(c, function (a) {
            return [a.type, a.suffixes].join("~");
          })
            .sort()
            .join(","),
        ].join("::");
      })
        .sort()
        .join(";");
    n = [
      navigator.userAgent,
      navigator.language,
      !!window.sessionStorage,
      !!window.localStorage,
      !!window.indexedDB,
      navigator.doNotTrack,
      n,
      z,
      c,
    ].join("###");
    return $.sha256(n);
  };
  "serviceWorker" in navigator
    ? $(function () {
        navigator.serviceWorker.register("sw.js");
      })
    : window.applicationCache &&
      $(function () {
        applicationCache.addEventListener(
          "updateready",
          function (n) {
            applicationCache.status == applicationCache.UPDATEREADY &&
              (applicationCache.swapCache(), location.reload());
          },
          !1
        );
      });
});
var DEBUGM = !1,
  DEBUGWK = !1,
  DEBUG = isInWorker ? DEBUGWK : DEBUGM && !!$.urlParam("debug");
Array.prototype.indexOf ||
  (Array.prototype.indexOf = function (z) {
    for (var Qa = 0; Qa < this.length; Qa++) if (this[Qa] == z) return Qa;
    return -1;
  });
Function.prototype.bind ||
  (Function.prototype.bind = function (z) {
    if ("function" !== typeof this)
      throw new TypeError(
        "Function.prototype.bind - what is trying to be bound is not callable"
      );
    var Qa = Array.prototype.slice.call(arguments, 1),
      n = this,
      Xa = function () {},
      c = function () {
        return n.apply(
          this instanceof Xa ? this : z,
          Qa.concat(Array.prototype.slice.call(arguments))
        );
      };
    this.prototype && (Xa.prototype = this.prototype);
    c.prototype = new Xa();
    return c;
  });
execBoth(function () {
  var z = function (n, z) {
      var c = (n & 65535) + (z & 65535);
      return (((n >> 16) + (z >> 16) + (c >> 16)) << 16) | (c & 65535);
    },
    Qa = function (n, z) {
      return (n >>> z) | (n << (32 - z));
    };
  $.sha256 = function (n) {
    /[\x80-\xFF]/.test(n) && (n = unescape(encodeURI(n)));
    for (var Xa = n, c = [], Ua = 0; Ua < 8 * Xa.length; Ua += 8)
      c[Ua >> 5] |= (Xa.charCodeAt(Ua / 8) & 255) << (24 - (Ua % 32));
    var a = 8 * n.length;
    Xa = [
      1116352408, 1899447441, 3049323471, 3921009573, 961987163, 1508970993,
      2453635748, 2870763221, 3624381080, 310598401, 607225278, 1426881987,
      1925078388, 2162078206, 2614888103, 3248222580, 3835390401, 4022224774,
      264347078, 604807628, 770255983, 1249150122, 1555081692, 1996064986,
      2554220882, 2821834349, 2952996808, 3210313671, 3336571891, 3584528711,
      113926993, 338241895, 666307205, 773529912, 1294757372, 1396182291,
      1695183700, 1986661051, 2177026350, 2456956037, 2730485921, 2820302411,
      3259730800, 3345764771, 3516065817, 3600352804, 4094571909, 275423344,
      430227734, 506948616, 659060556, 883997877, 958139571, 1322822218,
      1537002063, 1747873779, 1955562222, 2024104815, 2227730452, 2361852424,
      2428436474, 2756734187, 3204031479, 3329325298,
    ];
    n = [
      1779033703, 3144134277, 1013904242, 2773480762, 1359893119, 2600822924,
      528734635, 1541459225,
    ];
    Ua = [64];
    c[a >> 5] |= 128 << (24 - (a % 32));
    c[(((a + 64) >> 9) << 4) + 15] = a;
    for (a = 0; a < c.length; a += 16) {
      for (
        var f = n[0],
          w = n[1],
          T = n[2],
          h = n[3],
          Va = n[4],
          Ya = n[5],
          Ta = n[6],
          Wa = n[7],
          oa = 0;
        64 > oa;
        oa++
      ) {
        var Sa = oa;
        if (16 > oa) var d = c[a + oa];
        else {
          d = Ua[oa - 2];
          d = Qa(d, 17) ^ Qa(d, 19) ^ (d >>> 10);
          d = z(d, Ua[oa - 7]);
          var b = Ua[oa - 15];
          b = Qa(b, 7) ^ Qa(b, 18) ^ (b >>> 3);
          d = z(z(d, b), Ua[oa - 16]);
        }
        Ua[Sa] = d;
        Sa = Va;
        Sa = Qa(Sa, 6) ^ Qa(Sa, 11) ^ Qa(Sa, 25);
        Sa = z(z(z(z(Wa, Sa), (Va & Ya) ^ (~Va & Ta)), Xa[oa]), Ua[oa]);
        Wa = f;
        Wa = Qa(Wa, 2) ^ Qa(Wa, 13) ^ Qa(Wa, 22);
        d = z(Wa, (f & w) ^ (f & T) ^ (w & T));
        Wa = Ta;
        Ta = Ya;
        Ya = Va;
        Va = z(h, Sa);
        h = T;
        T = w;
        w = f;
        f = z(Sa, d);
      }
      n[0] = z(f, n[0]);
      n[1] = z(w, n[1]);
      n[2] = z(T, n[2]);
      n[3] = z(h, n[3]);
      n[4] = z(Va, n[4]);
      n[5] = z(Ya, n[5]);
      n[6] = z(Ta, n[6]);
      n[7] = z(Wa, n[7]);
    }
    c = "";
    for (Xa = 0; Xa < 4 * n.length; Xa++)
      c +=
        "0123456789abcdef".charAt(
          (n[Xa >> 2] >> (8 * (3 - (Xa % 4)) + 4)) & 15
        ) +
        "0123456789abcdef".charAt((n[Xa >> 2] >> (8 * (3 - (Xa % 4)))) & 15);
    return c;
  };
});
function MersenneTwisterObject(z, Qa) {
  function n(a, f) {
    var h = a & 65535,
      w = f & 65535;
    var c = h * w;
    var n = c >>> 16;
    n = (n + h * ((f & 4294901760) >>> 16)) & 65535;
    n += ((a & 4294901760) >>> 16) * w;
    n &= 65535;
    h = (n << 16) | (c & 65535);
    return 0 > h ? h + 4294967296 : h;
  }
  function Xa(w) {
    var h = 0 < arguments.length && isFinite(w) ? w & 4294967295 : 5489,
      c;
    a = [h];
    f = 624;
    for (c = 1; 624 > c; a[c] = h = n(h ^ (h >>> 30), 1812433253) + c++);
  }
  function c(f, h) {
    var w = f.length,
      c;
    Xa(1 < arguments.length && isFinite(h) ? h : 19650218);
    var T = a[0];
    var z = 1;
    var oa = 0;
    for (c = Math.max(624, w); c; oa %= w, c--)
      (a[z] = T =
        ((a[z++] ^ n(T ^ (T >>> 30), 1664525)) + f[oa] + oa++) & 4294967295),
        623 < z && ((a[0] = T = a[623]), (z = 1));
    for (c = 623; c; c--)
      (a[z] = T = ((a[z] ^ n(T ^ (T >>> 30), 1566083941)) - z++) & 4294967295),
        623 < z && ((a[0] = T = a[623]), (z = 1));
    a[0] = 2147483648;
  }
  function Ua() {
    for (var c, h; 624 <= f || 0 > f; ) {
      f = Math.max(0, f - 624);
      for (
        h = 0;
        227 > h;
        c = (a[h] & 2147483648) | (a[h + 1] & 2147483647),
          a[h] = a[h + 397] ^ (c >>> 1) ^ w[c & 1],
          h++
      );
      for (
        ;
        623 > h;
        c = (a[h] & 2147483648) | (a[h + 1] & 2147483647),
          a[h] = a[h + -227] ^ (c >>> 1) ^ w[c & 1],
          h++
      );
      c = (a[623] & 2147483648) | (a[0] & 2147483647);
      a[623] = a[396] ^ (c >>> 1) ^ w[c & 1];
    }
    c = a[f++];
    c ^= c >>> 11;
    c ^= (c << 7) & 2636928640;
    c ^= (c << 15) & 4022730752;
    c ^= c >>> 18;
    return 0 > c ? c + 4294967296 : c;
  }
  var a = [],
    f = NaN,
    w = [0, 2567483615];
  1 < arguments.length ? c(Qa, z) : 0 < arguments.length ? Xa(z) : Xa();
  return function () {
    return (67108864 * (Ua() >>> 5) + (Ua() >>> 6)) / 9007199254740992;
  };
}
Math.random = new MersenneTwisterObject(new Date().getTime());
var mathlib = (function () {
  function z(a, b, d, r, f, c) {
    var h = a[b];
    a[b] = a[f] ^ c;
    a[f] = a[r] ^ c;
    a[r] = a[d] ^ c;
    a[d] = h ^ c;
  }
  function Qa(a) {
    for (var b = arguments.length - 1, d = a[arguments[b]]; 1 < b; b--)
      a[arguments[b]] = a[arguments[b - 1]];
    a[arguments[1]] = d;
    return Qa;
  }
  function n(a, b, d, r) {
    d = d || 1;
    for (var f = b.length, c = [], h = 0; h < f; h++) c[h] = a[b[h]];
    for (h = 0; h < f; h++) {
      var w = (h + d) % f;
      a[b[w]] = c[h];
      r && (a[b[w]] += r[w] - r[h] + r[r.length - 1]);
    }
    return n;
  }
  function Xa(a, b) {
    return (a[b >> 3] >> ((b & 7) << 2)) & 15;
  }
  function c(a, b, d) {
    b = b || 8;
    for (var r = 0, f = 1985229328, c = 0; c < b - 1; ++c) {
      var h = a[c] << 2;
      r = (b - c) * r + ((f >> h) & 7);
      f -= 286331152 << h;
    }
    return 0 > d ? r >> 1 : r;
  }
  function Ua(a, b, d, r) {
    d = (d || 8) - 1;
    var f = 1985229328,
      c = 0;
    0 > r && (b <<= 1);
    for (var h = 0; h < d; ++h) {
      var w = Wa[d - h],
        Ra = ~~(b / w);
      c ^= Ra;
      b %= w;
      Ra <<= 2;
      a[h] = (f >> Ra) & 7;
      w = (1 << Ra) - 1;
      f = (f & w) + ((f >> 4) & ~w);
    }
    0 > r && 0 != (c & 1)
      ? ((a[d] = a[d - 1]), (a[d - 1] = f & 7))
      : (a[d] = f & 7);
    return a;
  }
  function a(a, b, d) {
    this.length = b;
    this.evenbase = d;
    this.get =
      "p" == a
        ? function (a) {
            return c(a, this.length, this.evenbase);
          }
        : function (a) {
            var b = this.evenbase,
              d = Math.abs(b);
            b = 0 > b ? 0 : a[0] % d;
            for (var r = this.length - 1; 0 < r; r--) b = b * d + (a[r] % d);
            return b;
          };
    this.set =
      "p" == a
        ? function (a, b) {
            return Ua(a, b, this.length, this.evenbase);
          }
        : function (a, b) {
            for (
              var d = b,
                r = this.length,
                f = this.evenbase,
                c = Math.abs(f),
                h = c * r,
                w = 1;
              w < r;
              w++
            )
              (a[w] = d % c), (h -= a[w]), (d = ~~(d / c));
            a[0] = (0 > f ? h : d) % c;
            return a;
          };
  }
  function f(b, d, r, f) {
    f = f || 6;
    if ($.isArray(r)) {
      var c = new a(r[1], r[2], r[3]);
      r = r[0];
      for (var h = 0; h < f; h++) {
        b[h] = [];
        for (var w = 0; w < d; w++) {
          var Ra = c.set([], w);
          r(Ra, h);
          b[h][w] = c.get(Ra);
        }
      }
    } else
      for (h = 0; h < f; h++)
        for (b[h] = [], w = 0; w < d; w++) b[h][w] = r(w, h);
  }
  function w() {
    this.ca = [0, 1, 2, 3, 4, 5, 6, 7];
    this.ea = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  }
  function T(a, b, d, r, f, c, h, w) {
    var Ra = $.isArray(f);
    c = c || 6;
    h = h || 3;
    w = w || 256;
    r = r || 256;
    for (var Sa = 0, n = (d + 7) >>> 3; Sa < n; Sa++) a[Sa] = -1;
    a[b >> 3] ^= 15 << ((b & 7) << 2);
    for (Sa = b = 0; Sa <= r; Sa++) {
      n = 0;
      var ib = Sa >= w,
        z = (Sa + 1) ^ 15,
        T = ib ? 15 : Sa,
        oa = ib ? Sa : 15,
        kb = 0;
      a: for (; kb < d; kb++, b >>= 4) {
        if (0 == (kb & 7) && ((b = a[kb >> 3]), !ib && -1 == b)) {
          kb += 7;
          continue;
        }
        if ((b & 15) == T)
          for (var Ta = 0; Ta < c; Ta++)
            for (var Wa = kb, Ya = 0; Ya < h; Ya++)
              if (((Wa = Ra ? f[Ta][Wa] : f(Wa, Ta)), Xa(a, Wa) == oa)) {
                ++n;
                if (ib) {
                  a[kb >> 3] ^= z << ((kb & 7) << 2);
                  continue a;
                }
                a[Wa >> 3] ^= z << ((Wa & 7) << 2);
              }
      }
      if (0 == n) break;
      DEBUG && console.log("[prun]", n);
    }
  }
  function h(a, b, d) {
    this.N_STATES = d.length;
    this.N_MOVES = a;
    this.N_POWER = b;
    this.state_params = d;
    this.inited = !1;
  }
  function Va(a, b, d) {
    this.solvedStates = a;
    this.doMove = b;
    this.moves = d;
    this.prunTable = {};
    this.prunTableSize = 0;
    this.prunDepth = -1;
  }
  function Ya(a) {
    return ~~(r.random() * a);
  }
  for (var Ta = [], Wa = [1], oa = 0; 32 > oa; ++oa) {
    Ta[oa] = [];
    for (var Sa = 0; 32 > Sa; ++Sa) Ta[oa][Sa] = 0;
  }
  for (oa = 0; 32 > oa; ++oa)
    for (
      Ta[oa][0] = Ta[oa][oa] = 1, Wa[oa + 1] = Wa[oa] * (oa + 1), Sa = 1;
      Sa < oa;
      ++Sa
    )
      Ta[oa][Sa] = Ta[oa - 1][Sa - 1] + Ta[oa - 1][Sa];
  w.EdgeMult = function (a, b, d) {
    for (var r = 0; 12 > r; r++) d.ea[r] = a.ea[b.ea[r] >> 1] ^ (b.ea[r] & 1);
  };
  w.CornMult = function (a, b, d) {
    for (var r = 0; 8 > r; r++)
      d.ca[r] =
        (a.ca[b.ca[r] & 7] & 7) |
        (((a.ca[b.ca[r] & 7] >> 3) + (b.ca[r] >> 3)) % 3 << 3);
  };
  w.CubeMult = function (a, b, d) {
    w.CornMult(a, b, d);
    w.EdgeMult(a, b, d);
  };
  w.prototype.init = function (a, b) {
    this.ca = a.slice();
    this.ea = b.slice();
    return this;
  };
  w.prototype.isEqual = function (a) {
    for (var b = 0; 8 > b; b++) if (this.ca[b] != a.ca[b]) return !1;
    for (b = 0; 12 > b; b++) if (this.ea[b] != a.ea[b]) return !1;
    return !0;
  };
  var d = [
      [8, 9, 20],
      [6, 18, 38],
      [0, 36, 47],
      [2, 45, 11],
      [29, 26, 15],
      [27, 44, 24],
      [33, 53, 42],
      [35, 17, 51],
    ],
    b = [
      [5, 10],
      [7, 19],
      [3, 37],
      [1, 46],
      [32, 16],
      [28, 25],
      [30, 43],
      [34, 52],
      [23, 12],
      [21, 41],
      [50, 39],
      [48, 14],
    ];
  w.prototype.toFaceCube = function (a, r) {
    a = a || d;
    r = r || b;
    for (var f = [], c = 0; 54 > c; c++) f[c] = "URFDLB"[~~(c / 9)];
    for (var h = 0; 8 > h; h++) {
      c = this.ca[h] & 7;
      for (var w = this.ca[h] >> 3, Ra = 0; 3 > Ra; Ra++)
        f[a[h][(Ra + w) % 3]] = "URFDLB"[~~(a[c][Ra] / 9)];
    }
    for (h = 0; 12 > h; h++)
      for (c = this.ea[h] >> 1, w = this.ea[h] & 1, Ra = 0; 2 > Ra; Ra++)
        f[r[h][(Ra + w) % 2]] = "URFDLB"[~~(r[c][Ra] / 9)];
    return f.join("");
  };
  w.prototype.invFrom = function (a) {
    for (var b = 0; 12 > b; b++)
      this.ea[a.ea[b] >> 1] = (b << 1) | (a.ea[b] & 1);
    for (b = 0; 8 > b; b++)
      this.ca[a.ca[b] & 7] = b | ((32 >> (a.ca[b] >> 3)) & 24);
    return this;
  };
  w.prototype.fromFacelet = function (a, r, f) {
    r = r || d;
    f = f || b;
    for (
      var h = 0,
        c = [],
        w = a[4] + a[13] + a[22] + a[31] + a[40] + a[49],
        Ra = 0;
      54 > Ra;
      ++Ra
    ) {
      c[Ra] = w.indexOf(a[Ra]);
      if (-1 == c[Ra]) return -1;
      h += 1 << (c[Ra] << 2);
    }
    if (10066329 != h) return -1;
    var Sa;
    for (Ra = 0; 8 > Ra; ++Ra) {
      for (Sa = 0; 3 > Sa && 0 != c[r[Ra][Sa]] && 3 != c[r[Ra][Sa]]; ++Sa);
      a = c[r[Ra][(Sa + 1) % 3]];
      h = c[r[Ra][(Sa + 2) % 3]];
      for (w = 0; 8 > w; ++w)
        if (a == ~~(r[w][1] / 9) && h == ~~(r[w][2] / 9)) {
          this.ca[Ra] = w | (Sa % 3 << 3);
          break;
        }
    }
    for (Ra = 0; 12 > Ra; ++Ra)
      for (w = 0; 12 > w; ++w) {
        if (c[f[Ra][0]] == ~~(f[w][0] / 9) && c[f[Ra][1]] == ~~(f[w][1] / 9)) {
          this.ea[Ra] = w << 1;
          break;
        }
        if (c[f[Ra][0]] == ~~(f[w][1] / 9) && c[f[Ra][1]] == ~~(f[w][0] / 9)) {
          this.ea[Ra] = (w << 1) | 1;
          break;
        }
      }
    return this;
  };
  Sa = [];
  for (oa = 0; 18 > oa; oa++) Sa[oa] = new w();
  Sa[0].init(
    [3, 0, 1, 2, 4, 5, 6, 7],
    [6, 0, 2, 4, 8, 10, 12, 14, 16, 18, 20, 22]
  );
  Sa[3].init(
    [20, 1, 2, 8, 15, 5, 6, 19],
    [16, 2, 4, 6, 22, 10, 12, 14, 8, 18, 20, 0]
  );
  Sa[6].init(
    [9, 21, 2, 3, 16, 12, 6, 7],
    [0, 19, 4, 6, 8, 17, 12, 14, 3, 11, 20, 22]
  );
  Sa[9].init(
    [0, 1, 2, 3, 5, 6, 7, 4],
    [0, 2, 4, 6, 10, 12, 14, 8, 16, 18, 20, 22]
  );
  Sa[12].init(
    [0, 10, 22, 3, 4, 17, 13, 7],
    [0, 2, 20, 6, 8, 10, 18, 14, 16, 4, 12, 22]
  );
  Sa[15].init(
    [0, 1, 11, 23, 4, 5, 18, 14],
    [0, 2, 4, 23, 8, 10, 12, 21, 16, 18, 7, 15]
  );
  for (oa = 0; 18 > oa; oa += 3)
    for (var Ra = 0; 2 > Ra; Ra++)
      w.EdgeMult(Sa[oa + Ra], Sa[oa], Sa[oa + Ra + 1]),
        w.CornMult(Sa[oa + Ra], Sa[oa], Sa[oa + Ra + 1]);
  w.moveCube = Sa;
  w.prototype.edgeCycles = function () {
    for (var a = [], b = [0, 0, 0], d = 0, r = !1, f = 0; 12 > f; ++f)
      if (!a[f]) {
        var c = -1,
          h = !1,
          w = f;
        do (a[w] = !0), ++c, (h ^= this.ea[w] & 1), (w = this.ea[w] >> 1);
        while (w != f);
        d += c >> 1;
        c & 1 && ((r = !r), ++d);
        h && (0 == c ? ++b[0] : c & 1 ? (b[2] ^= 1) : ++b[1]);
      }
    b[1] += b[2];
    d =
      b[0] < b[1]
        ? d + ((b[0] + b[1]) >> 1)
        : d + (b[1] + [0, 2, 3, 5, 6, 8, 9][(b[0] - b[1]) >> 1]);
    return d - r;
  };
  Sa = h.prototype;
  Sa.search = function (a, b, d) {
    d = (d || 99) + 1;
    if (!this.inited) {
      this.move = [];
      this.prun = [];
      for (var r = 0; r < this.N_STATES; r++) {
        var c = this.state_params[r],
          h = c[0],
          w = c[1],
          Ra = c[2],
          Sa = c[3];
        c = c[4];
        this.move[r] = [];
        this.prun[r] = [];
        f(this.move[r], Ra, w, this.N_MOVES);
        T(this.prun[r], h, Ra, Sa, this.move[r], this.N_MOVES, this.N_POWER, c);
      }
      this.inited = !0;
    }
    for (this.sol = []; b < d && !this.idaSearch(a, b, -1); b++);
    return b == d ? null : this.sol.reverse();
  };
  Sa.toStr = function (a, b, d) {
    for (var r = [], f = 0; f < a.length; f++) r.push(b[a[f][0]] + d[a[f][1]]);
    return r.join(" ").replace(/ +/g, " ");
  };
  Sa.idaSearch = function (a, b, d) {
    for (var r = this.N_STATES, f = 0; f < r; f++)
      if (Xa(this.prun[f], a[f]) > b) return !1;
    if (0 == b) return !0;
    for (var c = a[0] + b + d + 1, h = 0; h < this.N_MOVES; h++) {
      var w = (h + c) % this.N_MOVES;
      if (w != d)
        for (var Ra = a.slice(), Sa = 0; Sa < this.N_POWER; Sa++) {
          for (f = 0; f < r; f++) Ra[f] = this.move[f][w][Ra[f]];
          if (this.idaSearch(Ra, b - 1, w)) return this.sol.push([w, Sa]), !0;
        }
    }
    return !1;
  };
  Sa = Va.prototype;
  Sa.updatePrun = function (a) {
    a = void 0 === a ? this.prunDepth + 1 : a;
    for (var b = this.prunDepth + 1; b <= a; b++) {
      var d = +new Date(),
        r = this.prunTableSize;
      if (8 > b)
        for (var f = 0; f < this.solvedStates.length; f++)
          this.updatePrunDFS(this.solvedStates[f], b, 0, null);
      else this.updatePrunBFS(b - 1);
      this.prunDepth = b;
      DEBUG && console.log(b, this.prunTableSize - r, +new Date() - d);
    }
  };
  Sa.updatePrunBFS = function (a) {
    for (var b in this.prunTable)
      if (this.prunTable[b][0] == a)
        for (var d in this.moves) {
          var r = this.doMove(b, d);
          !r ||
            r in this.prunTable ||
            ((this.prunTable[r] = [a + 1, d]), this.prunTableSize++);
        }
  };
  Sa.updatePrunDFS = function (a, b, r, d) {
    a in this.prunTable || ((this.prunTable[a] = [r, d]), this.prunTableSize++);
    if (!(0 >= b || this.prunTable[a][1] != d)) {
      var f = null == d ? -1 : this.moves[d],
        c;
      for (c in this.moves) {
        var h = this.moves[c] ^ f;
        0 == h ||
          (0 == (h & 15) && c < d) ||
          ((h = this.doMove(a, c)) &&
            h != a &&
            this.updatePrunDFS(h, b - 1, r + 1, c));
      }
    }
  };
  Sa.search = function (a, b, d, r) {
    d = d + 1 || 99;
    this.sol = [];
    this.sols = [];
    this.nsol = r || 1;
    for (
      this.minl = b || 0;
      b < d &&
      (this.updatePrun(Math.ceil(b / 2)),
      (this.visited = {}),
      !this.idaSearch(a, b, null));
      b++
    );
    return this.sols.slice();
  };
  Sa.getPruning = function (a) {
    a = this.prunTable[a];
    return void 0 === a ? this.prunDepth + 1 : a[0];
  };
  Sa.idaSearch = function (a, b, d) {
    if (this.getPruning(a) > b || a in this.visited) return !1;
    this.visited[a] = 0;
    if (0 == b)
      return this.sols.push(this.sol.slice()), this.sols.length >= this.nsol;
    var r = null == d ? -1 : this.moves[d],
      f;
    for (f in this.moves) {
      var c = this.moves[f] ^ r;
      if (
        !(0 == c || (0 == (c & 15) && f < d)) &&
        (c = this.doMove(a, f)) &&
        c != a
      ) {
        this.sol.push(f);
        if (this.idaSearch(c, b - 1, f)) return !0;
        this.sol.pop();
      }
    }
    return !1;
  };
  var r = (function () {
      function a(a, f) {
        if (f && (f != r || d > a)) {
          for (var c = [], h = 0; h < f.length; h++) c[h] = f.charCodeAt(h);
          b = new MersenneTwisterObject(c[0], c);
          d = 0;
          r = f;
        }
        for (; d < a; ) b(), d++;
      }
      var b, d, r;
      a(0, "" + new Date().getTime());
      return {
        random: function () {
          d++;
          return b();
        },
        getSeed: function () {
          return [d, r];
        },
        setSeed: a,
      };
    })(),
    ab = /^\s*(\d+)-(\d+)-(\d+) (\d+):(\d+):(\d+)\s*$/;
  Math.TAU = 2 * Math.PI;
  return {
    Cnk: Ta,
    fact: Wa,
    getPruning: Xa,
    setNPerm: function (a, b, d) {
      var r, f;
      a[d - 1] = 0;
      for (r = d - 2; 0 <= r; --r)
        for (a[r] = b % (d - r), b = ~~(b / (d - r)), f = r + 1; f < d; ++f)
          a[f] >= a[r] && ++a[f];
    },
    getNPerm: function (a, b) {
      var d, r, f;
      for (d = r = 0; d < b; ++d)
        for (r *= b - d, f = d + 1; f < b; ++f) a[f] < a[d] && ++r;
      return r;
    },
    getNParity: function (a, b) {
      var d;
      var r = 0;
      for (d = b - 2; 0 <= d; --d) (r ^= a % (b - d)), (a = ~~(a / (b - d)));
      return r & 1;
    },
    get8Perm: c,
    set8Perm: Ua,
    coord: a,
    createMove: f,
    edgeMove: function (a, b) {
      0 == b
        ? z(a, 0, 7, 8, 4, 1)
        : 1 == b
        ? z(a, 3, 6, 11, 7, 0)
        : 2 == b
        ? z(a, 0, 1, 2, 3, 0)
        : 3 == b
        ? z(a, 2, 5, 10, 6, 1)
        : 4 == b
        ? z(a, 1, 4, 9, 5, 0)
        : 5 == b && z(a, 11, 10, 9, 8, 0);
    },
    circle: Qa,
    circleOri: z,
    acycle: n,
    createPrun: T,
    CubieCube: w,
    SOLVED_FACELET: "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB",
    fillFacelet: function (a, b, d, r, f) {
      for (var c = 0; c < a.length; c++)
        for (var h = 0; h < a[c].length; h++)
          b[a[c][(h + r[c]) % a[c].length]] = ~~(a[d[c]][h] / f);
    },
    rn: Ya,
    rndEl: function (a) {
      return a[~~(r.random() * a.length)];
    },
    rndProb: function (a) {
      for (var b = 0, d = 0, f = 0; f < a.length; f++)
        0 != a[f] && (r.random() < a[f] / (b + a[f]) && (d = f), (b += a[f]));
      return d;
    },
    time2str: function (a, b) {
      if (!a) return "N/A";
      var d = new Date(1e3 * a);
      return (b || "%Y-%M-%D %h:%m:%s")
        .replace("%Y", d.getFullYear())
        .replace("%M", ("0" + (d.getMonth() + 1)).slice(-2))
        .replace("%D", ("0" + d.getDate()).slice(-2))
        .replace("%h", ("0" + d.getHours()).slice(-2))
        .replace("%m", ("0" + d.getMinutes()).slice(-2))
        .replace("%s", ("0" + d.getSeconds()).slice(-2));
    },
    str2time: function (a) {
      a = ab.exec(a);
      if (!a) return null;
      var b = new Date(0);
      b.setFullYear(~~a[1]);
      b.setMonth(~~a[2] - 1);
      b.setDate(~~a[3]);
      b.setHours(~~a[4]);
      b.setMinutes(~~a[5]);
      b.setSeconds(~~a[6]);
      return ~~(b.getTime() / 1e3);
    },
    obj2str: function (a) {
      return "string" == typeof a ? a : JSON.stringify(a);
    },
    str2obj: function (a) {
      return "string" != typeof a ? a : JSON.parse(a);
    },
    valuedArray: function (a, b) {
      for (var d = [], r = 0; r < a; r++) d[r] = b;
      return d;
    },
    Solver: h,
    rndPerm: function (a) {
      for (var b = [], d = 0; d < a; d++) b[d] = d;
      for (d = 0; d < a - 1; d++) Qa(b, d, d + Ya(a - d));
      return b;
    },
    gSolver: Va,
    getSeed: r.getSeed,
    setSeed: r.setSeed,
  };
})();
var sbtree = (function () {
  function z(a, c) {
    this.k = a;
    this.v = c;
    this[0] = null;
    this[1] = null;
    this.cnt = 1;
    this.sum = a;
    this.sk2 = Math.pow(a, 2);
  }
  function Qa(a) {
    this.root = null;
    this.cmp = a;
  }
  function n(a) {
    return null == a ? 0 : a.cnt;
  }
  function Xa(a) {
    return null == a ? 0 : a.sum;
  }
  function c(a) {
    return null == a ? 0 : a.sk2;
  }
  function Ua(a, c, n) {
    return null == a || (Ua(a[n], c, n) && c(a) && Ua(a[n ^ 1], c, n));
  }
  function a(a, w) {
    var f = a[w ^ 1];
    a[w ^ 1] = f[w];
    f[w] = a;
    f.cnt = a.cnt;
    a.cnt = n(a[0]) + n(a[1]) + 1;
    f.sum = a.sum;
    a.sum = Xa(a[0]) + Xa(a[1]) + a.k;
    f.sk2 = a.sk2;
    a.sk2 = c(a[0]) + c(a[1]) + Math.pow(a.k, 2);
    return f;
  }
  Qa.prototype.find = function (a) {
    for (var c = this.root; null !== c; ) {
      if (a == c.k) return c.v;
      c = c[(0 > this.cmp(c.k, a)) ^ 0];
    }
  };
  Qa.prototype.cumSum = function (a) {
    if (a >= n(this.root) || 0 == n(this.root)) return Xa(this.root);
    for (var c = this.root, f = 0; 0 < a; ) {
      var h = n(c[0]);
      if (a < h) c = c[0];
      else {
        f += Xa(c[0]);
        if (a == h) break;
        f += c.k;
        a -= h + 1;
        c = c[1];
      }
    }
    return f;
  };
  Qa.prototype.cumSk2 = function (a) {
    if (a >= n(this.root) || 0 == n(this.root)) return c(this.root);
    for (var f = this.root, z = 0; 0 < a; ) {
      var h = n(f[0]);
      if (a < h) f = f[0];
      else {
        z += c(f[0]);
        if (a == h) break;
        z += Math.pow(f.k, 2);
        a -= h + 1;
        f = f[1];
      }
    }
    return z;
  };
  Qa.prototype.rank = function (a) {
    for (var c = this.root; c; ) {
      var f = n(c[0]);
      if (a < f) c = c[0];
      else {
        if (a == f) return c.k;
        a -= f + 1;
        c = c[1];
      }
    }
    return 0 > a ? -1e300 : 1e300;
  };
  Qa.prototype.rankOf = function (a) {
    for (var c = this.root, f = 0; c; )
      0 > this.cmp(c.k, a) ? ((f += n(c[0]) + 1), (c = c[1])) : (c = c[0]);
    return f;
  };
  Qa.prototype.traverse = function (a, c) {
    return Ua(this.root, a, c ^ 0);
  };
  Qa.prototype.insertR = function (c, w, T) {
    if (null === c) return new z(w, T);
    c.cnt += 1;
    c.sum += w;
    c.sk2 += Math.pow(w, 2);
    var h = (0 > this.cmp(c.k, w)) ^ 0;
    c[h] = this.insertR(c[h], w, T);
    n(c[h][h]) > n(c[h ^ 1])
      ? (c = a(c, h ^ 1))
      : n(c[h][h ^ 1]) > n(c[h ^ 1]) &&
        ((h ^= 1), (c[h ^ 1] = a(c[h ^ 1], h ^ 1)), (c = a(c, h)));
    return c;
  };
  Qa.prototype.insert = function (a, c) {
    this.root = this.insertR(this.root, a, c);
    return this;
  };
  Qa.prototype.remove = function (a) {
    this.root = this.removeR(this.root, a);
    return this;
  };
  Qa.prototype.removeR = function (a, c) {
    if (null == a) return null;
    --a.cnt;
    a.sum -= c;
    a.sk2 -= Math.pow(c, 2);
    if (a.k == c) {
      if (null == a[0] || null == a[1]) return a[(null == a[0]) ^ 0];
      for (var f = a[0]; null != f[1]; ) f = f[1];
      a.k = f.k;
      a.v = f.v;
      c = f.k;
    }
    f = (0 > this.cmp(a.k, c)) ^ 0;
    a[f] = this.removeR(a[f], c);
    return a;
  };
  return {
    tree: function (a) {
      return new Qa(a);
    },
  };
})();
var SQLFile = execMain(function () {
  function z(n, z, c) {
    var Ua = 0;
    if (c) for (var a = 0; a < c; a++) Ua = (Ua << 8) | n[z[0]++];
    else {
      do Ua = (Ua << 7) | (n[z[0]] & 127);
      while (128 <= n[z[0]++]);
    }
    return Ua;
  }
  function Qa(n, Xa, c) {
    Xa = 1 == Xa ? 100 : (Xa - 1) * z(n, [16], 2);
    var Ua = n[Xa],
      a = (n[Xa + 3] << 8) | n[Xa + 4],
      f = [Xa + 8],
      w = -1;
    Ua & 8 || (w = z(n, f, 4));
    for (var T = 0; T < a; T++) {
      var h = [(100 == Xa ? 0 : Xa) + z(n, [f[0] + 2 * T], 2)];
      if (2 != Ua && 10 != Ua)
        if (5 == Ua) (h = z(n, h, 4)), Qa(n, h, c);
        else if (13 == Ua) {
          var Va = z(n, h),
            Ya = n,
            Ta = h[0],
            Wa = c,
            oa = [Ta],
            Sa = z(Ya, oa),
            d = Ta + Sa;
          Ta = oa;
          oa = [];
          for (Sa = []; Ta[0] < d; ) oa.push(z(Ya, Ta));
          for (d = 0; d < oa.length; d++) {
            var b = oa[d];
            0 == b
              ? (Sa[d] = null)
              : 1 <= b && 4 >= b
              ? (Sa[d] = z(Ya, Ta, b))
              : 5 == b
              ? ((Sa[d] = void 0), z(Ya, Ta, 6))
              : 6 == b
              ? ((Sa[d] = void 0), z(Ya, Ta, 8))
              : 7 == b
              ? ((Sa[d] = void 0), z(Ya, Ta, 8))
              : 8 == b
              ? (Sa[d] = 0)
              : 9 == b
              ? (Sa[d] = 1)
              : 10 != b &&
                11 != b &&
                (0 == oa[d] % 2
                  ? ((Sa[d] = Ya.slice(Ta[0], Ta[0] + (b - 12) / 2)),
                    (Ta[0] += (b - 12) / 2))
                  : ((Sa[d] = String.fromCharCode.apply(
                      null,
                      Ya.slice(Ta[0], Ta[0] + (b - 13) / 2)
                    )),
                    (Ta[0] += (b - 13) / 2)));
          }
          Wa(Sa);
          h[0] += Va;
        }
    }
    -1 != w && Qa(n, w, c);
  }
  return {
    loadTableList: function (n) {
      var z = {};
      Qa(n, 1, function (c) {
        z[c[2]] = [c[3], c[4]];
      });
      return z;
    },
    loadPage: Qa,
  };
});
var TimerDataConverter = execMain(function () {
  function z(c) {
    try {
      return decodeURIComponent(escape(c));
    } catch (Ua) {}
    return c;
  }
  function Qa(c, n) {
    c = z(c).split(/\r?\n/g);
    for (var a = [], f = [], w = [], T = 0, h = 0; h < c.length; h++) {
      for (var Va = c[h].split(n), Ya = 0; Ya < Va.length; Ya++)
        w.push(Va[Ya]),
          (T += (Va[Ya].match(/"/g) || []).length),
          0 == T % 2 &&
            ((w = w.join(",")),
            '"' == w[0] && (w = w.replace(/""/g, '"').slice(1, -1)),
            f.push(w),
            (w = []));
      0 == T % 2 && (a.push(f), (f = []), (w = []), (T = 0));
    }
    return a;
  }
  var n = /^(DNF)?\(?(\d*?):?(\d*?):?(\d*\.?\d*?)(\+)?\)?$/,
    Xa = {
      csTimer: [
        /^{"session1"/i,
        function (c) {
          c = JSON.parse(z(c));
          var n = {};
          try {
            n = mathlib.str2obj(mathlib.str2obj(c.properties).sessionData);
          } catch (Wa) {}
          var a = [],
            f;
          for (f in c) {
            var w = /^session(\d+)$/.exec(f);
            if (w) {
              var T = {},
                h = [];
              try {
                h = mathlib.str2obj(c[f]);
              } catch (Wa) {}
              if ($.isArray(h) && 0 != h.length) {
                for (var Va = [], Ya = 0; Ya < h.length; Ya++) {
                  var Ta = h[Ya];
                  $.isArray(Ta) &&
                    $.isArray(Ta[0]) &&
                    ((Ta[0] = $.map(Ta[0], Number)), Va.push(Ta));
                }
                T.times = Va;
                ~~w[1] in n
                  ? ((h = n[~~w[1]]),
                    (T.name = h.name || w[1]),
                    (T.opt = h.opt || {
                      scrType: h.scr || "333",
                      phases: h.phases || 1,
                    }),
                    (T.rank = h.rank))
                  : ((T.name = w[1]), (T.opt = {}), (T.rank = a.length + 1));
                a.push(T);
              }
            }
          }
          a.sort(function (a, c) {
            return a.rank - c.rank;
          });
          return a;
        },
      ],
      csTimerCSV: [
        /^No\.;Time;Comment;Scramble;Date;P\.1/i,
        function (c) {
          c = Qa(c, ";");
          for (var z = [], a = c[0].length - 5, f = 1; f < c.length; f++) {
            var w = c[f],
              T = [],
              h = n.exec(w[1]);
            if (h) {
              for (T[0] = h[1] ? -1 : h[5] ? 2e3 : 0; "" == w[w.length - 1]; )
                w.pop();
              for (var Va = 5; Va < w.length; Va++)
                (h = n.exec(w[Va])),
                  (h = Math.round(
                    36e5 * ~~h[2] + 6e4 * ~~h[3] + 1e3 * parseFloat(h[4])
                  )),
                  (T[w.length - Va] = (T[w.length - Va + 1] || 0) + h);
              T = [T, w[3], w[2], mathlib.str2time(w[4])];
              z.push(T);
            } else console.log("Invalid data detected");
          }
          return [{ name: "import", opt: { phases: a }, times: z }];
        },
      ],
      ZYXTimer: [/^Session: /i, function (c) {}],
      TwistyTimer: [
        /^Puzzle,Category,Time\(millis\),Date\(millis\),Scramble,Penalty,Comment/i,
        function (c) {
          c = Qa(c, ";");
          for (
            var n = {
                333: "333",
                222: "222so",
                444: "444wca",
                555: "555wca",
                pyra: "pyrso",
                skewb: "skbso",
                mega: "mgmp",
                sq1: "sqrs",
                clock: "clkwca",
                666: "666wca",
                777: "777wca",
              },
              a = {},
              f = [],
              w = 1;
            w < c.length;
            w++
          ) {
            var z = c[w];
            if (7 == z.length) {
              var h = z[0] + "-" + z[1],
                Va = [{ 0: 0, 1: 2e3, 2: -1 }[z[5]], Math.round(z[2])];
              h in a ||
                ((a[h] = f.length),
                f.push({
                  name: h,
                  opt: { scrType: n[z[0]] || "333" },
                  times: [],
                }));
              f[a[h]].times.push([Va, z[4], z[6], Math.round(z[3] / 1e3)]);
            }
          }
          return f;
        },
      ],
      BlockKeeper: [
        /^{"puzzles":\[{"name":/i,
        function (c) {
          c = JSON.parse(z(c)).puzzles;
          var n = {
              "3x3x3": "333",
              "2x2x2": "222so",
              "4x4x4": "444wca",
              "5x5x5": "555wca",
              Pyraminx: "pyrso",
              Skewb: "skbso",
              Megaminx: "mgmp",
              "Square-1": "sqrs",
              Clock: "clkwca",
              "6x6x6": "666wca",
              "7x7x7": "777wca",
              "3x3x3 BLD": "333ni",
              "4x4x4 BLD": "444bld",
              "5x5x5 BLD": "555bld",
            },
            a = [];
          $.each(c, function (c, w) {
            var f = w.name,
              h = w.scrambler,
              z = w.splits;
            $.each(w.sessions, function (c, w) {
              var Ta = w.name,
                oa = [];
              $.each(w.records, function (a, d) {
                var b = [
                  { OK: 0, "+2": 2e3, DNF: -1 }[d.result],
                  Math.round(1e3 * d.time),
                ];
                Array.prototype.push.apply(
                  b,
                  $.map(d.split.reverse(), function (a) {
                    return Math.round(1e3 * a);
                  })
                );
                oa.push([
                  b,
                  d.scramble,
                  d.comment || "",
                  Math.round(d.date / 1e3),
                ]);
              });
              0 != oa.length &&
                a.push({
                  name: f + "-" + Ta,
                  opt: { phases: z, scrType: n[h] || "333" },
                  times: oa,
                });
            });
          });
          return a;
        },
      ],
      PrismaTimer: [/^[^\t\n]*(\t[^\t\n]*){4}\n/i, function (c) {}],
      "DCTimer.raw": [
        /^\d+[\r\n]+[^\t\n]*(\t[^\t\n]*){11}[\r\n]+/i,
        function (c) {
          c = z(c).split(/[\r\n]+/);
          for (var n = {}, a = 0, f = [], w = 0; w < c.length; w++)
            if (/^\d+$/.exec(c[w]))
              (a = ~~c[w]),
                (n[a] = f.length),
                f.push({ name: a, opt: {}, times: [] });
            else {
              var T = c[w].split("\t");
              6 > T.length ||
                f[n[a]].times.push([
                  ["1" == T[2] ? ("1" == T[1] ? 2e3 : 0) : -1, ~~T[0]],
                  T[3],
                  T[5],
                  mathlib.str2time(T[4]),
                ]);
            }
          return f;
        },
      ],
      "DCTimer.sqlite": [
        /^SQLite format 3\0/i,
        function (c) {
          for (var n = new Uint8Array(c.length), a = 0; a < c.length; a++)
            n[a] = c.charCodeAt(a);
          c = SQLFile.loadTableList(n);
          var f = {},
            w = [],
            T = function (a, c) {
              a in f ||
                ((f[a] = w.length),
                w.push({ name: c || a + 1, opt: {}, times: [] }));
            };
          SQLFile.loadPage(n, c.sessiontb[0], function (a) {
            T(a[0], z(a[1]));
          });
          for (var h in c)
            if ((a = /^result(\d+|tb)$/.exec(h))) {
              var Va = ("tb" == a[1] ? 1 : ~~a[1]) - 1;
              SQLFile.loadPage(n, c[h][0], function (a) {
                T(Va);
                w[f[Va]].times.push([
                  ["1" == a[3] ? ("1" == a[2] ? 2e3 : 0) : -1, ~~a[1]],
                  z(a[4] || ""),
                  z(a[6] || ""),
                  mathlib.str2time(a[5]),
                ]);
              });
            }
          SQLFile.loadPage(n, c.resultstb[0], function (a) {
            var c = a[1];
            T(c);
            w[f[c]].times.push([
              ["1" == a[4] ? ("1" == a[3] ? 2e3 : 0) : -1, ~~a[2]],
              z(a[5] || ""),
              z(a[7] || ""),
              mathlib.str2time(a[6]),
            ]);
          });
          return w;
        },
      ],
      "mateus.cubetimer": [
        /^"Category";"Time \(MM:SS\.SSS\)";"Scrambler";"Date";"Penalty \+2 \(yes or no\)";"DNF \(yes or no\)";"Section"\n/i,
        function (c) {
          c = Qa(c, ";");
          for (
            var z = {
                "3x3x3": "333",
                "2x2x2": "222so",
                "4x4x4": "444wca",
                "5x5x5": "555wca",
                Pyraminx: "pyrso",
                Skewb: "skbso",
                Megaminx: "mgmp",
                "Square-1": "sqrs",
                "Rubik's Clock": "clkwca",
                "6x6x6": "666wca",
                "7x7x7": "777wca",
                "3x3x3 Blindfolded": "333ni",
                "4x4x4 Blindfolded": "444bld",
                "5x5x5 Blindfolded": "555bld",
                "3x3x3 One-Handed": "333oh",
                "3x3x3 Multi-Blindfolded": "r3ni",
                "3x3x3 With Feet": "333ft",
                "3x3x3 Fewest Moves": "333fm",
              },
              a = {},
              f = [],
              w = 1;
            w < c.length;
            w++
          ) {
            var T = c[w];
            if (!(7 > T.length)) {
              var h = T[0] + "-" + T[6],
                Va = n.exec(T[1]);
              if (Va) {
                Va = Math.round(
                  36e5 * ~~Va[2] + 6e4 * ~~Va[3] + 1e3 * parseFloat(Va[4])
                );
                var Ya = T[2],
                  Ta = 0;
                "yes" == T[5] ? (Ta = -1) : "yes" == T[4] && (Ta = 2e3);
                h in a ||
                  ((a[h] = f.length),
                  f.push({
                    name: h,
                    opt: { scrType: z[T[0]] || "333" },
                    times: [],
                  }));
                f[a[h]].times.push([
                  [Ta, Va],
                  Ya,
                  "",
                  mathlib.str2time(T[3] + ":00"),
                ]);
              } else console.log("Invalid data detected");
            }
          }
          return f;
        },
      ],
    };
  return function (c) {
    var n = void 0,
      a;
    for (a in Xa)
      if (Xa[a][0].exec(c)) {
        console.log("try read by " + a);
        try {
          n = Xa[a][1](c);
          break;
        } catch (f) {
          console.log(f);
        }
      }
    return n;
  };
});
var LZString = (function () {
  function z(c, z) {
    if (!n[c]) {
      n[c] = {};
      for (var a = 0; a < c.length; a++) n[c][c.charAt(a)] = a;
    }
    return n[c][z];
  }
  var Qa = String.fromCharCode,
    n = {},
    Xa = {
      compressToBase64: function (c) {
        if (null == c) return "";
        c = Xa._compress(c, 6, function (c) {
          return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(
            c
          );
        });
        switch (c.length % 4) {
          default:
          case 0:
            return c;
          case 1:
            return c + "===";
          case 2:
            return c + "==";
          case 3:
            return c + "=";
        }
      },
      decompressFromBase64: function (c) {
        return null == c
          ? ""
          : "" == c
          ? null
          : Xa._decompress(c.length, 32, function (n) {
              return z(
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
                c.charAt(n)
              );
            });
      },
      compressToUTF16: function (c) {
        return null == c
          ? ""
          : Xa._compress(c, 15, function (c) {
              return Qa(c + 32);
            }) + " ";
      },
      decompressFromUTF16: function (c) {
        return null == c
          ? ""
          : "" == c
          ? null
          : Xa._decompress(c.length, 16384, function (n) {
              return c.charCodeAt(n) - 32;
            });
      },
      compressToUint8Array: function (c) {
        c = Xa.compress(c);
        for (
          var n = new Uint8Array(2 * c.length), a = 0, f = c.length;
          a < f;
          a++
        ) {
          var w = c.charCodeAt(a);
          n[2 * a] = w >>> 8;
          n[2 * a + 1] = w % 256;
        }
        return n;
      },
      decompressFromUint8Array: function (c) {
        if (null === c || void 0 === c) return Xa.decompress(c);
        for (var n = Array(c.length / 2), a = 0, f = n.length; a < f; a++)
          n[a] = 256 * c[2 * a] + c[2 * a + 1];
        var w = [];
        n.forEach(function (a) {
          w.push(Qa(a));
        });
        return Xa.decompress(w.join(""));
      },
      compressToEncodedURIComponent: function (c) {
        return null == c
          ? ""
          : Xa._compress(c, 6, function (c) {
              return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$".charAt(
                c
              );
            });
      },
      decompressFromEncodedURIComponent: function (c) {
        if (null == c) return "";
        if ("" == c) return null;
        c = c.replace(/ /g, "+");
        return Xa._decompress(c.length, 32, function (n) {
          return z(
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$",
            c.charAt(n)
          );
        });
      },
      compress: function (c) {
        return Xa._compress(c, 16, function (c) {
          return Qa(c);
        });
      },
      _compress: function (c, n, a) {
        if (null == c) return "";
        var f,
          w = {},
          z = {},
          h = "",
          Va = 2,
          Ya = 3,
          Ta = 2,
          Wa = [],
          oa = 0,
          Sa = 0,
          d;
        for (d = 0; d < c.length; d += 1) {
          var b = c.charAt(d);
          Object.prototype.hasOwnProperty.call(w, b) ||
            ((w[b] = Ya++), (z[b] = !0));
          var Ra = h + b;
          if (Object.prototype.hasOwnProperty.call(w, Ra)) h = Ra;
          else {
            if (Object.prototype.hasOwnProperty.call(z, h)) {
              if (256 > h.charCodeAt(0)) {
                for (f = 0; f < Ta; f++)
                  (oa <<= 1),
                    Sa == n - 1 ? ((Sa = 0), Wa.push(a(oa)), (oa = 0)) : Sa++;
                var r = h.charCodeAt(0);
                for (f = 0; 8 > f; f++)
                  (oa = (oa << 1) | (r & 1)),
                    Sa == n - 1 ? ((Sa = 0), Wa.push(a(oa)), (oa = 0)) : Sa++,
                    (r >>= 1);
              } else {
                r = 1;
                for (f = 0; f < Ta; f++)
                  (oa = (oa << 1) | r),
                    Sa == n - 1 ? ((Sa = 0), Wa.push(a(oa)), (oa = 0)) : Sa++,
                    (r = 0);
                r = h.charCodeAt(0);
                for (f = 0; 16 > f; f++)
                  (oa = (oa << 1) | (r & 1)),
                    Sa == n - 1 ? ((Sa = 0), Wa.push(a(oa)), (oa = 0)) : Sa++,
                    (r >>= 1);
              }
              Va--;
              0 == Va && ((Va = Math.pow(2, Ta)), Ta++);
              delete z[h];
            } else
              for (r = w[h], f = 0; f < Ta; f++)
                (oa = (oa << 1) | (r & 1)),
                  Sa == n - 1 ? ((Sa = 0), Wa.push(a(oa)), (oa = 0)) : Sa++,
                  (r >>= 1);
            Va--;
            0 == Va && ((Va = Math.pow(2, Ta)), Ta++);
            w[Ra] = Ya++;
            h = String(b);
          }
        }
        if ("" !== h) {
          if (Object.prototype.hasOwnProperty.call(z, h)) {
            if (256 > h.charCodeAt(0)) {
              for (f = 0; f < Ta; f++)
                (oa <<= 1),
                  Sa == n - 1 ? ((Sa = 0), Wa.push(a(oa)), (oa = 0)) : Sa++;
              r = h.charCodeAt(0);
              for (f = 0; 8 > f; f++)
                (oa = (oa << 1) | (r & 1)),
                  Sa == n - 1 ? ((Sa = 0), Wa.push(a(oa)), (oa = 0)) : Sa++,
                  (r >>= 1);
            } else {
              r = 1;
              for (f = 0; f < Ta; f++)
                (oa = (oa << 1) | r),
                  Sa == n - 1 ? ((Sa = 0), Wa.push(a(oa)), (oa = 0)) : Sa++,
                  (r = 0);
              r = h.charCodeAt(0);
              for (f = 0; 16 > f; f++)
                (oa = (oa << 1) | (r & 1)),
                  Sa == n - 1 ? ((Sa = 0), Wa.push(a(oa)), (oa = 0)) : Sa++,
                  (r >>= 1);
            }
            Va--;
            0 == Va && ((Va = Math.pow(2, Ta)), Ta++);
            delete z[h];
          } else
            for (r = w[h], f = 0; f < Ta; f++)
              (oa = (oa << 1) | (r & 1)),
                Sa == n - 1 ? ((Sa = 0), Wa.push(a(oa)), (oa = 0)) : Sa++,
                (r >>= 1);
          Va--;
          0 == Va && Ta++;
        }
        r = 2;
        for (f = 0; f < Ta; f++)
          (oa = (oa << 1) | (r & 1)),
            Sa == n - 1 ? ((Sa = 0), Wa.push(a(oa)), (oa = 0)) : Sa++,
            (r >>= 1);
        for (;;)
          if (((oa <<= 1), Sa == n - 1)) {
            Wa.push(a(oa));
            break;
          } else Sa++;
        return Wa.join("");
      },
      decompress: function (c) {
        return null == c
          ? ""
          : "" == c
          ? null
          : Xa._decompress(c.length, 32768, function (n) {
              return c.charCodeAt(n);
            });
      },
      _decompress: function (c, n, a) {
        var f = [],
          w = 4,
          z = 4,
          h = 3,
          Va = [],
          Ya,
          Ta,
          Wa = a(0),
          oa = n,
          Sa = 1;
        for (Ya = 0; 3 > Ya; Ya += 1) f[Ya] = Ya;
        var d = 0;
        var b = Math.pow(2, 2);
        for (Ta = 1; Ta != b; ) {
          var Ra = Wa & oa;
          oa >>= 1;
          0 == oa && ((oa = n), (Wa = a(Sa++)));
          d |= (0 < Ra ? 1 : 0) * Ta;
          Ta <<= 1;
        }
        switch (d) {
          case 0:
            d = 0;
            b = Math.pow(2, 8);
            for (Ta = 1; Ta != b; )
              (Ra = Wa & oa),
                (oa >>= 1),
                0 == oa && ((oa = n), (Wa = a(Sa++))),
                (d |= (0 < Ra ? 1 : 0) * Ta),
                (Ta <<= 1);
            var r = Qa(d);
            break;
          case 1:
            d = 0;
            b = Math.pow(2, 16);
            for (Ta = 1; Ta != b; )
              (Ra = Wa & oa),
                (oa >>= 1),
                0 == oa && ((oa = n), (Wa = a(Sa++))),
                (d |= (0 < Ra ? 1 : 0) * Ta),
                (Ta <<= 1);
            r = Qa(d);
            break;
          case 2:
            return "";
        }
        Ya = f[3] = r;
        for (Va.push(r); ; ) {
          if (Sa > c) return "";
          d = 0;
          b = Math.pow(2, h);
          for (Ta = 1; Ta != b; )
            (Ra = Wa & oa),
              (oa >>= 1),
              0 == oa && ((oa = n), (Wa = a(Sa++))),
              (d |= (0 < Ra ? 1 : 0) * Ta),
              (Ta <<= 1);
          switch ((r = d)) {
            case 0:
              d = 0;
              b = Math.pow(2, 8);
              for (Ta = 1; Ta != b; )
                (Ra = Wa & oa),
                  (oa >>= 1),
                  0 == oa && ((oa = n), (Wa = a(Sa++))),
                  (d |= (0 < Ra ? 1 : 0) * Ta),
                  (Ta <<= 1);
              f[z++] = Qa(d);
              r = z - 1;
              w--;
              break;
            case 1:
              d = 0;
              b = Math.pow(2, 16);
              for (Ta = 1; Ta != b; )
                (Ra = Wa & oa),
                  (oa >>= 1),
                  0 == oa && ((oa = n), (Wa = a(Sa++))),
                  (d |= (0 < Ra ? 1 : 0) * Ta),
                  (Ta <<= 1);
              f[z++] = Qa(d);
              r = z - 1;
              w--;
              break;
            case 2:
              return Va.join("");
          }
          0 == w && ((w = Math.pow(2, h)), h++);
          if (f[r]) r = f[r];
          else if (r === z) r = Ya + Ya.charAt(0);
          else return null;
          Va.push(r);
          f[z++] = Ya + r.charAt(0);
          w--;
          Ya = r;
          0 == w && ((w = Math.pow(2, h)), h++);
        }
      },
    };
  return Xa;
})();
var min2phase = (function () {
  function z() {
    this.move = [];
    this.moveSol = [];
    this.nodeUD = [];
    this.valid1 = 0;
    this.allowShorter = !1;
    this.cc = new a();
    this.urfCubieCube = [];
    this.urfCoordCube = [];
    this.phase1Cubie = [];
    this.preMoveCubes = [];
    this.preMoves = [];
    this.maxPreMoves = this.preMoveLen = 0;
    this.isRec = !1;
    for (var b = 0; 21 > b; b++)
      (this.nodeUD[b] = new Wa()), (this.phase1Cubie[b] = new a());
    for (b = 0; 6 > b; b++)
      (this.urfCubieCube[b] = new a()), (this.urfCoordCube[b] = new Wa());
    for (b = 0; 20 > b; b++) this.preMoveCubes[b + 1] = new a();
  }
  function Qa(a, b, c) {
    return c ? (b << 1) | (a & 1) : b | (a & 248);
  }
  function n(a, b) {
    return b ? a >> 1 : a & 7;
  }
  function Xa(a, b, c) {
    a[b >> 3] ^= c << (b << 2);
  }
  function c(a, b, c) {
    return Math.min(a, (b[c >> 3] >> (c << 2)) & 15);
  }
  function Ua(a, b, c) {
    a = Pb[a];
    c && (a ^= (14540032 >> ((a & 15) << 1)) & 3);
    return (a & 65520) | pb[a & 15][b];
  }
  function a() {
    this.ca = [0, 1, 2, 3, 4, 5, 6, 7];
    this.ea = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22];
  }
  function f(a, b, c, d) {
    c--;
    for (var r = 1985229328, h = 0; h < c; ++h) {
      var f = ab[c - h],
        n = ~~(b / f);
      b %= f;
      n <<= 2;
      a[h] = Qa(a[h], (r >> n) & 15, d);
      f = (1 << n) - 1;
      r = (r & f) + ((r >> 4) & ~f);
    }
    a[c] = Qa(a[c], r & 15, d);
  }
  function w(a, b, c) {
    for (var d = 0, r = 1985229328, h = 0; h < b - 1; ++h) {
      var f = n(a[h], c) << 2;
      d = (b - h) * d + ((r >> f) & 15);
      r -= 286331152 << f;
    }
    return d;
  }
  function T(a, b, c, d) {
    a[c - 1] = Qa(a[c - 1], 0, d);
    for (var r = c - 2; 0 <= r; --r) {
      a[r] = Qa(a[r], b % (c - r), d);
      b = ~~(b / (c - r));
      for (var h = r + 1; h < c; ++h)
        n(a[h], d) >= n(a[r], d) && (a[h] = Qa(a[h], n(a[h], d) + 1, d));
    }
  }
  function h(a, b, c) {
    for (var d = 0, r = 0; r < b; ++r) {
      d *= b - r;
      for (var h = r + 1; h < b; ++h) n(a[h], c) < n(a[r], c) && ++d;
    }
    return d;
  }
  function Va(a, b, c) {
    for (var d = 0, h = 4, f = a.length - 1; 0 <= f; f--)
      (n(a[f], c) & 12) == b && (d += r[f][h--]);
    return d;
  }
  function Ya(a, b, c, d) {
    for (var h = a.length - 1, f = 4, n = h; 0 <= h; h--)
      b >= r[h][f]
        ? ((b -= r[h][f--]), (a[h] = Qa(a[h], f | c, d)))
        : ((n & 12) == c && (n -= 4), (a[h] = Qa(a[h], n--, d)));
  }
  function Ta(a, b) {
    for (var c = 0, d = b - 2; 0 <= d; d--)
      (c ^= a % (b - d)), (a = ~~(a / (b - d)));
    return c & 1;
  }
  function Wa() {
    this.flipc =
      this.twistc =
      this.prun =
      this.slice =
      this.fsym =
      this.flip =
      this.tsym =
      this.twist =
        0;
  }
  function oa() {
    var b = new a(),
      c = new a(),
      d,
      r = new a().initCoord(28783, 0, 259268407, 0),
      h = new a().initCoord(15138, 0, 119765538, 7),
      n = new a().initCoord(5167, 0, 83473207, 0);
    for (d = 0; 8 > d; d++) n.ca[d] |= 24;
    for (d = 0; 16 > d; d++)
      (eb[d] = new a().init(b.ca, b.ea)),
        a.CornMultFull(b, h, c),
        a.EdgeMult(b, h, c),
        b.init(c.ca, c.ea),
        3 == d % 4 &&
          (a.CornMultFull(b, n, c), a.EdgeMult(b, n, c), b.init(c.ca, c.ea)),
        7 == d % 8 &&
          (a.CornMultFull(b, r, c), a.EdgeMult(b, r, c), b.init(c.ca, c.ea));
    for (d = 0; 16 > d; d++)
      (pb[d] = []), (fb[d] = []), (vb[d] = []), (zb[d] = []), (Za[d] = []);
    for (d = 0; 16 > d; d++)
      for (r = 0; 16 > r; r++)
        (pb[d][r] = d ^ r ^ ((84660 >> r) & (d << 1) & 2)),
          (fb[pb[d][r]][r] = d);
    b = new a();
    for (h = 0; 16 > h; h++)
      for (r = 0; 18 > r; r++) {
        a.CornConjugate(cb[r], fb[0][h], b);
        n = 0;
        a: for (; 18 > n; n++) {
          for (d = 0; 8 > d; d++) if (cb[n].ca[d] != b.ca[d]) continue a;
          vb[h][r] = n;
          Za[h][bb[r]] = bb[n];
          break;
        }
        0 == h % 2 && (zb[(r << 3) | (h >> 1)] = vb[h][r]);
      }
    d = function (b, d, c, r, h, f, n) {
      for (
        var Ra = new a(),
          w = new a(),
          Sa = 0,
          z = 2 <= h ? 1 : 2,
          oa = 1 != h ? a.EdgeConjugate : a.CornConjugate,
          Ta = 0;
        Ta < b;
        Ta++
      )
        if (void 0 === c[Ta]) {
          f.call(Ra, Ta);
          for (var Wa = 0; 16 > Wa; Wa += z) {
            oa(Ra, Wa, w);
            var T = n.call(w);
            0 == h && (Bb[(Sa << 3) | (Wa >> 1)] = T);
            T == Ta && (r[Sa] |= 1 << (Wa / z));
            c[T] = ((Sa << 4) | Wa) / z;
          }
          d[Sa++] = Ta;
        }
      return Sa;
    };
    d(2048, xb, Ab, tb, 0, a.prototype.setFlip, a.prototype.getFlip);
    d(2187, sb, rb, Kb, 1, a.prototype.setTwist, a.prototype.getTwist);
    d(40320, nb, wb, Gb, 2, a.prototype.setEPerm, a.prototype.getEPerm);
    r = new a();
    for (d = 0; 2768 > d; d++)
      f(r.ea, nb[d], 8, !0),
        (Fb[d] = Va(r.ea, 0, !0) + 70 * Ta(nb[d], 8)),
        b.invFrom(r),
        (Pb[d] = wb[b.getEPerm()]);
    d = function (a, d, r, h, f, n, Ra, w) {
      for (var Sa = 0; Sa < r; Sa++) {
        a[Sa] = [];
        f.call(b, d[Sa]);
        for (var z = 0; z < h; z++)
          Ra(b, cb[w ? w[z] : z], c), (a[Sa][z] = n.call(c));
      }
    };
    b = new a();
    c = new a();
    d(Mb, xb, 336, 18, a.prototype.setFlip, a.prototype.getFlipSym, a.EdgeMult);
    d(
      Ob,
      sb,
      324,
      18,
      a.prototype.setTwist,
      a.prototype.getTwistSym,
      a.CornMult
    );
    d(
      Hb,
      nb,
      2768,
      10,
      a.prototype.setEPerm,
      a.prototype.getEPermSym,
      a.EdgeMult,
      ib
    );
    d(
      Ib,
      nb,
      2768,
      10,
      a.prototype.setCPerm,
      a.prototype.getCPermSym,
      a.CornMult,
      ib
    );
    for (d = 0; 495 > d; d++) {
      Cb[d] = [];
      Eb[d] = [];
      b.setUDSlice(d);
      for (r = 0; 18 > r; r++)
        a.EdgeMult(b, cb[r], c), (Cb[d][r] = c.getUDSlice());
      for (r = 0; 16 > r; r += 2)
        a.EdgeConjugate(b, fb[0][r], c), (Eb[d][r >> 1] = c.getUDSlice());
    }
    for (d = 0; 24 > d; d++) {
      Xb[d] = [];
      Qb[d] = [];
      b.setMPerm(d);
      for (r = 0; 10 > r; r++)
        a.EdgeMult(b, cb[ib[r]], c), (Xb[d][r] = c.getMPerm());
      for (r = 0; 16 > r; r++)
        a.EdgeConjugate(b, fb[0][r], c), (Qb[d][r] = c.getMPerm());
    }
    for (d = 0; 140 > d; d++) {
      fc[d] = [];
      Yb[d] = [];
      b.setCComb(d % 70);
      for (r = 0; 10 > r; r++)
        a.CornMult(b, cb[ib[r]], c),
          (fc[d][r] = c.getCComb() + 70 * (((165 >> r) & 1) ^ ~~(d / 70)));
      for (r = 0; 16 > r; r++)
        a.CornConjugate(b, fb[0][r], c),
          (Yb[d][r] = c.getCComb() + 70 * ~~(d / 70));
    }
  }
  function Sa(a, b, d, c, r, h, f, n) {
    var w = n & 15,
      Sa = 1 == ((n >> 4) & 1) ? 14540032 : 0,
      z = (n >> 8) & 15,
      oa = (n >> 12) & 15,
      Ta = (n >> 16) & 15,
      Wa = (1 << w) - 1,
      T = null == c;
    d *= b;
    n = 1 == ((n >> 5) & 1) ? 10 : 18;
    var Za = 10 == n ? 66 : 599186,
      Va = ((a[d >> 3] >> (d << 2)) & 15) - 1;
    if (-1 == Va) {
      for (var Ya = 0; Ya < (d >> 3) + 1; Ya++) a[Ya] = 4294967295;
      Xa(a, 0, 15);
      Va = 0;
    } else Xa(a, d, 15 ^ (Va + 1));
    for (oa = 0 < Ra ? Math.min(Math.max(Va + 1, Ta), oa) : oa; Va < oa; ) {
      var ab = (Ta = Va > z) ? 15 : Va,
        eb = 286331153 * ab,
        rb = Ta ? Va : 15;
      Va++;
      Lb++;
      var Qa = Va ^ 15,
        cb = 0,
        ib = 0;
      for (Ya = 0; Ya < d; Ya++, ib >>= 4) {
        if (0 == (Ya & 7)) {
          ib = a[Ya >> 3];
          var Ua = ib ^ eb;
          if (0 == ((Ua - 286331153) & ~Ua & 2290649224)) {
            Ya += 7;
            continue;
          }
        }
        if ((ib & 15) == ab) {
          Ua = Ya % b;
          var kb = ~~(Ya / b),
            mb = 0,
            xb = 0;
          T && ((mb = Ab[Ua]), (xb = mb & 7), (mb >>= 3));
          for (var $a = 0; $a < n; $a++) {
            var nb = h[kb][$a];
            var fb = T
              ? Bb[Mb[mb][zb[($a << 3) | xb]] ^ xb ^ (nb & Wa)]
              : r[c[Ua][$a]][nb & Wa];
            nb >>= w;
            var sb = nb * b + fb,
              ob = (a[sb >> 3] >> (sb << 2)) & 15;
            if (ob != rb) ob < Va - 1 && ($a += (Za >> $a) & 3);
            else {
              cb++;
              if (Ta) {
                Xa(a, Ya, Qa);
                break;
              }
              Xa(a, sb, Qa);
              sb = 1;
              for (ob = f[nb]; 0 != (ob >>= 1); sb++)
                if (1 == (ob & 1)) {
                  var bb = nb * b;
                  bb = T
                    ? bb + Bb[Ab[fb] ^ sb]
                    : bb + r[fb][sb ^ ((Sa >> (sb << 1)) & 3)];
                  ((a[bb >> 3] >> (bb << 2)) & 15) == rb &&
                    (Xa(a, bb, Qa), cb++);
                }
            }
          }
        }
      }
    }
    Xa(a, d, (Va + 1) ^ 15);
    return Va + 1;
  }
  function d(a) {
    Zb = Sa(ub, 2048, 324, null, null, Ob, Kb, 103939);
    Lb > a ||
      ((cc = Sa(Jb, 495, 324, Cb, Eb, Ob, Kb, 431619)),
      Lb > a ||
        ((Ub = Sa(Db, 495, 336, Cb, Eb, Mb, tb, 431619)),
        Lb > a ||
          ((Rb = Sa(hc, 24, 2768, Xb, Qb, Ib, Gb, 584244)),
          Lb > a || (dc = Sa($b, 140, 2768, fc, Yb, Hb, Gb, 514084)))));
  }
  function b() {
    0 > Lb && (oa(), (Lb = 0));
    if (0 == Lb) d(99);
    else if (54 > Lb) d(Lb);
    else return !0;
    return !1;
  }
  for (
    var Ra = 2,
      r = [],
      ab = [1],
      kb = "U ;U2;U';R ;R2;R';F ;F2;F';D ;D2;D';L ;L2;L';B ;B2;B'".split(";"),
      ib = [0, 1, 2, 4, 7, 9, 10, 11, 13, 16, 3, 5, 6, 8, 12, 14, 15, 17],
      bb = [],
      lb = [],
      hb = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
        [6, 7, 8, 0, 1, 2, 3, 4, 5, 15, 16, 17, 9, 10, 11, 12, 13, 14],
        [3, 4, 5, 6, 7, 8, 0, 1, 2, 12, 13, 14, 15, 16, 17, 9, 10, 11],
        [2, 1, 0, 5, 4, 3, 8, 7, 6, 11, 10, 9, 14, 13, 12, 17, 16, 15],
        [8, 7, 6, 2, 1, 0, 5, 4, 3, 17, 16, 15, 11, 10, 9, 14, 13, 12],
        [5, 4, 3, 8, 7, 6, 2, 1, 0, 14, 13, 12, 17, 16, 15, 11, 10, 9],
      ],
      gb = 0;
    18 > gb;
    gb++
  )
    bb[ib[gb]] = gb;
  for (gb = 0; 10 > gb; gb++)
    for (var $a = ~~(ib[gb] / 3), jb = (lb[gb] = 0); 10 > jb; jb++) {
      var ob = ~~(ib[jb] / 3);
      lb[gb] |= ($a == ob || ($a % 3 == ob % 3 && $a >= ob) ? 1 : 0) << jb;
    }
  for (gb = lb[10] = 0; 13 > gb; gb++)
    for (
      r[gb] = [], ab[gb + 1] = ab[gb] * (gb + 1), jb = r[gb][0] = r[gb][gb] = 1;
      13 > jb;
      jb++
    )
      r[gb][jb] = jb <= gb ? r[gb - 1][jb - 1] + r[gb - 1][jb] : 0;
  a.EdgeMult = function (a, b, d) {
    for (var c = 0; 12 > c; c++) d.ea[c] = a.ea[b.ea[c] >> 1] ^ (b.ea[c] & 1);
  };
  a.CornMult = function (a, b, d) {
    for (var c = 0; 8 > c; c++)
      d.ca[c] =
        (a.ca[b.ca[c] & 7] & 7) |
        (((a.ca[b.ca[c] & 7] >> 3) + (b.ca[c] >> 3)) % 3 << 3);
  };
  a.CornMultFull = function (a, b, d) {
    for (var c = 0; 8 > c; c++) {
      var r = a.ca[b.ca[c] & 7] >> 3,
        h = b.ca[c] >> 3,
        f = r + (3 > r ? h : 6 - h);
      f = (f % 3) + (3 > r == 3 > h ? 0 : 3);
      d.ca[c] = (a.ca[b.ca[c] & 7] & 7) | (f << 3);
    }
  };
  a.CornConjugate = function (a, b, d) {
    var c = eb[fb[0][b]];
    b = eb[b];
    for (var r = 0; 8 > r; r++) {
      var h = a.ca[b.ca[r] & 7] >> 3;
      d.ca[r] =
        (c.ca[a.ca[b.ca[r] & 7] & 7] & 7) |
        ((3 > c.ca[a.ca[b.ca[r] & 7] & 7] >> 3 ? h : (3 - h) % 3) << 3);
    }
  };
  a.EdgeConjugate = function (a, b, d) {
    var c = eb[fb[0][b]];
    b = eb[b];
    for (var r = 0; 12 > r; r++)
      d.ea[r] =
        c.ea[a.ea[b.ea[r] >> 1] >> 1] ^
        (a.ea[b.ea[r] >> 1] & 1) ^
        (b.ea[r] & 1);
  };
  a.prototype.init = function (a, b) {
    this.ca = a.slice();
    this.ea = b.slice();
    return this;
  };
  a.prototype.initCoord = function (a, b, d, c) {
    f(this.ca, a, 8, !1);
    this.setTwist(b);
    T(this.ea, d, 12, !0);
    this.setFlip(c);
    return this;
  };
  a.prototype.isEqual = function (a) {
    for (var b = 0; 8 > b; b++) if (this.ca[b] != a.ca[b]) return !1;
    for (b = 0; 12 > b; b++) if (this.ea[b] != a.ea[b]) return !1;
    return !0;
  };
  a.prototype.setFlip = function (a) {
    for (var b = 0, d, c = 10; 0 <= c; c--, a >>= 1)
      (b ^= d = a & 1), (this.ea[c] = (this.ea[c] & 254) | d);
    this.ea[11] = (this.ea[11] & 254) | b;
  };
  a.prototype.getFlip = function () {
    for (var a = 0, b = 0; 11 > b; b++) a = (a << 1) | (this.ea[b] & 1);
    return a;
  };
  a.prototype.getFlipSym = function () {
    return Ab[this.getFlip()];
  };
  a.prototype.setTwist = function (a) {
    for (var b = 15, d, c = 6; 0 <= c; c--, a = ~~(a / 3))
      (b -= d = a % 3), (this.ca[c] = (this.ca[c] & 7) | (d << 3));
    this.ca[7] = (this.ca[7] & 7) | (b % 3 << 3);
  };
  a.prototype.getTwist = function () {
    for (var a = 0, b = 0; 7 > b; b++) a += (a << 1) + (this.ca[b] >> 3);
    return a;
  };
  a.prototype.getTwistSym = function () {
    return rb[this.getTwist()];
  };
  a.prototype.setCPerm = function (a) {
    f(this.ca, a, 8, !1);
  };
  a.prototype.getCPerm = function () {
    return w(this.ca, 8, !1);
  };
  a.prototype.getCPermSym = function () {
    var a = wb[w(this.ca, 8, !1)];
    return a ^ ((14540032 >> ((a & 15) << 1)) & 3);
  };
  a.prototype.setEPerm = function (a) {
    f(this.ea, a, 8, !0);
  };
  a.prototype.getEPerm = function () {
    return w(this.ea, 8, !0);
  };
  a.prototype.getEPermSym = function () {
    return wb[w(this.ea, 8, !0)];
  };
  a.prototype.getUDSlice = function () {
    return 494 - Va(this.ea, 8, !0);
  };
  a.prototype.setUDSlice = function (a) {
    Ya(this.ea, 494 - a, 8, !0);
  };
  a.prototype.getMPerm = function () {
    return h(this.ea, 12, !0) % 24;
  };
  a.prototype.setMPerm = function (a) {
    T(this.ea, a, 12, !0);
  };
  a.prototype.getCComb = function () {
    return Va(this.ca, 0, !1);
  };
  a.prototype.setCComb = function (a) {
    Ya(this.ca, a, 0, !1);
  };
  a.prototype.URFConjugate = function () {
    var b = new a();
    a.CornMult(a.urf2, this, b);
    a.CornMult(b, a.urf1, this);
    a.EdgeMult(a.urf2, this, b);
    a.EdgeMult(b, a.urf1, this);
  };
  var qb = [
      [8, 9, 20],
      [6, 18, 38],
      [0, 36, 47],
      [2, 45, 11],
      [29, 26, 15],
      [27, 44, 24],
      [33, 53, 42],
      [35, 17, 51],
    ],
    mb = [
      [5, 10],
      [7, 19],
      [3, 37],
      [1, 46],
      [32, 16],
      [28, 25],
      [30, 43],
      [34, 52],
      [23, 12],
      [21, 41],
      [50, 39],
      [48, 14],
    ];
  a.prototype.toFaceCube = function (a, b) {
    a = a || qb;
    b = b || mb;
    for (var d = [], c = 0; 54 > c; c++) d[c] = "URFDLB"[~~(c / 9)];
    for (var r = 0; 8 > r; r++) {
      c = this.ca[r] & 7;
      for (var h = this.ca[r] >> 3, f = 0; 3 > f; f++)
        d[a[r][(f + h) % 3]] = "URFDLB"[~~(a[c][f] / 9)];
    }
    for (r = 0; 12 > r; r++)
      for (c = this.ea[r] >> 1, h = this.ea[r] & 1, f = 0; 2 > f; f++)
        d[b[r][(f + h) % 2]] = "URFDLB"[~~(b[c][f] / 9)];
    return d.join("");
  };
  a.prototype.invFrom = function (a) {
    for (var b = 0; 12 > b; b++)
      this.ea[a.ea[b] >> 1] = (b << 1) | (a.ea[b] & 1);
    for (b = 0; 8 > b; b++)
      this.ca[a.ca[b] & 7] = b | ((32 >> (a.ca[b] >> 3)) & 24);
    return this;
  };
  a.prototype.fromFacelet = function (a, b, d) {
    b = b || qb;
    d = d || mb;
    for (
      var c = 0,
        r = [],
        h = a[4] + a[13] + a[22] + a[31] + a[40] + a[49],
        f = 0;
      54 > f;
      ++f
    ) {
      r[f] = h.indexOf(a[f]);
      if (-1 == r[f]) return -1;
      c += 1 << (r[f] << 2);
    }
    if (10066329 != c) return -1;
    var n;
    for (f = 0; 8 > f; ++f) {
      for (n = 0; 3 > n && 0 != r[b[f][n]] && 3 != r[b[f][n]]; ++n);
      a = r[b[f][(n + 1) % 3]];
      c = r[b[f][(n + 2) % 3]];
      for (h = 0; 8 > h; ++h)
        if (a == ~~(b[h][1] / 9) && c == ~~(b[h][2] / 9)) {
          this.ca[f] = h | (n % 3 << 3);
          break;
        }
    }
    for (f = 0; 12 > f; ++f)
      for (h = 0; 12 > h; ++h) {
        if (r[d[f][0]] == ~~(d[h][0] / 9) && r[d[f][1]] == ~~(d[h][1] / 9)) {
          this.ea[f] = h << 1;
          break;
        }
        if (r[d[f][0]] == ~~(d[h][1] / 9) && r[d[f][1]] == ~~(d[h][0] / 9)) {
          this.ea[f] = (h << 1) | 1;
          break;
        }
      }
  };
  Wa.prototype.set = function (a) {
    this.twist = a.twist;
    this.tsym = a.tsym;
    this.flip = a.flip;
    this.fsym = a.fsym;
    this.slice = a.slice;
    this.prun = a.prun;
    this.twistc = a.twistc;
    this.flipc = a.flipc;
  };
  Wa.prototype.calcPruning = function (a) {
    this.prun = Math.max(
      Math.max(
        c(cc, Jb, 495 * this.twist + Eb[this.slice][this.tsym]),
        c(Ub, Db, 495 * this.flip + Eb[this.slice][this.fsym])
      ),
      Math.max(
        c(
          Zb,
          ub,
          ((this.twistc >> 3) << 11) | Bb[this.flipc ^ (this.twistc & 7)]
        ),
        c(
          Zb,
          ub,
          (this.twist << 11) | Bb[(this.flip << 3) | (this.fsym ^ this.tsym)]
        )
      )
    );
  };
  Wa.prototype.setWithPrun = function (b, d) {
    this.twist = b.getTwistSym();
    this.flip = b.getFlipSym();
    this.tsym = this.twist & 7;
    this.twist >>= 3;
    this.prun = c(Zb, ub, (this.twist << 11) | Bb[this.flip ^ this.tsym]);
    if (this.prun > d) return !1;
    this.fsym = this.flip & 7;
    this.flip >>= 3;
    this.slice = b.getUDSlice();
    this.prun = Math.max(
      this.prun,
      Math.max(
        c(cc, Jb, 495 * this.twist + Eb[this.slice][this.tsym]),
        c(Ub, Db, 495 * this.flip + Eb[this.slice][this.fsym])
      )
    );
    if (this.prun > d) return !1;
    var r = new a();
    a.CornConjugate(b, 1, r);
    a.EdgeConjugate(b, 1, r);
    this.twistc = r.getTwistSym();
    this.flipc = r.getFlipSym();
    this.prun = Math.max(
      this.prun,
      c(Zb, ub, ((this.twistc >> 3) << 11) | Bb[this.flipc ^ (this.twistc & 7)])
    );
    return this.prun <= d;
  };
  Wa.prototype.doMovePrun = function (a, b, d) {
    this.slice = Cb[a.slice][b];
    this.flip = Mb[a.flip][zb[(b << 3) | a.fsym]];
    this.fsym = (this.flip & 7) ^ a.fsym;
    this.flip >>= 3;
    this.twist = Ob[a.twist][zb[(b << 3) | a.tsym]];
    this.tsym = (this.twist & 7) ^ a.tsym;
    this.twist >>= 3;
    return (this.prun = Math.max(
      Math.max(
        c(cc, Jb, 495 * this.twist + Eb[this.slice][this.tsym]),
        c(Ub, Db, 495 * this.flip + Eb[this.slice][this.fsym])
      ),
      c(
        Zb,
        ub,
        (this.twist << 11) | Bb[(this.flip << 3) | (this.fsym ^ this.tsym)]
      )
    ));
  };
  Wa.prototype.doMovePrunConj = function (a, b) {
    b = vb[3][b];
    this.flipc = Mb[a.flipc >> 3][zb[(b << 3) | (a.flipc & 7)]] ^ (a.flipc & 7);
    this.twistc =
      Ob[a.twistc >> 3][zb[(b << 3) | (a.twistc & 7)]] ^ (a.twistc & 7);
    return c(
      Zb,
      ub,
      ((this.twistc >> 3) << 11) | Bb[this.flipc ^ (this.twistc & 7)]
    );
  };
  z.prototype.solution = function (a, d, c, r, h) {
    b();
    a = this.verify(a);
    if (0 != a) return "Error " + Math.abs(a);
    void 0 === d && (d = 21);
    void 0 === c && (c = 1e9);
    void 0 === r && (r = 0);
    void 0 === h && (h = 0);
    this.sol = d + 1;
    this.probe = 0;
    this.probeMax = c;
    this.probeMin = Math.min(r, c);
    this.verbose = h;
    this.moveSol = null;
    this.isRec = !1;
    this.initSearch();
    return this.search();
  };
  z.prototype.initSearch = function () {
    this.conjMask = 0;
    this.maxPreMoves = 7 < this.conjMask ? 0 : 20;
    for (var b = 0; 6 > b; b++)
      if (
        (this.urfCubieCube[b].init(this.cc.ca, this.cc.ea),
        this.urfCoordCube[b].setWithPrun(this.urfCubieCube[b], 20),
        this.cc.URFConjugate(),
        2 == b % 3)
      ) {
        var d = new a().invFrom(this.cc);
        this.cc.init(d.ca, d.ea);
      }
  };
  z.prototype.next = function (a, b, d) {
    this.probe = 0;
    this.probeMax = a;
    this.probeMin = Math.min(b, a);
    this.moveSol = null;
    this.isRec = !0;
    this.verbose = d;
    return search();
  };
  z.prototype.verify = function (a) {
    if (-1 == this.cc.fromFacelet(a)) return -1;
    for (var b = (a = 0), d = 0; 12 > d; d++)
      (b |= 1 << (this.cc.ea[d] >> 1)), (a ^= this.cc.ea[d] & 1);
    if (4095 != b) return -2;
    if (0 != a) return -3;
    for (d = a = b = 0; 8 > d; d++)
      (b |= 1 << (this.cc.ca[d] & 7)), (a += this.cc.ca[d] >> 3);
    return 255 != b
      ? -4
      : 0 != a % 3
      ? -5
      : 0 != (Ta(h(this.cc.ea, 12, !0), 12) ^ Ta(this.cc.getCPerm(), 8))
      ? -6
      : 0;
  };
  z.prototype.phase1PreMoves = function (b, d, c) {
    this.preMoveLen = this.maxPreMoves - b;
    if (
      this.isRec
        ? this.depth1 == this.length1 - this.preMoveLen
        : 0 == this.preMoveLen || 0 == ((225207 >> d) & 1)
    )
      if (
        ((this.depth1 = this.length1 - this.preMoveLen),
        this.phase1Cubie[0].init(c.ca, c.ea),
        (this.allowShorter = 7 == this.depth1 && 0 != this.preMoveLen),
        this.nodeUD[this.depth1 + 1].setWithPrun(c, this.depth1) &&
          0 == this.phase1(this.nodeUD[this.depth1 + 1], this.depth1, -1))
      )
        return 0;
    if (0 == b || this.preMoveLen + 7 >= this.length1) return 1;
    var r = 0;
    if (1 == b || this.preMoveLen + 1 + 7 >= this.length1) r |= 225207;
    d = 3 * ~~(d / 3);
    for (var h = 0; 18 > h; h++)
      if (h == d || h == d - 9 || h == d + 9) h += 2;
      else if (
        !(
          (this.isRec && h != this.preMoves[this.maxPreMoves - b]) ||
          0 != (r & (1 << h))
        ) &&
        (a.CornMult(cb[h], c, this.preMoveCubes[b]),
        a.EdgeMult(cb[h], c, this.preMoveCubes[b]),
        (this.preMoves[this.maxPreMoves - b] = h),
        0 == this.phase1PreMoves(b - 1, h, this.preMoveCubes[b]))
      )
        return 0;
    return 1;
  };
  z.prototype.search = function () {
    for (
      this.length1 = this.isRec ? this.length1 : 0;
      this.length1 < this.sol;
      this.length1++
    )
      for (
        this.urfIdx = this.isRec ? this.urfIdx : 0;
        6 > this.urfIdx;
        this.urfIdx++
      )
        if (
          0 == (this.conjMask & (1 << this.urfIdx)) &&
          0 ==
            this.phase1PreMoves(
              this.maxPreMoves,
              -30,
              this.urfCubieCube[this.urfIdx],
              0
            )
        )
          return null == this.moveSol ? "Error 8" : this.moveSol;
    return null == this.moveSol ? "Error 7" : this.moveSol;
  };
  z.prototype.initPhase2Pre = function () {
    this.isRec = !1;
    if (this.probe >= (null == this.moveSol ? this.probeMax : this.probeMin))
      return 0;
    ++this.probe;
    for (var b = this.valid1; b < this.depth1; b++)
      a.CornMult(
        this.phase1Cubie[b],
        cb[this.move[b]],
        this.phase1Cubie[b + 1]
      ),
        a.EdgeMult(
          this.phase1Cubie[b],
          cb[this.move[b]],
          this.phase1Cubie[b + 1]
        );
    this.valid1 = this.depth1;
    b = this.initPhase2(this.phase1Cubie[this.depth1]);
    if (0 == b || 0 == this.preMoveLen || 2 == b) return b;
    b = 3 * ~~(this.preMoves[this.preMoveLen - 1] / 3) + 1;
    a.CornMult(
      cb[b],
      this.phase1Cubie[this.depth1],
      this.phase1Cubie[this.depth1 + 1]
    );
    a.EdgeMult(
      cb[b],
      this.phase1Cubie[this.depth1],
      this.phase1Cubie[this.depth1 + 1]
    );
    this.preMoves[this.preMoveLen - 1] +=
      2 - (this.preMoves[this.preMoveLen - 1] % 3) * 2;
    b = this.initPhase2(this.phase1Cubie[this.depth1 + 1]);
    this.preMoves[this.preMoveLen - 1] +=
      2 - (this.preMoves[this.preMoveLen - 1] % 3) * 2;
    return b;
  };
  z.prototype.initPhase2 = function (a) {
    var b = a.getCPermSym(),
      d = b & 15;
    b >>= 4;
    var r = a.getEPermSym(),
      h = r & 15;
    r >>= 4;
    a = a.getMPerm();
    var f = Math.max(
        c(dc, $b, 140 * r + Yb[Fb[b] & 255][fb[h][d]]),
        c(Rb, hc, 24 * b + Qb[a][d])
      ),
      n = Math.min(13, this.sol - this.length1);
    if (f >= n) return f > n ? 2 : 1;
    var Ra;
    for (Ra = n - 1; Ra >= f; Ra--) {
      var w = this.phase2(r, h, b, d, a, Ra, this.depth1, 10);
      if (0 > w) break;
      Ra -= w;
      this.moveSol = [];
      for (w = 0; w < this.depth1 + Ra; w++) this.appendSolMove(this.move[w]);
      for (w = this.preMoveLen - 1; 0 <= w; w--)
        this.appendSolMove(this.preMoves[w]);
      this.sol = this.moveSol.length;
      this.moveSol = this.solutionToString();
    }
    return Ra != n - 1 ? (this.probe >= this.probeMin ? 0 : 1) : 1;
  };
  z.prototype.phase1 = function (a, b, d) {
    if (0 == a.prun && 5 > b) {
      if (this.allowShorter || 0 == b) {
        this.depth1 -= b;
        var c = this.initPhase2Pre();
        this.depth1 += b;
        return c;
      }
      return 1;
    }
    for (var r = 0; 18 > r; r += 3)
      if (r != d && r != d - 9)
        for (var h = 0; 3 > h; h++)
          if (((c = r + h), !this.isRec || c == this.move[this.depth1 - b])) {
            var f = this.nodeUD[b].doMovePrun(a, c, !0);
            if (f > b) break;
            else if (f == b) continue;
            f = this.nodeUD[b].doMovePrunConj(a, c);
            if (f > b) break;
            else if (f == b) continue;
            this.move[this.depth1 - b] = c;
            this.valid1 = Math.min(this.valid1, this.depth1 - b);
            c = this.phase1(this.nodeUD[b], b - 1, r);
            if (0 == c) return 0;
            if (2 == c) break;
          }
    return 1;
  };
  z.prototype.appendSolMove = function (a) {
    if (0 == this.moveSol.length) this.moveSol.push(a);
    else {
      var b = ~~(a / 3),
        d = ~~(this.moveSol[this.moveSol.length - 1] / 3);
      b == d
        ? ((a =
            ((a % 3) + (this.moveSol[this.moveSol.length - 1] % 3) + 1) % 4),
          3 == a
            ? this.moveSol.pop()
            : (this.moveSol[this.moveSol.length - 1] = 3 * b + a))
        : 1 < this.moveSol.length &&
          b % 3 == d % 3 &&
          b == ~~(this.moveSol[this.moveSol.length - 2] / 3)
        ? ((a =
            ((a % 3) + (this.moveSol[this.moveSol.length - 2] % 3) + 1) % 4),
          3 == a
            ? ((this.moveSol[this.moveSol.length - 2] =
                this.moveSol[this.moveSol.length - 1]),
              this.moveSol.pop())
            : (this.moveSol[this.moveSol.length - 2] = 3 * b + a))
        : this.moveSol.push(a);
    }
  };
  z.prototype.phase2 = function (a, b, d, r, h, f, n, Ra) {
    if (0 == a && 0 == d && 0 == h) return f;
    Ra = lb[Ra];
    for (var w = 0; 10 > w; w++)
      if (0 != ((Ra >> w) & 1)) w += (66 >> w) & 3;
      else {
        var Sa = Xb[h][w],
          z = Ib[d][Za[r][w]],
          oa = pb[z & 15][r];
        z >>= 4;
        if (!(c(Rb, hc, 24 * z + Qb[Sa][oa]) >= f)) {
          var Ta = Hb[a][Za[b][w]],
            Wa = pb[Ta & 15][b];
          Ta >>= 4;
          if (!(c(dc, $b, 140 * Ta + Yb[Fb[z] & 255][fb[Wa][oa]]) >= f)) {
            var T = Ua(Ta, Wa, !1),
              Va = Ua(z, oa, !0);
            if (
              !(
                c(
                  dc,
                  $b,
                  140 * (T >> 4) + Yb[Fb[Va >> 4] & 255][fb[T & 15][Va & 15]]
                ) >= f
              ) &&
              ((Sa = this.phase2(Ta, Wa, z, oa, Sa, f - 1, n + 1, w)), 0 <= Sa)
            )
              return (this.move[n] = ib[w]), Sa;
          }
        }
      }
    return -1;
  };
  z.prototype.solutionToString = function () {
    var a = "",
      b = 0 != (this.verbose & 2) ? (this.urfIdx + 3) % 6 : this.urfIdx;
    if (3 > b)
      for (var d = 0; d < this.moveSol.length; ++d)
        a += kb[hb[b][this.moveSol[d]]] + " ";
    else
      for (d = this.moveSol.length - 1; 0 <= d; --d)
        a += kb[hb[b][this.moveSol[d]]] + " ";
    return a;
  };
  var cb = [],
    eb = [],
    pb = [],
    fb = [],
    vb = [],
    Za = [],
    zb = [],
    xb = [],
    Ab = [],
    sb = [],
    rb = [],
    nb = [],
    wb = [],
    tb = [],
    Kb = [],
    Gb = [],
    Bb = [],
    Fb = [],
    Pb = [],
    Cb = [],
    Ob = [],
    Mb = [],
    Eb = [],
    Jb = [],
    Db = [],
    ub = [],
    Ib = [],
    Hb = [],
    Xb = [],
    Qb = [],
    fc = [],
    Yb = [],
    hc = [],
    $b = [],
    Zb = 15,
    cc = 15,
    Ub = 15,
    Rb = 15,
    dc = 15;
  for (gb = 0; 18 > gb; gb++) cb[gb] = new a();
  cb[0].initCoord(15120, 0, 119750400, 0);
  cb[3].initCoord(21021, 1494, 323403417, 0);
  cb[6].initCoord(8064, 1236, 29441808, 550);
  cb[9].initCoord(9, 0, 5880, 0);
  cb[12].initCoord(1230, 412, 2949660, 0);
  cb[15].initCoord(224, 137, 328552, 137);
  for (gb = 0; 18 > gb; gb += 3)
    for ($a = 0; 2 > $a; $a++)
      a.EdgeMult(cb[gb + $a], cb[gb], cb[gb + $a + 1]),
        a.CornMult(cb[gb + $a], cb[gb], cb[gb + $a + 1]);
  a.urf1 = new a().initCoord(2531, 1373, 67026819, 1367);
  a.urf2 = new a().initCoord(2089, 1906, 322752913, 2040);
  var Lb = -1;
  return {
    Search: z,
    solve: function (a) {
      return new z().solution(a);
    },
    randomCube: function () {
      var b = ~~(2048 * Math.random()),
        d = ~~(2187 * Math.random());
      do {
        var c = ~~(Math.random() * ab[12]);
        var r = ~~(Math.random() * ab[8]);
      } while (Ta(r, 8) != Ta(c, 12));
      return new a().initCoord(r, d, c, b).toFaceCube();
    },
    initFull: function () {
      Ra = 0;
      b();
    },
  };
})();
"undefined" !== typeof module &&
  "undefined" !== typeof module.exports &&
  (module.exports = min2phase);
var cubeutil = (function () {
  function z(a, c) {
    for (var h = [], f = 0; 54 > f; f++) h[c[f]] = a[f];
    return h.join("");
  }
  function Qa(a, c) {
    c = c || mathlib.SOLVED_FACELET;
    for (var h = {}, f = 0; 54 > f; f++)
      if ("-" != c[f]) {
        if (c[f] in h && h[c[f]] != a[f]) return 1;
        h[c[f]] = a[f];
      }
    return 0;
  }
  function n(a) {
    return Qa(a, "----U--------R--R-----F--F--D-DDD-D-----L--L-----B--B-")
      ? 9
      : Qa(a, "----U-------RRRRRR---FFFFFFDDDDDDDDD---LLLLLL---BBBBBB")
      ? 4 +
        Qa(a, "----U-------RR-RR-----FF-FF-DDDDD-D-----L--L-----B--B-") +
        Qa(a, "----U--------R--R----FF-FF-DD-DDD-D-----LL-LL----B--B-") +
        Qa(a, "----U--------RR-RR----F--F--D-DDD-DD----L--L----BB-BB-") +
        Qa(a, "----U--------R--R-----F--F--D-DDDDD----LL-LL-----BB-BB")
      : Qa(a, "-U-UUU-U----RRRRRR---FFFFFFDDDDDDDDD---LLLLLL---BBBBBB")
      ? 4
      : Qa(a, "UUUUUUUUU---RRRRRR---FFFFFFDDDDDDDDD---LLLLLL---BBBBBB")
      ? 3
      : Qa(a, "UUUUUUUUUr-rRRRRRRf-fFFFFFFDDDDDDDDDl-lLLLLLLb-bBBBBBB")
      ? 2
      : Qa(a)
      ? 1
      : 0;
  }
  function Xa(a) {
    return Qa(a, "----U--------R--R-----F--F--D-DDD-D-----L--L-----B--B-")
      ? 7
      : Qa(a, "----U-------RRRRRR---FFFFFFDDDDDDDDD---LLLLLL---BBBBBB")
      ? 2 +
        Qa(a, "----U-------RR-RR-----FF-FF-DDDDD-D-----L--L-----B--B-") +
        Qa(a, "----U--------R--R----FF-FF-DD-DDD-D-----LL-LL----B--B-") +
        Qa(a, "----U--------RR-RR----F--F--D-DDD-DD----L--L----BB-BB-") +
        Qa(a, "----U--------R--R-----F--F--D-DDDDD----LL-LL-----BB-BB")
      : Qa(a, "UUUUUUUUU---RRRRRR---FFFFFFDDDDDDDDD---LLLLLL---BBBBBB")
      ? 2
      : Qa(a)
      ? 1
      : 0;
  }
  function c(a) {
    return Qa(a, "----U--------R--R-----F--F--D-DDD-D-----L--L-----B--B-")
      ? 4
      : Qa(a, "----U-------RRRRRR---FFFFFFDDDDDDDDD---LLLLLL---BBBBBB")
      ? 3
      : Qa(a, "UUUUUUUUU---RRRRRR---FFFFFFDDDDDDDDD---LLLLLL---BBBBBB")
      ? 2
      : Qa(a)
      ? 1
      : 0;
  }
  function Ua(a) {
    return Qa(a, "----U-------RRRRRR---FFFFFFDDDDDDDDD---LLLLLL---BBBBBB")
      ? 2
      : Qa(a)
      ? 1
      : 0;
  }
  function a(a) {
    return Qa(a, "---------------------F--F--D--D--D-----LLLLLL-----B--B")
      ? 4
      : Qa(a, "------------RRRRRR---F-FF-FD-DD-DD-D---LLLLLL---B-BB-B")
      ? 3
      : Qa(a, "U-U---U-Ur-rRRRRRRf-fF-FF-FD-DD-DD-Dl-lLLLLLLb-bB-BB-B")
      ? 2
      : Qa(a)
      ? 1
      : 0;
  }
  function f(a, c, f) {
    for (var n = 99, Sa = 0; Sa < f; Sa++)
      (n = Math.min(n, c(a))),
        (a = z(a, Sa & 1 ? T : h)),
        5 == Sa % 6 && ((a = z(a, h)), (a = z(a, h))),
        11 == Sa % 12 && ((a = z(a, w)), (a = z(a, w)));
    return n;
  }
  var w = [
      2, 5, 8, 1, 4, 7, 0, 3, 6, 18, 19, 20, 21, 22, 23, 24, 25, 26, 36, 37, 38,
      39, 40, 41, 42, 43, 44, 33, 30, 27, 34, 31, 28, 35, 32, 29, 45, 46, 47,
      48, 49, 50, 51, 52, 53, 9, 10, 11, 12, 13, 14, 15, 16, 17,
    ],
    T = [
      53, 52, 51, 50, 49, 48, 47, 46, 45, 11, 14, 17, 10, 13, 16, 9, 12, 15, 0,
      1, 2, 3, 4, 5, 6, 7, 8, 18, 19, 20, 21, 22, 23, 24, 25, 26, 42, 39, 36,
      43, 40, 37, 44, 41, 38, 35, 34, 33, 32, 31, 30, 29, 28, 27,
    ],
    h = [
      11, 14, 17, 10, 13, 16, 9, 12, 15, 29, 32, 35, 28, 31, 34, 27, 30, 33, 20,
      23, 26, 19, 22, 25, 18, 21, 24, 38, 41, 44, 37, 40, 43, 36, 39, 42, 2, 5,
      8, 1, 4, 7, 0, 3, 6, 51, 48, 45, 52, 49, 46, 53, 50, 47,
    ],
    Va = [
      [0, 2, 4, 3, 5, 1],
      [5, 1, 0, 2, 4, 3],
      [4, 0, 2, 1, 3, 5],
    ];
  return {
    getProgress: function (h, w) {
      switch (w) {
        case "cfop":
          return f(h, c, 6);
        case "fp":
          return f(h, Ua, 6);
        case "cf4op":
          return f(h, Xa, 6);
        case "roux":
          return f(h, a, 24);
        case "cf4o2p2":
          return f(h, n, 6);
        case "n":
          return f(h, Qa, 1);
      }
    },
    getPrettyMoves: function (a) {
      var c = [0, 1, 2, 3, 4, 5];
      return $.map(a, function (a, h) {
        function f(a, b) {
          0 == d.length || ~~(d[d.length - 1] / 3) != a
            ? d.push(3 * a + b)
            : ((b = (b + (d[d.length - 1] % 3) + 1) % 4),
              3 == b ? d.pop() : (d[d.length - 1] = 3 * a + b));
        }
        for (var d = [], b = 0; b < a.length; b++) {
          var n = c.indexOf("URFDLB".indexOf(a[b][0][0])),
            r = " 2'".indexOf(a[b][0][1]) % 3;
          if (b == a.length - 1 || 100 < a[b + 1][1] - a[b][1]) f(n, r);
          else {
            var w = c.indexOf("URFDLB".indexOf(a[b + 1][0][0])),
              z = " 2'".indexOf(a[b + 1][0][1]) % 3;
            if (n != w && n % 3 == w % 3 && 2 == r + z) {
              w = n % 3;
              n = (r - 1) * [1, 1, -1, -1, -1, 1][n] + 1;
              f(w + 6, n);
              for (r = 0; r < n + 1; r++) {
                z = [];
                for (var oa = 0; 6 > oa; oa++) z[oa] = c[Va[w][oa]];
                c = z;
              }
              b++;
            } else f(n, r);
          }
        }
        return [
          [
            $.map(d, function (a) {
              return "URFDLBEMS".charAt(~~(a / 3)) + " 2'".charAt(a % 3);
            }).join(""),
            d.length,
          ],
        ];
      });
    },
    moveSeq2str: function (a) {
      return $.map(a, function (a) {
        return a[0].trim() + "@" + a[1];
      }).join(" ");
    },
  };
})();
var JSON;
JSON || (JSON = {});
(function () {
  function z(a) {
    return 10 > a ? "0" + a : a;
  }
  function Qa(a) {
    c.lastIndex = 0;
    return c.test(a)
      ? '"' +
          a.replace(c, function (a) {
            var c = f[a];
            return "string" === typeof c
              ? c
              : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
          }) +
          '"'
      : '"' + a + '"';
  }
  function n(c, h) {
    var f,
      z,
      Ta = Ua,
      Wa = h[c];
    Wa &&
      "object" === typeof Wa &&
      "function" === typeof Wa.toJSON &&
      (Wa = Wa.toJSON(c));
    "function" === typeof w && (Wa = w.call(h, c, Wa));
    switch (typeof Wa) {
      case "string":
        return Qa(Wa);
      case "number":
        return isFinite(Wa) ? "" + Wa : "null";
      case "boolean":
      case "null":
        return "" + Wa;
      case "object":
        if (!Wa) return "null";
        Ua += a;
        var oa = [];
        if ("[object Array]" === Object.prototype.toString.apply(Wa)) {
          var Sa = Wa.length;
          for (f = 0; f < Sa; f += 1) oa[f] = n(f, Wa) || "null";
          var d =
            0 === oa.length
              ? "[]"
              : Ua
              ? "[\n" + Ua + oa.join(",\n" + Ua) + "\n" + Ta + "]"
              : "[" + oa.join(",") + "]";
          Ua = Ta;
          return d;
        }
        if (w && "object" === typeof w)
          for (Sa = w.length, f = 0; f < Sa; f += 1)
            "string" === typeof w[f] &&
              ((z = w[f]),
              (d = n(z, Wa)) && oa.push(Qa(z) + (Ua ? ": " : ":") + d));
        else
          for (z in Wa)
            Object.prototype.hasOwnProperty.call(Wa, z) &&
              (d = n(z, Wa)) &&
              oa.push(Qa(z) + (Ua ? ": " : ":") + d);
        d =
          0 === oa.length
            ? "{}"
            : Ua
            ? "{\n" + Ua + oa.join(",\n" + Ua) + "\n" + Ta + "}"
            : "{" + oa.join(",") + "}";
        Ua = Ta;
        return d;
    }
  }
  "function" !== typeof Date.prototype.toJSON &&
    ((Date.prototype.toJSON = function () {
      return isFinite(this.valueOf())
        ? this.getUTCFullYear() +
            "-" +
            z(this.getUTCMonth() + 1) +
            "-" +
            z(this.getUTCDate()) +
            "T" +
            z(this.getUTCHours()) +
            ":" +
            z(this.getUTCMinutes()) +
            ":" +
            z(this.getUTCSeconds()) +
            "Z"
        : null;
    }),
    (String.prototype.toJSON =
      Number.prototype.toJSON =
      Boolean.prototype.toJSON =
        function () {
          return this.valueOf();
        }));
  var Xa =
      /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    c =
      /[\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    Ua,
    a,
    f = {
      "\b": "\\b",
      "\t": "\\t",
      "\n": "\\n",
      "\f": "\\f",
      "\r": "\\r",
      '"': '\\"',
      "\\": "\\\\",
    },
    w;
  "function" !== typeof JSON.stringify &&
    (JSON.stringify = function (c, h, f) {
      var z;
      a = Ua = "";
      if ("number" === typeof f) for (z = 0; z < f; z += 1) a += " ";
      else "string" === typeof f && (a = f);
      if (
        (w = h) &&
        "function" !== typeof h &&
        ("object" !== typeof h || "number" !== typeof h.length)
      )
        throw Error("JSON.stringify");
      return n("", { "": c });
    });
  "function" !== typeof JSON.parse &&
    (JSON.parse = function (a, c) {
      function h(a, f) {
        var n,
          w,
          d = a[f];
        if (d && "object" === typeof d)
          for (n in d)
            Object.prototype.hasOwnProperty.call(d, n) &&
              ((w = h(d, n)), void 0 !== w ? (d[n] = w) : delete d[n]);
        return c.call(a, f, d);
      }
      var f;
      a = "" + a;
      Xa.lastIndex = 0;
      Xa.test(a) &&
        (a = a.replace(Xa, function (a) {
          return "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
        }));
      if (
        /^[\],:{}\s]*$/.test(
          a
            .replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
            .replace(
              /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
              "]"
            )
            .replace(/(?:^|:|,)(?:\s*\[)+/g, "")
        )
      )
        return (
          (f = eval("(" + a + ")")),
          "function" === typeof c ? h({ "": f }, "") : f
        );
      throw new SyntaxError("JSON.parse");
    });
})();
var kernel = execMain(function () {
  function z(a, d) {
    DEBUG && console.log("[signal]", a, d);
    if (void 0 != f[a])
      for (var b in f[a])
        if (void 0 === f[a][b][1] || f[a][b][1].exec(d[0])) f[a][b][0](a, d);
  }
  function Qa(a, d, b, c) {
    void 0 == f[d] && (f[d] = {});
    f[d][a] = [b, c];
  }
  function n(a, d) {
    if (0 > a) return "DNF";
    var b = T("useMilli");
    a = Math.floor(a / (b ? 1 : 10));
    var c = a % (b ? 1e3 : 100);
    a = Math.floor(a / (b ? 1e3 : 100));
    var r = T("timeFormat"),
      h = 0,
      f = 0;
    "h" == r
      ? ((r = a % 60),
        (h = Math.floor(a / 60) % 60),
        (f = Math.floor(a / 3600)))
      : "m" == r
      ? ((r = a % 60), (h = Math.floor(a / 60)))
      : (r = a);
    var n = (d = d && T("smallADP")) ? ["</span>"] : [];
    n.push(c);
    10 > c && n.push("0");
    100 > c && b && n.push("0");
    n.push(r + "." + (d ? '<span style="font-size:0.75em;">' : ""));
    10 > r && 0 < h + f && n.push("0");
    0 < h + f && n.push(h + ":");
    10 > h && 0 < f && n.push("0");
    0 < f && n.push(f + ":");
    return n.reverse().join("");
  }
  function Xa(a) {
    if (0 >= a) return a;
    var d = T("useMilli") ? 1 : 10;
    return Math.round(a / d) * d;
  }
  function c() {
    timer.refocus();
  }
  $.ajaxSetup({ cache: !0 });
  var Ua = $("<div />").css("visibility", "hidden"),
    a = $('<div id="wndctn" />'),
    f = {},
    w = (function () {
      function a() {
        var a = $(this).data("module");
        d(a);
        b(a);
      }
      function d(a) {
        if (!Ua[a][0].hasClass("enable")) {
          for (var b in Ua) Ua[b][0].removeClass("enable");
          Ua[a][0].addClass("enable");
          vb = a;
        }
      }
      function b(a) {
        setTimeout(function () {
          mb.scrollTop(a ? mb.scrollTop() + Ua[a][1].position().top - 3 : Za);
        }, 0);
      }
      function c() {
        Za = mb.scrollTop();
        var a = "kernel",
          b;
        for (b in Ua) 50 < Ua[b][1].position().top || (a = b);
        d(a);
      }
      function r(a) {
        a = $(this);
        var b = a.prop("name");
        if (a.is(".opthelp"))
          " [?] " == a.html()
            ? a.html(
                "<br> [?] " +
                  $('strong[data="opt_' + a.attr("data") + '"]')
                    .parent()
                    .html()
                    .split("</strong>. ")[1]
              )
            : a.html(" [?] ");
        else if (a.is("select")) w(b, a.val());
        else
          switch (a.prop("type")) {
            case "checkbox":
              w(b, a.prop("checked"));
              break;
            case "color":
              if (a.attr("data")) {
                var d = 4 * ~~a.attr("data") - 4,
                  c = n(b);
                w(
                  b,
                  [c.slice(0, d), Ya.nearColor(a.val()), c.slice(d + 4)].join(
                    ""
                  )
                );
              } else w(b, a.val());
              break;
            case "text":
            case "button":
              for (d in Va)
                if (b in Va[d]) {
                  d = Va[d][b];
                  c = n(b);
                  switch (a.val()) {
                    case "+":
                      c = Math.min(c + 1, d[3][2]);
                      break;
                    case "-":
                      c = Math.max(c - 1, d[3][1]);
                      break;
                    default:
                      a.val().match(/^\d+$/) &&
                        ((c = +a.val().match(/^0*(.+)$/)[1]),
                        (c = Math.max(Math.min(c, d[3][2]), d[3][1])));
                  }
                  d[0].val(c);
                  w(b, c);
                  break;
                }
          }
      }
      function h() {
        Ua = {};
        pb.empty();
        cb.empty();
        mb.unbind("scroll").scroll(c);
        for (var b in MODULE_NAMES) {
          0 === vb && (vb = b);
          var d = (Ua[b] = [$("<div>"), $("<tr>")]);
          d[0]
            .html(
              '<span class="icon" style="font-size:1em;">' +
                zb[b] +
                "</span><span>" +
                MODULE_NAMES[b] +
                "</span>"
            )
            .addClass("tab")
            .data("module", b)
            .click(a)
            .appendTo(pb);
          d[1].append(
            $("<th>").html(
              '<span class="icon">' +
                zb[b] +
                "</span> " +
                MODULE_NAMES[b].replace(/<br>-?/g, "")
            ),
            $('<th class="sr">').html(PROPERTY_SR),
            $('<th class="sr">').html('<span class="icon">î¦»</span>')
          );
          cb.append(d[1]);
          for (var h in Va[b]) {
            d = Va[b][h];
            var f = n(h),
              w = d[1],
              Ra = n("sr_" + h),
              z = $('<td class="sr">');
            d[4] & 1 &&
              z.append(
                $(
                  '<input type="checkbox" name="sr_' +
                    h +
                    '"' +
                    (Ra ? " checked" : "") +
                    ">"
                ).click(r)
              );
            Ra = $("<td colspan=2>");
            if (0 > w)
              if ($.urlParam("debug")) w = ~w;
              else continue;
            if (0 == w)
              (d[0] = $('<input type="checkbox" name="' + h + '">')
                .prop("checked", f)
                .click(r)),
                Ra.append($("<label>").append(d[0], d[2]));
            else if (1 == w) {
              d[0] = $('<select name="' + h + '">');
              var Sa = d[3][1],
                oa = d[3][2];
              for (w = 0; w < Sa.length; w++)
                d[0].append($("<option />").val(Sa[w]).html(oa[w]));
              d[0].val(f);
              d[0].change(r);
              Ra.append(d[2], ": ", d[0]);
            } else if (2 == w)
              (d[0] = $('<input type="text" maxlength="4" name="' + h + '">')
                .val(f)
                .change(r)),
                (f = $(
                  '<input type="button" style="width: 1.5em;" value="+" name="' +
                    h +
                    '">'
                ).click(r)),
                (w = $(
                  '<input type="button" style="width: 1.5em;" value="-" name="' +
                    h +
                    '">'
                ).click(r)),
                Ra.append(
                  d[2] + "(" + d[3][1] + "~" + d[3][2] + ")",
                  $("<span>").css("white-space", "nowrap").append(w, d[0], f)
                );
            else if (3 == w)
              (d[0] = $('<input type="color" name="' + h + '">')
                .val(f)
                .change(r)),
                Ra.append(d[2], ": ", d[0]);
            else if (4 == w) {
              Sa = f.match(/#[0-9a-fA-F]{3}/g);
              d[0] = $(
                '<input type="text" name="' + h + '" style="display:none">'
              ).val(f);
              f = [];
              for (w = 0; w < Sa.length; w++)
                f.push(
                  $(
                    '<input type="color" name="' +
                      h +
                      '" data="' +
                      (w + 1) +
                      '" class="mulcolor">'
                  )
                    .val(Ya.nearColor(Sa[w], 0, !0))
                    .change(r)
                );
              Ra.append(d[2], ": ", d[0], f);
            } else
              5 == w &&
                ($.urlParam("debug")
                  ? ((d[0] = $(
                      '<input type="text" name="' + h + '" readonly>'
                    ).val(f)),
                    Ra.append(d[2] + " (" + h + "): ", d[0]))
                  : ((d[0] = $(
                      '<input type="text" name="' +
                        h +
                        '" style="display:none">'
                    ).val(f)),
                    Ra.append(d[2], d[0])));
            0 < $('strong[data="opt_' + h + '"]').length &&
              Ra.append(
                $('<span class="click opthelp" data="' + h + '"/>')
                  .html(" [?] ")
                  .click(r)
              );
            cb.append($("<tr>").append(Ra, z));
          }
        }
        cb.append($('<tr style="height: 10em;">'));
        Ua[vb][0].click();
      }
      function f() {
        Xa && (h(), (Xa = !1));
        $(".opthelp").html(" [?] ");
        b();
        Ya.showDialog(
          [
            eb,
            $.noop,
            void 0,
            $.noop,
            [
              RESET_LANG,
              function () {
                for (var a in T) {
                  var b = T[a];
                  void 0 === b ||
                    n(a) === b ||
                    a.startsWith("session") ||
                    (delete Wa[a], z("property", [a, b, "reset"]));
                }
                h();
                return !1;
              },
            ],
            [BUTTON_EXPORT.replace("<br", ""), exportFunc.exportProperties],
          ],
          "option",
          BUTTON_OPTIONS.replace("-<br>", ""),
          function () {
            fb.find('select[name="lang"]').focus().blur();
            b();
          }
        );
      }
      function n(a, b) {
        void 0 != b &&
          void 0 == T[a] &&
          ((T[a] = b), z("property", [a, n(a), "set"]));
        Wa[a] === T[a] && delete Wa[a];
        return a in Wa ? Wa[a] : T[a];
      }
      function w(a, b, d) {
        for (var c in Va)
          if (a in Va[c] && void 0 !== Va[c][a][0] && Va[c][a][0].val() != b) {
            Va[c][a][0].val(b);
            break;
          }
        n(a) !== b && ((Wa[a] = b), z("property", [a, n(a), d || "modify"]));
      }
      function oa() {
        localStorage.properties = JSON.stringify(Wa);
      }
      function Ta() {
        var a = localStorage.properties;
        void 0 != a && "" != a && (Wa = JSON.parse(a));
      }
      var Wa = {},
        T = {},
        Va = {},
        Ua = {},
        Xa = !0,
        mb = $('<div class="noScrollBar">'),
        cb = $('<table class="opttable">'),
        eb = $('<table class="options" />'),
        pb = $("<td />"),
        fb = $("<td />").addClass("tabValue");
      eb.append($("<tr />").append(pb, fb.append(mb.append(cb))));
      var vb = 0,
        Za = 0,
        zb = {
          kernel: "î£Ž",
          ui: "î˜",
          color: "î«©",
          timer: "îš¶",
          scramble: "î¤€",
          stats: "î¦»",
          tools: "î¦“",
          vrc: "îš",
        };
      $(function () {
        Ta();
        Ya.addButton("property", BUTTON_OPTIONS, f, 1);
        Qa("property", "property", oa);
      });
      return {
        get: n,
        set: w,
        reg: function (a, b, d, c, r, h) {
          Xa = !0;
          void 0 == Va[a] && (Va[a] = {});
          Va[a][b] = [void 0, d, c, r, h];
          T[b] = r[0];
          T["sr_" + b] = 2 == (h & 2);
          z("property", [b, n(b), "set"]);
        },
        getSProps: function () {
          var a = {},
            b;
          for (b in Wa)
            0 != b.indexOf("sr_") && n("sr_" + b, !1) && (a[b] = n(b));
          return a;
        },
        setSProps: function (a) {
          for (var b in T)
            0 != b.indexOf("sr_") &&
              n("sr_" + b, !1) &&
              (b in a ? w(b, a[b], "session") : w(b, T[b], "session"));
        },
        load: Ta,
        reload: h,
      };
    })(),
    T = w.get,
    h = w.set,
    Va = w.reg;
  $(function () {
    var a = LANG_CUR || "en-us";
    Va("kernel", "lang", 1, "Language", [
      a,
      (LANG_SET + "|h").split("|").slice(1),
      (LANG_STR + "|help translation").split("|"),
    ]);
    h("lang", a);
    Qa(
      "kernel",
      "property",
      function (b, d) {
        d[1] != a &&
          "modify" == d[2] &&
          ("h" == d[1]
            ? confirm(
                "Press OK to redirect to crowdin for translating cstimer"
              ) &&
              (window.location.href = "https://crowdin.com/project/cstimer")
            : (window.location.href = "?lang=" + d[1]),
          h("lang", a));
      },
      /^lang$/
    );
    if ($.urlParam("lang")) {
      var d = "lang=" + $.urlParam("lang");
      document.cookie = d + "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
      $.clearUrl("lang");
    }
  });
  var Ya = (function () {
      function f(a, b, d, c) {
        Za = Za || $("#leftbar");
        Za.children(".c" + c)
          .click(d)
          .find("span:first")
          .html(b);
      }
      function d() {
        var a = $(this),
          b = a.data("module");
        eb[b].button
          ? (a.removeClass("enable"),
            (pb && eb[b].auto) ||
              eb[b].div.stop(!0, !0).fadeOut(
                200,
                (function (a) {
                  return function () {
                    z("button", [a, !1]);
                  };
                })(b)
              ))
          : (a.addClass("enable"),
            z("button", [b, !0]),
            eb[b].div.stop(!0, !0).fadeIn(200),
            pb && eb[b].auto && eb[b].div.hide());
        eb[b].button = !eb[b].button;
        h(b, eb[b].button);
      }
      function b() {
        var a = $(this).attr("data");
        h(a, !T(a, !1));
      }
      function n(a, b, d, c) {
        fb = !0;
        Ab.removeClass()
          .addClass("dialog")
          .addClass("dialog" + b);
        sb.html(d);
        rb.children().appendTo(Ua);
        a[0].appendTo(rb.empty());
        nb.empty();
        2 > a.length ? rb.css("bottom", "0") : rb.css("bottom", "2.5em");
        void 0 != a[1] &&
          nb.append(
            wb.unbind("click").click(function () {
              a[1] && a[1]();
              r();
            })
          );
        void 0 != a[2] &&
          nb.append(
            tb.unbind("click").click(function () {
              a[2] && a[2]();
              r();
            })
          );
        vb.unbind("click");
        void 0 != a[3] &&
          vb.click(function () {
            a[3] && a[3]();
            r();
          });
        for (b = 4; b < a.length; b++)
          nb.append(
            $('<input type="button" class="buttonOK">')
              .val(a[b][0])
              .unbind("click")
              .click(
                (function (a) {
                  return function () {
                    a() && r();
                  };
                })(a[b][1])
              )
          );
        Ab.stop(!0, !0).fadeTo(100, 0.98, function () {
          a[0].focus();
          c && c();
        });
        vb.stop(!0, !0).fadeTo(100, 0.25);
      }
      function r() {
        Ab.stop(!0, !0).fadeOut(100, function () {
          fb || (rb.children().appendTo(Ua), Ab.removeClass(), c());
        });
        vb.hide();
        fb = !1;
      }
      function oa() {
        if (!pb) {
          pb = !0;
          Ta();
          for (var a in eb)
            eb[a].auto && eb[a].button && eb[a].div.stop(!0, !0).fadeOut(100);
          z("ashow", !1);
        }
      }
      function Wa() {
        if (pb) {
          pb = !1;
          Ta();
          for (var a in eb)
            eb[a].auto && eb[a].button && eb[a].div.stop(!0, !0).fadeIn(100);
          z("ashow", !0);
        }
      }
      function Ta(a) {
        var b = !1,
          d;
        for (d in eb)
          if (eb[d].button) {
            b = !0;
            break;
          }
        (b && !pb) || a || jQuery.fx.off
          ? Za.stop(!0, !0).fadeTo(200, 1)
          : Za.stop(!0, !0).fadeTo(200, 0.01);
      }
      function Xa(a) {
        for (var b = 0; 7 > b; b++) Fb[b] = hb(a.substr(4 * b, 4));
        h("col-font", hb(Fb[0], 0, !0));
        h("col-back", hb(Fb[1], 0, !0));
        h("col-board", hb(Fb[2], 0, !0));
        h("col-button", hb(Fb[3], 0, !0));
        h("col-link", hb(Fb[4], 0, !0));
        h("col-logo", hb(Fb[5], 0, !0));
        h("col-logoback", hb(Fb[6], 0, !0));
        Ya();
      }
      function Ya() {
        for (
          var a =
              "ns" == T("uidesign") || "mtns" == T("uidesign") ? Gb[1] : Gb[0],
            b = "#000" == hb(Fb[0]) ? -1 : 1,
            d = 0;
          d < Pb.length;
          d++
        )
          a = a.replace("?", hb(Fb[Pb[d] & 15], ((Pb[d] << 20) >> 24) * b));
        Kb[0].styleSheet
          ? (Kb[0].styleSheet.cssText = a)
          : (Kb[0].innerHTML = a);
      }
      function hb(a, b, d) {
        var c, r;
        b = b || 0;
        (r = /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/.exec(a)) &&
          (c = [r[1] + r[1], r[2] + r[2], r[3] + r[3]]);
        (r = /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/.exec(a)) &&
          (c = [r[1], r[2], r[3]]);
        for (a = 0; 3 > a; a++)
          (c[a] = parseInt(c[a], 16)),
            (c[a] += b),
            (c[a] = Math.min(Math.max(c[a], 0), 255)),
            (c[a] = Math.round(c[a] / 17).toString(16));
        return (
          "#" +
          (d ? c[0] + c[0] + c[1] + c[1] + c[2] + c[2] : c[0] + c[1] + c[2])
        );
      }
      function gb(a) {
        return (a = /^\s*((#[0-9a-fA-F]{3}){7})\s*$/.exec(a))
          ? (Xa(a[1]), !0)
          : !1;
      }
      function $a() {
        return Fb.join("");
      }
      function jb() {
        "mt" == T("uidesign") || "mtns" == T("uidesign")
          ? $("html").addClass("mtds")
          : $("html").removeClass("mtds");
      }
      function ob() {
        var a = $(window).width(),
          b = $(window).height(),
          d = T("view");
        (Ob = "m" == d ? !0 : "d" == d ? !1 : 1.2 > a / b)
          ? $("html").addClass("m")
          : $("html").removeClass("m");
      }
      function qb(a, b) {
        if ("property" == a)
          switch (b[0]) {
            case "color":
              if ("u" != b[1])
                if ("i" == b[1] || "e" == b[1]) {
                  var d = $a(),
                    c = prompt(EXPORT_CODEPROMPT, d);
                  c && c != d && !gb(c) && alert(COLOR_FAIL);
                  w.set("color", "u");
                } else
                  Xa(
                    Bb["r" == b[1] ? ~~(Math.random() * Bb.length) : b[1] - 1]
                  );
              break;
            case "font":
              "r" == b[1]
                ? $("#container, #multiphase").css(
                    "font-family",
                    ["lcd", "lcd2", "lcd3", "lcd4", "lcd5"][
                      ~~(5 * Math.random())
                    ]
                  )
                : $("#container, #multiphase").css("font-family", b[1]);
              break;
            case "col-font":
            case "col-back":
            case "col-board":
            case "col-button":
            case "col-link":
            case "col-logo":
            case "col-logoback":
              d = Cb.indexOf(b[0].substring(4, b[0].length));
              c = b[1];
              c = hb(c);
              Fb[d] != c && ((Fb[d] = c), h("color", "u"), Ya());
              break;
            case "zoom":
              $("html").attr("class", "p" + ~~(100 * b[1])),
                $(window).trigger("resize"),
                jb();
            case "view":
              ob();
              break;
            case "uidesign":
              jb();
              Ya();
              break;
            case "wndScr":
              mb("scramble", "f" == b[1]);
              break;
            case "wndStat":
              mb("stats", "f" == b[1]);
              break;
            case "wndTool":
              mb("tools", "f" == b[1]);
          }
      }
      function mb(a, b) {
        eb[a]
          ? b
            ? eb[a].div.addClass("fixed")
            : eb[a].div.removeClass("fixed")
          : $(mb.bind(void 0, a, b));
      }
      function cb() {
        gb(window.location.hash) && (w.set("color", "u"), $.clearHash());
      }
      var eb = {},
        pb = !1,
        fb = !1,
        vb,
        Za,
        zb = $("<div />"),
        xb = { scramble: "scrHide", tools: "toolHide", stats: "statHide" },
        Ab = $("<div />").addClass("dialog"),
        sb = $("<div />").addClass("title"),
        rb = $("<div />").addClass("value"),
        nb = $("<div />").addClass("button"),
        wb = $('<input type="button" class="buttonOK">').val(OK_LANG),
        tb = $('<input type="button" class="buttonOK">').val(CANCEL_LANG);
      Ab.append(sb, rb, nb);
      var Kb = $("<style>").appendTo("head"),
        Gb =
          "html,body,textarea,#leftbar{color:?;background-color:?}#leftbar{border-color:?}#logo{color:?;border-color:?;background-color:?}.mybutton,.tab,.cntbar{border-color:?}html:not(.m) .mybutton:hover,.mybutton:active,.tab:active,.mywindow,.popup,.dialog{background-color:?}.mybutton.enable,.tab.enable,.cntbar,.selected,table.opttable tr th:first-child,div.helptable h2,div.helptable h3{background-color:?}#gray{background-color:?}html:not(.m) .times:hover,html:not(.m) .click:hover,.times:active,.click:active,textarea{background-color:?}.click{color:?}.mywindow,.popup,.dialog,.table,.table td,.table th,textarea,.tabValue,.opttable td.sr{border-color:?}html:not(.m) #avgstr .click:hover,#avgstr .click:active{background-color:?}select,input[type='button'],input[type='text']{color:?;background:?;border-color:?}input:disabled,table.opttable tr:nth-child(odd) td:first-child,div.helptable li:nth-child(odd){background:?}.mywindow::before,.popup,.dialog,#leftbar::before";
      Gb = [Gb + "{box-shadow:0 0 .6em ?}", Gb + "{box-shadow:none}"];
      var Bb =
          "#000#efc#fdd#fbb#00f#ff0#000 #000#ffe#ff9#ff0#00f#fa0#000 #fff#600#668#408#ccf#0ff#000 #fff#000#555#888#aaa#000#aaa #000#fff#ccc#ddd#555#fff#888 #fff#227#9c3#563#580#dad#000 #9aa#023#034#b80#28d#678#034 #678#ffe#eed#ffe#28d#678#eed".split(
            " "
          ),
        Fb = "#000 #efc #fdd #fbb #dbb #ff0 #000".split(" "),
        Pb = [
          0, 1, 545, 5, 549, 6, 546, 2, 3, 0, 546, 4, 546, 545, 0, 3826, 546,
          274, 0,
        ],
        Cb = "font back board button link logo logoback".split(" "),
        Ob = !1;
      $(function () {
        Qa(
          "ui",
          "property",
          qb,
          /^(?:color|font|col-.+|zoom|view|uidesign|wnd(?:Scr|Stat|Tool))/
        );
        Va("ui", "zoom", 1, ZOOM_LANG, [
          "1",
          "0.7 0.8 0.9 1 1.1 1.25 1.5".split(" "),
          "70% 80% 90% 100% 110% 125% 150%".split(" "),
        ]);
        Va("ui", "font", 1, PROPERTY_FONT, [
          "lcd",
          "r Arial lcd lcd2 lcd3 lcd4 lcd5 Roboto".split(" "),
          PROPERTY_FONT_STR.split("|").concat("Roboto"),
        ]);
        Va("kernel", "ahide", 0, PROPERTY_AHIDE, [!0]);
        Va("ui", "uidesign", 1, PROPERTY_UIDESIGN, [
          "n",
          ["n", "mt", "ns", "mtns"],
          PROPERTY_UIDESIGN_STR.split("|"),
        ]);
        Va("ui", "view", 1, PROPERTY_VIEW, [
          "a",
          ["a", "m", "d"],
          PROPERTY_VIEW_STR.split("|"),
        ]);
        Va("color", "color", 1, PROPERTY_COLOR, [
          "1",
          "uer12345678".split(""),
          PROPERTY_COLOR_STR.split("|"),
        ]);
        var b = PROPERTY_COLORS.split("|");
        Va("color", "col-font", 3, b[0], ["#000000"]);
        Va("color", "col-back", 3, b[1], ["#eeffcc"]);
        Va("color", "col-board", 3, b[2], ["#ffdddd"]);
        Va("color", "col-button", 3, b[3], ["#ffbbbb"]);
        Va("color", "col-link", 3, b[4], ["#0000ff"]);
        Va("color", "col-logo", 3, b[5], ["#ffff00"]);
        Va("color", "col-logoback", 3, b[6], ["#000000"]);
        Va("color", "colcube", 4, "Cube", ["#ff0#fa0#00f#fff#f00#0d0"]);
        Va("color", "colpyr", 4, "Pyraminx", ["#0f0#f00#00f#ff0"]);
        Va("color", "colskb", 4, "Skewb", ["#fff#00f#f00#ff0#0f0#f80"]);
        Va("color", "colmgm", 4, "Megaminx", [
          "#fff#d00#060#81f#fc0#00b#ffb#8df#f83#7e0#f9f#999",
        ]);
        Va("color", "colsq1", 4, "SQ1", ["#ff0#f80#0f0#fff#f00#00f"]);
        Va("color", "col15p", 4, "15 Puzzle", ["#f99#9f9#99f#fff"]);
        Va("ui", "wndScr", 1, PROPERTY_WNDSCR, [
          "n",
          ["n", "f"],
          PROPERTY_WND_STR.split("|"),
        ]);
        Va("ui", "wndStat", 1, PROPERTY_WNDSTAT, [
          "n",
          ["n", "f"],
          PROPERTY_WND_STR.split("|"),
        ]);
        Va("ui", "wndTool", 1, PROPERTY_WNDTOOL, [
          "n",
          ["n", "f"],
          PROPERTY_WND_STR.split("|"),
        ]);
        vb = $("#gray");
        $(".donate").appendTo(zb);
        f(
          "donate",
          BUTTON_DONATE,
          function () {
            n([zb, 0, void 0, 0], "stats", BUTTON_DONATE);
          },
          5
        );
        Za.appendTo(a)
          .mouseenter(function () {
            Ta(!0);
          })
          .mouseleave(function () {
            Ta();
          });
        setTimeout(Ta, 3e3);
        Ab.appendTo("body");
        $(window).resize(ob);
        $(window).bind("hashchange", cb);
        cb();
        "https:" != location.protocol &&
          (document.title = "[UNSAFE] " + document.title);
      });
      return {
        addWindow: function (c, r, h, f, n, w) {
          h.appendTo(a);
          h.addClass("mywindow");
          h.append(
            $('<span class="chide" data="' + xb[c] + '"></span>').click(b)
          );
          f = T(c, f);
          Za = Za || $("#leftbar");
          Za.children(".c" + w)
            .addClass(f ? "enable" : "")
            .data("module", c)
            .click(d)
            .find("span:first")
            .html(r);
          eb[c] = { button: f, div: h, auto: n };
          f ? h.show() : h.hide();
          z("button", [c, f]);
        },
        addButton: f,
        showDialog: n,
        hideDialog: r,
        isDialogShown: function (a) {
          return Ab.hasClass("dialog" + a);
        },
        exportColor: $a,
        nearColor: hb,
        setAutoShow: function (a) {
          (a = a || !T("ahide")) ? Wa() : oa();
          timer.showAvgDiv(a);
        },
        hide: oa,
        show: Wa,
        isPop: function () {
          return fb;
        },
        toggleLeftBar: Ta,
      };
    })(),
    Ta = (function () {
      function a(a, b, d, c, h) {
        this.data = a;
        this.callback = b;
        this.select1 = d;
        this.select2 = c;
        this.reset(h);
      }
      function d(a, b, d) {
        for (var c = 0; c < a.length; c++)
          if ($.isArray(a[c][1]))
            for (var r = 0; r < a[c][1].length; r++) {
              if (a[c][1][r][1] == b) {
                d(c, r);
                return;
              }
            }
          else if (a[c][1] == b) {
            d(c, null);
            break;
          }
      }
      var b = a.prototype;
      b.loadSelect2 = function (a) {
        c();
        a = a || 0;
        var b = ~~this.select1.prop("selectedIndex");
        b = (this.data[b] || [])[1];
        this.select2.empty();
        if ($.isArray(b)) {
          this.select2.show();
          for (var d = 0; d < b.length; d++)
            this.select2.append($("<option>").html(b[d][0]).val(b[d][1]));
          this.select2.prop("selectedIndex", a);
        } else this.select2.hide();
        this.onSelect2Change();
      };
      b.onSelect1Change = function () {
        this.loadSelect2();
      };
      b.onSelect2Change = function () {
        this.callback && this.callback(this.getSelected());
      };
      b.getSelIdx = function () {
        var a = ~~this.select1.prop("selectedIndex");
        if (!$.isArray((this.data[a] || [])[1])) return [a];
        var b = ~~this.select2.prop("selectedIndex");
        return [a, b];
      };
      b.getSelected = function () {
        var a = this.getSelIdx();
        return 1 == a.length
          ? (this.data[a[0]] || [])[1]
          : this.data[a[0]][1][a[1]][1];
      };
      b.reset = function (a) {
        a = a || this.getSelected();
        this.select1.empty();
        for (var b = 0; b < this.data.length; b++)
          this.select1.append(
            $("<option>")
              .html(this.data[b][0])
              .val($.isArray(this.data[b][1]) ? b : this.data[b][1])
          );
        this.select1.unbind("change").change(this.onSelect1Change.bind(this));
        this.select2.unbind("change").change(this.onSelect2Change.bind(this));
        a && this.loadVal(a);
      };
      b.loadVal = function (a) {
        var b = this.callback;
        this.callback = null;
        d(
          this.data,
          a,
          function (a, b) {
            this.select1.prop("selectedIndex", a);
            this.loadSelect2(b);
          }.bind(this)
        );
        this.callback = b;
      };
      b.getValName = function (a) {
        var b = null;
        d(
          this.data,
          a,
          function (a, d) {
            b = this.data[a][0];
            null != d && (b += ">" + this.data[a][1][d][0]);
          }.bind(this)
        );
        return b;
      };
      b.getValIdx = function (a) {
        var b = null;
        d(this.data, a, function (a, d) {
          b = 100 * a + (null == d ? d : 99);
        });
        return b;
      };
      return a;
    })();
  (function () {
    function a(a, n) {
      if ("bgImgO" == n[0]) c.stop(!0, !0).fadeTo(0, n[1] / 100);
      else if ("bgImgS" == n[0])
        if ("n" == n[1]) c.hide(), (r = "n");
        else if ((c.show(), "u" == n[1]))
          if ("modify" == n[2]) {
            var z = prompt(BGIMAGE_URL, d);
            f.exec(z)
              ? ((d = z), c.attr("src", d), h("bgImgSrc", d))
              : (alert(BGIMAGE_INVALID), h("bgImgS", r), w.reload());
          } else (d = T("bgImgSrc", d)), c.attr("src", d);
        else (r = n[1]), c.attr("src", b[n[1]]);
    }
    var d = "",
      b = [
        "https://i.imgur.com/X7Xi7D1.png",
        "https://i.imgur.com/K4zbMsu.png",
        "https://i.imgur.com/Fsh6MaM.png",
      ],
      c,
      r = 0,
      f =
        /^((http|https|ftp):\/\/)?(\w(:\w)?@)?([0-9a-z_-]+\.)*?([a-z0-9-]+\.[a-z]{2,6}(\.[a-z]{2})?(:[0-9]{2,6})?)((\/[^?#<>\/\\*":]*)+(\?[^#]*)?(#.*)?)?$/i;
    $(function () {
      c = $("#bgImage");
      Qa("bgImage", "property", a, /^bgImg[OS]$/);
      Va("ui", "bgImgO", 2, BGIMAGE_OPACITY, [25, 0, 100]);
      Va("ui", "bgImgS", 1, BGIMAGE_IMAGE, [
        "n",
        ["n", "u", 0, 1, 2],
        BGIMAGE_IMAGE_STR.split("|").slice(0, -1).concat(1, 2, 3),
      ]);
    });
  })();
  var Wa = /^([\d])?([FRUBLDfrubldzxySME])(?:([w])|&sup([\d]);)?([2'])?$/,
    oa = !0;
  $(function () {
    Va("kernel", "useMilli", 0, PROPERTY_USEMILLI, [!1], 1);
    Va(
      "kernel",
      "timeFormat",
      1,
      PROPERTY_FORMAT,
      ["h", ["h", "m", "s"], ["hh:mm:ss.XX(X)", "mm:ss.XX(X)", "ss.XX(X)"]],
      1
    );
    Ua.appendTo("body");
    a.appendTo("body");
    $(document).keydown(function (a) {
      oa = !0;
      z("keydown", a);
      timer.onkeydown(a);
      return oa;
    });
    $(document).keyup(function (a) {
      oa = !0;
      z("keyup", a);
      timer.onkeyup(a);
      return oa;
    });
    $("#container").bind("touchstart", function (a) {
      $(a.target).is(".click") ||
        (c(),
        timer.onkeydown({ which: 32 }),
        a.preventDefault && a.preventDefault());
    });
    $("#container").bind("touchend", function (a) {
      $(a.target).is(".click") ||
        (c(),
        timer.onkeyup({ which: 32 }),
        a.preventDefault && a.preventDefault());
    });
    $("#container").bind("touch", function (a) {
      $(a.target).is(".click") || (a.preventDefault && a.preventDefault());
    });
    $("#touch").remove();
    $("#container").mousedown(function (a) {
      !$(a.target).is(".click") &&
        1 == a.which &&
        T("useMouse") &&
        (timer.onkeydown({ which: 32 }),
        a.preventDefault && a.preventDefault());
    });
    $("#container").mouseup(function (a) {
      !$(a.target).is(".click") &&
        1 == a.which &&
        T("useMouse") &&
        (timer.onkeyup({ which: 32 }), a.preventDefault && a.preventDefault());
    });
    try {
      document.cookie =
        "fp=" +
        $.fingerprint() +
        "; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
    } catch (Sa) {}
  });
  $(function () {
    for (
      var a = "properties cachedScr devData wcaData gglData locData".split(" "),
        d = 0;
      d < a.length;
      d++
    )
      try {
        JSON.parse(localStorage[a[d]] || "{}");
      } catch (r) {
        delete localStorage[a[d]];
      }
    var b = [];
    for (d = 1; d <= ~~T("sessionN", 15); d++) a.push("session" + d);
    for (d = 0; d < localStorage.length; d++) {
      var c = localStorage.key(d);
      -1 == a.indexOf(c) && b.push(c);
    }
    for (d = 0; d < b.length; d++) delete localStorage[b[d]];
  });
  return {
    pretty: n,
    getProp: T,
    setProp: h,
    regProp: Va,
    getSProps: w.getSProps,
    setSProps: w.setSProps,
    regListener: Qa,
    addWindow: Ya.addWindow,
    addButton: Ya.addButton,
    pushSignal: z,
    showDialog: Ya.showDialog,
    hideDialog: Ya.hideDialog,
    isDialogShown: Ya.isDialogShown,
    exportColor: Ya.exportColor,
    clrKey: function () {
      oa = !1;
    },
    temp: Ua,
    reprop: w.reload,
    loadProp: w.load,
    parseScramble: function (a, d) {
      for (
        var b = [], c = (T("preScr") + " " + a).split(" "), r, h, f, n = 0;
        n < c.length;
        n++
      )
        (r = Wa.exec(c[n])),
          null != r &&
            ((f = "FRUBLDfrubldzxySME".indexOf(r[2])),
            14 < f
              ? ((r = "2'".indexOf(r[5] || "X") + 2),
                (f = [0, 4, 5][f % 3]),
                b.push([d.indexOf("FRUBLD".charAt(f)), 2, r]),
                b.push([d.indexOf("FRUBLD".charAt(f)), 1, 4 - r]))
              : ((h =
                  12 > f
                    ? ~~r[1] || ~~r[4] || (("w" == r[3] || 5 < f) && 2) || 1
                    : -1),
                (r = (12 > f ? 1 : -1) * ("2'".indexOf(r[5] || "X") + 2)),
                b.push([d.indexOf("FRUBLD".charAt(f % 6)), h, r])));
      return b;
    },
    blur: c,
    ui: Ya,
    TwoLvMenu: Ta,
    pround: function (a, d) {
      return n(Xa(a), d);
    },
    round: Xa,
  };
});
var exportFunc = execMain(function () {
  function z() {
    return storage.exportAll().then(function (a) {
      a.properties = mathlib.str2obj(localStorage.properties);
      xb = JSON.stringify(a);
    });
  }
  function Qa() {
    var a = null;
    try {
      a = JSON.parse(this.result);
    } catch (nb) {
      logohint.push("Invalid Data");
      return;
    }
    n(a);
  }
  function n(a) {
    var b = 0,
      d = 0,
      c = 0;
    storage
      .exportAll()
      .then(function (r) {
        for (var h = 1; h <= ~~kernel.getProp("sessionN"); h++) {
          var f = mathlib.str2obj(r["session" + h] || []),
            n = mathlib.str2obj(a["session" + h] || []);
          f.length != n.length &&
            (b++,
            (d += Math.max(n.length - f.length, 0)),
            (c += Math.max(f.length - n.length, 0)));
        }
        return confirm(
          IMPORT_FINAL_CONFIRM.replace("%d", b)
            .replace("%a", d)
            .replace("%r", c)
        )
          ? Promise.resolve()
          : Promise.reject();
      })
      .then(function () {
        if ("properties" in a) {
          var b = localStorage.devData || "{}",
            d = localStorage.wcaData || "{}",
            c = localStorage.gglData || "{}",
            r = localStorage.locData || "{}";
          localStorage.clear();
          localStorage.devData = b;
          localStorage.wcaData = d;
          localStorage.gglData = c;
          localStorage.locData = r;
          localStorage.properties = mathlib.obj2str(a.properties);
          kernel.loadProp();
        }
        storage.importAll(a).then(function () {
          location.reload();
        });
      }, $.noop);
  }
  function Xa(a) {
    this.files.length && a.readAsBinaryString(this.files[0]);
  }
  function c(a) {
    return a && /^[A-Za-z0-9]+$/.exec(a);
  }
  function Ua(a, b) {
    try {
      return JSON.parse(localStorage[a])[b] || "";
    } catch (wb) {
      return "";
    }
  }
  function a(a) {
    if (a.target === ob[0] || a.target === jb[0])
      a = Ua("wcaData", "cstimer_token");
    else {
      a = prompt(EXPORT_USERID, Ua("locData", "id"));
      if (null == a) return;
      localStorage.locData = JSON.stringify({
        id: a,
        compid: Ua("locData", "compid"),
      });
      kernel.pushSignal("export", ["account", "locData"]);
    }
    if (c(a)) return a;
    alert(EXPORT_INVID);
  }
  function f(a) {
    return new Promise(function (b, d) {
      var c = LZString.compressToEncodedURIComponent(xb);
      $.post(
        "https://cstimer.net/userdata.php",
        { id: a, data: c },
        function (a) {
          0 == a.retcode ? b(a) : d(a);
        },
        "json"
      ).error(d);
    });
  }
  function w(b) {
    var d = a(b);
    if (d) {
      var c = $(b.target),
        r = c.html();
      c.html("...");
      f(d)
        .then(
          function () {
            alert(EXPORT_UPLOADED);
          },
          function () {
            alert(EXPORT_ERROR);
          }
        )
        .then(function () {
          c.html(r);
        });
    }
  }
  function T(b) {
    var d = a(b);
    if (d) {
      var c = $(b.target),
        r = c.html();
      c.html("Check File List...");
      var h = function () {
          alert(EXPORT_ERROR);
        },
        f = function () {
          c.html(r);
        };
      b = function (a) {
        a = ~~a.data;
        if (0 == a) return alert("No Data Found"), f();
        var b = 1;
        if (
          kernel.getProp("expp") &&
          ((b = ~~prompt(
            "You have %d file(s), load (1 - lastest one, 2 - lastest but one, etc) ?".replace(
              "%d",
              a
            ),
            "1"
          )),
          0 >= b || b > a)
        )
          return f();
        c.html("Import Data...");
        $.post(
          "https://cstimer.net/userdata.php",
          { id: d, offset: b - 1 },
          w,
          "json"
        )
          .error(h)
          .always(f);
      };
      var w = function (a) {
        var b = a.retcode;
        if (0 == b)
          try {
            n(JSON.parse(LZString.decompressFromEncodedURIComponent(a.data)));
          } catch (Cb) {
            alert(EXPORT_ERROR);
          }
        else 404 == b ? alert(EXPORT_NODATA) : alert(EXPORT_ERROR);
        f();
      };
      kernel.getProp("expp")
        ? $.post(
            "https://cstimer.net/userdata.php",
            { id: d, cnt: 1 },
            b,
            "json"
          )
            .error(h)
            .always(f)
        : b({ data: 1 });
    }
  }
  function h() {
    var a = Ua("gglData", "access_token");
    a &&
      (cb.html("Check File List..."),
      $.ajax(
        "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&orderBy=modifiedTime desc&q=name%3D%27cstimer.txt%27",
        {
          type: "GET",
          beforeSend: function (b) {
            b.setRequestHeader("Authorization", "Bearer " + a);
          },
        }
      )
        .success(function (b, c, r) {
          b = b.files;
          if (0 == b.length) return alert("No Data Found"), d();
          c = 1;
          if (
            kernel.getProp("expp") &&
            ((c = ~~prompt(
              "You have %d file(s), load (1 - lastest one, 2 - lastest but one, etc) ?".replace(
                "%d",
                b.length
              ),
              "1"
            )),
            0 >= c || c > b.length)
          )
            return d();
          cb.html("Import Data...");
          $.ajax(
            "https://www.googleapis.com/drive/v3/files/" +
              b[c - 1].id +
              "?alt=media",
            {
              type: "GET",
              beforeSend: function (b) {
                b.setRequestHeader("Authorization", "Bearer " + a);
              },
            }
          )
            .success(function (a) {
              try {
                a = JSON.parse(LZString.decompressFromEncodedURIComponent(a));
              } catch (Gb) {
                return alert("No Valid Data Found"), d();
              }
              d();
              n(a);
            })
            .error(function () {
              alert(EXPORT_ERROR + "\nPlease Re-login");
              Ra();
            });
          for (c = 10; c < b.length; c++)
            $.ajax("https://www.googleapis.com/drive/v3/files/" + b[c].id, {
              type: "DELETE",
              beforeSend: function (b) {
                b.setRequestHeader("Authorization", "Bearer " + a);
              },
            });
        })
        .error(function () {
          alert(EXPORT_ERROR + "\nPlease Re-login");
          Ra();
        }));
  }
  function Va() {
    var a = Ua("gglData", "access_token");
    a &&
      (eb.html("Create File..."),
      $.ajax(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
        {
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify({
            parents: ["appDataFolder"],
            name: "cstimer.txt",
          }),
          beforeSend: function (b) {
            b.setRequestHeader("Authorization", "Bearer " + a);
          },
        }
      )
        .success(function (a, b, c) {
          a = c.getResponseHeader("location");
          eb.html("Uploading Data...");
          $.ajax(a, {
            type: "PUT",
            contentType: "text/plain",
            data: LZString.compressToEncodedURIComponent(xb),
          })
            .success(function (a, b, c) {
              alert("Export Success");
              d();
            })
            .error(function (a, b, d) {
              alert(EXPORT_ERROR);
              Ra();
            });
        })
        .error(function (a, b, d) {
          401 == a.status
            ? alert("Timeout, Please Re-login")
            : alert(EXPORT_ERROR);
          Ra();
        }));
  }
  function Ya() {
    z().then(function () {
      if (window.Blob) {
        var a = new Blob([xb], { type: "text/plain" });
        vb.attr("href", URL.createObjectURL(a));
        vb.attr(
          "download",
          "cstimer_" +
            mathlib.time2str(new Date() / 1e3, "%Y%M%D_%h%m%s") +
            ".txt"
        );
      }
      kernel.showDialog(
        [lb, 0, void 0, 0, [EXPORT_ONLYOPT, Wa], [EXPORT_ACCOUNT, oa]],
        "export",
        EXPORT_DATAEXPORT
      );
    });
  }
  function Ta(a) {
    a = LZString.compressToEncodedURIComponent(JSON.stringify(a));
    var b = prompt(EXPORT_CODEPROMPT, a);
    if (b && b != a) {
      try {
        b = JSON.parse(LZString.decompressFromEncodedURIComponent(b));
      } catch (wb) {
        return;
      }
      return b;
    }
  }
  function Wa() {
    var a = JSON.parse(localStorage.properties),
      b = {},
      d;
    for (d in a) d.startsWith("session") || (b[d] = a[d]);
    b = Ta(b);
    if (!b) return !1;
    a = JSON.parse(localStorage.properties);
    for (d in a) d.startsWith("session") && (b[d] = a[d]);
    localStorage.properties = mathlib.obj2str(b);
    location.reload();
    return !1;
  }
  function oa() {
    var a = {
        wcaData: localStorage.wcaData,
        gglData: localStorage.gglData,
        locData: localStorage.locData,
      },
      b = Ta(a);
    if (!b) return !1;
    for (var d in a)
      b[d] &&
        ((localStorage[d] = b[d]), kernel.pushSignal("export", ["account", d]));
    location.reload();
    return !1;
  }
  function Sa() {
    var a = JSON.parse(localStorage.wcaData || "{}");
    $a.unbind("click");
    jb.unbind("click").removeClass("click");
    ob.unbind("click").removeClass("click");
    a.access_token
      ? ((a = a.wca_me),
        gb.html("WCAID: " + a.wca_id + "<br>Name: " + a.name),
        $a.click(b.bind(void 0, !0)).addClass("click"),
        jb.addClass("click").click(T),
        ob.addClass("click").click(w))
      : (gb.html(EXPORT_LOGINWCA),
        $a
          .click(function () {
            location.href = ib;
          })
          .addClass("click"));
  }
  function d() {
    var a = JSON.parse(localStorage.gglData || "{}");
    mb.unbind("click");
    cb.unbind("click")
      .removeClass("click")
      .html(EXPORT_FROMSERV + " (Google)");
    eb.unbind("click")
      .removeClass("click")
      .html(EXPORT_TOSERV + " (Google)");
    a.access_token
      ? ((a = a.ggl_me),
        qb.html("Name: " + a.displayName + "<br>Email: " + a.emailAddress),
        mb.click(Ra.bind(void 0, !0)).addClass("click"),
        cb.addClass("click").click(h),
        eb.addClass("click").click(Va))
      : (qb.html(EXPORT_LOGINGGL),
        mb
          .click(function () {
            location.href = bb;
          })
          .addClass("click"));
  }
  function b(a) {
    if (!a || confirm(EXPORT_LOGOUTCFM))
      delete localStorage.wcaData,
        kernel.pushSignal("export", ["account", "wcaData"]);
  }
  function Ra(a) {
    if (!a || confirm(EXPORT_LOGOUTCFM))
      delete localStorage.gglData,
        kernel.pushSignal("export", ["account", "gglData"]);
  }
  function r(a, b) {
    if ("atexpa" == a)
      if ("id" == b[1]) {
        var r = Ua("locData", "id");
        (c(r) && "modify" != b[2]) ||
          ((r = prompt(EXPORT_USERID, r)),
          c(r)
            ? ((localStorage.locData = JSON.stringify({
                id: r,
                compid: Ua("locData", "compid"),
              })),
              kernel.pushSignal("export", ["account", "locData"]))
            : (null != r && alert(EXPORT_INVID),
              kernel.setProp("atexpa", "n")));
      } else
        "wca" != b[1] ||
          c(Ua("wcaData", "cstimer_token")) ||
          (alert("Please Login with WCA Account in Export Panel First"),
          kernel.setProp("atexpa", "n"));
    else "export" == a && ("wcaData" == b[1] ? Sa() : "gglData" == b[1] && d());
  }
  function ab() {
    var a = kernel.getProp("atexpa", "n");
    "n" != a &&
      (z().then(function () {
        if ("id" == a || "wca" == a) {
          var b =
            "id" == a ? Ua("locData", "id") : Ua("wcaData", "cstimer_token");
          c(b)
            ? f(b).then(
                function () {
                  logohint.push("Auto Export Success");
                },
                function () {
                  logohint.push("Auto Export Failed");
                }
              )
            : (logohint.push("Auto Export Abort"),
              kernel.setProp("atexpa", "n"));
        } else if ("f" == a && window.Blob) {
          b = new Blob([xb], { type: "text/plain" });
          var d = $('<a class="click"/>');
          d.attr("href", URL.createObjectURL(b));
          d.attr(
            "download",
            "cstimer_" +
              mathlib.time2str(new Date() / 1e3, "%Y%M%D_%h%m%s") +
              ".txt"
          );
          d.appendTo("body");
          d[0].click();
          d.remove();
        }
      }),
      (sb = Ab = 0));
  }
  function kb() {
    "n" != kernel.getProp("atexpa", "n") &&
      ((sb += 1),
      sb >= kernel.getProp("atexpi", 100) &&
        (Ab && clearTimeout(Ab), (Ab = setTimeout(ab, 1e3))));
  }
  var ib =
      "https://www.worldcubeassociation.org/oauth/authorize?client_id=63a89d6694b1ea2d7b7cbbe174939a4d2adf8dd26e69acacd1280af7e7727554&response_type=code&scope=public&redirect_uri=" +
      encodeURI(location.href.split("?")[0]),
    bb =
      "https://accounts.google.com/o/oauth2/v2/auth?client_id=738060786798-octf9tngnn8ibd6kau587k34au263485.apps.googleusercontent.com&response_type=token&scope=https://www.googleapis.com/auth/drive.appdata&redirect_uri=" +
      encodeURI(location.href.split("?")[0]),
    lb = $("<div />"),
    hb = $('<table class="expOauth expUpDown">'),
    gb = $("<td></td>"),
    $a = $("<tr>").append('<td class="img"/>', gb),
    jb = $('<a class="click"/>')
      .html(EXPORT_FROMSERV + " (csTimer)")
      .click(T),
    ob = $('<a class="click"/>')
      .html(EXPORT_TOSERV + " (csTimer)")
      .click(w),
    qb = $("<td></td>"),
    mb = $("<tr>").append('<td class="img"/>', qb),
    cb = $('<a class="click"/>'),
    eb = $('<a class="click"/>'),
    pb = $('<input type="file" id="file" accept="text/*"/>'),
    fb = $('<input type="file" id="file" accept="text/*"/>'),
    vb = $('<a class="click"/>').html(EXPORT_TOFILE),
    Za = $('<a class="click"/>')
      .html(EXPORT_FROMSERV + " (csTimer)")
      .click(T),
    zb = $('<a class="click"/>')
      .html(EXPORT_TOSERV + " (csTimer)")
      .click(w),
    xb;
  hb.append(
    $("<tr>").append(
      $("<td>").append(
        $('<a class="click"/>')
          .html(EXPORT_FROMFILE)
          .click(function () {
            pb.click();
          })
      ),
      $("<td>").append(vb)
    ),
    $("<tr>").append($("<td>").append(Za), $("<td>").append(zb)),
    $("<tr>").append(
      $("<td colspan=2>").append(
        $('<a class="click"/>')
          .html(EXPORT_FROMOTHER)
          .click(function () {
            fb.click();
          })
      )
    )
  );
  var Ab,
    sb = 0;
  $(function () {
    kernel.regListener("export", "time", kb);
    kernel.regListener("export", "property", r, /^atexpa$/);
    kernel.regListener("export", "export", r, /^account$/);
    kernel.regProp("kernel", "atexpa", 1, PROPERTY_AUTOEXP, [
      "n",
      ["n", "f", "id", "wca"],
      PROPERTY_AUTOEXP_OPT.split("|"),
    ]);
    kernel.regProp("kernel", "atexpi", -2, "Auto Export Interval (Solves)", [
      100,
      [50, 100, 200, 500],
      ["50", "100", "200", "500"],
    ]);
    kernel.regProp("kernel", "expp", 0, PROPERTY_IMPPREV, [!1]);
    kernel.addButton("export", BUTTON_EXPORT, Ya, 2);
    lb.append(
      "<br>",
      $('<div class="expOauth">').append(
        $('<table id="wcaLogin">').append($a),
        $('<table class="expUpDown">').append(
          $("<tr>").append($("<td>").append(jb), $("<td>").append(ob))
        )
      ),
      $('<div class="expOauth">').append(
        $('<table id="gglLogin">').append(mb),
        $('<table class="expUpDown">').append(
          $("<tr>").append($("<td>").append(cb), $("<td>").append(eb))
        )
      ),
      hb
    );
    if (window.FileReader && window.Blob) {
      var a = new FileReader();
      a.onload = Qa;
      var c = new FileReader();
      c.onload = function () {
        0 == stats.importSessions(TimerDataConverter(this.result)) &&
          logohint.push("No session imported");
      };
      pb.change(Xa.bind(pb[0], a));
      fb.change(Xa.bind(fb[0], c));
    }
    $.urlParam("code")
      ? (gb.html(EXPORT_LOGINAUTHED),
        $.post(
          "oauthwca.php",
          { code: $.urlParam("code") },
          function (a) {
            "access_token" in a
              ? ((localStorage.wcaData = JSON.stringify(a)),
                kernel.pushSignal("export", ["account", "wcaData"]))
              : (alert(EXPORT_ERROR), b());
          },
          "json"
        )
          .error(function () {
            alert(EXPORT_ERROR);
            b();
          })
          .always(function () {
            Sa();
            $.clearUrl("code");
          }),
        Ya())
      : Sa();
    if ($.hashParam("access_token")) {
      var h = $.hashParam("access_token");
      qb.html(EXPORT_LOGINAUTHED);
      $.get(
        "https://www.googleapis.com/drive/v3/about",
        { fields: "user", access_token: h },
        function (a) {
          "user" in a
            ? ((localStorage.gglData = JSON.stringify({
                access_token: h,
                ggl_me: a.user,
              })),
              kernel.pushSignal("export", ["account", "gglData"]))
            : (alert(EXPORT_ERROR), Ra());
        },
        "json"
      )
        .error(function (a, b, d) {
          401 == a.status
            ? alert("Timeout, Please Re-login")
            : alert(EXPORT_ERROR);
          Ra();
        })
        .always(function () {
          d();
          $.clearHash();
        });
      Ya();
    } else d();
  });
  return {
    exportProperties: Wa,
    isValidId: c,
    getDataId: Ua,
    logoutFromWCA: b,
    wcaLoginUrl: ib,
  };
});
var logohint = execMain(function () {
  function z() {
    c = void 0;
    Qa();
  }
  function Qa() {
    if (f) a.removeClass("hint"), a.html("ABOUT"), (c = void 0);
    else if (void 0 == c)
      if (((c = Xa.shift()), void 0 == c))
        a.removeClass("hint"), a.html("csTimer");
      else {
        a.html(
          '<div class="pad" style="width: ' +
            Ua.width() +
            'px; ">csTimer</div><span style="font-family: sans-serif; margin: 0 1em 0 1em;">' +
            c +
            '</span><div class="pad" style="width: ' +
            Ua.width() +
            'px; position: absolute;">csTimer</div>'
        );
        a.removeClass("hint");
        var n = 0.1 * (c.length + 15) + "s";
        a.css({
          "-webkit-animation-duration": n,
          "-moz-animation-duration": n,
          "animation-duration": n,
        });
        setTimeout(function () {
          a.addClass("hint");
        });
      }
  }
  function n() {
    var a = ["Webkit", "Moz", "O", "ms", "Khtml"],
      c = document.createElement("div");
    if (void 0 !== c.style.animationName) return !0;
    for (var f = 0; f < a.length; f++)
      if (void 0 !== c.style[a[f] + "AnimationName"]) return !0;
    return !1;
  }
  var Xa = [],
    c,
    Ua,
    a,
    f = !1,
    w = !1;
  $(function () {
    Ua = $("#logo");
    a = Ua.children().children();
    a.bind("oanimationend animationend webkitAnimationEnd", z);
    var c = $("#about"),
      h = c.children("h1").appendTo(kernel.temp).html();
    Ua.mouseenter(function () {
      f = !0;
      Qa();
    });
    Ua.mouseleave(function () {
      f = !1;
      Qa();
    });
    Ua.click(function () {
      "https:" != location.protocol &&
        confirm(
          "Your access to csTimer is unsafe. Press OK for safe access."
        ) &&
        (location.protocol = "https:");
      c.show();
      kernel.showDialog([c, 0, void 0, 0], "logo", h);
    });
    c.hide();
    kernel.regProp("kernel", "useLogo", 0, USE_LOGOHINT, [!0], 1);
    w = n();
  });
  return {
    push: function (a) {
      w && kernel.getProp("useLogo", !0) && (Xa.push(a), Qa());
    },
  };
});
var timer = execMain(
  function (z, Qa, n, Xa, c, Ua) {
    function a() {
      var a = n("useIns");
      if (!0 === a || "a" == a) return !0;
      if (!1 === a || "n" == a) return !1;
      if ("b" == a)
        return null == /^(333ni|444bld|555bld|r3ni)$/.exec(n("scrType"));
    }
    function f(a, b) {
      var d = [];
      a = (a || "").match(/#[0-9a-fA-F]{3}/g) || [];
      for (var c = 0; c < a.length; c++)
        d.push(~~kernel.ui.nearColor(a[b[c]], 0, !0).replace("#", "0x"));
      return d;
    }
    function w(a) {
      var b = a.which;
      if (17 == b)
        if (((a = a.originalEvent), 1 == a.location || 1 == a.keyLocation))
          b = 256;
        else if (2 == a.location || 2 == a.keyLocation) b = 257;
      return b;
    }
    var T,
      h = -1,
      Va = [],
      Ya,
      Ta = [],
      Wa = { play: $.noop },
      oa = Wa,
      Sa = Wa,
      d = Wa,
      b = Wa;
    void 0 !== window.Audio &&
      ((oa = new Audio(
        "data:audio/mp3;base64,//M4xAATSYYMAUxAAFnLyWJYln7RIAmBMD5PP7MLFh+v9gwMDBZyIn6JW5Ydg3AXBeH59S7vomiV+iILi7veiV///6In/wgoKGI7/+CbwQDH/gg7/5QEP5QMKs/q0cGlVL/ljQ06DnN/5yXn//M4xBEYsl6gAZmQASxhYji4zI0B9iVDm+gt1kQHSPZI/sgyZbMyXMRcn6bsgzk2M2J3LBLCgP5fSQQW7ikxUiqM2RpJiFP/f+Sw5hE80QQb//qbbzpPigBWhVKI71IfgLsD/GxF3etnsPVA//M4xA0YQhbUVc9IAYJsgBw94rEX5Zn32GB9ZJjM7WRsZByUJeG5tRzP///Pf5e/fnvj/6fnaROkqmWIVzyANulyUmy0y1+SM9qVIYeNThdSTt+Mr1dybYemoxoARO2BkwVpYBgP+hht2G3h//M4xAsXug7E9VgwA7hYwgWS6ksd1YZlz3SGJu9Tf9Nnh/QES1GjUas4DDPRsz6mUfOZ3RfFmnfdROWbCX//9enmoPCRJo0UuSOVVU+V6fM7/5rt///nr+Ei8PQumSH7twFhltkx/BAAAFsm//M4xAsYCnKY95k4ABXvCvTG+ZhpjLmGBPUOxY3uVbnhYC4i/qKgAl+s8ajiCcam+fG70NEYoMjT/vwWlhsMgsAjmx1l/gwsIok2JGjyp+n9yZUajYIgaaj///UfPJqlScmqAFAtFAtFottF//M4xAkXS38GX4EoArXUKwIPwD8ku8n7kImb5JCZqG+RnJ9PnezvO6//xA8+8g+tVcRFjauathAUMIAg8OCgodAezJxwoKOn/djpbbVGFFOQUZkIuqDVK7HdP6bt///jx1VoiZeQAK3+k2aJ//M4xAoX40MLHcg4AlCJVEGgLifPIFMGlO////2X6/6SbmA9JMKweDx2qhCSf/1Pfi1TVnqpD/55tUNLr/1qk5p6O2utkSc8w0003od7sk9roq6oceebQ46drqNR5yw+xpV1WIZlWJqoxBjD//M4xAkXIOsTGs4GXjzGCDgkBTJvzm+iZZL5OW2BQRQBdEfi9JG599JMa2qxISC8DMToZwZIgjTOMAiYj/MZDgIJ2fNmfZFBebWkAANCaSsG/c0cwBRxz//sPu///i3+hZvpd//JGObwoVXH//M4xAsXCPseWMMRI8KLBT5VTQZUaR+psYbbV0pcQAUJGtAxqeZjEEUMqUIQMQiIkmrChKdhgrzxluLhsqa6EwWtCAvBcUQPulnoHANyQxiijuwFEl1g/ilr/3+2/SqCVmRApRzgVEsmKcqa//M4xA0S+KLxv0lIAhehSRNXiyJCQgBBEhJYImmHiEERSGUIpCoBh7FgaUDLuoeCsFgayolLVHg0VO6w1LAXLfrLD8l9n2Tv//iIO5R88yRoxfLP60GESF0/nDMiacux54YAujYBIUHPuRFR//M4xCAcMsawAZhQAODgtEJMKyu88L8FgVhXC4IU1e74kCDGBMhIcWIyMSDf3GotCEFUPwGBgxceEQvKHf88kHCckfod///7Hj8w8uSD99yMyQyY3+Z/2c40nLu+VQKFvTbkoA8CijpNUkRQ//M4xA4UohrVn8YoAhQVpc+iJgUeAYryHnlIYPHDplFSoYxSxEVp6loHgsMDxxIWyzGo6lMY0vyiI4xUMpfvZ9v+WVkMpBIPIZyoJCTyKYKh1QEk3DdbkAgLmdaIAcZrvsZeRo1qN88WJe2b//M4xBoU0nq1t08oAkWHSapRERYpS1ZNEOpyCp0Z++Uhjcm/mvnRL9Dv6nRT3br/9a/daqivOpyT8pTzgdIm56oH3p//+tVpyS2yWSSWyWi261igBtlcTNuVMBDryxNmQvt1gMnh+q60Ycbs//M4xCUeAybGX5g4AkzzRWNhIP6tk+xpFjEOmsZHS80mXQ8xH5r/NJFqHl6Hdf4nJElTqabU3/uYY4PRuJghEUkNweCKPgJKVRTen+aNyZDdP////zFJsJA0nEDxuhAcDEgkEYjEkkgkjUJZ//M4xAwXgx7yX4IoAgCeXYgZ9oovHihUXv7Ob1OeQaRxi+hFflYXMXqt/92vlci/8+rttZXrai+ScQFMgn+Zv+1DvnPJDjTnnTd2UUIKCjyD55GfPCQixBcxX/z//BO33bDbW2PRBjsKUcCg//M4xA0UGqL2W8gQAtSYFFPQa5Z7v//KBhBHkIrkVz/oxFc4s7//5SlKvXuV35So77I900dv1///09f/SoslqKxA4cB8FoiEsBLGq7ksGoGKm+utulrklKqGKg0DDy3oNQvNH1uL2O9JZx/n//M4xBsUYQLiWsCMqo2CtyElAU930DGtGeUSEkYJXP///9Mk4BAkwIKORLN/LB2eh3K2nip0RZW3/DX/+HSxP/+s7spJrvAhfRAKXHSVTp/qR1yZwT//SsEOql7ChW9Q/OMbWcqTwk5mHqx3//M4xCgVUiJ0VEjKfJvMY0oqpWoY8RDupfzZhIqlN///0EmUDU9LHg0HOCodwVU8AnQaBUFfrKkt5CppLbfCQZI1EFRdF8qqmnnCQw/NfiYYhS57l/GgCLKyId/5H+VALvUe/75r5Xyx5n8e//M4xDENOQJoHjBKtLM67iEbxmn4ZnCdCLoqFQ9kxWiedXM7lVzLTKYul04P0UbpIFFAR5lxub6eFzRpwGWZebNGnFXF5s0//7s7O+bm5RpxRYJhmKEv//5UKiwtrUxBTUUzLjk5LjVVVVVV//M4xFsTMXHgAHsMHFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
      )),
      (Sa = new Audio(
        "data:audio/mp3;base64,//M4xAASgV4kFUwQACCAxs7JZPjOBIJicEBEdOxLJ6/6P3mlKTvt5zn5CBCEbI2c7oc57qf/XyEZTnQOBgYGLP/5c/1ygICQEP//EYPh+XBAMQ+Xf/wfbFqFNoEQoEFQEAoFAB+AVB4IMjon//M4xBUaKkrKX48oAFfHUmf89zpuUPoIoH/EBQgAD2Doh8EcCEYrHQOfg5IqAYuEADFAFIHufiYfOwfFyFFBYcHRAO/9XIRpJyy1dxT/+MFHac/xYuZar/fl+6pO7///UgWBacsstohOUoCw//M4xAsYGUbNn8wwAAMnmZ+cDu8djuSCYwYOmCwwdXtktWsTP35ZVoIgRJ5bXk6qf1VUR/f45seXnP2/2UZaUqN4JCMUOZ/QXBZBJxhp0akGam/eSOtFNysFTrfvaRb86SJV/8UPUrp+zSj1//M4xAkWefLEAMMG6O9KX1ERIatSpfyIuESQIBoKtVAipJxzbQQL48CaGZwhwiYAxOflcSz+973gNziP9c/v5/0/PsIzp/FcDcOP1BFm4cWZOejhzT30AwOIEAKnIInmpCW45KAB9YbUZ/KO//M4xA4XWgcGXnnS9wSLgdo+4uIZd65P8BmAVW7Y7RdHPK0MI1NPaSAaisaW6PReado2a3tr53Z8shskyFmpyIk2z3asoILchTb6As0mgosPDodNkqQyWtyzkN9VAOkEPxM62BmWyoOLzh2U//M4xA8Wo0bYVmBTPhU4VyIfetOVNubJtJwyjshE7b2ZpJtlITxc1n/J8XP///PMvDxcXPIwoA2s1hyf////4epZ4XqCenBIuF2M//9QvWE0dqBj/xLGEsUPE0jEFdMCsIqJSpRLJos62sp0//M4xBMZMz68BGoN5Wl11LRQpL29v/6e3///639n///10zdl8ltVyki9kGU76S73MSKDiwVgLnoYqS8dkGQxmRWYCIdkDyemBEJt8sECJ2ygAEKBwu6AY8ogACBZO52rx//7v/////6///////M4xA0WszrIAAhS/P6/8eVUMxJ6xGbUUV4y5GK2pLIUAIUTHlEKNVUUhYRFAMCkbC4YGRWQHAYoRJsg2ygsiFIlCSHN7VkjS8W1rJ2LYOTYG2bOm0LajK9swZdtrdttoNb7LQuMMOlQ3VRo//M4xBEZGU8SWMPS0tIV9Mkfd/1pqxzFRKswhSTgwWwQgQwhCwHACoEwdQyVi3qp5kt5l4gufzHb1ftPqNOHREJQLGOQMB6sJEcosEZvF0clGJo0hQoSQm2gQNrHxOBCKpL/dt/t4P83PyNq//M4xAsWcU8uWU9gA8fiEqmxOxkCxR4akYDKVhCQ5ihISWhdx7Aacl4qxKysejiaMq0RKVKjw1EIlXx7kNyh+YhTYQTIuJ6qH1XMejdTtLLsn1CrEeL7987UtHZP8DNiNI+8XNT2ZP9/uW15//M4xBAYwl6sAZhQAFu1p+7QEoFEBV6g1nEhETM/vMKP1RNwuAaAayAeGj0oc6q/i2hhO+PSRjjjX/FwXAsFAWAaAQzeahzov+TmOYx/5pqev7f9jx4WAgbOC3//B9weLoMQSAOtHnOtlwEc//M4xAwYUX64AY94ADqMNCC4LhWjHbCcscWKI+gkIRT5wve2X0GfevrOLVi2pfW/m3v4L2Die0CG/rPiJDe/fhRLzvp9YpesOBPrWKfGcRgVO0IKLecj34HDowGogX0kfwaqGKkalAB07DTR//M4xAkVUXa4988oA96hJKmadYbXjLDpmV8xPo1k6wuL0PCxnMJGMhSyrzFKVW7Sh0OgUtEsVmKxerFKpf0Q4iHg87wUFGhQV/pgoKCjcgoKahBS/0L/v/XqRrkvl1uuAHPRw8YD6obbAZWC//M4xBIUulrVv0YYAsy5WpzC/FjkoESgR4UTt+wwhRQCEFLAKVdjpuarL+uveMFSGZM6nmZMaEOIWDlW/5/+0r5//SO+5f3a+jXFKZxDY3GQ/s1JvAR00Bwm8O7JGQqoMUFo+y7mpgYG2r2Z//M4xB4bcyaYAY+AANJE6Zpfv7lAmES+t//rfSMzhikn//v2djA6YGqX//rdb6ponW8jSfJ8ibkXHX//3y4gabqQ8Zw1DEgm8QXFPFzCAAEwcY4A9QdIpc9///iBPL////////3//6M9cxlS//M4xA8XA0bMC8A4AsjHnuerv7VVCh9rmHodKIIiiUY7mD6VLmXU0bsJZcfcyYaPisRxwBgOwHnjQeMG4TgVGQhDhUTEwinA9B6g6NmFprmIhYajYcHygjk2V4VncGh/pRDV74GwDcP0CGGr//M4xBITSQr3GHgSwgw5n97yKxUMaHpRn1/7kgiEwoT78OtpAEDCCkDp+fpVl4UQo5o98MXf/aeWXBfInf////X4SBp//7b0qgCIGi9cuqFSVYVE2qotihQ5KWrE2fOIiAMVuhpaCTI7/0Dw//M4xCMUaO6dskgKwLA0WAQe/sCeCz8RJOxE10qrOhphGAQkGn1nexseGgoPBWMWAhKWWRDTIK5UA5ZtAroFgVAmNWRLlixNLy/xbJKikZ29gwqyerczBhX/o6Kibf/0+/1bYxSlaitzCKf3//M4xDAVGx5cFEiKzEdAiCD1rIHqlm6GpKZeWj6Gh46mGkVqGKVhIPHby1Zy8pfCQqpAWOqAYgcSGJhoGRGZHsMxdJkWFmegGRWgKiMBC6xUMgJn8e2aBkUDxrjxVMCirFixoKioo3FW/4sS//M4xDoR2CIEAkiEADQVFG4q38BBIRhkyEm1TEFNRTMuOTkuNVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV"
      )),
      (d = new Audio(
        "data:audio/mp3;base64,//M4xAATEZoICUEQACAAAAAAVjGPIABjGMYxjGQhG/qc7znAAAQQhCEIBgZzn//nfIT///OACCAgCAIA+D4f1AgCDu/4Pg//BAEAQBD+D4Pg4CDogB8PlAQV/lyZtCAp/v2yc4zIHc/+UWAK//M4xBIZMvKIAZqQAQy6fRSNAxgABQc3y4i7ilB2l4t/20mIGbn//xmCKEgXDEr/+2w43WSBgVCJ/+mtTILdRIHCXMRzx3kQZD/9uympqz5UM0lui5eOEQNP/+r//N5Z/e8LkFm0AKioK/UN//M4xAwX0eawAdhAAUrHCF0Xyt8mH+FmJNO7GaWW0L6MPJXkR+2bc26/iL/uuZmIOmYGTZtbRo0aTfrOMMts4YKnqUUfYjnHGhktCIExYjMNlU6UuxpZy0mb/nM+giFCFaQQgI7LAFMBlv/y//M4xAsX4mbGXsIKnHpCwXElk/qwtoiMigBBRYYAMG6v9geFWqiha0rlTWVobWLi5m11Vmyl9ZVVaWYqKvf+yGsipuxhoULRZkKJGs9SX4wt/f67oUPCYo0ih1Et/Of4NOUpySxlRsf7ZHkf//M4xAoXSl68flmEulpKJzj4HRAjce2at13fUYlVa81Ao7xm5DvuRGYrbf1B1ZtrXZqLSczrZVqtDG85ZwpvKJarJLMnQxnUvK2//CiRQaXEHfWHyDUPGvKdAnuygnfJqiqqAaP/y5zeISIf//M4xAsWMzKwVBhTraE4JQMQ82CUXHSsAKLmIWCKLSuDZK6KLh/93cGBwg5oV5fy3/////5f/cqr14yU5IbSzejWjcl3qChaEaQIIGKuYrKMJvAILCg9DdUmbiO/5EAFgTgHV3kXGB5LzZhY//M4xBEXU0K8CkCTPLCnbWj/8LVfenb+v/9lMdhLkuZ////+h1e0////ZWuiu25JXU4gIdVOhgZI5auESAnYXYPtGLUVNkw7AZqT2UR1DRMOtEiMdJ1sojbqlksl0lij/vaaaWCAoUoOsOYj//M4xBIZWW7yWNMHKgmVLqEkBMvdl3bkthguWpAMJL5dmCBEMMvMFyiijcL0EPwsO/78WKl4Qx4ODxz9SJW37VEMH3l3Vxg5RrFjA8GI/soju6ZTz88GLg1nCLfLsQODdZMRym1ANb0zCehG//M4xAsU4SrBjgvMHF48ZpdH8XJp18bP0yXW60P4TU4WFxtISSN2WosJZ57tW1Wz5kjP9f1uU8oycSAssqs7rDT4iJCUaBn01bMlSOf1AZ5D3f4l4hWAC+VSUH1YSABA8DgzLD94INFxHhUG//M4xBYUgzq09kBFXhnywvc/I/749Tqi5YJPyMGAtWO9FRGXONgyKILofPtDMho9WsaEq/9P/9eZGWRgyPkdzI/V9NCXBB+oZTwx/5ZkohiZfFYWGUnhLK43nk8bR3byGp2OQCms4M5k3dYz//M4xCMUYUqgKsFNDAaLS6pDeQeM4oGqVgmMfV/0df0+e75mZaYIerAmcBUFUJFXNty0TEQM06bMf/jVoBMla1FwGt16zGA8NQefkpVAN0tnbzz1C06KzuUensbO9SV2RyYMOpFsarqJI2lK//M4xDAVQXalH1kYAK/2GsnDmUuZ6l+FJuXQlnlBR08KxEVjwEKmGf/rKgLDpVyG/5QgguSRiMOCQQOSyqMhGmSI0qtdpYGVsYNfgCHScsHWrAQqDrQckoEi/yCXUjSk/79aKf+tajBVaCz7//M4xDojc86+X5loAn+t02X//f7r9bplxtM2HeRmHqp0/93U2b3TlQ8xzl8e6kEFIG6mMEDI31/TTdvYvpM7oJjHGDJURsphZqqLhgSBcUZnkhwkoPw/f//5IHv//x5CJQBtaN/99owR/who//M4xAsVOd7mX8FAAsYFIH97r8ivyxIagvaf/+l6J/+44QAExgoMmpeCDHv///WmHpMo1Q7I9pQ4RgqFjCyGND0Wg0tx4RPLWFfkXvhVMOs//yhIeIwEkmhE332M1sAGU0ua+qxgESxhRLOA//M4xBUTyKKa/ghGBJqX1Y3AokRAV3UCp3w6dBqJRj/wKWbIhICjGB0iGjxLKlfqCvJMO5ICkg6GvhUSkQkBSAFIgsEgyk7VBP1OmAhQMBDCArw0eOsDoSPFSowOkiEYBe0CkAqAkUCIkggI//M4xCQSKB4U0hiCALz3UDICqAtg0sVLFSXCj0ZEJAXrLLHu3niRH8e4iSlS06dh0NJMQU1FMy45OS41qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"
      )),
      (b = new Audio(
        "data:audio/mp3;base64,//M4xAASgSo1hUMQAIAgkWD33c9AN9ELeOf9d85/5CanO6HOhCNO//+hGUIQ5lw/EDogh8uH9YYLg+/UCEoCCwfLh/5Q4JDgPwQD6gQcDhwT/WDjidYYH41Hok//1+vs9vT8Aq1dS2NBQo9g//M4xBUaQmL2X4dAALQ2Nv44Xi2W/qxHUQblV/6FjBgoCtYppT/xUXgeJR7XVZl//o6MtmtX//9V+PR4UurefhUiY9P/v+HYURyEZPn2FUyg0IfGvlAQE4nuPo+d//Of6skEArDfvp+iADgm//M4xAsWqQbBZ88wAI8Z4TAwlzUxOFRqMwLkt7PBjyPCAzN57EJBCEQ7AhBUQ9J+MoqjYeqLUyR06dGBVigkZSuiSkjqVA08t/50tzOeqOg0HZglErtv+wsDIx9qsCCVRS8ugA0eMpdgLnQG//M4xA8Y+N7OVg4eHLkxaawiYEAmMzp+pVi0QgyWuSbfaLu2JCPMS48djN2OjQPo8Gm+1MTkQMvbWocLgBnJur3ebwmcLuKCc5bAgWU5jkzRmh7dVJw5hgQGKdTD4rLwfD/TApD6T3GsZ+jo//M4xAoVsMbllgvSOoaajtekUtnRNv4yigtZDycK1KCSjIEDHoXy5yCw8KkJoEIdZuEOmhM5IuAjwKlxUSmGXpCh5P7V0accB0u6n2KTHs/+J5P4YiA5EjpdEQKAAbh9B4FwOix3NYbHKio4//M4xBIWU0bg9jgfcoo1b0Gx3zTUfScea3RH////////j/////6huEM0ydj1nWzrgtgR8MM7g1AmhYF2q9N5b1G5qxk0wODIi0UWAfZJ4g3yTn+q1Q5KzlECQfkaxWsgj0I/RRb/2/v//9Vn//M4xBcaw0rBl0FoAHpf////sy1rrb///X//9kzydJBKkiipmY6O8Yom4cw0Lw+HguQW4KkIodoUAHsGwDYC1iJEUSQl5CFMcBNJIqCiC8hVRGw6AP4LeBlCxD0BcBVDFxaPvr/f9//9/t/L//M4xAsX2j8eX404AtuxjqjEzRIDwC51mFMl6MqmiWPEEbHnxoe62msPLMPPJsxnnBRvKtc+e6/LDrecjN+Y6DpnoPkzmXvmkjvb8z+hpR/FQ0fVKkELosVELRvtIqHf8qqbyaTMDIgnGhw1//M4xAoXiV7Yy494AId4yhnCcPiNF1KghyHyKgIIj2VKqcJqpPDrepyth2GrAcR63Fmhap8aeZtrEPE1J7TUjYiapaTTJjUCZuxLP8534sKLvX6+C4hRnyd0DLYhIa//DdW4SwYlwqtK1Zk1//M4xAoWEa64AZloABtJuengjtCaHvhxARYZEw5I8VtBIRvIKJJF4vLXxLjIzQLyKNFvpHx3Eqo7UmkZGX47RhB7ukbKMdnZt/cwmKNFmSQRnale8WIoQL1XARX18OEI5r/AaBcP1ehjqz4B//M4xBAXUuasAY84AAD8RB4wufax6mmJf3WY046i/zjS3OU//PQ0uPKg3dB48anHo0z5NmGhojnMTOHWGhxU1f/5U51m2tOpr+v//PtY2etxwtYLAVa3Fv/kFQpAY3wDgA//5BYdMtqpa7qi//M4xBEVET7Bt9iAAKTOTxnaPGEt9Kbeq7T3to8ZWvAPiGSMzEig4TiSjIqpKYpmyNlq9dSq+kg99n99MvhEXLFp27/U0OmrQK7fT6LGtJPVSABDsRjmAGH14mKnQlMUeVmib52Ev1vKSCGb//M4xBsU6MK5v1gYAMWnvrRa/zK6+rut4USRcWHkoCREFWw8SVVdAQdBo8HRLeCsc4JPLfaeI5aSK/4dEqVAwHyIVGvtUgAIKPKv/z/gAHxAkOJGEARIEghZOYmCTCxgEhs/SVqNzJ2S2uDz//M4xCYei86plZpoAGGcep4x54vonz6NvVVur6+YKXNqmQSPaS0UEqnQ7amo+j//Q01ejW3/6v+7et+gTDpTX//9PU03WmbvtQLhoMASZsSR0iCmE8GACQf//7f//xwgr9UCSgS2iC2oEfkI//M4xAoUC0LuX8EoAkdUf8b5/89Cd0///qqi5G///yodv50YXKLlExcABN0KYgoJoVxgmKkDpSOAwmKCwFDrGPRuzt6/00Zyr///1+jWOR0U0WKqEAls1wn0iBHCH/MIKAQktE4BU5EiRASW//M4xBgTIbrOXgmKlv/7y8scFEknl8///NZQ6KwiKiQecrf//5qVYxpQ64iCRKFDQVT88VBU7/1Q7/9raCJGRCTaAkYG01QNZFtww1LYo1EwKhNwSArlhI8Ej0OiURAIed1FQEPksJu8qIiS//M4xCoSsGIcFDBGQIqWW7wCAvkbSQiKjDp5YSDgdyxYe4986HQ0HdodEpUiSkxBTUUzLjk5LjWqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq"
      )));
    var Ra = { n: 1, cfop: 4, fp: 2, roux: 4, cf4op: 7, cf4o2p2: 9 },
      r = {
        n: [],
        cfop: ["cross", "F2L", "OLL", "PLL"],
        fp: ["F2L", "LL"],
        roux: ["1st block", "2nd block", "CMLL", "L6E"],
        cf4op: "cross;1st F2L;2nd F2L;3rd F2L;4th F2L;OLL;PLL".split(";"),
        cf4o2p2:
          "cross;1st F2L;2nd F2L;3rd F2L;4th F2L;EOLL;COLL;CPLL;EPLL".split(
            ";"
          ),
      },
      ab = (function () {
        function r(a, b) {
          a && void 0 == Za
            ? (requestAnimFrame(f), (Za = 1), (ib = 0))
            : a || void 0 == Za || (Za = void 0);
          Qa = b ? T : Ta;
        }
        function f(c) {
          if (0 != h && -1 != h && -4 != h && void 0 != Za) {
            c = $.now() - Ya;
            var r = Qa === T ? Ua : "";
            if (-3 == h || (-2 == h && a()))
              Ra(
                Qa,
                ("n" != n("timeU")
                  ? 17e3 < c
                    ? "DNF"
                    : 15e3 < c
                    ? "+2"
                    : 15 - ~~(c / 1e3)
                  : TIMER_INSPECT) + r
              );
            else {
              var w = Xa(c, !0);
              Ra(
                Qa,
                {
                  u: w,
                  c: w.replace(/([.>])(\d)\d+(<|$)/, "$1$2$3"),
                  s: w.split(".")[0],
                  n: TIMER_SOLVE,
                  i: TIMER_SOLVE,
                }[n("timeU")] + r
              );
            }
            if (-3 == h || -2 == h)
              Qa !== T &&
                (12e3 <= c
                  ? Ra(
                      T,
                      '<div style="font-family: Arial;">Go!!!&nbsp;&nbsp;</div>'
                    )
                  : 8e3 <= c &&
                    Ra(
                      T,
                      '<div style="font-family: Arial;">8s!&nbsp;&nbsp;</div>'
                    )),
                "n" != n("voiceIns") &&
                  ((r = Wa),
                  7900 <= c && 7900 > ib && (r = "1" == n("voiceIns") ? oa : d),
                  11900 <= c &&
                    11900 > ib &&
                    (r = "1" == n("voiceIns") ? Sa : b),
                  (r.volume = ~~n("voiceVol") / 100),
                  r.play());
            ib = c;
            requestAnimFrame(f);
          }
        }
        function w(a) {
          Ta.css("color", a);
          T.css("color", a);
        }
        function z(a, b) {
          Ra(b ? T : Ta, void 0 != a ? Xa(a, !0) : "--:--");
        }
        function Ra(a, b) {
          var d = a === T ? 1 : 0;
          $a[d] !== b && (($a[d] = b), a.html(b));
        }
        var Ta,
          T = $("<div />"),
          Qa,
          Za,
          Ua = "",
          $a = ["", ""],
          ib = 0;
        $(function () {
          Ta = $("#lcd");
          $("#multiphase").append(T);
        });
        return {
          setRunning: r,
          color: w,
          val: z,
          setEnable: function (a) {
            a ? Ta.show() : Ta.hide();
          },
          append: function (a) {
            Ra(T, T.html() + a);
          },
          setStaticAppend: function (a, b) {
            Ua = b ? Ua + a : a;
          },
          fixDisplay: function (b, d) {
            var f = !1;
            0 == h
              ? ab.color("red")
              : -1 == h || -4 == h
              ? w(b && d ? (a() ? "#0d0" : "#f00") : "")
              : -2 == h
              ? (w(b && d ? "#0d0" : ""), (f = a()))
              : (-3 == h ? w(b && d ? "#dd0" : "#f00") : w(b ? "#0d0" : ""),
                (f = !0));
            c.setAutoShow(0 == h || -1 == h);
            r(f);
          },
          getMulPhaseAppend: function (a, b) {
            for (var d = [], c = b; c > a; c--)
              d.push(Xa(Va[c] - ~~Va[c + 1], !0));
            return a == b || 1 == b
              ? ""
              : '<div style="font-size: 0.65em">=' + d.join("<br>+") + "</div>";
          },
          reset: function (a) {
            Ta.empty();
            T.empty();
            $a[0] = "";
            $a[1] = "";
            z(0, a);
            r(!1);
            Ua = "";
          },
        };
      })(),
      kb = (function () {
        function a(a, b) {
          d.html(b[0]).unbind("click");
          void 0 != b[2]
            ? d.addClass("click").click(function () {
                b[4](b[2][0], b[2][1], b[2][2], b[2][3]);
              })
            : d.removeClass("click");
          c.html(b[1]).unbind("click");
          void 0 != b[3]
            ? c.addClass("click").click(function () {
                b[4](b[3][0], b[3][1], b[3][2], b[3][3]);
              })
            : c.removeClass("click");
        }
        var b,
          d = $('<span class="click">'),
          c = $('<span class="click">'),
          r = !0;
        $(function () {
          b = $("#avgstr").append(d, "<br>", c);
          z("timer", "avg", a);
        });
        return {
          showAvgDiv: function (a) {
            a &&
            n("showAvg") &&
            -1 != $.inArray(n("input"), ["s", "m", "t", "i"])
              ? r || (b.show(), (r = !0))
              : r && (b.hide(), (r = !1));
          },
        };
      })(),
      ib = (function () {
        function b() {
          void 0 != z && (clearTimeout(z), (z = void 0));
        }
        function d() {
          if (-1 == h || -3 == h)
            -1 == h && ab.reset(),
              (h = -2),
              (z = void 0),
              ab.fixDisplay(!0, !0);
        }
        function r(a, b, d) {
          var c = Ra;
          255 < a
            ? (Ra = b ? Ra & ~(1 << a) : Ra | (1 << a))
            : d.ctrlKey || (Ra = 0);
          return 32 == a || (3 == c && 255 < a) || 3 == Ra;
        }
        var f = 0,
          w = 0,
          z = void 0,
          Ra = 0;
        return {
          onkeydown: function (Ra, Sa) {
            var oa = r(Ra, 0, Sa),
              Ta = $.now();
            if (!(200 > Ta - f)) {
              if (0 < h) {
                f = Ta;
                Va[h] = f - Ya;
                n("phases") != h && ab.append("+");
                1 != n("phases") &&
                  ab.append(Xa(Va[h] - ~~Va[h + 1], !0) + "&nbsp;<br>");
                if (27 == Ra) {
                  Ta = [-1];
                  for (var Wa = 1; h < Va.length; ) Ta[Wa++] = Va[h++];
                  h = 1;
                  Va = Ta;
                }
                0 == --h &&
                  ((w = f),
                  ab.val(Va[1]),
                  c.setAutoShow(!0),
                  Ua("time", Va),
                  32 != Ra && (h = -1));
              } else
                oa
                  ? h == (a() ? -3 : -1) && void 0 == z
                    ? (z = setTimeout(d, n("preTime")))
                    : -1 == h && a() && (h = -4)
                  : 27 == Ra &&
                    -1 >= h &&
                    (b(), (h = -1), ab.val(0), c.setAutoShow(!0));
              ab.fixDisplay(!0, oa);
              oa && kernel.clrKey();
            }
          },
          onkeyup: function (d, c) {
            a: {
              var f = r(d, 1, c);
              var z = $.now();
              if (f)
                if (0 == h) h = -1;
                else if (-1 == h || -3 == h) {
                  if ((b(), 500 > z - w)) {
                    ab.fixDisplay(!1, f);
                    f = void 0;
                    break a;
                  }
                } else if (-2 == h) {
                  h = n("phases");
                  var Ra = a() ? z - Ya : 0;
                  Va = [17e3 < Ra ? -1 : 15e3 < Ra ? 2e3 : 0];
                  Ya = z;
                  ab.reset();
                } else -4 == h && ((h = -3), ab.reset(), (Ya = z));
              ab.fixDisplay(!1, f);
              f && kernel.clrKey();
              f = void 0;
            }
            return f;
          },
          reset: function () {
            void 0 != z && (clearTimeout(z), (z = void 0));
            f = w = 0;
          },
        };
      })(),
      bb = (function () {
        var a = $('<textarea id="inputTimer" rows="1" />'),
          b = 0;
        $(function () {
          $("#lcd").after(a);
        });
        return {
          setEnable: function (b) {
            b ? a.show() : a.hide();
            b
              ? ((jb = a),
                a[0].select(),
                a.unbind("click").click(function () {
                  a[0].select();
                }))
              : (jb = void 0);
          },
          parseInput: function () {
            var d =
                /^(?:[\d]+\. )?\(?(DNF)?\(?(\d*?):?(\d*?):?(\d*\.?\d*?)(\+)?\)?(?:=([\d:.+]+?))?(?:\[([^\]]+)\])?\)?\s*(?:   ([^@].*?))?(?:   @(.*?))?$/,
              c = /^(\d*?):?(\d*?):?(\d*\.?\d*?)$/,
              r = a.val(),
              f = $.now();
            if (/^[\s\n]*$/.exec(r) && f > b + 500)
              kernel.pushSignal("ctrl", ["scramble", "next"]), (b = f);
            else
              for (r = r.split(/\s*[,\n]\s*/), f = 0; f < r.length; f++) {
                var h = d.exec(r[f]);
                if (null != h && "" != h[4]) {
                  var n = Math.round(
                    36e5 * Math.floor(h[2]) +
                      6e4 * Math.floor(h[3]) +
                      1e3 * parseFloat(h[4])
                  );
                  if (0 != n) {
                    if ("" == h[2] && "" == h[3] && /^\d+$/.exec(h[4])) {
                      var w = kernel.getProp("intUN") || 20100;
                      n = Math.floor(n / (w % 1e4));
                      var z = Math.floor(n / 1e7);
                      var Ra = Math.floor(n / 1e5) % 100;
                      var Sa = n % 1e5;
                      2e4 < w
                        ? (n = 6e4 * (60 * z + Ra) + Sa)
                        : 1e4 < w && (n = 6e4 * (100 * z + Ra) + Sa);
                    }
                    "DNF" == h[1]
                      ? (w = -1)
                      : "+" == h[5] && 2e3 < n
                      ? ((w = 2e3), (n -= 2e3))
                      : (w = 0);
                    z = [];
                    if (h[6]) {
                      z = h[6].split("+").reverse();
                      Ra = n;
                      for (Sa = 0; Sa < z.length; Sa++) {
                        var oa = c.exec(z[Sa]);
                        if (null == oa) {
                          Ra = 1e8;
                          break;
                        }
                        Ra -= Math.round(
                          36e5 * Math.floor(oa[1]) +
                            6e4 * Math.floor(oa[2]) +
                            1e3 * parseFloat(oa[3])
                        );
                        z[Sa] = Math.max(0, Ra);
                      }
                      Math.abs(Ra) > 10 * z.length ? (z = []) : z.pop();
                    }
                    Ra = h[7] || "";
                    Sa = h[8];
                    Va = [Ra, Sa, [w, n].concat(z)];
                    (n = mathlib.str2time(h[9])) && Va.push(n);
                    Ua("time", Va);
                    kernel.clrKey();
                  }
                }
              }
            a.val("");
          },
          clear: function () {
            a.val("");
          },
        };
      })(),
      lb = (function () {
        function b(b) {
          if (d) {
            var n = $.now();
            if (b.on) {
              var w = b.time_milli;
              if (b.running) {
                if (-3 == h || -4 == h) (f = n - Ya - w), ab.reset();
                h = 1;
                Ya = n - w;
                c.setAutoShow(!1);
              } else
                -1 == h && a() && 0 == w && (b.rightHand || b.leftHand)
                  ? ((h = -3), c.setAutoShow(!1), (Ya = n))
                  : -3 != h &&
                    -4 != h &&
                    ((h = -1), ab.val(w), c.setAutoShow(!0));
              r.running &&
                !b.running &&
                0 != b.time_milli &&
                ((f = a() ? (17e3 < f ? -1 : 15e3 < f ? 2e3 : 0) : 0),
                Ua("time", [f, ~~w]));
              b.greenLight
                ? ab.color("#0d0")
                : b.rightHand && b.leftHand
                ? ab.color("#f00")
                : -4 == h
                ? ab.color("#0d0")
                : ab.color("");
              ab.setRunning(-3 == h || (b.running && 67 != b.signalHeader));
            } else
              (h = -1),
                ab.val(),
                ab.setRunning(!1),
                ab.color(""),
                c.setAutoShow(!0);
            r = b;
          }
        }
        var d = !1,
          r = {},
          f;
        return {
          setEnable: function (a) {
            (d = "s" == a || "m" == a)
              ? (stackmatutil.setCallBack(b),
                stackmatutil.init(a, !1).then($.noop, function () {
                  kernel.showDialog(
                    [
                      $("<div>Press OK To Connect To Stackmat</div>"),
                      function () {
                        stackmatutil.init(a, !0).then($.noop, console.log);
                      },
                      0,
                      0,
                    ],
                    "share",
                    "Stackmat Connect"
                  );
                }))
              : stackmatutil.stop();
          },
          onkeyup: function (a) {
            var b = $.now();
            32 == a &&
              -4 == h &&
              ((h = -3), ab.reset(), (Ya = b), ab.fixDisplay(!1, 32 == a));
            32 == a && kernel.clrKey();
          },
          onkeydown: function (b) {
            var d = $.now();
            32 == b && -1 == h && a() && r.on && 0 == r.time_milli
              ? ((h = -4), (Ya = d), ab.fixDisplay(!0, !0))
              : 27 == b &&
                -1 >= h &&
                ((h = -1), ab.val(0), ab.fixDisplay(!0, !1));
            32 == b && kernel.clrKey();
          },
        };
      })(),
      hb = (function () {
        function b(b, f) {
          if (1 != f) {
            var w = $.now();
            if (-3 == h || -2 == h) {
              if (
                T.isInspectionLegalMove(T, b) &&
                !/^(333ni|444bld|555bld)$/.exec(kb)
              ) {
                0 == f && Ta[0].push([T.move2str(b), 0]);
                return;
              }
              Za = a() ? w - Ya : 0;
              Ya = w;
              Qa = 0;
              h = 3 == bb && "r3" != kb ? Ra[n("vrcMP", "n")] : 1;
              var z = Ta[0];
              Ta = [];
              for (var Sa = 0; Sa < h; Sa++) Ta[Sa] = [];
              Ta[h] = z;
              Xa = h;
              Va = [17e3 < Za ? -1 : 15e3 < Za ? 2e3 : 0];
              ab.setRunning(!0, !0);
              c.setAutoShow(!1);
            }
            if (1 <= h) {
              /^(333ni|444bld|555bld)$/.exec(kb) &&
                !T.isInspectionLegalMove(T, b) &&
                T.toggleColorVisible(T, 0 == T.isSolved(T, n("vrcMP", "n")));
              0 == f && Ta[h - 1].push([T.move2str(b), w - Ya]);
              if (2 == f) {
                var oa = T.isSolved(T, n("vrcMP", "n"));
                if (oa < h) for (Sa = h; Sa > oa; Sa--) Va[Sa] = w - Ya;
                h = Math.min(oa, h) || 1;
                1 < Xa && ab.setStaticAppend(ab.getMulPhaseAppend(h, Xa));
              }
              0 == oa &&
                2 == f &&
                ((Qa += T.moveCnt()),
                kb.match(/^r\d+$/) && 0 != ib.length
                  ? ("r3" != kb && bb++, d(!0), r())
                  : (c.setAutoShow(!0),
                    (h = -1),
                    ab.setRunning(!1),
                    ab.setStaticAppend(""),
                    ab.val(Va[1], !0),
                    ab.append(ab.getMulPhaseAppend(0, Xa)),
                    ab.append(
                      '<div style="font-family: Arial; font-size: 0.5em">' +
                        Qa +
                        " moves<br>" +
                        ~~((1e5 * Qa) / Va[1]) / 100 +
                        " tps</div>"
                    ),
                    Ta.reverse(),
                    Ua("time", [
                      "",
                      0,
                      Va,
                      0,
                      [$.map(Ta, cubeutil.moveSeq2str).join(" ")],
                    ])));
            }
          }
        }
        function d(a) {
          if (void 0 != Wa && !lb && gb) {
            lb = !0;
            var b = bb;
            b || (b = 3);
            12 == bb
              ? Wa.initializeTwisty({
                  type: "skewb",
                  faceColors: f(kernel.getProp("colskb"), [0, 5, 4, 2, 1, 3]),
                  scale: 0.9,
                })
              : 13 == bb
              ? Wa.initializeTwisty({
                  type: "mgm",
                  faceColors: f(
                    kernel.getProp("colmgm"),
                    [0, 2, 1, 5, 4, 3, 11, 9, 8, 7, 6, 10]
                  ),
                  scale: 0.9,
                })
              : 14 == bb
              ? Wa.initializeTwisty({
                  type: "pyr",
                  faceColors: f(kernel.getProp("colpyr"), [3, 1, 2, 0]),
                  scale: 0.9,
                })
              : 1 == bb
              ? Wa.initializeTwisty({
                  type: "sq1",
                  faceColors: f(kernel.getProp("colsq1"), [0, 5, 4, 2, 1, 3]),
                  scale: 0.9,
                })
              : Wa.initializeTwisty({
                  type: "cube",
                  faceColors: f(kernel.getProp("colcube"), [3, 4, 5, 0, 1, 2]),
                  dimension: b,
                  stickerWidth: 1.7,
                  scale: 0.9,
                });
            T = Wa.getTwisty();
            a ||
              (ab.setRunning(!1, !0),
              ab.setStaticAppend(""),
              oa(n("timerSize")));
          }
        }
        function r() {
          d();
          var a = ib;
          kb.match(/^r\d+$/) &&
            ((a = ib.shift().match(/\d+\) (.*)$/)[1]),
            ab.setStaticAppend("<br>" + (ib.length + 1) + "/" + ib.len));
          a = T.parseScramble(a);
          lb = !1;
          Wa.applyMoves(a);
          T.moveCnt(!0);
          Ta = [[]];
        }
        function w() {
          void 0 == Wa &&
            (void 0 != window.twistyjs
              ? ((Wa = new twistyjs.TwistyScene()),
                Wa.addMoveListener(b),
                hb.empty().append(Wa.getDomElement()),
                d(),
                Wa.resize(),
                ($a = !1))
              : !$a && document.createElement("canvas").getContext
              ? ($.getScript("js/twisty.js", w), ($a = !0))
              : (hb.css("height", ""), hb.html("--:--")));
        }
        function Sa(a, b) {
          if ("scramble" == a) {
            kb = b[0];
            ib = b[1];
            var c = tools.puzzleType(kb);
            c = jb.indexOf(c);
            -1 != c && bb != c && ((bb = c), (lb = !1), d());
            if ((c = b[0].match(/^r(\d)\d*$/)))
              (ib = ib.split("\n")),
                (ib.len = ib.length),
                bb != ~~c[1] && ((bb = ~~c[1]), (lb = !1), d());
          }
        }
        function oa(a) {
          hb.css("height", (a * $("#logo").width()) / 9 + "px");
          Wa && Wa.resize();
        }
        var Wa,
          T,
          Za = 0,
          Qa = 0,
          Xa = 1,
          $a = !1,
          ib,
          kb,
          bb,
          jb =
            " sq1 222 333 444 555 666 777 888 999 101010 111111 skb mgm pyr".split(
              " "
            ),
          lb = !1,
          hb = $("<div />"),
          gb = !1;
        $(function () {
          z("timer", "scramble", Sa);
          hb.appendTo("#container");
        });
        return {
          onkeydown: function (b) {
            if (void 0 != Wa) {
              var f = $.now();
              if (-1 == h)
                32 == b &&
                  (r(),
                  a()
                    ? ((h = -3), (Ya = f), ab.setRunning(!0, !0))
                    : (ab.setRunning(!1, !0), ab.val(0, !0), (h = -2)),
                  c.setAutoShow(!1));
              else if (-3 == h || -2 == h || 1 <= h)
                27 == b
                  ? (c.setAutoShow(!0),
                    1 <= h &&
                      Ua("time", [
                        "",
                        0,
                        [-1, f - Ya],
                        0,
                        [$.map(Ta, cubeutil.moveSeq2str).join(" ")],
                      ]),
                    d(),
                    (h = -1))
                  : Wa.keydown({ keyCode: b });
              (27 != b && 32 != b) || kernel.clrKey();
            }
          },
          setEnable: function (a) {
            (gb = a) ? hb.show() : hb.hide();
            a && w();
          },
          setSize: oa,
          reset: d,
        };
      })(),
      gb = (function () {
        function b() {
          Wa && (clearTimeout(Wa), (Wa = 0));
          T && (clearTimeout(T), (T = 0));
        }
        function d(d, f, z) {
          $a = d;
          if (Sa) {
            oa && ib.setState(d, f, !1);
            b();
            if (-1 == h) {
              if (d != mathlib.SOLVED_FACELET) {
                var Qa = n("giiSD");
                "s" == Qa
                  ? giikerutil.checkScramble() && w(z)
                  : "n" != Qa &&
                    (Wa = setTimeout(function () {
                      w(z);
                    }, 1e3 * ~~Qa));
                Qa = n("giiSM");
                "n" != Qa &&
                  {
                    x4: /^([URFDLB][ '])\1\1\1$/,
                    xi2: /^([URFDLB])( \1'\1 \1'|'\1 \1'\1 )$/,
                  }[Qa].exec(f.join("")) &&
                  (T = setTimeout(function () {
                    w(z);
                  }, 1e3));
              }
            } else if (-3 == h || -2 == h) {
              Za = a() ? z - Ya : 0;
              Ya = z;
              h = Ra[n("vrcMP", "n")];
              Ta = [];
              for (Qa = 0; Qa < h; Qa++) Ta[Qa] = [];
              Xa = h;
              Va = [17e3 < Za ? -1 : 15e3 < Za ? 2e3 : 0];
              ab.fixDisplay(!1, !0);
              ab.setRunning(!0, oa);
              c.setAutoShow(!1);
            }
            if (1 <= h) {
              Ta[h - 1].push([f[0], z - Ya]);
              f = cubeutil.getProgress(d, kernel.getProp("vrcMP", "n"));
              if (f < h) for (Qa = h; Qa > f; Qa--) Va[Qa] = z - Ya;
              h = Math.min(f, h) || 1;
              ab.setStaticAppend(ab.getMulPhaseAppend(h, Xa));
              if (d == mathlib.SOLVED_FACELET) {
                Ta.reverse();
                d = cubeutil.getPrettyMoves(Ta);
                f = "";
                var cb = r[kernel.getProp("vrcMP", "n")],
                  eb = 0;
                for (Qa = 0; Qa < d.length; Qa++)
                  (eb += d[Qa][1]),
                    (f +=
                      d[Qa][0] +
                      (cb[Qa]
                        ? " //" + cb[Qa] + " " + d[Qa][1] + " move(s)%0A"
                        : ""));
                giikerutil.setLastSolve(f);
                h = -1;
                Va[1] = z - Ya;
                c.setAutoShow(!0);
                ab.setRunning(!1, oa);
                ab.setStaticAppend("");
                ab.fixDisplay(!1, !0);
                ab.val(Va[1], oa);
                ab.append(ab.getMulPhaseAppend(0, Xa));
                ab.append(
                  '<div style="font-family: Arial; font-size: 0.5em">' +
                    eb +
                    " moves<br>" +
                    ~~((1e5 * eb) / Va[1]) / 100 +
                    " tps</div>"
                );
                if (0 != Va[1]) {
                  f = [$.map(Ta, cubeutil.moveSeq2str).join(" ")];
                  f[d.length] = d[0][1];
                  for (Qa = 1; Qa < d.length; Qa++)
                    f[d.length - Qa] = f[d.length - Qa + 1] + d[Qa][1];
                  Ua("time", ["", 0, Va, 0, f]);
                }
              }
            }
          }
        }
        function w(d) {
          b();
          -1 == h &&
            (giikerutil.markScrambled(),
            giikerutil.checkScramble() ||
              Ua("scramble", ["333", scramble_333.genFacelet($a)]),
            (h = -2),
            (Ya = d),
            ab.fixDisplay(!0, !0),
            a() && ab.setRunning(!0, oa),
            c.setAutoShow(!1),
            n("giiBS") && metronome.playTick());
        }
        function z(a) {
          (oa = a) ? Qa.show() : Qa.hide();
          a && ib.initVRC();
        }
        var Sa = !1,
          oa = !1,
          Wa = 0,
          T = 0,
          Za = 0,
          Qa = $("<div />"),
          Xa = 1,
          $a = mathlib.SOLVED_FACELET,
          ib = (function () {
            function a(a) {
              void 0 != c &&
                !h &&
                oa &&
                ((h = !0),
                c.initializeTwisty({
                  type: "cube",
                  faceColors: f(kernel.getProp("colcube"), [3, 4, 5, 0, 1, 2]),
                  dimension: 3,
                  stickerWidth: 1.7,
                  scale: 0.9,
                }),
                z.fromFacelet(mathlib.SOLVED_FACELET),
                (r = c.getTwisty()),
                a || b(n("timerSize")));
            }
            function b(a) {
              Qa.css("height", (a * $("#logo").width()) / 9 + "px");
              c && c.resize();
            }
            function d() {
              void 0 == c &&
                (void 0 != window.twistyjs
                  ? ((c = new twistyjs.TwistyScene()),
                    Qa.empty().append(c.getDomElement()),
                    a(),
                    c.resize(),
                    (w = !1))
                  : !w && document.createElement("canvas").getContext
                  ? ($.getScript("js/twisty.js", d), (w = !0))
                  : (Qa.css("height", ""), Qa.html("--:--")));
            }
            var c,
              r,
              h = !1,
              w = !1,
              z = new mathlib.CubieCube(),
              Ra = new mathlib.CubieCube(),
              Sa = new mathlib.CubieCube();
            return {
              resetVRC: a,
              initVRC: d,
              setState: function (b, d, f) {
                Ra.fromFacelet(b);
                f = [];
                for (var n = !0, w = 0; w < d.length; w++) {
                  f.push(d[w]);
                  var oa =
                    3 * "URFDLB".indexOf(d[w][0]) + "'2 ".indexOf(d[w][1]);
                  if (
                    0 <= oa &&
                    18 > oa &&
                    (mathlib.CubieCube.EdgeMult(
                      Ra,
                      mathlib.CubieCube.moveCube[oa],
                      Sa
                    ),
                    mathlib.CubieCube.CornMult(
                      Ra,
                      mathlib.CubieCube.moveCube[oa],
                      Sa
                    ),
                    (oa = Ra),
                    (Ra = Sa),
                    (Sa = oa),
                    Ra.isEqual(z))
                  ) {
                    n = !1;
                    break;
                  }
                }
                n
                  ? (a(!1),
                    z.fromFacelet(mathlib.SOLVED_FACELET),
                    (f = scramble_333.genFacelet(b)))
                  : (f = f.reverse().join(" "));
                d = f.match(/^\s*$/) ? [] : r.parseScramble(f);
                5 > d.length ? c.addMoves(d) : c.applyMoves(d);
                h = !1;
                z.fromFacelet(b);
              },
              setSize: b,
            };
          })();
        $(function () {
          Qa.appendTo("#container");
        });
        return {
          setEnable: function (a) {
            (Sa = "g" == a)
              ? (giikerutil.setCallBack(d),
                (a = giikerutil.init()) &&
                  a.then($.noop, function (a) {
                    a.code == a.SECURITY_ERR &&
                      kernel.showDialog(
                        [
                          $("<div>Press OK To Connect To Giiker Cube</div>"),
                          function () {
                            giikerutil.init().then($.noop, console.log);
                          },
                          0,
                          0,
                        ],
                        "share",
                        "Giiker Connect"
                      );
                  }))
              : GiikerCube.stop();
            z(Sa && n("giiVRC"));
          },
          onkeydown: function (a) {
            27 == a
              ? (b(),
                (h = -1),
                c.setAutoShow(!0),
                ab.val(0, oa),
                ab.setRunning(!1, oa),
                ab.fixDisplay(!1, !0))
              : 32 == a &&
                n("giiSK") &&
                $a != mathlib.SOLVED_FACELET &&
                -1 == h &&
                w($.now());
          },
          setVRC: z,
          setSize: ib.setSize,
        };
      })(),
      $a = "input phases preScr useMilli smallADP giiVRC".split(" ");
    $(function () {
      T = $("#container");
      z(
        "timer",
        "property",
        function (a, b) {
          "timerSize" == b[0] &&
            (T.css("font-size", b[1] + "em"),
            hb.setSize(b[1]),
            gb.setSize(b[1]));
          ("timerSize" != b[0] && "phases" != b[0]) ||
            $("#multiphase").css(
              "font-size",
              n("timerSize") / Math.max(n("phases"), 4) + "em"
            );
          "input" == b[0] && (lb.setEnable(b[1]), gb.setEnable(b[1]));
          "showAvg" == b[0] && kb.showAvgDiv(b[1]);
          "giiVRC" == b[0] && "set" != b[2] && gb.setEnable(n("input"));
          if (-1 != $.inArray(b[0], $a)) {
            var d = n("input");
            h = -1;
            hb.setEnable("v" == d);
            hb.reset();
            ab.setEnable("i" != d);
            ab.reset("v" == d || ("g" == d && n("giiVRC")));
            ib.reset();
            bb.setEnable("i" == d);
            c.setAutoShow(!0);
          }
        },
        /^(?:input|phases|scrType|preScr|timerSize|showAvg|useMilli|smallADP|giiVRC)$/
      );
      Qa(
        "vrc",
        "vrcSpeed",
        1,
        PROPERTY_VRCSPEED,
        [100, [0, 50, 100, 200, 500, 1e3], "âˆž 20 10 5 2 1".split(" ")],
        1
      );
      Qa(
        "vrc",
        "vrcMP",
        1,
        PROPERTY_VRCMP,
        [
          "n",
          "n cfop fp cf4op cf4o2p2 roux".split(" "),
          PROPERTY_VRCMPS.split("|"),
        ],
        1
      );
      Qa("vrc", "giiVRC", 0, PROPERTY_GIIKERVRC, [!0], 1);
      Qa(
        "vrc",
        "giiSD",
        1,
        PROPERTY_GIISOK_DELAY,
        ["s", "2345ns".split(""), PROPERTY_GIISOK_DELAYS.split("|")],
        1
      );
      Qa("vrc", "giiSK", 0, PROPERTY_GIISOK_KEY, [!0], 1);
      Qa(
        "vrc",
        "giiSM",
        1,
        PROPERTY_GIISOK_MOVE,
        ["n", ["x4", "xi2", "n"], PROPERTY_GIISOK_MOVES.split("|")],
        1
      );
      Qa("vrc", "giiBS", 0, PROPERTY_GIISBEEP, [!0], 1);
      Qa("vrc", "giiRST", 1, PROPERTY_GIIRST, [
        "p",
        ["a", "p", "n"],
        PROPERTY_GIIRSTS.split("|"),
      ]);
      Qa("vrc", "giiAED", 0, PROPERTY_GIIAED, [!1]);
      Qa("timer", "useMouse", 0, PROPERTY_USEMOUSE, [!1], 1);
      Qa(
        "timer",
        "useIns",
        1,
        PROPERTY_USEINS,
        ["n", ["a", "b", "n"], PROPERTY_USEINS_STR.split("|")],
        1
      );
      Qa(
        "timer",
        "voiceIns",
        1,
        PROPERTY_VOICEINS,
        ["1", ["n", "1", "2"], PROPERTY_VOICEINS_STR.split("|")],
        1
      );
      Qa("timer", "voiceVol", 2, PROPERTY_VOICEVOL, [100, 1, 100], 1);
      Qa(
        "timer",
        "input",
        1,
        PROPERTY_ENTERING,
        ["t", "tismvg".split(""), PROPERTY_ENTERING_STR.split("|")],
        1
      );
      Qa(
        "timer",
        "intUN",
        1,
        PROPERTY_INTUNIT,
        [
          20100,
          [1, 100, 1e3, 10001, 10100, 11e3, 20001, 20100, 21e3],
          "X X.XX X.XXX X:XX X:XX.XX X:XX.XXX X:XX:XX X:XX:XX.XX X:XX:XX.XXX".split(
            " "
          ),
        ],
        1
      );
      Qa(
        "timer",
        "timeU",
        1,
        PROPERTY_TIMEU,
        ["c", ["u", "c", "s", "i", "n"], PROPERTY_TIMEU_STR.split("|")],
        1
      );
      Qa(
        "timer",
        "preTime",
        1,
        PROPERTY_PRETIME,
        [300, [0, 300, 550, 1e3], ["0", "0.3", "0.55", "1"]],
        1
      );
      Qa("timer", "phases", 2, PROPERTY_PHASES, [1, 1, 10], 3);
      Qa("kernel", "showAvg", 0, SHOW_AVG_LABEL, [!0], 1);
      Qa("ui", "timerSize", 2, PROPERTY_TIMERSIZE, [20, 1, 100], 1);
      Qa("ui", "smallADP", 0, PROPERTY_SMALLADP, [!0], 1);
    });
    var jb;
    return {
      onkeydown: function (a) {
        if (!c.isPop()) {
          var b = w(a),
            d = $(document.activeElement);
          if (d.is("input, textarea, select"))
            "i" == n("input") &&
              "inputTimer" == d.prop("id") &&
              13 == b &&
              bb.parseInput();
          else
            switch ((d.blur(), n("input"))) {
              case "t":
                ib.onkeydown(b, a);
                break;
              case "s":
                lb.onkeydown(b, a);
              case "i":
                break;
              case "v":
                hb.onkeydown(b, a);
                break;
              case "g":
                gb.onkeydown(b, a);
            }
        }
      },
      onkeyup: function (a) {
        if (!c.isPop()) {
          var b = w(a),
            d = $(document.activeElement);
          if (d.is("input, textarea, select"))
            "i" == n("input") &&
              "inputTimer" == d.prop("id") &&
              13 == b &&
              bb.clear();
          else
            switch ((d.blur(), n("input"))) {
              case "t":
                ib.onkeyup(b, a);
                break;
              case "s":
                lb.onkeyup(b, a);
            }
        }
      },
      showAvgDiv: kb.showAvgDiv,
      refocus: function () {
        void 0 != jb
          ? jb.focus()
          : document.activeElement &&
            document.activeElement.blur &&
            document.activeElement.blur();
      },
      getCurTime: function (a) {
        return 0 < h ? (a || $.now()) - Ya : 0;
      },
    };
  },
  [
    kernel.regListener,
    kernel.regProp,
    kernel.getProp,
    kernel.pretty,
    kernel.ui,
    kernel.pushSignal,
  ]
);
var scrMgr = (function (z, Qa) {
    function n(a, c, n) {
      a = a || [[""]];
      c = c || [""];
      n = n || 0;
      for (var f = 0, w = -1, T = [], Ta, Wa, oa = 0; oa < n; oa++) {
        do
          (Ta = z(a.length)),
            (Wa = z(a[Ta].length)),
            Ta != w && ((f = 0), (w = Ta));
        while (0 != ((f >> Wa) & 1));
        f |= 1 << Wa;
        a[Ta][Wa].constructor == Array
          ? T.push(Qa(a[Ta][Wa]) + Qa(c))
          : T.push(a[Ta][Wa] + Qa(c));
      }
      return T.join(" ");
    }
    function Xa(f, n, z) {
      DEBUG && console.log("[regscr]", f);
      if ($.isArray(f)) for (z = 0; z < f.length; z++) c[f[z]] = n;
      else (c[f] = n), void 0 != z && ((Ua[f] = z[0]), (a[f] = z[1]));
      return Xa;
    }
    var c = {
        blank: function () {
          return "N/A";
        },
      },
      Ua = {},
      a = {};
    return {
      reg: Xa,
      scramblers: c,
      filters: Ua,
      probs: a,
      mega: n,
      formatScramble: function (a) {
        return a.replace(/[$#]\{([^\}]+)\}/g, function (a, f) {
          if ("$" == a[0]) {
            var h = [f];
            "[" == f[0] && (h = JSON.parse(f));
            return c[h[0]].apply(this, h);
          }
          return "#" == a[0] ? n.apply(this, JSON.parse("[" + f + "]")) : "";
        });
      },
      rndState: function (a, c) {
        if (void 0 != c) {
          var f = c.slice();
          void 0 == a && (a = f);
          for (var h = 0; h < a.length; h++) a[h] || (f[h] = 0);
          return mathlib.rndProb(f);
        }
      },
      fixCase: function (a, c) {
        return void 0 == a ? mathlib.rndProb(c) : a;
      },
    };
  })(mathlib.rn, mathlib.rndEl),
  scramble = execMain(
    function (z, Qa) {
      function n() {
        kernel.blur();
        jb.html("Scrambling...");
        fb = !eb || /^(remote|input$)/.exec(eb) ? fb : eb;
        xb || ((pb = eb), (zb = Za));
        xb = !1;
        zb && Ab.addClass("click").unbind("click").click(Xa);
        eb = kb.getSelected();
        vb = ~~$a.val();
        pb != eb && kernel.setProp("scrType", eb);
        Za = "";
        requestAnimFrame(f);
      }
      function Xa() {
        xb = !0;
        jb.html(a(pb, zb, !0));
        Ab.removeClass("click").unbind("click");
        void 0 != zb && kernel.pushSignal("scrambleX", a(pb, zb));
      }
      function c() {
        xb
          ? ((xb = !1),
            jb.html(a(eb, Za, !0)),
            Ab.addClass("click").unbind("click").click(Xa),
            kernel.pushSignal("scrambleX", a(eb, Za)))
          : n();
      }
      function Ua() {
        if (Za) {
          var a = kernel.getProp("scrClk", "n");
          "c" == a
            ? $.clipboardCopy(jb.text()) && logohint.push("scramble copied")
            : "+" == a && c();
        }
      }
      function a(a, b, d) {
        b = b || "";
        var c = /^\$T([a-zA-Z0-9]+)\$\s*(.*)$/.exec(b);
        c && ((a = c[1]), (b = c[2]));
        return d
          ? ((a = kernel.getProp("scrASize")
              ? Math.max(
                  0.25,
                  Math.round(20 * Math.pow(50 / Math.max(b.length, 10), 0.3)) /
                    20
                )
              : 1),
            jb.css("font-size", a + "em"),
            DEBUG && console.log("[scrFontSize]", a),
            b
              .replace(/~/g, "&nbsp;")
              .replace(/\\n/g, "\n")
              .replace(
                /`([^']*)`/g,
                kernel.getProp("scrKeyM", !1) ? "<u>$1</u>" : "$1"
              ))
          : [
              a,
              b
                .replace(/~/g, "")
                .replace(/\\n/g, "\n")
                .replace(/`([^']*)`/g, "$1"),
            ];
      }
      function f() {
        h();
        Za
          ? ((Za = Za.replace(/(\s*)$/, "")),
            jb.html(a(eb, Za, !0)),
            kernel.pushSignal("scramble", a(eb, Za)))
          : jb.html("Scrambling... ");
      }
      function w(a, b, d) {
        rb &&
          (csTimerWorker && csTimerWorker.getScramble
            ? (nb =
                nb ||
                csTimerWorker.getScramble(
                  a,
                  function (a, b) {
                    DEBUG &&
                      console.log("[scrcache]", a + " cached by csTimerWorker");
                    T(a, b);
                  }.bind(void 0, b)
                ))
            : d ||
              (nb =
                nb ||
                setTimeout(
                  function (a, b) {
                    var d = Sa[b[0]];
                    T(a, d.apply(d, b));
                  }.bind(void 0, b, a),
                  500
                )));
      }
      function T(a, b) {
        var d = JSON.parse(localStorage.cachedScr || null) || {};
        $.isArray(d) && (d = {});
        d[a] = b;
        localStorage.cachedScr = JSON.stringify(d);
        nb = 0;
      }
      function h() {
        if (eb) {
          Za = "";
          var a = qb[eb] || eb;
          if ("input" == a) Za = tb.next();
          else if ((tb.clear(), a.startsWith("remote"))) Za = wb.next(a);
          else if ((wb.clear(), a in Sa)) {
            var d = JSON.parse(localStorage.cachedScr || null) || {},
              c = JSON.stringify([a, vb, mb[1]]);
            rb && c in d
              ? ((Za = d[c]),
                delete d[c],
                (localStorage.cachedScr = JSON.stringify(d)))
              : (Za = Sa[a](a, vb, Bb(mb[1], b[a])));
            w([a, vb, Bb(mb[1], b[a])], c);
          } else requestAnimFrame(f);
        }
      }
      function Va() {
        kernel.blur();
        var a = kb.getSelIdx();
        a = scrdata[a[0]][1][a[1]][2];
        $a.val(Math.abs(a));
        $a[0].disabled = 0 >= a;
        a = kb.getSelected();
        mb = JSON.parse(kernel.getProp("scrFlt", JSON.stringify([a, d[a]])));
        ib[0].disabled = $a[0].disabled && !(a in d);
        mb[0] != a &&
          ((mb = [a, d[a] && mathlib.valuedArray(d[a].length, 1)]),
          kernel.setProp("scrFlt", JSON.stringify(mb), "session"));
      }
      function Ya() {
        Va();
        n();
      }
      function Ta() {
        function a() {
          if (eb in d) {
            for (
              var a = mathlib.valuedArray(d[eb].length, 1), c = !1, f = 0;
              f < b.length;
              f++
            )
              b[f][0].checked ? (c = !0) : (a[f] = 0);
            c
              ? ((mb = [eb, a]),
                (a = JSON.stringify(mb)),
                kernel.getProp("scrFlt") != a &&
                  ((r = !0), kernel.setProp("scrFlt", a)))
              : alert("Should Select At Least One Case");
            r && n();
          }
        }
        lb.empty();
        var b = [],
          c = [],
          r = !1;
        if (eb in d) {
          var f = d[eb],
            h = f;
          mb[0] == eb && (h = mb[1] || f);
          lb.append("<br>", hb, gb, "<br><br>");
          for (var w = {}, z = 0; z < f.length; z++) {
            var Ra = f[z].indexOf("-");
            -1 == Ra
              ? (w[f[z]] = [z])
              : ((Ra = f[z].slice(0, Ra)),
                (w[Ra] = w[Ra] || []),
                w[Ra].push(z));
          }
          for (z = 0; z < f.length; z++)
            (Ra = $('<input type="checkbox">').val(z)),
              h[z] && (Ra[0].checked = !0),
              b.push(Ra),
              c.push($("<label>").append(Ra, f[z]));
          var Sa = function (a) {
              var d = 0;
              $.each(w[a], function (a, c) {
                d += b[c][0].checked ? 1 : 0;
              });
              return d + "/" + w[a].length;
            },
            oa;
          for (oa in w) 1 == w[oa].length && lb.append(c[w[oa][0]]);
          for (oa in w)
            1 != w[oa].length &&
              lb.append(
                $("<div>")
                  .attr("data", oa)
                  .append(
                    $("<span>").html(oa + " " + Sa(oa)),
                    " | ",
                    $('<span class="click">')
                      .html("All")
                      .click(function () {
                        var a = $(this).parent().attr("data");
                        $.each(w[a], function (a, d) {
                          b[d][0].checked = !0;
                        });
                        $(this)
                          .parent()
                          .children()
                          .first()
                          .html(a + " " + Sa(a));
                      }),
                    " | ",
                    $('<span class="click">')
                      .html("None")
                      .click(function () {
                        var a = $(this).parent().attr("data");
                        $.each(w[a], function (a, d) {
                          b[d][0].checked = !1;
                        });
                        $(this)
                          .parent()
                          .children()
                          .first()
                          .html(a + " " + Sa(a));
                      }),
                    " | ",
                    $('<span class="click">[+]</span>').click(function () {
                      $(this).next().toggle();
                    }),
                    $("<div>")
                      .append(
                        $.map(w[oa], function (a) {
                          b[a].change(function () {
                            var a = $(this)
                              .parent()
                              .parent()
                              .parent()
                              .attr("data");
                            $(this)
                              .parent()
                              .parent()
                              .parent()
                              .children()
                              .first()
                              .html(a + " " + Sa(a));
                          });
                          return c[a];
                        })
                      )
                      .hide()
                  )
              );
          hb.unbind("click").click(function () {
            for (var a = 0; a < b.length; a++)
              b[a][0].checked || (b[a][0].checked = !0), b[a].change();
          });
          gb.unbind("click").click(function () {
            for (var a = 0; a < b.length; a++)
              b[a][0].checked && (b[a][0].checked = !1), b[a].change();
          });
        }
        kernel.showDialog([bb, a, null, a], "scropt", "Scramble Options");
      }
      function Wa(b, d) {
        "time" == b
          ? Kb
            ? n()
            : (jb.empty(), kernel.pushSignal("scramble", ["-", ""]))
          : "property" == b
          ? "scrSize" == d[0]
            ? ob.css("font-size", d[1] / 7 + "em")
            : "scrMono" == d[0]
            ? Ra.css("font-family", d[1] ? "SimHei, Monospace" : "Arial")
            : "scrType" == d[0]
            ? d[1] != kb.getSelected() && (kb.loadVal(d[1]), Ya())
            : "scrLim" == d[0]
            ? d[1]
              ? ob.addClass("limit")
              : ob.removeClass("limit")
            : "scrAlign" == d[0]
            ? "c" == d[1]
              ? Ra.css("text-align", "center")
              : "l" == d[1]
              ? Ra.css("text-align", "left")
              : "r" == d[1] && Ra.css("text-align", "right")
            : "scrFast" == d[0]
            ? ((qb["444wca"] = d[1] ? "444m" : "444wca"), "444wca" == eb && n())
            : "scrKeyM" == d[0]
            ? jb.html(xb ? a(pb, zb || "", !0) : a(eb, Za || "", !0))
            : "scrHide" == d[0] && (d[1] ? r.hide() : r.show())
          : "button" == b && "scramble" == d[0]
          ? (Kb = d[1]) && "" == jb.html() && n()
          : "ctrl" == b &&
            "scramble" == d[0] &&
            ("last" == d[1] ? Xa() : "next" == d[1] && c());
      }
      function oa(a, b) {
        for (var d = 0; d < scrdata.length; d++)
          for (var c = 0; c < scrdata[d][1].length; c++)
            if (scrdata[d][1][c][1] == a) {
              b(d, c);
              return;
            }
      }
      var Sa = scrMgr.scramblers,
        d = scrMgr.filters,
        b = scrMgr.probs,
        Ra = $('<div id="scrambleDiv"/>'),
        r = $("<div />").addClass("title"),
        ab = [$("<select />"), $("<select />")],
        kb = new kernel.TwoLvMenu(scrdata, Ya, ab[0], ab[1], "333"),
        ib = $('<input type="button" class="icon">').val("î¦”"),
        bb = $("<div>"),
        lb = $('<div class="sflt">'),
        hb = $('<input type="button">').val("Select All"),
        gb = $('<input type="button">').val("Select None"),
        $a = $('<input type="text" maxlength="3">'),
        jb = $("<div>"),
        ob = $('<div id="scrambleTxt"/>'),
        qb = { "333oh": "333", "333ft": "333" },
        mb = "",
        cb = $("<textarea />"),
        eb,
        pb,
        fb = "333",
        vb = 0,
        Za,
        zb,
        xb = !1,
        Ab = $("<span />").html(SCRAMBLE_LAST),
        sb = $("<span />").addClass("click").html(SCRAMBLE_NEXT).click(c),
        rb = !0,
        nb = 0;
      $(function () {
        if (csTimerWorker && csTimerWorker.getScramble) {
          var a = ['["444wca",40,null]'],
            b = JSON.parse(localStorage.cachedScr || null) || {};
          $.isArray(b) && (b = {});
          for (var d = 0; d < a.length; d++)
            a[d] in b ||
              setTimeout(
                w.bind(void 0, JSON.parse(a[d]), a[d], !0),
                2500 + ~~(5e3 * Math.random())
              );
        }
      });
      var wb = (function () {
          function a() {
            kernel.setProp("scrType", fb);
          }
          function b(a) {
            if (!$.isArray(a)) return !1;
            d = a;
            return 0 != d.length;
          }
          var d = [];
          return {
            next: function (c) {
              for (var r = null; !r && 0 != d.length; ) r = d.shift();
              if (r) return r;
              "remoteComp" == c
                ? (onlinecomp || a(),
                  (r = onlinecomp.getScrambles()),
                  b(r) ? requestAnimFrame(f) : a())
                : "remoteURL" == c &&
                  $.getJSON(
                    "https://cstimer.net/testRemoteScramble.php",
                    function (d) {
                      b(d) ? requestAnimFrame(f) : a();
                    }
                  ).error(a);
              return "";
            },
            clear: function () {
              d = [];
            },
          };
        })(),
        tb = (function () {
          function a() {
            var a = cb.val();
            if (a.match(/^\s*$/)) a = !1;
            else {
              d = [];
              a = a.split("\n");
              for (var b = 0; b < a.length; b++) {
                var c = a[b];
                null == c.match(/^\s*$/) &&
                  d.push(c.replace(/^\d+[\.\),]\s*/, ""));
              }
              a = 0 != d.length;
            }
            a ? f() : kernel.setProp("scrType", fb);
          }
          function b() {
            kernel.setProp("scrType", fb);
          }
          var d = [];
          return {
            next: function () {
              for (var c = null; !c && 0 != d.length; ) c = d.shift();
              if (c) return c;
              cb.val("");
              kernel.showDialog([cb, a, b], "input", SCRAMBLE_INPUT);
              return "";
            },
            clear: function () {
              d = [];
            },
          };
        })(),
        Kb = !1,
        Gb = (function () {
          function a() {
            for (
              var a = ~~c.val(), b = "", d = Za, n = f.val(), w = 0;
              w < a;
              w++
            )
              h(), (b += n.replace("1", w + 1) + Za + "\n");
            Za = d;
            r.text(b);
            r.select();
          }
          var b = $("<div />")
              .css("text-align", "center")
              .css("font-size", "0.7em"),
            d = $("<span />").addClass("click").html(SCRGEN_GEN),
            c = $('<input type="text" maxlength="3">').val(5),
            r = $('<textarea rows="10" style="width: 100%" readonly />'),
            f = $(
              '<select><option value="1. ">1. </option><option value="1) ">1) </option><option value="(1) ">(1) </option><option value=""></option></select>'
            );
          b.append(SCRGEN_NSCR, c, "&nbsp;", SCRGEN_PRE).append(
            f,
            "<br>",
            d,
            "<br>",
            r
          );
          return function (c) {
            c &&
              (c.empty().append(b.width(Ra.width() / 2)),
              f.unbind("change").change(kernel.blur),
              d.unbind("click").click(a));
          };
        })(),
        Bb = scrMgr.rndState;
      $(function () {
        kernel.regListener("scramble", "time", Wa);
        kernel.regListener(
          "scramble",
          "property",
          Wa,
          /^scr(?:Size|Mono|Type|Lim|Align|Fast|KeyM|Hide)$/
        );
        kernel.regListener("scramble", "button", Wa, /^scramble$/);
        kernel.regListener("scramble", "ctrl", Wa, /^scramble$/);
        kernel.regProp(
          "scramble",
          "scrSize",
          2,
          PROPERTY_SCRSIZE,
          [15, 5, 50],
          1
        );
        kernel.regProp("scramble", "scrASize", 0, PROPERTY_SCRASIZE, [!0], 1);
        kernel.regProp("scramble", "scrMono", 0, PROPERTY_SCRMONO, [!0], 1);
        kernel.regProp("scramble", "scrLim", 0, PROPERTY_SCRLIM, [!1], 1);
        kernel.regProp(
          "scramble",
          "scrAlign",
          1,
          PROPERTY_SCRALIGN,
          ["c", ["c", "l", "r"], PROPERTY_SCRALIGN_STR.split("|")],
          1
        );
        kernel.regProp(
          "scramble",
          "preScr",
          1,
          "pre-scramble",
          ["", " z2 z' z x' x".split(" "), " z2 z' z x' x".split(" ")],
          1
        );
        kernel.regProp("scramble", "scrFast", 0, PROPERTY_SCRFAST, [!1]);
        kernel.regProp("scramble", "scrKeyM", 0, PROPERTY_SCRKEYM, [!1], 1);
        kernel.regProp(
          "scramble",
          "scrClk",
          1,
          PROPERTY_SCRCLK,
          ["n", ["n", "c", "+"], PROPERTY_SCRCLK_STR.split("|")],
          1
        );
        kernel.regProp("scramble", "scrType", -6, "Scramble Type", ["333"], 3);
        $a.change(n);
        ib.click(Ta);
        bb.append($("<div>").append(SCRAMBLE_LENGTH + ": ", $a), lb);
        r.append($("<nobr>").append(ab[0], " ", ab[1], " ", ib), " <wbr>");
        r.append($("<nobr>").append(Ab, "/", sb, SCRAMBLE_SCRAMBLE));
        Ra.append(r, ob.append(jb).click(Ua));
        tools.regTool("scrgen", TOOLS_SCRGEN, Gb);
        ob.click(function () {
          r.show();
          kernel.blur();
          kernel.setProp("scrHide", !1);
        });
        kernel.regProp("ui", "scrHide", -1, "Hide Scramble Selector", [!1]);
        kernel.addWindow("scramble", BUTTON_SCRAMBLE, Ra, !0, !0, 3);
        Va();
      });
      return {
        getTypeName: function (a) {
          var b = "";
          oa(a, function (a, d) {
            b = scrdata[a][0] + ">" + scrdata[a][1][d][0];
          });
          return b;
        },
        getTypeIdx: function (a) {
          var b = 1e300;
          oa(a, function (a, d) {
            b = 100 * a + d;
          });
          return b;
        },
        scrStd: a,
        setCacheEnable: function (a) {
          rb = a;
        },
      };
    },
    [mathlib.rn, mathlib.rndEl]
  );
(function (z, Qa, n) {
  function Xa(a, c) {
    var f = w[a];
    switch (f.length) {
      case 1:
        return z(f[0], [""], c);
      case 2:
        return z(f[0], f[1], c);
      case 3:
        return z(f[0], f[1], f[2]);
    }
  }
  function c(c, f) {
    var w = h[c],
      z = w[1],
      Sa = w[2],
      d = 0,
      b = 0,
      Ra = [],
      r = [
        ["R", "R'"],
        ["R'", "R"],
        ["L", "L'"],
        ["L'", "L"],
        ["F'", "F"],
        ["F", "F'"],
        ["B", "B'"],
        ["B'", "B"],
      ],
      Ta = ["U", "D"];
    w = w[0];
    for (var T = 0; T < Sa.length; T++) Ra[T] = 0;
    for (T = 0; T < f; T++) {
      for (var Va = !1; !Va; )
        for (var Ua = "", Xa = 0; Xa < Sa.length; Xa++) {
          var Ya = Qa(4);
          Ra[Xa] += Ya;
          0 != Ya && ((Va = !0), (Ua += " " + Sa[Xa] + a[Ya - 1]));
        }
      Va = Qa(8);
      Xa = Qa(2);
      Ya = Qa(3);
      w += Ua + " " + r[Va][0] + " " + Ta[Xa] + a[Ya] + " " + r[Va][1];
      0 == Xa && (d += Ya + 1);
      1 == Xa && (b += Ya + 1);
    }
    for (T = 0; T < Sa.length; T++)
      (Ya = 4 - (Ra[T] % 4)), 4 > Ya && (w += " " + Sa[T] + a[Ya - 1]);
    d = 4 - (d % 4);
    b = 4 - (b % 4);
    4 > d && (w += " U" + a[d - 1]);
    4 > b && (w += " D" + a[b - 1]);
    return (w += " " + n(z));
  }
  function Ua(a, c) {
    var f = T[a].replace(/%l/g, c).replace(/%c/g, '["","2","\'"]');
    return scrMgr.formatScramble(f);
  }
  var a = ["", "2", "'"],
    f = ["", "2", "'", "2'"],
    w = {
      111: [[["x"], ["y"], ["z"]], a],
      2223: [[["U"], ["R"], ["F"]], a],
      2226: [[[["U", "D"]], [["R", "L"]], [["F", "B"]]], a],
      "333o": [
        [
          ["U", "D"],
          ["R", "L"],
          ["F", "B"],
        ],
        a,
      ],
      334: [
        [
          [
            ["U", "U'", "U2"],
            ["u", "u'", "u2"],
          ],
          [["R2", "L2", "M2"]],
          [["F2", "B2", "S2"]],
        ],
      ],
      336: [
        [
          [
            ["U", "U'", "U2"],
            ["u", "u'", "u2"],
            ["3u", "3u2", "3u'"],
          ],
          [["R2", "L2", "M2"]],
          [["F2", "B2", "S2"]],
        ],
      ],
      888: [
        [
          "U D u d 3u 3d 4u".split(" "),
          "R L r l 3r 3l 4r".split(" "),
          "F B f b 3f 3b 4f".split(" "),
        ],
        a,
      ],
      999: [
        [
          "U D u d 3u 3d 4u 4d".split(" "),
          "R L r l 3r 3l 4r 4l".split(" "),
          "F B f b 3f 3b 4f 4b".split(" "),
        ],
        a,
      ],
      101010: [
        [
          "U D u d 3u 3d 4u 4d 5u".split(" "),
          "R L r l 3r 3l 4r 4l 5r".split(" "),
          "F B f b 3f 3b 4f 4b 5f".split(" "),
        ],
        a,
      ],
      111111: [
        [
          "U D u d 3u 3d 4u 4d 5u 5d".split(" "),
          "R L r l 3r 3l 4r 4l 5r 5l".split(" "),
          "F B f b 3f 3b 4f 4b 5f 5b".split(" "),
        ],
        a,
      ],
      444: [
        [
          ["U", "D", "u"],
          ["R", "L", "r"],
          ["F", "B", "f"],
        ],
        a,
      ],
      "444m": [
        [
          ["U", "D", "Uw"],
          ["R", "L", "Rw"],
          ["F", "B", "Fw"],
        ],
        a,
      ],
      555: [
        [
          ["U", "D", "u", "d"],
          ["R", "L", "r", "l"],
          ["F", "B", "f", "b"],
        ],
        a,
      ],
      "555wca": [
        [
          ["U", "D", "Uw", "Dw"],
          ["R", "L", "Rw", "Lw"],
          ["F", "B", "Fw", "Bw"],
        ],
        a,
      ],
      "666p": [
        [
          ["U", "D", "2U", "2D", "3U"],
          ["R", "L", "2R", "2L", "3R"],
          ["F", "B", "2F", "2B", "3F"],
        ],
        a,
      ],
      "666wca": [
        [
          ["U", "D", "Uw", "Dw", "3Uw"],
          ["R", "L", "Rw", "Lw", "3Rw"],
          ["F", "B", "Fw", "Bw", "3Fw"],
        ],
        a,
      ],
      "666s": [
        [
          ["U", "D", "U&sup2;", "D&sup2;", "U&sup3;"],
          ["R", "L", "R&sup2;", "L&sup2;", "R&sup3;"],
          ["F", "B", "F&sup2;", "B&sup2;", "F&sup3;"],
        ],
        a,
      ],
      "666si": [
        [
          ["U", "D", "u", "d", "3u"],
          ["R", "L", "r", "l", "3r"],
          ["F", "B", "f", "b", "3f"],
        ],
        a,
      ],
      "777p": [
        [
          "U D 2U 2D 3U 3D".split(" "),
          "R L 2R 2L 3R 3L".split(" "),
          "F B 2F 2B 3F 3B".split(" "),
        ],
        a,
      ],
      "777wca": [
        [
          "U D Uw Dw 3Uw 3Dw".split(" "),
          "R L Rw Lw 3Rw 3Lw".split(" "),
          "F B Fw Bw 3Fw 3Bw".split(" "),
        ],
        a,
      ],
      "777s": [
        [
          "U D U&sup2; D&sup2; U&sup3; D&sup3;".split(" "),
          "R L R&sup2; L&sup2; R&sup3; L&sup3;".split(" "),
          "F B F&sup2; B&sup2; F&sup3; B&sup3;".split(" "),
        ],
        a,
      ],
      "777si": [
        [
          "U D u d 3u 3d".split(" "),
          "R L r l 3r 3l".split(" "),
          "F B f b 3f 3b".split(" "),
        ],
        a,
      ],
      cm3: [
        [
          [
            ["U<", "U>", "U2"],
            ["E<", "E>", "E2"],
            ["D<", "D>", "D2"],
          ],
          [
            ["R^", "Rv", "R2"],
            ["M^", "Mv", "M2"],
            ["L^", "Lv", "L2"],
          ],
        ],
      ],
      cm2: [
        [
          [
            ["U<", "U>", "U2"],
            ["D<", "D>", "D2"],
          ],
          [
            ["R^", "Rv", "R2"],
            ["L^", "Lv", "L2"],
          ],
        ],
      ],
      233: [[[["U", "U'", "U2"]], ["R2", "L2"], ["F2", "B2"]]],
      fto: [
        [
          ["U", "D"],
          ["F", "B"],
          ["L", "BR"],
          ["R", "BL"],
        ],
        ["", "'"],
      ],
      gear: [[["U"], ["R"], ["F"]], " 2 3 4 5 6 ' 2' 3' 4' 5'".split(" ")],
      sfl: [
        [
          ["R", "L"],
          ["U", "D"],
        ],
        a,
      ],
      ufo: [[["A"], ["B"], ["C"], [["U", "U'", "U2'", "U2", "U3"]]]],
      "2gen": [[["U"], ["R"]], a],
      "2genl": [[["U"], ["L"]], a],
      roux: [[["U"], ["M"]], a],
      "3gen_F": [[["U"], ["R"], ["F"]], a],
      "3gen_L": [[["U"], ["R", "L"]], a],
      RrU: [[["U"], ["R", "r"]], a],
      RrUu: [
        [
          ["U", "u"],
          ["R", "r"],
        ],
        a,
      ],
      minx2g: [[["U"], ["R"]], f],
      mlsll: [
        [
          [["R U R'", "R U2 R'", "R U' R'", "R U2' R'"]],
          [["F' U F", "F' U2 F", "F' U' F", "F' U2' F"]],
          [["U", "U2", "U'", "U2'"]],
        ],
      ],
      half: [
        [
          ["U", "D"],
          ["R", "L"],
          ["F", "B"],
        ],
        ["2"],
      ],
      lsll: [
        [
          [["R U R'", "R U2 R'", "R U' R'"]],
          [["F' U F", "F' U2 F", "F' U' F"]],
          [["U", "U2", "U'"]],
        ],
      ],
      prco: [
        [
          ["F", "B"],
          ["U", "D"],
          ["L", "DBR"],
          ["R", "DBL"],
          ["BL", "DR"],
          ["BR", "DL"],
        ],
        f,
      ],
      skb: [
        [["R"], ["L"], ["B"], ["U"]],
        ["", "'"],
      ],
      ivy: [
        [["R"], ["L"], ["D"], ["B"]],
        ["", "'"],
      ],
      112: [[["R"], ["R"]], a],
      eide: [
        [
          ["OMG"],
          ["WOW"],
          ["WTF"],
          ["WOO-HOO WOO-HOO MATYAS YES YES YAY YEEEEEEEEEEEES".split(" ")],
          ["HAHA"],
          ["XD"],
          [":D"],
          ["LOL"],
        ],
        ["", "", "", "!!!"],
      ],
    },
    T = {
      sia113:
        '#{[["U","u"],["R","r"]],%c,%l} z2 #{[["U","u"],["R","r"]],%c,%l}',
      sia123: '#{[["U"],["R","r"]],%c,%l} z2 #{[["U"],["R","r"]],%c,%l}',
      sia222: '#{[["U"],["R"],["F"]],%c,%l} z2 y #{[["U"],["R"],["F"]],%c,%l}',
      335: '#{[[["U","U\'","U2"],["D","D\'","D2"]],["R2","L2"],["F2","B2"]],0,%l} / ${333}',
      337: '#{[[["U","U\'","U2","u","u\'","u2","U u","U u\'","U u2","U\' u","U\' u\'","U\' u2","U2 u","U2 u\'","U2 u2"],["D","D\'","D2","d","d\'","d2","D d","D d\'","D d2","D\' d","D\' d\'","D\' d2","D2 d","D2 d\'","D2 d2"]],["R2","L2"],["F2","B2"]],0,%l} / ${333}',
      r234: "2) ${222so}\\n3) ${333}\\n4) ${[444,40]}",
      r2345: '${r234}\\n5) ${["555",60]}',
      r23456: '${r2345}\\n6) ${["666p",80]}',
      r234567: '${r23456}\\n7) ${["777p",100]}',
      r234w: '2) ${222so}\\n3) ${333}\\n4) ${["444m",40]}',
      r2345w: '${r234w}\\n5) ${["555wca",60]}',
      r23456w: '${r2345w}\\n6) ${["666wca",80]}',
      r234567w: '${r23456w}\\n7) ${["777wca",100]}',
      "333ni":
        '${333}#{[[""]],["","Rw ","Rw2 ","Rw\' ","Fw ","Fw\' "],1}#{[[""]],["","Uw","Uw2","Uw\'"],1}',
      "444bld":
        '${444wca}#{[[""]],[""," x"," x2"," x\'"," z"," z\'"],1}#{[[""]],[""," y"," y2"," y\'"],1}',
      "555bld":
        '${["555wca",%l]}#{[[""]],[""," 3Rw"," 3Rw2"," 3Rw\'"," 3Fw"," 3Fw\'"],1}#{[[""]],[""," 3Uw"," 3Uw2"," 3Uw\'"],1}',
    },
    h = {
      "4edge": ["r b2", ["b2 r'", "b2 U2 r U2 r U2 r U2 r"], ["u"]],
      "5edge": [
        "r R b B",
        ["B' b' R' r'", "B' b' R' U2 r U2 r U2 r U2 r"],
        ["u", "d"],
      ],
      "6edge": [
        "3r r 3b b",
        [
          "3b' b' 3r' r'",
          "3b' b' 3r' U2 r U2 r U2 r U2 r",
          "3b' b' r' U2 3r U2 3r U2 3r U2 3r",
          "3b' b' r2 U2 3r U2 3r U2 3r U2 3r U2 r",
        ],
        ["u", "3u", "d"],
      ],
      "7edge": [
        "3r r 3b b",
        [
          "3b' b' 3r' r'",
          "3b' b' 3r' U2 r U2 r U2 r U2 r",
          "3b' b' r' U2 3r U2 3r U2 3r U2 3r",
          "3b' b' r2 U2 3r U2 3r U2 3r U2 3r U2 r",
        ],
        ["u", "3u", "3d", "d"],
      ],
    },
    Va;
  for (Va in w) scrMgr.reg(Va, Xa);
  for (Va in T) scrMgr.reg(Va, Ua);
  for (Va in h) scrMgr.reg(Va, c);
})(scrMgr.mega, mathlib.rn, mathlib.rndEl);
var scramble_333 = (function (z, Qa, n, Xa, c, Ua) {
  function a(a) {
    a.cp = [0, 1, 2, 3, 4, 5, 6, 7];
    a.co = [0, 0, 0, 0, 0, 0, 0, 0];
    a.ep = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    a.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
  function f(a, b, d) {
    var c;
    for (c = 0; 8 > c; ++c) {
      d.cp[c] = a.cp[b.cp[c]];
      var r = a.co[b.cp[c]];
      var f = b.co[c];
      var h = r;
      h += 3 > r ? f : 6 - f;
      h %= 3;
      3 <= r !== 3 <= f && (h += 3);
      d.co[c] = h;
    }
  }
  function w() {
    a(this);
  }
  function T(b, d, c, r) {
    a(this);
    n(this.cp, b);
    b = d;
    var f = 0;
    for (d = 6; 0 <= d; --d) (f += this.co[d] = b % 3), (b = ~~(b / 3));
    this.co[7] = (15 - f) % 3;
    Qa(this.ep, c, 12);
    c = r;
    b = 0;
    for (r = 10; 0 <= r; --r) (b ^= this.eo[r] = c & 1), (c >>= 1);
    this.eo[11] = b;
  }
  function h(a, b, d) {
    var c;
    for (c = 0; 12 > c; ++c)
      (d.ep[c] = a.ep[b.ep[c]]), (d.eo[c] = b.eo[c] ^ a.eo[b.ep[c]]);
  }
  function Va() {
    Va = $.noop;
    var a, b;
    jb[0] = new T(15120, 0, 119750400, 0);
    jb[3] = new T(21021, 1494, 323403417, 0);
    jb[6] = new T(8064, 1236, 29441808, 550);
    jb[9] = new T(9, 0, 5880, 0);
    jb[12] = new T(1230, 412, 2949660, 0);
    jb[15] = new T(224, 137, 328552, 137);
    for (a = 0; 18 > a; a += 3)
      for (b = 0; 2 > b; ++b)
        (jb[a + b + 1] = new w()),
          h(jb[a + b], jb[a], jb[a + b + 1]),
          f(jb[a + b], jb[a], jb[a + b + 1]);
  }
  function Ya() {
    return d(0xffffffffffff, 0xffffffffffff, 4294967295, 4294967295);
  }
  function Ta(a) {
    for (var b = 0, d = 0; d < a.length; d++) -1 == a[d] && b++;
    return b;
  }
  function Wa(a, b, d) {
    for (var r = 0, f = 0, h = 0; h < a.length; h++) -1 != a[h] && (r += a[h]);
    r %= d;
    for (h = 0; h < a.length - 1; h++)
      -1 == a[h] &&
        (1 == b-- ? (a[h] = ((d << 4) - r) % d) : ((a[h] = c(d)), (r += a[h]))),
        (f *= d),
        (f += a[h]);
    return f;
  }
  function oa(a, b, d) {
    for (
      var r = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], f = 0;
      f < a.length;
      f++
    )
      -1 != a[f] && (r[a[f]] = -1);
    for (var h = (f = 0); f < r.length; f++) -1 != r[f] && (r[h++] = r[f]);
    var n;
    for (f = 0; f < a.length && 0 < b; f++)
      if (-1 == a[f]) {
        h = c(b);
        for (a[f] = r[h]; 11 > h; h++) r[h] = r[h + 1];
        2 == b-- && (n = f);
      }
    Xa(z(a, a.length), a.length) == 1 - d &&
      ((b = a[f - 1]), (a[f - 1] = a[n]), (a[n] = b));
    return z(a, a.length);
  }
  function Sa(a, b) {
    if ("number" !== typeof a) return a;
    for (var d = [], c = 0; c < b; c++) {
      var r = a & 15;
      d[c] = 15 == r ? -1 : r;
      a /= 16;
    }
    return d;
  }
  function d(a, b, d, c, r, n) {
    Va();
    r = r || fb;
    n = n || fb;
    a = Sa(a, 12);
    b = Sa(b, 12);
    d = Sa(d, 8);
    c = Sa(c, 8);
    var Ra = "";
    do {
      var Qa = b.slice(),
        Za = a.slice(),
        ab = c.slice(),
        Ya = d.slice();
      Qa = Wa(Qa, Ta(Qa), 2);
      ab = Wa(ab, Ta(ab), 3);
      var cb = Ta(Za),
        eb = Ta(Ya);
      0 == cb && 0 == eb
        ? ((Za = z(Za, 12)), (Ya = z(Ya, 8)))
        : 0 != cb && 0 == eb
        ? ((Ya = z(Ya, 8)), (Za = oa(Za, cb, Xa(Ya, 8))))
        : ((Za = 0 == cb && 0 != eb ? z(Za, 12) : oa(Za, cb, -1)),
          (Ya = oa(Ya, eb, Xa(Za, 12))));
      if (0 != Ya + ab + Za + Qa) {
        Ra = new T(Ya, ab, Za, Qa);
        Za = new w();
        Ya = Ua(n);
        Qa = Ua(r);
        for (ab = 0; ab < Ya.length; ab++)
          f(jb[Ya[ab]], Ra, Za),
            h(jb[Ya[ab]], Ra, Za),
            (cb = Za),
            (Za = Ra),
            (Ra = cb);
        for (ab = 0; ab < Qa.length; ab++)
          f(Ra, jb[Qa[ab]], Za),
            h(Ra, jb[Qa[ab]], Za),
            (cb = Za),
            (Za = Ra),
            (Ra = cb);
        Ya = Ra;
        Za = [];
        Ra = [85, 82, 70, 68, 76, 66];
        for (Qa = 0; 54 > Qa; ++Qa) Za[Qa] = Ra[~~(Qa / 9)];
        for (eb = 0; 8 > eb; ++eb)
          for (cb = Ya.cp[eb], Qa = Ya.co[eb], ab = 0; 3 > ab; ++ab)
            Za[ob[eb][(ab + Qa) % 3]] = Ra[~~(ob[cb][ab] / 9)];
        for (eb = 0; 12 > eb; ++eb)
          for (cb = Ya.ep[eb], Qa = Ya.eo[eb], ab = 0; 2 > ab; ++ab)
            Za[qb[eb][(ab + Qa) % 2]] = Ra[~~(qb[cb][ab] / 9)];
        Ra = String.fromCharCode.apply(null, Za);
        Ra = new min2phase.Search().solution(Ra, 21, 1e9, 50, 2);
      }
    } while (3 >= Ra.length);
    return Ra.replace(/ +/g, " ");
  }
  function b() {
    return d(0xffffffffffff, 0xffffffffffff, 1985229328, 0);
  }
  function Ra() {
    return d(0xba9876543210, 0, 4294967295, 4294967295);
  }
  function r() {
    return d(0xba987654ffff, 65535, 1985282047, 65535);
  }
  function ab(a, b, c) {
    a = vb[scrMgr.fixCase(c, Za)];
    b = Math.pow(16, a & 15);
    c = Math.pow(16, (a >> 8) & 15);
    return d(
      0xba9f7654ffff - 7 * b,
      64424574975 - (15 ^ ((a >> 4) & 1)) * b,
      1986002943 - 11 * c,
      1048575 - (15 ^ ((a >> 12) & 3)) * c
    );
  }
  function kb() {
    return d(0xffff7654ffff, 0xffff0000ffff, 4294967295, 4294967295);
  }
  function ib(a, b, c) {
    a = zb[scrMgr.fixCase(c, xb)];
    return d(0xba987654ffff, 0, a[0] + 1985216512, a[1], cb, cb);
  }
  function bb() {
    return d(0xba9876543f1f, 0, 1985282047, 65535, cb);
  }
  function lb() {
    var a = c(4);
    return d(0xba98f6f4ffff, 4042326015, 1985229328, 0, [eb[a]], cb) + pb[a];
  }
  function hb(a, b, r) {
    a = c(4);
    b = [];
    for (var f = 0; f < cb.length; f++) b.push(cb[f].concat(eb[a]));
    return (
      d(
        0xba98f6f4ffff,
        4042326015,
        1985282047,
        Ab[scrMgr.fixCase(r, sb)],
        b,
        cb
      ) + pb[a]
    );
  }
  function gb() {
    return d(0xba9876543210, 0, 1985282047, 65535);
  }
  function $a() {
    return d(0xba987654ffff, 65535, 1985229328, 0);
  }
  T.prototype = w.prototype;
  var jb = [],
    ob = [
      [8, 9, 20],
      [6, 18, 38],
      [0, 36, 47],
      [2, 45, 11],
      [29, 26, 15],
      [27, 44, 24],
      [33, 53, 42],
      [35, 17, 51],
    ],
    qb = [
      [5, 10],
      [7, 19],
      [3, 37],
      [1, 46],
      [32, 16],
      [28, 25],
      [30, 43],
      [34, 52],
      [23, 12],
      [21, 41],
      [50, 39],
      [48, 14],
    ],
    mb = new min2phase.Search(),
    cb = [[], [0], [1], [2]],
    eb = [[], [3, 14], [4, 13], [5, 12]],
    pb = ["", "x'", "x2", "x"],
    fb = [[]],
    vb = [
      8192, 4113, 8210, 4099, 8195, 4114, 8194, 4115, 8211, 4098, 8208, 4097,
      8209, 4096, 8193, 4112, 0, 17, 3, 18, 2, 19, 1, 16, 1024, 1041, 5120,
      9233, 5137, 9216, 24, 8, 8200, 4104, 8216, 4120, 1048, 5128, 9224, 5144,
      9240, 1032,
    ],
    Za = [
      4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
      4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1,
    ],
    zb = [
      [12816, 8481],
      [12306, 8481],
      [12576, 8481],
      [12801, 8481],
      [12306, 4128],
      [12321, 4128],
      [12801, 4128],
      [12546, 4128],
      [12816, 4128],
      [12576, 4128],
      [12546, 4386],
      [12576, 4386],
      [12306, 4386],
      [12321, 4386],
      [12816, 4386],
      [12801, 4386],
      [12576, 8736],
      [12546, 8736],
      [12816, 8736],
      [12801, 8736],
      [12321, 8736],
      [12306, 8736],
      [12816, 8448],
      [12306, 8448],
      [12801, 8448],
      [12576, 8448],
      [12546, 8448],
      [12321, 8448],
      [12321, 4608],
      [12801, 4608],
      [12306, 4608],
      [12576, 4608],
      [12546, 4608],
      [12816, 4608],
      [12546, 4353],
      [12576, 4353],
      [12306, 4353],
      [12321, 4353],
      [12816, 4353],
      [12801, 4353],
      [65535, 0],
    ],
    xb = [
      1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
      2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3,
    ],
    Ab = [0, 4626, 258, 4386, 546, 33, 18, 273],
    sb = [6, 12, 24, 24, 24, 24, 24, 24],
    rb = [
      [4146, 12816],
      [12546, 12816],
      [12321, 12816],
      [8961, 12816],
      [12816, 12321],
      [12816, 12546],
      [12816, 8961],
      [12306, 12801],
      [8496, 12321],
      [4896, 12546],
      [12321, 12546],
      [12546, 12321],
      [12801, 12801],
      [12576, 12801],
      [4656, 12306],
      [12306, 12306],
      [531, 12801],
      [8976, 12801],
      [4656, 12801],
      [12576, 12306],
      [12801, 12306],
    ],
    nb = [1, 4, 4, 2, 4, 4, 2, 4, 4, 4, 4, 4, 4, 4, 1, 1, 4, 4, 4, 4, 4],
    wb = [
      [0, 0],
      [4369, 4626],
      [4369, 4386],
      [4369, 546],
      [4369, 273],
      [17, 8226],
      [17, 4113],
      [17, 8706],
      [17, 273],
      [17, 4368],
      [17, 8736],
      [17, 546],
      [17, 4353],
      [257, 8226],
      [257, 273],
      [257, 546],
      [257, 4113],
      [4369, 258],
      [4369, 18],
      [4369, 33],
      [4369, 0],
      [0, 4626],
      [0, 4386],
      [0, 18],
      [0, 33],
      [0, 258],
      [0, 273],
      [0, 546],
      [17, 0],
      [17, 528],
      [17, 8448],
      [17, 33],
      [17, 4098],
      [257, 33],
      [257, 528],
      [17, 4128],
      [17, 258],
      [17, 8208],
      [17, 513],
      [257, 4128],
      [257, 258],
      [17, 4608],
      [17, 288],
      [17, 18],
      [17, 8193],
      [257, 18],
      [257, 288],
      [17, 4641],
      [17, 4386],
      [17, 8466],
      [17, 8721],
      [257, 4641],
      [257, 4386],
      [17, 8481],
      [17, 4626],
      [257, 8481],
      [257, 4626],
      [257, 0],
    ],
    tb = [
      1, 2, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 1, 2, 4, 4, 4,
      4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
      4, 4, 4, 4, 4, 2, 2, 2,
    ];
  scrMgr.reg("333", Ya)("333fm", function () {
    do {
      var a = Ya();
      var b = a.split(" ");
      if (!(3 > b.length)) {
        var d = b[0][0];
        var c = b[1][0];
        var r = b[b.length - 2][0];
        var f = b[b.length - 3][0];
      }
    } while ("F" == d || ("B" == d && "F" == c) || "R" == r || ("L" == r && "R" == f));
    return "R' U' F " + a + "R' U' F";
  })("edges", b)("corners", Ra)("ll", r)("lsll2", ab, [
    "Easy-01 Easy-02 Easy-03 Easy-04 RE-05 RE-06 RE-07 RE-08 REFC-09 REFC-10 REFC-11 REFC-12 REFC-13 REFC-14 SPGO-15 SPGO-16 SPGO-17 SPGO-18 PMS-19 PMS-20 PMS-21 PMS-22 Weird-23 Weird-24 CPEU-25 CPEU-26 CPEU-27 CPEU-28 CPEU-29 CPEU-30 EPCU-31 EPCU-32 EPCU-33 EPCU-34 EPCU-35 EPCU-36 ECP-37 ECP-38 ECP-39 ECP-40 ECP-41 Solved-42".split(
      " "
    ),
    Za,
  ])("f2l", kb)("zbll", ib, [
    "H-BBFF H-FBFB H-RFLF H-RLFF L-FBRL L-LBFF L-LFFB L-LFFR L-LRFF L-RFBL Pi-BFFB Pi-FBFB Pi-FRFL Pi-FRLF Pi-LFRF Pi-RFFL S-FBBF S-FBFB S-FLFR S-FLRF S-LFFR S-LFRF T-BBFF T-FBFB T-FFLR T-FLFR T-RFLF T-RLFF U-BBFF U-BFFB U-FFLR U-FRLF U-LFFR U-LRFF aS-FBBF aS-FBFB aS-FRFL aS-FRLF aS-LFRF aS-RFFL PLL".split(
      " "
    ),
    xb,
  ])("zzll", bb)("zbls", function () {
    return d(0xba9f7654ffff, 0, 1986002943, 1048575);
  })("lse", lb)("cmll", hb, ["O H L Pi S T U aS".split(" "), sb])("cll", gb)(
    "ell",
    $a
  )(
    "pll",
    function (a, b, c) {
      a = rb[scrMgr.fixCase(c, nb)];
      return d(a[0] + 0xba9876540000, 0, a[1] + 1985216512, 0, cb, cb);
    },
    ["H Ua Ub Z Aa Ab E F Ga Gb Gc Gd Ja Jb Na Nb Ra Rb T V Y".split(" "), nb]
  )(
    "oll",
    function (a, b, c) {
      a = wb[scrMgr.fixCase(c, tb)];
      return d(0xba987654ffff, a[0], 1985282047, a[1], cb, cb);
    },
    [
      "PLL Point-1 Point-2 Point-3 Point-4 Square-5 Square-6 SLBS-7 SLBS-8 Fish-9 Fish-10 SLBS-11 SLBS-12 Knight-13 Knight-14 Knight-15 Knight-16 Point-17 Point-18 Point-19 CO-20 OCLL-21 OCLL-22 OCLL-23 OCLL-24 OCLL-25 OCLL-26 OCLL-27 CO-28 Awkward-29 Awkward-30 P-31 P-32 T-33 C-34 Fish-35 W-36 Fish-37 W-38 BLBS-39 BLBS-40 Awkward-41 Awkward-42 P-43 P-44 T-45 C-46 L-47 L-48 L-49 L-50 I-51 I-52 L-53 L-54 I-55 I-56 CO-57".split(
        " "
      ),
      tb,
    ]
  )("2gll", function () {
    return d(0xba987654ffff, 0, 1985229328, 65535, cb);
  })("easyc", function (a, b) {
    var c = cross.getEasyCross(b);
    return d(c[0], c[1], 4294967295, 4294967295);
  })("eoline", function () {
    return d(0xffff7f5fffff, 0, 4294967295, 4294967295);
  });
  return {
    getRandomScramble: Ya,
    getEdgeScramble: b,
    getCornerScramble: Ra,
    getLLScramble: r,
    getLSLLScramble: ab,
    getZBLLScramble: ib,
    getZZLLScramble: bb,
    getF2LScramble: kb,
    getLSEScramble: lb,
    getCMLLScramble: hb,
    getCLLScramble: gb,
    getELLScramble: $a,
    getAnyScramble: d,
    genFacelet: function (a) {
      return mb.solution(a, 21, 1e9, 50, 2);
    },
    solvFacelet: function (a) {
      return mb.solution(a, 21, 1e9, 50, 0);
    },
  };
})(
  mathlib.getNPerm,
  mathlib.setNPerm,
  mathlib.set8Perm,
  mathlib.getNParity,
  mathlib.rn,
  mathlib.rndEl
);
var scramble_444 = (function (z, Qa, n) {
  function Xa(a, b) {
    var d;
    var c = Array(a);
    if (void 0 != b) for (d = 0; d < a; d++) c[d] = Array(b);
    return c;
  }
  function c(a, b, d) {
    var c = oc[a];
    c && !c.___clazz$
      ? (yb = c.prototype)
      : (!c && (c = oc[a] = function () {}),
        (yb = c.prototype = 0 > b ? {} : new oc[b]()),
        (yb.castableTypeMap$ = d));
    for (var r = 3; r < arguments.length; ++r) arguments[r].prototype = yb;
    c.___clazz$ && ((yb.___clazz$ = c.___clazz$), (c.___clazz$ = null));
  }
  function Ua(a) {
    for (var b = {}, d = 0, c = a.length; d < c; ++d) b[a[d]] = 1;
    return b;
  }
  function a() {}
  function f() {}
  function w(a, b) {
    var d = Array(b);
    if (3 == a)
      for (var c = 0; c < b; ++c) {
        var r = {};
        r.l = r.m = r.h = 0;
        d[c] = r;
      }
    else if (0 < a) for (r = [null, 0, !1][a], c = 0; c < b; ++c) d[c] = r;
    return d;
  }
  function T(a, b, d, c, r) {
    c = w(r, c);
    h(a, b, d, c);
    return c;
  }
  function h(a, b, d, c) {
    Va();
    var r = Gc,
      f = Hc;
    Va();
    for (var h = 0, n = r.length; h < n; ++h) c[r[h]] = f[h];
    c.___clazz$ = a;
    c.castableTypeMap$ = b;
    c.queryId$ = d;
    return c;
  }
  function Va() {
    Va = a;
    Gc = [];
    Hc = [];
    var b = new f(),
      d = Gc,
      c = Hc,
      r = 0,
      h,
      n;
    for (n in b) if ((h = b[n])) (d[r] = n), (c[r] = h), ++r;
  }
  function Ya() {
    Ya = a;
    yc = Xa(15582, 36);
    pc = Xa(15582);
    Tb = Xa(15582);
    ic = Xa(48, 48);
    Vb = Xa(48, 36);
    jc = Xa(48);
    Ic = Xa(48);
  }
  function Ta(a, b) {
    var d;
    if (null != b && b.castableTypeMap$ && b.castableTypeMap$[21]) {
      for (d = 0; 24 > d; ++d) if (a.ct[d] != b.ct[d]) return !1;
      return !0;
    }
    return !1;
  }
  function Wa(a) {
    var b;
    var d = 0;
    var c = 8;
    for (b = 23; 0 <= b; --b) 1 == a.ct[b] && (d += Qa[b][c--]);
    return d;
  }
  function oa(a) {
    var b;
    if (null != kc) return kc[Wa(a)];
    for (b = 0; 48 > b; ++b) {
      var c = Wa(a);
      a: {
        var r;
        var f = 0;
        for (r = pc.length - 1; f <= r; ) {
          var h = f + (~~(r - f) >> 1);
          var n = pc[h];
          if (n < c) f = h + 1;
          else if (n > c) r = h - 1;
          else {
            c = h;
            break a;
          }
        }
        c = -f - 1;
      }
      c = 0 <= c ? c : -1;
      if (-1 != c) return 64 * c + b;
      d(a, 0);
      1 == b % 2 && d(a, 1);
      7 == b % 8 && d(a, 2);
      15 == b % 16 && d(a, 3);
    }
  }
  function Sa(a, b) {
    var d = b % 3;
    switch (~~(b / 3)) {
      case 0:
        db(a.ct, 0, 1, 2, 3, d);
        break;
      case 1:
        db(a.ct, 16, 17, 18, 19, d);
        break;
      case 2:
        db(a.ct, 8, 9, 10, 11, d);
        break;
      case 3:
        db(a.ct, 4, 5, 6, 7, d);
        break;
      case 4:
        db(a.ct, 20, 21, 22, 23, d);
        break;
      case 5:
        db(a.ct, 12, 13, 14, 15, d);
        break;
      case 6:
        db(a.ct, 0, 1, 2, 3, d);
        db(a.ct, 8, 20, 12, 16, d);
        db(a.ct, 9, 21, 13, 17, d);
        break;
      case 7:
        db(a.ct, 16, 17, 18, 19, d);
        db(a.ct, 1, 15, 5, 9, d);
        db(a.ct, 2, 12, 6, 10, d);
        break;
      case 8:
        db(a.ct, 8, 9, 10, 11, d);
        db(a.ct, 2, 19, 4, 21, d);
        db(a.ct, 3, 16, 5, 22, d);
        break;
      case 9:
        db(a.ct, 4, 5, 6, 7, d);
        db(a.ct, 10, 18, 14, 22, d);
        db(a.ct, 11, 19, 15, 23, d);
        break;
      case 10:
        db(a.ct, 20, 21, 22, 23, d);
        db(a.ct, 0, 8, 4, 14, d);
        db(a.ct, 3, 11, 7, 13, d);
        break;
      case 11:
        db(a.ct, 12, 13, 14, 15, d),
          db(a.ct, 1, 20, 7, 18, d),
          db(a.ct, 0, 23, 6, 17, d);
    }
  }
  function d(a, b) {
    switch (b) {
      case 0:
        Sa(a, 19);
        Sa(a, 28);
        break;
      case 1:
        Sa(a, 21);
        Sa(a, 32);
        break;
      case 2:
        db(a.ct, 0, 3, 1, 2, 1);
        db(a.ct, 8, 11, 9, 10, 1);
        db(a.ct, 4, 7, 5, 6, 1);
        db(a.ct, 12, 15, 13, 14, 1);
        db(a.ct, 16, 19, 21, 22, 1);
        db(a.ct, 17, 18, 20, 23, 1);
        break;
      case 3:
        Sa(a, 18), Sa(a, 29), Sa(a, 24), Sa(a, 35);
    }
  }
  function b(a, b) {
    var c;
    for (c = 0; c < b; ++c)
      d(a, 0),
        1 == c % 2 && d(a, 1),
        7 == c % 8 && d(a, 2),
        15 == c % 16 && d(a, 3);
  }
  function Ra(a, b) {
    var d;
    var c = 8;
    for (d = 23; 0 <= d; --d)
      (a.ct[d] = 0), b >= Qa[d][c] && ((b -= Qa[d][c--]), (a.ct[d] = 1));
  }
  function r(a, b) {
    var d;
    for (d = 0; 24 > d; ++d) a.ct[d] = b.ct[d];
  }
  function ab() {
    var a;
    this.ct = Xa(24);
    for (a = 0; 8 > a; ++a) this.ct[a] = 1;
    for (a = 8; 24 > a; ++a) this.ct[a] = 0;
  }
  function kb(a, b) {
    var d;
    this.ct = Xa(24);
    for (d = 0; 24 > d; ++d) this.ct[d] = ~~(a.ct[d] / 2) == b ? 1 : 0;
  }
  function ib(a) {
    var b;
    this.ct = Xa(24);
    for (b = 0; 24 > b; ++b) this.ct[b] = a[b];
  }
  function bb() {
    bb = a;
    zc = Xa(70, 28);
    Ac = Xa(6435, 28);
    hd = Xa(70, 16);
    id = Xa(6435, 16);
    Nb = Xa(450450);
    jd = [
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0,
      0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0,
    ];
  }
  function lb(a) {
    var b;
    var d = 0;
    var c = 8;
    for (b = 14; 0 <= b; --b) a.ct[b] != a.ct[15] && (d += Qa[b][c--]);
    return d;
  }
  function hb(a) {
    var b;
    var d = 0;
    var c = 4;
    for (b = 6; 0 <= b; --b) a.rl[b] != a.rl[7] && (d += Qa[b][c--]);
    return 2 * d + a.parity;
  }
  function gb(a, b) {
    a.parity ^= jd[b];
    var d = b % 3;
    switch (~~(b / 3)) {
      case 0:
        db(a.ct, 0, 1, 2, 3, d);
        break;
      case 1:
        db(a.rl, 0, 1, 2, 3, d);
        break;
      case 2:
        db(a.ct, 8, 9, 10, 11, d);
        break;
      case 3:
        db(a.ct, 4, 5, 6, 7, d);
        break;
      case 4:
        db(a.rl, 4, 5, 6, 7, d);
        break;
      case 5:
        db(a.ct, 12, 13, 14, 15, d);
        break;
      case 6:
        db(a.ct, 0, 1, 2, 3, d);
        db(a.rl, 0, 5, 4, 1, d);
        db(a.ct, 8, 9, 12, 13, d);
        break;
      case 7:
        db(a.rl, 0, 1, 2, 3, d);
        db(a.ct, 1, 15, 5, 9, d);
        db(a.ct, 2, 12, 6, 10, d);
        break;
      case 8:
        db(a.ct, 8, 9, 10, 11, d);
        db(a.rl, 0, 3, 6, 5, d);
        db(a.ct, 3, 2, 5, 4, d);
        break;
      case 9:
        db(a.ct, 4, 5, 6, 7, d);
        db(a.rl, 3, 2, 7, 6, d);
        db(a.ct, 11, 10, 15, 14, d);
        break;
      case 10:
        db(a.rl, 4, 5, 6, 7, d);
        db(a.ct, 0, 8, 4, 14, d);
        db(a.ct, 3, 11, 7, 13, d);
        break;
      case 11:
        db(a.ct, 12, 13, 14, 15, d),
          db(a.rl, 1, 4, 7, 2, d),
          db(a.ct, 1, 0, 7, 6, d);
    }
  }
  function $a(a, b) {
    switch (b) {
      case 0:
        gb(a, 19);
        gb(a, 28);
        break;
      case 1:
        gb(a, 21);
        gb(a, 32);
        break;
      case 2:
        db(a.ct, 0, 3, 1, 2, 1),
          db(a.ct, 8, 11, 9, 10, 1),
          db(a.ct, 4, 7, 5, 6, 1),
          db(a.ct, 12, 15, 13, 14, 1),
          db(a.rl, 0, 3, 5, 6, 1),
          db(a.rl, 1, 2, 4, 7, 1);
    }
  }
  function jb(a, b, d) {
    var c;
    for (c = 0; 16 > c; ++c) a.ct[c] = ~~(b.ct[c] / 2);
    for (c = 0; 8 > c; ++c) a.rl[c] = b.ct[c + 16];
    a.parity = d;
  }
  function ob(a, b) {
    var d;
    var c = 8;
    a.ct[15] = 0;
    for (d = 14; 0 <= d; --d)
      b >= Qa[d][c] ? ((b -= Qa[d][c--]), (a.ct[d] = 1)) : (a.ct[d] = 0);
  }
  function qb(a, b) {
    var d;
    a.parity = b & 1;
    b >>>= 1;
    var c = 4;
    a.rl[7] = 0;
    for (d = 6; 0 <= d; --d)
      b >= Qa[d][c] ? ((b -= Qa[d][c--]), (a.rl[d] = 1)) : (a.rl[d] = 0);
  }
  function mb() {
    this.rl = Xa(8);
    this.ct = Xa(16);
  }
  function cb() {
    cb = a;
    qc = Xa(29400, 20);
    kd = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1];
    ac = Xa(29400);
    Jc = [0, 9, 14, 23, 27, 28, 41, 42, 46, 55, 60, 69];
    Kc = Xa(70);
  }
  function eb(a) {
    var b;
    var d = 0;
    var c = 4;
    for (b = 6; 0 <= b; --b) a.ud[b] != a.ud[7] && (d += Qa[b][c--]);
    d *= 35;
    c = 4;
    for (b = 6; 0 <= b; --b) a.fb[b] != a.fb[7] && (d += Qa[b][c--]);
    var r = a.fb[7] ^ a.ud[7];
    var f = 0;
    c = 4;
    for (b = 7; 0 <= b; --b) a.rl[b] != r && (f += Qa[b][c--]);
    return a.parity + 2 * (12 * d + Kc[f]);
  }
  function pb(a, b, d) {
    var c;
    var r =
      (b.ct[0] > b.ct[8]) ^ (b.ct[8] > b.ct[16]) ^ (b.ct[0] > b.ct[16]) ? 1 : 0;
    for (c = 0; 8 > c; ++c)
      (a.ud[c] = (b.ct[c] & 1) ^ 1),
        (a.fb[c] = (b.ct[c + 8] & 1) ^ 1),
        (a.rl[c] = (b.ct[c + 16] & 1) ^ 1 ^ r);
    a.parity = r ^ d;
  }
  function fb() {
    this.ud = Xa(8);
    this.rl = Xa(8);
    this.fb = Xa(8);
  }
  function vb() {
    vb = a;
  }
  function Za() {
    var a;
    this.ct = Xa(24);
    for (a = 0; 24 > a; ++a) this.ct[a] = ~~(a / 4);
  }
  function zb(a) {
    Za.call(this);
    for (a = 0; 23 > a; ++a) {
      var b = a + z(24 - a);
      if (this.ct[b] != this.ct[a]) {
        var d = this.ct[a];
        this.ct[a] = this.ct[b];
        this.ct[b] = d;
      }
    }
  }
  function xb() {
    xb = a;
    Sb = Xa(18);
    var b, d;
    Sb[0] = new wb(15120, 0);
    Sb[3] = new wb(21021, 1494);
    Sb[6] = new wb(8064, 1236);
    Sb[9] = new wb(9, 0);
    Sb[12] = new wb(1230, 412);
    Sb[15] = new wb(224, 137);
    for (b = 0; 18 > b; b += 3)
      for (d = 0; 2 > d; ++d)
        (Sb[b + d + 1] = new nb()), rb(Sb[b + d], Sb[b], Sb[b + d + 1]);
  }
  function Ab(a) {
    a.cp = [0, 1, 2, 3, 4, 5, 6, 7];
    a.co = [0, 0, 0, 0, 0, 0, 0, 0];
  }
  function sb(a, b) {
    var d;
    for (d = 0; 8 > d; ++d) (a.cp[d] = b.cp[d]), (a.co[d] = b.co[d]);
  }
  function rb(a, b, d) {
    var c;
    for (c = 0; 8 > c; ++c) {
      d.cp[c] = a.cp[b.cp[c]];
      var r = a.co[b.cp[c]];
      var f = b.co[c];
      var h = r;
      h += 3 > r ? f : 6 - f;
      h %= 3;
      (3 <= r) ^ (3 <= f) && (h += 3);
      d.co[c] = h;
    }
  }
  function nb() {
    Ab(this);
  }
  function wb(a, b) {
    Ab(this);
    mathlib.set8Perm(this.cp, a);
    var d = b,
      c;
    var r = 0;
    for (c = 6; 0 <= c; --c) (r += this.co[c] = d % 3), (d = ~~(d / 3));
    this.co[7] = (15 - r) % 3;
  }
  function tb(a) {
    wb.call(this, z(40320), z(2187));
  }
  function Kb() {
    Kb = a;
    Wb = Xa(1937880);
    Bc = Xa(1538);
    Cc = Xa(1538);
    lc = Xa(11880);
    ld = [0, 1, 6, 3, 4, 5, 2, 7];
    Lc = Xa(160, 12);
    Mc = Xa(160, 12);
    Nc = [
      1, 1, 1, 3, 12, 60, 360, 2520, 20160, 181440, 1814400, 19958400,
      239500800,
    ];
    Oc = [0, 2, 4, 6, 1, 3, 7, 5, 8, 9, 10, 11];
  }
  function Gb(a, b, d, c, r) {
    var f = a.edgeo[r];
    a.edgeo[r] = a.edge[c];
    a.edge[c] = a.edgeo[d];
    a.edgeo[d] = a.edge[b];
    a.edge[b] = f;
  }
  function Bb(a, b) {
    var d;
    a.isStd || Db(a);
    var c = 0;
    var r = 1985229328;
    var f = 47768;
    for (d = 0; d < b; ++d) {
      var h = a.edge[d] << 2;
      c *= 12 - d;
      32 <= h
        ? ((c += (f >> (h - 32)) & 15), (f -= 4368 << (h - 32)))
        : ((c += (r >> h) & 15), (f -= 4369), (r -= 286331152 << h));
    }
    return c;
  }
  function Fb(a) {
    var b = Bb(a, 4);
    b = lc[b];
    var d = b & 7;
    b >>= 3;
    Ob(a, d);
    a = Bb(a, 10) % 20160;
    return 20160 * b + a;
  }
  function Pb(a, b) {
    a.isStd = !1;
    switch (b) {
      case 0:
        n(a.edge, 0, 4, 1, 5);
        n(a.edgeo, 0, 4, 1, 5);
        break;
      case 1:
        ub(a.edge, 0, 4, 1, 5);
        ub(a.edgeo, 0, 4, 1, 5);
        break;
      case 2:
        n(a.edge, 0, 5, 1, 4);
        n(a.edgeo, 0, 5, 1, 4);
        break;
      case 3:
        ub(a.edge, 5, 10, 6, 11);
        ub(a.edgeo, 5, 10, 6, 11);
        break;
      case 4:
        n(a.edge, 0, 11, 3, 8);
        n(a.edgeo, 0, 11, 3, 8);
        break;
      case 5:
        ub(a.edge, 0, 11, 3, 8);
        ub(a.edgeo, 0, 11, 3, 8);
        break;
      case 6:
        n(a.edge, 0, 8, 3, 11);
        n(a.edgeo, 0, 8, 3, 11);
        break;
      case 7:
        n(a.edge, 2, 7, 3, 6);
        n(a.edgeo, 2, 7, 3, 6);
        break;
      case 8:
        ub(a.edge, 2, 7, 3, 6);
        ub(a.edgeo, 2, 7, 3, 6);
        break;
      case 9:
        n(a.edge, 2, 6, 3, 7);
        n(a.edgeo, 2, 6, 3, 7);
        break;
      case 10:
        ub(a.edge, 4, 8, 7, 9);
        ub(a.edgeo, 4, 8, 7, 9);
        break;
      case 11:
        n(a.edge, 1, 9, 2, 10);
        n(a.edgeo, 1, 9, 2, 10);
        break;
      case 12:
        ub(a.edge, 1, 9, 2, 10);
        ub(a.edgeo, 1, 9, 2, 10);
        break;
      case 13:
        n(a.edge, 1, 10, 2, 9);
        n(a.edgeo, 1, 10, 2, 9);
        break;
      case 14:
        ub(a.edge, 0, 4, 1, 5);
        ub(a.edgeo, 0, 4, 1, 5);
        n(a.edge, 9, 11);
        n(a.edgeo, 8, 10);
        break;
      case 15:
        ub(a.edge, 5, 10, 6, 11);
        ub(a.edgeo, 5, 10, 6, 11);
        n(a.edge, 1, 3);
        n(a.edgeo, 0, 2);
        break;
      case 16:
        ub(a.edge, 0, 11, 3, 8);
        ub(a.edgeo, 0, 11, 3, 8);
        n(a.edge, 5, 7);
        n(a.edgeo, 4, 6);
        break;
      case 17:
        ub(a.edge, 2, 7, 3, 6);
        ub(a.edgeo, 2, 7, 3, 6);
        n(a.edge, 8, 10);
        n(a.edgeo, 9, 11);
        break;
      case 18:
        ub(a.edge, 4, 8, 7, 9);
        ub(a.edgeo, 4, 8, 7, 9);
        n(a.edge, 0, 2);
        n(a.edgeo, 1, 3);
        break;
      case 19:
        ub(a.edge, 1, 9, 2, 10),
          ub(a.edgeo, 1, 9, 2, 10),
          n(a.edge, 4, 6),
          n(a.edgeo, 5, 7);
    }
  }
  function Cb(a, b) {
    a.isStd = !1;
    switch (b) {
      case 0:
        Pb(a, 14);
        Pb(a, 17);
        break;
      case 1:
        Gb(a, 11, 5, 10, 6);
        Gb(a, 5, 10, 6, 11);
        Gb(a, 1, 2, 3, 0);
        Gb(a, 4, 9, 7, 8);
        Gb(a, 8, 4, 9, 7);
        Gb(a, 0, 1, 2, 3);
        break;
      case 2:
        Ib(a, 4, 5),
          Ib(a, 5, 4),
          Ib(a, 11, 8),
          Ib(a, 8, 11),
          Ib(a, 7, 6),
          Ib(a, 6, 7),
          Ib(a, 9, 10),
          Ib(a, 10, 9),
          Ib(a, 1, 1),
          Ib(a, 0, 0),
          Ib(a, 3, 3),
          Ib(a, 2, 2);
    }
  }
  function Ob(a, b) {
    for (; 2 <= b; ) (b -= 2), Cb(a, 1), Cb(a, 2);
    0 != b && Cb(a, 0);
  }
  function Mb(a, b) {
    var d, c;
    var r = 1985229328;
    var f = 47768;
    for (d = c = 0; 11 > d; ++d) {
      var h = Nc[11 - d];
      var n = ~~(b / h);
      b %= h;
      c ^= n;
      n <<= 2;
      32 <= n
        ? ((n -= 32),
          (a.edge[d] = (f >> n) & 15),
          (h = (1 << n) - 1),
          (f = (f & h) + ((f >> 4) & ~h)))
        : ((a.edge[d] = (r >> n) & 15),
          (h = (1 << n) - 1),
          (r = (r & h) + ((r >>> 4) & ~h) + (f << 28)),
          (f >>= 4));
    }
    0 == (c & 1)
      ? (a.edge[11] = r)
      : ((a.edge[11] = a.edge[10]), (a.edge[10] = r));
    for (d = 0; 12 > d; ++d) a.edgeo[d] = d;
    a.isStd = !0;
  }
  function Eb(a, b) {
    var d;
    for (d = 0; 12 > d; ++d) (a.edge[d] = b.edge[d]), (a.edgeo[d] = b.edgeo[d]);
    a.isStd = b.isStd;
  }
  function Jb(a, b) {
    var d;
    null == a.temp && (a.temp = Xa(12));
    for (d = 0; 12 > d; ++d)
      (a.temp[d] = d), (a.edge[d] = b.ep[Oc[d] + 12] % 12);
    var c = 1;
    for (d = 0; 12 > d; ++d)
      for (; a.edge[d] != d; ) {
        var r = a.edge[d];
        a.edge[d] = a.edge[r];
        a.edge[r] = r;
        var f = a.temp[d];
        a.temp[d] = a.temp[r];
        a.temp[r] = f;
        c ^= 1;
      }
    for (d = 0; 12 > d; ++d) a.edge[d] = a.temp[b.ep[Oc[d]] % 12];
    return c;
  }
  function Db(a) {
    var b;
    null == a.temp && (a.temp = Xa(12));
    for (b = 0; 12 > b; ++b) a.temp[a.edgeo[b]] = b;
    for (b = 0; 12 > b; ++b) (a.edge[b] = a.temp[a.edge[b]]), (a.edgeo[b] = b);
    a.isStd = !0;
  }
  function ub(a, b, d, c, r) {
    var f = a[b];
    a[b] = a[c];
    a[c] = f;
    f = a[d];
    a[d] = a[r];
    a[r] = f;
  }
  function Ib(a, b, d) {
    var c = a.edge[b];
    a.edge[b] = a.edgeo[d];
    a.edgeo[d] = c;
  }
  function Hb() {
    this.edge = Xa(12);
    this.edgeo = Xa(12);
  }
  function Xb(a, b) {
    return (a[b >> 4] >> ((b & 15) << 1)) & 3;
  }
  function Qb(a, b, d) {
    var c = Mc[b];
    var r = Lc[b];
    var f = 0;
    var h = 1985229328;
    var n = 47768;
    for (b = 0; b < d; ++b) {
      var w = c[a[r[b]]] << 2;
      f *= 12 - b;
      32 <= w
        ? ((f += (n >> (w - 32)) & 15), (n -= 4368 << (w - 32)))
        : ((f += (h >> w) & 15), (n -= 4369), (h -= 286331152 << w));
    }
    return f;
  }
  function fc(a) {
    var b = new Hb();
    var d = 0;
    var c = Xb(Wb, a);
    if (3 == c) return 10;
    for (; 0 != a; ) {
      0 == c ? (c = 2) : --c;
      var r = ~~(a / 20160);
      r = Bc[r];
      var f = a % 20160;
      Mb(b, 20160 * r + f);
      for (r = 0; 17 > r; ++r) {
        f = Qb(b.edge, r << 3, 4);
        f = lc[f];
        var h = f & 7;
        f >>= 3;
        h = Qb(b.edge, (r << 3) | h, 10) % 20160;
        f = 20160 * f + h;
        if (Xb(Wb, f) == c) {
          ++d;
          a = f;
          break;
        }
      }
    }
    return d;
  }
  function Yb(a, b, d) {
    a[b >> 4] ^= (3 ^ d) << ((b & 15) << 1);
  }
  function hc() {
    hc = a;
  }
  function $b() {
    var a;
    this.ep = Xa(24);
    for (a = 0; 24 > a; ++a) this.ep[a] = a;
  }
  function Zb(a) {
    $b.call(this);
    for (a = 0; 23 > a; ++a) {
      var b = a + z(24 - a);
      if (b != a) {
        var d = this.ep[a];
        this.ep[a] = this.ep[b];
        this.ep[b] = d;
      }
    }
  }
  function cc() {
    cc = a;
    Pc = [35, 1, 34, 2, 4, 6, 22, 5, 19];
  }
  function Ub(a, b) {
    var d = a.edge;
    var c = b.edge,
      r;
    for (r = 0; 24 > r; ++r) d.ep[r] = c.ep[r];
    d = a.center;
    c = b.center;
    for (r = 0; 24 > r; ++r) d.ct[r] = c.ct[r];
    sb(a.corner, b.corner);
    a.value = b.value;
    a.add1 = b.add1;
    a.length1 = b.length1;
    a.length2 = b.length2;
    a.length3 = b.length3;
    a.sym = b.sym;
    for (d = 0; 60 > d; ++d) a.moveBuffer[d] = b.moveBuffer[d];
    a.moveLength = b.moveLength;
    a.edgeAvail = b.edgeAvail;
    a.centerAvail = b.centerAvail;
    a.cornerAvail = b.cornerAvail;
  }
  function Rb(a) {
    for (; a.centerAvail < a.moveLength; ) {
      var b = a.center,
        d = a.moveBuffer[a.centerAvail++];
      var c = d % 3;
      switch (~~(d / 3)) {
        case 0:
          db(b.ct, 0, 1, 2, 3, c);
          break;
        case 1:
          db(b.ct, 16, 17, 18, 19, c);
          break;
        case 2:
          db(b.ct, 8, 9, 10, 11, c);
          break;
        case 3:
          db(b.ct, 4, 5, 6, 7, c);
          break;
        case 4:
          db(b.ct, 20, 21, 22, 23, c);
          break;
        case 5:
          db(b.ct, 12, 13, 14, 15, c);
          break;
        case 6:
          db(b.ct, 0, 1, 2, 3, c);
          db(b.ct, 8, 20, 12, 16, c);
          db(b.ct, 9, 21, 13, 17, c);
          break;
        case 7:
          db(b.ct, 16, 17, 18, 19, c);
          db(b.ct, 1, 15, 5, 9, c);
          db(b.ct, 2, 12, 6, 10, c);
          break;
        case 8:
          db(b.ct, 8, 9, 10, 11, c);
          db(b.ct, 2, 19, 4, 21, c);
          db(b.ct, 3, 16, 5, 22, c);
          break;
        case 9:
          db(b.ct, 4, 5, 6, 7, c);
          db(b.ct, 10, 18, 14, 22, c);
          db(b.ct, 11, 19, 15, 23, c);
          break;
        case 10:
          db(b.ct, 20, 21, 22, 23, c);
          db(b.ct, 0, 8, 4, 14, c);
          db(b.ct, 3, 11, 7, 13, c);
          break;
        case 11:
          db(b.ct, 12, 13, 14, 15, c),
            db(b.ct, 1, 20, 7, 18, c),
            db(b.ct, 0, 23, 6, 17, c);
      }
    }
    return a.center;
  }
  function dc(a) {
    for (; a.cornerAvail < a.moveLength; ) {
      var b = a.corner,
        d = a.moveBuffer[a.cornerAvail++] % 18;
      !b.temps && (b.temps = new nb());
      rb(b, Sb[d], b.temps);
      sb(b, b.temps);
    }
    return a.corner;
  }
  function Lb(a) {
    for (; a.edgeAvail < a.moveLength; ) {
      var b = a.edge,
        d = a.moveBuffer[a.edgeAvail++];
      var c = d % 3;
      switch (~~(d / 3)) {
        case 0:
          db(b.ep, 0, 1, 2, 3, c);
          db(b.ep, 12, 13, 14, 15, c);
          break;
        case 1:
          db(b.ep, 11, 15, 10, 19, c);
          db(b.ep, 23, 3, 22, 7, c);
          break;
        case 2:
          db(b.ep, 0, 11, 6, 8, c);
          db(b.ep, 12, 23, 18, 20, c);
          break;
        case 3:
          db(b.ep, 4, 5, 6, 7, c);
          db(b.ep, 16, 17, 18, 19, c);
          break;
        case 4:
          db(b.ep, 1, 20, 5, 21, c);
          db(b.ep, 13, 8, 17, 9, c);
          break;
        case 5:
          db(b.ep, 2, 9, 4, 10, c);
          db(b.ep, 14, 21, 16, 22, c);
          break;
        case 6:
          db(b.ep, 0, 1, 2, 3, c);
          db(b.ep, 12, 13, 14, 15, c);
          db(b.ep, 9, 22, 11, 20, c);
          break;
        case 7:
          db(b.ep, 11, 15, 10, 19, c);
          db(b.ep, 23, 3, 22, 7, c);
          db(b.ep, 2, 16, 6, 12, c);
          break;
        case 8:
          db(b.ep, 0, 11, 6, 8, c);
          db(b.ep, 12, 23, 18, 20, c);
          db(b.ep, 3, 19, 5, 13, c);
          break;
        case 9:
          db(b.ep, 4, 5, 6, 7, c);
          db(b.ep, 16, 17, 18, 19, c);
          db(b.ep, 8, 23, 10, 21, c);
          break;
        case 10:
          db(b.ep, 1, 20, 5, 21, c);
          db(b.ep, 13, 8, 17, 9, c);
          db(b.ep, 14, 0, 18, 4, c);
          break;
        case 11:
          db(b.ep, 2, 9, 4, 10, c),
            db(b.ep, 14, 21, 16, 22, c),
            db(b.ep, 7, 15, 1, 17, c);
      }
    }
    return a.edge;
  }
  function rd(a) {
    var b, c;
    var r = Array(a.moveLength - (a.add1 ? 2 : 0));
    for (b = c = 0; b < a.length1; ++b) r[c++] = a.moveBuffer[b];
    var f = a.sym;
    for (b = a.length1 + (a.add1 ? 2 : 0); b < a.moveLength; ++b)
      if (27 <= Vb[f][a.moveBuffer[b]]) {
        r[c++] = Vb[f][a.moveBuffer[b]] - 9;
        var h = Pc[Vb[f][a.moveBuffer[b]] - 27];
        f = ic[f][h];
      } else r[c++] = Vb[f][a.moveBuffer[b]];
    b = ic[jc[f]];
    a: {
      a = Rb(a);
      var n;
      a = new ib(a.ct);
      for (n = 0; 48 > n; ++n) {
        f = !0;
        for (h = 0; 24 > h; ++h)
          if (a.ct[h] != ~~(h / 4)) {
            f = !1;
            break;
          }
        if (f) {
          a = n;
          break a;
        }
        d(a, 0);
        1 == n % 2 && d(a, 1);
        7 == n % 8 && d(a, 2);
        15 == n % 16 && d(a, 3);
      }
      a = -1;
    }
    b = b[a];
    a = "";
    f = b;
    for (b = c - 1; 0 <= b; --b)
      (c = r[b]),
        (c = 3 * ~~(c / 3) + (2 - (c % 3))),
        27 <= Vb[f][c]
          ? ((a = a + Qc[Vb[f][c] - 9] + " "),
            (h = Pc[Vb[f][c] - 27]),
            (f = ic[f][h]))
          : (a = a + Qc[Vb[f][c]] + " ");
    return a;
  }
  function bc(a, b) {
    a.moveBuffer[a.moveLength++] = b;
  }
  function tc() {
    this.moveBuffer = Xa(60);
    this.edge = new $b();
    this.center = new Za();
    this.corner = new nb();
  }
  function uc(a) {
    tc.call(this);
    Ub(this, a);
  }
  function Tc(a) {
    this.moveBuffer = Xa(60);
    this.edge = new Zb(a);
    this.center = new zb(a);
    this.corner = new tb(a);
  }
  function Uc() {}
  function Vc() {
    Vc = a;
    var b, d;
    Qc =
      "U  ;U2 ;U' ;R  ;R2 ;R' ;F  ;F2 ;F' ;D  ;D2 ;D' ;L  ;L2 ;L' ;B  ;B2 ;B' ;Uw ;Uw2;Uw';Rw ;Rw2;Rw';Fw ;Fw2;Fw';Dw ;Dw2;Dw';Lw ;Lw2;Lw';Bw ;Bw2;Bw'".split(
        ";"
      );
    ec = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 19, 21, 22,
      23, 25, 28, 30, 31, 32, 34, 36,
    ];
    rc = [
      0, 1, 2, 4, 6, 7, 8, 9, 10, 11, 13, 15, 16, 17, 19, 22, 25, 28, 31, 34,
      36,
    ];
    md = Xa(37);
    nd = Xa(37);
    mc = Xa(37, 36);
    Dc = Xa(29, 28);
    Ec = Xa(21, 20);
    Rc = Xa(36);
    sc = Xa(28);
    nc = Xa(20);
    for (b = 0; 29 > b; ++b) md[ec[b]] = b;
    for (b = 0; 21 > b; ++b) nd[rc[b]] = b;
    for (b = 0; 36 > b; ++b) {
      for (d = 0; 36 > d; ++d)
        mc[b][d] =
          ~~(b / 3) == ~~(d / 3) || (~~(b / 3) % 3 == ~~(d / 3) % 3 && b > d);
      mc[36][b] = !1;
    }
    for (b = 0; 29 > b; ++b)
      for (d = 0; 28 > d; ++d) Dc[b][d] = mc[ec[b]][ec[d]];
    for (b = 0; 21 > b; ++b)
      for (d = 0; 20 > d; ++d) Ec[b][d] = mc[rc[b]][rc[d]];
    for (b = 0; 36 > b; ++b)
      for (Rc[b] = 36, d = b; 36 > d; ++d)
        if (!mc[b][d]) {
          Rc[b] = d - 1;
          break;
        }
    for (b = 0; 28 > b; ++b)
      for (sc[b] = 28, d = b; 28 > d; ++d)
        if (!Dc[b][d]) {
          sc[b] = d - 1;
          break;
        }
    for (b = 0; 20 > b; ++b)
      for (nc[b] = 20, d = b; 20 > d; ++d)
        if (!Ec[b][d]) {
          nc[b] = d - 1;
          break;
        }
  }
  function sd(a) {
    a.solution = "";
    var b = oa(new kb(Rb(a.c), 0));
    var d = oa(new kb(Rb(a.c), 1));
    var c = oa(new kb(Rb(a.c), 2));
    var r = Tb[~~b >> 6];
    var f = Tb[~~d >> 6];
    var h = Tb[~~c >> 6];
    a.p1SolsCnt = 0;
    a.arr2idx = 0;
    ud(a.p1sols.heap);
    for (
      a.length1 = (r < f ? r : f) < h ? (r < f ? r : f) : h;
      100 > a.length1 &&
      !(
        (h <= a.length1 && vc(a, ~~c >>> 6, c & 63, a.length1, -1, 0)) ||
        (r <= a.length1 && vc(a, ~~b >>> 6, b & 63, a.length1, -1, 0)) ||
        (f <= a.length1 && vc(a, ~~d >>> 6, d & 63, a.length1, -1, 0))
      );
      ++a.length1
    );
    h = wd(a.p1sols, T(xd, Ua([25, 30, 40]), 24, 0, 0));
    h.sort(function (a, b) {
      return a.value - b.value;
    });
    f = 9;
    do {
      c = h[0].value;
      a: for (; 100 > c; ++c)
        for (d = 0; d < h.length && !(h[d].value > c); ++d)
          if (
            !(c - h[d].length1 > f) &&
            (Ub(a.c1, h[d]),
            jb(a.ct2, Rb(a.c1), wc(Lb(a.c1).ep)),
            (b = lb(a.ct2)),
            (r = hb(a.ct2)),
            (a.length1 = h[d].length1),
            (a.length2 = c - h[d].length1),
            Wc(a, b, r, a.length2, 28, 0))
          )
            break a;
      ++f;
    } while (100 == c);
    a.arr2.sort(function (a, b) {
      return a.value - b.value;
    });
    h = 0;
    c = 13;
    do {
      f = a.arr2[0].value;
      a: for (; 100 > f; ++f)
        for (d = 0; d < Math.min(a.arr2idx, 100) && !(a.arr2[d].value > f); ++d)
          if (!(f - a.arr2[d].length1 - a.arr2[d].length2 > c)) {
            b = Jb(a.e12, Lb(a.arr2[d]));
            pb(a.ct3, Rb(a.arr2[d]), b ^ wc(dc(a.arr2[d]).cp));
            b = eb(a.ct3);
            r = Bb(a.e12, 10);
            var n = fc(Fb(a.e12));
            if (
              n <= f - a.arr2[d].length1 - a.arr2[d].length2 &&
              Xc(a, r, b, n, f - a.arr2[d].length1 - a.arr2[d].length2, 20, 0)
            ) {
              h = d;
              break a;
            }
          }
      ++c;
    } while (100 == f);
    c = new uc(a.arr2[h]);
    a.length1 = c.length1;
    a.length2 = c.length2;
    f = f - a.length1 - a.length2;
    for (d = 0; d < f; ++d) bc(c, rc[a.move3[d]]);
    a.solution = rd(c);
  }
  function td(a, c) {
    if (!od) {
      var f, h, n;
      var w = new ab();
      for (f = 0; 24 > f; ++f) w.ct[f] = f;
      var z = new ib(w.ct);
      var T = new ib(w.ct);
      var Za = new ib(w.ct);
      for (f = 0; 48 > f; ++f) {
        for (h = 0; 48 > h; ++h) {
          for (n = 0; 48 > n; ++n)
            Ta(w, z) && ((ic[f][h] = n), 0 == n && (jc[f] = h)),
              d(z, 0),
              1 == n % 2 && d(z, 1),
              7 == n % 8 && d(z, 2),
              15 == n % 16 && d(z, 3);
          d(w, 0);
          1 == h % 2 && d(w, 1);
          7 == h % 8 && d(w, 2);
          15 == h % 16 && d(w, 3);
        }
        d(w, 0);
        1 == f % 2 && d(w, 1);
        7 == f % 8 && d(w, 2);
        15 == f % 16 && d(w, 3);
      }
      for (f = 0; 48 > f; ++f)
        for (r(w, T), b(w, jc[f]), h = 0; 36 > h; ++h)
          for (r(z, w), Sa(z, h), b(z, f), n = 0; 36 > n; ++n)
            if ((r(Za, T), Sa(Za, n), Ta(Za, z))) {
              Vb[f][h] = n;
              break;
            }
      Ra(w, 0);
      for (f = 0; 48 > f; ++f)
        (Ic[jc[f]] = Wa(w)),
          d(w, 0),
          1 == f % 2 && d(w, 1),
          7 == f % 8 && d(w, 2),
          15 == f % 16 && d(w, 3);
      kc = Xa(735471);
      w = new ab();
      h = Xa(22984);
      for (T = 0; 22984 > T; T++) h[T] = 0;
      for (T = z = 0; 735471 > T; ++T)
        if (0 == (h[~~T >>> 5] & (1 << (T & 31)))) {
          Ra(w, T);
          for (f = 0; 48 > f; ++f)
            (Za = Wa(w)),
              (h[~~Za >>> 5] |= 1 << (Za & 31)),
              null != kc && (kc[Za] = (z << 6) | jc[f]),
              d(w, 0),
              1 == f % 2 && d(w, 1),
              7 == f % 8 && d(w, 2),
              15 == f % 16 && d(w, 3);
          pc[z++] = T;
        }
      w = new ab();
      z = new ab();
      for (T = 0; 15582 > T; ++T)
        for (Ra(z, pc[T]), Za = 0; 36 > Za; ++Za)
          r(w, z), Sa(w, Za), (yc[T][Za] = oa(w));
      kc = null;
      xc(Tb);
      z = Tb[0] = 0;
      for (T = 1; 15582 != T; ) {
        var Va = (h = 4 < z) ? -1 : z;
        w = h ? z : -1;
        ++z;
        for (Za = 0; 15582 > Za; ++Za)
          if (Tb[Za] == Va)
            for (n = 0; 27 > n; ++n)
              if (((f = ~~yc[Za][n] >>> 6), Tb[f] == w))
                if ((++T, h)) {
                  Tb[Za] = z;
                  break;
                } else Tb[f] = z;
      }
      T = new mb();
      for (w = 0; 70 > w; ++w)
        for (z = 0; 28 > z; ++z) qb(T, w), gb(T, ec[z]), (zc[w][z] = hb(T));
      for (w = 0; 70 > w; ++w)
        for (qb(T, w), z = 0; 16 > z; ++z)
          (hd[w][z] = hb(T)),
            $a(T, 0),
            1 == z % 2 && $a(T, 1),
            7 == z % 8 && $a(T, 2);
      for (w = 0; 6435 > w; ++w)
        for (ob(T, w), z = 0; 16 > z; ++z)
          (id[w][z] = lb(T) & 65535),
            $a(T, 0),
            1 == z % 2 && $a(T, 1),
            7 == z % 8 && $a(T, 2);
      for (w = 0; 6435 > w; ++w)
        for (z = 0; 28 > z; ++z)
          ob(T, w), gb(T, ec[z]), (Ac[w][z] = lb(T) & 65535);
      xc(Nb);
      Za = Nb[0] = Nb[18] = Nb[28] = Nb[46] = Nb[54] = Nb[56] = 0;
      for (f = 6; 450450 != f; ) {
        Va = (n = 6 < Za) ? -1 : Za;
        var Ua = n ? Za : -1;
        ++Za;
        for (w = 0; 450450 > w; ++w)
          if (Nb[w] == Va)
            for (T = ~~(w / 70), h = w % 70, z = 0; 23 > z; ++z) {
              var Ya = Ac[T][z];
              var cb = zc[h][z];
              Ya = 70 * Ya + cb;
              if (Nb[Ya] == Ua)
                if ((++f, n)) {
                  Nb[w] = Za;
                  break;
                } else Nb[Ya] = Za;
            }
      }
      for (w = 0; 12 > w; ++w) Kc[Jc[w]] = w;
      T = new fb();
      for (w = 0; 29400 > w; ++w)
        for (z = 0; 20 > z; ++z) {
          h = T;
          n = w;
          h.parity = n & 1;
          n >>>= 1;
          Va = Jc[n % 12];
          n = ~~(n / 12);
          Za = 4;
          for (f = 7; 0 <= f; --f)
            (h.rl[f] = 0),
              Va >= Qa[f][Za] && ((Va -= Qa[f][Za--]), (h.rl[f] = 1));
          Va = n % 35;
          n = ~~(n / 35);
          Za = 4;
          h.fb[7] = 0;
          for (f = 6; 0 <= f; --f)
            Va >= Qa[f][Za]
              ? ((Va -= Qa[f][Za--]), (h.fb[f] = 1))
              : (h.fb[f] = 0);
          Za = 4;
          h.ud[7] = 0;
          for (f = 6; 0 <= f; --f)
            n >= Qa[f][Za]
              ? ((n -= Qa[f][Za--]), (h.ud[f] = 1))
              : (h.ud[f] = 0);
          Za = T;
          f = z;
          Za.parity ^= kd[f];
          switch (f) {
            case 0:
            case 1:
            case 2:
              db(Za.ud, 0, 1, 2, 3, f % 3);
              break;
            case 3:
              db(Za.rl, 0, 1, 2, 3, 1);
              break;
            case 4:
            case 5:
            case 6:
              db(Za.fb, 0, 1, 2, 3, (f - 1) % 3);
              break;
            case 7:
            case 8:
            case 9:
              db(Za.ud, 4, 5, 6, 7, (f - 1) % 3);
              break;
            case 10:
              db(Za.rl, 4, 5, 6, 7, 1);
              break;
            case 11:
            case 12:
            case 13:
              db(Za.fb, 4, 5, 6, 7, (f + 1) % 3);
              break;
            case 14:
              db(Za.ud, 0, 1, 2, 3, 1);
              db(Za.rl, 0, 5, 4, 1, 1);
              db(Za.fb, 0, 5, 4, 1, 1);
              break;
            case 15:
              db(Za.rl, 0, 1, 2, 3, 1);
              db(Za.fb, 1, 4, 7, 2, 1);
              db(Za.ud, 1, 6, 5, 2, 1);
              break;
            case 16:
              db(Za.fb, 0, 1, 2, 3, 1);
              db(Za.ud, 3, 2, 5, 4, 1);
              db(Za.rl, 0, 3, 6, 5, 1);
              break;
            case 17:
              db(Za.ud, 4, 5, 6, 7, 1);
              db(Za.rl, 3, 2, 7, 6, 1);
              db(Za.fb, 3, 2, 7, 6, 1);
              break;
            case 18:
              db(Za.rl, 4, 5, 6, 7, 1);
              db(Za.fb, 0, 3, 6, 5, 1);
              db(Za.ud, 0, 3, 4, 7, 1);
              break;
            case 19:
              db(Za.fb, 4, 5, 6, 7, 1),
                db(Za.ud, 0, 7, 6, 1, 1),
                db(Za.rl, 1, 4, 7, 2, 1);
          }
          qc[w][z] = eb(T) & 65535;
        }
      xc(ac);
      T = ac[0] = 0;
      for (Za = 1; 29400 != Za; ) {
        for (w = 0; 29400 > w; ++w)
          if (ac[w] == T)
            for (z = 0; 17 > z; ++z)
              -1 == ac[qc[w][z]] && ((ac[qc[w][z]] = T + 1), ++Za);
        ++T;
      }
      w = new Hb();
      for (T = 0; 20 > T; ++T)
        for (Za = 0; 8 > Za; ++Za) {
          Mb(w, 0);
          Pb(w, T);
          Ob(w, Za);
          for (z = 0; 12 > z; ++z) Lc[(T << 3) | Za][z] = w.edge[z];
          Db(w);
          for (z = 0; 12 > z; ++z) Mc[(T << 3) | Za][z] = w.temp[z];
        }
      z = new Hb();
      h = Xa(1485);
      for (T = 0; 1485 > T; T++) h[T] = 0;
      for (T = w = 0; 11880 > T; ++T)
        if (0 == (h[~~T >>> 3] & (1 << (T & 7)))) {
          Mb(z, T * Nc[8]);
          for (f = 0; 8 > f; ++f)
            (Za = Bb(z, 4)),
              Za == T && (Cc[w] = (Cc[w] | (1 << f)) & 65535),
              (h[~~Za >> 3] |= 1 << (Za & 7)),
              (lc[Za] = (w << 3) | ld[f]),
              Cb(z, 0),
              1 == f % 2 && (Cb(z, 1), Cb(z, 2));
          Bc[w++] = T;
        }
      var zb;
      T = new Hb();
      Za = new Hb();
      h = new Hb();
      xc(Wb);
      z = 0;
      Fc = 1;
      for (Yb(Wb, 0, 0); 31006080 != Fc; ) {
        n = 9 < z;
        Va = z % 3;
        w = (z + 1) % 3;
        f = n ? 3 : Va;
        Va = n ? Va : 3;
        if (9 <= z) break;
        for (cb = 0; 31006080 > cb; cb += 16) {
          var kb = Wb[~~cb >> 4];
          if (n || -1 != kb)
            for (Ya = cb, Ua = cb + 16; Ya < Ua; ++Ya, kb >>= 2)
              if ((kb & 3) == f) {
                var bb = ~~(Ya / 20160);
                bb = Bc[bb];
                var jb = Ya % 20160;
                Mb(T, 20160 * bb + jb);
                for (bb = 0; 17 > bb; ++bb) {
                  jb = Qb(T.edge, bb << 3, 4);
                  jb = lc[jb];
                  var pb = jb & 7;
                  jb >>= 3;
                  var sb = Qb(T.edge, (bb << 3) | pb, 10) % 20160;
                  sb = 20160 * jb + sb;
                  if (Xb(Wb, sb) == Va) {
                    Yb(Wb, n ? Ya : sb, w);
                    ++Fc;
                    if (n) break;
                    sb = Cc[jb];
                    if (1 != sb)
                      for (
                        Eb(Za, T), Pb(Za, bb), Ob(Za, pb), zb = 1;
                        0 != (sb = (~~sb >> 1) & 65535);
                        ++zb
                      )
                        1 == (sb & 1) &&
                          (Eb(h, Za),
                          Ob(h, zb),
                          (pb = 20160 * jb + (Bb(h, 10) % 20160)),
                          Xb(Wb, pb) == Va && (Yb(Wb, pb, w), ++Fc));
                  }
                }
              }
        }
        ++z;
      }
      od = !0;
    }
    a.c = new Tc(c);
    sd(a);
    return a.solution;
  }
  function vc(a, b, d, c, f, r) {
    var h, n, w;
    if (0 == b) {
      if ((b = 0 == c)) {
        Ub(a.c1, a.c);
        for (b = 0; b < a.length1; ++b) bc(a.c1, a.move1[b]);
        switch (Ic[d]) {
          case 0:
            bc(a.c1, 24);
            bc(a.c1, 35);
            a.move1[a.length1] = 24;
            a.move1[a.length1 + 1] = 35;
            a.add1 = !0;
            d = 19;
            break;
          case 12869:
            bc(a.c1, 18);
            bc(a.c1, 29);
            a.move1[a.length1] = 18;
            a.move1[a.length1 + 1] = 29;
            a.add1 = !0;
            d = 34;
            break;
          case 735470:
            (a.add1 = !1), (d = 0);
        }
        jb(a.ct2, Rb(a.c1), wc(Lb(a.c1).ep));
        b = lb(a.ct2);
        c = hb(a.ct2);
        a.c1.value = Nb[70 * b + c] + a.length1;
        a.c1.length1 = a.length1;
        a.c1.add1 = a.add1;
        a.c1.sym = d;
        ++a.p1SolsCnt;
        if (500 > a.p1sols.heap.size) var z = new uc(a.c1);
        else {
          d = a.p1sols;
          if (0 == d.heap.size) z = null;
          else {
            b = d.heap.array[0];
            c = d.heap;
            f = d.heap.size - 1;
            r = c.array[f];
            c.array.splice(f, 1);
            --c.size;
            if (0 < d.heap.size) {
              gc(d.heap, 0, r);
              c = 0;
              f = d.heap.size;
              for (w = d.heap.array[c]; 2 * c + 1 < f; ) {
                r =
                  ((h = 2 * c + 1),
                  (z = h + 1),
                  (n = h),
                  z < f &&
                    0 > d.heap.array[h].value - d.heap.array[z].value &&
                    (n = z),
                  n);
                if (0 > d.heap.array[r].value - w.value) break;
                gc(d.heap, c, d.heap.array[r]);
                c = r;
              }
              gc(d.heap, c, w);
            }
            z = b;
          }
          z.value > a.c1.value && Ub(z, a.c1);
        }
        h = a.p1sols;
        b: {
          n = h.heap.size;
          d = h.heap;
          b = d.size++;
          for (d.array[b] = z; 0 < n; ) {
            d = n;
            n = ~~((n - 1) / 2);
            if (0 >= z.value - h.heap.array[n].value) {
              gc(h.heap, d, z);
              break b;
            }
            gc(h.heap, d, h.heap.array[n]);
          }
          gc(h.heap, n, z);
        }
        b = 1e4 == a.p1SolsCnt;
      }
      return b;
    }
    for (h = 0; 27 > h; h += 3)
      if (h != f && h != f - 9 && h != f - 18)
        for (w = 0; 3 > w; ++w) {
          n = h + w;
          z = yc[b][Vb[d][n]];
          var Ra = Tb[~~z >>> 6];
          if (Ra >= c) {
            if (Ra > c) break;
          } else if (
            ((Ra = ic[d][z & 63]),
            (z >>>= 6),
            (a.move1[r] = n),
            vc(a, z, Ra, c - 1, h, r + 1))
          )
            return !0;
        }
    return !1;
  }
  function Wc(a, b, d, c, f, r) {
    var h;
    if (0 == b && 0 == Nb[d]) {
      if ((b = 0 == c)) {
        Ub(a.c2, a.c1);
        for (b = 0; b < a.length2; ++b) bc(a.c2, a.move2[b]);
        b = Lb(a.c2);
        d = 0;
        f = !1;
        for (c = 0; 12 > c; ++c) (d |= 1 << b.ep[c]), (f = f != 12 <= b.ep[c]);
        0 != (d & (~~d >> 12)) || f
          ? (b = !1)
          : ((b = Jb(a.e12, Lb(a.c2))),
            pb(a.ct3, Rb(a.c2), b ^ wc(dc(a.c2).cp)),
            (b = eb(a.ct3)),
            Bb(a.e12, 10),
            (d = fc(Fb(a.e12))),
            a.arr2[a.arr2idx]
              ? Ub(a.arr2[a.arr2idx], a.c2)
              : (a.arr2[a.arr2idx] = new uc(a.c2)),
            (a.arr2[a.arr2idx].value =
              a.length1 + a.length2 + Math.max(d, ac[b])),
            (a.arr2[a.arr2idx].length2 = a.length2),
            ++a.arr2idx,
            (b = a.arr2idx == a.arr2.length));
      }
      return b;
    }
    for (h = 0; 23 > h; ++h)
      if (Dc[f][h]) h = sc[h];
      else {
        var n = Ac[b][h];
        var w = zc[d][h];
        var z = Nb[70 * n + w];
        if (z >= c) z > c && (h = sc[h]);
        else if (((a.move2[r] = ec[h]), Wc(a, n, w, c - 1, h, r + 1)))
          return !0;
      }
    return !1;
  }
  function Xc(a, b, d, c, f, r, h) {
    var n;
    if (0 == f) return 0 == b && 0 == d;
    Mb(a.tempe[h], b);
    for (n = 0; 17 > n; ++n)
      if (Ec[r][n]) n = nc[n];
      else {
        b = qc[d][n];
        var w = ac[b];
        if (w >= f) w > f && 14 > n && (n = nc[n]);
        else {
          w = Qb(a.tempe[h].edge, n << 3, 10);
          var z = ~~(w / 20160);
          z = lc[z];
          var Ra = z & 7;
          z >>= 3;
          var Sa = Qb(a.tempe[h].edge, (n << 3) | Ra, 10) % 20160;
          Ra = c;
          z = Xb(Wb, 20160 * z + Sa);
          z = 3 == z ? 10 : (((1227133513 << z) >> Ra) & 3) + Ra - 1;
          if (z >= f) z > f && 14 > n && (n = nc[n]);
          else if (Xc(a, w, b, z, f - 1, n, h + 1)) return (a.move3[h] = n), !0;
        }
      }
    return !1;
  }
  function Yc() {
    var a;
    this.p1sols = new ed(new Uc());
    this.move1 = Xa(15);
    this.move2 = Xa(20);
    this.move3 = Xa(20);
    this.c1 = new tc();
    this.c2 = new tc();
    this.ct2 = new mb();
    this.ct3 = new fb();
    this.e12 = new Hb();
    this.tempe = Xa(20);
    this.arr2 = Xa(100);
    for (a = 0; 20 > a; ++a) this.tempe[a] = new Hb();
  }
  function Zc() {
    Zc = a;
  }
  function wc(a) {
    var b, d, c;
    var f = (c = 0);
    for (d = a.length; f < d; ++f)
      for (b = f; b < d; ++b) a[f] > a[b] && (c ^= 1);
    return c;
  }
  function db(a, b, d, c, f, r) {
    switch (r) {
      case 0:
        r = a[f];
        a[f] = a[c];
        a[c] = a[d];
        a[d] = a[b];
        a[b] = r;
        break;
      case 1:
        r = a[b];
        a[b] = a[c];
        a[c] = r;
        r = a[d];
        a[d] = a[f];
        a[f] = r;
        break;
      case 2:
        (r = a[b]), (a[b] = a[d]), (a[d] = a[c]), (a[c] = a[f]), (a[f] = r);
    }
  }
  function $c() {}
  function ad(a, b, d, c) {
    var f = new $c();
    f.typeName = a + b;
    cd(0 != d ? -d : 0) && dd(0 != d ? -d : 0, f);
    f.modifiers = 4;
    f.superclass = Sc;
    f.componentType = c;
    return f;
  }
  function bd(a, b, d, c) {
    var f = new $c();
    f.typeName = a + b;
    cd(d) && dd(d, f);
    f.superclass = c;
    return f;
  }
  function cd(a) {
    return "number" == typeof a && 0 < a;
  }
  function dd(a, b) {
    b.seedId = a;
    if (2 == a) var d = String.prototype;
    else if (0 < a)
      if ((d = oc[b.seedId])) d = d.prototype;
      else {
        d = oc[a] = function () {};
        d.___clazz$ = b;
        return;
      }
    else return;
    d.___clazz$ = b;
  }
  function ud(a) {
    a.array = T(pd, Ua([30, 40]), 0, 0, 0);
    a.size = 0;
  }
  function gc(a, b, d) {
    var c = a.array[b];
    a.array[b] = d;
    return c;
  }
  function vd() {
    this.array = T(pd, Ua([30, 40]), 0, 0, 0);
    this.array.length = 500;
  }
  function xc(a) {
    var b = a.length,
      d;
    for (d = 0; d < b; ++d) a[d] = -1;
  }
  function wd(a, b) {
    var d = a.heap,
      c = b;
    if (c.length < d.size) {
      var f = w(0, d.size);
      h(c.___clazz$, c.castableTypeMap$, c.queryId$, f);
      c = f;
    }
    for (f = 0; f < d.size; ++f) c[f] = d.array[f];
    c.length > d.size && (c[d.size] = null);
    return c;
  }
  function ed(a) {
    this.heap = new vd();
    this.cmp = a;
  }
  function fd() {
    fd = a;
    Vc();
    Zc();
    Ya();
    bb();
    cb();
    Kb();
    vb();
    xb();
    hc();
    cc();
    qd = new Yc();
  }
  function gd() {
    fd();
    return (scramble_333.getRandomScramble() + td(qd, Math)).replace(
      /\s+/g,
      " "
    );
  }
  var yb,
    oc = {};
  c(1, -1, {});
  yb.value = null;
  c(73, 1, {}, f);
  yb.queryId$ = 0;
  var Gc, Hc;
  c(153, 1, Ua([21]), ab, kb, ib);
  var Tb,
    yc,
    Ic,
    kc = null,
    pc,
    jc,
    Vb,
    ic;
  c(154, 1, {}, mb);
  yb.parity = 0;
  var Ac, Nb, id, jd, zc, hd;
  c(155, 1, {}, fb);
  yb.parity = 0;
  var qc, kd, ac, Jc, Kc;
  c(156, 1, {}, Za, zb);
  c(157, 1, Ua([22]), nb, wb, tb);
  yb.temps = null;
  var Sb;
  c(158, 1, Ua([23]), Hb);
  yb.isStd = !0;
  yb.temp = null;
  var Oc,
    Fc = 0,
    Wb,
    Nc,
    Lc,
    Mc,
    lc,
    Bc,
    ld,
    Cc;
  c(159, 1, {}, $b, Zb);
  c(160, 1, Ua([24, 34]), tc, uc, Tc);
  yb.compareTo$ = function (a) {
    return this.value - a.value;
  };
  yb.add1 = !1;
  yb.center = null;
  yb.centerAvail = 0;
  yb.corner = null;
  yb.cornerAvail = 0;
  yb.edge = null;
  yb.edgeAvail = 0;
  yb.length1 = 0;
  yb.length2 = 0;
  yb.length3 = 0;
  yb.moveLength = 0;
  yb.sym = 0;
  yb.value = 0;
  var Pc;
  c(161, 1, {}, Uc);
  yb.compare = function (a, b) {
    return b.value - a.value;
  };
  var mc, Dc, Ec, ec, Qc, rc, Rc, sc, nc, md, nd;
  c(163, 1, Ua([26]), Yc);
  yb.add1 = !1;
  yb.arr2idx = 0;
  yb.c = null;
  yb.length1 = 0;
  yb.length2 = 0;
  yb.p1SolsCnt = 0;
  yb.solution = "";
  var od = !1;
  yb.val$outerIter = null;
  yb.size = 0;
  c(239, 1, {}, ed);
  yb.cmp = null;
  yb.heap = null;
  var Sc = bd("java.lang.", "Object", 1, null),
    pd = ad("[Ljava.lang.", "Object;", 356, Sc),
    yd = bd("cs.threephase.", "FullCube", 160, Sc),
    xd = ad("[Lcs.threephase.", "FullCube;", 381, yd),
    qd;
  scrMgr.reg("444wca", gd);
  return { getRandomScramble: gd };
})(mathlib.rn, mathlib.Cnk, mathlib.circle);
(function (z, Qa, n, Xa) {
  function c(a, b) {
    b <<= 2;
    if (24 < b) {
      b = 48 - b;
      var d = a.ul;
      a.ul = ((a.ul >> b) | (a.ur << (24 - b))) & 16777215;
      a.ur = ((a.ur >> b) | (d << (24 - b))) & 16777215;
    } else
      0 < b
        ? ((d = a.ul),
          (a.ul = ((a.ul << b) | (a.ur >> (24 - b))) & 16777215),
          (a.ur = ((a.ur << b) | (d >> (24 - b))) & 16777215))
        : 0 == b
        ? ((d = a.ur), (a.ur = a.dl), (a.dl = d), (a.ml = 1 - a.ml))
        : -24 <= b
        ? ((b = -b),
          (d = a.dl),
          (a.dl = ((a.dl << b) | (a.dr >> (24 - b))) & 16777215),
          (a.dr = ((a.dr << b) | (d >> (24 - b))) & 16777215))
        : -24 > b &&
          ((b = 48 + b),
          (d = a.dl),
          (a.dl = ((a.dl >> b) | (a.dr << (24 - b))) & 16777215),
          (a.dr = ((a.dr >> b) | (d << (24 - b))) & 16777215));
  }
  function Ua(a, b) {
    var d;
    6 > b
      ? (d = a.ul >> ((5 - b) << 2))
      : 12 > b
      ? (d = a.ur >> ((11 - b) << 2))
      : 18 > b
      ? (d = a.dl >> ((17 - b) << 2))
      : (d = a.dr >> ((23 - b) << 2));
    return d & 15;
  }
  function a(a, b, d) {
    6 > b
      ? ((a.ul &= ~(15 << ((5 - b) << 2))), (a.ul |= d << ((5 - b) << 2)))
      : 12 > b
      ? ((a.ur &= ~(15 << ((11 - b) << 2))), (a.ur |= d << ((11 - b) << 2)))
      : 18 > b
      ? ((a.dl &= ~(15 << ((17 - b) << 2))), (a.dl |= d << ((17 - b) << 2)))
      : ((a.dr &= ~(15 << ((23 - b) << 2))), (a.dr |= d << ((23 - b) << 2)));
  }
  function f() {
    this.arr = [];
    this.prm = [];
  }
  function w(b) {
    var d;
    void 0 === b && (b = Xa(3678));
    var c = new f();
    var r = hb[b];
    var h = 324508639;
    var n = 38177486;
    var w = (d = 8);
    for (b = 0; 24 > b; b++)
      if (0 == ((r >> b) & 1)) {
        var z = Xa(d) << 2;
        a(c, 23 - b, (n >> z) & 15);
        z = (1 << z) - 1;
        n = (n & z) + ((n >> 4) & ~z);
        --d;
      } else
        (z = Xa(w) << 2),
          a(c, 23 - b, (h >> z) & 15),
          a(c, 22 - b, (h >> z) & 15),
          (z = (1 << z) - 1),
          (h = (h & z) + ((h >> 4) & ~z)),
          --w,
          ++b;
    c.ml = Xa(2);
    return c;
  }
  function T(a, b, d, f, r, n) {
    if (0 == d && 4 > f) {
      if ((b = 0 == f))
        a: {
          b = a.Search_d;
          f = a.Search_c;
          b.ul = f.ul;
          b.ur = f.ur;
          b.dl = f.dl;
          b.dr = f.dr;
          b.ml = f.ml;
          for (b = 0; b < a.Search_length1; ++b)
            c(a.Search_d, a.Search_move[b]);
          b = a.Search_d;
          f = a.Search_sq;
          for (r = 0; 8 > r; ++r) b.prm[r] = Ua(b, 3 * r + 1) >> 1;
          f.cornperm = Qa(b.prm);
          f.topEdgeFirst = Ua(b, 0) == Ua(b, 1);
          r = f.topEdgeFirst ? 2 : 0;
          for (n = 0; 4 > n; r += 3, ++n) b.prm[n] = Ua(b, r) >> 1;
          f.botEdgeFirst = Ua(b, 12) == Ua(b, 13);
          for (r = f.botEdgeFirst ? 14 : 12; 8 > n; r += 3, ++n)
            b.prm[n] = Ua(b, r) >> 1;
          f.edgeperm = Qa(b.prm);
          f.ml = b.ml;
          r = a.Search_sq.edgeperm;
          f = a.Search_sq.cornperm;
          n = a.Search_sq.ml;
          for (
            b = Math.max(
              mb[(a.Search_sq.edgeperm << 1) | n],
              mb[(a.Search_sq.cornperm << 1) | n]
            );
            b < a.Search_maxlen2;
            ++b
          )
            if (
              h(
                a,
                r,
                f,
                a.Search_sq.topEdgeFirst,
                a.Search_sq.botEdgeFirst,
                n,
                b,
                a.Search_length1,
                0
              )
            ) {
              for (f = 0; f < b; ++f)
                c(a.Search_d, a.Search_move[a.Search_length1 + f]);
              f = a;
              r = "";
              d = n = 0;
              for (b = b + a.Search_length1 - 1; 0 <= b; b--) {
                var w = a.Search_move[b];
                0 < w
                  ? ((w = 12 - w), (n = 6 < w ? w - 12 : w))
                  : 0 > w
                  ? ((w = 12 + w), (d = 6 < w ? w - 12 : w))
                  : ((w = "/"),
                    b == a.Search_length1 - 1 && (w = "`/`"),
                    (r =
                      0 == n && 0 == d
                        ? r + w
                        : r + (" (" + n + "," + d + ")" + w)),
                    (n = d = 0));
              }
              if (0 != n || 0 != d) r += " (" + n + "," + d + ") ";
              f.Search_sol_string = r;
              b = !0;
              break a;
            }
          b = !1;
        }
      return b;
    }
    if (0 != n) {
      var z = jb[b];
      w = gb[z];
      if (w < f && ((a.Search_move[r] = 0), T(a, z, w, f - 1, r + 1, 0)))
        return !0;
    }
    z = b;
    if (0 >= n)
      for (d = 0; ; ) {
        d += $a[z];
        z = d >> 4;
        d &= 15;
        if (12 <= d) break;
        w = gb[z];
        if (w > f) break;
        else if (w < f && ((a.Search_move[r] = d), T(a, z, w, f - 1, r + 1, 1)))
          return !0;
      }
    z = b;
    if (1 >= n)
      for (d = 0; ; ) {
        d += lb[z];
        z = d >> 4;
        d &= 15;
        if (6 <= d) break;
        w = gb[z];
        if (w > f) break;
        else if (
          w < f &&
          ((a.Search_move[r] = -d), T(a, z, w, f - 1, r + 1, 2))
        )
          return !0;
      }
    return !1;
  }
  function h(a, b, d, c, f, r, n, w, z) {
    var Ra, Sa;
    if (0 == n && !c && f) return !0;
    if (0 != z && c == f) {
      var oa = eb[b];
      var T = eb[d];
      if (
        mb[(oa << 1) | (1 - r)] < n &&
        mb[(T << 1) | (1 - r)] < n &&
        ((a.Search_move[w] = 0), h(a, oa, T, c, f, 1 - r, n - 1, w + 1, 0))
      )
        return !0;
    }
    if (0 >= z) {
      oa = (Sa = !c) ? cb[b] : b;
      T = Sa ? d : cb[d];
      var Ta = Sa ? 1 : 2;
      var Wa = mb[(oa << 1) | r];
      for (Ra = mb[(T << 1) | r]; 12 > Ta && Wa <= n && Wa <= n; ) {
        if (
          Wa < n &&
          Ra < n &&
          ((a.Search_move[w] = Ta), h(a, oa, T, Sa, f, r, n - 1, w + 1, 1))
        )
          return !0;
        (Sa = !Sa)
          ? ((oa = cb[oa]), (Wa = mb[(oa << 1) | r]), (Ta += 1))
          : ((T = cb[T]), (Ra = mb[(T << 1) | r]), (Ta += 2));
      }
    }
    if (1 >= z)
      for (
        oa = (f = !f) ? qb[b] : b,
          T = f ? d : qb[d],
          Ta = f ? 1 : 2,
          Wa = mb[(oa << 1) | r],
          Ra = mb[(T << 1) | r];
        Ta < (6 < n ? 6 : 12) && Wa <= n && Wa <= n;

      ) {
        if (
          Wa < n &&
          Ra < n &&
          ((a.Search_move[w] = -Ta), h(a, oa, T, c, f, r, n - 1, w + 1, 2))
        )
          return !0;
        (f = !f)
          ? ((oa = qb[oa]), (Wa = mb[(oa << 1) | r]), (Ta += 1))
          : ((T = qb[T]), (Ra = mb[(T << 1) | r]), (Ta += 2));
      }
    return !1;
  }
  function Va(a, b) {
    a.Search_c = b;
    var c = b.ur & 1118481;
    c |= c >> 3;
    c |= c >> 6;
    c = (c & 15) | ((c >> 12) & 48);
    var f = b.ul & 1118481;
    f |= f >> 3;
    f |= f >> 6;
    f = (f & 15) | ((f >> 12) & 48);
    var r = b.dr & 1118481;
    r |= r >> 3;
    r |= r >> 6;
    r = (r & 15) | ((r >> 12) & 48);
    var h = b.dl & 1118481;
    h |= h >> 3;
    h |= h >> 6;
    h = (h & 15) | ((h >> 12) & 48);
    var n, w;
    var z = 0;
    b.arr[0] = Ua(b, 0);
    for (n = 1; 24 > n; ++n) Ua(b, n) != b.arr[z] && (b.arr[++z] = Ua(b, n));
    for (z = w = 0; 16 > z; ++z)
      for (n = z + 1; 16 > n; ++n) b.arr[z] > b.arr[n] && (w ^= 1);
    h = d((w << 24) | (f << 18) | (c << 12) | (h << 6) | r);
    for (
      a.Search_length1 = gb[h];
      100 > a.Search_length1 &&
      ((a.Search_maxlen2 = Math.min(32 - a.Search_length1, 17)),
      !T(a, h, gb[h], a.Search_length1, 0, -1));
      ++a.Search_length1
    );
    return a.Search_sol_string;
  }
  function Ya() {
    this.Search_move = [];
    this.Search_d = new f();
    this.Search_sq = new Ra();
  }
  function Ta() {
    Ta = $.noop;
    ob = [0, 3, 6, 12, 15, 24, 27, 30, 48, 51, 54, 60, 63];
    hb = [];
    gb = [];
    $a = [];
    lb = [];
    jb = [];
    var a, b;
    for (b = a = 0; 28561 > b; ++b) {
      var c = ob[b % 13];
      var f = ob[~~(b / 13) % 13];
      var h = ob[~~(~~(b / 13) / 13) % 13];
      var n = ob[~~(~~(~~(b / 13) / 13) / 13)];
      f = (n << 18) | (h << 12) | (f << 6) | c;
      16 == r(f) && (hb[a++] = f);
    }
    a = new Sa();
    for (b = 0; 7356 > b; ++b) {
      oa(a, b);
      f = $a;
      c = b;
      var w = a;
      n = h = 0;
      do
        0 == (w.top & 2048)
          ? ((h += 1), (w.top <<= 1))
          : ((h += 2), (w.top = (w.top << 2) ^ 12291)),
          (n = 1 - n);
      while (0 != (r(w.top & 63) & 1));
      0 == (r(w.top) & 2) && (w.Shape_parity ^= n);
      f[c] = h;
      $a[b] |= Wa(a) << 4;
      oa(a, b);
      f = lb;
      c = b;
      w = a;
      n = h = 0;
      do
        0 == (w.bottom & 2048)
          ? ((h += 1), (w.bottom <<= 1))
          : ((h += 2), (w.bottom = (w.bottom << 2) ^ 12291)),
          (n = 1 - n);
      while (0 != (r(w.bottom & 63) & 1));
      0 == (r(w.bottom) & 2) && (w.Shape_parity ^= n);
      f[c] = h;
      lb[b] |= Wa(a) << 4;
      oa(a, b);
      n = a.top & 63;
      f = r(n);
      c = r(a.bottom & 4032);
      a.Shape_parity ^= 1 & ((f & c) >> 1);
      a.top = (a.top & 4032) | ((a.bottom >> 6) & 63);
      a.bottom = (a.bottom & 63) | (n << 6);
      jb[b] = Wa(a);
    }
    for (b = 0; 7536 > b; ++b) gb[b] = -1;
    gb[d(14378715)] = 0;
    gb[d(31157686)] = 0;
    gb[d(23967451)] = 0;
    gb[d(7191990)] = 0;
    f = 4;
    c = 0;
    for (a = -1; f != c; )
      for (c = f, ++a, b = 0; 7536 > b; ++b)
        if (gb[b] == a) {
          h = 0;
          n = b;
          do
            (n = $a[n]),
              (h += n & 15),
              (n >>= 4),
              -1 == gb[n] && (++f, (gb[n] = a + 1));
          while (12 != h);
          h = 0;
          n = b;
          do
            (n = lb[n]),
              (h += n & 15),
              (n >>= 4),
              -1 == gb[n] && (++f, (gb[n] = a + 1));
          while (12 != h);
          n = jb[b];
          -1 == gb[n] && (++f, (gb[n] = a + 1));
        }
  }
  function Wa(a) {
    return (ab(hb, (a.top << 12) | a.bottom) << 1) | a.Shape_parity;
  }
  function oa(a, b) {
    a.Shape_parity = b & 1;
    a.top = hb[b >> 1];
    a.bottom = a.top & 4095;
    a.top >>= 12;
  }
  function Sa() {}
  function d(a) {
    return (ab(hb, a & 16777215) << 1) | (a >> 24);
  }
  function b() {
    b = $.noop;
    mb = [];
    eb = [];
    cb = [];
    qb = [];
    var a, d, c;
    var f = [];
    for (d = 0; 40320 > d; ++d)
      z(f, d),
        n(f, 2, 4)(f, 3, 5),
        (eb[d] = Qa(f)),
        z(f, d),
        n(f, 0, 3, 2, 1),
        (cb[d] = Qa(f)),
        z(f, d),
        n(f, 4, 7, 6, 5),
        (qb[d] = Qa(f));
    for (d = 0; 80640 > d; ++d) mb[d] = -1;
    var r = (mb[0] = 0);
    for (a = 1; 80640 > a; ) {
      var h = (c = 11 <= r) ? -1 : r;
      f = c ? r : -1;
      ++r;
      d = 0;
      a: for (; 80640 > d; ++d)
        if (mb[d] == h) {
          var w = d >> 1;
          var Ra = d & 1;
          var oa = (eb[w] << 1) | (1 - Ra);
          if (mb[oa] == f && (++a, (mb[c ? d : oa] = r), c)) continue a;
          oa = w;
          for (w = 0; 4 > w; ++w)
            if (
              ((oa = cb[oa]),
              mb[(oa << 1) | Ra] == f &&
                (++a, (mb[c ? d : (oa << 1) | Ra] = r), c))
            )
              continue a;
          for (w = 0; 4 > w; ++w)
            if (
              ((oa = qb[oa]),
              mb[(oa << 1) | Ra] == f &&
                (++a, (mb[c ? d : (oa << 1) | Ra] = r), c))
            )
              continue a;
        }
    }
  }
  function Ra() {}
  function r(a) {
    a -= (a >> 1) & 1431655765;
    a = ((a >> 2) & 858993459) + (a & 858993459);
    a = ((a >> 4) + a) & 252645135;
    a += a >> 8;
    return (a + (a >> 16)) & 63;
  }
  function ab(a, b) {
    var d;
    var c = 0;
    for (d = a.length - 1; c <= d; ) {
      var f = c + ((d - c) >> 1);
      var r = a[f];
      if (r < b) c = f + 1;
      else if (r > b) d = f - 1;
      else return f;
    }
    return -c - 1;
  }
  function kb() {
    kb = $.noop;
    for (var a = new Sa(), b = 0; b < pb.length; b++) {
      for (var d = [pb[b]], c = 0; c < d.length; c++) {
        var f = d[c];
        do (f = $a[f << 1] >> 5), -1 == d.indexOf(f) && d.push(f);
        while (f != d[c]);
        do (f = lb[f << 1] >> 5), -1 == d.indexOf(f) && d.push(f);
        while (f != d[c]);
        oa(a, f << 1);
        f = a.top;
        a.top = a.bottom;
        a.bottom = f;
        f = Wa(a) >> 1;
        -1 == d.indexOf(f) && d.push(f);
      }
      pb[b] = d;
    }
  }
  function ib(a, d, c) {
    Ta();
    b();
    return Va(vb, w());
  }
  var bb = (f.prototype = function () {}.prototype);
  bb.dl = 10062778;
  bb.dr = 14536702;
  bb.ml = 0;
  bb.ul = 70195;
  bb.ur = 4544119;
  bb = Ya.prototype = function () {}.prototype;
  bb.Search_c = null;
  bb.Search_length1 = 0;
  bb.Search_maxlen2 = 0;
  bb.Search_sol_string = null;
  bb = Sa.prototype = function () {}.prototype;
  bb.bottom = 0;
  bb.Shape_parity = 0;
  bb.top = 0;
  var lb, hb, gb, $a, jb, ob;
  bb = Ra.prototype = function () {}.prototype;
  bb.botEdgeFirst = !1;
  bb.cornperm = 0;
  bb.edgeperm = 0;
  bb.ml = 0;
  bb.topEdgeFirst = !1;
  var qb,
    mb,
    cb,
    eb,
    pb = [
      0, 1, 3, 18, 19, 1004, 1005, 1006, 1007, 1008, 1009, 1011, 1015, 1016,
      1018, 1154, 1155, 1156, 1157, 1158, 1159, 1161, 1166, 1168, 424, 425, 426,
      427, 428, 429, 431, 436, 95, 218, 341, 482, 528, 632, 1050, 342, 343, 345,
      346, 348, 353, 223, 487, 533, 535, 1055, 219, 225, 483, 489, 639, 1051,
      1057, 486, 1054, 1062, 6, 21, 34, 46, 59, 71, 144, 157, 182, 305, 7, 22,
      35, 47, 60, 72, 145, 158, 183, 306, 8, 23, 36, 48, 61, 73, 146, 159, 184,
      307,
    ],
    fb = [
      16, 16, 16, 10, 16, 24, 16, 24, 16, 24, 16, 16, 4, 24, 16, 48, 32, 48, 32,
      48, 32, 32, 48, 16, 48, 32, 48, 16, 48, 32, 32, 48, 36, 48, 72, 72, 48,
      48, 72, 48, 36, 72, 48, 48, 72, 32, 48, 16, 32, 48, 16, 32, 48, 48, 16,
      48, 48, 36, 72, 36, 72, 96, 96, 72, 96, 72, 72, 72, 72, 24, 48, 64, 64,
      48, 64, 48, 48, 48, 48, 16, 24, 32, 32, 24, 32, 24, 24, 24, 24, 8,
    ],
    vb = new Ya();
  scrMgr.reg("sqrs", ib);
  scrMgr.reg(
    "sqrcsp",
    function (a, d, c) {
      Ta();
      b();
      kb();
      a = mathlib.rndEl(pb[scrMgr.fixCase(c, fb)]);
      return Va(vb, w(a));
    },
    [
      "Star-x8 Star-x71 Star-x62 Star-x44 Star-x53 Square-Scallop Square-rPawn Square-Shield Square-Barrel Square-rFist Square-Mushroom Square-lPawn Square-Square Square-lFist Square-Kite Kite-Scallop Kite-rPawn Kite-Shield Kite-Barrel Kite-rFist Kite-Mushroom Kite-lPawn Kite-lFist Kite-Kite Barrel-Scallop Barrel-rPawn Barrel-Shield Barrel-Barrel Barrel-rFist Barrel-Mushroom Barrel-lPawn Barrel-lFist Scallop-Scallop Scallop-rPawn Scallop-Shield Scallop-rFist Scallop-Mushroom Scallop-lPawn Scallop-lFist Shield-rPawn Shield-Shield Shield-rFist Shield-Mushroom Shield-lPawn Shield-lFist Mushroom-rPawn Mushroom-rFist Mushroom-Mushroom Mushroom-lPawn Mushroom-lFist Pawn-rPawn-rPawn Pawn-rPawn-lPawn Pawn-rPawn-rFist Pawn-lPawn-rFist Pawn-lPawn-lPawn Pawn-rPawn-lFist Pawn-lPawn-lFist Fist-rFist-rFist Fist-lFist-rFist Fist-lFist-lFist Pair-x6 Pair-r42 Pair-x411 Pair-r51 Pair-l42 Pair-l51 Pair-x33 Pair-x312 Pair-x321 Pair-x222 L-x6 L-r42 L-x411 L-r51 L-l42 L-l51 L-x33 L-x312 L-x321 L-x222 Line-x6 Line-r42 Line-x411 Line-r51 Line-l42 Line-l51 Line-x33 Line-x312 Line-x321 Line-x222".split(
        " "
      ),
      fb,
    ]
  );
  return { initialize: $.noop, getRandomScramble: ib };
})(mathlib.set8Perm, mathlib.get8Perm, mathlib.circle, mathlib.rn);
(function () {
  function z(c, h) {
    var z = a.set([], h & 31),
      T = w.set([], h >> 5),
      Ta = f.set([], c),
      Wa = [];
    mathlib.fillFacelet(Qa, Wa, [0, 1, 2, 3], T, 6);
    mathlib.fillFacelet(n, Wa, Ta, z, 6);
    z = [4, 2, 3, 1, 5, 0];
    for (T = 0; 6 > T; T++)
      for (Ta = 0; 2 > Ta; Ta++) {
        var oa = n[T][0 ^ Ta],
          Sa = n[T][1 ^ Ta],
          d = 6 * ~~(oa / 6) + z[(z.indexOf(oa % 6) + 5) % 6],
          b = 6 * ~~(Sa / 6) + z[(z.indexOf(Sa % 6) + 1) % 6];
        if (Wa[d] == Wa[oa] && Wa[b] == Wa[Sa]) return !1;
      }
    return !0;
  }
  var Qa = [
      [3, 16, 11],
      [4, 23, 15],
      [5, 9, 22],
      [10, 17, 21],
    ],
    n = [
      [1, 7],
      [2, 14],
      [0, 18],
      [6, 12],
      [8, 20],
      [13, 19],
    ],
    Xa = new mathlib.Solver(4, 2, [
      [
        0,
        [
          function (a, f) {
            mathlib.acycle(a, c[f]);
          },
          "p",
          6,
          -1,
        ],
        360,
      ],
      [
        0,
        function (f, h) {
          var n = a.set([], f & 31),
            z = w.set([], f >> 5);
          z[h]++;
          mathlib.acycle(n, c[h], 1, Ua[h]);
          return (w.get(z) << 5) | a.get(n);
        },
        2592,
      ],
    ]),
    c = [
      [0, 1, 3],
      [1, 2, 5],
      [0, 4, 2],
      [3, 5, 4],
    ],
    Ua = [
      [0, 1, 0, 2],
      [0, 1, 0, 2],
      [0, 0, 1, 2],
      [0, 0, 1, 2],
    ],
    a = new mathlib.coord("o", 6, -2),
    f = new mathlib.coord("p", 6, -1),
    w = new mathlib.coord("o", 4, 3);
  scrMgr.reg(["pyro", "pyrso", "pyrl4e", "pyrnb", "pyr4c"], function (a) {
    var c = "pyro" == a ? 0 : 8,
      f = "pyrl4e" == a ? 2 : 7;
    do {
      if ("pyro" == a || "pyrso" == a || "pyr4c" == a) {
        var n = mathlib.rn(360);
        var w = mathlib.rn(2592);
      } else if ("pyrl4e" == a)
        (n = mathlib.get8Perm(
          mathlib.set8Perm([], mathlib.rn(12), 4, -1).concat([4, 5]),
          6,
          -1
        )),
          (w = 864 * mathlib.rn(3) + mathlib.rn(8));
      else if ("pyrnb" == a) {
        do (n = mathlib.rn(360)), (w = mathlib.rn(2592));
        while (!z(n, w));
      }
      var T = Xa.search([n, w], 0).length;
      var oa =
        Xa.toStr(Xa.search([n, w], c).reverse(), "ULRB", ["'", ""]) + " ";
      for (var Sa = 0; 4 > Sa; Sa++) {
        var d = mathlib.rn("pyr4c" == a ? 2 : 3);
        2 > d && ((oa += "lrbu".charAt(Sa) + [" ", "' "][d]), T++);
      }
    } while (T < f);
    return oa;
  });
})();
(function () {
  function z(a, n) {
    var z = w.set([], a % 12),
      d = f.set([], ~~(a / 12)),
      b = T.set([], n % 81);
    n = h.set([], ~~(n / 81));
    for (var Ra = [], r = 0; 6 > r; r++) Ra[5 * r] = d[r];
    mathlib.fillFacelet(Xa, Ra, [0, 1, 2, 3], b, 5);
    mathlib.fillFacelet(c, Ra, z, n, 5);
    for (r = 0; 30 > r; r += 5)
      for (z = 1; 5 > z; z++) if (Ra[r] == Ra[r + z]) return !1;
    return !0;
  }
  function Qa(c, h) {
    var n = w.set([], c % 12),
      d = f.set([], ~~(c / 12));
    mathlib.acycle(d, Ua[h]);
    mathlib.acycle(n, a[h]);
    return 12 * f.get(d) + w.get(n);
  }
  function n(c, f) {
    var n = T.set([], c % 81),
      d = h.set([], ~~(c / 81));
    n[f]++;
    mathlib.acycle(d, a[f], 1, [0, 2, 1, 3]);
    return 81 * h.get(d) + T.get(n);
  }
  var Xa = [
      [4, 16, 7],
      [1, 11, 22],
      [26, 14, 8],
      [29, 19, 23],
    ],
    c = [
      [3, 6, 12],
      [2, 21, 17],
      [27, 9, 18],
      [28, 24, 13],
    ],
    Ua = [
      [0, 3, 1],
      [0, 2, 4],
      [1, 5, 2],
      [3, 4, 5],
    ],
    a = [
      [0, 1, 2],
      [0, 3, 1],
      [0, 2, 3],
      [1, 3, 2],
    ],
    f = new mathlib.coord("p", 6, -1),
    w = new mathlib.coord("p", 4, -1),
    T = new mathlib.coord("o", 4, 3),
    h = new mathlib.coord("o", 4, -3),
    Va = new mathlib.Solver(4, 2, [
      [0, Qa, 4320],
      [0, n, 2187],
    ]),
    Ya = new mathlib.Solver(4, 2, [
      [
        0,
        function (a, c) {
          return ~~(Qa(12 * a, c) / 12);
        },
        360,
      ],
      [
        0,
        function (a, c) {
          return n(a, c) % 81;
        },
        81,
      ],
    ]),
    Ta = [0, 1, 2, 0, 2, 1, 1, 2, 0, 2, 1, 0];
  scrMgr.reg(["skbo", "skbso", "skbnb"], function (a) {
    var c = "skbso" == a ? 6 : 2,
      f = "skbo" == a ? 0 : 8;
    do {
      var d = mathlib.rn(4320);
      var b = mathlib.rn(2187);
    } while ((0 == d && 0 == b) || Ta[d % 12] != (b + ~~(b / 3) + ~~(b / 9) + ~~(b / 27)) % 3 || null != Va.search([d, b], 0, c) || ("skbnb" == a && !z(d, b)));
    a = Va.search([d, b], f).reverse();
    d = [];
    b = ["L", "R", "B", "U"];
    for (c = 0; c < a.length; c++) {
      f = a[c][0];
      var h = 1 - a[c][1];
      2 == f && mathlib.acycle(b, [0, 3, 1], h + 1);
      d.push(b[f] + (1 == h ? "'" : ""));
    }
    return d.join(" ");
  })(["ivyo", "ivyso"], function (a) {
    var c = "ivyso" == a ? 6 : 0;
    do {
      a = mathlib.rn(360);
      var f = mathlib.rn(81);
    } while ((0 == a && 0 == f) || null != Ya.search([a, f], 0, 1));
    return Ya.toStr(Ya.search([a, f], c).reverse(), "RLDB", "' ");
  });
})();
(function (z) {
  function Qa(c, f) {
    mathlib.acycle(c, Ua[f], 1, a[f]);
  }
  function n(a, c) {
    for (
      var h = mathlib.set8Perm([], a, 7), n = f.set([], c), d = [], b = 0;
      24 > b;
      b++
    )
      d[b] = b >> 2;
    mathlib.fillFacelet(w, d, h, n, 4);
    for (b = 0; 24 > b; b += 4)
      if (((1 << d[b]) | (1 << d[b + 3])) & ((1 << d[b + 1]) | (1 << d[b + 2])))
        return !1;
    return !0;
  }
  function Xa(a, w, T) {
    var oa = "222o" == a ? 0 : 9;
    do {
      var d = 2;
      if ("222o" == a || "222so" == a) {
        var b = z(5040);
        var Ra = z(729);
        d = 3;
      } else if ("222eg" == a) {
        Ra = h[T & 7];
        b = [0, 2, 3, 4, 5, 1][T >> 3];
        b = mathlib.set8Perm([0, 0, 0, 0].concat(Ya[b]), z(24), 4);
        b = mathlib.get8Perm(b, 7);
        var r = z(4);
        for (Ra = f.set([], Ra); 0 < r--; ) Qa(Ra, 0);
        Ra = f.get(Ra);
      } else {
        if (/^222eg[012]$/.exec(a))
          return Xa("222eg", w, [0, 8, 40][~~a[5]] + T);
        if ("222nb" == a) {
          do (b = z(5040)), (Ra = z(729));
          while (!n(b, Ra));
        }
      }
    } while ((0 == b && 0 == Ra) || null != c.search([b, Ra], 0, d));
    return c.toStr(c.search([b, Ra], oa).reverse(), "URF", "'2 ");
  }
  var c = new mathlib.Solver(3, 3, [
      [
        0,
        [
          function (a, c) {
            mathlib.acycle(a, Ua[c]);
          },
          "p",
          7,
        ],
        5040,
      ],
      [0, [Qa, "o", 7, -3], 729],
    ]),
    Ua = [
      [0, 2, 3, 1],
      [0, 1, 5, 4],
      [0, 4, 6, 2],
    ],
    a = [null, [0, 1, 0, 1, 3], [1, 0, 1, 0, 3]],
    f = new mathlib.coord("o", 7, -3),
    w = [
      [3, 4, 9],
      [1, 20, 5],
      [2, 8, 17],
      [0, 16, 21],
      [13, 11, 6],
      [15, 7, 22],
      [12, 19, 10],
    ],
    T = [
      1, 2, 4, 4, 4, 4, 4, 4, 1, 2, 4, 4, 4, 4, 4, 4, 1, 2, 4, 4, 4, 4, 4, 4, 1,
      2, 4, 4, 4, 4, 4, 4, 1, 2, 4, 4, 4, 4, 4, 4, 1, 2, 4, 4, 4, 4, 4, 4,
    ],
    h = [0, 17, 5, 14, 8, 1, 2, 4],
    Va =
      "EG0-O EG0-H EG0-L EG0-Pi EG0-S EG0-T EG0-U EG0-aS EG1B-O EG1B-H EG1B-L EG1B-Pi EG1B-S EG1B-T EG1B-U EG1B-aS EG1L-O EG1L-H EG1L-L EG1L-Pi EG1L-S EG1L-T EG1L-U EG1L-aS EG1F-O EG1F-H EG1F-L EG1F-Pi EG1F-S EG1F-T EG1F-U EG1F-aS EG1R-O EG1R-H EG1R-L EG1R-Pi EG1R-S EG1R-T EG1R-U EG1R-aS EG2-O EG2-H EG2-L EG2-Pi EG2-S EG2-T EG2-U EG2-aS".split(
        " "
      ),
    Ya = [
      [4, 5, 6],
      [4, 6, 5],
      [6, 5, 4],
      [5, 4, 6],
      [5, 6, 4],
      [6, 4, 5],
    ];
  scrMgr.reg(["222o", "222so", "222nb"], Xa)("222eg0", Xa, [
    Va.slice(0, 8),
    T.slice(0, 8),
  ])("222eg1", Xa, [Va.slice(8, 40), T.slice(8, 40)])("222eg2", Xa, [
    Va.slice(40, 48),
    T.slice(40, 48),
  ])("222eg", Xa, [Va, T]);
})(mathlib.rn);
(function () {
  function z(a, c) {
    mathlib.acycle(a, [0, c + 1]);
  }
  function Qa(a, c) {
    var f = mathlib.set8Perm([], ~~(a / 3), 4);
    mathlib.acycle(f, w[c]);
    return 3 * mathlib.get8Perm(f, 4) + (((a % 3) + (0 == c ? 1 : 0)) % 3);
  }
  function n(c, f, n) {
    return 72 * Ua[n][~~(f / 72)] + a[(n + c) % 3][f % 72];
  }
  function Xa(c, h, n, w) {
    if (0 == h) return 0 == c[0] && 0 == c[1] && 0 == c[2] && 0 == c[3];
    if (
      Math.max(
        mathlib.getPruning(f[0], 72 * c[0] + c[1]),
        mathlib.getPruning(f[1], 72 * c[0] + c[2]),
        mathlib.getPruning(f[2], 72 * c[0] + c[3])
      ) > h
    )
      return !1;
    for (var z = 0; 3 > z; z++)
      if (z != n)
        for (var T = c.slice(), oa = 0; 11 > oa; oa++) {
          T[0] = Ua[z][T[0]];
          for (var Sa = 1; 4 > Sa; Sa++) T[Sa] = a[(z + Sa - 1) % 3][T[Sa]];
          if (Xa(T, h - 1, z, w))
            return (
              w.push(
                "URF".charAt(z) + "' 2' 3' 4' 5' 6 5 4 3 2 ".split(" ")[oa]
              ),
              !0
            );
        }
  }
  function c() {
    c = $.noop;
    mathlib.createMove(a, 72, Qa, 3);
    mathlib.createMove(Ua, 24, [z, "p", 4], 3);
    for (var w = 0; 3 > w; w++)
      mathlib.createPrun(f[w], 0, 1728, 5, n.bind(null, w), 3, 12, 0);
  }
  var Ua = [],
    a = [],
    f = [[], [], []],
    w = [
      [0, 3, 2, 1],
      [0, 1],
      [0, 3],
    ];
  scrMgr.reg(["gearo", "gearso"], function (a) {
    c();
    do {
      var h = [mathlib.rn(24)];
      for (var n = 0; 3 > n; n++) {
        do h[n + 1] = mathlib.rn(72);
        while (15 == mathlib.getPruning(f[n], 72 * h[0] + h[n + 1]));
      }
    } while (0 == h);
    a = "gearso" == a ? 4 : 0;
    for (n = []; !Xa(h, a, -1, n); ) a++;
    return n.reverse().join(" ");
  });
})();
(function () {
  var z = new mathlib.Solver(4, 1, [
      [
        0,
        function (n, z) {
          var c = mathlib.set8Perm([], n >> 4, 4);
          mathlib.acycle(c, Qa[z]);
          return (mathlib.get8Perm(c, 4) << 4) + ((n & 15) ^ (1 << z));
        },
        384,
      ],
    ]),
    Qa = [
      [0, 1],
      [2, 3],
      [0, 3],
      [1, 2],
    ];
  scrMgr.reg("133", function () {
    var n = 1 + mathlib.rn(191);
    n = 2 * n + ((mathlib.getNParity(n >> 3, 4) ^ (n >> 1) ^ (n >> 2) ^ n) & 1);
    return z.toStr(z.search([n], 0), "RLFB", [""]);
  });
})();
(function (z, Qa) {
  function n() {
    n = $.noop;
    for (var a = [], f, w = 0; 40320 > w; w++) c[w] = [];
    for (w = 0; 40320 > w; w++)
      mathlib.set8Perm(a, w),
        z(a, 0, 1, 2, 3),
        (f = c[0][w] = Qa(a)),
        z(a, 4, 5, 6, 7),
        (f = c[1][f] = Qa(a)),
        z(a, 2, 5)(a, 3, 6),
        (f = c[2][f] = Qa(a)),
        z(a, 0, 5)(a, 3, 4),
        (c[3][f] = Qa(a));
    mathlib.createPrun(Ua, 0, 40320, 12, c, 4, 3);
  }
  function Xa(a, f, n, T, h) {
    if (0 == n) return 0 == a + f;
    if (mathlib.getPruning(Ua, a) > n) return !1;
    var w, Ya;
    for (Ya = 0; 4 > Ya; Ya++)
      if (Ya != T) {
        var Ta = a;
        var Wa = f;
        for (w = 0; w < (2 > Ya ? 3 : 1); w++) {
          Ta = c[Ya][Ta];
          var oa = Ya;
          2 > oa ||
            ((Wa = mathlib.set8Perm([], Wa, 3)),
            2 == oa ? z(Wa, 0, 1) : 3 == oa && z(Wa, 0, 2),
            (Wa = Qa(Wa, 3)));
          if (Xa(Ta, Wa, n - 1, Ya, h))
            return (
              h.push(
                ["U", "D", "R2", "F2"][Ya] + (2 > Ya ? " 2'".charAt(w) : "")
              ),
              !0
            );
        }
      }
  }
  var c = [],
    Ua = [];
  scrMgr.reg("223", function () {
    n();
    do {
      var a = mathlib.rn(40320);
      var c = mathlib.rn(6);
    } while (0 == c + a);
    for (var w = [], z = 0; 99 > z && !Xa(a, c, z, -1, w); z++);
    return w.reverse().join(" ");
  });
})(mathlib.circle, mathlib.get8Perm);
var clock = (function (z, Qa) {
  function n(a, c, n, h, z) {
    for (var f = a[0].length; h < f; h++)
      a[n][h] = (a[n][h] + a[c][h] * z) % 12;
  }
  var Xa = [
      [0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0],
      [1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0],
      [11, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 11, 0, 0, 0, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 11, 0, 1, 1, 0, 1],
      [0, 0, 11, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0],
      [11, 0, 11, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
      [11, 0, 0, 0, 0, 0, 11, 0, 0, 1, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 11, 0, 11, 0, 1, 1, 1, 1],
      [0, 0, 11, 0, 0, 0, 0, 0, 11, 1, 1, 1, 0, 1],
      [11, 0, 11, 0, 0, 0, 11, 0, 11, 1, 1, 1, 1, 1],
    ],
    c = [-1, 1, -1, -1, -1, 5, -1, 7, -1, -1, -1, 11],
    Ua = [7695, 42588, 47187, 85158, 86697, 156568, 181700, 209201, 231778],
    a = "UR DR DL UL U R D L ALL".split(" ");
  scrMgr.reg("clko", function (f) {
    var w = [];
    for (f = 0; 14 > f; f++) w[f] = z(12);
    f = [];
    f.length = 18;
    if (14 == w.length && 18 == f.length)
      for (var T = 15, h = 0; h < Qa[18][14]; h++) {
        var Va = h;
        var Ya = 14;
        for (var Ta = 0, Wa = 17; 0 <= Wa; Wa--)
          Va >= Qa[Wa][Ya] && ((Va -= Qa[Wa][Ya--]), (Ta |= 1 << Wa));
        Ya = Ta;
        Va = !1;
        for (Ta = 0; Ta < Ua.length; Ta++)
          if ((Ya & Ua[Ta]) == Ua[Ta]) {
            Va = !0;
            break;
          }
        if (!Va) {
          Va = [];
          for (Ta = Wa = 0; 18 > Ta; Ta++)
            1 == ((Ya >> Ta) & 1) && (Va[Wa++] = Ta);
          Ya = [];
          for (Wa = 0; 14 > Wa; Wa++) {
            Ya[Wa] = [];
            for (Ta = 0; 14 > Ta; Ta++) Ya[Wa][Ta] = Xa[Va[Ta]][Wa];
            Ya[Wa][14] = w[Wa];
          }
          b: {
            Ta = Ya;
            Wa = Ta[0].length;
            for (var oa = 0; oa < Wa - 1; oa++) {
              if (-1 == c[Ta[oa][oa]]) {
                for (var Sa = -1, d = oa + 1; 14 > d; d++)
                  if (-1 != c[Ta[d][oa]]) {
                    Sa = d;
                    break;
                  }
                if (-1 == Sa)
                  c: for (d = oa; 13 > d; d++)
                    for (var b = d + 1; 14 > b; b++)
                      if (-1 != c[(Ta[d][oa] + Ta[b][oa]) % 12]) {
                        n(Ta, b, d, oa, 1);
                        Sa = d;
                        break c;
                      }
                if (-1 == Sa) {
                  for (d = oa + 1; 14 > d; d++)
                    if (0 != Ta[d][oa]) {
                      Ta = -1;
                      break b;
                    }
                  Ta = oa + 1;
                  break b;
                }
                d = Ta;
                b = d[oa];
                d[oa] = d[Sa];
                d[Sa] = b;
              }
              Sa = c[Ta[oa][oa]];
              for (d = oa; d < Wa; d++) Ta[oa][d] = (Ta[oa][d] * Sa) % 12;
              for (d = oa + 1; 14 > d; d++) n(Ta, oa, d, oa, 12 - Ta[d][oa]);
            }
            Ta = 0;
          }
          if (0 == Ta) {
            Ta = !0;
            for (Wa = 14; 14 > Wa; Wa++)
              if (0 != Ya[Wa][14]) {
                Ta = !1;
                break;
              }
            if (Ta) {
              Ta = Ya;
              for (Wa = Ta[0].length - 2; 0 < Wa; Wa--)
                for (oa = Wa - 1; 0 <= oa; oa--)
                  0 != Ta[oa][Wa] && n(Ta, Wa, oa, Wa, 12 - Ta[oa][Wa]);
              for (Wa = Ta = 0; 14 > Wa; Wa++) 0 != Ya[Wa][14] && Ta++;
              if (Ta < T) {
                for (Wa = 0; 18 > Wa; Wa++) f[Wa] = 0;
                for (Wa = 0; 14 > Wa; Wa++) f[Va[Wa]] = Ya[Wa][14];
                T = Ta;
              }
            }
          }
        }
      }
    w = "";
    for (T = 0; 9 > T; T++)
      (h = f[T]),
        0 != h &&
          ((Va = 6 >= h),
          6 < h && (h = 12 - h),
          (w += a[T] + h + (Va ? "+" : "-") + " "));
    w += "y2 ";
    for (T = 0; 9 > T; T++)
      (h = f[T + 9]),
        0 != h &&
          ((Va = 6 >= h),
          6 < h && (h = 12 - h),
          (w += a[T] + h + (Va ? "+" : "-") + " "));
    f = !0;
    for (T = 0; 4 > T; T++)
      1 == z(2) && ((w += (f ? "" : " ") + a[T]), (f = !1));
    return w;
  });
  return { moveArr: Xa };
})(mathlib.rn, mathlib.Cnk);
(function () {
  var z = [
      [0, 1, 2, 3],
      [0, 2, 5, 4],
    ],
    Qa = [
      [0, 0, 0, 0, 2],
      [0, 1, 0, 1, 2],
    ],
    n = new mathlib.Solver(2, 3, [
      [
        0,
        function (n, c) {
          var Qa = n >> 3,
            a = n,
            f = (n << 1) | (mathlib.getNParity(Qa, 6) ^ ((a >> 1) & 1));
          Qa = mathlib.set8Perm([], Qa, 6);
          mathlib.acycle(Qa, z[c]);
          0 == c && (a += 2);
          1 == c && (f += 1);
          return (mathlib.getNPerm(Qa, 6) << 3) | (a & 6) | ((f >> 1) & 1);
        },
        5760,
      ],
      [
        0,
        [
          function (n, c) {
            mathlib.acycle(n, z[c], 1, Qa[c]);
          },
          "o",
          6,
          -2,
        ],
        32,
      ],
    ]);
  scrMgr.reg("lsemu", function () {
    do {
      var z = mathlib.rn(5760);
      var c = mathlib.rn(32);
    } while (0 == c + z);
    return n.toStr(n.search([z, c], 0), "UM", " 2'").replace(/ +/g, " ");
  });
})();
(function (z, Qa, n) {
  function Xa(a, d, b, c) {
    void 0 == c && (c = [""]);
    for (var f = 0, h, n = [], w = 0; w < b; w++) {
      do h = z(a.length);
      while ((f >> h) & 1);
      n.push(a[h] + Qa(c));
      f &= ~d[h];
      f |= 1 << h;
    }
    return n.join(" ");
  }
  function c(a) {
    return (
      " " +
      Qa([
        a + "=0",
        a + "+1",
        a + "+2",
        a + "+3",
        a + "+4",
        a + "+5",
        a + "+6",
        a + "-5",
        a + "-4",
        a + "-3",
        a + "-2",
        a + "-1",
      ]) +
      " "
    );
  }
  function Ua() {
    return Qa(["U", "d"]) + Qa(["U", "d"]);
  }
  function a(a, d, b, c) {
    for (
      var f = [
          [0, -1],
          [1, 0],
          [-1, 0],
          [0, 1],
        ],
        h = 0,
        n = 3,
        w,
        Ra = 5,
        oa = [],
        T = 0;
      T < d;
      T++
    ) {
      do w = z(4);
      while (
        0 > h + f[w][0] ||
        3 < h + f[w][0] ||
        0 > n + f[w][1] ||
        3 < n + f[w][1] ||
        3 == w + Ra
      );
      h += f[w][0];
      n += f[w][1];
      0 < oa.length && oa[oa.length - 1][0] == w
        ? oa[oa.length - 1][1]++
        : oa.push([w, 1]);
      Ra = w;
    }
    d = "";
    for (T = 0; T < oa.length; T++)
      if (
        ((f = a ? oa[T][0] : 3 - oa[T][0]),
        (f = (b ? "ï¿ªï¿©ï¿«ï¿¬" : "ULRD").charAt(f)),
        c)
      )
        d += f + (1 == oa[T][1] ? "" : oa[T][1]) + " ";
      else for (h = 0; h < oa[T][1]; h++) d += f + " ";
    return d;
  }
  function f(a, d) {
    var b = "",
      c,
      f;
    for (c = 0; c < d; c++) {
      b += "  ";
      for (f = 0; f < a; f++)
        b += (0 == f % 2 ? "R" : "D") + Qa(["++", "--"]) + " ";
      b += "U" + (b.endsWith("-- ") ? "'\\n" : "~\\n");
    }
    return b;
  }
  function w(a, d) {
    Wa = [];
    var b;
    T(1, a, d);
    var c = "";
    for (b = 0; b < Wa[0].length; b++) {
      var f = Wa[0][b];
      c = 7 == f[0] ? c + "/" : c + (" (" + f[0] + "," + f[1] + ") ");
    }
    return c;
  }
  function T(a, d, b) {
    for (var c = 0; c < a; c++) {
      oa = [
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
      ];
      Wa[c] = [];
      for (var f = 0; f < b; ) {
        var n = z(12) - 5,
          w = 2 == d ? 0 : z(12) - 5,
          T = (0 == n ? 0 : 1) + (0 == w ? 0 : 1);
        (f + T <= b || 1 != d) &&
          (0 < T || 0 == f) &&
          h(n, w) &&
          (1 == d && (f += T),
          0 < T && (Wa[c][Wa[c].length] = [n, w]),
          f < b || 1 != d) &&
          (f++, (Wa[c][Wa[c].length] = [7, 0]), h(7, 0));
      }
    }
  }
  function h(a, d) {
    var b;
    if (7 == a) {
      for (b = 0; 6 > b; b++) mathlib.circle(oa, b + 6, b + 12);
      return !0;
    }
    if (
      oa[(17 - a) % 12] ||
      oa[(11 - a) % 12] ||
      oa[12 + ((17 - d) % 12)] ||
      oa[12 + ((11 - d) % 12)]
    )
      return !1;
    var c = oa.slice(0, 12);
    var f = oa.slice(12, 24);
    for (b = 0; 12 > b; b++)
      (oa[b] = c[(12 + b - a) % 12]), (oa[b + 12] = f[(12 + b - d) % 12]);
    return !0;
  }
  function Va(a, d) {
    for (var b = 0, c = [], f = 0; 4 > f; f++)
      (c[f] = z(3)),
        0 < c[f]
          ? ((c[f] = "ulrb".charAt(f) + ["! ", "' "][c[f] - 1]), b++)
          : (c[f] = "");
    return a.substr(0, a.length - d * b) + " " + c.join("");
  }
  var Ya = ["", "2", "'"],
    Ta = ["", "2", "'", "2'"],
    Wa = [],
    oa = [];
  scrMgr.reg("444yj", function (a, d) {
    var b = [
        ["U", "D"],
        ["R", "L", "r"],
        ["F", "B", "f"],
      ],
      c = [],
      f = 0,
      h,
      n = "";
    var w = -1;
    for (h = 0; h < d; h++) {
      var oa = 0;
      do {
        var T = z(b.length),
          Sa = z(b[T].length);
        if (T != w || 0 == c[Sa]) {
          if (T == w) (c[Sa] = 1), (oa = z(Ya.length));
          else {
            for (w = 0; w < b[T].length; w++) c[w] = 0;
            w = T;
            c[Sa] = 1;
            oa = z(Ya.length);
          }
          0 == T && 0 == Sa && (f = (f + 4 + oa) % 4);
          n =
            1 == T && 2 == Sa
              ? 0 == f || 3 == f
                ? n + ("l" + Ya[oa] + " ")
                : n + ("r" + Ya[oa] + " ")
              : 2 == T && 2 == Sa
              ? 0 == f || 1 == f
                ? n + ("b" + Ya[oa] + " ")
                : n + ("f" + Ya[oa] + " ")
              : n + (b[T][Sa] + Ya[oa] + " ");
          oa = 1;
        }
      } while (0 == oa);
    }
    return n;
  });
  scrMgr.reg("bic", function (a, d) {
    function b(a) {
      var b = [],
        d,
        c,
        r,
        n = 0;
      for (d = 0; 9 > d; d++) {
        for (c = r = 0; c < b.length; c++) b[c] == h[f[a][d]] && (r = 1);
        0 == r && ((b[b.length] = h[f[a][d]]), 0 == h[f[a][d]] && (n = 1));
      }
      return 5 == b.length && 1 == n;
    }
    function c(a, b) {
      for (var d = 0; d < b; d++) {
        var c = h[f[a][0]];
        h[f[a][0]] = h[f[a][6]];
        h[f[a][6]] = h[f[a][4]];
        h[f[a][4]] = h[f[a][2]];
        h[f[a][2]] = c;
        c = h[f[a][7]];
        h[f[a][7]] = h[f[a][5]];
        h[f[a][5]] = h[f[a][3]];
        h[f[a][3]] = h[f[a][1]];
        h[f[a][1]] = c;
      }
    }
    for (
      var f = [
          [0, 1, 2, 5, 8, 7, 6, 3, 4],
          [6, 7, 8, 13, 20, 19, 18, 11, 12],
          [0, 3, 6, 11, 18, 17, 16, 9, 10],
          [8, 5, 2, 15, 22, 21, 20, 13, 14],
        ],
        h = [
          1, 1, 2, 3, 3, 2, 4, 4, 0, 5, 6, 7, 8, 9, 10, 10, 5, 6, 7, 8, 9, 11,
          11,
        ],
        n = "",
        w = [],
        oa,
        T,
        Sa,
        Qa;
      w.length < d;

    ) {
      oa = [1, 1, 1, 1];
      for (T = 0; 4 > T; T++) 1 != oa[T] || b(T) || (oa[T] = 0);
      for (T = 0; 0 == T; )
        (Sa = z(4)), 1 == oa[Sa] && ((Qa = z(3) + 1), c(Sa, Qa), (T = 1));
      w[w.length] = [Sa, Qa];
      2 <= w.length &&
        w[w.length - 1][0] == w[w.length - 2][0] &&
        ((w[w.length - 2][1] = (w[w.length - 2][1] + w[w.length - 1][1]) % 4),
        (w = w.slice(0, w.length - 1)));
      1 <= w.length &&
        0 == w[w.length - 1][1] &&
        (w = w.slice(0, w.length - 1));
    }
    for (oa = 0; oa < d; oa++) n += "UFLR"[w[oa][0]] + Ya[w[oa][1] - 1] + " ";
    return n;
  });
  scrMgr.reg(
    "15p 15pm 15pat clkwca clk clkc clke giga mgmo mgmp mgmc heli redi redim pyrm prcp mpyr r3 r3ni sq1h sq1t sq2 ssq1t bsq -1 333noob lol".split(
      " "
    ),
    function (h, d) {
      var b = "";
      switch (h) {
        case "15p":
          return a(!1, d);
        case "15pm":
          return a(!0, d);
        case "15pat":
          return a(!1, d, !0, !0);
        case "clkwca":
          var Ra = "0+ 1+ 2+ 3+ 4+ 5+ 6+ 1- 2- 3- 4- 5-".split(" ");
          b = "UR? DR? DL? UL? U? R? D? L? ALL? y2 U? R? D? L? ALL?????";
          for (var r = 0; 14 > r; r++) b = b.replace("?", Qa(Ra));
          return b
            .replace("?", Qa(["", " UR"]))
            .replace("?", Qa(["", " DR"]))
            .replace("?", Qa(["", " DL"]))
            .replace("?", Qa(["", " UL"]));
        case "clk":
          return (
            "UU" +
            c("u") +
            "dU" +
            c("u") +
            "dd" +
            c("u") +
            "Ud" +
            c("u") +
            "dU" +
            c("u") +
            "Ud" +
            c("u") +
            "UU" +
            c("u") +
            "UU" +
            c("u") +
            "UU" +
            c("u") +
            "dd     " +
            Ua() +
            "\\ndd" +
            c("d") +
            "dU" +
            c("d") +
            "UU" +
            c("d") +
            "Ud" +
            c("d") +
            "UU     UU     Ud     dU     UU     dd" +
            c("d") +
            Ua()
          );
        case "clkc":
          b = "";
          for (r = 0; 4 > r; r++)
            b += "(" + (z(12) - 5) + ", " + (z(12) - 5) + ") / ";
          for (r = 0; 6 > r; r++) b += "(" + (z(12) - 5) + ") / ";
          for (r = 0; 4 > r; r++) b += Qa(["d", "U"]);
          return b;
        case "clke":
          return (
            "UU" +
            c("u") +
            "dU" +
            c("u") +
            "dU" +
            c("u") +
            "UU" +
            c("u") +
            "UU" +
            c("u") +
            "UU" +
            c("u") +
            "Ud" +
            c("u") +
            "Ud" +
            c("u") +
            "dd" +
            c("u") +
            "dd     " +
            Ua() +
            "\\nUU     UU     dU" +
            c("d") +
            "dU     dd" +
            c("d") +
            "Ud     Ud" +
            c("d") +
            "UU     UU" +
            c("d") +
            "dd" +
            c("d") +
            Ua()
          );
        case "giga":
          b = "";
          for (r = 0; r < Math.ceil(d / 10); r++) {
            b += "  ";
            for (Ra = 0; 10 > Ra; Ra++)
              b +=
                (0 == Ra % 2 ? "Rr".charAt(z(2)) : "Dd".charAt(z(2))) +
                Qa(["+ ", "++", "- ", "--"]) +
                " ";
            b += "y" + Qa(Ta) + "\\n";
          }
          return b;
        case "mgmo":
          return Xa(
            "F B U D L DBR DL BR DR BL R DBL".split(" "),
            [
              1364, 2728, 1681, 2402, 2629, 1418, 2329, 1574, 1129, 2198, 421,
              602,
            ],
            d
          );
        case "mgmp":
          return f(10, Math.ceil(d / 10));
        case "mgmc":
          b = Math.ceil(d / 10);
          r = "";
          var oa;
          for (Ra = 0; Ra < b; Ra++) {
            r += " ";
            for (oa = 0; 5 > oa; oa++)
              r += Qa(["+", "-"]) + Qa(["+", "-"]) + " ";
            r += "U" + Qa(["'\\n", "~\\n"]);
          }
          return r;
        case "heli":
          return Xa(
            "UF UR UB UL FR BR BL FL DF DR DB DL".split(" "),
            [154, 53, 106, 197, 771, 1542, 3084, 2313, 2704, 1328, 2656, 1472],
            d
          );
        case "redi":
          return Xa(
            "LRFBlrfb".split(""),
            [28, 44, 67, 131, 193, 194, 52, 56],
            d,
            ["", "'"]
          );
        case "redim":
          b = [];
          for (r = 0; r < d; r++)
            b.push(n([["R"], ["L"]], ["", "'"], 3 + z(3)));
          return b.join(" x ");
        case "pyrm":
          return (
            (b = n([["U"], ["L"], ["R"], ["B"]], ["!", "'"], d)),
            Va(b, 3).replace(/!/g, "")
          );
        case "prcp":
          return f(10, Math.ceil(d / 10));
        case "mpyr":
          return (
            (b = Xa(
              "U! L! R! B! Uw Lw Rw Bw".split(" "),
              [224, 208, 176, 112, 238, 221, 187, 119],
              d,
              ["!", "'"]
            )),
            Va(b, 4).replace(/!/g, "")
          );
        case "r3":
          for (r = 0; r < d; r++)
            b += (0 == r ? "" : "\\n") + (r + 1) + ") ${333}";
          return scrMgr.formatScramble(b);
        case "r3ni":
          for (r = 0; r < d; r++)
            b += (0 == r ? "" : "\\n") + (r + 1) + ") ${333ni}";
          return scrMgr.formatScramble(b);
        case "sq1h":
          return w(1, d);
        case "sq1t":
          return w(0, d);
        case "sq2":
          for (r = 0; r < d; )
            if (((Ra = z(12) - 5), (oa = z(12) - 5), 0 != Ra || 0 != oa))
              r++, (b += "(" + Ra + "," + oa + ") / ");
          return b;
        case "ssq1t":
          Wa = [];
          T(2, 0, d);
          r = Wa[0];
          Ra = Wa[1];
          oa = "";
          7 == r[0][0] && (r = [[0, 0]].concat(r));
          7 == Ra[0][0] && (Ra = [[0, 0]].concat(Ra));
          for (b = 0; b < d; b++)
            oa +=
              "(" +
              r[2 * b][0] +
              "," +
              Ra[2 * b][0] +
              "," +
              Ra[2 * b][1] +
              "," +
              r[2 * b][1] +
              ") / ";
          return oa;
        case "bsq":
          return w(2, d);
        case "-1":
          for (r = 0; r < d; r++) b += String.fromCharCode(32 + z(224));
          return b + "Error: subscript out of range";
        case "333noob":
          return (
            (b = n(SCRAMBLE_NOOBST, SCRAMBLE_NOOBSS.split("|"), d).replace(
              /t/,
              "T"
            )),
            b.substr(0, b.length - 2) + "."
          );
        case "lol":
          return (b = n([["L"], ["O"]], 0, d)), b.replace(/ /g, "");
      }
      console.log("Error");
    }
  );
})(mathlib.rn, mathlib.rndEl, scrMgr.mega);
var storage = execMain(function () {
  function z(a) {
    a = "" + a;
    return String.fromCharCode(47 + a.length) + a;
  }
  function Qa(a, c) {
    return "session_" + z(a) + (void 0 == c ? "" : "_" + z(c));
  }
  function n(a) {
    console.log("IndexedDB Error", a || "undefined");
  }
  function Xa(c, f, h, z) {
    (z = z || a)
      ? ((z = z.transaction(["sessions"], c)),
        (z.oncomplete = h || $.noop),
        (z.onerror = n),
        (z = z.objectStore("sessions")),
        f(z))
      : requestAnimFrame(function () {
          Xa(c, f, h);
        });
  }
  function c(a, c) {
    return new Promise(function (f, n) {
      if (Ua)
        Xa(
          "readwrite",
          function (c) {
            c.clear();
            for (var f = 1; f <= ~~kernel.getProp("sessionN"); f++)
              for (
                var h = mathlib.str2obj(a["session" + f] || []), n = 0;
                n < (Math.ceil(h.length / 100) || 1);
                n++
              )
                c.put(h.slice(100 * n, 100 * (n + 1)), Qa(f, n));
          },
          f,
          c
        );
      else {
        for (var h = 1; h <= ~~kernel.getProp("sessionN"); h++)
          localStorage["session" + h] = obj2str(a["session" + h]);
        f();
      }
    });
  }
  var Ua =
      window.indexedDB ||
      window.webkitIndexedDB ||
      window.mozIndexedDB ||
      window.OIndexedDB ||
      window.msIndexedDB,
    a,
    f = /^session_\d(\d+)_\d(\d+)$/;
  Ua &&
    $(function () {
      var f = Ua.open("cstimer", 1);
      f.onerror = n;
      f.onupgradeneeded = function (a) {
        console.log("Update Data From LocalStorage");
        var f = a.target.result;
        f.createObjectStore("sessions").transaction.oncomplete = function (a) {
          c(localStorage, function () {}, f);
        };
      };
      f.onsuccess = function (c) {
        a = c.target.result;
      };
    });
  return {
    set: function (a, c, f) {
      return new Promise(function (h, n) {
        Ua
          ? Xa(
              "readwrite",
              function (h) {
                var n = ~~(f / 100),
                  w = IDBKeyRange.bound(Qa(a, n), Qa(a + 1), !1, !0);
                for (h["delete"](w); n < (Math.ceil(c.length / 100) || 1); n++)
                  h.put(c.slice(100 * n, 100 * (n + 1)), Qa(a, n));
              },
              function () {
                h(c);
              }
            )
          : ((localStorage["session" + a] = JSON.stringify(c)), h(c));
      });
    },
    get: function (a, c, f) {
      return new Promise(function (h, n) {
        var w = [];
        if (Ua)
          Xa(
            "readonly",
            function (c) {
              var f = IDBKeyRange.bound(Qa(a), Qa(a + 1), !1, !0);
              c.openCursor(f).onsuccess = function (a) {
                if ((a = a.target.result))
                  Array.prototype.push.apply(w, a.value), a["continue"]();
              };
            },
            function () {
              c = c || 0;
              f = f || w.length;
              if (0 != c || f != w.length) w = w.slice(c, f);
              h(w);
            }
          );
        else {
          var z = localStorage["session" + a];
          void 0 != z && "" != z && (w = JSON.parse(z));
          if (0 != c || f != w.length) w = w.slice(c, f);
          h(w);
        }
      });
    },
    del: function (a, c, h) {
      Ua
        ? Xa(
            "readwrite",
            function (h) {
              h["delete"](IDBKeyRange.bound(Qa(a), Qa(a + 1), !1, !0));
              var n = IDBKeyRange.bound(Qa(c), Qa(c + 1), !1, !0);
              h.openCursor(n).onsuccess = function (c) {
                if ((c = c.target.result)) {
                  var n = f.exec(c.key);
                  h.put(c.value, Qa(a, ~~n[2]));
                  h["delete"](c.key);
                  c["continue"]();
                }
              };
            },
            h
          )
        : ((localStorage["session" + a] = localStorage["session" + c]),
          delete localStorage["session" + c],
          h && requestAnimFrame(h));
    },
    importAll: c,
    exportAll: function () {
      return new Promise(function (a, c) {
        var h = {};
        if (Ua)
          Xa(
            "readonly",
            function (a) {
              a.openCursor().onsuccess = function (a) {
                if ((a = a.target.result)) {
                  var c = ~~f.exec(a.key)[1];
                  h["session" + c] = h["session" + c] || [];
                  Array.prototype.push.apply(h["session" + c], a.value);
                  a["continue"]();
                }
              };
            },
            function () {
              a(h);
            }
          );
        else {
          for (var n = 1; n <= ~~kernel.getProp("sessionN"); n++)
            void 0 != localStorage["session" + n] &&
              (h["session" + n] = mathlib.str2obj(localStorage["session" + n]));
          a(h);
        }
      });
    },
  };
});
var TimeStat = execMain(function () {
  function z(n, Qa, c, Ua) {
    this.avgSizes = n.slice();
    this.timeAt = c;
    this.timeSort = Ua || z.dnfsort;
    this.reset(Qa);
  }
  function Qa(n) {
    var z = kernel.getProp("trim", "p5");
    return "p" == z[0]
      ? Math.ceil((n / 100) * z.slice(1))
      : "m" == z
      ? Math.max(0, (n - 1) >> 1)
      : ~~z;
  }
  z.dnfsort = function (n, z) {
    return n == z ? 0 : 0 > n ? 1 : 0 > z ? -1 : n - z;
  };
  z.prototype.reset = function (n) {
    this.timesLen = n;
    this.shouldRecalc = !0;
  };
  z.prototype.getAllStats = function () {
    this.genStats();
    var n = this.timesLen - this.tree.rankOf(-1);
    return [
      n,
      n == this.timesLen
        ? -1
        : kernel.round(
            this.tree.cumSum(this.timesLen - n) / (this.timesLen - n)
          ),
    ];
  };
  z.prototype.genStats = function () {
    if (this.shouldRecalc) {
      this.bestAvg = [];
      this.lastAvg = [];
      this.bestAvgIndex = [];
      this.treesAvg = [];
      this.tree = sbtree.tree(this.timeSort);
      this.bestTime = this.worstTime = -1;
      this.bestTimeIndex = this.worstTimeIndex = 0;
      var n = this.timesLen;
      for (this.timesLen = 0; this.timesLen < n; )
        this.doPushed(!0, this.timesLen != n - 1);
      this.shouldRecalc = !1;
    }
  };
  z.prototype.pushed = function (n) {
    this.genStats();
    this.doPushed(n);
  };
  z.prototype.doPushed = function (n, z) {
    var c = [];
    this.timesLen++;
    var Ua = this.timesLen - 1,
      a = this.timeAt(Ua);
    this.tree.insert(a, Ua);
    if (!z) {
      var f = this.bestTime;
      this.bestTime = 0 == this.timesLen ? -1 : this.tree.rank(0);
      this.bestTimeIndex = this.tree.find(this.bestTime);
      this.worstTime =
        0 == this.timesLen
          ? -1
          : this.tree.rank(Math.max(0, this.tree.rankOf(-1) - 1));
      this.worstTimeIndex = this.tree.find(this.worstTime);
      0 > this.timeSort(a, f) && -1 != f && c.push("single");
    }
    for (f = 0; f < this.avgSizes.length; f++) {
      var w = Math.abs(this.avgSizes[f]);
      if (this.timesLen < w) break;
      var T = 0 > this.avgSizes[f] ? 0 : Qa(w),
        h = w - 2 * T,
        Va = this.treesAvg[f] || sbtree.tree(this.timeSort);
      if (this.timesLen == w) {
        for (var Ya = 0; Ya < w; Ya++) Va.insert(this.timeAt(Ya), Ya);
        this.bestAvg[f] = [-1, 0, -1, -1];
        this.bestAvgIndex[f] = 0;
        this.lastAvg[f] = [-1, 0, -1, -1];
      } else Va.remove(this.timeAt(Ua - w)).insert(a, Ua);
      Ya = Va.cumSum(w - T) - Va.cumSum(T);
      var Ta =
        Math.sqrt((Va.cumSk2(w - T) - Va.cumSk2(T) - (Ya * Ya) / h) / (h - 1)) /
        1e3;
      T = [
        Va.rankOf(-1) < w - T ? -1 : Ya / h,
        Ta,
        Va.rank(T - 1),
        Va.rank(w - T),
      ];
      0 > this.timeSort(T[0], this.bestAvg[f][0]) &&
        (0 <= this.bestAvg[f][0] &&
          !z &&
          c.push((0 < this.avgSizes[f] ? "ao" : "mo") + w),
        (this.bestAvg[f] = T),
        (this.bestAvgIndex[f] = Ua - w + 1));
      this.lastAvg[f] = T;
      this.treesAvg[f] = Va;
    }
    0 == c.length || n || logohint.push("Session best " + c.join(" ") + "!");
  };
  z.prototype.getMinMaxInt = function () {
    if (this.getAllStats()[0] == this.timesLen) return null;
    var n = [100, 200, 500, 1e3, 2e3, 5e3, 1e4, 2e4, 5e4, 1e5];
    if ("a" == kernel.getProp("disPrec")) {
      var z = (this.worstTime - this.bestTime) / 10;
      for (var c = 0; c < n.length; c++)
        if (z < n[c]) {
          z = n[c];
          break;
        }
    } else z = n[kernel.getProp("disPrec")];
    return [this.worstTime, this.bestTime, z];
  };
  z.prototype.runAvgMean = function (n, z, c, Ua) {
    c = c || z;
    void 0 === Ua && (Ua = Qa(c));
    if (!(0 > n || n + z > this.timesLen)) {
      if (0 >= c - Ua) return [-1, 0, -1, -1];
      for (var a = sbtree.tree(this.timeSort), f = 0; f < c; f++)
        a.insert(this.timeAt(n + f), f);
      for (
        var w = c - 2 * Ua,
          T = a.cumSum(c - Ua) - a.cumSum(Ua),
          h =
            Math.sqrt(
              (a.cumSk2(c - Ua) - a.cumSk2(Ua) - (T * T) / w) / (w - 1)
            ) / 1e3,
          Va = [
            [
              a.rankOf(-1) < c - Ua ? -1 : T / w,
              h,
              a.rank(Ua - 1),
              a.rank(c - Ua),
            ],
          ],
          Ya = n - c,
          Ta = c;
        Ta < z;
        Ta++
      )
        a.remove(this.timeAt(Ya + Ta)).insert(this.timeAt(n + Ta), f),
          (T = a.cumSum(c - Ua) - a.cumSum(Ua)),
          (h =
            Math.sqrt(
              (a.cumSk2(c - Ua) - a.cumSk2(Ua) - (T * T) / w) / (w - 1)
            ) / 1e3),
          Va.push([
            a.rankOf(-1) < c - Ua ? -1 : T / w,
            h,
            a.rank(Ua - 1),
            a.rank(c - Ua),
          ]);
      return Va;
    }
  };
  z.prototype.getTrimList = function (n, z, c, Ua) {
    for (var a = [], f = [], w = Qa(z), T = 0; T < z; T++) {
      var h = this.timeAt(n + T),
        Va = this.timeSort(h, c);
      h = this.timeSort(Ua, h);
      0 > Va
        ? a.push(T)
        : 0 > h
        ? f.push(T)
        : 0 == Va && a.length < w
        ? a.unshift(T)
        : 0 == h && f.length < w && f.unshift(T);
    }
    return a.slice(-w).concat(f.slice(-w));
  };
  return z;
});
var stats = execMain(
  function (z, Qa, n) {
    function Xa(a) {
      if (kernel.getProp("delmul")) {
        var b = prompt(STATS_CFM_DELMUL, 1);
        if (null == b || !/^\d+$/.exec(b) || 0 == ~~b) return;
      } else {
        if (!confirm(STATS_CFM_DELETE)) return;
        b = 1;
      }
      $a.splice(a, ~~b);
      nb.reset($a.length);
      wb.reset($a.length);
      Cb.save(a);
      xb.updateTable(!1);
      return !0;
    }
    function c(a) {
      for (var d = 0, c = 0, f = 0; f < $a.length; f++) {
        var h = $a[f][0];
        -1 == h[0] || h.length <= a ? (c += 1) : (d += b(a, f));
      }
      return c == $a.length ? -1 : d / ($a.length - c);
    }
    function Ua(a, b) {
      switch (a[0]) {
        case 0:
          return z(a[1]);
        case -1:
          return "DNF" + (b ? "(" + z(a[1]) + ")" : "");
        default:
          return z(a[0] + a[1]) + "+";
      }
    }
    function a(a) {
      if (2 == a.length) return "";
      var b = [];
      b.push(z(a[a.length - 1]));
      for (var d = a.length - 2; 1 <= d; d--) b.push(z(a[d] - a[d + 1]));
      return "=" + b.join("+");
    }
    function f(a) {
      return (
        "https://alg.cubing.net/?alg=" +
        encodeURIComponent(
          (a[4][0] || "").replace(/@(\d+)/g, "/*$1*/").replace(/-/g, "&#45;")
        ) +
        "&setup=" +
        encodeURIComponent(a[1] || "")
      );
    }
    function w(a) {
      a = ~~$(a.target).attr("data");
      var d = nb;
      0 != a && (d = new TimeStat(rb, $a.length, b.bind(void 0, a)));
      kb(d, Ra, 0 == a ? 0 : STATS_CURSPLIT.replace("%d", a));
    }
    function T(a, b, d) {
      var c = $a[a],
        f = c[0],
        h = [];
      h.push(
        '<td class="times">' +
          (c[2] && "*") +
          (a + 1) +
          '</td><td class="times">' +
          Ua(f, !1) +
          "</td>"
      );
      c = wb.runAvgMean(a - Db + 1, Db, 0, 0 < Eb ? void 0 : 0);
      var r = wb.runAvgMean(a - ub + 1, ub, 0, 0 < Jb ? void 0 : 0);
      h.push(
        "<td" +
          (c ? ' class="times"' : "") +
          ">" +
          (c ? n(c[0][0]) : "-") +
          "</td><td" +
          (r ? ' class="times"' : "") +
          ">" +
          (r ? n(r[0][0]) : "-") +
          "</td>"
      );
      if (1 < b) {
        h.push("<td>" + z(f[f.length - 1]) + "</td>");
        for (c = f.length - 2; 1 <= c; c--)
          h.push("<td>" + z(f[c] - f[c + 1]) + "</td>");
        for (c = f.length - 1; c < b; c++) h.push("<td>-</td>");
      }
      h = h.join("");
      d && d.html(h);
      return '<tr data="' + a + '">' + h + "</tr>";
    }
    function h(a) {
      pb.empty().unbind("click").click(w);
      var b = $a.length,
        d = wb.getAllStats();
      pb.append(
        '<th colspan="4" data="0" class="times">' +
          STATS_SOLVE +
          ": " +
          (b - d[0]) +
          "/" +
          b +
          "<br>" +
          STATS_AVG +
          ": " +
          n(d[1]) +
          "</th>"
      ).css("font-size", "1.2em");
      if (1 < a)
        for (b = 1; b <= a; b++)
          pb.append(
            '<th data="' + b + '" class="times">' + n(c(b)) + "</th>"
          ).css("font-size", "");
    }
    function Va() {
      if (!zb) {
        if (kernel.getProp("statsum")) {
          Za.css("display", "inline-block");
          nb.getAllStats();
          var a = $("<select>").change(function (a) {
            kernel.setProp("statsrc", $(a.target).val());
          });
          a.append($("<option>").val("t").html("time"));
          var b = ["t"];
          if (1 != sb)
            for (var d = 0; d < sb; d++)
              a.append(
                $("<option>")
                  .val("p" + (d + 1))
                  .html("P." + (d + 1))
              ),
                b.push("p" + (d + 1));
          d = kernel.getProp("statsrc", "t");
          -1 == b.indexOf(d)
            ? (a.append($("<option>").val("n").html("select")),
              a.val("n"),
              b.push("n"))
            : a.val(d);
          d = [];
          0 < $a.length
            ? (d.push(
                '<td class="times click" data="cs">' +
                  z(nb.timeAt($a.length - 1)) +
                  "</td>"
              ),
              d.push(
                '<td class="times click" data="bs">' + z(nb.bestTime) + "</td>"
              ))
            : (d.push("<td><span>-</span></td>"),
              d.push("<td><span>-</span></td>"));
          for (var c = [], f = 0; f < rb.length; f++) {
            var h = Math.abs(rb[f]);
            $a.length >= h &&
              (c.push("<tr><th>" + "am"[rb[f] >>> 31] + "o" + h + "</th>"),
              c.push(
                '<td class="times click" data="c' +
                  "am"[rb[f] >>> 31] +
                  f +
                  '">' +
                  n(nb.lastAvg[f][0]) +
                  "</td>"
              ),
              c.push(
                '<td class="times click" data="b' +
                  "am"[rb[f] >>> 31] +
                  f +
                  '">' +
                  n(nb.bestAvg[f][0]) +
                  "</td>"
              ));
          }
          vb.empty().append(
            $("<tr>").append(
              "<th></th><th>" + tb[1] + "</th><th>" + tb[0] + "</th>"
            ),
            $("<tr>").append(
              1 == b.length ? "<th>time</th>" : $("<th>").append(a),
              d.join("")
            ),
            c.join("")
          );
        } else vb.empty(), Za.hide();
        gb();
      }
    }
    function Ya() {
      if (!zb) {
        Va();
        Gb.update();
        Fb.update();
        Pb.update();
        Ob.update();
        var a = $a.length - 1,
          b = wb.runAvgMean(a - Db + 1, Db, 0, 0 < Eb ? void 0 : 0),
          d = wb.runAvgMean(a - ub + 1, ub, 0, 0 < Jb ? void 0 : 0);
        kernel.pushSignal("avg", [
          (0 < Eb ? "ao" : "mo") + Db + ": " + (b ? n(b[0][0]) : "-"),
          (0 < Jb ? "ao" : "mo") + ub + ": " + (d ? n(d[0][0]) : "-"),
          b ? [a - Db + 1, Db, 10 * Db, 0 > Eb] : void 0,
          d ? [a - ub + 1, ub, 10 * ub, 0 > Jb] : void 0,
          oa.bind(void 0, wb, Ra),
        ]);
      }
    }
    function Ta() {
      var a = kernel.getProp("statsrc", "t");
      return "t" == a ? Bb : "p" == a[0] ? b.bind(void 0, ~~a.slice(1)) : Bb;
    }
    function Wa(b, d, c) {
      var f = Ua(d[0], !0) + a(d[0]) + (d[2] ? "[" + d[2] + "]" : "");
      -1 != $.inArray(b, c) && (f = "(" + f + ")");
      kernel.getProp("printScr") && (f += "   " + d[1]);
      kernel.getProp("printDate") && (f += "   @" + mathlib.time2str(d[3]));
      return kernel.getProp("printScr") || kernel.getProp("printDate")
        ? b + 1 + ". " + f + " \n"
        : f + ", ";
    }
    function oa(a, b, d, c, f, h) {
      if (0 != a.timesLen) {
        var r = [0, [null], [null]],
          w = [];
        0 != d + c &&
          (h
            ? (r = a.runAvgMean(d, c, 0, 0)[0])
            : ((r = a.runAvgMean(d, c)[0]),
              (w = a.getTrimList(d, c, r[2], r[3]))));
        var z = "";
        if (kernel.getProp("printDate") && 2 < c) {
          z = b(d);
          var Ra = b(d + c - 1);
          z = tb[11]
            .replace("%s", mathlib.time2str(z && z[3]))
            .replace("%e", mathlib.time2str(Ra && Ra[3]));
          z = " (" + z + ")";
        }
        z = [mathlib.time2str(+new Date() / 1e3, tb[3]) + z + "\n"];
        1 < f &&
          (2 == f
            ? z.push(tb[8])
            : 10 == f
            ? z.push(tb[5])
            : h
            ? z.push(tb[6].replace("%mk", ~~(f / 10)))
            : z.push(tb[7].replace("%mk", ~~(f / 10))),
          z.push(": " + n(r[0])));
        z.push("\n\n" + tb[10] + "\n");
        for (f = 0; f < c; f++)
          z.push(Wa(kernel.getProp("absidx") ? d + f : f, b(d + f), w));
        z = z.join("").slice(0, -2);
        ob.val(z);
        kernel.showDialog(
          [
            ob,
            ab,
            void 0,
            ab,
            [
              STATS_EXPORTCSV,
              function () {
                Sa(a, b, d, c);
                return !1;
              },
            ],
          ],
          "stats",
          STATS_CURROUND
        );
        ob[0].select();
      }
    }
    function Sa(a, b, d, c) {
      if (0 != a.timesLen) {
        window.Blob || alert("Do not support your browser!");
        a = ["No.;Time;Comment;Scramble;Date"];
        for (var f = 0; f < sb; f++) a[0] += ";P." + (f + 1);
        for (f = 0; f < c; f++) {
          var h = b(d + f),
            r = [];
          r.push(f + 1);
          r.push(Ua(h[0], !0));
          r.push(h[2] ? h[2] : "");
          r.push(h[1]);
          r.push(mathlib.time2str(h[3]));
          r.push(z(h[0][h[0].length - 1]));
          for (var n = h[0].length - 2; 1 <= n; n--)
            r.push(z(h[0][n] - h[0][n + 1]));
          for (n = h[0].length - 1; n < sb; n++) r.push("");
          for (n = 0; n < r.length; n++) {
            h = r;
            var w = n,
              Ra = r[n];
            Ra = Ra.toString();
            if (-1 != Ra.indexOf(";") || -1 != Ra.indexOf("\n"))
              Ra = '"' + Ra.replace(/"/g, '""') + '"';
            h[w] = Ra;
          }
          a.push(r.join(";"));
        }
        a = a.join("\r\n");
        b = new Blob([a], { type: "text/csv" });
        d = $('<a class="click"/>').appendTo("body");
        d.attr("href", URL.createObjectURL(b));
        d.attr(
          "download",
          "csTimerExport_" +
            mathlib.time2str(new Date() / 1e3, "%Y%M%D_%h%m%s") +
            ".csv"
        );
        d[0].click();
        d.remove();
      }
    }
    function d(a, b, d) {
      d = $(d.target).attr("data");
      if (void 0 != d) {
        var c = ~~d.substr(2);
        switch (d.substr(0, 2)) {
          case "bs":
            oa(a, b, a.bestTimeIndex, 1, 10, !0);
            break;
          case "cs":
            oa(a, b, a.timesLen - 1, 1, 10, !0);
            break;
          case "ws":
            oa(a, b, a.worstTimeIndex, 1, 10, !0);
            break;
          case "bm":
            oa(a, b, a.bestAvgIndex[c], -rb[c], 10 * -rb[c], !0);
            break;
          case "cm":
            oa(a, b, a.timesLen + rb[c], -rb[c], 10 * -rb[c], !0);
            break;
          case "ba":
            oa(a, b, a.bestAvgIndex[c], rb[c], 10 * rb[c], !1);
            break;
          case "ca":
            oa(a, b, a.timesLen - rb[c], rb[c], 10 * rb[c], !1);
            break;
          case "tt":
            kb(a, b);
        }
      }
    }
    function b(a, b) {
      var d = $a[b][0];
      return -1 == d[0] || d.length <= a
        ? -1
        : Hb *
            ~~(
              (0 == a
                ? d[0] + d[1]
                : d[d.length - a] - (d[d.length - a + 1] || 0)) / Hb
            );
    }
    function Ra(a) {
      return $a[a];
    }
    function r(a) {
      for (var b = [], d = 0; d < a.length; d++) b.push(d);
      b.sort(function (b, d) {
        var c = a[b][3] || 0,
          f = a[d][3] || 0;
        return c == f ? b - d : c - f;
      });
      for (d = 0; d < a.length; d++) b[d] = a[b[d]];
      return b;
    }
    function ab() {
      ob.val("");
    }
    function kb(a, b, d) {
      var c = a.getAllStats(),
        f = c[0],
        h = a.runAvgMean(0, $a.length)[0];
      c = c[1];
      var r = a.timesLen,
        w = "";
      if (kernel.getProp("printDate") && 2 < r) {
        w = b(0);
        var Ra = b(r - 1);
        w = tb[11]
          .replace("%s", mathlib.time2str(w && w[3]))
          .replace("%e", mathlib.time2str(Ra && Ra[3]));
        w = " (" + w + ")";
      }
      w = [mathlib.time2str(+new Date() / 1e3, tb[3]) + w];
      w.push(tb[4].replace("%d", r - f + "/" + r) + "\n");
      w.push(tb[5]);
      w.push("    " + tb[0] + ": " + z(a.bestTime));
      w.push("    " + tb[2] + ": " + z(a.worstTime) + "\n");
      for (f = 0; f < rb.length; f++)
        (Ra = Math.abs(rb[f])),
          r >= Ra &&
            (w.push(tb[7 - (rb[f] >>> 31)].replace("%mk", Ra)),
            w.push(
              "    " +
                tb[1] +
                ": " +
                n(a.lastAvg[f][0]) +
                " (Ïƒ = " +
                ib(a.lastAvg[f][1], 2) +
                ")"
            ),
            w.push(
              "    " +
                tb[0] +
                ": " +
                n(a.bestAvg[f][0]) +
                " (Ïƒ = " +
                ib(a.bestAvg[f][1], 2) +
                ")\n"
            ));
      w.push(
        tb[8]
          .replace("%v", n(h[0]))
          .replace("%sgm", ib(h[1], 2))
          .replace(/[{}]/g, "")
      );
      w.push(tb[9].replace("%v", n(c) + "\n"));
      if (0 != r) {
        w.push(tb[10]);
        h = [];
        for (c = 0; c < r; c++) h.push(Wa(c, b(c), []));
        h = h.join("").slice(0, -2);
        w.push(h);
      }
      w = w.join("\n");
      ob.val(w);
      kernel.showDialog(
        [
          ob,
          ab,
          void 0,
          ab,
          [
            STATS_EXPORTCSV,
            function () {
              Sa(a, b, 0, r);
              return !1;
            },
          ],
        ],
        "stats",
        d || STATS_CURSESSION
      );
      ob[0].select();
    }
    function ib(a, b) {
      (a && a != Number.POSITIVE_INFINITY && a != Number.NEGATIVE_INFINITY) ||
        (a = 0);
      for (var d = "" + Math.round(a * Math.pow(10, b)); d.length < b + 1; )
        d = "0" + d;
      var c = d.length;
      return d.substr(0, c - b) + "." + d.substr(c - b, b);
    }
    function bb(a) {
      a = a.split(/[\s,;]+/);
      for (var b = /([am])o(\d+)/, d = [], c = 0; c < a.length; c++) {
        var f = b.exec(a[c]);
        if (!f) return !1;
        d.push(("a" == f[1] ? 1 : -1) * ~~f[2]);
      }
      d.sort(function (a, b) {
        return Math.abs(a) - Math.abs(b);
      });
      return d;
    }
    function lb(a) {
      (a = bb(a))
        ? ((rb = a),
          (nb = new TimeStat(rb, $a.length, Ta())),
          (wb = new TimeStat([], $a.length, Bb)),
          Kb.updateStatal(rb),
          Ya())
        : (kernel.setProp("statal", "mo3 ao5 ao12 ao100"), kernel.reprop());
    }
    function hb(a, b) {
      if ("time" == a) {
        var d = b;
        if ("string" == typeof d[0]) {
          var c = [
            d[2],
            d[1] || Mb,
            d[0],
            d[3] || Math.round((new Date().getTime() - d[2][1]) / 1e3),
          ];
          d[4] && c.push(d[4]);
          $a.push(c);
          d = d[2];
        } else
          $a.push([d, Mb, "", Math.round((new Date().getTime() - d[1]) / 1e3)]);
        nb.pushed();
        wb.pushed();
        Cb.save($a.length - 1);
        d.length - 1 > sb ? xb.updateTable(!0) : xb.appendRow($a.length - 1);
        Ya();
        kernel.pushSignal("timestd", $a[$a.length - 1]);
      } else
        "scramble" == a || "scrambleX" == a
          ? (Mb = b[1])
          : "property" == a
          ? /^(:?useMilli|timeFormat|stat[12][tl]|statinv)$/.exec(b[0])
            ? ((Hb = kernel.getProp("useMilli") ? 1 : 10),
              (Eb =
                [1, -1][~~kernel.getProp("stat1t")] * kernel.getProp("stat1l")),
              (Jb =
                [1, -1][~~kernel.getProp("stat2t")] * kernel.getProp("stat2l")),
              (Db = Math.abs(Eb)),
              (ub = Math.abs(Jb)),
              xb.updateTable(!1))
            : "statsum" == b[0]
            ? Va()
            : "statal" == b[0]
            ? ((d = b[1]),
              "u" == d &&
                ((d = "modify" == b[2]),
                (c = kernel.getProp("statalu")),
                d || !/^\s*([am]o\d+[\s,;]*)+\s*$/.exec(c)) &&
                ((d = prompt("Statistics Details", c || "mo3 ao5 ao12 ao100")),
                /^\s*([am]o\d+[\s,;]*)+\s*$/.exec(d) && bb(d)
                  ? kernel.setProp("statalu", d)
                  : (null != d && alert("INVALID VALUES!"),
                    kernel.setProp("statal", "mo3 ao5 ao12 ao100"),
                    kernel.reprop())),
              (d = kernel.getProp("statal")),
              lb("u" == d ? kernel.getProp("statalu") : d))
            : "statalu" == b[0]
            ? lb(b[1])
            : "trim" == b[0]
            ? (nb.reset($a.length),
              wb.reset($a.length),
              Kb.updateStatal(rb),
              Ya())
            : "view" == b[0]
            ? gb()
            : "statHide" == b[0]
            ? b[1]
              ? mb.hide()
              : mb.show()
            : "statsrc" == b[0]
            ? ((nb = new TimeStat(rb, $a.length, Ta())), Ya())
            : "wndStat" == b[0]
            ? gb()
            : "sr_statal" == b[0] && kernel.setProp("sr_statalu", b[1])
          : "ctrl" == a && "stats" == b[0]
          ? "clr" == b[1]
            ? Cb.getButton().click()
            : "undo" == b[1]
            ? Ab.delLast()
            : "OK" == b[1]
            ? Ab.setCfm(0)
            : "+2" == b[1]
            ? Ab.setCfm(2e3)
            : "DNF" == b[1] && Ab.setCfm(-1)
          : "ashow" != a || b
          ? "button" == a && "stats" == b[0] && b[1] && setTimeout(gb, 50)
          : xb.hideAll();
    }
    function gb() {
      $("html").hasClass("m")
        ? qb.height(Math.max(Za.height(), pb.height() + 2 * eb.height()))
        : null != qb[0].offsetParent &&
          qb.outerHeight(
            ~~(
              jb.height() -
              (mb.is(":hidden") ? 0 : mb.outerHeight()) -
              Za.outerHeight() -
              5
            )
          );
    }
    var $a = [],
      jb = $('<div id="stats" />'),
      ob = $('<textarea rows="10" readonly />'),
      qb = $('<div class="myscroll" />'),
      mb = $("<div>"),
      cb = $("<table />")
        .click(function (a) {
          a = $(a.target);
          if (a.is("td") && "-" != a.html()) {
            var b = a.prevAll(),
              d = b.length;
            b = ~~(0 == d ? a : b.eq(-1)).html().replace("*", "") - 1;
            if (!(4 < d || 0 > d))
              switch (d) {
                case 0:
                  if (kernel.getProp("rsfor1s")) {
                    oa(nb, Ra, b, 1, 10, !0);
                    break;
                  }
                case 1:
                  Ab.proc(b, a);
                  break;
                case 2:
                  oa(nb, Ra, b - Db + 1, Db, 10 * Db, 0 > Eb);
                  break;
                case 3:
                  oa(nb, Ra, b - ub + 1, ub, 10 * ub, 0 > Jb);
              }
          }
        })
        .addClass("table"),
      eb = $("<tr />"),
      pb = $("<tr />"),
      fb = $('<tr class="click" ><th class="click" colspan="15">...</th></tr>'),
      vb = $('<table class="sumtable" />')
        .click(function (a) {
          d(nb, Ra, a);
        })
        .addClass("table"),
      Za = $('<div class="statc" />'),
      zb = !0,
      xb = (function () {
        function b(a) {
          sb = 1;
          for (a = 0; a < $a.length; a++)
            sb = Math.max(sb, $a[a][0].length - 1);
          eb.empty().append(
            w,
            "<th>" +
              STATS_TIME +
              "</th><th>" +
              (0 < Eb ? "ao" : "mo") +
              Db +
              "</th><th>" +
              (0 < Jb ? "ao" : "mo") +
              ub +
              "</th>"
          );
          if (1 < sb)
            for (a = 0; a < sb; a++) eb.append("<th>P." + (a + 1) + "</th>");
          z = [];
          Ra = $a.length - 1;
          kernel.getProp("statinv")
            ? cb.empty().append(eb, fb, pb)
            : cb.empty().append(pb, eb, fb);
          c();
          0 > Ra
            ? fb.unbind("click").hide()
            : fb.unbind("click").click(xb.showAll).show();
          w.unbind("click").click(d);
          h(sb);
          Ya();
          qb.scrollTop(kernel.getProp("statinv") ? cb[0].scrollHeight : 0);
        }
        function d() {
          var a = prompt(
            "Filter Pattern: (23*, 15.1*, comments, scrambles, date)"
          );
          null != a &&
            a != n &&
            ((n = a
              ? (a + "")
                  .replace(/[.\\+*?\[\^\]$(){}=!<>|:\-]/g, "\\$&")
                  .replace(/\\\*/g, ".*")
                  .replace(/\\\?/g, ".")
              : ".*"),
            (r = new RegExp(n, "g")),
            b(!0));
        }
        function c() {
          for (var b = z.length + 50, d = []; 0 <= Ra && z.length < b; ) {
            var c = $a[Ra];
            if (
              r.exec(Ua(c[0], !0) + a(c[0])) ||
              r.exec(c[1]) ||
              r.exec(c[2]) ||
              r.exec(mathlib.time2str(c[3]))
            )
              d.push(T(Ra, sb)), z.push(Ra);
            Ra--;
          }
          kernel.getProp("statinv")
            ? fb.after(d.reverse().join(""))
            : fb.before(d.join(""));
        }
        function f(a) {
          c();
          0 > Ra && fb.unbind("click").hide();
        }
        var r = /.*/,
          n = ".*",
          w = $('<th class="click">').html("&#8981;"),
          z = [],
          Ra = 0;
        return {
          appendRow: function (a) {
            var d = T(a, sb);
            kernel.getProp("statinv")
              ? (pb.before(d), qb.scrollTop(cb[0].scrollHeight))
              : (eb.after(d), qb.scrollTop(0));
            z.unshift(a);
            h(sb);
            50 < z.length && xb.hideAll();
            ".*" != n && ((n = ".*"), (r = /.*/), b(!0));
          },
          showAll: f,
          hideAll: function () {
            for (; 50 < z.length; )
              (kernel.getProp("statinv") ? fb.next() : fb.prev()).remove(),
                (Ra = z.pop());
            0 < Ra && fb.unbind("click").click(f).show();
          },
          updateTable: b,
          updateFrom: function (a) {
            for (
              var b = a.attr("data"),
                d = Math.min(b + Math.max(Db, ub), $a.length);
              void 0 !== b && b < d && 0 <= b;

            )
              T(~~b, sb, a),
                (a = kernel.getProp("statinv") ? a.next() : a.prev()),
                (b = a.attr("data"));
            h(sb);
          },
        };
      })(),
      Ab = (function () {
        function b() {
          $a[cb][2] = Sa.val();
          Cb.save(cb);
          T(cb, sb, Za);
        }
        function d(b) {
          b = $(b.target);
          var d = b.attr("data");
          d &&
            ("p" == d
              ? ((b = { " OK ": 0, " +2 ": 2e3, " DNF ": -1 }[b.html()]),
                r(b, cb, Za))
              : "d" == d
              ? Xa(cb) && ((cb = void 0), c())
              : "s" == d
              ? ((b = $a[cb]),
                $.clipboardCopy(b[1]) && logohint.push("scramble copied"))
              : "c" == d &&
                ((b = $a[cb]),
                $.clipboardCopy(
                  Ua(b[0], !0) +
                    a(b[0]) +
                    (b[2] ? "[" + b[2] + "]" : "") +
                    "   " +
                    b[1] +
                    "   @" +
                    mathlib.time2str(b[3])
                ) && logohint.push("solve copied")));
        }
        function c() {
          kernel.isDialogShown("cfm") && kernel.hideDialog();
          ab &&
            (w.css("font-size", "0.8em"),
            ab.empty().append(w),
            (cb = $a.length - 1),
            (Za = kernel.getProp("statinv") ? pb.prev() : eb.next()),
            h());
        }
        function h() {
          if ($a[cb]) {
            var c = $a[cb],
              h = "";
            c[4] &&
              ((h = $('<a target="_blank">' + STATS_REVIEW + "</a>").addClass(
                "click"
              )),
              h.attr("href", f(c)),
              (h = $("<tr>").append(
                $("<td>").append(h),
                $("<td>").append(Va)
              )));
            w.empty()
              .append(z, "<br>", a(c[0]), "<br>")
              .append(
                '<span class="click" data="c"> &#128203; </span>|<span class="click" data="p"> OK </span>|<span class="click" data="p"> +2 </span>|<span class="click" data="p"> DNF </span>| ',
                Qa
              )
              .append(
                "<br>",
                $('<table style="display:inline-block;">').append(
                  $("<tr>").append(
                    "<td>" + STATS_COMMENT + "</td>",
                    $("<td>").append(Sa)
                  ),
                  $("<tr>").append(
                    '<td><span class="click" data="s">' +
                      SCRAMBLE_SCRAMBLE +
                      "</span></td>",
                    $("<td>").append(Ta)
                  ),
                  $("<tr>").append(
                    "<td>" + STATS_DATE + "</td>",
                    $("<td>").append(Wa)
                  ),
                  h
                )
              )
              .unbind("click")
              .click(d);
            z.html(Ua(c[0], !0));
            Ta.val(c[1]);
            Wa.val(mathlib.time2str(c[3]));
            Sa.val(c[2]).unbind("change").change(b);
            Va.val(c[4] ? JSON.stringify(c[4]) : "");
          } else w.empty();
        }
        function r(a, b, d) {
          $a[b][0][0] != a &&
            (($a[b][0][0] = a),
            nb.reset($a.length),
            wb.reset($a.length),
            Cb.save(b),
            xb.updateFrom(d),
            Ya(),
            b == cb && h(),
            kernel.pushSignal("timepnt", $a[b]));
        }
        function n(a, b) {
          ab = a;
          void 0 != a && c();
        }
        var w = $('<div style="text-align:center; font-family: initial;">'),
          z = $('<span style="font-size:2.5em;"/>'),
          Sa = $('<input type="text">').css("width", "8em"),
          Qa = $('<input type="button" data="d">').val("X"),
          Ta = $('<input type="text" readonly>').css("width", "8em"),
          Wa = $('<input type="text" readonly>').css("width", "8em"),
          Va = $('<input type="text" readonly>').css("width", "8em"),
          cb = 0,
          Za,
          ab;
        $(function () {
          tools.regTool("cfm", TOOLS_CFMTIME, n);
          kernel.regListener("cfm", "session", c);
        });
        return {
          proc: function (a, b) {
            cb = a;
            Za = b.parent();
            h();
            w.css("font-size", "1.2em");
            kernel.showDialog(
              [
                w,
                c,
                void 0,
                c,
                [
                  STATS_SSSTAT,
                  function () {
                    c();
                    oa(nb, Ra, a, 1, 10, !0);
                  },
                ],
              ],
              "cfm",
              "Solves No." + (a + 1)
            );
          },
          delLast: function () {
            0 != $a.length && Xa($a.length - 1) && ((cb = void 0), c());
          },
          setCfm: function (a) {
            0 != $a.length &&
              r(
                a,
                $a.length - 1,
                kernel.getProp("statinv") ? pb.prev() : eb.next()
              );
          },
        };
      })(),
      sb = 0,
      rb = [-3, 5, 12, 50, 100, 1e3],
      nb = new TimeStat(rb, 0, Bb),
      wb = new TimeStat([], 0, Bb),
      tb = STATS_STRING.split("|");
    for (Qa = 0; 13 > Qa; Qa++) tb[Qa] = tb[Qa] || "";
    var Kb = (function () {
        function a(a) {
          return -1 == cb[a][0][0]
            ? -1
            : ~~((cb[a][0][0] + cb[a][0][1]) / Hb) * Hb;
        }
        function b(a) {
          return cb[a];
        }
        function c() {
          cb = [];
          for (
            var a = Promise.resolve(),
              b = ~~kernel.getProp("sessionN"),
              d = JSON.parse(kernel.getProp("sessionData")),
              c = Sa.val(),
              f = Ta.val(),
              h =
                -1 == Qa.val() ? -1 : ~~(+new Date() / 1e3) - 86400 * Qa.val(),
              w = 0;
            w < b;
            w++
          ) {
            var Ra = Cb.rank2idx(w + 1);
            if ("*" == c || d[Ra].name == c)
              if ("*" == f || (d[Ra].opt.scrType || "333") == f)
                a = a.then(
                  function (a) {
                    return new Promise(function (b) {
                      storage.get(a).then(function (a) {
                        for (var d = 0; d < a.length; d++)
                          (a[d][3] || 0) < h || cb.push(a[d]);
                        b();
                      });
                    });
                  }.bind(void 0, Ra)
                );
          }
          a.then(function () {
            cb = r(cb);
            Va.reset(cb.length);
            var a = Va.getAllStats(),
              b = a[0],
              d = a[1],
              c = 0;
            for (a = 0; a < cb.length; a++) c += cb[a][0][1];
            a = [];
            a.push(
              '<span class="click" data="tt">' +
                tb[4].replace("%d", Va.timesLen - b + "/" + Va.timesLen) +
                ", " +
                tb[9].replace("%v", n(d)) +
                "</span>\n"
            );
            a.push("<span>" + tb[12].replace("%d", z(c)) + "</span>\n");
            a.push(
              tb[0] +
                ': <span class="click" data="bs">' +
                z(Va.bestTime) +
                "</span>"
            );
            a.push(
              " | " +
                tb[2] +
                ': <span class="click" data="ws">' +
                z(Va.worstTime) +
                "</span>\n"
            );
            b = !1;
            d =
              '<table class="table"><tr><td></td><td>' +
              tb[1] +
              "</td><td>" +
              tb[0] +
              "</td></tr>";
            for (c = 0; c < rb.length; c++) {
              var f = Math.abs(rb[c]);
              Va.timesLen >= f &&
                (b || ((b = !0), a.push(d)),
                a.push("<tr><td>" + tb[7 - (rb[c] >>> 31)].replace("%mk", f)),
                a.push(
                  '<td><span class="click" data="c' +
                    "am"[rb[c] >>> 31] +
                    c +
                    '">' +
                    n(Va.lastAvg[c][0]) +
                    " (Ïƒ=" +
                    ib(Va.lastAvg[c][1], 2) +
                    ")</span></td>"
                ),
                a.push(
                  '<td><span class="click" data="b' +
                    "am"[rb[c] >>> 31] +
                    c +
                    '">' +
                    n(Va.bestAvg[c][0]) +
                    " (Ïƒ=" +
                    ib(Va.bestAvg[c][1], 2) +
                    ")</span></td></tr>"
                ));
            }
            b && a.push("</table>");
            a = a.join("");
            T.html(a.replace(/\n/g, "<br>"));
          });
        }
        function f() {
          var a = !1,
            b = JSON.parse(kernel.getProp("sessionData"));
          $.each(b, function (b, d) {
            (eb[b] &&
              d.name == eb[b].name &&
              (d.opt || {}).scrType == (eb[b].opt || {}).scrType) ||
              (a = !0);
          });
          eb = b;
          if (a) {
            var d = [],
              c = [];
            Sa.empty().append(
              $("<option />").val("*").html(STATS_XSESSION_NAME)
            );
            Ta.empty().append(
              $("<option />").val("*").html(STATS_XSESSION_SCR)
            );
            $.each(b, function (a, b) {
              var f = b.name;
              -1 == $.inArray(f, d) &&
                (d.push(f), Sa.append($("<option />").val(f).html(f)));
              f = (b.opt || {}).scrType || "333";
              -1 == $.inArray(f, c) &&
                (c.push(f),
                Ta.append(
                  $("<option />").val(f).html(scramble.getTypeName(f))
                ));
            });
          }
        }
        function h(a, h) {
          (Ua = a) &&
            !/^scr/.exec(h) &&
            (f(),
            a.empty().append(oa),
            Wa.unbind("click").click(c),
            T.unbind("click").click(function (a) {
              d(Va, b, a);
            }));
        }
        function w(a, b) {
          "sessionData" == b[0] && Ua && f();
        }
        var Ra = STATS_XSESSION_DATE.split("|"),
          oa = $("<div />")
            .css("text-align", "center")
            .css("font-size", "0.7em"),
          T = $("<div />"),
          Sa = $("<select>"),
          Qa = $("<select>")
            .append(
              $("<option>").val(-1).html(Ra[0]),
              $("<option>").val(1).html(Ra[1]),
              $("<option>").val(7).html(Ra[2]),
              $("<option>").val(30).html(Ra[3]),
              $("<option>").val(365).html(Ra[4])
            )
            .val(-1),
          Ta = $("<select>"),
          Wa = $('<span class="click">' + STATS_XSESSION_CALC + "</span>"),
          Va = new TimeStat([], 0, a),
          cb = [],
          Ua = null,
          eb = {};
        $(function () {
          oa.append(Sa, Qa, Ta, " ", Wa, "<br>", T);
          "undefined" != typeof tools &&
            tools.regTool("hugestats", TOOLS_HUGESTATS, h);
          kernel.regListener("labelstat", "property", w, /^sessionData$/);
        });
        return {
          update: $.noop,
          updateStatal: function (b) {
            Va = new TimeStat(b, 0, a);
          },
        };
      })(),
      Gb = (function () {
        function a() {
          if (f) {
            var a = nb.getAllStats(),
              b = a[0],
              d = a[1],
              h = 0;
            for (a = 0; a < $a.length; a++) h += $a[a][0][1];
            a = [];
            a.push(
              '<span class="click" data="tt">' +
                tb[4].replace("%d", nb.timesLen - b + "/" + nb.timesLen) +
                ", " +
                tb[9].replace("%v", n(d)) +
                "</span>\n"
            );
            a.push("<span>" + tb[12].replace("%d", z(h)) + "</span>\n");
            a.push(
              tb[0] +
                ': <span class="click" data="bs">' +
                z(nb.bestTime) +
                "</span>"
            );
            a.push(
              " | " +
                tb[2] +
                ': <span class="click" data="ws">' +
                z(nb.worstTime) +
                "</span>\n"
            );
            b = !1;
            d =
              '<table class="table"><tr><td></td><td>' +
              tb[1] +
              "</td><td>" +
              tb[0] +
              "</td></tr>";
            for (h = 0; h < rb.length; h++) {
              var r = Math.abs(rb[h]);
              nb.timesLen >= r &&
                (b || ((b = !0), a.push(d)),
                a.push("<tr><td>" + tb[7 - (rb[h] >>> 31)].replace("%mk", r)),
                a.push(
                  '<td><span class="click" data="c' +
                    "am"[rb[h] >>> 31] +
                    h +
                    '">' +
                    n(nb.lastAvg[h][0]) +
                    " (Ïƒ=" +
                    ib(nb.lastAvg[h][1], 2) +
                    ")</span></td>"
                ),
                a.push(
                  '<td><span class="click" data="b' +
                    "am"[rb[h] >>> 31] +
                    h +
                    '">' +
                    n(nb.bestAvg[h][0]) +
                    " (Ïƒ=" +
                    ib(nb.bestAvg[h][1], 2) +
                    ")</span></td></tr>"
                ));
            }
            b && a.push("</table>");
            a = a.join("");
            c.html(a.replace(/\n/g, "<br>"));
          }
        }
        function b(b, h) {
          (f = void 0 != b) &&
            !/^scr/.exec(h) &&
            (b.empty().append(
              c.unbind("click").click(function (a) {
                d(nb, Ra, a);
              })
            ),
            a());
        }
        var c = $("<div />")
            .css("text-align", "center")
            .css("font-size", "0.7em"),
          f = !1;
        $(function () {
          "undefined" != typeof tools && tools.regTool("stats", TOOLS_STATS, b);
        });
        return { update: a };
      })(),
      Bb = b.bind(void 0, 0),
      Fb = (function () {
        function a() {
          if (c) {
            d.empty();
            var a = wb.getMinMaxInt();
            if (a) {
              var b = a[0],
                f = a[1];
              a = a[2];
              b = ~~(b / a);
              f = ~~(f / a);
              for (
                var h = {}, r = {}, n = 0, w = (r[b + 1] = 0);
                w < $a.length;
                w++
              ) {
                var Ra = Bb(w);
                -1 != Ra
                  ? ((Ra = ~~(Ra / a)),
                    (h[Ra] = (h[Ra] || 0) + 1),
                    (n = Math.max(h[Ra], n)),
                    (r[Ra] = w + 1))
                  : (r[b + 1] = w + 1);
              }
              for (w = b; w > f; w--) r[w] = Math.max(r[w + 1], r[w] || 0);
              Ra = [];
              var oa = 0,
                T = 1e3 <= a ? /[^\.]+(?=\.)/ : /[^\.]+\.[\d]/,
                Sa = z(b * a).match(T)[0].length;
              for (w = f; w <= b; w++) {
                f = z(w * a).match(T)[0];
                var Qa = z((w + 1) * a).match(T)[0];
                h[w] = h[w] || 0;
                oa += h[w];
                f = mathlib.valuedArray(Sa - f.length, "&nbsp;").join("") + f;
                Qa =
                  mathlib.valuedArray(Sa - Qa.length, "&nbsp;").join("") + Qa;
                Ra.push(
                  "<tr><td>" +
                    f +
                    '+</td><td><span class="cntbar" style="width: ' +
                    (h[w] / n) * 5 +
                    'em;">' +
                    h[w] +
                    "</span></td><td>&nbsp;&lt;" +
                    Qa +
                    '</td><td><span class="cntbar" style="width: ' +
                    (oa / $a.length) * 5 +
                    'em; white-space: nowrap;">' +
                    ($a.length - r[w + 1]) +
                    "/" +
                    oa +
                    "</span></td></tr>"
                );
              }
              d.html('<table style="border:none;">' + Ra.join("") + "</table>");
            }
          }
        }
        function b(b, f) {
          (c = void 0 != b) && !/^scr/.exec(f) && (b.empty().append(d), a());
        }
        var d = $("<div />"),
          c = !1;
        $(function () {
          "undefined" != typeof tools &&
            (kernel.regListener(
              "distribution",
              "property",
              function (b, d) {
                "disPrec" == d[0] && a();
              },
              /^disPrec$/
            ),
            kernel.regProp(
              "tools",
              "disPrec",
              1,
              STATS_PREC,
              [
                "a",
                ["a", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                STATS_PREC_STR.split("|"),
              ],
              1
            ),
            tools.regTool("distribution", TOOLS_DISTRIBUTION, b));
        });
        return { update: a };
      })(),
      Pb = (function () {
        function a() {
          if (h && c[0].getContext) {
            f = c[0].getContext("2d");
            var a = kernel.getProp("imgSize") / 10;
            r = 50;
            c.width(12 * a + "em");
            c.height(6 * a + "em");
            c.attr("width", 10 * r + 1);
            c.attr("height", 5 * r + 5);
            n = 5 * r;
            r *= 10;
            f.lineWidth = 2;
            f.font = "12pt Arial";
            f.fillText("time", 50, 13);
            f.strokeStyle = "#888";
            f.beginPath();
            f.moveTo(90, 7);
            f.lineTo(150, 7);
            f.stroke();
            f.fillText((0 < Eb ? "ao" : "mo") + Db, 200, 13);
            f.strokeStyle = "#f00";
            f.beginPath();
            f.moveTo(240, 7);
            f.lineTo(300, 7);
            f.stroke();
            f.fillText((0 < Jb ? "ao" : "mo") + ub, 350, 13);
            f.strokeStyle = "#00f";
            f.beginPath();
            f.moveTo(390, 7);
            f.lineTo(450, 7);
            f.stroke();
            if ((a = wb.getMinMaxInt())) {
              var d = a[2],
                w = Math.ceil(a[0] / d) * d;
              a = ~~(a[1] / d) * d;
              var Ra = w - a,
                oa = 1e3 <= d ? /[^\.]+(?=\.)/ : /[^\.]+\.[\d]/,
                T = [0, 1, 1, 0, 0],
                Sa = [0, 0, 1, 1, 0];
              f.fillStyle = "#fff";
              f.beginPath();
              f.moveTo(T[0] * (r - 35) + 35, (1 - Sa[0]) * (n - 25) + 25);
              for (var Qa = 1; Qa < T.length; Qa++)
                f.lineTo(T[Qa] * (r - 35) + 35, (1 - Sa[Qa]) * (n - 25) + 25);
              f.fill();
              f.closePath();
              f.fillStyle = "#000";
              f.strokeStyle = "#ccc";
              f.lineWidth = 1;
              f.textAlign = "right";
              for (T = a; T <= w; T += d)
                b([0, 1], [(T - a) / Ra, (T - a) / Ra], "#ccc"),
                  (Sa = z(T).match(oa)[0]),
                  f.fillText(Sa, 30, ((w - T) / Ra) * (n - 25) + 30);
              f.lineWidth = 2;
              if (1 < $a.length) {
                d = [];
                w = [];
                for (T = 0; T < $a.length; T++)
                  (oa = Bb(T)),
                    -1 != oa &&
                      (d.push(T / ($a.length - 1)),
                      w.push(Math.max(0, Math.min(1, (oa - a) / Ra))));
                b(d, w, "#888");
              }
              if ($a.length > Db) {
                d = [];
                w = [];
                oa = wb.runAvgMean(0, $a.length, Db, 0 < Eb ? void 0 : 0);
                for (T = 0; T < oa.length; T++)
                  -1 != oa[T][0] &&
                    (d.push((T + Db - 1) / ($a.length - 1)),
                    w.push(Math.max(0, Math.min(1, (oa[T][0] - a) / Ra))));
                b(d, w, "#f00");
              }
              if ($a.length > ub) {
                d = [];
                w = [];
                oa = wb.runAvgMean(0, $a.length, ub, 0 < Jb ? void 0 : 0);
                for (T = 0; T < oa.length; T++)
                  -1 != oa[T][0] &&
                    (d.push((T + ub - 1) / ($a.length - 1)),
                    w.push(Math.max(0, Math.min(1, (oa[T][0] - a) / Ra))));
                b(d, w, "#00f");
              }
              b([0, 1, 1, 0, 0], [0, 0, 1, 1, 0], "#000");
            }
          }
        }
        function b(a, b, d) {
          f.strokeStyle = d;
          f.beginPath();
          f.moveTo(a[0] * (r - 35) + 35, (1 - b[0]) * (n - 25) + 25);
          for (d = 1; d < a.length; d++)
            f.lineTo(a[d] * (r - 35) + 35, (1 - b[d]) * (n - 25) + 25);
          f.stroke();
          f.closePath();
        }
        function d(b, d) {
          (h = void 0 != b) && !/^scr/.exec(d) && (b.empty().append(c), a());
        }
        var c = $("<canvas />"),
          f,
          h = !1,
          r,
          n;
        $(function () {
          "undefined" != typeof tools &&
            (kernel.regListener(
              "trend",
              "property",
              function (b, d) {
                "disPrec" == d[0] && a();
              },
              /^disPrec$/
            ),
            c[0].getContext && tools.regTool("trend", TOOLS_TREND, d));
        });
        return { update: a };
      })(),
      Cb = (function () {
        function a(a) {
          bb = a;
          kernel.setProp("session", bb);
          fb[bb] = fb[bb] || { name: bb, opt: {} };
          kernel.setSProps(fb[bb].opt || {});
          b();
          return Qa();
        }
        function b() {
          for (var a = 1; a <= kb; a++) {
            "object" != typeof fb[a] && (fb[a] = {});
            var b = { name: a, opt: {} },
              c;
            for (c in b) void 0 === fb[a][c] && (fb[a][c] = b[c]);
            fb[a].scr && ((fb[a].opt.scrType = fb[a].scr), delete fb[a].scr);
            fb[a].phases &&
              ((fb[a].opt.phases = fb[a].phases), delete fb[a].phases);
            fb[a].rank = fb[a].rank || a;
          }
          d();
          lb.empty();
          for (a = 0; a < hb.length; a++)
            lb.append($("<option />").val(hb[a]).html(fb[hb[a]].name));
          lb.append(gb, ob);
          lb.val(bb);
        }
        function d() {
          hb = [];
          for (var a = 1; a <= kb; a++) hb.push(a);
          hb.sort(function (a, b) {
            return fb[a].rank - fb[b].rank;
          });
          for (a = 0; a < hb.length; a++) fb[hb[a]].rank = a + 1;
          kernel.setProp("sessionData", JSON.stringify(fb));
        }
        function c(a) {
          return fb[a].rank + "-" + fb[a].name;
        }
        function f(a, d) {
          $.isNumeric(a) || (a = (fb[bb] || {}).rank || kb);
          bb = ++kb;
          var c = new Date();
          c = c.getMonth() + 1 + "." + c.getDate() + " " + Ib;
          kernel.setProp("sessionN", kb);
          var f = fb[hb[a - 1]] || {};
          fb[bb] =
            void 0 === d || d
              ? {
                  name: f.name || c,
                  opt: JSON.parse(JSON.stringify(f.opt || {})),
                  rank: a + 0.5,
                }
              : { name: c, opt: kernel.getSProps(), rank: a + 0.5 };
          b();
        }
        function h(b, d) {
          f(b, d);
          $a = [];
          wb.reset($a.length);
          nb.reset($a.length);
          Ta();
          a(bb);
          kernel.blur();
          kernel.getProp("imrename") && oa(bb, !0);
        }
        function w(b) {
          b != kb && (fb[b] = fb[kb]);
          delete fb[kb];
          storage.del(b, kb);
          kb--;
          kernel.setProp("sessionN", kb);
          kernel.setProp("sessionData", JSON.stringify(fb));
          0 == kb
            ? h()
            : bb == b
            ? kernel.setProp("session", 1)
            : bb == kb + 1 && a(b);
        }
        function z(a) {
          if (
            0 != ("stat" in fb[a] ? fb[a].stat[0] : 1) &&
            !confirm(STATS_CFM_DELSS.replace("%s", c(a)))
          )
            return !1;
          w(a);
          return !0;
        }
        function Ra() {
          confirm(STATS_CFM_RESET) &&
            (($a = []),
            nb.reset(),
            wb.reset(),
            Ta(),
            xb.updateTable(!1),
            kernel.blur());
        }
        function oa(a, b) {
          void 0 === a && (a = bb);
          var d = prompt(
            b ? STATS_SESSION_NAMEC : STATS_SESSION_NAME,
            fb[a].name
          );
          null != d &&
            ((d = $("<div/>").text(d).html()),
            (fb[a].name = d),
            kernel.setProp("sessionData", JSON.stringify(fb)));
        }
        function T(a, b) {
          zb = !1;
          $a = b;
          nb.reset($a.length);
          wb.reset($a.length);
          xb.updateTable(!1);
          fb[a] = fb[a] || { name: a, opt: {} };
          fb[a].stat = [$a.length].concat(wb.getAllStats());
          fb[a].date = [($a[0] || [])[3], ($a[$a.length - 1] || [])[3]];
          kernel.setProp("sessionData", JSON.stringify(fb));
          kernel.isDialogShown("ssmgr") && Xa();
          kernel.pushSignal("session", "load");
        }
        function Qa() {
          return storage.get(bb).then(T.bind(void 0, bb));
        }
        function Ta(a) {
          fb[bb].stat = [$a.length].concat(wb.getAllStats());
          fb[bb].date = [($a[0] || [])[3], ($a[$a.length - 1] || [])[3]];
          kernel.setProp("sessionData", JSON.stringify(fb));
          return storage.set(bb, $a, a);
        }
        function Wa(d) {
          d = $(d.target);
          if (
            d.is("td, th, select") &&
            (d.hasClass("click") || d.is("select"))
          ) {
            for (var c = d.parent(); !c.is("tr"); ) c = c.parent();
            var f = c.children();
            5 > f.length && (f = c.prev().children());
            c = ~~f.first().html().replace(/-.*$/, "");
            f = hb[c - 1];
            switch (d.attr("data") || d.val()) {
              case "r":
                oa(f);
                break;
              case "u":
                1 != c &&
                  (fb[f].rank--,
                  fb[hb[c - 2]].rank++,
                  kernel.setProp("sessionData", JSON.stringify(fb)));
                break;
              case "d":
                c != hb.length &&
                  (fb[f].rank++,
                  fb[hb[c]].rank--,
                  kernel.setProp("sessionData", JSON.stringify(fb)));
                break;
              case "s":
                a(f);
                break;
              case "+":
                h(c);
                break;
              case "x":
                z(f);
                break;
              case "m":
                cb(f);
                break;
              case "o":
                Ua();
                break;
              case "p":
                Va();
                break;
              case "e":
                Za(d.parent());
                return;
              case "g":
                vb = !1;
                break;
              case "gn":
                vb = "name";
                break;
              case "gs":
                vb = "scr";
                break;
              case "v":
                storage.get(f).then(function (a) {
                  Sa(
                    new TimeStat(
                      [],
                      a.length,
                      function (a, b) {
                        return -1 == a[b][0][0]
                          ? -1
                          : ~~((a[b][0][0] + a[b][0][1]) / Hb) * Hb;
                      }.bind(void 0, a)
                    ),
                    function (a, b) {
                      return a[b];
                    }.bind(void 0, a),
                    0,
                    a.length
                  );
                });
                break;
              default:
                return;
            }
            kernel.blur();
            b();
            Xa();
          }
        }
        function Va() {
          var a = prompt(
            STATS_PROMPTSPL.replace("%s", c(bb)),
            ~~($a.length / 2)
          );
          if (null != a)
            if (((a = ~~a), 1 > a || a > $a.length - 1)) alert(STATS_ALERTSPL);
            else {
              var b = bb,
                d = $a.slice(-a);
              f();
              storage.set(bb, d).then(function () {
                bb = b;
                $a = $a.slice(0, -a);
                nb.reset();
                wb.reset();
                Ta();
                T(bb, $a);
              });
            }
        }
        function cb(b) {
          if (
            bb != b &&
            confirm(STATS_ALERTMG.replace("%f", c(bb)).replace("%t", c(b)))
          ) {
            var d = bb;
            storage
              .get(b)
              .then(function (a) {
                Array.prototype.push.apply(a, $a);
                return storage.set(b, a);
              })
              .then(function (c) {
                delete fb[b].stat;
                fb[bb].date = [(c[0] || [])[3], (c[c.length - 1] || [])[3]];
                kernel.setProp("sessionData", JSON.stringify(fb));
                a(b);
                w(d);
              });
          }
        }
        function Ua() {
          for (var a = r($a), b = 0, d = 0; d < $a.length; d++)
            a[d] != $a[d] && b++;
          0 == b
            ? logohint.push("Already sorted")
            : confirm(STATS_SSMGR_SORTCFM.replace("%d", b)) &&
              (($a = a), nb.reset(), wb.reset(), Ta(), T(bb, $a));
        }
        function eb(a) {
          var b = hb[a - 1],
            d = fb[b],
            c = ["?/?", "?"];
          if ("stat" in d) {
            var f = d.stat;
            c[0] = f[0] - f[1] + "/" + f[0];
            c[1] = n(f[2]);
          }
          f = STATS_SSMGR_OPS.split("|");
          f =
            '<select><option value="">...</option><option value="r">' +
            f[0] +
            '</option><option value="+">' +
            f[1] +
            '</option><option value="' +
            (b == bb ? 'p">' + f[2] : 'm">' + f[3]) +
            '</option><option value="x">' +
            f[4] +
            "</option>" +
            (b == bb ? '<option value="o">' + f[5] + "</option>" : "") +
            '<option value="v">' +
            STATS_EXPORTCSV +
            "</option></select>";
          var h =
              1 == a ? "<td></td>" : '<td class="click" data="u">&#8593;</td>',
            r =
              a == hb.length
                ? "<td></td>"
                : '<td class="click" data="d">&#8595;</td>',
            w = "<td>" + scramble.getTypeName(d.opt.scrType || "333") + "</td>",
            z = "<td>" + c[0] + "</td>";
          c = "<td>" + c[1] + "</td>";
          var Ra = mathlib.time2str((fb[b].date || [])[1], "%Y-%M-%D");
          return (
            '<tr class="' +
            (b == bb ? "selected mhide" : "mhide") +
            '"><td class="click" data="s">' +
            a +
            "-" +
            d.name +
            (b == bb ? "*" : "") +
            "</td>" +
            z +
            c +
            "<td>" +
            Ra +
            "</td>" +
            w +
            "<td>" +
            (d.opt.phases || 1) +
            "</td>" +
            h +
            r +
            '<td class="seltd">' +
            f +
            '</td></tr><tr class="' +
            (b == bb ? "selected " : "") +
            'mshow t"><td class="click" data="s" rowspan=2>' +
            a +
            "-" +
            d.name +
            (b == bb ? "*" : "") +
            "</td>" +
            z +
            w +
            h +
            r +
            '</tr><tr class="' +
            (b == bb ? "selected " : "") +
            'mshow b">' +
            c +
            "<td>" +
            Ra +
            "&nbsp;" +
            (d.opt.phases || 1) +
            'P.</td><td class="seltd" colspan=2>' +
            f +
            "</td></tr>"
          );
        }
        function Ya(a) {
          for (var b = !1, d = [], c = 0; c < a.length; c++) {
            var f = hb[a[c]];
            b = b || bb == f;
            d.push(
              fb[f].name +
                "(" +
                scramble.getTypeName(fb[f].opt.scrType || "333") +
                ")"
            );
          }
          d = d.join(", ");
          45 < d.length && (d = d.slice(0, 42) + "...");
          return (
            "<tr" +
            (b ? ' class="selected"' : "") +
            '><td class="click" data="e" colspan=9 style="text-align:left;">' +
            (b ? "*" : "") +
            "[+] " +
            a.length +
            " session(s): " +
            d +
            "</td></tr>"
          );
        }
        function Za(a) {
          for (var b = a.next(); b.is(":hidden"); b = b.next())
            b.css("display", "");
          a.remove();
        }
        function Xa() {
          d();
          ib.empty().append(
            '<tr class="mhide"><th class="click" data=' +
              ("name" == vb ? '"g">[+]' : '"gn">[-]') +
              " " +
              STATS_SSMGR_NAME +
              "</th><th>" +
              STATS_SOLVE +
              "</th><th>" +
              STATS_AVG +
              "</th><th>" +
              STATS_DATE +
              '</th><th class="click" data=' +
              ("scr" == vb ? '"g">[+]' : '"gs">[-]') +
              " " +
              SCRAMBLE_SCRAMBLE +
              '</th><th>P.</th><th colspan=3>OP</th></tr><tr class="mshow t"><th rowspan=2 class="click" data=' +
              ("name" == vb ? '"g">[+]' : '"gn">[-]') +
              " " +
              STATS_SSMGR_NAME +
              "</th><th>" +
              STATS_SOLVE +
              '</th><th class="click" data=' +
              ("scr" == vb ? '"g">[+]' : '"gs">[-]') +
              " " +
              SCRAMBLE_SCRAMBLE +
              '</th><th colspan=2 rowspan=2>OP</th></tr><tr class="mshow b"><th>' +
              STATS_AVG +
              "</th><th>" +
              STATS_DATE +
              " & P.</th></tr>"
          );
          for (var a = [], b = NaN, c = 0; c < hb.length; c++) {
            var f = fb[hb[c]];
            vb && f[vb] == b
              ? a[a.length - 1].push(c)
              : (a.push([c]), (b = f[vb]));
          }
          for (c = 0; c < a.length; c++)
            if (1 == a[c].length) ib.append(eb(a[c][0] + 1));
            else
              for (ib.append(Ya(a[c])), b = 0; b < a[c].length; b++)
                ib.append($(eb(a[c][b] + 1)).hide());
          ib.unbind("click").click(Wa).unbind("change").change(Wa);
        }
        function ab() {
          Xa();
          kernel.showDialog(
            [
              jb,
              0,
              void 0,
              0,
              [
                STATS_SSMGR_ORDER,
                function () {
                  if (!confirm(STATS_SSMGR_ODCFM)) return !1;
                  for (var a = [], c = 1; c <= kb; c++) a.push(c);
                  a.sort(function (a, b) {
                    var d = scramble.getTypeIdx(fb[a].opt.scrType || "333"),
                      c = scramble.getTypeIdx(fb[b].opt.scrType || "333");
                    return d == c ? fb[a].rank - fb[b].rank : d - c;
                  });
                  for (c = 0; c < a.length; c++) fb[a[c]].rank = c + 1;
                  d();
                  b();
                  Xa();
                  return !1;
                },
              ],
            ],
            "ssmgr",
            STATS_SSMGR_TITLE
          );
        }
        function mb(d, c) {
          if ("property" == d)
            "set" == c[2] ||
              "session" == c[2] ||
              c[0].startsWith("session") ||
              ((fb[bb].opt = kernel.getSProps()),
              kernel.setProp("sessionData", JSON.stringify(fb))),
              "session" == c[0] && ~~c[1] != bb
                ? a(c[1])
                : "sessionData" == c[0]
                ? ((fb = JSON.parse(c[1])), "set" != c[2] && b())
                : "sessionN" == c[0]
                ? (kb = c[1])
                : "scrType" == c[0]
                ? ((Ib = c[1]),
                  "modify" == c[2] && kernel.getProp("scr2ss") && h(void 0, !1))
                : "statclr" == c[0] &&
                  (c[1]
                    ? pb.val("X").unbind("click").click(Ra)
                    : pb.val("+").unbind("click").click(h));
          else if ("ctrl" == d && "stats" == c[0]) {
            var f = fb[bb].rank;
            "+" == c[1] && f < kb
              ? kernel.setProp("session", hb[f])
              : "-" == c[1] && 1 < f && kernel.setProp("session", hb[f - 2]);
          }
        }
        var kb = 15,
          bb = -1,
          jb = $("<div />"),
          ib = $("<table />").appendTo(jb).addClass("table ssmgr"),
          pb = $('<input type="button">').val("+"),
          fb,
          hb,
          gb = $("<option />").val("new").html("New.."),
          ob = $("<option />").val("del").html("Delete.."),
          lb = $("<select />").change(function () {
            kernel.blur();
            "new" == lb.val()
              ? h(kb, !1)
              : "del" == lb.val()
              ? z(bb) || lb.val(bb)
              : a(~~lb.val());
          }),
          vb = !1;
        $(function () {
          kernel.regListener("ssmgr", "property", mb);
          kernel.regListener("ssmgr", "ctrl", mb, /^stats$/);
          kernel.regProp("stats", "sessionN", -6, "Number of Sessions", [15]);
          kernel.regProp("stats", "sessionData", -6, "Session Data", ["{}"]);
          kb = kernel.getProp("sessionN");
          fb = JSON.parse(kernel.getProp("sessionData"));
          b();
          kernel.setProp("sessionData", JSON.stringify(fb));
          kernel.regProp("stats", "session", -6, "Current Session Index", [1]);
        });
        return {
          getSelect: function () {
            return lb;
          },
          showMgrTable: ab,
          importSessions: function (d) {
            if (d && 0 != d.length) {
              for (var c = bb, f = 0; f < d.length; f++) {
                var h = d[f],
                  r = kernel.getSProps(),
                  n;
                for (n in h.opt) r[n] = h.opt[n];
                bb = ++kb;
                fb[bb] = { name: h.name || bb, opt: r, rank: kb };
                kernel.setProp("sessionN", kb);
                $a = h.times;
                nb.reset($a.length);
                wb.reset($a.length);
                Ta();
              }
              b();
              a(c);
              ab();
              logohint.push("Import %d session(s)".replace("%d", d.length));
              return d.length;
            }
          },
          getButton: function () {
            return pb;
          },
          rank2idx: function (a) {
            return hb[a - 1];
          },
          load: Qa,
          save: Ta,
        };
      })(),
      Ob = (function () {
        function a(a) {
          a -= Sa;
          var b = new Date(1e3 * a);
          switch (Qa) {
            case "d":
              return ~~(a / 86400);
            case "w":
              return ~~((a / 86400 - oa.val()) / 7);
            case "m":
              return 12 * b.getFullYear() + b.getMonth();
            case "y":
              return b.getFullYear();
          }
        }
        function b(a) {
          switch (Qa) {
            case "d":
              return mathlib.time2str(86400 * a + Sa, "%Y-%M-%D");
            case "w":
              return mathlib.time2str(
                86400 * (7 * a + ~~oa.val()) + Sa,
                "Start@ %Y-%M-%D"
              );
            case "m":
              return ~~(a / 12) + "-" + ("0" + ((a % 12) + 1)).slice(-2);
            case "y":
              return "" + a;
          }
        }
        function d() {
          for (
            var b = Promise.resolve(),
              d = [],
              c = ~~kernel.getProp("sessionN"),
              f = 0;
            f < c;
            f++
          ) {
            var h = Cb.rank2idx(f + 1);
            b = b.then(
              function (b) {
                return new Promise(function (c) {
                  storage.get(b).then(function (f) {
                    d[b] = {};
                    for (var h = 0; h < f.length; h++)
                      if (f[h][3]) {
                        var r = a(f[h][3]);
                        d[b][r] = d[b][r] || [0, 0];
                        d[b][r][0] += 1;
                        d[b][r][1] += -1 != f[h][0][0];
                      }
                    c();
                  });
                });
              }.bind(void 0, h)
            );
          }
          return b.then(function () {
            T = d;
          });
        }
        function c(a) {
          a = $(a.target).html();
          "&gt;" == a
            ? Wa--
            : "&lt;" == a
            ? (Wa = Math.min(Wa + 1, 0))
            : "+" == a
            ? Va++
            : "-" == a && (Va = Math.max(1, Va - 1));
          f();
        }
        function f() {
          if (Za) {
            var a = $('<table class="table">');
            Xa.empty().append(
              "Period",
              n.unbind("change").change(r),
              " Start of day",
              w.unbind("change").change(r),
              " week",
              oa.unbind("change").change(r),
              "<br>",
              a
            );
            for (
              var d = JSON.parse(kernel.getProp("sessionData")),
                f = ~~kernel.getProp("sessionN"),
                h = $("<tr>").append(
                  Ua.unbind("click").click(c),
                  cb.unbind("click").click(c)
                ),
                z = $("<tr>").append(
                  eb.unbind("click").click(c),
                  Ya.unbind("click").click(c)
                ),
                Ra = 0;
              Ra < Va;
              Ra++
            )
              h.append(
                $("<td rowspan=2>").html(b(Ta - Ra + Wa).replace(" ", "<br>"))
              );
            a.append(h, z);
            for (Ra = 0; Ra < f; Ra++)
              if (
                ((h = Cb.rank2idx(Ra + 1)), 0 != Object.keys(T[h] || {}).length)
              ) {
                z = $("<tr>").append($("<td colspan=2>").html(d[h].name));
                for (var Sa = 0; Sa < Va; Sa++) {
                  var Qa = T[h][Ta - Sa + Wa];
                  z.append($("<td>").html(Qa ? Qa[1] + "/" + Qa[0] : "-"));
                }
                a.append(z);
              }
          }
        }
        function h(a, b) {
          Za = !!a;
          a && !/^scr/.exec(b) && (a.empty().append(Xa), r());
        }
        function r() {
          Za &&
            ((Qa = n.val()),
            (Sa = 3600 * w.val() + 60 * new Date().getTimezoneOffset()),
            (Ta = a(+new Date() / 1e3)),
            d().then(f));
        }
        for (
          var n = $("<select>")
              .append(
                $("<option>").val("d").html("day"),
                $("<option>").val("w").html("week"),
                $("<option>").val("m").html("month"),
                $("<option>").val("y").html("year")
              )
              .val("d"),
            w = $("<select>"),
            z = 0;
          24 > z;
          z++
        ) {
          var Ra = ("0" + z).slice(-2) + ":00";
          w.append($("<option>").val(z).html(Ra));
        }
        var oa = $("<select>")
            .append(
              $("<option>").val(3).html("Sun"),
              $("<option>").val(4).html("Mon"),
              $("<option>").val(5).html("Tue"),
              $("<option>").val(6).html("Wed"),
              $("<option>").val(0).html("Thu"),
              $("<option>").val(1).html("Fri"),
              $("<option>").val(2).html("Sat")
            )
            .val(3),
          T = [],
          Sa,
          Qa,
          Ta,
          Wa = 0,
          Va = 3,
          cb = $('<td class="click">').html("&gt;"),
          Ua = $('<td class="click">').html("&lt;"),
          eb = $('<td class="click">').html("+"),
          Ya = $('<td class="click">').html("-");
        $("<td colspan=1>");
        var Za = !1,
          Xa = $("<div />")
            .css("text-align", "center")
            .css({
              "font-size": "0.7em",
              "max-height": "20em",
              "overflow-y": "auto",
            });
        $(function () {
          "undefined" != typeof tools &&
            tools.regTool("dlystat", "Daily Statistics", h);
          kernel.regListener("dlystat", "property", f, /^sessionData$/);
        });
        return { update: r };
      })(),
      Mb = "",
      Eb,
      Jb,
      Db,
      ub,
      Ib = "333",
      Hb = 1;
    $(function () {
      kernel.regListener("stats", "time", hb);
      kernel.regListener("stats", "scramble", hb);
      kernel.regListener("stats", "scrambleX", hb);
      kernel.regListener(
        "stats",
        "property",
        hb,
        /^(:?useMilli|timeFormat|stat(:?sum|[12][tl]|alu?|inv|Hide|src)|session(:?Data)?|scrType|phases|trim|view|wndStat|sr_.*)$/
      );
      kernel.regListener("stats", "ctrl", hb, /^stats$/);
      kernel.regListener("stats", "ashow", hb);
      kernel.regListener("stats", "button", hb);
      kernel.regProp(
        "stats",
        "trim",
        1,
        PROPERTY_TRIM,
        [
          "p5",
          "1 p1 p5 p10 p20 m".split(" "),
          ["1", "1%", "5%", "10%", "20%", PROPERTY_TRIM_MED],
        ],
        1
      );
      kernel.regProp("stats", "statsum", 0, PROPERTY_SUMMARY, [!0], 1);
      kernel.regProp("stats", "printScr", 0, PROPERTY_PRINTSCR, [!0], 1);
      kernel.regProp("stats", "printDate", 0, PROPERTY_PRINTDATE, [!1], 1);
      kernel.regProp("stats", "imrename", 0, PROPERTY_IMRENAME, [!1], 1);
      kernel.regProp("stats", "scr2ss", 0, PROPERTY_SCR2SS, [!1]);
      kernel.regProp("stats", "statinv", 0, PROPERTY_STATINV, [!1], 1);
      kernel.regProp("stats", "statclr", 0, STATS_STATCLR, [!0], 1);
      kernel.regProp("stats", "absidx", 0, STATS_ABSIDX, [!1], 1);
      jb.append(
        mb.append(
          $('<span class="click" />')
            .html(STATS_SESSION)
            .click(Cb.showMgrTable),
          Cb.getSelect(),
          Cb.getButton()
        ),
        Za.append(vb),
        $('<div class="stattl">').append(qb.append(cb))
      );
      $(window).bind("resize", gb);
      cb.append(eb, pb);
      kernel.addWindow("stats", BUTTON_TIME_LIST, jb, !0, !0, 4);
      qb.bind("scroll", function () {
        var a = qb[0];
        a.scrollHeight - a.scrollTop < a.clientHeight + 5 &&
          !kernel.getProp("statinv") &&
          fb.click();
      });
      var a = STATS_TYPELEN.split("|");
      kernel.regProp(
        "stats",
        "stat1t",
        1,
        a[0].replace("%d", 1),
        [0, [0, 1], a.slice(2)],
        1
      );
      kernel.regProp(
        "stats",
        "stat1l",
        2,
        a[1].replace("%d", 1),
        [5, 3, 1e3],
        1
      );
      kernel.regProp(
        "stats",
        "stat2t",
        1,
        a[0].replace("%d", 2),
        [0, [0, 1], a.slice(2)],
        1
      );
      kernel.regProp(
        "stats",
        "stat2l",
        2,
        a[1].replace("%d", 2),
        [12, 3, 1e3],
        1
      );
      kernel.regProp("stats", "rsfor1s", 0, STATS_RSFORSS, [!1]);
      kernel.regProp(
        "stats",
        "statalu",
        5,
        PROPERTY_STATALU,
        ["mo3 ao5 ao12 ao100"],
        1
      );
      kernel.regProp(
        "stats",
        "statal",
        1,
        PROPERTY_STATAL,
        [
          "mo3 ao5 ao12 ao100",
          [
            "mo3 ao5 ao12 ao100",
            "mo3 ao5 ao12 ao25 ao50 ao100",
            "mo3 ao5 ao12 ao25 ao50 ao100 ao200 ao500 ao1000 ao2000 ao5000 ao10000",
            "u",
          ],
          [
            "mo3 ao5 ao12 ao100",
            "mo3 ao5 ao12 ao25 ao50 ao100",
            "mo3 ao5 ao12 ao25 ao50 ao100 ao200 ao500 ao1000 ao2000 ao5000 ao10000",
            "Custom",
          ],
        ],
        1
      );
      kernel.regProp("stats", "delmul", 0, PROPERTY_DELMUL, [!0]);
      kernel.regProp("ui", "statHide", -1, "Hide Session Title", [!1]);
      kernel.setProp("sr_statalu", kernel.getProp("sr_statal"));
    });
    return { importSessions: Cb.importSessions, getReviewUrl: f, pretty: Ua };
  },
  [kernel.pretty, kernel.round, kernel.pround]
);
var tools = execMain(function () {
  function z(a, b) {
    if (-1 == a) for (var d = 0; d < kernel.getProp("NTools"); d++) z(d, b);
    else if (!w) {
      for (d in Sa) Sa[d]();
      h[a].empty();
    } else for (d in Sa) if (d == Va[a]) Sa[d](h[a], b);
  }
  function Qa(a, b) {
    for (var d in Sa) if (d == Va[a]) Sa[d](void 0, b);
  }
  function n(a) {
    if (/^222(so|[236o]|eg[012]?|nb)$/.exec(a)) return "222";
    if (
      /^(333(oh?|ni|f[mt])?|(z[zb]|[coep]|cm|2g|ls)?ll|lse(mu)?|2genl?|3gen_[LF]|edges|corners|f2l|lsll2|zbls|roux|RrU|half|easyc|eoline)$/.exec(
        a
      )
    )
      return "333";
    if (/^(444(o|wca|yj|bld)?|4edge|RrUu)$/.exec(a)) return "444";
    if (/^(555(wca|bld)?|5edge)$/.exec(a)) return "555";
    if (/^(666(si|[sp]|wca)?|6edge)$/.exec(a)) return "666";
    if (/^(777(si|[sp]|wca)?|7edge)$/.exec(a)) return "777";
    if (/^888$/.exec(a)) return "888";
    if (/^999$/.exec(a)) return "999";
    if (/^101010$/.exec(a)) return "101010";
    if (/^111111$/.exec(a)) return "111111";
    if (/^pyr(s?[om]|l4e|nb|4c)$/.exec(a)) return "pyr";
    if (/^skb(s?o|nb)?$/.exec(a)) return "skb";
    if (/^sq(rs|1[ht]|rcsp)$/.exec(a)) return "sq1";
    if (/^clk(wca|o)$/.exec(a)) return "clk";
    if (/^mgmp$/.exec(a)) return "mgm";
    if (/^15p(at|ra?p?)?$/.exec(a)) return "15p";
    if (/^15p(rmp|m)$/.exec(a)) return "15b";
  }
  function Xa(a, b) {
    DEBUG && console.log("[func select]", a, b);
    kernel.blur();
    for (
      var d = void 0 === a ? 4 : a + 1, c = void 0 === a ? 0 : a;
      c < d;
      c++
    ) {
      var f = Ta[c].getSelected();
      Va[c] != f &&
        (Qa(c, "property"),
        (Va[c] = f),
        kernel.setProp("toolsfunc", JSON.stringify(Va)),
        z(c, "property"));
    }
  }
  function c(a, b) {
    if ("property" == a)
      if ("imgSize" == b[0] || /^col/.exec(b[0]))
        for (var d = 0; d < kernel.getProp("NTools"); d++)
          "image" == Va[d] && z(d, a);
      else if ("NTools" == b[0])
        for (d = 0; 4 > d; d++)
          d < b[1]
            ? (T[d].show(), "" == h[d].html() && z(d, a))
            : (T[d].hide(), Qa(d, a));
      else if ("toolHide" == b[0]) {
        d = !b[1];
        for (var c = 0; 4 > c; c++) d ? Ya[c].show() : Ya[c].hide();
      } else {
        if ("toolsfunc" == b[0] && "session" == b[2]) {
          c = JSON.parse(b[1]);
          for (d = 0; 4 > d; d++) Ta[d].loadVal(c[d]);
          Xa();
        }
      }
    else if ("scramble" == a || "scrambleX" == a) (f = b), z(-1, a);
    else if ("button" == a && "tools" == b[0])
      if ((w = b[1]))
        for (d = 0; d < kernel.getProp("NTools"); d++)
          w && "" == h[d].html() && z(d, a);
      else z(-1, a);
  }
  function Ua(a) {
    $(a.target).hasClass("click") ||
      $(a.target).is("input, textarea, select") ||
      kernel.setProp("toolHide", !1);
  }
  function a(a) {
    a = $(this);
    if ("a" == a.attr("data")) a.prevAll().show(), a.prev().hide(), a.hide();
    else if ("n" == a.attr("data")) {
      var b = a.prevAll(":hidden");
      b.last().show();
      1 == b.length && (a.next().hide(), a.hide());
    }
  }
  for (
    var f = ["-", ""],
      w = !1,
      T = [],
      h = [],
      Va = ["image", "stats", "cross"],
      Ya = [],
      Ta = [],
      Wa = [],
      oa = 0;
    4 > oa;
    oa++
  )
    (h[oa] = $("<div />")),
      (Ya[oa] = $("<span />")),
      (Ta[oa] = new kernel.TwoLvMenu(
        Wa,
        Xa.bind(null, oa),
        $("<select />"),
        $("<select />")
      )),
      (T[oa] = $("<div />").css("display", "inline-block"));
  $(function () {
    kernel.regListener(
      "tools",
      "property",
      c,
      /^(?:imgSize|image|toolsfunc|NTools|col(?:cube|pyr|skb|sq1|mgm)|toolHide)$/
    );
    kernel.regListener("tools", "scramble", c);
    kernel.regListener("tools", "scrambleX", c);
    kernel.regListener("tools", "button", c, /^tools$/);
    for (var a = $('<div id="toolsDiv"/>'), b = 0; 4 > b; b++)
      h[b].click(Ua),
        Ya[b].append("<br>", TOOLS_SELECTFUNC, Ta[b].select1, Ta[b].select2),
        T[b].append(h[b], Ya[b]).appendTo(a),
        1 == b && a.append("<br>");
    kernel.regProp("tools", "solSpl", 0, PROPERTY_HIDEFULLSOL, [!1]);
    kernel.regProp("tools", "imgSize", 2, PROPERTY_IMGSIZE, [15, 5, 50]);
    kernel.regProp("tools", "NTools", 2, PROPERTY_NTOOLS, [1, 1, 4]);
    b = JSON.stringify(["image", "stats", "cross", "distribution"]);
    kernel.regProp("tools", "toolsfunc", 5, PROPERTY_TOOLSFUNC, [b], 1);
    var f = kernel.getProp("toolsfunc", b);
    -1 == f.indexOf("[") &&
      ((f = b.replace("image", f)), kernel.setProp("toolsfunc", f));
    Va = JSON.parse(f);
    kernel.addWindow("tools", BUTTON_TOOLS, a, !1, !0, 6);
    kernel.regProp("ui", "toolHide", -1, "Hide Tools Selector", [!1]);
  });
  var Sa = {};
  return {
    regTool: function (a, b, c) {
      DEBUG && console.log("[regtool]", a, b);
      Sa[a] = c;
      b = b.split(">");
      if (2 == b.length) {
        c = -1;
        for (var d = 0; d < Wa.length; d++)
          if (Wa[d][0] == b[0] && $.isArray(Wa[d][1])) {
            c = d;
            break;
          }
        -1 != c ? Wa[c][1].push([b[1], a]) : Wa.push([b[0], [[b[1], a]]]);
      } else Wa.push([b[0], a]);
      for (d = 0; 4 > d; d++) Ta[d].reset(Va[d]);
    },
    getCurScramble: function () {
      return f;
    },
    getSolutionSpan: function (d) {
      for (var b = $("<span />"), c = 0; c < d.length; c++)
        b.append('<span style="display:none;">&nbsp;' + d[c] + "</span>");
      kernel.getProp("solSpl")
        ? (b.append($('<span class="click" data="n">[+1]</span>').click(a)),
          b.append(
            $('<span class="click" data="a">[' + d.length + "f]</span>").click(
              a
            )
          ))
        : b.children().show();
      return b;
    },
    scrambleType: function (a) {
      return null ==
        a.match(/^([\d]?[xyzFRUBLDfrubldSME]([w]|&sup[\d];)?[2']?\s*)+$/)
        ? "-"
        : a.match(/^([xyzFRU][2']?\s*)+$/)
        ? "222o"
        : a.match(/^([xyzFRUBLDSME][2']?\s*)+$/)
        ? "333"
        : a.match(/^(([xyzFRUBLDfru]|[FRU]w)[2']?\s*)+$/)
        ? "444"
        : a.match(/^(([xyzFRUBLDfrubld])[w]?[2']?\s*)+$/)
        ? "555"
        : "-";
    },
    puzzleType: n,
    isPuzzle: function (a, b) {
      b = b || f;
      var d = n(b[0]);
      b = b[1];
      return d
        ? d == a
        : "222" == a
        ? b.match(/^([xyzFRU][2']?\s*)+$/)
        : "333" == a
        ? b.match(/^([xyzFRUBLDSME][2']?\s*)+$/)
        : "444" == a
        ? b.match(/^(([xyzFRUBLDfru]|[FRU]w)[2']?\s*)+$/)
        : "555" == a
        ? b.match(/^(([xyzFRUBLDfrubld])[w]?[2']?\s*)+$/)
        : "skb" == a
        ? b.match(/^([RLUB]'?\s*)+$/)
        : "pyr" == a
        ? b.match(/^([RLUBrlub]'?\s*)+$/)
        : "sq1" == a
        ? b.match(/^$/)
        : !1;
    },
  };
});
var image = execMain(function () {
  function z(a, d) {
    return Qa(a, [Math.cos(d), -Math.sin(d), 0, Math.sin(d), Math.cos(d), 0]);
  }
  function Qa(a) {
    for (var b, d = 1; d < arguments.length; d++) {
      var c = arguments[d];
      3 == c.length && (c = [c[0], 0, c[1] * c[0], 0, c[0], c[2] * c[0]]);
      b = [[], []];
      for (d = 0; d < a[0].length; d++)
        (b[0][d] = a[0][d] * c[0] + a[1][d] * c[1] + c[2]),
          (b[1][d] = a[0][d] * c[3] + a[1][d] * c[4] + c[5]);
    }
    return b;
  }
  function n(a, d, c, f) {
    if (a) {
      f = f || [1, 0, 0, 0, 1, 0];
      c = Qa(c, f);
      a.beginPath();
      a.fillStyle = d;
      a.moveTo(c[0][0], c[1][0]);
      for (d = 1; d < c[0].length; d++) a.lineTo(c[0][d], c[1][d]);
      a.closePath();
      a.fill();
      a.stroke();
    }
  }
  function Xa(a) {
    var b = a[0];
    "input" == b && (b = tools.scrambleType(a[1]));
    b = tools.puzzleType(b);
    var d;
    for (d = 0; 12 > d; d++) if (b == Sa[d]) return Wa(d, a[1]), !0;
    return "pyr" == b
      ? (Ta(a[1]), !0)
      : "skb" == b
      ? (Ya(a[1]), !0)
      : "sq1" == b
      ? (Va(a[1]), !0)
      : "clk" == b
      ? (h(a[1]), !0)
      : "mgm" == b
      ? (T(a[1]), !0)
      : "15b" == b || "15p" == b
      ? (oa(b[2], 4, a[1]), !0)
      : !1;
  }
  function c(b) {
    b &&
      ((Ua = $("<canvas>")),
      (a = Ua[0].getContext("2d")),
      b.empty().append(Ua),
      Xa(tools.getCurScramble()) || b.html(IMAGE_UNAVAILABLE));
  }
  var Ua,
    a,
    f = Math.sqrt(3) / 2,
    w = Math.PI,
    T = (function () {
      function b(b, d, c, f) {
        for (var h = 0; 5 > h; h++)
          n(a, Xa[b[d + h]], z([Sa, Qa], ((2 * w) / 5) * h + f), c),
            n(a, Xa[b[d + h + 5]], z([Ta, Wa], ((2 * w) / 5) * h + f), c);
        n(a, Xa[b[d + 10]], z([Va, Ya], f), c);
      }
      var c = [
          [
            4, 0, 1, 2, 3, 9, 5, 6, 7, 8, 10, 11, 12, 13, 58, 59, 16, 17, 18,
            63, 20, 21, 22, 23, 24, 14, 15, 27, 28, 29, 19, 31, 32, 33, 34, 35,
            25, 26, 38, 39, 40, 30, 42, 43, 44, 45, 46, 36, 37, 49, 50, 51, 41,
            53, 54, 55, 56, 57, 47, 48, 60, 61, 62, 52, 64, 65, 66, 67, 68, 69,
            70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86,
            87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102,
            103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115,
            116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128,
            129, 130, 131,
          ],
          [
            81, 77, 78, 3, 4, 86, 82, 83, 8, 85, 87, 122, 123, 124, 125, 121,
            127, 128, 129, 130, 126, 131, 89, 90, 24, 25, 88, 94, 95, 29, 97,
            93, 98, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 26, 22, 23,
            48, 30, 31, 27, 28, 53, 32, 69, 70, 66, 67, 68, 74, 75, 71, 72, 73,
            76, 101, 102, 103, 99, 100, 106, 107, 108, 104, 105, 109, 46, 47,
            79, 80, 45, 51, 52, 84, 49, 50, 54, 0, 1, 2, 91, 92, 5, 6, 7, 96, 9,
            10, 15, 11, 12, 13, 14, 20, 16, 17, 18, 19, 21, 113, 114, 110, 111,
            112, 118, 119, 115, 116, 117, 120, 55, 56, 57, 58, 59, 60, 61, 62,
            63, 64, 65,
          ],
          [
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 33, 34, 35, 14, 15, 38, 39, 40,
            19, 42, 43, 44, 45, 46, 25, 26, 49, 50, 51, 30, 53, 54, 55, 56, 57,
            36, 37, 60, 61, 62, 41, 64, 65, 11, 12, 13, 47, 48, 16, 17, 18, 52,
            20, 21, 22, 23, 24, 58, 59, 27, 28, 29, 63, 31, 32, 88, 89, 90, 91,
            92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106,
            107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119,
            120, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81,
            82, 83, 84, 85, 86, 87, 124, 125, 121, 122, 123, 129, 130, 126, 127,
            128, 131,
          ],
        ],
        f = (Math.sqrt(5) + 1) / 2,
        h = 0.25 / Math.tan(w / 5),
        oa = 2.6 + 3 * Math.cos(0.1 * w) * f,
        T = 2.2 + 1 * Math.sin(0.1 * w) * f,
        Sa = [0, h, 0, -h],
        Qa = [-1, -0.75, -0.5, -0.75],
        Ta = [Math.cos(0.1 * w) - h, h, 0, 0.5 * Math.sin(0.4 * w)],
        Wa = [
          -Math.sin(0.1 * w) + -0.25,
          -0.75,
          -0.5,
          0.5 * -Math.cos(0.4 * w),
        ],
        Va = [
          0.5 * Math.sin(0 * w),
          0.5 * Math.sin(0.4 * w),
          0.5 * Math.sin(0.8 * w),
          0.5 * Math.sin(1.2 * w),
          0.5 * Math.sin(1.6 * w),
        ],
        Ya = [
          0.5 * -Math.cos(0 * w),
          0.5 * -Math.cos(0.4 * w),
          0.5 * -Math.cos(0.8 * w),
          0.5 * -Math.cos(1.2 * w),
          0.5 * -Math.cos(1.6 * w),
        ],
        Xa =
          "#fff #d00 #060 #81f #fc0 #00b #ffb #8df #f83 #7e0 #f9f #999".split(
            " "
          ),
        qb = /[RD][+-]{2}|U'?/;
      return function (h) {
        Xa = kernel.getProp("colmgm").match(d);
        for (var r = [], n = 0; 12 > n; n++)
          for (var z = 0; 11 > z; z++) r[11 * n + z] = n;
        h = h.split(/\s+/);
        for (n = 0; n < h.length; n++)
          if ((z = qb.exec(h[n]))) {
            var Ra = "URD".indexOf(z[0][0]),
              Sa = /[-']/.exec(z[0][1]);
            z = r;
            Ra = c[Ra];
            var Qa = z.slice();
            if (Sa) for (Sa = 0; 132 > Sa; Sa++) z[Ra[Sa]] = Qa[Sa];
            else for (Sa = 0; 132 > Sa; Sa++) z[Sa] = Qa[Ra[Sa]];
          }
        n = kernel.getProp("imgSize") / 7.5;
        Ua.width(7 * n + "em");
        Ua.height(3.5 * n + "em");
        Ua.attr("width", 392);
        Ua.attr("height", 196);
        b(r, 0, [40, 2.6 + 0 * f, 2.2 + 0 * f], 0 * w);
        b(
          r,
          11,
          [40, 2.6 + Math.cos(0.1 * w) * f, 2.2 + Math.sin(0.1 * w) * f],
          0.2 * w
        );
        b(
          r,
          22,
          [40, 2.6 + Math.cos(0.5 * w) * f, 2.2 + Math.sin(0.5 * w) * f],
          0.6 * w
        );
        b(
          r,
          33,
          [40, 2.6 + Math.cos(0.9 * w) * f, 2.2 + Math.sin(0.9 * w) * f],
          1 * w
        );
        b(
          r,
          44,
          [40, 2.6 + Math.cos(1.3 * w) * f, 2.2 + Math.sin(1.3 * w) * f],
          1.4 * w
        );
        b(
          r,
          55,
          [40, 2.6 + Math.cos(1.7 * w) * f, 2.2 + Math.sin(1.7 * w) * f],
          1.8 * w
        );
        b(
          r,
          66,
          [40, oa + Math.cos(0.7 * w) * f, T + Math.sin(0.7 * w) * f],
          0 * w
        );
        b(
          r,
          77,
          [40, oa + Math.cos(0.3 * w) * f, T + Math.sin(0.3 * w) * f],
          1.6 * w
        );
        b(
          r,
          88,
          [40, oa + Math.cos(1.9 * w) * f, T + Math.sin(1.9 * w) * f],
          1.2 * w
        );
        b(
          r,
          99,
          [40, oa + Math.cos(1.5 * w) * f, T + Math.sin(1.5 * w) * f],
          0.8 * w
        );
        b(
          r,
          110,
          [40, oa + Math.cos(1.1 * w) * f, T + Math.sin(1.1 * w) * f],
          0.4 * w
        );
        b(r, 121, [40, oa + 0 * f, T + 0 * f], 1 * w);
        a &&
          ((a.fillStyle = "#000"),
          (a.font = "20px serif"),
          (a.textAlign = "center"),
          (a.textBaseline = "middle"),
          a.fillText("U", 104, 88),
          a.fillText("F", 104, 40 * (2.2 + Math.sin(0.5 * w) * f)));
      };
    })(),
    h = (function () {
      var b = /([UD][RL]|ALL|[UDRLy])(\d[+-]?)?/,
        d = "UR DR DL UL U R D L ALL".split(" ");
      return function (c) {
        var f = c.split(/\s+/),
          h = clock.moveArr,
          r = 9;
        c = [0, 0, 0, 0];
        for (
          var n = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], oa = 0;
          oa < f.length;
          oa++
        ) {
          var Ra = b.exec(f[oa]);
          if (Ra)
            if ("y2" == Ra[0]) r = 0;
            else {
              var T = d.indexOf(Ra[1]) + r;
              if (void 0 == Ra[2]) c[T % 9] = 1;
              else {
                var Sa = ~~Ra[2][0];
                Sa = "+" == Ra[2][1] ? Sa : 12 - Sa;
                for (Ra = 0; 14 > Ra; Ra++)
                  n[Ra] = (n[Ra] + h[T][Ra] * Sa) % 12;
              }
            }
        }
        n = [
          n[0],
          n[3],
          n[6],
          n[1],
          n[4],
          n[7],
          n[2],
          n[5],
          n[8],
          12 - n[2],
          n[10],
          12 - n[8],
          n[9],
          n[11],
          n[13],
          12 - n[0],
          n[12],
          12 - n[6],
        ];
        c = [c[3], c[2], c[0], c[1], 1 - c[0], 1 - c[1], 1 - c[3], 1 - c[2]];
        oa = kernel.getProp("imgSize") / 7.5;
        Ua.width(6.25 * oa + "em");
        Ua.height(3 * oa + "em");
        Ua.attr("width", 375);
        Ua.attr("height", 180);
        f = [10, 30, 50];
        h = [10, 30, 50, 75, 95, 115];
        for (oa = 0; 18 > oa; oa++)
          (r = ["#37b", "#5cf"][~~(oa / 9)]),
            (T = [3, h[~~(oa / 3)], f[oa % 3]]),
            a &&
              ((Ra = Qa(
                z(
                  [
                    [1, 1, 0, -1, -1, -1, 1, 0],
                    [0, -1, -8, -1, 0, 1, 1, 0],
                  ],
                  (n[oa] / 6) * w
                ),
                T
              )),
              (Sa = Ra[0]),
              (Ra = Ra[1]),
              a.beginPath(),
              (a.fillStyle = r),
              a.arc(Sa[7], Ra[7], 9 * T[0], 0, 2 * w),
              a.fill(),
              a.beginPath(),
              (a.fillStyle = "#ff0"),
              (a.strokeStyle = "#f00"),
              a.moveTo(Sa[0], Ra[0]),
              a.bezierCurveTo(Sa[1], Ra[1], Sa[1], Ra[1], Sa[2], Ra[2]),
              a.bezierCurveTo(Sa[3], Ra[3], Sa[3], Ra[3], Sa[4], Ra[4]),
              a.bezierCurveTo(Sa[5], Ra[5], Sa[6], Ra[6], Sa[0], Ra[0]),
              a.closePath(),
              a.fill(),
              a.stroke());
        f = [20, 40];
        h = [20, 40, 85, 105];
        for (oa = 0; 8 > oa; oa++)
          (n = ["#850", "#ff0"][c[oa]]),
            (r = [3, h[~~(oa / 2)], f[oa % 2]]),
            a &&
              ((T = Qa([[0], [0]], r)),
              a.beginPath(),
              (a.fillStyle = n),
              (a.strokeStyle = "#000"),
              a.arc(T[0][0], T[1][0], 3 * r[0], 0, 2 * w),
              a.fill(),
              a.stroke());
      };
    })(),
    Va = (function () {
      function b(a) {
        for (var b = [], d = 0; 12 > d; d++) b[(d + a[0]) % 12] = c[d];
        for (d = 0; 12 > d; d++) b[d + 12] = c[((d + a[1]) % 12) + 12];
        if (a[2])
          for (h = 1 - h, d = 0; 6 > d; d++) mathlib.circle(b, d + 6, 23 - d);
        c = b;
      }
      var c = [],
        h = 0,
        oa = [
          [0, -0.5, 0.5],
          [0, -f - 1, -f - 1],
        ],
        T = [
          [0, -0.5, -f - 1, -f - 1],
          [0, -f - 1, -f - 1, -0.5],
        ],
        Sa = [
          [0, -0.5, -f - 1],
          [0, -f - 1, -f - 1],
        ],
        Ta = [
          [0, -f - 1, -f - 1],
          [0, -f - 1, -0.5],
        ],
        Wa = Qa(oa, [0.66, 0, 0]),
        Va = Qa(T, [0.66, 0, 0]),
        Ya = {
          U: "#ff0",
          R: "#f80",
          F: "#0f0",
          D: "#fff",
          L: "#f00",
          B: "#00f",
        },
        Xa = /^\s*\(\s*(-?\d+),\s*(-?\d+)\s*\)\s*$/;
      return function (r) {
        var Ra = kernel.getProp("colsq1").match(d);
        Ya = { U: Ra[0], R: Ra[1], F: Ra[2], D: Ra[3], L: Ra[4], B: Ra[5] };
        c = [
          0, 0, 1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 12, 12, 13,
          14, 14, 15,
        ];
        h = 0;
        Ra = r.split("/");
        for (r = 0; r < Ra.length; r++)
          if (/^\s*$/.exec(Ra[r])) b([0, 0, 1]);
          else {
            var T = Xa.exec(Ra[r]);
            b([~~T[1] + 12, ~~T[2] + 12, 1]);
          }
        b([0, 0, 1]);
        r = kernel.getProp("imgSize") / 10;
        Ua.width((11 * r) / 1.3 + "em");
        Ua.height((6.3 * r) / 1.3 + "em");
        Ua.attr("width", 495);
        Ua.attr("height", 283.5);
        Ra = [45, 2.7, 2.7];
        for (r = 0; 12 > r; r++)
          0 == c[r] % 2
            ? c[r] == c[(r + 1) % 12] &&
              (n(a, Ya["LBBRRFFLBLRBFRLF"[c[r]]], z(Ta, ((r - 3) * w) / 6), Ra),
              n(
                a,
                Ya["LBBRRFFLBLRBFRLF"[c[r] + 1]],
                z(Sa, ((r - 3) * w) / 6),
                Ra
              ),
              n(a, Ya["UD"[8 <= c[r] ? 1 : 0]], z(Va, ((r - 3) * w) / 6), Ra))
            : (n(a, Ya["-B-R-F-L-B-R-F-L"[c[r]]], z(oa, ((r - 5) * w) / 6), Ra),
              n(a, Ya["UD"[8 <= c[r] ? 1 : 0]], z(Wa, ((r - 5) * w) / 6), Ra));
        Ra = [45, 2.7 + 5.4, 2.7];
        for (r = 12; 24 > r; r++)
          0 == c[r] % 2
            ? c[r] == c[((r + 1) % 12) + 12] &&
              (n(a, Ya["LBBRRFFLBLRBFRLF"[c[r]]], z(Ta, (-r * w) / 6), Ra),
              n(a, Ya["LBBRRFFLBLRBFRLF"[c[r] + 1]], z(Sa, (-r * w) / 6), Ra),
              n(a, Ya["UD"[8 <= c[r] ? 1 : 0]], z(Va, (-r * w) / 6), Ra))
            : (n(
                a,
                Ya["-B-R-F-L-B-R-F-L"[c[r]]],
                z(oa, ((-1 - r) * w) / 6),
                Ra
              ),
              n(a, Ya["UD"[8 <= c[r] ? 1 : 0]], z(Wa, ((-1 - r) * w) / 6), Ra));
        Ra = [45, 5.4, 5.7];
        n(
          a,
          Ya.L,
          [
            [-f - 1, -f - 1, -0.5, -0.5],
            [0.5, -0.5, -0.5, 0.5],
          ],
          Ra
        );
        0 == h
          ? n(
              a,
              Ya.L,
              [
                [f + 1, f + 1, -0.5, -0.5],
                [0.5, -0.5, -0.5, 0.5],
              ],
              Ra
            )
          : n(
              a,
              Ya.R,
              [
                [f, f, -0.5, -0.5],
                [0.5, -0.5, -0.5, 0.5],
              ],
              Ra
            );
      };
    })(),
    Ya = (function () {
      var b = [],
        c = "#fff #00f #f00 #ff0 #0f0 #f80".split(" "),
        h = [
          [45 * f, 45 * f, 186.75 * f, -22.5, 22.5, 45],
          [45 * f, 0, 328.5 * f, -22.5, 45, 67.5],
          [45 * f, 0, 234 * f, -22.5, 45, 114.75],
          [0, -45 * f, 139.5 * f, 45, -22.5, 209.25],
          [45 * f, 0, 139.5 * f, 22.5, 45, 114.75],
          [45 * f, 0, 45 * f, 22.5, 45, 67.5],
        ];
      return function (r) {
        c = kernel.getProp("colskb").match(d);
        for (var w = 0, z = 0; 6 > z; z++)
          for (var oa = 0; 5 > oa; oa++) b[w++] = z;
        r = kernel.parseScramble(r, "RULB");
        for (z = 0; z < r.length; z++) {
          w = r[z][0];
          oa = 1 == r[z][2] ? 1 : 2;
          for (var Ra = 0; Ra < oa; Ra++)
            switch (w) {
              case 0:
                mathlib.circle(b, 10, 5, 15);
                mathlib.circle(b, 14, 8, 17);
                mathlib.circle(b, 12, 9, 16);
                mathlib.circle(b, 13, 6, 19);
                mathlib.circle(b, 24, 4, 28);
                break;
              case 1:
                mathlib.circle(b, 0, 25, 5);
                mathlib.circle(b, 2, 26, 7);
                mathlib.circle(b, 4, 27, 9);
                mathlib.circle(b, 1, 28, 6);
                mathlib.circle(b, 21, 19, 12);
                break;
              case 2:
                mathlib.circle(b, 20, 15, 25);
                mathlib.circle(b, 23, 18, 29);
                mathlib.circle(b, 21, 16, 28);
                mathlib.circle(b, 24, 19, 27);
                mathlib.circle(b, 13, 9, 1);
                break;
              case 3:
                mathlib.circle(b, 5, 25, 15),
                  mathlib.circle(b, 9, 28, 19),
                  mathlib.circle(b, 8, 26, 18),
                  mathlib.circle(b, 7, 29, 17),
                  mathlib.circle(b, 2, 23, 14);
            }
        }
        z = kernel.getProp("imgSize") / 10;
        Ua.width((8 * f + 0.3) * z + "em");
        Ua.height(6.2 * z + "em");
        Ua.attr("width", 45 * (8 * f + 0.3) + 1);
        Ua.attr("height", 280);
        for (z = 0; 6 > z; z++)
          (r = z),
            (w = h[r]),
            n(
              a,
              c[b[5 * r]],
              [
                [-1, 0, 1, 0],
                [0, 1, 0, -1],
              ],
              w
            ),
            n(
              a,
              c[b[5 * r + 1]],
              [
                [-1, -1, 0],
                [0, -1, -1],
              ],
              w
            ),
            n(
              a,
              c[b[5 * r + 2]],
              [
                [0, 1, 1],
                [-1, -1, 0],
              ],
              w
            ),
            n(
              a,
              c[b[5 * r + 3]],
              [
                [-1, -1, 0],
                [0, 1, 1],
              ],
              w
            ),
            n(
              a,
              c[b[5 * r + 4]],
              [
                [0, 1, 1],
                [1, 1, 0],
              ],
              w
            );
      };
    })(),
    Ta = (function () {
      var b = [],
        c = ["#0f0", "#f00", "#00f", "#ff0"],
        h = [3.5, 1.5, 5.5, 3.5],
        w = [0, 3 * f, 3 * f, 6.5 * f],
        z = [0, 6, 5, 4],
        oa = [1, 7, 3, 5],
        T = [2, 8, 4, 3],
        Sa = [
          [0, 1, 2],
          [2, 3, 0],
          [1, 0, 3],
          [3, 2, 1],
        ],
        Qa = [-0.5, 0.5, 0],
        Ta = [f, f, 0],
        Wa = [-f, -f, 0];
      return function (r) {
        c = kernel.getProp("colpyr").match(d);
        for (var Ra = 0, Va = 0; 4 > Va; Va++)
          for (var Ya = 0; 9 > Ya; Ya++) b[Ra++] = Va;
        r = kernel.parseScramble(r, "URLB");
        for (Va = 0; Va < r.length; Va++) {
          var cb = r[Va][0] + (2 == r[Va][1] ? 4 : 0);
          Ra = 1 == r[Va][2] ? 1 : 2;
          Ya = 4 <= cb ? 1 : 4;
          cb = Sa[cb % 4];
          for (var eb = 0; eb < Ya; eb++)
            for (var Xa = 0; Xa < Ra; Xa++)
              mathlib.circle(
                b,
                9 * cb[0] + z[eb],
                9 * cb[1] + oa[eb],
                9 * cb[2] + T[eb]
              );
        }
        Va = kernel.getProp("imgSize") / 10;
        Ua.width(7 * Va + "em");
        Ua.height(6.5 * f * Va + "em");
        Ua.attr("width", 315);
        Ua.attr("height", 292.5 * f);
        for (Va = 0; 4 > Va; Va++) {
          r = Va;
          Ra = 0 != r;
          Ya = [0, -1, 1, 0, 0.5, -0.5, 0, -0.5, 0.5];
          cb = [0, 2, 2, 2, 1, 1, 2, 3, 3];
          for (eb = 0; eb < cb.length; eb++)
            (cb[eb] *= Ra ? -f : f), (Ya[eb] *= Ra ? -1 : 1);
          for (eb = 0; 9 > eb; eb++)
            n(
              a,
              c[b[9 * r + eb]],
              [Qa, 6 <= eb != Ra ? Wa : Ta],
              [45, h[r] + Ya[eb], w[r] + cb[eb]]
            );
        }
      };
    })(),
    Wa = (function () {
      function b(a, b, d, f) {
        var h = f * f,
          r,
          n,
          w;
        5 < a && (a -= 6);
        for (w = 0; w < d; w++) {
          for (r = 0; r < f; r++) {
            if (0 == a) {
              var z = 6 * h - f * b - f + r;
              var oa = 2 * h - f * b - 1 - r;
              var Ra = 3 * h - f * b - 1 - r;
              var T = 5 * h - f * b - f + r;
            } else
              1 == a
                ? ((z = 3 * h + b + f * r),
                  (oa = 3 * h + b - f * (r + 1)),
                  (Ra = h + b - f * (r + 1)),
                  (T = 5 * h + b + f * r))
                : 2 == a
                ? ((z = 3 * h + b * f + r),
                  (oa = 4 * h + f - 1 - b + f * r),
                  (Ra = b * f + f - 1 - r),
                  (T = 2 * h - 1 - b - f * r))
                : 3 == a
                ? ((z = 4 * h + b * f + f - 1 - r),
                  (oa = 2 * h + b * f + r),
                  (Ra = h + b * f + r),
                  (T = 5 * h + b * f + f - 1 - r))
                : 4 == a
                ? ((z = 6 * h - 1 - b - f * r),
                  (oa = f - 1 - b + f * r),
                  (Ra = 2 * h + f - 1 - b + f * r),
                  (T = 4 * h - 1 - b - f * r))
                : 5 == a &&
                  ((z = 4 * h - f - b * f + r),
                  (oa = 2 * h - f + b - f * r),
                  (Ra = h - 1 - b * f - r),
                  (T = 4 * h + b + f * r));
            var Sa = c[z];
            c[z] = c[oa];
            c[oa] = c[Ra];
            c[Ra] = c[T];
            c[T] = Sa;
          }
          if (0 == b)
            for (r = 0; r + r < f; r++)
              for (n = 0; n + n < f - 1; n++)
                (z = a * h + r + n * f),
                  (Ra = a * h + (f - 1 - r) + (f - 1 - n) * f),
                  3 > a
                    ? ((oa = a * h + (f - 1 - n) + r * f),
                      (T = a * h + n + (f - 1 - r) * f))
                    : ((T = a * h + (f - 1 - n) + r * f),
                      (oa = a * h + n + (f - 1 - r) * f)),
                  (Sa = c[z]),
                  (c[z] = c[oa]),
                  (c[oa] = c[Ra]),
                  (c[Ra] = c[T]),
                  (c[T] = Sa);
        }
      }
      var c = [],
        f = "#ff0 #fa0 #00f #fff #f00 #0d0".split(" ");
      return function (h, r) {
        f = kernel.getProp("colcube").match(d);
        for (var w = 0, z = 0; 6 > z; z++)
          for (var oa = 0; oa < h * h; oa++) c[w++] = z;
        z = kernel.parseScramble(r, "DLBURF");
        for (w = 0; w < z.length; w++) {
          for (oa = 0; oa < z[w][1]; oa++) b(z[w][0], oa, z[w][2], h);
          if (-1 == z[w][1]) {
            for (oa = 0; oa < h - 1; oa++) b(z[w][0], oa, -z[w][2], h);
            b((z[w][0] + 3) % 6, 0, z[w][2] + 4, h);
          }
        }
        z = kernel.getProp("imgSize") / 50;
        Ua.width(39 * z + "em");
        Ua.height(29 * z + "em");
        Ua.attr("width", ((39 * h) / 9) * 30 + 1);
        Ua.attr("height", ((29 * h) / 9) * 30 + 1);
        for (z = 0; 6 > z; z++) {
          w = z;
          oa = h;
          var Ra = 10 / 9,
            T = 10 / 9;
          0 == w
            ? ((Ra *= oa), (T *= 2 * oa))
            : 1 == w
            ? ((Ra *= 0), (T *= oa))
            : 2 == w
            ? ((Ra *= 3 * oa), (T *= oa))
            : 3 == w
            ? ((Ra *= oa), (T *= 0))
            : 4 == w
            ? ((Ra *= 2 * oa), (T *= oa))
            : 5 == w && ((Ra *= oa), (T *= oa));
          for (var Sa = 0; Sa < oa; Sa++)
            for (
              var Qa = 1 == w || 2 == w ? oa - 1 - Sa : Sa, Ta = 0;
              Ta < oa;
              Ta++
            )
              n(
                a,
                f[c[(w * oa + (0 == w ? oa - 1 - Ta : Ta)) * oa + Qa]],
                [
                  [Sa, Sa, Sa + 1, Sa + 1],
                  [Ta, Ta + 1, Ta + 1, Ta],
                ],
                [30, Ra, T]
              );
        }
      };
    })(),
    oa = (function () {
      return function (b, c, f) {
        for (
          var h = [],
            r = [
              [1, 0],
              [0, 1],
              [0, -1],
              [-1, 0],
            ],
            w = 0;
          w < c * c;
          w++
        )
          h[w] = w;
        w = c - 1;
        var z = c - 1,
          oa = /([ULRD\uFFEA\uFFE9\uFFEB\uFFEC])([\d]?)/;
        f = f.split(" ");
        for (var Ra = 0; Ra < f.length; Ra++) {
          var T = oa.exec(f[Ra]);
          if (T) {
            var Sa = "ULRDï¿ªï¿©ï¿«ï¿¬".indexOf(T[1]) % 4;
            T = ~~T[2] || 1;
            Sa = r["b" == b ? 3 - Sa : Sa];
            for (var Qa = 0; Qa < T; Qa++)
              mathlib.circle(h, w * c + z, (w + Sa[0]) * c + z + Sa[1]),
                (w += Sa[0]),
                (z += Sa[1]);
          }
        }
        b = kernel.getProp("imgSize") / 50;
        Ua.width(30 * b + "em");
        Ua.height(30 * b + "em");
        Ua.attr("width", 50 * (c + 0.2));
        Ua.attr("height", 50 * (c + 0.2));
        b = kernel.getProp("col15p").match(d);
        for (w = 0; w < c; w++)
          for (f = 0; f < c; f++)
            (r = h[f * c + w]),
              (z = Math.min(~~(r / c), r % c)),
              r++,
              n(
                a,
                b[z],
                [
                  [w + 0.05, w + 0.05, w + 1 - 0.05, w + 1 - 0.05],
                  [f + 0.05, f + 1 - 0.05, f + 1 - 0.05, f + 0.05],
                ],
                [50, 0.1, 0.1]
              ),
              r != c * c &&
                ((a.fillStyle = "#000"),
                (a.font = "30px monospace"),
                (a.textAlign = "center"),
                (a.textBaseline = "middle"),
                a.fillText(r, 50 * (w + 0.5 + 0.1), 50 * (f + 0.5 + 0.1)));
      };
    })(),
    Sa = "  222 333 444 555 666 777 888 999 101010 111111".split(" "),
    d = /#[0-9a-fA-F]{3}/g;
  $(function () {
    Ua = $("<canvas>");
    Ua[0].getContext && tools.regTool("image", TOOLS_IMAGE, c);
  });
  return { draw: Xa, drawPolygon: n };
});
var cross = (function (z, Qa, n, Xa, c, Ua, a) {
  function f(a, b) {
    var d = ib[b][~~(a / 24)];
    return 24 * ~~(d / 384) + bb[a % 24][(d >> 4) % 24];
  }
  function w(a, b) {
    var d = ib[b][a >> 4];
    return (~~(d / 384) << 4) | (lb[a & 15][(d >> 4) % 24] ^ (d & 15));
  }
  function T(a, b) {
    for (var d = 3; 0 <= d; d--) (b[d] = a & 1), (a >>= 1);
  }
  function h(a) {
    for (var b = 0, d = 0; 4 > d; d++) (b <<= 1), (b |= a[d]);
    return b;
  }
  function Va(a, b) {
    var d = ib[b][~~(a / 384)];
    return (
      384 * ~~(d / 384) +
      16 * bb[(a >> 4) % 24][(d >> 4) % 24] +
      (lb[a & 15][(d >> 4) % 24] ^ (d & 15))
    );
  }
  function Ya() {
    Ya = $.noop;
    for (var a = 0; 24 > a; a++) bb[a] = [];
    for (a = 0; 16 > a; a++) lb[a] = [];
    var b = [],
      d = [],
      oa = [];
    for (a = 0; 24 > a; a++)
      for (var Sa = 0; 24 > Sa; Sa++) {
        Xa(b, a, 4);
        Xa(d, Sa, 4);
        for (var Ta = 0; 4 > Ta; Ta++) oa[Ta] = b[d[Ta]];
        bb[a][Sa] = c(oa, 4);
        if (16 > a) {
          T(a, b);
          for (Ta = 0; 4 > Ta; Ta++) oa[Ta] = b[d[Ta]];
          lb[a][Sa] = h(oa);
        }
      }
    z(ib, 495, function (a, b) {
      for (
        var d = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], f = 4, h = 0;
        12 > h;
        h++
      )
        a >= Ua[11 - h][f]
          ? ((a -= Ua[11 - h][f--]), (d[h] = f << 1))
          : (d[h] = -1);
      Qa(d, b);
      a = 0;
      f = 4;
      var r = 0,
        n = [];
      for (h = 0; 12 > h; h++)
        0 <= d[h] &&
          ((a += Ua[11 - h][f--]),
          (n[f] = d[h] >> 1),
          (r |= (d[h] & 1) << (3 - f)));
      return ((24 * a + c(n, 4)) << 4) | r;
    });
    Ra = [];
    r = [];
    n(Ra, 0, 11880, 5, f);
    n(r, 0, 7920, 6, w);
  }
  function Ta() {
    function a(a, b) {
      var d = ~~(a / 3);
      return (
        3 *
          [
            [3, 1, 2, 7, 0, 5, 6, 4],
            [0, 1, 6, 2, 4, 5, 7, 3],
            [1, 2, 3, 0, 4, 5, 6, 7],
            [0, 5, 1, 3, 4, 6, 2, 7],
            [4, 0, 2, 3, 5, 1, 6, 7],
            [0, 1, 2, 3, 7, 4, 5, 6],
          ][b][d] +
        (((a % 3) +
          [
            [2, 0, 0, 1, 1, 0, 0, 2],
            [0, 0, 1, 2, 0, 0, 2, 1],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 2, 0, 0, 2, 1, 0],
            [1, 2, 0, 0, 2, 1, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
          ][b][d]) %
          3)
      );
    }
    Ta = $.noop;
    Ya();
    for (var b = 0; 24 > b; b++) {
      gb[b] = [];
      hb[b] = [];
      for (var d = 0; 6 > d; d++) {
        gb[b][d] = a(b, d);
        var c = [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1];
        c[b >> 1] = b & 1;
        Qa(c, d);
        for (var f = 0; 12 > f; f++)
          if (0 <= c[f]) {
            hb[b][d] = (f << 1) | c[f];
            break;
          }
      }
    }
    ab = [];
    for (b = 0; 4 > b; b++)
      (d = []),
        n(d, 72 * (b + 4) + 2 * (b + 4), 576, 5, function (a, b) {
          return 24 * gb[~~(a / 24)][b] + hb[a % 24][b];
        }),
        (ab[b] = d);
  }
  function Wa(b, d, c, h, n, z, oa, T) {
    if (0 == z) return 0 == b && 0 == d && c == 2 * (n + 4) && h == 3 * (n + 4);
    if (a(Ra, b) > z || a(r, d) > z || a(ab[n], 24 * h + c) > z) return !1;
    var Sa, Qa;
    for (Qa = 0; 6 > Qa; Qa++)
      if (Qa != oa && Qa != oa - 3) {
        var Ta = b;
        var Va = d;
        var Ua = c;
        var Ya = h;
        for (Sa = 0; 3 > Sa; Sa++)
          if (
            ((Ta = f(Ta, Qa)),
            (Va = w(Va, Qa)),
            (Ua = hb[Ua][Qa]),
            (Ya = gb[Ya][Qa]),
            Wa(Ta, Va, Ua, Ya, n, z - 1, Qa, T))
          )
            return T.push("FRUBLD".charAt(Qa) + " 2'".charAt(Sa)), !0;
      }
    return !1;
  }
  function oa(b, d, c, h, n) {
    if (0 == c) return 0 == b && 0 == d;
    if (a(Ra, b) > c || a(r, d) > c) return !1;
    var z, T;
    for (T = 0; 6 > T; T++)
      if (T != h && T != h - 3) {
        var Sa = b;
        var Qa = d;
        for (z = 0; 3 > z; z++)
          if (((Sa = f(Sa, T)), (Qa = w(Qa, T)), oa(Sa, Qa, c - 1, T, n)))
            return n.push("FRUBLD".charAt(T) + " 2'".charAt(z)), !0;
      }
    return !1;
  }
  function Sa(a) {
    Ya();
    for (var b = [], d = 0; 6 > d; d++) {
      for (var c = 0, h = 0, r = 0; r < a.length; r++)
        for (
          var n = jb[d].indexOf("FRUBLD".charAt(a[r][0])), z = a[r][2], T = 0;
          T < z;
          T++
        )
          (c = w(c, n)), (h = f(h, n));
      r = [];
      for (n = 0; 100 > n && !oa(h, c, n, -1, r); n++);
      r.reverse();
      b.push(r);
    }
    return b;
  }
  function d(a, b) {
    Ta();
    for (
      var d = 0, c = 0, h = [8, 10, 12, 14], r = [12, 15, 18, 21], n = 0;
      n < a.length;
      n++
    )
      for (
        var z = jb[b].indexOf("FRUBLD".charAt(a[n][0])), oa = a[n][2], T = 0;
        T < oa;
        T++
      ) {
        d = w(d, z);
        c = f(c, z);
        for (var Ra = 0; 4 > Ra; Ra++)
          (h[Ra] = hb[h[Ra]][z]), (r[Ra] = gb[r[Ra]][z]);
      }
    n = [];
    z = !1;
    for (oa = 0; !z; ) {
      for (Ra = 0; 4 > Ra; Ra++)
        if (Wa(c, d, h[Ra], r[Ra], Ra, oa, -1, n)) {
          z = !0;
          break;
        }
      oa++;
    }
    n.reverse();
    return n;
  }
  function b() {
    b = $.noop;
    Ya();
    kb = [];
    n(kb, 0, 190080, 7, Va, 6, 3, 6);
  }
  var Ra,
    r,
    ab,
    kb,
    ib = [],
    bb = [],
    lb = [],
    hb = [],
    gb = [],
    $a = "DULRFB".split(""),
    jb = "FRUBLD FLDBRU FDRBUL FULBDR URBDLF DRFULB".split(" "),
    ob = "&nbsp;&nbsp; z2 z' z&nbsp; x' x&nbsp;".split(" "),
    qb;
  execMain(function () {
    function a() {
      var b = $(this).parent(),
        c = "DULRFB".indexOf(b.html()[0]);
      d(qb, c);
      var f = $(this).html();
      if ("ec" == f) {
        var h = d(qb, c);
        f = "<<";
      } else (h = Sa(qb)[c]), (f = "ec");
      f = $("<span />").html(f).addClass("click").click(a);
      b.empty().append(
        $a[c] + "(",
        f,
        "): " + ob[c],
        tools.getSolutionSpan(h),
        "<br>"
      );
    }
    function b(b) {
      if (b)
        if (tools.isPuzzle("333")) {
          var d = tools.getCurScramble()[1];
          b.empty();
          qb = kernel.parseScramble(d, "FRUBLD");
          d = Sa(qb);
          for (var c = 0; 6 > c; c++) {
            var f = $('<span class="sol"/>'),
              h = $("<span />").html("ec").addClass("click").click(a);
            f.append(
              $a[c] + "(",
              h,
              "): " + ob[c],
              tools.getSolutionSpan(d[c]),
              "<br>"
            );
            b.append(f);
          }
        } else b.html(IMAGE_UNAVAILABLE);
    }
    $(function () {
      tools.regTool("cross", TOOLS_SOLVERS + ">" + TOOLS_CROSS, b);
    });
  });
  return {
    solve: Sa,
    getEasyCross: function (d) {
      b();
      8 < d && (d = 8);
      var c =
          mathlib.rn(
            [1, 16, 174, 1568, 11377, 57758, 155012, 189978, 190080][d]
          ) + 1,
        f;
      for (f = 0; 190080 > f && !(a(kb, f) <= d && 0 == --c); f++);
      d = ~~(f / 384);
      var h = (f >> 4) % 24;
      c = [];
      var r = [],
        n = [],
        w = [];
      T(f & 15, w);
      Xa(n, h, 4);
      h = 4;
      var z = [7, 6, 5, 4, 10, 9, 8, 11, 3, 2, 1, 0];
      for (f = 0; 12 > f; f++)
        d >= Ua[11 - f][h]
          ? ((d -= Ua[11 - f][h--]), (c[z[f]] = n[h]), (r[z[f]] = w[h]))
          : (c[z[f]] = r[z[f]] = -1);
      return [c, r];
    },
  };
})(
  mathlib.createMove,
  mathlib.edgeMove,
  mathlib.createPrun,
  mathlib.setNPerm,
  mathlib.getNPerm,
  mathlib.Cnk,
  mathlib.getPruning
);
execMain(
  function (z, Qa, n, Xa) {
    function c(a, c) {
      var f = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        d = a % 12,
        b = ~~(a / 12);
      b >= d && b++;
      f[d] = 2;
      f[b] = 4;
      Qa(f, c);
      for (var h = 0; 12 > h; h++)
        1 == f[h] >> 1 ? (d = h) : 2 == f[h] >> 1 && (b = h);
      b > d && b--;
      return 12 * b + d;
    }
    function Ua() {
      Ua = $.noop;
      z(w, 2048, [Qa, "o", 12, -2]);
      z(T, 132, c);
    }
    function a(a, c) {
      Ua();
      var f = kernel.parseScramble(a, "FRUBLD");
      c.empty();
      for (var d = 0; 12 > d; d++) {
        for (var b = 0, n = 116, r = 0; r < f.length; r++)
          for (
            var z = Ya[d].indexOf("FRUBLD".charAt(f[r][0])),
              oa = f[r][2],
              Qa = 0;
            Qa < oa;
            Qa++
          )
            (b = w[z][b]), (n = T[z][n]);
        b = h.search([b, n], 0);
        for (r = 0; r < b.length; r++)
          b[r] = "FRUBLD".charAt(b[r][0]) + " 2'".charAt(b[r][1]);
        c.append(
          $('<span class="sol">').append(
            Va[d] + ": " + Ta[d],
            tools.getSolutionSpan(b)
          ),
          "<br>"
        );
      }
    }
    function f(c) {
      if (c)
        if (tools.isPuzzle("333")) {
          var f = tools.getCurScramble();
          a(f[1], c);
        } else c.html(IMAGE_UNAVAILABLE);
    }
    var w = [],
      T = [],
      h = new mathlib.Solver(6, 3, [
        [0, [Qa, "o", 12, -2], 2048],
        [116, c, 132],
      ]),
      Va =
        "D(LR) D(FB) U(LR) U(FB) L(UD) L(FB) R(UD) R(FB) F(LR) F(UD) B(LR) B(UD)".split(
          " "
        ),
      Ya =
        "FRUBLD RBULFD FLDBRU LBDRFU FDRBUL DBRUFL FULBDR UBLDFR URBDLF RDBLUF DRFULB RUFLDB".split(
          " "
        ),
      Ta =
        "&nbsp;&nbsp;&nbsp; &nbsp;y&nbsp; z2&nbsp; z2y z'&nbsp; z'y &nbsp;z&nbsp; z&nbsp;y x'&nbsp; x'y &nbsp;x&nbsp; x&nbsp;y".split(
          " "
        );
    $(function () {
      tools.regTool("eoline", TOOLS_SOLVERS + ">" + TOOLS_EOLINE, f);
    });
    return { solve: a };
  },
  [mathlib.createMove, mathlib.edgeMove, mathlib.createPrun, mathlib.getPruning]
);
execMain(
  function (z) {
    function Qa(c, f) {
      Ua.ca = [0, 0, 0, 0, 0, 0, 0, 0];
      for (var h = 1; 3 > h; h++) {
        var n = c % 24;
        c = ~~(c / 24);
        Ua.ca[n & 7] = h | (n & 24);
      }
      z.CornMult(Ua, z.moveCube[3 * f], a);
      n = [];
      for (h = 0; 8 > h; h++) n[a.ca[h] & 7] = h | (a.ca[h] & 24);
      c = 0;
      for (h = 2; 0 < h; h--) c = 24 * c + n[h];
      return c;
    }
    function n(c, f) {
      Ua.ea = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (var h = 1; 4 > h; h++) {
        var n = c % 24;
        c = ~~(c / 24);
        Ua.ea[n >> 1] = (h << 1) | (n & 1);
      }
      z.EdgeMult(Ua, z.moveCube[3 * f], a);
      n = [];
      for (h = 0; 12 > h; h++) n[a.ea[h] >> 1] = (h << 1) | (a.ea[h] & 1);
      c = 0;
      for (h = 3; 0 < h; h--) c = 24 * c + n[h];
      return c;
    }
    function Xa(a, c) {
      c.empty();
      for (var z = 0; 4 > z; z++) {
        a: {
          var Wa = a,
            oa = T[z];
          var Sa = [126];
          for (var d = [11964], b = 1; 4 > b; b++)
            (Sa[b] = Qa(Sa[b - 1], 4)), (d[b] = n(d[b - 1], 4));
          var Ra = [];
          oa = oa.split("");
          for (var r = 0; 4 > r; r++) {
            Ra[r] = oa.join("");
            var Va = kernel.parseScramble(Wa, Ra[r]);
            for (b = 0; b < Va.length; b++)
              for (var Ua = Va[b][0], Ya = 0; Ya < Va[b][2]; Ya++)
                (Sa[r] = Qa(Sa[r], Ua)), (d[r] = n(d[r], Ua));
            mathlib.circle(oa, 0, 2, 3, 5);
          }
          for (oa = 1; 12 > oa; oa++)
            for (r = 0; 4 > r; r++)
              if ((Wa = f.search([Sa[r], d[r]], 1 == oa ? 0 : oa, oa))) {
                Wa.push(r);
                Sa = Wa;
                break a;
              }
          Sa = void 0;
        }
        d = Sa.pop();
        0 == z % 2 && (d = (d + 2) % 4);
        for (r = 0; r < Sa.length; r++)
          Sa[r] = "URFDLB".charAt(Sa[r][0]) + " 2'".charAt(Sa[r][1]);
        c.append(
          $('<span class="sol">').append(
            w[z] +
              ": " +
              h[z] +
              ["&nbsp;&nbsp;&nbsp;", "x'&nbsp;", "x2&nbsp;", "x&nbsp;&nbsp;"][
                d
              ],
            tools.getSolutionSpan(Sa)
          ),
          "<br>"
        );
      }
    }
    function c(a) {
      if (a)
        if (tools.isPuzzle("333")) {
          var c = tools.getCurScramble();
          Xa(c[1], a);
        } else a.html(IMAGE_UNAVAILABLE);
    }
    var Ua = new z(),
      a = new z(),
      f = new mathlib.Solver(6, 3, [
        [126, Qa, 576],
        [11964, n, 13824],
      ]),
      w = ["LU", "LD", "FU", "FD"],
      T = ["DRBULF", "URFDLB", "DBLUFR", "UBRDFL"],
      h = ["&nbsp;&nbsp;", "&nbsp;&nbsp;", "y&nbsp;", "y&nbsp;"];
    $(function () {
      tools.regTool("roux1", TOOLS_SOLVERS + ">" + TOOLS_ROUX1, c);
    });
    return { solve: Xa };
  },
  [mathlib.CubieCube]
);
(function () {
  function z(a, f) {
    for (var h = 0; h < n.length; h++) f = a(f, n[h]);
    for (h = 0; h < c.length; h++) f = a(f, c[h]);
    return f;
  }
  function Qa(a, c) {
    var f = {};
    c = c || " 2'";
    for (var h in a) for (var n = 0; n < c.length; n++) f[h + c[n]] = a[h];
    return f;
  }
  var n,
    Xa,
    c,
    Ua = (function () {
      function a(a, c) {
        for (
          var h = a.split(""),
            d = f["URF".indexOf(c[0])],
            b = "? 2'".indexOf(c[1]),
            n = 0;
          n < d.length;
          n++
        )
          mathlib.acycle(h, d[n], b);
        return h.join("");
      }
      var c = "URFDLB".split(""),
        f = [
          [
            [0, 1, 3, 2],
            [4, 8, 16, 20],
            [5, 9, 17, 21],
          ],
          [
            [4, 5, 7, 6],
            [1, 22, 13, 9],
            [3, 20, 15, 11],
          ],
          [
            [8, 9, 11, 10],
            [2, 4, 13, 19],
            [3, 6, 12, 17],
          ],
        ],
        w = new mathlib.gSolver(
          "XXXX???????????????????? ????XXXX???????????????? ????????XXXX???????????? ????????????XXXX???????? ????????????????XXXX???? ????????????????????XXXX".split(
            " "
          ),
          a,
          Qa({ U: 1, R: 2, F: 3 })
        );
      return function (f, h) {
        n = kernel.parseScramble(f, "URF");
        for (var z = "UUUURRRRFFFFDDDDLLLLBBBB", d = 0; d < n.length; d++) {
          var b = n[d];
          z = a(z, "URF".charAt(b[0]) + " 2'".charAt(b[2] - 1));
        }
        for (b = 0; 6 > b; b++) {
          var oa = [];
          for (d = 0; 24 > d; d++)
            oa.push(z[d] == "URFDLB".charAt(b) ? "X" : "?");
          d = w.search(oa.join(""), 0)[0];
          h.append(c[b] + ": ", tools.getSolutionSpan(d), "<br>");
        }
      };
    })(),
    a = (function () {
      function a(a, b) {
        for (
          var c = a.split(""),
            d = T["URFDLBMxr".indexOf(b[0])],
            f = "? 2'".indexOf(b[1]),
            h = 0;
          h < d.length;
          h++
        )
          mathlib.acycle(c, d[h], f);
        return c.join("");
      }
      function f(a, b) {
        for (
          var c = "z2 // orientation \n", d = 0;
          d < b.length && void 0 != b[d];
          d++
        )
          c +=
            b[d].join(" ").replace(/\s+/g, " ") +
            " // " +
            a[d].head +
            (0 == b[d].length ? " skip" : "") +
            "\n";
        return "https://alg.cubing.net/?alg=" + encodeURIComponent(c);
      }
      function w(b, d) {
        var h = +new Date(),
          r = [null, 0],
          n = [];
        c = [];
        for (var w = 0; w < b.length; w++) {
          if (!b[w].solv) {
            b[w].solv = {};
            for (var oa in b[w].step)
              b[w].solv[oa] = new mathlib.gSolver([oa], a, b[w].move);
          }
          var T = void 0,
            Ra = a,
            Sa = b[w].solv,
            Qa = b[w].step,
            Ta = b[w].fmov || [];
          r = r[1];
          var Wa = b[w].maxl || 10,
            Va = 0;
          a: for (; Va < Wa + 1; Va++)
            for (var Ua in Sa)
              if ((Qa[Ua] | r) == Qa[Ua]) {
                var Ya = z(Ra, Ua);
                T = Sa[Ua].search(Ya, 0, Va)[0];
                if (void 0 != T) {
                  r |= Qa[Ua];
                  break a;
                }
                for (var Za = 0; Za < Ta.length; Za++)
                  if (
                    ((T = Ra(Ya, Ta[Za])),
                    (T = Sa[Ua].search(T, 0, Va)[0]),
                    void 0 != T)
                  ) {
                    T.unshift(Ta[Za]);
                    r |= Qa[Ua];
                    break a;
                  }
              }
          r = [T, r];
          n[w] = r[0];
          if (void 0 == r[0]) {
            d.append(
              b[w].head +
                ": &nbsp;(no solution found in %d moves)".replace(
                  "%d",
                  b[w].maxl || 10
                ),
              "<br>"
            );
            break;
          }
          d.append(
            b[w].head + ": ",
            0 == n[w].length ? "&nbsp;(skip)" : tools.getSolutionSpan(n[w]),
            "<br>"
          );
          c = c.concat(n[w]);
          DEBUG &&
            console.log(
              "[step solver]",
              b[w].head + ": ",
              n[w],
              "->",
              r[1],
              z(a, mathlib.SOLVED_FACELET),
              +new Date() - h
            );
        }
        d.append(
          $('<a class="click" target="_blank">alg.cubing.net</a>').attr(
            "href",
            f(b, n) + "&setup=" + encodeURIComponent(Xa)
          )
        );
      }
      var T = [
          [
            [0, 2, 8, 6],
            [1, 5, 7, 3],
            [18, 36, 45, 9],
            [19, 37, 46, 10],
            [20, 38, 47, 11],
          ],
          [
            [9, 11, 17, 15],
            [10, 14, 16, 12],
            [2, 51, 29, 20],
            [5, 48, 32, 23],
            [8, 45, 35, 26],
          ],
          [
            [18, 20, 26, 24],
            [19, 23, 25, 21],
            [6, 9, 29, 44],
            [7, 12, 28, 41],
            [8, 15, 27, 38],
          ],
          [
            [27, 29, 35, 33],
            [28, 32, 34, 30],
            [24, 15, 51, 42],
            [25, 16, 52, 43],
            [26, 17, 53, 44],
          ],
          [
            [36, 38, 44, 42],
            [37, 41, 43, 39],
            [0, 18, 27, 53],
            [3, 21, 30, 50],
            [6, 24, 33, 47],
          ],
          [
            [45, 47, 53, 51],
            [46, 50, 52, 48],
            [2, 36, 33, 17],
            [1, 39, 34, 14],
            [0, 42, 35, 11],
          ],
          [
            [1, 19, 28, 52],
            [4, 22, 31, 49],
            [7, 25, 34, 46],
          ],
          [
            [9, 11, 17, 15],
            [10, 14, 16, 12],
            [2, 51, 29, 20],
            [5, 48, 32, 23],
            [8, 45, 35, 26],
            [36, 42, 44, 38],
            [37, 39, 43, 41],
            [0, 53, 27, 18],
            [3, 50, 30, 21],
            [6, 47, 33, 24],
            [1, 52, 28, 19],
            [4, 49, 31, 22],
            [7, 46, 34, 25],
          ],
          [
            [9, 11, 17, 15],
            [10, 14, 16, 12],
            [2, 51, 29, 20],
            [5, 48, 32, 23],
            [8, 45, 35, 26],
            [1, 52, 28, 19],
            [4, 49, 31, 22],
            [7, 46, 34, 25],
          ],
        ],
        Wa = Qa({ U: 0, R: 17, F: 34, D: 48, L: 65, B: 82 }),
        oa = Qa({ U: 0, R: 17, F: 34, L: 65, B: 82 }),
        Sa = Qa({ U: 0, R: 17, M: 97, r: 113 }),
        d = Qa({ U: 0, R: 17, L: 65 }),
        b = [
          {
            move: Wa,
            maxl: 8,
            head: "Cross",
            step: {
              "----U--------R--R-----F--F--D-DDD-D-----L--L-----B--B-": 0,
            },
          },
          {
            move: oa,
            head: "F2L-1",
            step: {
              "----U-------RR-RR-----FF-FF-DDDDD-D-----L--L-----B--B-": 1,
              "----U--------R--R----FF-FF-DD-DDD-D-----LL-LL----B--B-": 2,
              "----U--------RR-RR----F--F--D-DDD-DD----L--L----BB-BB-": 4,
              "----U--------R--R-----F--F--D-DDDDD----LL-LL-----BB-BB": 8,
            },
          },
          {
            move: oa,
            head: "F2L-2",
            step: {
              "----U-------RR-RR----FFFFFFDDDDDD-D-----LL-LL----B--B-": 3,
              "----U-------RRRRRR----FF-FF-DDDDD-DD----L--L----BB-BB-": 5,
              "----U--------RR-RR---FF-FF-DD-DDD-DD----LL-LL---BB-BB-": 6,
              "----U-------RR-RR-----FF-FF-DDDDDDD----LL-LL-----BB-BB": 9,
              "----U--------R--R----FF-FF-DD-DDDDD----LLLLLL----BB-BB": 10,
              "----U--------RR-RR----F--F--D-DDDDDD---LL-LL----BBBBBB": 12,
            },
          },
          {
            move: oa,
            head: "F2L-3",
            step: {
              "----U-------RRRRRR---FFFFFFDDDDDD-DD----LL-LL---BB-BB-": 7,
              "----U-------RR-RR----FFFFFFDDDDDDDD----LLLLLL----BB-BB": 11,
              "----U-------RRRRRR----FF-FF-DDDDDDDD---LL-LL----BBBBBB": 13,
              "----U--------RR-RR---FF-FF-DD-DDDDDD---LLLLLL---BBBBBB": 14,
            },
          },
          {
            move: oa,
            head: "F2L-4",
            step: {
              "----U-------RRRRRR---FFFFFFDDDDDDDDD---LLLLLL---BBBBBB": 15,
            },
          },
        ],
        Ra = [
          {
            move: Wa,
            maxl: 10,
            fmov: ["x ", "x2", "x'"],
            head: "Step 1",
            step: {
              "---------------------F--F--D--D--D-----LLLLLL-----B--B": 0,
            },
          },
          {
            move: Sa,
            maxl: 16,
            head: "Step 2",
            step: {
              "------------RRRRRR---F-FF-FD-DD-DD-D---LLLLLL---B-BB-B": 1,
            },
          },
        ],
        r = [
          {
            move: Wa,
            maxl: 8,
            head: "2x2x2",
            step: {
              "---------------------FF-FF-DD-DD--------LL-LL---------": 1,
              "------------------------------DD-DD----LL-LL-----BB-BB": 2,
            },
          },
          {
            move: Wa,
            maxl: 10,
            head: "2x2x3",
            step: {
              "---------------------FF-FF-DD-DD-DD----LLLLLL----BB-BB": 3,
            },
          },
        ],
        Ua = [
          {
            move: Wa,
            maxl: 10,
            head: "EOLine",
            step: {
              "-H-HUH-H-----R-------HFH-F--D-HDH-D-----L-------HBH-B-": 0,
            },
          },
          {
            move: d,
            maxl: 16,
            head: "ZZF2L1",
            step: {
              "-H-HUH-H----RRRRRR---HFF-FF-DDHDD-DD----L-------BBHBB-": 1,
              "-H-HUH-H-----R-------FFHFF-DD-DDHDD----LLLLLL---HBB-BB": 2,
            },
          },
          {
            move: d,
            maxl: 16,
            head: "ZZF2L2",
            step: {
              "-H-HUH-H----RRRRRR---FFFFFFDDDDDDDDD---LLLLLL---BBBBBB": 3,
            },
          },
        ];
      return function (a, d, c) {
        n = kernel.parseScramble(d, "URFDLB");
        for (d = 0; d < n.length; d++)
          n[d] = "DLFURB".charAt(n[d][0]) + " 2'".charAt(n[d][2] - 1);
        c.append("Orientation: &nbsp;z2<br>");
        "cf" == a && w(b, c);
        "roux" == a && w(Ra, c);
        "petrus" == a && w(r, c);
        "zz" == a && w(Ua, c);
      };
    })(),
    f = (function () {
      function a(a, d) {
        if (!a) return null;
        d = ~~d;
        a = a.split("|");
        if (0 == d) {
          var b = a[0].slice(6);
          a[0] = a[0].slice(0, 6) + a[1].slice(6);
          a[1] = a[1].slice(0, 6) + b;
        } else if (
          ((b = 0 < d ? 0 : 1),
          (d = Math.abs(d)),
          (a[b] = a[b].slice(d) + a[b].slice(0, d)),
          /[a-h]/.exec(a[b][0] + a[b][6]))
        )
          return null;
        return a.join("|");
      }
      function f(a) {
        for (var d = 0, b = 0, c = [], f = 0; f < a.length; f++)
          0 == a[f]
            ? (0 == d && 0 == b
                ? c.push("/")
                : c.push(((d + 5) % 12) - 5 + "," + (((b + 5) % 12) - 5) + "/"),
              (d = b = 0))
            : 0 < a[f]
            ? (d += ~~a[f])
            : (b -= ~~a[f]);
        return c;
      }
      for (var w = { 0: 33 }, T = 1; 12 > T; T++)
        (w["" + T] = 0), (w["" + -T] = 16);
      var Qa, oa;
      return function (h, d) {
        Qa =
          Qa ||
          new mathlib.gSolver(
            [
              "0Aa0Aa0Aa0Aa|Aa0Aa0Aa0Aa0",
              "0Aa0Aa0Aa0Aa|0Aa0Aa0Aa0Aa",
              "Aa0Aa0Aa0Aa0|Aa0Aa0Aa0Aa0",
              "Aa0Aa0Aa0Aa0|0Aa0Aa0Aa0Aa",
            ],
            a,
            w
          );
        oa =
          oa ||
          new mathlib.gSolver(
            [
              "0Aa0Aa0Aa0Aa|Bb1Bb1Bb1Bb1",
              "0Aa0Aa0Aa0Aa|1Bb1Bb1Bb1Bb",
              "Aa0Aa0Aa0Aa0|Bb1Bb1Bb1Bb1",
              "Aa0Aa0Aa0Aa0|1Bb1Bb1Bb1Bb",
            ],
            a,
            w
          );
        n = [];
        for (
          var b = /^\s*\(\s*(-?\d+),\s*(-?\d+)\s*\)\s*$/,
            T = h.split("/"),
            r = 0;
          r < T.length;
          r++
        ) {
          if (!/^\s*$/.exec(T[r])) {
            var Sa = b.exec(T[r]);
            ~~Sa[1] && n.push((~~Sa[1] + 12) % 12);
            ~~Sa[2] && n.push(-(~~Sa[2] + 12) % 12);
          }
          n.push(0);
        }
        0 < n.length && n.pop();
        c = [];
        b = Qa.search(z(a, "0Aa0Aa0Aa0Aa|Aa0Aa0Aa0Aa0"), 0)[0];
        d.append("Shape: ", tools.getSolutionSpan(f(b)), "<br>");
        c = c.concat(b);
        b = oa.search(z(a, "0Aa0Aa0Aa0Aa|Bb1Bb1Bb1Bb1"), 0)[0];
        d.append("Color: ", tools.getSolutionSpan(f(b)), "<br>");
      };
    })(),
    w = (function () {
      function a(a, c) {
        for (
          var h = a.split(""),
            n = f["RULBrbxy".indexOf(c[0])],
            d = "? '*".indexOf(c[1]),
            b = 0;
          b < n.length;
          b++
        )
          mathlib.acycle(h, n[b], d);
        return h.join("");
      }
      var f = [
          [
            [5, 25, 15],
            [9, 28, 17],
            [7, 29, 16],
            [8, 26, 19],
            [23, 14, 4],
          ],
          [
            [0, 20, 25],
            [2, 21, 27],
            [4, 22, 29],
            [1, 23, 26],
            [19, 7, 11],
          ],
          [
            [10, 15, 20],
            [13, 18, 24],
            [11, 16, 23],
            [14, 19, 22],
            [29, 1, 8],
          ],
          [
            [25, 20, 15],
            [29, 23, 19],
            [28, 21, 18],
            [27, 24, 17],
            [13, 9, 2],
          ],
          [
            [0, 25, 5],
            [4, 26, 7],
            [3, 27, 9],
            [2, 28, 6],
            [17, 12, 21],
          ],
          [
            [0, 20, 25],
            [2, 21, 27],
            [4, 22, 29],
            [1, 23, 26],
            [19, 7, 11],
          ],
          [
            [0, 25, 15, 10],
            [1, 27, 19, 13],
            [2, 29, 18, 11],
            [3, 26, 17, 14],
            [4, 28, 16, 12],
            [6, 7, 9, 8],
            [21, 23, 24, 22],
          ],
          [
            [5, 10, 20, 25],
            [6, 11, 21, 26],
            [7, 12, 22, 27],
            [8, 13, 23, 28],
            [9, 14, 24, 29],
            [1, 2, 4, 3],
            [16, 18, 19, 17],
          ],
          [],
        ],
        w;
      return function (f, h) {
        w =
          w ||
          new mathlib.gSolver(
            [
              "?L?L??B?B?UUUUU?R?R???F?F?????",
              "?F?F??L?L?UUUUU?B?B???R?R?????",
              "?R?R??F?F?UUUUU?L?L???B?B?????",
              "?B?B??R?R?UUUUU?F?F???L?L?????",
            ],
            a,
            Qa({ R: 0, r: 1, B: 2, b: 3 }, " '")
          );
        n = kernel.parseScramble(f, "RULB");
        for (var oa = 0; oa < n.length; oa++)
          n[oa] = "RULB".charAt(n[oa][0]) + " 2'".charAt(n[oa][2] - 1);
        var T = "URFDLB".split(""),
          d =
            "UUUUU?RR???FF????????LL???BB?? ???BBUUUUU??L?L?FF????????R?R? ?B?B??R?R?UUUUU?F?F???L?L????? ????????RR???BBUUUUU???LL???FF ?BB????????R?R????FFUUUUU??L?L ??F?F??R?R???????B?B?L?L?UUUUU".split(
              " "
            );
        for (oa = 0; 6 > oa; oa++) {
          c = [];
          var b = ["x*", "y ", null, "x ", "y*", "y'"],
            Ra = ~~(z(a, "U????R????F????D????L????B????").indexOf(T[oa]) / 5);
          b[Ra] && c.push(b[Ra]);
          (b = w.search(z(a, d[oa]), 0)[0])
            ? (h.append(T[oa] + ": "),
              c[0] &&
                h.append("&nbsp;" + c[0].replace("'", "2").replace("*", "'")),
              h.append(tools.getSolutionSpan(b), "<br>"))
            : h.append(T[oa] + ": no solution found<br>");
        }
      };
    })(),
    T = (function () {
      function a(a, c) {
        for (
          var h = a.split(""),
            n = f["RULB".indexOf(c[0])],
            d = "? '".indexOf(c[1]),
            b = 0;
          b < n.length;
          b++
        )
          mathlib.acycle(h, n[b], d);
        return h.join("");
      }
      var f = [
          [
            [5, 9, 22],
            [0, 7, 20],
            [1, 8, 18],
          ],
          [
            [3, 16, 11],
            [1, 14, 6],
            [2, 12, 7],
          ],
          [
            [4, 23, 15],
            [2, 18, 13],
            [0, 19, 14],
          ],
          [
            [10, 17, 21],
            [8, 12, 19],
            [6, 13, 20],
          ],
        ],
        w;
      return function (f, h) {
        w =
          w ||
          new mathlib.gSolver(
            ["????FF??RRR??L?L?L?DDDDD"],
            a,
            Qa({ R: 0, U: 1, L: 2, B: 3 }, " '")
          );
        n = kernel.parseScramble(f, "RULBrulb");
        f = [];
        for (var oa = 0; oa < n.length; oa++)
          1 == n[oa][1] &&
            f.push("RULB".charAt(n[oa][0]) + " 2'".charAt(n[oa][2] - 1));
        var T = ["D", "L", "R", "F"],
          d = [
            ["RULB", "LUBR", "BURL"],
            ["URBL", "LRUB", "BRLU"],
            ["RLBU", "ULRB", "BLUR"],
            ["RBUL", "UBLR", "LBRU"],
          ];
        for (oa = 0; 4 > oa; oa++) {
          c = [];
          var b,
            Ra = 0;
          a: for (; 99 > Ra; Ra++)
            for (var r = 0; 3 > r; r++) {
              var Ta = d[oa][r];
              n = [];
              for (var Va = 0; Va < f.length; Va++)
                n.push("RULB"[Ta.indexOf(f[Va][0])] + f[Va][1]);
              if ((b = w.search(z(a, "????FF??RRR??L?L?L?DDDDD"), Ra, Ra)[0])) {
                for (Va = 0; Va < b.length; Va++)
                  b[Va] = Ta["RULB".indexOf(b[Va][0])] + b[Va][1];
                break a;
              }
            }
          b
            ? h.append(T[oa] + ": ", tools.getSolutionSpan(b), "<br>")
            : h.append(T[oa] + ": no solution found<br>");
        }
      };
    })();
  (function () {
    function a(a, c) {
      var b = a.indexOf("-"),
        d = b >> 2;
      b &= 3;
      var f = a.split(""),
        h = ~~c[1],
        n = [4 * d + b];
      if ("V" == c[0]) {
        if ("$" == f[4 * d + h]) return null;
        for (; b > h; ) b--, n.push(4 * d + b);
        for (; b < h; ) b++, n.push(4 * d + b);
      } else {
        if ("$" == f[4 * h + b]) return null;
        for (; d > h; ) d--, n.push(4 * d + b);
        for (; d < h; ) d++, n.push(4 * d + b);
      }
      n.reverse();
      mathlib.acycle(f, n);
      return f.join("");
    }
    function f(a) {
      var d = [];
      a = a.split("");
      for (var b = 0; b < a.length; b++)
        "?" == a[b] && ((a[b] = "-"), d.push(a.join("")), (a[b] = "?"));
      return d;
    }
    function n(f, d) {
      for (var b = [], h = 0; h < d.length; h++) b[h] = f[d[h]];
      f = b.join("");
      for (h = 0; h < c.length; h++) f = a(f, c[h]);
      return f;
    }
    var w = new mathlib.gSolver(
        f("0123????????????"),
        a,
        Qa({ V: 0, H: 1 }, "0123")
      ),
      z = new mathlib.gSolver(
        f("$$$$4???8???c???"),
        a,
        Qa({ V: 0, H: 1 }, "0123")
      ),
      oa = new mathlib.gSolver(
        ["$$$$$567$9ab$de-"],
        a,
        Qa({ V: 0, H: 1 }, "0123")
      );
    scrMgr.reg(["15prp", "15prap", "15prmp"], function (a) {
      var d = +new Date();
      do {
        var b = mathlib.rndPerm(16);
        var f = 3 * (3 - ~~(b.indexOf(b.length - 1) / 4));
        for (var h = 0; h < b.length; h++)
          for (var T = h + 1; T < b.length; T++)
            b[h] > b[T] && b[h] != b.length - 1 && f++;
      } while (0 != f % 2);
      f = b;
      h = [];
      T = [0, 4, 8, 12, 1, 5, 9, 13, 2, 6, 10, 14, 3, 7, 11, 15];
      for (var Qa = 0; 16 > Qa; Qa++) h[Qa] = T[f[T[Qa]]];
      b = [b, h];
      h = f = 0;
      a: for (; 99 > h; h++)
        for (f = 0; 2 > f; f++)
          if (
            ((T = b[f].indexOf(b.length - 1)),
            (c = ["V" + (T & 3), "H" + (T >> 2)]),
            (T = n("0123???????????-", b[f])),
            (T = w.search(T, h, h)[0]))
          ) {
            c = c.concat(T);
            break a;
          }
      h = z.search(n("01234???8???c??-", b[f]).replace(/[0123]/g, "$"), 0)[0];
      c = c.concat(h);
      h = oa.search(
        n("0123456789abcde-", b[f]).replace(/[012348c]/g, "$"),
        0
      )[0];
      c = c.concat(h);
      DEBUG &&
        console.log(
          "[15p solver]",
          f,
          n("0123456789abcde-", b[f]),
          c.join(""),
          c.length,
          +new Date() - d
        );
      c.reverse();
      h = a.slice(4);
      a = [];
      d = 0 == f ? "VH" : "HV";
      b = -1 == h.indexOf("a") ? ["DR", "UL"] : ["ï¿¬ï¿«", "ï¿ªï¿©"];
      f = -1 != h.indexOf("m");
      h = -1 != h.indexOf("p");
      T = [3, 3];
      for (Qa = 0; Qa < c.length; Qa++) {
        var Sa = ~~c[Qa][1],
          Ta = d.indexOf(c[Qa][0]);
        if (T[Ta] != Sa) {
          var Va = b[f != T[Ta] > Sa ? 0 : 1][Ta],
            Ua = Math.abs(T[Ta] - Sa);
          if (h) a.push(Va + Ua);
          else for (; 0 < Ua--; ) a.push(Va);
          T[Ta] = Sa;
        }
      }
      return a.join(" ").replace(/1/g, "");
    });
  })();
  execMain(function () {
    function c(c, h) {
      if (h) {
        h.empty();
        var n = $('<span class="sol"/>'),
          z = tools.getCurScramble();
        Xa = z[1];
        if ("222face" == c && tools.isPuzzle("222")) Ua(z[1], n);
        else if (
          c.startsWith("333") &&
          tools.isPuzzle("333") &&
          /^[URFDLB 2']+$/.exec(z[1])
        )
          a(c.slice(3), z[1], n);
        else if ("sq1cs" == c && tools.isPuzzle("sq1")) f(z[1], n);
        else if ("skbl1" == c && tools.isPuzzle("skb")) w(z[1], n);
        else if ("pyrv" == c && tools.isPuzzle("pyr")) T(z[1], n);
        else {
          h.html(IMAGE_UNAVAILABLE);
          return;
        }
        h.append(n);
      }
    }
    $(function () {
      tools.regTool(
        "222face",
        TOOLS_SOLVERS + ">" + TOOLS_222FACE,
        c.bind(null, "222face")
      );
      tools.regTool(
        "333cf",
        TOOLS_SOLVERS + ">Cross + F2L",
        c.bind(null, "333cf")
      );
      tools.regTool(
        "333roux",
        TOOLS_SOLVERS + ">Roux S1 + S2",
        c.bind(null, "333roux")
      );
      tools.regTool(
        "333petrus",
        TOOLS_SOLVERS + ">2x2x2 + 2x2x3",
        c.bind(null, "333petrus")
      );
      tools.regTool(
        "333zz",
        TOOLS_SOLVERS + ">EOLine + ZZF2L",
        c.bind(null, "333zz")
      );
      tools.regTool(
        "sq1cs",
        TOOLS_SOLVERS + ">SQ1 S1 + S2",
        c.bind(null, "sq1cs")
      );
      tools.regTool(
        "pyrv",
        TOOLS_SOLVERS + ">Pyraminx V",
        c.bind(null, "pyrv")
      );
      tools.regTool(
        "skbl1",
        TOOLS_SOLVERS + ">Skewb Face",
        c.bind(null, "skbl1")
      );
    });
  });
})();
var giikerutil = execMain(
  function (z) {
    function Qa(a) {
      a &&
        (h.html(oa).removeClass("click").unbind("click"),
        GiikerCube.isConnected() ||
          h.html("Bluetooth: Connect").addClass("click").click(w),
        a
          .empty()
          .append(h, "<br>")
          .append(Va.unbind("click").click(Ua), "<br>")
          .append("Raw Data: ", Ya, "<br>")
          .append("Last Solve: ", Ta, "<br>")
          .append(Wa),
        Sa());
    }
    function n() {
      GiikerCube.isConnected()
        ? (GiikerCube.getCube()
            .getBatteryLevel()
            .then(function (a) {
              b = a[0];
              oa = a[1] + ": Connected | " + (b || "??") + "%";
              h.html(oa);
            }),
          (d = setTimeout(n, 6e4)))
        : (d = 0);
    }
    function Xa() {
      gb && (clearTimeout(gb), (gb = 0));
      kernel.getProp("giiAED") &&
        (gb = setTimeout(function () {
          a: {
            var a = jb;
            if (1 != a.length % 2) {
              var b = [];
              b[a.length] = new z();
              for (var d = a.length - 1; 0 <= d; d--)
                (b[d] = new z()), z.CubeMult(z.moveCube[a[d]], b[d + 1], b[d]);
              for (d = 1; 3 > d; d++) {
                $a = 0;
                if (c(a, 0, d, new z(), b)) {
                  a = d;
                  break a;
                }
                if (9999 < $a) break;
              }
            }
            a = 99;
          }
          99 != a &&
            ((a = kb.toFaceCube()),
            2 >= cubeutil.getProgress(a, "cfop") ||
              ((a = scramble_333.genFacelet(kb.toFaceCube())),
              10 > a.length / 3
                ? DEBUG &&
                  console.log(
                    "[giiker]",
                    "Possible error, gen=" + a.replace(/ /g, "") + ", ignore"
                  )
                : (DEBUG &&
                    console.log(
                      "[giiker]",
                      "Almost error, gen=" +
                        a.replace(/ /g, "") +
                        ", mark solved"
                    ),
                  Ua())));
        }, 1e3));
    }
    function c(a, b, d, f, h) {
      if (0 == d) return f.isEqual(new z().invFrom(h[b]));
      for (var n = new z(); b < a.length - 1; b++) {
        if (~~(a[b] / 3) % 3 != ~~(a[b + 1] / 3) % 3) {
          var r = new z().init(f.ca, f.ea);
          z.CubeMult(r, z.moveCube[a[b + 1]], n);
          z.CubeMult(n, z.moveCube[a[b]], r);
          z.CubeMult(r, h[b + 2], n);
          if (9999 < ++$a) break;
          if (n.edgeCycles() < d) var w = c(a, b + 2, d - 1, r, h);
          if (w) return !0;
        }
        z.CubeMult(f, z.moveCube[a[b]], n);
        f.init(n.ca, n.ea);
      }
      return !1;
    }
    function Ua() {
      bb.invFrom(ab);
      ib = mathlib.SOLVED_FACELET;
      kernel.setProp("giiSolved", r);
      jb = [];
      ob = [];
      mb = 0;
      Sa();
      Ra(ib, ["U "], hb);
    }
    function a(a, c, w, T) {
      w = w || $.now();
      oa = T + ": Connected | " + (b || "??") + "%";
      h.html(oa).removeClass("click").unbind("click");
      r = a;
      ab.fromFacelet(r);
      z.EdgeMult(bb, ab, kb);
      z.CornMult(bb, ab, kb);
      ib = kb.toFaceCube();
      jb.push(3 * "URFDLB".indexOf(c[0][0]) + " 2'".indexOf(c[0][1]));
      ob.push(timer.getCurTime(w));
      a = jb.length;
      if (20 < a) {
        T = "";
        for (var Qa = 0; Qa < mb; Qa++) {
          var Ta = jb[Qa];
          T += "URFDLB".charAt(~~(Ta / 3)) + " 2'".charAt(Ta % 3);
        }
        var Va = "";
        for (Qa = mb; Qa < jb.length; Qa++)
          (Ta = jb[Qa]),
            (Va +=
              "URFDLB".charAt(~~(Ta / 3)) +
              " 2'".charAt(Ta % 3) +
              "/*" +
              ob[Qa] +
              "*/");
        f(Ya, a + " move(s)", T, Va);
      }
      ib == mathlib.SOLVED_FACELET && ((jb = []), (ob = []), (mb = 0));
      Sa();
      0 == d && n();
      Xa();
      Ra(ib, c, w);
    }
    function f(a, b, c, d) {
      a.attr("href", "https://alg.cubing.net/?alg=" + d + "&setup=" + c);
      a.html(b);
    }
    function w() {
      r = kernel.getProp("giiSolved", mathlib.SOLVED_FACELET);
      ab.fromFacelet(r);
      bb.invFrom(ab);
      GiikerCube.setCallBack(a);
      return GiikerCube.isConnected() ? Promise.resolve() : GiikerCube.init();
    }
    function T(a, b) {
      var c = b[0];
      qb = b[1];
      if ("333" != tools.puzzleType(c)) qb = "";
      else {
        c = kernel.parseScramble(qb, "URFDLB");
        var d = new z();
        lb.init(d.ca, d.ea);
        for (var f = 0; f < c.length; f++) {
          var h = 3 * c[f][0] + c[f][2] - 1;
          0 > h ||
            18 <= h ||
            (z.EdgeMult(lb, z.moveCube[h], d),
            z.CornMult(lb, z.moveCube[h], d),
            (h = lb),
            (lb = d),
            (d = h));
        }
      }
    }
    var h = $("<span></span>"),
      Va = $("<span>Reset (Mark Solved)</span>").addClass("click"),
      Ya = $('<a target="_blank">0 move(s)</a>').addClass("click"),
      Ta = $('<a target="_blank"></a>').addClass("click"),
      Wa = $("<canvas>"),
      oa = "Connected | ??%",
      Sa = (function () {
        var a = [1, 2, 1, 1, 0, 3],
          b = [0, 1, 1, 2, 1, 1],
          d = "#ff0 #fa0 #00f #fff #f00 #0d0".split(" "),
          c;
        return function () {
          if (Wa)
            if (kernel.getProp("giiVRC")) Wa.hide();
            else {
              d = kernel.getProp("colcube").match(/#[0-9a-fA-F]{3}/g);
              Wa.show();
              c = Wa[0].getContext("2d");
              var f = kernel.getProp("imgSize") / 50;
              Wa.width(39 * f + "em");
              Wa.height(29 * f + "em");
              Wa.attr("width", 391);
              Wa.attr("height", (87 / 9) * 30 + 1);
              for (f = 0; 6 > f; f++)
                for (
                  var h = f,
                    n = ib,
                    r = (10 / 3) * a[h],
                    w = (10 / 3) * b[h],
                    z = 0;
                  3 > z;
                  z++
                )
                  for (var oa = 0; 3 > oa; oa++)
                    image.drawPolygon(
                      c,
                      d["DLBURF".indexOf(n[3 * (3 * h + oa) + z])],
                      [
                        [z, z, z + 1, z + 1],
                        [oa, oa + 1, oa + 1, oa],
                      ],
                      [30, r, w]
                    );
            }
        };
      })(),
      d = 0,
      b = 0,
      Ra = $.noop,
      r = mathlib.SOLVED_FACELET,
      ab = new z(),
      kb = new z(),
      ib = r,
      bb = new z(),
      lb = new z(),
      hb = $.now(),
      gb = 0,
      $a = 0,
      jb = [],
      ob = [],
      qb,
      mb = 0;
    $(function () {
      kernel.regListener("giiker", "scramble", T);
      kernel.regListener("tool", "property", Sa, /^(?:giiVRC)$/);
      tools.regTool("giikerutil", TOOLS_GIIKER, Qa);
    });
    return {
      setCallBack: function (a) {
        Ra = a;
      },
      markSolved: Ua,
      checkScramble: function () {
        return "" == qb ? !1 : lb.isEqual(kb);
      },
      markScrambled: function () {
        mb = jb.length;
      },
      init: w,
      setLastSolve: function (a) {
        f(Ta, "Ready", qb, a);
      },
    };
  },
  [mathlib.CubieCube]
);
var insertionFinder = execMain(function () {
  function z() {
    $.ajax({
      url: "http://mf.qiyuuu.com/api/if.cube",
      dataType: "jsonp",
      data: { scramble: Xa.val(), skeleton: c.val() },
      success: function (a, c, f) {
        a.validate
          ? (Ua.val(a.url), Qa(a.url))
          : Ua.val("Error. Because of parity or scramble/skeleton overflow. ");
      },
    });
  }
  function Qa(a) {
    $.ajax({
      url: a,
      dataType: "jsonp",
      success: function (a, c, f) {
        Ua.val(a.result.replace(/<br \/>/g, "").replace(/^\s+|\s+$/g, ""));
      },
    });
  }
  function n(c) {
    c && (c.empty().append(f), a.unbind("click").click(z));
  }
  var Xa = $('<textarea rows="3" style="width: 100%" />'),
    c = $('<textarea rows="3" style="width: 100%" />'),
    Ua = $('<textarea rows="5" style="width: 100%" readonly />'),
    a = $('<input type="button">').val("submit").click(z),
    f = $("<div />").css("text-align", "center");
  $(function () {
    f.append(
      "scramble:",
      "<br>",
      Xa,
      "<br>",
      "skeleton:",
      "<br>",
      c,
      "<br>",
      a,
      "<br>",
      Ua
    );
    tools.regTool("if", "InsertionFinder", n);
  });
});
var metronome = execMain(function () {
  function z(a) {
    return 99 < a ? a : " " + a;
  }
  function Qa(a) {
    a
      ? (a
          .empty()
          .append("BPM: ", h, Ya, "<br />")
          .append("Vol: ", Va, Ta, "<br />", T, "<br />")
          .append(
            "<br />",
            $("<label>").append(Sa, '<span class="click"> Beep at</span>'),
            "<br />",
            oa
          ),
        h.unbind().on("input", function () {
          Ya.html(z(h.val()));
          Xa();
        }),
        Va.unbind().on("input", function () {
          Ta.html(z(Va.val()));
          Wa.gain.value = Va.val() / 100;
        }),
        T.html(d ? "Stop!" : "Start!"),
        T.unbind().click(function () {
          d = !d;
          T.html(d ? "Stop!" : "Start!");
          Xa();
        }),
        n())
      : (null != b && (clearInterval(b), (b = null)), (d = !1));
  }
  function n() {
    Sa.unbind("change").change(Ua).prop("checked", kernel.getProp("beepEn"));
    oa.unbind("change").change(Ua).val(kernel.getProp("beepAt"));
    Ua();
  }
  function Xa() {
    null != b && (clearInterval(b), (b = null));
    if (d) {
      var a = 6e4 / ~~h.val();
      b = setInterval(c, a);
    }
  }
  function c(a) {
    var b = w.createOscillator();
    b.type = "sine";
    b.frequency.value = a || 440;
    b.connect(Wa);
    b.start(w.currentTime);
    b.stop(w.currentTime + 0.1);
  }
  function Ua() {
    Sa.prop("checked")
      ? a(oa.val())
      : null != Ra && (clearInterval(Ra), (Ra = null));
    kernel.setProp("beepEn", Sa.prop("checked"));
    kernel.blur();
  }
  function a(a) {
    null != Ra && (clearInterval(Ra), (Ra = null));
    a = a.split(",");
    for (var b = 0; b < a.length; b++) a[b] = ~~(1e3 * a[b].trim()) / 1e3;
    a = a.filter(Number);
    a.sort(function (a, b) {
      return a - b;
    });
    r = a;
    oa.val(a.join(","));
    kernel.setProp("beepAt", a.join(","));
    Ra = setInterval(f, 100);
  }
  function f() {
    var a = ~~timer.getCurTime() / 1e3;
    if (0 == a) ab = 0;
    else {
      for (var b = !1; ab < r.length && a > r[ab] - 0.05; ) ++ab, (b = !0);
      b && c(550);
    }
  }
  var w,
    T = $(
      '<span style="display:inline-block; text-align:center; width:100%;"/>'
    ).addClass("click"),
    h = $(
      '<input type="range" value="60" min="10" max="360" style="width:7em;" />'
    ),
    Va = $(
      '<input type="range" value="30" min="0" max="100" style="width:7em;" />'
    ),
    Ya = $("<span />").html(" 60"),
    Ta = $("<span />").html(" 30"),
    Wa,
    oa = $('<input type="text" style="width:7em;" />'),
    Sa = $('<input type="checkbox" />'),
    d = !1,
    b = null,
    Ra = null,
    r = [],
    ab = 0;
  $(function () {
    kernel.regProp("tools", "beepEn", -6, "Beep Enable", [!1]);
    kernel.regProp("tools", "beepAt", -6, "Beep At", ["5,10,15,20"]);
    var a = window.AudioContext || window.webkitAudioContext;
    void 0 !== a &&
      ((w = new a()),
      (Wa = w.createGain()),
      (Wa.gain.value = 0.3),
      Wa.connect(w.destination),
      tools.regTool("mtrnm", TOOLS_METRONOME, Qa));
    n();
  });
  return { playTick: c };
});
var onlinecomp = execMain(function () {
  function z(a, c) {
    for (; bb.length > c; ) bb.pop().remove();
    var d = a;
    if (-1 != lb.indexOf(d)) d = null;
    else {
      var f = [];
      d += "|";
      for (
        var h = d.length, n = $('<select style="max-width: unset;">'), r = 0;
        r < lb.length;
        r++
      )
        if (lb[r].startsWith(d)) {
          var w = lb[r].slice(h).split("|", 1)[0];
          -1 == f.indexOf(w) &&
            (f.push(w), n.append($("<option>").val(w).html(w)));
        }
      d = 0 == f.length ? null : n.change(Qa);
    }
    d && ((bb[c] = d), b.append(bb[c]), z(a + "|" + bb[c].val(), c + 1));
  }
  function Qa(a) {
    a = $(a.target).prevAll("select").length;
    for (var b = "", c = 0; c <= a; c++) b = b + "|" + bb[c].val();
    z(b, a + 1);
    w();
    b == "|" + OLCOMP_UPDATELIST + "..." && n();
  }
  function n() {
    d.val("...");
    $.post("https://cstimer.net/comp.php", { action: "list" }, function (a) {
      lb = [];
      a = JSON.parse(a).data;
      for (var b = 0; b < a.length; b++) {
        var c = a[b].fullname;
        hb[c] = a[b].name;
        for (var f = JSON.parse(a[b].value), h = 0; h < f.length; h++)
          lb.push("|" + c + "|" + f[h]);
      }
      lb.push("|" + OLCOMP_UPDATELIST + "...");
      hb[OLCOMP_UPDATELIST + "..."] = "update";
      z("", 0);
      w();
      d.hide();
    }).error(function () {
      logohint.push("Network Error");
      d.val(OLCOMP_UPDATELIST);
    });
  }
  function Xa() {
    for (var a = "", b = 0; b < bb.length; b++) a += "|" + bb[b].val();
    if (-1 == lb.indexOf(a)) alert("Invalid Input");
    else
      return (
        (b = a.slice(1).split("|", 1)[0]),
        (a = a.slice(b.length + 2)),
        (b = hb[b]),
        [b, a]
      );
  }
  function c() {
    var a = Xa();
    $.post(
      "https://cstimer.net/comp.php",
      { action: "scramble", comp: a[0], path: a[1] },
      function (a) {
        a = JSON.parse(a);
        0 == a.retcode && a.data
          ? ((ob = a = a.data),
            (qb = $.map(a, function (a) {
              return (a = /^\$T([a-zA-Z0-9]+)\$\s*(.*)$/.exec(a))
                ? scramble.getTypeName(a[1])
                : "???";
            })),
            w(!0),
            kernel.setProp("scrType", "remoteComp"))
          : logohint.push(a.reason || "Server Error");
      }
    ).error(function () {
      logohint.push("Network Error");
    });
  }
  function Ua() {
    var b = prompt(OLCOMP_SUBMITAS, exportFunc.getDataId("locData", "compid"));
    if (null == b) return !1;
    if (!exportFunc.isValidId(b)) return alert(EXPORT_INVID), !1;
    localStorage.locData = JSON.stringify({
      id: exportFunc.getDataId("locData", "id"),
      compid: b,
    });
    a();
    return b;
  }
  function a() {
    Wa.empty().append("ID: ");
    oa.empty();
    Sa.empty();
    if (exportFunc.getDataId("wcaData", "cstimer_token")) {
      var b = exportFunc.getDataId("wcaData", "wca_me").wca_id;
      oa.append(b || "WCA Account", " (WCA)").click(function () {
        exportFunc.logoutFromWCA(!0);
        a();
      });
      Wa.append(oa);
    } else
      oa.append(EXPORT_LOGINWCA),
        oa.click(function () {
          location.href = exportFunc.wcaLoginUrl;
        }),
        (b = exportFunc.getDataId("locData", "compid"))
          ? Sa.append(b + " (" + OLCOMP_ANONYM + ")")
          : Sa.append("N/A (" + OLCOMP_ANONYM + ")"),
        Wa.append(Sa.unbind("click").click(Ua), " | ", oa);
  }
  function f(c, f) {
    !c || gb
      ? (gb = !!c)
      : (c
          .empty()
          .append(
            $('<div style="font-size: 0.75em; text-align: center;">')
              .append(Wa, d, b)
              .append(Ra)
              .append(r, " ", ab, " ")
              .append($("<label>").append(ib, OLCOMP_WITHANONYM), " ", kb)
          ),
        z("", 0),
        a(),
        w(),
        (gb = !0));
  }
  function w(a, b) {
    $a = [];
    a || ((ob = []), (qb = []));
    b || (jb = !1);
    T();
  }
  function T() {
    r.unbind("click");
    ab.unbind("click");
    kb.unbind("click").click(Ya);
    if (2 > bb.length)
      r.attr("disabled", !0).val(OLCOMP_START), ab.attr("disabled", !0);
    else {
      Ra.empty();
      if (0 == qb.length)
        bb[0].val().startsWith("*") || bb[0].val().startsWith("+") || jb
          ? jb
            ? r.attr("disabled", !0).val(OLCOMP_SUBMIT)
            : r.attr("disabled", !0).val(OLCOMP_START)
          : r.removeAttr("disabled").val(OLCOMP_START).click(c);
      else {
        for (var a = 0; a < qb.length; a++)
          /^\$T([a-zA-Z0-9]+)\$\s*(.*)$/.exec(qb[a]),
            Ra.append(
              a + 1 + ". " + ($a[a] ? stats.pretty($a[a][0]) : qb[a]),
              "<br>"
            );
        $a.length != qb.length || jb
          ? r.attr("disabled", !0)
          : (r.removeAttr("disabled"), r.val(OLCOMP_SUBMIT).click(h));
      }
      ab.removeAttr("disabled").click(Va);
    }
    kernel.blur();
  }
  function h() {
    if (!jb) {
      var a =
        exportFunc.getDataId("wcaData", "cstimer_token") ||
        exportFunc.getDataId("locData", "compid") ||
        Ua();
      if (a) {
        var b = Xa();
        $.post(
          "https://cstimer.net/comp.php",
          {
            action: "submit",
            comp: b[0],
            path: b[1],
            uid: a,
            value: JSON.stringify($a),
          },
          function (a) {
            '{"retcode":0}' == a
              ? ((jb = !0), logohint.push("Submitted"))
              : logohint.push("Network Error");
            T();
          }
        ).error(function () {
          logohint.push("Network Error");
        });
      }
    }
  }
  function Va() {
    if (0 == $a.length || jb || confirm(OLCOMP_ABORT)) {
      w(!1, !0);
      var a = Xa(),
        b = ib.prop("checked") ? 1 : 0;
      $.post(
        "https://cstimer.net/comp.php",
        { action: "result", comp: a[0], path: a[1], anonym: b },
        function (a) {
          try {
            a = JSON.parse(a);
          } catch (wb) {
            a = {};
          }
          if (0 !== a.retcode) logohint.push("Server Error");
          else {
            var b = $.sha256(
                "cstimer_public_salt_" +
                  exportFunc.getDataId("locData", "compid")
              ),
              c = (exportFunc.getDataId("wcaData", "wca_me") || {}).wca_id,
              d = a.scramble;
            a = $.map(a.data, function (a) {
              var b = JSON.parse(a.value);
              if (5 == b.length) {
                var c = new TimeStat([5], b.length, function (a) {
                  return -1 == b[a][0][0] ? -1 : b[a][0][0] + b[a][0][1];
                });
                c.getAllStats();
                return {
                  uid: a.uid,
                  wca_id: a.wca_id,
                  value: b,
                  ao5: c.lastAvg[0][0],
                  bo5: c.bestTime,
                };
              }
            });
            a.sort(function (a, b) {
              var c = TimeStat.dnfsort(a.ao5, b.ao5);
              return 0 == c ? TimeStat.dnfsort(a.bo5, b.bo5) : c;
            });
            for (
              var f = [
                  '<table class="table"><tr><th></th><th>User</th><th>ao5</th><th>bo5</th><th>Results</th></tr>',
                ],
                h = 0;
              h < a.length;
              h++
            ) {
              var n = a[h].uid,
                r = a[h].value,
                w = a[h].ao5,
                z = a[h].bo5,
                oa = a[h].wca_id;
              f.push("<tr><td>" + (h + 1) + "</td>");
              void 0 !== oa
                ? ((n = oa
                    ? '<a target="_blank" href="https://www.worldcubeassociation.org/persons/' +
                      oa +
                      '">' +
                      oa +
                      "</a>"
                    : OLCOMP_WCAACCOUNT),
                  f.push(
                    oa == c
                      ? "<th>" + OLCOMP_ME + ":" + n + "</th><td>"
                      : "<td>" + n + "</td><td>"
                  ))
                : f.push(
                    n == b
                      ? "<th>" + OLCOMP_ME + "</th><td>"
                      : "<td>" + OLCOMP_ANONYM + "</td><td>"
                  );
              f.push(
                kernel.pretty(w) + "</td><td>" + kernel.pretty(z) + "</td><td>"
              );
              for (n = 0; n < r.length; n++)
                4 < r[n].length
                  ? ((r[n][1] = scramble.scrStd("", d[n] || "")[1]),
                    f.push(
                      '<a target="_blank" class="click" href="' +
                        stats.getReviewUrl(r[n]) +
                        '">' +
                        stats.pretty(r[n][0]) +
                        "</a> "
                    ))
                  : f.push(stats.pretty(r[n][0]) + " ");
              f.push("</td>");
              f.push("</tr>");
            }
            f.push("</table>");
            Ra.empty().html(f.join(""));
          }
        }
      ).error(function () {
        logohint.push("Network Error");
      });
    }
  }
  function Ya() {
    if (0 == $a.length || jb || confirm(OLCOMP_ABORT)) {
      w(!1, !0);
      var a =
        exportFunc.getDataId("wcaData", "cstimer_token") ||
        exportFunc.getDataId("locData", "compid") ||
        Ua();
      a &&
        $.post(
          "https://cstimer.net/comp.php",
          { action: "myresult", uid: a },
          function (a) {
            try {
              a = JSON.parse(a);
            } catch (Za) {
              a = {};
            }
            if (0 !== a.retcode) logohint.push("Server Error");
            else {
              a = a.data;
              for (
                var b = [
                    '<table class="table"><tr><th></th><th>Comp.</th><th>ao5</th><th>bo5</th><th>Results</th></tr>',
                  ],
                  c = 0;
                c < a.length;
                c++
              ) {
                var d = JSON.parse(a[c].value);
                if (5 != d.length) return;
                var f = new TimeStat([5], d.length, function (a) {
                  return -1 == d[a][0][0] ? -1 : d[a][0][0] + d[a][0][1];
                });
                f.getAllStats();
                b.push("<tr><td>" + (c + 1) + "</td>");
                b.push("<td>" + a[c].fullname + "|" + a[c].path + "</td>");
                b.push("<td>" + kernel.pretty(f.lastAvg[0][0]) + "</td>");
                b.push("<td>" + kernel.pretty(f.bestTime) + "</td><td>");
                for (f = 0; f < d.length; f++)
                  4 < d[f].length
                    ? ((d[f][1] = scramble.scrStd(
                        "",
                        JSON.parse(a[c].scramble)[f] || ""
                      )[1]),
                      b.push(
                        '<a target="_blank" class="click" href="' +
                          stats.getReviewUrl(d[f]) +
                          '">' +
                          stats.pretty(d[f][0]) +
                          "</a> "
                      ))
                    : b.push(stats.pretty(d[f][0]) + " ");
                b.push("</td>");
                b.push("</tr>");
              }
              b.push("</table>");
              Ra.empty().html(b.join(""));
            }
          }
        ).error(function () {
          logohint.push("Network Error");
        });
    }
  }
  function Ta(b, c) {
    if (gb)
      if ("export" == b) a();
      else {
        c = JSON.parse(JSON.stringify(c));
        var d = c[1];
        c[1] = "";
        c[2] = "";
        if ("timestd" == b)
          for (var f = $a.length; f < ob.length; f++) {
            var h = scramble.scrStd("", ob[f])[1];
            if (h != d) (c[0] = [-1, 1]), $a.push(c);
            else {
              $a.push(c);
              break;
            }
          }
        else if ("timepnt" == b)
          for (f = 0; f < $a.length; f++)
            if (((h = scramble.scrStd("", ob[f])[1]), h == d)) {
              $a[f] = c;
              break;
            }
        T();
      }
  }
  var Wa = $("<div>"),
    oa = $('<span class="click">'),
    Sa = $('<span class="click">'),
    d = $('<input type="button">').val(OLCOMP_UPDATELIST).click(n),
    b = $("<div>"),
    Ra = $(
      '<div class="noScrollBar" style="max-height: 8em; overflow-y: auto;">'
    ),
    r = $('<input type="button">'),
    ab = $('<input type="button">').val(OLCOMP_VIEWRESULT),
    kb = $('<input type="button">').val(OLCOMP_VIEWMYRESULT),
    ib = $('<input type="checkbox">'),
    bb = [],
    lb = [],
    hb = {},
    gb = !1,
    $a = [],
    jb = !1,
    ob = [],
    qb = [];
  $(function () {
    tools.regTool("onlinecomp", OLCOMP_OLCOMP, f);
    kernel.regListener("onlinecomp", "timestd", Ta);
    kernel.regListener("onlinecomp", "timepnt", Ta);
    kernel.regListener("onlinecomp", "export", Ta, /^account$/);
  });
  return {
    getScrambles: function () {
      return 0 == $a.length ? ob.slice() : [];
    },
  };
});
execMain(function () {
  function z() {
    var a = prompt(TOOLS_SYNCSEED_INPUTA);
    kernel.blur();
    null != a &&
      (/^[a-zA-Z0-9]+$/.exec(a) ? Qa(a) : logohint.push("Invalid Value"));
  }
  function Qa(c) {
    h = !0;
    Va = Va || mathlib.getSeed();
    mathlib.setSeed(0, "syncseed" + c);
    scramble.setCacheEnable(!1);
    a.html(c).addClass("click");
    kernel.pushSignal("ctrl", ["scramble", "next"]);
  }
  function n() {
    h &&
      confirm(TOOLS_SYNCSEED_DISABLE) &&
      (h &&
        ((h = !1),
        mathlib.setSeed(0, Va[1] + "" + Va[0]),
        (Va = void 0),
        scramble.setCacheEnable(!0),
        kernel.pushSignal("ctrl", ["scramble", "next"])),
      a.html("N/A").unbind("click").removeClass("click"));
  }
  function Xa() {
    Qa("" + ~~(new Date().getTime() / 1e3 / 30));
    kernel.blur();
  }
  function c() {
    alert(TOOLS_SYNCSEED_HELP);
  }
  function Ua(h) {
    h &&
      h
        .empty()
        .append(
          TOOLS_SYNCSEED_SEED,
          f.unbind("click").click(c),
          ": ",
          a.unbind("click").click(n)
        )
        .append("<br><br>", w.unbind("click").click(z))
        .append("<br>", T.unbind("click").click(Xa));
  }
  var a = $("<span>").html("N/A"),
    f = $('<span class="click">').html("[?]"),
    w = $('<input type="button">').val(TOOLS_SYNCSEED_INPUT),
    T = $('<input type="button">').val(TOOLS_SYNCSEED_30S),
    h = !1,
    Va;
  $(function () {
    tools.regTool("syncseed", TOOLS_SYNCSEED, Ua);
  });
});
var shortcuts = execMain(function () {
  function z(c, z) {
    if (kernel.getProp("useKSC")) {
      var a;
      z.altKey && z.ctrlKey
        ? (a = Xa[z.which])
        : z.altKey
        ? (a = Qa[z.which])
        : z.ctrlKey && (a = n[z.which]);
      void 0 != a &&
        (void 0 == a[1]
          ? kernel.setProp(a[0][0], a[0][1])
          : kernel.pushSignal(a[1], a[0]),
        kernel.clrKey(),
        kernel.blur());
    }
  }
  var Qa = {
      49: [["scrType", "sqrs"]],
      50: [["scrType", "222so"]],
      51: [["scrType", "333"]],
      52: [["scrType", "444wca"]],
      53: [["scrType", "555wca"]],
      54: [["scrType", "666wca"]],
      55: [["scrType", "777wca"]],
      67: [["scrType", "clkwca"]],
      77: [["scrType", "mgmp"]],
      80: [["scrType", "pyrso"]],
      83: [["scrType", "skbso"]],
      73: [["scrType", "input"]],
      37: [["scramble", "last"], "ctrl"],
      39: [["scramble", "next"], "ctrl"],
      38: [["stats", "-"], "ctrl"],
      40: [["stats", "+"], "ctrl"],
      68: [["stats", "clr"], "ctrl"],
      90: [["stats", "undo"], "ctrl"],
    },
    n = {
      49: [["stats", "OK"], "ctrl"],
      50: [["stats", "+2"], "ctrl"],
      51: [["stats", "DNF"], "ctrl"],
    },
    Xa = {
      84: [["input", "t"]],
      73: [["input", "i"]],
      83: [["input", "s"]],
      77: [["input", "m"]],
      86: [["input", "v"]],
      71: [["input", "g"]],
    };
  $(function () {
    kernel.regListener("shortcut", "keydown", z);
    kernel.regProp("tools", "useKSC", 0, PROPERTY_USEKSC, [!0]);
  });
});
var help = execMain(function () {
  function z() {
    $(this).hasClass("enable") || Qa($(this).html());
  }
  function Qa(a) {
    if (void 0 === a) for (a in Ua) break;
    Xa(a) && n(a);
  }
  function n(a, c) {
    f.children().appendTo(kernel.temp);
    for (var h in Ua)
      $("<div />")
        .html(h)
        .addClass(h == a ? "tab enable" : "tab disable")
        .click(z)
        .appendTo(f);
  }
  function Xa(a, c) {
    setTimeout(function () {
      T.scrollTop(T.scrollTop() + Ua[a].position().top - 3);
    }, 0);
    return !0;
  }
  function c() {
    var a = ABOUT_LANG,
      c;
    for (c in Ua)
      50 < Ua[c].position().top ||
        (a = Ua[c].is("h1, h2, h3") ? Ua[c].html() : ABOUT_LANG);
    n(a);
  }
  var Ua = {},
    a = $('<table class="options" />'),
    f = $("<td />"),
    w = $("<td />").addClass("tabValue"),
    T = $('<div class="noScrollBar helptable">');
  a.append($("<tr />").append(f, w.append(T)));
  $(function () {
    for (var f = $("#about").children(), n = 0; n < f.length; n++) {
      var w = f.eq(n),
        z = w.appendTo(T).html();
      w.is("h1, h2, h3") && !f.eq(n + 1).is("h1, h2, h3")
        ? (Ua[z] = w)
        : (Ua[ABOUT_LANG] = Ua[ABOUT_LANG] || w);
    }
    Qa();
    $("#about").html(a);
    T.scrollTop();
    T.unbind("scroll").scroll(c);
  });
});
var stackmat = execMain(function () {
  function z(h) {
    Ua = h;
    a = c.createMediaStreamSource(h);
    f = c.createScriptProcessor(1024, 1, 1);
    f.onaudioprocess = function (a) {
      a = a.inputBuffer.getChannelData(0);
      for (var c = 0; c < a.length; c++) {
        Va = Math.max(1e-4, Va + (a[c] * a[c] - Va) * Ya);
        var f = (1 / Math.sqrt(Va)) * a[c];
        Ta.unshift(f);
        if (
          (Ta.pop() - f) * (Wa ? 1 : -1) > Sa &&
          Math.abs(f - (Wa ? 1 : -1)) - 1 > oa &&
          d > 0.6 * w
        ) {
          for (var h = 0; h < Math.round(d / w); h++) T(Wa);
          Wa ^= 1;
          d = 0;
        } else d > 2 * w && (T(Wa), (d -= w));
        d++;
        10 > ib
          ? (b = Math.max(1e-4, b + (Math.pow(f - (Wa ? 1 : -1), 2) - b) * Ya))
          : 100 < ib && (b = 1);
      }
    };
    a.connect(f);
    f.connect(c.destination);
  }
  function Qa(a) {
    Ra.push(a);
    a != kb ? ((kb = a), (ib = 1)) : ib++;
    bb++;
    if (10 < ib)
      (ab = a),
        (Ra = []),
        0 != r.length && (r = []),
        100 < ib && hb.on
          ? ((hb.on = !1),
            (hb.noise = Math.min(1, b) || 0),
            (hb.power = Va),
            gb(hb))
          : 700 < bb &&
            ((bb = 100),
            (hb.noise = Math.min(1, b) || 0),
            (hb.power = Va),
            gb(hb));
    else if (10 == Ra.length)
      if (Ra[0] == ab || Ra[9] != ab) Ra = Ra.slice(1);
      else {
        a = 0;
        for (var c = 8; 0 < c; c--) a = (a << 1) | (Ra[c] == ab ? 1 : 0);
        r.push(String.fromCharCode(a));
        a: if (((a = r), 9 == a.length || 10 == a.length)) {
          DEBUG && console.log("[stackmat]", a);
          c = /[0-9]/;
          var d = a[0];
          if (/[ SILRCA]/.exec(d)) {
            for (var f = 64, h = 1; h < a.length - 3; h++) {
              if (!c.exec(a[h])) break a;
              f += ~~a[h];
            }
            f == a[a.length - 3].charCodeAt(0) &&
              n(
                d,
                6e4 * ~~a[1] +
                  1e3 * ~~(a[2] + a[3]) +
                  ~~(a[4] + a[5] + (10 == a.length ? a[6] : "0")),
                9 == a.length ? 10 : 1
              );
          }
        }
        Ra = [];
      }
  }
  function n(a, c, d) {
    var f = $.now();
    200 < f - lb && DEBUG && console.log("[stackmat] signal miss ", f - lb);
    lb = f;
    f = {};
    f.time_milli = c;
    f.unit = d;
    f.on = !0;
    kernel.getProp("stkHead") || (a = "S");
    c =
      d == hb.unit
        ? f.time_milli > hb.time_milli
        : Math.floor(f.time_milli / 10) > Math.floor(hb.time_milli / 10);
    f.greenLight = "A" == a;
    f.leftHand = "L" == a || "A" == a || "C" == a;
    f.rightHand = "R" == a || "A" == a || "C" == a;
    f.running = ("S" != a || "S" == hb.signalHeader) && (" " == a || c);
    f.signalHeader = a;
    f.unknownRunning = !hb.on;
    f.noise = Math.min(1, b) || 0;
    f.power = Va;
    hb = f;
    bb = 0;
    gb(hb);
  }
  function Xa(a) {
    if (kb != ab && 1 == ib && (Ra.push(a), 24 == Ra.length)) {
      for (var c = 0, d = 5; 0 <= d; d--) {
        c *= 10;
        for (var f = 0; 4 > f; f++) c += Ra[4 * d + f] << f;
      }
      Ra = [];
      n("S", c, 1);
    }
    a != kb ? ((kb = a), (ib = 1)) : ib++;
    10 < ib &&
      ((ab = a),
      (Ra = []),
      (r = []),
      1e3 < ib && hb.on
        ? ((hb.on = !1),
          (hb.noise = Math.min(1, b) || 0),
          (hb.power = Va),
          gb(hb))
        : 4e3 < ib &&
          ((ib = 1e3),
          (hb.noise = Math.min(1, b) || 0),
          (hb.power = Va),
          gb(hb)));
  }
  var c,
    Ua,
    a,
    f,
    w,
    T,
    h,
    Va = 1,
    Ya = 1e-4,
    Ta = [],
    Wa = 0,
    oa = 0.2,
    Sa = 0.7,
    d = 0,
    b = 0,
    Ra = [],
    r = [],
    ab = 0,
    kb = 0,
    ib = 0,
    bb = 0,
    lb = 0,
    hb = {
      time_milli: 0,
      unit: 10,
      on: !1,
      greenLight: !1,
      leftHand: !1,
      rightHand: !1,
      running: !1,
      unknownRunning: !0,
      signalHeader: "I",
      noise: 1,
      power: 1,
    },
    gb = $.noop;
  return {
    init: function (a, b, d) {
      h = a;
      void 0 === navigator.mediaDevices && (navigator.mediaDevices = {});
      void 0 === navigator.mediaDevices.getUserMedia &&
        (navigator.mediaDevices.getUserMedia = function (a) {
          var b =
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;
          return b
            ? new Promise(function (c, d) {
                b.call(navigator, a, c, d);
              })
            : Promise.reject(
                Error("getUserMedia is not implemented in this browser")
              );
        });
      c = new (window.AudioContext || window.webkitAudioContext)();
      "m" == h
        ? ((w = c.sampleRate / 8e3), (T = Xa))
        : ((w = c.sampleRate / 1200), (T = Qa));
      Ya = 0.001 / w;
      Ta.length = Math.ceil(w / 6);
      Ra = [];
      r = [];
      a = { echoCancellation: !1, noiseSuppression: !1 };
      b && (a.deviceId = { exact: b });
      return void 0 == Ua
        ? navigator.mediaDevices.getUserMedia({ audio: a }).then(function (a) {
            if ("suspended" == c.state && !d) return Promise.reject();
            z(a);
          }, console.log)
        : Promise.resolve();
    },
    stop: function () {
      void 0 != Ua &&
        (a.disconnect(f),
        f.disconnect(c.destination),
        Ua.stop && Ua.stop(),
        (Ua = void 0));
    },
    updateInputDevices: function () {
      var a = [],
        b = new Promise(function (b, c) {
          b(a);
        });
      return navigator.mediaDevices && navigator.mediaDevices.enumerateDevices
        ? navigator.mediaDevices.enumerateDevices().then(function (c) {
            for (var d = 0; d < c.length; d++) {
              var f = c[d];
              "audioinput" === f.kind &&
                a.push([f.deviceId, f.label || "microphone " + (a.length + 1)]);
            }
            return b;
          })
        : b;
    },
    setCallBack: function (a) {
      gb = a;
    },
  };
});
execMain(function () {
  window.nativeStackmat &&
    (stackmat = (function () {
      DEBUG && console.log("Use Native Stackmat");
      var z = "stackmat_callback_" + ~~(1e7 * Math.random()),
        Qa;
      nativeStackmat.setCallback(z);
      window[z] = function (n) {
        DEBUG && console.log(JSON.stringify(n));
        Qa && Qa(n);
      };
      return {
        init: function () {
          nativeStackmat.init();
          return Promise.resolve();
        },
        stop: function () {
          nativeStackmat.stop();
          return Promise.resolve();
        },
        updateInputDevices: function () {
          return new Promise(function (n, z) {
            n([[void 0, "native"]]);
          });
        },
        setCallBack: function (n) {
          Qa = n;
        },
      };
    })());
});
var stackmatutil = execMain(function (z) {
  function Qa(a) {
    a
      ? ((Ua = !0), a.empty().append(Xa, "<br>", "Device:&nbsp;&nbsp;", c))
      : (Ua = !1);
  }
  function n() {
    stackmat.updateInputDevices().then(function (a) {
      c.empty();
      for (var f = 0; f < a.length; f++)
        c.append($("<option>").val(a[f][0]).text(a[f][1]));
      c.unbind("change").change(function () {
        stackmat.stop();
        console.log("select device ", c.val());
        stackmat.init(void 0, c.val(), !0);
        kernel.blur();
      });
    });
  }
  var Xa = $("<span>").html("status:  unknown"),
    c = $('<select style="font-size: 1rem;">'),
    Ua = !1;
  $(function () {
    tools.regTool("stackmatutil", "stackmat", Qa);
    kernel.regProp("timer", "stkHead", 0, PROPERTY_STKHEAD, [!0]);
    n();
  });
  return {
    init: function (a, c) {
      return stackmat.init(a, void 0, c).then(n);
    },
    stop: stackmat.stop,
    setCallBack: function (a) {
      stackmat.setCallBack(function (c) {
        if (Ua) {
          var f = "status:  " + (c.on ? "on" : "off") + "<br>";
          f += "noise:   " + ~~(100 * c.noise) + "%<br>";
          f += "power:   " + ~~(100 * Math.log10(c.power)) / 10 + "dB<br>";
          f += "header:  " + c.signalHeader + "<br>";
          f +=
            "pad:     " +
            (c.leftHand ? "L" : " ") +
            (c.rightHand ? "R" : " ") +
            "<br>";
          f += "running: " + (c.running ? "yes" : "no");
          Xa.html(f.replace(/ /g, "&nbsp;"));
        }
        a && a(c);
      });
    },
  };
});
var GiikerCube = execMain(function () {
  var z = void 0,
    Qa = null,
    n = (function () {
      function a(a) {
        c(a.target.value);
      }
      function c(a) {
        for (var c = $.now(), f = [], n = 0; 20 > n; n++) f.push(a.getUint8(n));
        if (167 == f[18]) {
          a = [
            176, 81, 104, 224, 86, 137, 237, 119, 38, 26, 193, 161, 210, 126,
            150, 81, 93, 13, 236, 249, 89, 235, 88, 24, 113, 81, 214, 131, 130,
            199, 2, 169, 39, 165, 171, 41,
          ];
          var d = (f[19] >> 4) & 15,
            b = f[19] & 15;
          for (n = 0; 18 > n; n++) f[n] += a[n + d] + a[n + b];
          f = f.slice(0, 18);
        }
        a = [];
        for (n = 0; n < f.length; n++)
          a.push((f[n] >> 4) & 15), a.push(f[n] & 15);
        n = [];
        for (f = 0; 3 > f; f++)
          for (d = 8; 0 != d; d >>= 1) n.push(a[f + 28] & d ? 1 : 0);
        d = new mathlib.CubieCube();
        b = [-1, 1, -1, 1, 1, -1, 1, -1];
        for (f = 0; 8 > f; f++)
          d.ca[f] = (a[f] - 1) | ((3 + a[f + 8] * b[f]) % 3 << 3);
        for (f = 0; 12 > f; f++) d.ea[f] = ((a[f + 16] - 1) << 1) | n[f];
        n = d.toFaceCube(Qa, Xa);
        b = a.slice(32, 40);
        d = [];
        for (f = 0; f < b.length; f += 2)
          d.push("BDLURF".charAt(b[f] - 1) + " 2'".charAt((b[f + 1] - 1) % 7));
        if (DEBUG) {
          b = [];
          for (f = 0; 40 > f; f++) b.push("0123456789abcdef".charAt(a[f]));
          console.log("[giiker]", "Raw Data: ", a.join(""));
          console.log("[giiker]", "Current State: ", n);
          console.log(
            "[giiker]",
            "A Valid Generator: ",
            scramble_333.genFacelet(n)
          );
          console.log("[giiker]", "Previous Moves: ", d.reverse().join(" "));
          d.reverse();
        }
        Ua(n, d, c, h);
        return [n, d];
      }
      var n = null,
        z = null,
        h,
        Qa = [
          [26, 15, 29],
          [20, 8, 9],
          [18, 38, 6],
          [24, 27, 44],
          [51, 35, 17],
          [45, 11, 2],
          [47, 0, 36],
          [53, 42, 33],
        ],
        Xa = [
          [25, 28],
          [23, 12],
          [19, 7],
          [21, 41],
          [32, 16],
          [5, 10],
          [3, 37],
          [30, 43],
          [52, 34],
          [48, 14],
          [46, 1],
          [50, 39],
        ];
      return {
        init: function (f) {
          h = f.name.startsWith("Gi") ? "Giiker" : "Mi Smart";
          return f.gatt
            .connect()
            .then(function (a) {
              n = a;
              return a.getPrimaryService(
                "0000aadb-0000-1000-8000-00805f9b34fb"
              );
            })
            .then(function (a) {
              return a.getCharacteristic(
                "0000aadc-0000-1000-8000-00805f9b34fb"
              );
            })
            .then(function (a) {
              z = a;
              return z.startNotifications();
            })
            .then(function () {
              return z.readValue();
            })
            .then(function (f) {
              c(f)[0] != kernel.getProp("giiSolved", mathlib.SOLVED_FACELET) &&
                ((f = kernel.getProp("giiRST")),
                ("a" == f || ("p" == f && confirm(CONFIRM_GIIRST))) &&
                  giikerutil.markSolved());
              return z.addEventListener("characteristicvaluechanged", a);
            });
        },
        opservs: [
          "0000aadb-0000-1000-8000-00805f9b34fb",
          "0000aaaa-0000-1000-8000-00805f9b34fb",
        ],
        getBatteryLevel: function () {
          var a,
            c,
            f,
            w = function (a) {
              f([a.target.value.getUint8(1), h]);
              c.removeEventListener("characteristicvaluechanged", w);
              c.stopNotifications();
            };
          return n
            .getPrimaryService("0000aaaa-0000-1000-8000-00805f9b34fb")
            .then(function (c) {
              a = c;
              return c.getCharacteristic(
                "0000aaab-0000-1000-8000-00805f9b34fb"
              );
            })
            .then(function (a) {
              c = a;
              return c.startNotifications();
            })
            .then(function () {
              return c.addEventListener("characteristicvaluechanged", w);
            })
            .then(function () {
              return a.getCharacteristic(
                "0000aaac-0000-1000-8000-00805f9b34fb"
              );
            })
            .then(function (a) {
              a.writeValue(new Uint8Array([181]).buffer);
              return new Promise(function (a) {
                f = a;
              });
            });
        },
      };
    })(),
    Xa = (function () {
      function a(a) {
        for (var b = [], c = 0; c < a.byteLength; c++) b[c] = a.getUint8(c);
        if (null == d) return b;
        16 < b.length &&
          (b = b
            .slice(0, b.length - 16)
            .concat(d.decrypt(b.slice(b.length - 16))));
        d.decrypt(b);
        return b;
      }
      function c(a) {
        return a
          .getPrimaryService("0000180a-0000-1000-8000-00805f9b34fb")
          .then(function (a) {
            Xa = a;
            return a.getCharacteristic("00002a28-0000-1000-8000-00805f9b34fb");
          })
          .then(function (a) {
            return a.readValue();
          })
          .then(function (a) {
            var c =
              (a.getUint8(0) << 16) | (a.getUint8(1) << 8) | a.getUint8(2);
            DEBUG && console.log("[gancube] version", JSON.stringify(c));
            d = null;
            if (65543 < c && 65536 == (c & 16776704))
              return Xa.getCharacteristic(
                "00002a23-0000-1000-8000-00805f9b34fb"
              )
                .then(function (a) {
                  return a.readValue();
                })
                .then(function (a) {
                  var f = b[(c >> 8) & 255];
                  if (f) {
                    f = JSON.parse(
                      LZString.decompressFromEncodedURIComponent(f)
                    );
                    for (var h = 0; 6 > h; h++)
                      f[h] = (f[h] + a.getUint8(5 - h)) & 255;
                    a = f;
                  } else a = void 0;
                  a
                    ? (DEBUG && console.log("[gancube] key", JSON.stringify(a)),
                      (d = new $a(a)))
                    : logohint.push("Not support your Gan cube");
                });
            logohint.push("Not support your Gan cube");
          });
      }
      function n() {
        return 50 > gb
          ? new Promise(function (a) {
              a(!1);
            })
          : Ta.readValue().then(function (b) {
              b = a(b);
              for (var c = [], d = 0; d < b.length - 2; d += 3)
                for (
                  var f =
                      (b[d ^ 1] << 16) | (b[(d + 1) ^ 1] << 8) | b[(d + 2) ^ 1],
                    h = 21;
                  0 <= h;
                  h -= 3
                )
                  c.push("URFDLB".charAt((f >> h) & 7)),
                    12 == h && c.push("URFDLB".charAt(d / 3));
              kb = c.join("");
              gb = 0;
              return new Promise(function (a) {
                a(!0);
              });
            });
      }
      function z() {
        if (Qa)
          return Wa.readValue()
            .then(function (b) {
              b = a(b);
              ib = $.now();
              lb = b[12];
              if (lb != hb) {
                Ra = [];
                for (var c = 0; 6 > c; c++) {
                  var d = b[13 + c];
                  Ra.unshift("URFDLB".charAt(~~(d / 3)) + " 2'".charAt(d % 3));
                }
                var f;
                return oa
                  .readValue()
                  .then(function (b) {
                    f = b = a(b);
                    return n();
                  })
                  .then(function (a) {
                    if (a && -1 == hb)
                      Ua(kb, Ra, ib, "Gan 356i"),
                        r.fromFacelet(kb),
                        (hb = lb),
                        kb !=
                          kernel.getProp("giiSolved", mathlib.SOLVED_FACELET) &&
                          ((a = kernel.getProp("giiRST")),
                          ("a" == a || ("p" == a && confirm(CONFIRM_GIIRST))) &&
                            giikerutil.markSolved());
                    else {
                      for (var b = [], c = 0; 9 > c; c++)
                        b.unshift(
                          ~~((f[2 * c + 1] | (f[2 * c + 2] << 8)) / 0.95)
                        );
                      var d = (lb - hb) & 255;
                      hb = lb;
                      gb += d;
                      6 < d && ((gb = 50), (d = 6));
                      var h = bb;
                      for (c = d - 1; 0 <= c; c--) h += b[c];
                      2e3 < Math.abs(h - ib) &&
                        (console.log(
                          "[gancube]",
                          "time adjust",
                          ib - h,
                          "@",
                          ib
                        ),
                        (bb += ib - h));
                      for (c = d - 1; 0 <= c; c--)
                        (d =
                          3 * "URFDLB".indexOf(Ra[c][0]) +
                          " 2'".indexOf(Ra[c][1])),
                          mathlib.CubieCube.EdgeMult(
                            r,
                            mathlib.CubieCube.moveCube[d],
                            ab
                          ),
                          mathlib.CubieCube.CornMult(
                            r,
                            mathlib.CubieCube.moveCube[d],
                            ab
                          ),
                          (bb += b[c]),
                          Ua(ab.toFaceCube(), Ra.slice(c), bb, "Gan 356i"),
                          (d = ab),
                          (ab = r),
                          (r = d);
                      a &&
                        r.toFaceCube() != kb &&
                        (console.log("[gancube]", "Cube state check error"),
                        console.log("[gancube]", "calc", r.toFaceCube()),
                        console.log("[gancube]", "read", kb),
                        r.fromFacelet(kb));
                    }
                  });
              }
            })
            .then(z);
      }
      var h,
        Va,
        Xa,
        Ta,
        Wa,
        oa,
        Sa,
        d = null,
        b = [
          "NoRgnAHANATADDWJYwMxQOxiiEcfYgSK6Hpr4TYCs0IG1OEAbDszALpA",
          "NoNg7ANATFIQnARmogLBRUCs0oAYN8U5J45EQBmFADg0oJAOSlUQF0g",
        ],
        Ra,
        r = new mathlib.CubieCube(),
        ab = new mathlib.CubieCube(),
        kb,
        ib,
        bb = 0,
        lb = -1,
        hb = -1,
        gb = 1e3,
        $a = (function () {
          function a(a, b) {
            for (var c = a.slice(), h = 0; 16 > h; h++)
              a[h] = d[c[f[h]]] ^ b[h];
          }
          function b(a) {
            if (0 == h.length) {
              for (var b = 0; 256 > b; b++) d[c[b]] = b;
              for (b = 0; 128 > b; b++)
                (h[b] = b << 1), (h[128 + b] = (b << 1) ^ 27);
            }
            a = a.slice();
            b = 1;
            for (var f = 16; 176 > f; f += 4) {
              var n = a.slice(f - 4, f);
              0 == f % 16 &&
                ((n = [c[n[1]] ^ b, c[n[2]], c[n[3]], c[n[0]]]), (b = h[b]));
              for (var r = 0; 4 > r; r++) a[f + r] = a[f + r - 16] ^ n[r];
            }
            this.key = a;
          }
          var c = [
              99, 124, 119, 123, 242, 107, 111, 197, 48, 1, 103, 43, 254, 215,
              171, 118, 202, 130, 201, 125, 250, 89, 71, 240, 173, 212, 162,
              175, 156, 164, 114, 192, 183, 253, 147, 38, 54, 63, 247, 204, 52,
              165, 229, 241, 113, 216, 49, 21, 4, 199, 35, 195, 24, 150, 5, 154,
              7, 18, 128, 226, 235, 39, 178, 117, 9, 131, 44, 26, 27, 110, 90,
              160, 82, 59, 214, 179, 41, 227, 47, 132, 83, 209, 0, 237, 32, 252,
              177, 91, 106, 203, 190, 57, 74, 76, 88, 207, 208, 239, 170, 251,
              67, 77, 51, 133, 69, 249, 2, 127, 80, 60, 159, 168, 81, 163, 64,
              143, 146, 157, 56, 245, 188, 182, 218, 33, 16, 255, 243, 210, 205,
              12, 19, 236, 95, 151, 68, 23, 196, 167, 126, 61, 100, 93, 25, 115,
              96, 129, 79, 220, 34, 42, 144, 136, 70, 238, 184, 20, 222, 94, 11,
              219, 224, 50, 58, 10, 73, 6, 36, 92, 194, 211, 172, 98, 145, 149,
              228, 121, 231, 200, 55, 109, 141, 213, 78, 169, 108, 86, 244, 234,
              101, 122, 174, 8, 186, 120, 37, 46, 28, 166, 180, 198, 232, 221,
              116, 31, 75, 189, 139, 138, 112, 62, 181, 102, 72, 3, 246, 14, 97,
              53, 87, 185, 134, 193, 29, 158, 225, 248, 152, 17, 105, 217, 142,
              148, 155, 30, 135, 233, 206, 85, 40, 223, 140, 161, 137, 13, 191,
              230, 66, 104, 65, 153, 45, 15, 176, 84, 187, 22,
            ],
            d = [],
            f = [0, 13, 10, 7, 4, 1, 14, 11, 8, 5, 2, 15, 12, 9, 6, 3],
            h = [];
          b.prototype.decrypt = function (b) {
            for (var c = this.key.slice(160, 176), d = 0; 16 > d; d++)
              b[d] ^= c[d];
            for (c = 144; 16 <= c; c -= 16) {
              a(b, this.key.slice(c, c + 16));
              d = b;
              for (var f = 0; 16 > f; f += 4) {
                var n = d[f + 0],
                  r = d[f + 1],
                  w = d[f + 2],
                  z = d[f + 3],
                  T = n ^ r ^ w ^ z,
                  oa = h[T],
                  Qa = h[h[oa ^ n ^ w]] ^ T;
                T ^= h[h[oa ^ r ^ z]];
                d[f + 0] = d[f + 0] ^ Qa ^ h[n ^ r];
                d[f + 1] = d[f + 1] ^ T ^ h[r ^ w];
                d[f + 2] = d[f + 2] ^ Qa ^ h[w ^ z];
                d[f + 3] = d[f + 3] ^ T ^ h[z ^ n];
              }
            }
            a(b, this.key.slice(0, 16));
            return b;
          };
          return b;
        })();
      return {
        init: function (a) {
          return a.gatt
            .connect()
            .then(function (a) {
              h = a;
              return c(a);
            })
            .then(function () {
              return h.getPrimaryService(
                "0000fff0-0000-1000-8000-00805f9b34fb"
              );
            })
            .then(function (a) {
              Va = a;
              return Va.getCharacteristic(
                "0000fff2-0000-1000-8000-00805f9b34fb"
              );
            })
            .then(function (a) {
              Ta = a;
              return Va.getCharacteristic(
                "0000fff5-0000-1000-8000-00805f9b34fb"
              );
            })
            .then(function (a) {
              Wa = a;
              return Va.getCharacteristic(
                "0000fff6-0000-1000-8000-00805f9b34fb"
              );
            })
            .then(function (a) {
              oa = a;
              return Va.getCharacteristic(
                "0000fff7-0000-1000-8000-00805f9b34fb"
              );
            })
            .then(function (a) {
              Sa = a;
            })
            .then(z);
        },
        opservs: [
          "0000fff0-0000-1000-8000-00805f9b34fb",
          "0000180a-0000-1000-8000-00805f9b34fb",
        ],
        getBatteryLevel: function () {
          return Sa.readValue().then(function (b) {
            b = a(b);
            return new Promise(function (a) {
              a([b[7], "Gan 356i"]);
            });
          });
        },
      };
    })(),
    c = (function () {
      function a(a) {
        a = a.target.value;
        var f = $.now();
        if (
          !(4 > a.byteLength) &&
          42 == a.getUint8(0) &&
          13 == a.getUint8(a.byteLength - 2) &&
          10 == a.getUint8(a.byteLength - 1)
        ) {
          var n = a.getUint8(2),
            r = a.byteLength - 6;
          if (1 == n)
            for (n = 0; n < r; n += 2) {
              var w = Qa[a.getUint8(3 + n) >> 1],
                z = [0, 2][a.getUint8(3 + n) & 1],
                T = 3 * w + z;
              console.log("move", "URFDLB".charAt(w) + " 2'".charAt(z));
              mathlib.CubieCube.EdgeMult(Ra, mathlib.CubieCube.moveCube[T], b);
              mathlib.CubieCube.CornMult(Ra, mathlib.CubieCube.moveCube[T], b);
              d = b.toFaceCube();
              Ua(d, ["URFDLB".charAt(w) + " 2'".charAt(z)], f, "GoCube");
              w = b;
              b = Ra;
              Ra = w;
              20 < ++Sa &&
                ((Sa = 0), h.writeValue(new Uint8Array([51]).buffer));
            }
          else if (2 == n) {
            f = [];
            for (r = 0; 6 > r; r++)
              for (
                w = 9 * Qa[r],
                  z = Ta[r],
                  f[w + 4] = "BFUDRL".charAt(a.getUint8(3 + 9 * r)),
                  n = 0;
                8 > n;
                n++
              )
                f[w + Xa[(n + z) % 8]] = "BFUDRL".charAt(
                  a.getUint8(3 + 9 * r + n + 1)
                );
            a = f.join("");
            a != d && (console.log("facelet", a), b.fromFacelet(a));
          } else if (3 != n)
            if (5 == n)
              for (
                console.log("battery level", c(a)), Wa = a.getUint8(3);
                0 != oa.length;

              )
                oa.shift()(Wa);
            else
              7 == n
                ? console.log("offline stats", c(a))
                : 8 == n && console.log("cube type", c(a));
        }
      }
      function c(a) {
        for (var b = [], c = 0; c < a.byteLength; c++)
          b.push((a.getUint8(c) >> 4) & 15), b.push(a.getUint8(c) & 15);
        return b;
      }
      var n,
        z,
        h,
        Qa = [5, 2, 0, 3, 1, 4],
        Xa = [0, 1, 2, 5, 8, 7, 6, 3],
        Ta = [0, 0, 6, 2, 0, 0],
        Wa = -1,
        oa = [],
        Sa = 100,
        d = mathlib.SOLVED_FACELET,
        b = new mathlib.CubieCube(),
        Ra = new mathlib.CubieCube();
      return {
        init: function (b) {
          return b.gatt
            .connect()
            .then(function (a) {
              return a.getPrimaryService(
                "6e400001-b5a3-f393-e0a9-e50e24dcca9e"
              );
            })
            .then(function (a) {
              n = a;
              return n.getCharacteristic(
                "6e400002-b5a3-f393-e0a9-e50e24dcca9e"
              );
            })
            .then(function (a) {
              h = a;
              return n.getCharacteristic(
                "6e400003-b5a3-f393-e0a9-e50e24dcca9e"
              );
            })
            .then(function (a) {
              z = a;
              return z.startNotifications();
            })
            .then(function () {
              return z.addEventListener("characteristicvaluechanged", a);
            })
            .then(function () {
              return h.writeValue(new Uint8Array([51]).buffer);
            });
        },
        opservs: ["6e400001-b5a3-f393-e0a9-e50e24dcca9e"],
        getBatteryLevel: function () {
          h.writeValue(new Uint8Array([50]).buffer);
          return new Promise(function (a) {
            oa.push(a);
          });
        },
      };
    })(),
    Ua = $.noop;
  return {
    init: function (a) {
      return window.navigator && window.navigator.bluetooth
        ? window.navigator.bluetooth
            .requestDevice({
              filters: [
                { namePrefix: "Gi" },
                { namePrefix: "Mi Smart Magic Cube" },
                { namePrefix: "GAN" },
                { namePrefix: "GoCube" },
                { services: ["0000fe95-0000-1000-8000-00805f9b34fb"] },
                { services: [n.opservs[0]] },
              ],
              optionalServices: [].concat(n.opservs, Xa.opservs, c.opservs),
            })
            .then(function (a) {
              console.log(a);
              Qa = a;
              return a.name.startsWith("Gi") ||
                a.name.startsWith("Mi Smart Magic Cube")
                ? ((z = n), n.init(a))
                : a.name.startsWith("GAN")
                ? ((z = Xa), Xa.init(a))
                : a.name.startsWith("GoCube")
                ? ((z = c), c.init(a))
                : Promise.resolve();
            })
        : (alert(
            "Bluetooth API is not available. Ensure https access, and try chrome with chrome://flags/#enable-experimental-web-platform-features enabled"
          ),
          Promise.resolve());
    },
    stop: function () {
      Qa && (Qa.gatt.disconnect(), (Qa = null));
    },
    isConnected: function () {
      return null != Qa;
    },
    setCallBack: function (a) {
      Ua = a;
    },
    getCube: function () {
      return z;
    },
  };
});
var csTimerWorker = execBoth(
  function () {
    if (!window.Worker) return {};
    var z = new Worker("js/cstimer.js"),
      Qa = {},
      n = 0;
    z.onmessage = function (n) {
      n = n.data;
      var c = Qa[n[0]];
      delete Qa[n[0]];
      c && c(n[2]);
    };
    z.postMessage([0, "set", ["SCRAMBLE_NOOBST", SCRAMBLE_NOOBST]]);
    z.postMessage([0, "set", ["SCRAMBLE_NOOBSS", SCRAMBLE_NOOBSS]]);
    return {
      getScramble: function (Xa, c) {
        ++n;
        Qa[n] = c;
        z.postMessage([n, "scramble", Xa]);
        return n;
      },
    };
  },
  function () {
    self.onmessage = function (z) {
      var Qa = z.data;
      z = Qa[0];
      var n = Qa[1];
      Qa = Qa[2];
      var Xa = void 0;
      switch (n) {
        case "scramble":
          Xa = scrMgr.scramblers[Qa[0]];
          Xa = Xa.apply(Xa, Qa);
          break;
        case "set":
          self[Qa[0]] = Qa[1];
      }
      postMessage([z, n, Xa]);
    };
  }
);

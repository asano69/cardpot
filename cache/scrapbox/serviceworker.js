"use strict";
(() => {
  var To = Object.create;
  var hr = Object.defineProperty;
  var Io = Object.getOwnPropertyDescriptor;
  var Ao = Object.getOwnPropertyNames;
  var Oo = Object.getPrototypeOf,
    xo = Object.prototype.hasOwnProperty;
  var n = (e, t) => hr(e, "name", { value: t, configurable: !0 });
  var ui = (e, t) => () => {
    try {
      return (t || e((t = { exports: {} }).exports, t), t.exports);
    } catch (r) {
      throw ((t = 0), r);
    }
  };
  var Ro = (e, t, r, i) => {
    if ((t && typeof t == "object") || typeof t == "function")
      for (let s of Ao(t))
        !xo.call(e, s) &&
          s !== r &&
          hr(e, s, {
            get: () => t[s],
            enumerable: !(i = Io(t, s)) || i.enumerable,
          });
    return e;
  };
  var di = (e, t, r) => (
    (r = e != null ? To(Oo(e)) : {}),
    Ro(
      t || !e || !e.__esModule
        ? hr(r, "default", { value: e, enumerable: !0 })
        : r,
      e,
    )
  );
  var Ma = ui((Ot, Wn) => {
    (function (e, t) {
      typeof Ot == "object" && typeof Wn == "object"
        ? (Wn.exports = t())
        : typeof define == "function" && define.amd
          ? define([], t)
          : typeof Ot == "object"
            ? (Ot.bowser = t())
            : (e.bowser = t());
    })(Ot, function () {
      return (function (e) {
        var t = {};
        function r(i) {
          if (t[i]) return t[i].exports;
          var s = (t[i] = { i, l: !1, exports: {} });
          return (e[i].call(s.exports, s, s.exports, r), (s.l = !0), s.exports);
        }
        return (
          n(r, "r"),
          (r.m = e),
          (r.c = t),
          (r.d = function (i, s, a) {
            r.o(i, s) ||
              Object.defineProperty(i, s, { enumerable: !0, get: a });
          }),
          (r.r = function (i) {
            (typeof Symbol < "u" &&
              Symbol.toStringTag &&
              Object.defineProperty(i, Symbol.toStringTag, { value: "Module" }),
              Object.defineProperty(i, "__esModule", { value: !0 }));
          }),
          (r.t = function (i, s) {
            if (
              (1 & s && (i = r(i)),
              8 & s || (4 & s && typeof i == "object" && i && i.__esModule))
            )
              return i;
            var a = Object.create(null);
            if (
              (r.r(a),
              Object.defineProperty(a, "default", { enumerable: !0, value: i }),
              2 & s && typeof i != "string")
            )
              for (var c in i)
                r.d(
                  a,
                  c,
                  function (o) {
                    return i[o];
                  }.bind(null, c),
                );
            return a;
          }),
          (r.n = function (i) {
            var s =
              i && i.__esModule
                ? function () {
                    return i.default;
                  }
                : function () {
                    return i;
                  };
            return (r.d(s, "a", s), s);
          }),
          (r.o = function (i, s) {
            return Object.prototype.hasOwnProperty.call(i, s);
          }),
          (r.p = ""),
          r((r.s = 90))
        );
      })({
        17: function (e, t, r) {
          "use strict";
          ((t.__esModule = !0), (t.default = void 0));
          var i = r(18),
            s = (function () {
              function a() {}
              return (
                n(a, "e"),
                (a.getFirstMatch = function (c, o) {
                  var p = o.match(c);
                  return (p && p.length > 0 && p[1]) || "";
                }),
                (a.getSecondMatch = function (c, o) {
                  var p = o.match(c);
                  return (p && p.length > 1 && p[2]) || "";
                }),
                (a.matchAndReturnConst = function (c, o, p) {
                  if (c.test(o)) return p;
                }),
                (a.getWindowsVersionName = function (c) {
                  switch (c) {
                    case "NT":
                      return "NT";
                    case "XP":
                      return "XP";
                    case "NT 5.0":
                      return "2000";
                    case "NT 5.1":
                      return "XP";
                    case "NT 5.2":
                      return "2003";
                    case "NT 6.0":
                      return "Vista";
                    case "NT 6.1":
                      return "7";
                    case "NT 6.2":
                      return "8";
                    case "NT 6.3":
                      return "8.1";
                    case "NT 10.0":
                      return "10";
                    default:
                      return;
                  }
                }),
                (a.getMacOSVersionName = function (c) {
                  var o = c
                    .split(".")
                    .splice(0, 2)
                    .map(function (g) {
                      return parseInt(g, 10) || 0;
                    });
                  o.push(0);
                  var p = o[0],
                    l = o[1];
                  if (p === 10)
                    switch (l) {
                      case 5:
                        return "Leopard";
                      case 6:
                        return "Snow Leopard";
                      case 7:
                        return "Lion";
                      case 8:
                        return "Mountain Lion";
                      case 9:
                        return "Mavericks";
                      case 10:
                        return "Yosemite";
                      case 11:
                        return "El Capitan";
                      case 12:
                        return "Sierra";
                      case 13:
                        return "High Sierra";
                      case 14:
                        return "Mojave";
                      case 15:
                        return "Catalina";
                      default:
                        return;
                    }
                  switch (p) {
                    case 11:
                      return "Big Sur";
                    case 12:
                      return "Monterey";
                    case 13:
                      return "Ventura";
                    case 14:
                      return "Sonoma";
                    case 15:
                      return "Sequoia";
                    default:
                      return;
                  }
                }),
                (a.getAndroidVersionName = function (c) {
                  var o = c
                    .split(".")
                    .splice(0, 2)
                    .map(function (p) {
                      return parseInt(p, 10) || 0;
                    });
                  if ((o.push(0), !(o[0] === 1 && o[1] < 5)))
                    return o[0] === 1 && o[1] < 6
                      ? "Cupcake"
                      : o[0] === 1 && o[1] >= 6
                        ? "Donut"
                        : o[0] === 2 && o[1] < 2
                          ? "Eclair"
                          : o[0] === 2 && o[1] === 2
                            ? "Froyo"
                            : o[0] === 2 && o[1] > 2
                              ? "Gingerbread"
                              : o[0] === 3
                                ? "Honeycomb"
                                : o[0] === 4 && o[1] < 1
                                  ? "Ice Cream Sandwich"
                                  : o[0] === 4 && o[1] < 4
                                    ? "Jelly Bean"
                                    : o[0] === 4 && o[1] >= 4
                                      ? "KitKat"
                                      : o[0] === 5
                                        ? "Lollipop"
                                        : o[0] === 6
                                          ? "Marshmallow"
                                          : o[0] === 7
                                            ? "Nougat"
                                            : o[0] === 8
                                              ? "Oreo"
                                              : o[0] === 9
                                                ? "Pie"
                                                : void 0;
                }),
                (a.getVersionPrecision = function (c) {
                  return c.split(".").length;
                }),
                (a.compareVersions = function (c, o, p) {
                  p === void 0 && (p = !1);
                  var l = a.getVersionPrecision(c),
                    g = a.getVersionPrecision(o),
                    u = Math.max(l, g),
                    m = 0,
                    d = a.map([c, o], function (b) {
                      var h = u - a.getVersionPrecision(b),
                        I = b + new Array(h + 1).join(".0");
                      return a
                        .map(I.split("."), function (x) {
                          return new Array(20 - x.length).join("0") + x;
                        })
                        .reverse();
                    });
                  for (p && (m = u - Math.min(l, g)), u -= 1; u >= m; ) {
                    if (d[0][u] > d[1][u]) return 1;
                    if (d[0][u] === d[1][u]) {
                      if (u === m) return 0;
                      u -= 1;
                    } else if (d[0][u] < d[1][u]) return -1;
                  }
                }),
                (a.map = function (c, o) {
                  var p,
                    l = [];
                  if (Array.prototype.map)
                    return Array.prototype.map.call(c, o);
                  for (p = 0; p < c.length; p += 1) l.push(o(c[p]));
                  return l;
                }),
                (a.find = function (c, o) {
                  var p, l;
                  if (Array.prototype.find)
                    return Array.prototype.find.call(c, o);
                  for (p = 0, l = c.length; p < l; p += 1) {
                    var g = c[p];
                    if (o(g, p)) return g;
                  }
                }),
                (a.assign = function (c) {
                  for (
                    var o,
                      p,
                      l = c,
                      g = arguments.length,
                      u = new Array(g > 1 ? g - 1 : 0),
                      m = 1;
                    m < g;
                    m++
                  )
                    u[m - 1] = arguments[m];
                  if (Object.assign)
                    return Object.assign.apply(Object, [c].concat(u));
                  var d = n(function () {
                    var b = u[o];
                    typeof b == "object" &&
                      b !== null &&
                      Object.keys(b).forEach(function (h) {
                        l[h] = b[h];
                      });
                  }, "s");
                  for (o = 0, p = u.length; o < p; o += 1) d();
                  return c;
                }),
                (a.getBrowserAlias = function (c) {
                  return i.BROWSER_ALIASES_MAP[c];
                }),
                (a.getBrowserTypeByAlias = function (c) {
                  return i.BROWSER_MAP[c] || "";
                }),
                a
              );
            })();
          ((t.default = s), (e.exports = t.default));
        },
        18: function (e, t, r) {
          "use strict";
          ((t.__esModule = !0),
            (t.ENGINE_MAP =
              t.OS_MAP =
              t.PLATFORMS_MAP =
              t.BROWSER_MAP =
              t.BROWSER_ALIASES_MAP =
                void 0),
            (t.BROWSER_ALIASES_MAP = {
              AmazonBot: "amazonbot",
              "Amazon Silk": "amazon_silk",
              "Android Browser": "android",
              BaiduSpider: "baiduspider",
              Bada: "bada",
              BingCrawler: "bingcrawler",
              Brave: "brave",
              BlackBerry: "blackberry",
              "ChatGPT-User": "chatgpt_user",
              Chrome: "chrome",
              ClaudeBot: "claudebot",
              Chromium: "chromium",
              Diffbot: "diffbot",
              DuckDuckBot: "duckduckbot",
              DuckDuckGo: "duckduckgo",
              Electron: "electron",
              Epiphany: "epiphany",
              FacebookExternalHit: "facebookexternalhit",
              Firefox: "firefox",
              Focus: "focus",
              Generic: "generic",
              "Google Search": "google_search",
              Googlebot: "googlebot",
              GPTBot: "gptbot",
              "Internet Explorer": "ie",
              InternetArchiveCrawler: "internetarchivecrawler",
              "K-Meleon": "k_meleon",
              LibreWolf: "librewolf",
              Linespider: "linespider",
              Maxthon: "maxthon",
              "Meta-ExternalAds": "meta_externalads",
              "Meta-ExternalAgent": "meta_externalagent",
              "Meta-ExternalFetcher": "meta_externalfetcher",
              "Meta-WebIndexer": "meta_webindexer",
              "Microsoft Edge": "edge",
              "MZ Browser": "mz",
              "NAVER Whale Browser": "naver",
              "OAI-SearchBot": "oai_searchbot",
              Omgilibot: "omgilibot",
              Opera: "opera",
              "Opera Coast": "opera_coast",
              "Pale Moon": "pale_moon",
              PerplexityBot: "perplexitybot",
              "Perplexity-User": "perplexity_user",
              PhantomJS: "phantomjs",
              PingdomBot: "pingdombot",
              Puffin: "puffin",
              QQ: "qq",
              QQLite: "qqlite",
              QupZilla: "qupzilla",
              Roku: "roku",
              Safari: "safari",
              Sailfish: "sailfish",
              "Samsung Internet for Android": "samsung_internet",
              SlackBot: "slackbot",
              SeaMonkey: "seamonkey",
              Sleipnir: "sleipnir",
              "Sogou Browser": "sogou",
              Swing: "swing",
              Tizen: "tizen",
              "UC Browser": "uc",
              Vivaldi: "vivaldi",
              "WebOS Browser": "webos",
              WeChat: "wechat",
              YahooSlurp: "yahooslurp",
              "Yandex Browser": "yandex",
              YandexBot: "yandexbot",
              YouBot: "youbot",
            }),
            (t.BROWSER_MAP = {
              amazonbot: "AmazonBot",
              amazon_silk: "Amazon Silk",
              android: "Android Browser",
              baiduspider: "BaiduSpider",
              bada: "Bada",
              bingcrawler: "BingCrawler",
              blackberry: "BlackBerry",
              brave: "Brave",
              chatgpt_user: "ChatGPT-User",
              chrome: "Chrome",
              claudebot: "ClaudeBot",
              chromium: "Chromium",
              diffbot: "Diffbot",
              duckduckbot: "DuckDuckBot",
              duckduckgo: "DuckDuckGo",
              edge: "Microsoft Edge",
              electron: "Electron",
              epiphany: "Epiphany",
              facebookexternalhit: "FacebookExternalHit",
              firefox: "Firefox",
              focus: "Focus",
              generic: "Generic",
              google_search: "Google Search",
              googlebot: "Googlebot",
              gptbot: "GPTBot",
              ie: "Internet Explorer",
              internetarchivecrawler: "InternetArchiveCrawler",
              k_meleon: "K-Meleon",
              librewolf: "LibreWolf",
              linespider: "Linespider",
              maxthon: "Maxthon",
              meta_externalads: "Meta-ExternalAds",
              meta_externalagent: "Meta-ExternalAgent",
              meta_externalfetcher: "Meta-ExternalFetcher",
              meta_webindexer: "Meta-WebIndexer",
              mz: "MZ Browser",
              naver: "NAVER Whale Browser",
              oai_searchbot: "OAI-SearchBot",
              omgilibot: "Omgilibot",
              opera: "Opera",
              opera_coast: "Opera Coast",
              pale_moon: "Pale Moon",
              perplexitybot: "PerplexityBot",
              perplexity_user: "Perplexity-User",
              phantomjs: "PhantomJS",
              pingdombot: "PingdomBot",
              puffin: "Puffin",
              qq: "QQ Browser",
              qqlite: "QQ Browser Lite",
              qupzilla: "QupZilla",
              roku: "Roku",
              safari: "Safari",
              sailfish: "Sailfish",
              samsung_internet: "Samsung Internet for Android",
              seamonkey: "SeaMonkey",
              slackbot: "SlackBot",
              sleipnir: "Sleipnir",
              sogou: "Sogou Browser",
              swing: "Swing",
              tizen: "Tizen",
              uc: "UC Browser",
              vivaldi: "Vivaldi",
              webos: "WebOS Browser",
              wechat: "WeChat",
              yahooslurp: "YahooSlurp",
              yandex: "Yandex Browser",
              yandexbot: "YandexBot",
              youbot: "YouBot",
            }),
            (t.PLATFORMS_MAP = {
              bot: "bot",
              desktop: "desktop",
              mobile: "mobile",
              tablet: "tablet",
              tv: "tv",
            }),
            (t.OS_MAP = {
              Android: "Android",
              Bada: "Bada",
              BlackBerry: "BlackBerry",
              ChromeOS: "Chrome OS",
              HarmonyOS: "HarmonyOS",
              iOS: "iOS",
              Linux: "Linux",
              MacOS: "macOS",
              PlayStation4: "PlayStation 4",
              Roku: "Roku",
              Tizen: "Tizen",
              WebOS: "WebOS",
              Windows: "Windows",
              WindowsPhone: "Windows Phone",
            }),
            (t.ENGINE_MAP = {
              Blink: "Blink",
              EdgeHTML: "EdgeHTML",
              Gecko: "Gecko",
              Presto: "Presto",
              Trident: "Trident",
              WebKit: "WebKit",
            }));
        },
        90: function (e, t, r) {
          "use strict";
          ((t.__esModule = !0), (t.default = void 0));
          var i,
            s = (i = r(91)) && i.__esModule ? i : { default: i },
            a = r(18);
          function c(p, l) {
            for (var g = 0; g < l.length; g++) {
              var u = l[g];
              ((u.enumerable = u.enumerable || !1),
                (u.configurable = !0),
                "value" in u && (u.writable = !0),
                Object.defineProperty(p, u.key, u));
            }
          }
          n(c, "o");
          var o = (function () {
            function p() {}
            n(p, "e");
            var l, g, u;
            return (
              (p.getParser = function (m, d, b) {
                if (
                  (d === void 0 && (d = !1),
                  b === void 0 && (b = null),
                  typeof m != "string")
                )
                  throw new Error("UserAgent should be a string");
                return new s.default(m, d, b);
              }),
              (p.parse = function (m, d) {
                return (
                  d === void 0 && (d = null),
                  new s.default(m, d).getResult()
                );
              }),
              (l = p),
              (u = [
                {
                  key: "BROWSER_MAP",
                  get: n(function () {
                    return a.BROWSER_MAP;
                  }, "get"),
                },
                {
                  key: "ENGINE_MAP",
                  get: n(function () {
                    return a.ENGINE_MAP;
                  }, "get"),
                },
                {
                  key: "OS_MAP",
                  get: n(function () {
                    return a.OS_MAP;
                  }, "get"),
                },
                {
                  key: "PLATFORMS_MAP",
                  get: n(function () {
                    return a.PLATFORMS_MAP;
                  }, "get"),
                },
              ]),
              (g = null) && c(l.prototype, g),
              u && c(l, u),
              p
            );
          })();
          ((t.default = o), (e.exports = t.default));
        },
        91: function (e, t, r) {
          "use strict";
          ((t.__esModule = !0), (t.default = void 0));
          var i = p(r(92)),
            s = p(r(93)),
            a = p(r(94)),
            c = p(r(95)),
            o = p(r(17));
          function p(g) {
            return g && g.__esModule ? g : { default: g };
          }
          n(p, "u");
          var l = (function () {
            function g(m, d, b) {
              if (
                (d === void 0 && (d = !1),
                b === void 0 && (b = null),
                m == null || m === "")
              )
                throw new Error("UserAgent parameter can't be empty");
              this._ua = m;
              var h = !1;
              (typeof d == "boolean"
                ? ((h = d), (this._hints = b))
                : (this._hints = d != null && typeof d == "object" ? d : null),
                (this.parsedResult = {}),
                h !== !0 && this.parse());
            }
            n(g, "e");
            var u = g.prototype;
            return (
              (u.getHints = function () {
                return this._hints;
              }),
              (u.hasBrand = function (m) {
                if (!this._hints || !Array.isArray(this._hints.brands))
                  return !1;
                var d = m.toLowerCase();
                return this._hints.brands.some(function (b) {
                  return b.brand && b.brand.toLowerCase() === d;
                });
              }),
              (u.getBrandVersion = function (m) {
                if (this._hints && Array.isArray(this._hints.brands)) {
                  var d = m.toLowerCase(),
                    b = this._hints.brands.find(function (h) {
                      return h.brand && h.brand.toLowerCase() === d;
                    });
                  return b ? b.version : void 0;
                }
              }),
              (u.getUA = function () {
                return this._ua;
              }),
              (u.test = function (m) {
                return m.test(this._ua);
              }),
              (u.parseBrowser = function () {
                var m = this;
                this.parsedResult.browser = {};
                var d = o.default.find(i.default, function (b) {
                  if (typeof b.test == "function") return b.test(m);
                  if (Array.isArray(b.test))
                    return b.test.some(function (h) {
                      return m.test(h);
                    });
                  throw new Error("Browser's test function is not valid");
                });
                return (
                  d &&
                    (this.parsedResult.browser = d.describe(
                      this.getUA(),
                      this,
                    )),
                  this.parsedResult.browser
                );
              }),
              (u.getBrowser = function () {
                return this.parsedResult.browser
                  ? this.parsedResult.browser
                  : this.parseBrowser();
              }),
              (u.getBrowserName = function (m) {
                return m
                  ? String(this.getBrowser().name).toLowerCase() || ""
                  : this.getBrowser().name || "";
              }),
              (u.getBrowserVersion = function () {
                return this.getBrowser().version;
              }),
              (u.getOS = function () {
                return this.parsedResult.os
                  ? this.parsedResult.os
                  : this.parseOS();
              }),
              (u.parseOS = function () {
                var m = this;
                this.parsedResult.os = {};
                var d = o.default.find(s.default, function (b) {
                  if (typeof b.test == "function") return b.test(m);
                  if (Array.isArray(b.test))
                    return b.test.some(function (h) {
                      return m.test(h);
                    });
                  throw new Error("Browser's test function is not valid");
                });
                return (
                  d && (this.parsedResult.os = d.describe(this.getUA())),
                  this.parsedResult.os
                );
              }),
              (u.getOSName = function (m) {
                var d = this.getOS().name;
                return m ? String(d).toLowerCase() || "" : d || "";
              }),
              (u.getOSVersion = function () {
                return this.getOS().version;
              }),
              (u.getPlatform = function () {
                return this.parsedResult.platform
                  ? this.parsedResult.platform
                  : this.parsePlatform();
              }),
              (u.getPlatformType = function (m) {
                m === void 0 && (m = !1);
                var d = this.getPlatform().type;
                return m ? String(d).toLowerCase() || "" : d || "";
              }),
              (u.parsePlatform = function () {
                var m = this;
                this.parsedResult.platform = {};
                var d = o.default.find(a.default, function (b) {
                  if (typeof b.test == "function") return b.test(m);
                  if (Array.isArray(b.test))
                    return b.test.some(function (h) {
                      return m.test(h);
                    });
                  throw new Error("Browser's test function is not valid");
                });
                return (
                  d && (this.parsedResult.platform = d.describe(this.getUA())),
                  this.parsedResult.platform
                );
              }),
              (u.getEngine = function () {
                return this.parsedResult.engine
                  ? this.parsedResult.engine
                  : this.parseEngine();
              }),
              (u.getEngineName = function (m) {
                return m
                  ? String(this.getEngine().name).toLowerCase() || ""
                  : this.getEngine().name || "";
              }),
              (u.parseEngine = function () {
                var m = this;
                this.parsedResult.engine = {};
                var d = o.default.find(c.default, function (b) {
                  if (typeof b.test == "function") return b.test(m);
                  if (Array.isArray(b.test))
                    return b.test.some(function (h) {
                      return m.test(h);
                    });
                  throw new Error("Browser's test function is not valid");
                });
                return (
                  d && (this.parsedResult.engine = d.describe(this.getUA())),
                  this.parsedResult.engine
                );
              }),
              (u.parse = function () {
                return (
                  this.parseBrowser(),
                  this.parseOS(),
                  this.parsePlatform(),
                  this.parseEngine(),
                  this
                );
              }),
              (u.getResult = function () {
                return o.default.assign({}, this.parsedResult);
              }),
              (u.satisfies = function (m) {
                var d = this,
                  b = {},
                  h = 0,
                  I = {},
                  x = 0;
                if (
                  (Object.keys(m).forEach(function (re) {
                    var Nt = m[re];
                    typeof Nt == "string"
                      ? ((I[re] = Nt), (x += 1))
                      : typeof Nt == "object" && ((b[re] = Nt), (h += 1));
                  }),
                  h > 0)
                ) {
                  var et = Object.keys(b),
                    ai = o.default.find(et, function (re) {
                      return d.isOS(re);
                    });
                  if (ai) {
                    var oi = this.satisfies(b[ai]);
                    if (oi !== void 0) return oi;
                  }
                  var pi = o.default.find(et, function (re) {
                    return d.isPlatform(re);
                  });
                  if (pi) {
                    var li = this.satisfies(b[pi]);
                    if (li !== void 0) return li;
                  }
                }
                if (x > 0) {
                  var Eo = Object.keys(I),
                    ci = o.default.find(Eo, function (re) {
                      return d.isBrowser(re, !0);
                    });
                  if (ci !== void 0) return this.compareVersion(I[ci]);
                }
              }),
              (u.isBrowser = function (m, d) {
                d === void 0 && (d = !1);
                var b = this.getBrowserName().toLowerCase(),
                  h = m.toLowerCase(),
                  I = o.default.getBrowserTypeByAlias(h);
                return (d && I && (h = I.toLowerCase()), h === b);
              }),
              (u.compareVersion = function (m) {
                var d = [0],
                  b = m,
                  h = !1,
                  I = this.getBrowserVersion();
                if (typeof I == "string")
                  return (
                    m[0] === ">" || m[0] === "<"
                      ? ((b = m.substr(1)),
                        m[1] === "=" ? ((h = !0), (b = m.substr(2))) : (d = []),
                        m[0] === ">" ? d.push(1) : d.push(-1))
                      : m[0] === "="
                        ? (b = m.substr(1))
                        : m[0] === "~" && ((h = !0), (b = m.substr(1))),
                    d.indexOf(o.default.compareVersions(I, b, h)) > -1
                  );
              }),
              (u.isOS = function (m) {
                return this.getOSName(!0) === String(m).toLowerCase();
              }),
              (u.isPlatform = function (m) {
                return this.getPlatformType(!0) === String(m).toLowerCase();
              }),
              (u.isEngine = function (m) {
                return this.getEngineName(!0) === String(m).toLowerCase();
              }),
              (u.is = function (m, d) {
                return (
                  d === void 0 && (d = !1),
                  this.isBrowser(m, d) || this.isOS(m) || this.isPlatform(m)
                );
              }),
              (u.some = function (m) {
                var d = this;
                return (
                  m === void 0 && (m = []),
                  m.some(function (b) {
                    return d.is(b);
                  })
                );
              }),
              g
            );
          })();
          ((t.default = l), (e.exports = t.default));
        },
        92: function (e, t, r) {
          "use strict";
          ((t.__esModule = !0), (t.default = void 0));
          var i,
            s = (i = r(17)) && i.__esModule ? i : { default: i },
            a = /version\/(\d+(\.?_?\d+)+)/i,
            c = [
              {
                test: [/gptbot/i],
                describe: n(function (o) {
                  var p = { name: "GPTBot" },
                    l =
                      s.default.getFirstMatch(/gptbot\/(\d+(\.\d+)+)/i, o) ||
                      s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/chatgpt-user/i],
                describe: n(function (o) {
                  var p = { name: "ChatGPT-User" },
                    l =
                      s.default.getFirstMatch(
                        /chatgpt-user\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/oai-searchbot/i],
                describe: n(function (o) {
                  var p = { name: "OAI-SearchBot" },
                    l =
                      s.default.getFirstMatch(
                        /oai-searchbot\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [
                  /claudebot/i,
                  /claude-web/i,
                  /claude-user/i,
                  /claude-searchbot/i,
                ],
                describe: n(function (o) {
                  var p = { name: "ClaudeBot" },
                    l =
                      s.default.getFirstMatch(
                        /(?:claudebot|claude-web|claude-user|claude-searchbot)\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/omgilibot/i, /webzio-extended/i],
                describe: n(function (o) {
                  var p = { name: "Omgilibot" },
                    l =
                      s.default.getFirstMatch(
                        /(?:omgilibot|webzio-extended)\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/diffbot/i],
                describe: n(function (o) {
                  var p = { name: "Diffbot" },
                    l =
                      s.default.getFirstMatch(/diffbot\/(\d+(\.\d+)+)/i, o) ||
                      s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/perplexitybot/i],
                describe: n(function (o) {
                  var p = { name: "PerplexityBot" },
                    l =
                      s.default.getFirstMatch(
                        /perplexitybot\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/perplexity-user/i],
                describe: n(function (o) {
                  var p = { name: "Perplexity-User" },
                    l =
                      s.default.getFirstMatch(
                        /perplexity-user\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/youbot/i],
                describe: n(function (o) {
                  var p = { name: "YouBot" },
                    l =
                      s.default.getFirstMatch(/youbot\/(\d+(\.\d+)+)/i, o) ||
                      s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/meta-webindexer/i],
                describe: n(function (o) {
                  var p = { name: "Meta-WebIndexer" },
                    l =
                      s.default.getFirstMatch(
                        /meta-webindexer\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/meta-externalads/i],
                describe: n(function (o) {
                  var p = { name: "Meta-ExternalAds" },
                    l =
                      s.default.getFirstMatch(
                        /meta-externalads\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/meta-externalagent/i],
                describe: n(function (o) {
                  var p = { name: "Meta-ExternalAgent" },
                    l =
                      s.default.getFirstMatch(
                        /meta-externalagent\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/meta-externalfetcher/i],
                describe: n(function (o) {
                  var p = { name: "Meta-ExternalFetcher" },
                    l =
                      s.default.getFirstMatch(
                        /meta-externalfetcher\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/googlebot/i],
                describe: n(function (o) {
                  var p = { name: "Googlebot" },
                    l =
                      s.default.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, o) ||
                      s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/linespider/i],
                describe: n(function (o) {
                  var p = { name: "Linespider" },
                    l =
                      s.default.getFirstMatch(
                        /(?:linespider)(?:-[-\w]+)?[\s/](\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/amazonbot/i],
                describe: n(function (o) {
                  var p = { name: "AmazonBot" },
                    l =
                      s.default.getFirstMatch(/amazonbot\/(\d+(\.\d+)+)/i, o) ||
                      s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/bingbot/i],
                describe: n(function (o) {
                  var p = { name: "BingCrawler" },
                    l =
                      s.default.getFirstMatch(/bingbot\/(\d+(\.\d+)+)/i, o) ||
                      s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/baiduspider/i],
                describe: n(function (o) {
                  var p = { name: "BaiduSpider" },
                    l =
                      s.default.getFirstMatch(
                        /baiduspider\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/duckduckbot/i],
                describe: n(function (o) {
                  var p = { name: "DuckDuckBot" },
                    l =
                      s.default.getFirstMatch(
                        /duckduckbot\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/ia_archiver/i],
                describe: n(function (o) {
                  var p = { name: "InternetArchiveCrawler" },
                    l =
                      s.default.getFirstMatch(
                        /ia_archiver\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/facebookexternalhit/i, /facebookcatalog/i],
                describe: n(function () {
                  return { name: "FacebookExternalHit" };
                }, "describe"),
              },
              {
                test: [/slackbot/i, /slack-imgProxy/i],
                describe: n(function (o) {
                  var p = { name: "SlackBot" },
                    l =
                      s.default.getFirstMatch(
                        /(?:slackbot|slack-imgproxy)(?:-[-\w]+)?[\s/](\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/yahoo!?[\s/]*slurp/i],
                describe: n(function () {
                  return { name: "YahooSlurp" };
                }, "describe"),
              },
              {
                test: [/yandexbot/i, /yandexmobilebot/i],
                describe: n(function () {
                  return { name: "YandexBot" };
                }, "describe"),
              },
              {
                test: [/pingdom/i],
                describe: n(function () {
                  return { name: "PingdomBot" };
                }, "describe"),
              },
              {
                test: [/opera/i],
                describe: n(function (o) {
                  var p = { name: "Opera" },
                    l =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:opera)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/opr\/|opios/i],
                describe: n(function (o) {
                  var p = { name: "Opera" },
                    l =
                      s.default.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, o) ||
                      s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/SamsungBrowser/i],
                describe: n(function (o) {
                  var p = { name: "Samsung Internet for Android" },
                    l =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/Whale/i],
                describe: n(function (o) {
                  var p = { name: "NAVER Whale Browser" },
                    l =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:whale)[\s/](\d+(?:\.\d+)+)/i,
                        o,
                      );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/PaleMoon/i],
                describe: n(function (o) {
                  var p = { name: "Pale Moon" },
                    l =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:PaleMoon)[\s/](\d+(?:\.\d+)+)/i,
                        o,
                      );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/MZBrowser/i],
                describe: n(function (o) {
                  var p = { name: "MZ Browser" },
                    l =
                      s.default.getFirstMatch(
                        /(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/focus/i],
                describe: n(function (o) {
                  var p = { name: "Focus" },
                    l =
                      s.default.getFirstMatch(
                        /(?:focus)[\s/](\d+(?:\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/swing/i],
                describe: n(function (o) {
                  var p = { name: "Swing" },
                    l =
                      s.default.getFirstMatch(
                        /(?:swing)[\s/](\d+(?:\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/coast/i],
                describe: n(function (o) {
                  var p = { name: "Opera Coast" },
                    l =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:coast)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/opt\/\d+(?:.?_?\d+)+/i],
                describe: n(function (o) {
                  var p = { name: "Opera Touch" },
                    l =
                      s.default.getFirstMatch(
                        /(?:opt)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/yabrowser/i],
                describe: n(function (o) {
                  var p = { name: "Yandex Browser" },
                    l =
                      s.default.getFirstMatch(
                        /(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/ucbrowser/i],
                describe: n(function (o) {
                  var p = { name: "UC Browser" },
                    l =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/Maxthon|mxios/i],
                describe: n(function (o) {
                  var p = { name: "Maxthon" },
                    l =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/epiphany/i],
                describe: n(function (o) {
                  var p = { name: "Epiphany" },
                    l =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/puffin/i],
                describe: n(function (o) {
                  var p = { name: "Puffin" },
                    l =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:puffin)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/sleipnir/i],
                describe: n(function (o) {
                  var p = { name: "Sleipnir" },
                    l =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/k-meleon/i],
                describe: n(function (o) {
                  var p = { name: "K-Meleon" },
                    l =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/micromessenger/i],
                describe: n(function (o) {
                  var p = { name: "WeChat" },
                    l =
                      s.default.getFirstMatch(
                        /(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/qqbrowser/i],
                describe: n(function (o) {
                  var p = {
                      name: /qqbrowserlite/i.test(o)
                        ? "QQ Browser Lite"
                        : "QQ Browser",
                    },
                    l =
                      s.default.getFirstMatch(
                        /(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/msie|trident/i],
                describe: n(function (o) {
                  var p = { name: "Internet Explorer" },
                    l = s.default.getFirstMatch(
                      /(?:msie |rv:)(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/\sedg\//i],
                describe: n(function (o) {
                  var p = { name: "Microsoft Edge" },
                    l = s.default.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/edg([ea]|ios)/i],
                describe: n(function (o) {
                  var p = { name: "Microsoft Edge" },
                    l = s.default.getSecondMatch(
                      /edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/vivaldi/i],
                describe: n(function (o) {
                  var p = { name: "Vivaldi" },
                    l = s.default.getFirstMatch(
                      /vivaldi\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/seamonkey/i],
                describe: n(function (o) {
                  var p = { name: "SeaMonkey" },
                    l = s.default.getFirstMatch(
                      /seamonkey\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/sailfish/i],
                describe: n(function (o) {
                  var p = { name: "Sailfish" },
                    l = s.default.getFirstMatch(
                      /sailfish\s?browser\/(\d+(\.\d+)?)/i,
                      o,
                    );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/silk/i],
                describe: n(function (o) {
                  var p = { name: "Amazon Silk" },
                    l = s.default.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/phantom/i],
                describe: n(function (o) {
                  var p = { name: "PhantomJS" },
                    l = s.default.getFirstMatch(
                      /phantomjs\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/slimerjs/i],
                describe: n(function (o) {
                  var p = { name: "SlimerJS" },
                    l = s.default.getFirstMatch(
                      /slimerjs\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
                describe: n(function (o) {
                  var p = { name: "BlackBerry" },
                    l =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /blackberry[\d]+\/(\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/(web|hpw)[o0]s/i],
                describe: n(function (o) {
                  var p = { name: "WebOS Browser" },
                    l =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/bada/i],
                describe: n(function (o) {
                  var p = { name: "Bada" },
                    l = s.default.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/tizen/i],
                describe: n(function (o) {
                  var p = { name: "Tizen" },
                    l =
                      s.default.getFirstMatch(
                        /(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/qupzilla/i],
                describe: n(function (o) {
                  var p = { name: "QupZilla" },
                    l =
                      s.default.getFirstMatch(
                        /(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/librewolf/i],
                describe: n(function (o) {
                  var p = { name: "LibreWolf" },
                    l = s.default.getFirstMatch(
                      /(?:librewolf)[\s/](\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/firefox|iceweasel|fxios/i],
                describe: n(function (o) {
                  var p = { name: "Firefox" },
                    l = s.default.getFirstMatch(
                      /(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/electron/i],
                describe: n(function (o) {
                  var p = { name: "Electron" },
                    l = s.default.getFirstMatch(
                      /(?:electron)\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/sogoumobilebrowser/i, /metasr/i, /se 2\.[x]/i],
                describe: n(function (o) {
                  var p = { name: "Sogou Browser" },
                    l = s.default.getFirstMatch(
                      /(?:sogoumobilebrowser)[\s/](\d+(\.?_?\d+)+)/i,
                      o,
                    ),
                    g = s.default.getFirstMatch(
                      /(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i,
                      o,
                    ),
                    u = s.default.getFirstMatch(/se ([\d.]+)x/i, o),
                    m = l || g || u;
                  return (m && (p.version = m), p);
                }, "describe"),
              },
              {
                test: [/MiuiBrowser/i],
                describe: n(function (o) {
                  var p = { name: "Miui" },
                    l = s.default.getFirstMatch(
                      /(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: n(function (o) {
                  return (
                    !!o.hasBrand("DuckDuckGo") || o.test(/\sDdg\/[\d.]+$/i)
                  );
                }, "test"),
                describe: n(function (o, p) {
                  var l = { name: "DuckDuckGo" };
                  if (p) {
                    var g = p.getBrandVersion("DuckDuckGo");
                    if (g) return ((l.version = g), l);
                  }
                  var u = s.default.getFirstMatch(/\sDdg\/([\d.]+)$/i, o);
                  return (u && (l.version = u), l);
                }, "describe"),
              },
              {
                test: n(function (o) {
                  return o.hasBrand("Brave");
                }, "test"),
                describe: n(function (o, p) {
                  var l = { name: "Brave" };
                  if (p) {
                    var g = p.getBrandVersion("Brave");
                    if (g) return ((l.version = g), l);
                  }
                  return l;
                }, "describe"),
              },
              {
                test: [/chromium/i],
                describe: n(function (o) {
                  var p = { name: "Chromium" },
                    l =
                      s.default.getFirstMatch(
                        /(?:chromium)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/chrome|crios|crmo/i],
                describe: n(function (o) {
                  var p = { name: "Chrome" },
                    l = s.default.getFirstMatch(
                      /(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/GSA/i],
                describe: n(function (o) {
                  var p = { name: "Google Search" },
                    l = s.default.getFirstMatch(
                      /(?:GSA)\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: n(function (o) {
                  var p = !o.test(/like android/i),
                    l = o.test(/android/i);
                  return p && l;
                }, "test"),
                describe: n(function (o) {
                  var p = { name: "Android Browser" },
                    l = s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/playstation 4/i],
                describe: n(function (o) {
                  var p = { name: "PlayStation 4" },
                    l = s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/safari|applewebkit/i],
                describe: n(function (o) {
                  var p = { name: "Safari" },
                    l = s.default.getFirstMatch(a, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/.*/i],
                describe: n(function (o) {
                  var p =
                    o.search("\\(") !== -1
                      ? /^(.*)\/(.*)[ \t]\((.*)/
                      : /^(.*)\/(.*) /;
                  return {
                    name: s.default.getFirstMatch(p, o),
                    version: s.default.getSecondMatch(p, o),
                  };
                }, "describe"),
              },
            ];
          ((t.default = c), (e.exports = t.default));
        },
        93: function (e, t, r) {
          "use strict";
          ((t.__esModule = !0), (t.default = void 0));
          var i,
            s = (i = r(17)) && i.__esModule ? i : { default: i },
            a = r(18),
            c = [
              {
                test: [/Roku\/DVP/],
                describe: n(function (o) {
                  var p = s.default.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, o);
                  return { name: a.OS_MAP.Roku, version: p };
                }, "describe"),
              },
              {
                test: [/windows phone/i],
                describe: n(function (o) {
                  var p = s.default.getFirstMatch(
                    /windows phone (?:os)?\s?(\d+(\.\d+)*)/i,
                    o,
                  );
                  return { name: a.OS_MAP.WindowsPhone, version: p };
                }, "describe"),
              },
              {
                test: [/windows /i],
                describe: n(function (o) {
                  var p = s.default.getFirstMatch(
                      /Windows ((NT|XP)( \d\d?.\d)?)/i,
                      o,
                    ),
                    l = s.default.getWindowsVersionName(p);
                  return { name: a.OS_MAP.Windows, version: p, versionName: l };
                }, "describe"),
              },
              {
                test: [/Macintosh(.*?) FxiOS(.*?)\//],
                describe: n(function (o) {
                  var p = { name: a.OS_MAP.iOS },
                    l = s.default.getSecondMatch(/(Version\/)(\d[\d.]+)/, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/macintosh/i],
                describe: n(function (o) {
                  var p = s.default
                      .getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, o)
                      .replace(/[_\s]/g, "."),
                    l = s.default.getMacOSVersionName(p),
                    g = { name: a.OS_MAP.MacOS, version: p };
                  return (l && (g.versionName = l), g);
                }, "describe"),
              },
              {
                test: [/(ipod|iphone|ipad)/i],
                describe: n(function (o) {
                  var p = s.default
                    .getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, o)
                    .replace(/[_\s]/g, ".");
                  return { name: a.OS_MAP.iOS, version: p };
                }, "describe"),
              },
              {
                test: [/OpenHarmony/i],
                describe: n(function (o) {
                  var p = s.default.getFirstMatch(
                    /OpenHarmony\s+(\d+(\.\d+)*)/i,
                    o,
                  );
                  return { name: a.OS_MAP.HarmonyOS, version: p };
                }, "describe"),
              },
              {
                test: n(function (o) {
                  var p = !o.test(/like android/i),
                    l = o.test(/android/i);
                  return p && l;
                }, "test"),
                describe: n(function (o) {
                  var p = s.default.getFirstMatch(
                      /android[\s/-](\d+(\.\d+)*)/i,
                      o,
                    ),
                    l = s.default.getAndroidVersionName(p),
                    g = { name: a.OS_MAP.Android, version: p };
                  return (l && (g.versionName = l), g);
                }, "describe"),
              },
              {
                test: [/(web|hpw)[o0]s/i],
                describe: n(function (o) {
                  var p = s.default.getFirstMatch(
                      /(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i,
                      o,
                    ),
                    l = { name: a.OS_MAP.WebOS };
                  return (p && p.length && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
                describe: n(function (o) {
                  var p =
                    s.default.getFirstMatch(
                      /rim\stablet\sos\s(\d+(\.\d+)*)/i,
                      o,
                    ) ||
                    s.default.getFirstMatch(
                      /blackberry\d+\/(\d+([_\s]\d+)*)/i,
                      o,
                    ) ||
                    s.default.getFirstMatch(/\bbb(\d+)/i, o);
                  return { name: a.OS_MAP.BlackBerry, version: p };
                }, "describe"),
              },
              {
                test: [/bada/i],
                describe: n(function (o) {
                  var p = s.default.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, o);
                  return { name: a.OS_MAP.Bada, version: p };
                }, "describe"),
              },
              {
                test: [/tizen/i],
                describe: n(function (o) {
                  var p = s.default.getFirstMatch(
                    /tizen[/\s](\d+(\.\d+)*)/i,
                    o,
                  );
                  return { name: a.OS_MAP.Tizen, version: p };
                }, "describe"),
              },
              {
                test: [/linux/i],
                describe: n(function () {
                  return { name: a.OS_MAP.Linux };
                }, "describe"),
              },
              {
                test: [/CrOS/],
                describe: n(function () {
                  return { name: a.OS_MAP.ChromeOS };
                }, "describe"),
              },
              {
                test: [/PlayStation 4/],
                describe: n(function (o) {
                  var p = s.default.getFirstMatch(
                    /PlayStation 4[/\s](\d+(\.\d+)*)/i,
                    o,
                  );
                  return { name: a.OS_MAP.PlayStation4, version: p };
                }, "describe"),
              },
            ];
          ((t.default = c), (e.exports = t.default));
        },
        94: function (e, t, r) {
          "use strict";
          ((t.__esModule = !0), (t.default = void 0));
          var i,
            s = (i = r(17)) && i.__esModule ? i : { default: i },
            a = r(18),
            c = [
              {
                test: [/googlebot/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Google" };
                }, "describe"),
              },
              {
                test: [/linespider/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Line" };
                }, "describe"),
              },
              {
                test: [/amazonbot/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Amazon" };
                }, "describe"),
              },
              {
                test: [/gptbot/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "OpenAI" };
                }, "describe"),
              },
              {
                test: [/chatgpt-user/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "OpenAI" };
                }, "describe"),
              },
              {
                test: [/oai-searchbot/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "OpenAI" };
                }, "describe"),
              },
              {
                test: [/baiduspider/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Baidu" };
                }, "describe"),
              },
              {
                test: [/bingbot/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Bing" };
                }, "describe"),
              },
              {
                test: [/duckduckbot/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "DuckDuckGo" };
                }, "describe"),
              },
              {
                test: [
                  /claudebot/i,
                  /claude-web/i,
                  /claude-user/i,
                  /claude-searchbot/i,
                ],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Anthropic" };
                }, "describe"),
              },
              {
                test: [/omgilibot/i, /webzio-extended/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Webz.io" };
                }, "describe"),
              },
              {
                test: [/diffbot/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Diffbot" };
                }, "describe"),
              },
              {
                test: [/perplexitybot/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Perplexity AI" };
                }, "describe"),
              },
              {
                test: [/perplexity-user/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Perplexity AI" };
                }, "describe"),
              },
              {
                test: [/youbot/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "You.com" };
                }, "describe"),
              },
              {
                test: [/ia_archiver/i],
                describe: n(function () {
                  return {
                    type: a.PLATFORMS_MAP.bot,
                    vendor: "Internet Archive",
                  };
                }, "describe"),
              },
              {
                test: [/meta-webindexer/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
                }, "describe"),
              },
              {
                test: [/meta-externalads/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
                }, "describe"),
              },
              {
                test: [/meta-externalagent/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
                }, "describe"),
              },
              {
                test: [/meta-externalfetcher/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
                }, "describe"),
              },
              {
                test: [/facebookexternalhit/i, /facebookcatalog/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
                }, "describe"),
              },
              {
                test: [/slackbot/i, /slack-imgProxy/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Slack" };
                }, "describe"),
              },
              {
                test: [/yahoo/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Yahoo" };
                }, "describe"),
              },
              {
                test: [/yandexbot/i, /yandexmobilebot/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Yandex" };
                }, "describe"),
              },
              {
                test: [/pingdom/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Pingdom" };
                }, "describe"),
              },
              {
                test: [/huawei/i],
                describe: n(function (o) {
                  var p = s.default.getFirstMatch(/(can-l01)/i, o) && "Nova",
                    l = { type: a.PLATFORMS_MAP.mobile, vendor: "Huawei" };
                  return (p && (l.model = p), l);
                }, "describe"),
              },
              {
                test: [/nexus\s*(?:7|8|9|10).*/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.tablet, vendor: "Nexus" };
                }, "describe"),
              },
              {
                test: [/ipad/i],
                describe: n(function () {
                  return {
                    type: a.PLATFORMS_MAP.tablet,
                    vendor: "Apple",
                    model: "iPad",
                  };
                }, "describe"),
              },
              {
                test: [/Macintosh(.*?) FxiOS(.*?)\//],
                describe: n(function () {
                  return {
                    type: a.PLATFORMS_MAP.tablet,
                    vendor: "Apple",
                    model: "iPad",
                  };
                }, "describe"),
              },
              {
                test: [/kftt build/i],
                describe: n(function () {
                  return {
                    type: a.PLATFORMS_MAP.tablet,
                    vendor: "Amazon",
                    model: "Kindle Fire HD 7",
                  };
                }, "describe"),
              },
              {
                test: [/silk/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.tablet, vendor: "Amazon" };
                }, "describe"),
              },
              {
                test: [/tablet(?! pc)/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.tablet };
                }, "describe"),
              },
              {
                test: n(function (o) {
                  var p = o.test(/ipod|iphone/i),
                    l = o.test(/like (ipod|iphone)/i);
                  return p && !l;
                }, "test"),
                describe: n(function (o) {
                  var p = s.default.getFirstMatch(/(ipod|iphone)/i, o);
                  return {
                    type: a.PLATFORMS_MAP.mobile,
                    vendor: "Apple",
                    model: p,
                  };
                }, "describe"),
              },
              {
                test: [/nexus\s*[0-6].*/i, /galaxy nexus/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.mobile, vendor: "Nexus" };
                }, "describe"),
              },
              {
                test: [/Nokia/i],
                describe: n(function (o) {
                  var p = s.default.getFirstMatch(
                      /Nokia\s+([0-9]+(\.[0-9]+)?)/i,
                      o,
                    ),
                    l = { type: a.PLATFORMS_MAP.mobile, vendor: "Nokia" };
                  return (p && (l.model = p), l);
                }, "describe"),
              },
              {
                test: [/[^-]mobi/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.mobile };
                }, "describe"),
              },
              {
                test: n(function (o) {
                  return o.getBrowserName(!0) === "blackberry";
                }, "test"),
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.mobile, vendor: "BlackBerry" };
                }, "describe"),
              },
              {
                test: n(function (o) {
                  return o.getBrowserName(!0) === "bada";
                }, "test"),
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.mobile };
                }, "describe"),
              },
              {
                test: n(function (o) {
                  return o.getBrowserName() === "windows phone";
                }, "test"),
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.mobile, vendor: "Microsoft" };
                }, "describe"),
              },
              {
                test: n(function (o) {
                  var p = Number(String(o.getOSVersion()).split(".")[0]);
                  return o.getOSName(!0) === "android" && p >= 3;
                }, "test"),
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.tablet };
                }, "describe"),
              },
              {
                test: n(function (o) {
                  return o.getOSName(!0) === "android";
                }, "test"),
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.mobile };
                }, "describe"),
              },
              {
                test: [/smart-?tv|smarttv/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.tv };
                }, "describe"),
              },
              {
                test: [/netcast/i],
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.tv };
                }, "describe"),
              },
              {
                test: n(function (o) {
                  return o.getOSName(!0) === "macos";
                }, "test"),
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.desktop, vendor: "Apple" };
                }, "describe"),
              },
              {
                test: n(function (o) {
                  return o.getOSName(!0) === "windows";
                }, "test"),
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.desktop };
                }, "describe"),
              },
              {
                test: n(function (o) {
                  return o.getOSName(!0) === "linux";
                }, "test"),
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.desktop };
                }, "describe"),
              },
              {
                test: n(function (o) {
                  return o.getOSName(!0) === "playstation 4";
                }, "test"),
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.tv };
                }, "describe"),
              },
              {
                test: n(function (o) {
                  return o.getOSName(!0) === "roku";
                }, "test"),
                describe: n(function () {
                  return { type: a.PLATFORMS_MAP.tv };
                }, "describe"),
              },
            ];
          ((t.default = c), (e.exports = t.default));
        },
        95: function (e, t, r) {
          "use strict";
          ((t.__esModule = !0), (t.default = void 0));
          var i,
            s = (i = r(17)) && i.__esModule ? i : { default: i },
            a = r(18),
            c = [
              {
                test: n(function (o) {
                  return o.getBrowserName(!0) === "microsoft edge";
                }, "test"),
                describe: n(function (o) {
                  if (/\sedg\//i.test(o)) return { name: a.ENGINE_MAP.Blink };
                  var p = s.default.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, o);
                  return { name: a.ENGINE_MAP.EdgeHTML, version: p };
                }, "describe"),
              },
              {
                test: [/trident/i],
                describe: n(function (o) {
                  var p = { name: a.ENGINE_MAP.Trident },
                    l = s.default.getFirstMatch(
                      /trident\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: n(function (o) {
                  return o.test(/presto/i);
                }, "test"),
                describe: n(function (o) {
                  var p = { name: a.ENGINE_MAP.Presto },
                    l = s.default.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: n(function (o) {
                  var p = o.test(/gecko/i),
                    l = o.test(/like gecko/i);
                  return p && !l;
                }, "test"),
                describe: n(function (o) {
                  var p = { name: a.ENGINE_MAP.Gecko },
                    l = s.default.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/(apple)?webkit\/537\.36/i],
                describe: n(function () {
                  return { name: a.ENGINE_MAP.Blink };
                }, "describe"),
              },
              {
                test: [/(apple)?webkit/i],
                describe: n(function (o) {
                  var p = { name: a.ENGINE_MAP.WebKit },
                    l = s.default.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, o);
                  return (l && (p.version = l), p);
                }, "describe"),
              },
            ];
          ((t.default = c), (e.exports = t.default));
        },
      });
    });
  });
  var Ka = ui((PT, zn) => {
    "use strict";
    var Xe = typeof Reflect == "object" ? Reflect : null,
      Fa =
        Xe && typeof Xe.apply == "function"
          ? Xe.apply
          : n(function (t, r, i) {
              return Function.prototype.apply.call(t, r, i);
            }, "ReflectApply"),
      br;
    Xe && typeof Xe.ownKeys == "function"
      ? (br = Xe.ownKeys)
      : Object.getOwnPropertySymbols
        ? (br = n(function (t) {
            return Object.getOwnPropertyNames(t).concat(
              Object.getOwnPropertySymbols(t),
            );
          }, "ReflectOwnKeys"))
        : (br = n(function (t) {
            return Object.getOwnPropertyNames(t);
          }, "ReflectOwnKeys"));
    function Tu(e) {
      console && console.warn && console.warn(e);
    }
    n(Tu, "ProcessEmitWarning");
    var Ga =
      Number.isNaN ||
      n(function (t) {
        return t !== t;
      }, "NumberIsNaN");
    function T() {
      T.init.call(this);
    }
    n(T, "EventEmitter");
    zn.exports = T;
    zn.exports.once = xu;
    T.EventEmitter = T;
    T.prototype._events = void 0;
    T.prototype._eventsCount = 0;
    T.prototype._maxListeners = void 0;
    var Ba = 10;
    function fr(e) {
      if (typeof e != "function")
        throw new TypeError(
          'The "listener" argument must be of type Function. Received type ' +
            typeof e,
        );
    }
    n(fr, "checkListener");
    Object.defineProperty(T, "defaultMaxListeners", {
      enumerable: !0,
      get: n(function () {
        return Ba;
      }, "get"),
      set: n(function (e) {
        if (typeof e != "number" || e < 0 || Ga(e))
          throw new RangeError(
            'The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' +
              e +
              ".",
          );
        Ba = e;
      }, "set"),
    });
    T.init = function () {
      ((this._events === void 0 ||
        this._events === Object.getPrototypeOf(this)._events) &&
        ((this._events = Object.create(null)), (this._eventsCount = 0)),
        (this._maxListeners = this._maxListeners || void 0));
    };
    T.prototype.setMaxListeners = n(function (t) {
      if (typeof t != "number" || t < 0 || Ga(t))
        throw new RangeError(
          'The value of "n" is out of range. It must be a non-negative number. Received ' +
            t +
            ".",
        );
      return ((this._maxListeners = t), this);
    }, "setMaxListeners");
    function qa(e) {
      return e._maxListeners === void 0
        ? T.defaultMaxListeners
        : e._maxListeners;
    }
    n(qa, "_getMaxListeners");
    T.prototype.getMaxListeners = n(function () {
      return qa(this);
    }, "getMaxListeners");
    T.prototype.emit = n(function (t) {
      for (var r = [], i = 1; i < arguments.length; i++) r.push(arguments[i]);
      var s = t === "error",
        a = this._events;
      if (a !== void 0) s = s && a.error === void 0;
      else if (!s) return !1;
      if (s) {
        var c;
        if ((r.length > 0 && (c = r[0]), c instanceof Error)) throw c;
        var o = new Error(
          "Unhandled error." + (c ? " (" + c.message + ")" : ""),
        );
        throw ((o.context = c), o);
      }
      var p = a[t];
      if (p === void 0) return !1;
      if (typeof p == "function") Fa(p, this, r);
      else
        for (var l = p.length, g = za(p, l), i = 0; i < l; ++i)
          Fa(g[i], this, r);
      return !0;
    }, "emit");
    function Ha(e, t, r, i) {
      var s, a, c;
      if (
        (fr(r),
        (a = e._events),
        a === void 0
          ? ((a = e._events = Object.create(null)), (e._eventsCount = 0))
          : (a.newListener !== void 0 &&
              (e.emit("newListener", t, r.listener ? r.listener : r),
              (a = e._events)),
            (c = a[t])),
        c === void 0)
      )
        ((c = a[t] = r), ++e._eventsCount);
      else if (
        (typeof c == "function"
          ? (c = a[t] = i ? [r, c] : [c, r])
          : i
            ? c.unshift(r)
            : c.push(r),
        (s = qa(e)),
        s > 0 && c.length > s && !c.warned)
      ) {
        c.warned = !0;
        var o = new Error(
          "Possible EventEmitter memory leak detected. " +
            c.length +
            " " +
            String(t) +
            " listeners added. Use emitter.setMaxListeners() to increase limit",
        );
        ((o.name = "MaxListenersExceededWarning"),
          (o.emitter = e),
          (o.type = t),
          (o.count = c.length),
          Tu(o));
      }
      return e;
    }
    n(Ha, "_addListener");
    T.prototype.addListener = n(function (t, r) {
      return Ha(this, t, r, !1);
    }, "addListener");
    T.prototype.on = T.prototype.addListener;
    T.prototype.prependListener = n(function (t, r) {
      return Ha(this, t, r, !0);
    }, "prependListener");
    function Iu() {
      if (!this.fired)
        return (
          this.target.removeListener(this.type, this.wrapFn),
          (this.fired = !0),
          arguments.length === 0
            ? this.listener.call(this.target)
            : this.listener.apply(this.target, arguments)
        );
    }
    n(Iu, "onceWrapper");
    function Ya(e, t, r) {
      var i = { fired: !1, wrapFn: void 0, target: e, type: t, listener: r },
        s = Iu.bind(i);
      return ((s.listener = r), (i.wrapFn = s), s);
    }
    n(Ya, "_onceWrap");
    T.prototype.once = n(function (t, r) {
      return (fr(r), this.on(t, Ya(this, t, r)), this);
    }, "once");
    T.prototype.prependOnceListener = n(function (t, r) {
      return (fr(r), this.prependListener(t, Ya(this, t, r)), this);
    }, "prependOnceListener");
    T.prototype.removeListener = n(function (t, r) {
      var i, s, a, c, o;
      if ((fr(r), (s = this._events), s === void 0)) return this;
      if (((i = s[t]), i === void 0)) return this;
      if (i === r || i.listener === r)
        --this._eventsCount === 0
          ? (this._events = Object.create(null))
          : (delete s[t],
            s.removeListener &&
              this.emit("removeListener", t, i.listener || r));
      else if (typeof i != "function") {
        for (a = -1, c = i.length - 1; c >= 0; c--)
          if (i[c] === r || i[c].listener === r) {
            ((o = i[c].listener), (a = c));
            break;
          }
        if (a < 0) return this;
        (a === 0 ? i.shift() : Au(i, a),
          i.length === 1 && (s[t] = i[0]),
          s.removeListener !== void 0 &&
            this.emit("removeListener", t, o || r));
      }
      return this;
    }, "removeListener");
    T.prototype.off = T.prototype.removeListener;
    T.prototype.removeAllListeners = n(function (t) {
      var r, i, s;
      if (((i = this._events), i === void 0)) return this;
      if (i.removeListener === void 0)
        return (
          arguments.length === 0
            ? ((this._events = Object.create(null)), (this._eventsCount = 0))
            : i[t] !== void 0 &&
              (--this._eventsCount === 0
                ? (this._events = Object.create(null))
                : delete i[t]),
          this
        );
      if (arguments.length === 0) {
        var a = Object.keys(i),
          c;
        for (s = 0; s < a.length; ++s)
          ((c = a[s]), c !== "removeListener" && this.removeAllListeners(c));
        return (
          this.removeAllListeners("removeListener"),
          (this._events = Object.create(null)),
          (this._eventsCount = 0),
          this
        );
      }
      if (((r = i[t]), typeof r == "function")) this.removeListener(t, r);
      else if (r !== void 0)
        for (s = r.length - 1; s >= 0; s--) this.removeListener(t, r[s]);
      return this;
    }, "removeAllListeners");
    function Wa(e, t, r) {
      var i = e._events;
      if (i === void 0) return [];
      var s = i[t];
      return s === void 0
        ? []
        : typeof s == "function"
          ? r
            ? [s.listener || s]
            : [s]
          : r
            ? Ou(s)
            : za(s, s.length);
    }
    n(Wa, "_listeners");
    T.prototype.listeners = n(function (t) {
      return Wa(this, t, !0);
    }, "listeners");
    T.prototype.rawListeners = n(function (t) {
      return Wa(this, t, !1);
    }, "rawListeners");
    T.listenerCount = function (e, t) {
      return typeof e.listenerCount == "function"
        ? e.listenerCount(t)
        : Va.call(e, t);
    };
    T.prototype.listenerCount = Va;
    function Va(e) {
      var t = this._events;
      if (t !== void 0) {
        var r = t[e];
        if (typeof r == "function") return 1;
        if (r !== void 0) return r.length;
      }
      return 0;
    }
    n(Va, "listenerCount");
    T.prototype.eventNames = n(function () {
      return this._eventsCount > 0 ? br(this._events) : [];
    }, "eventNames");
    function za(e, t) {
      for (var r = new Array(t), i = 0; i < t; ++i) r[i] = e[i];
      return r;
    }
    n(za, "arrayClone");
    function Au(e, t) {
      for (; t + 1 < e.length; t++) e[t] = e[t + 1];
      e.pop();
    }
    n(Au, "spliceOne");
    function Ou(e) {
      for (var t = new Array(e.length), r = 0; r < t.length; ++r)
        t[r] = e[r].listener || e[r];
      return t;
    }
    n(Ou, "unwrapListeners");
    function xu(e, t) {
      return new Promise(function (r, i) {
        function s(c) {
          (e.removeListener(t, a), i(c));
        }
        n(s, "errorListener");
        function a() {
          (typeof e.removeListener == "function" &&
            e.removeListener("error", s),
            r([].slice.call(arguments)));
        }
        (n(a, "resolver"),
          ja(e, t, a, { once: !0 }),
          t !== "error" && Ru(e, s, { once: !0 }));
      });
    }
    n(xu, "once");
    function Ru(e, t, r) {
      typeof e.on == "function" && ja(e, "error", t, r);
    }
    n(Ru, "addErrorHandlerIfEventEmitter");
    function ja(e, t, r, i) {
      if (typeof e.on == "function") i.once ? e.once(t, r) : e.on(t, r);
      else if (typeof e.addEventListener == "function")
        e.addEventListener(
          t,
          n(function s(a) {
            (i.once && e.removeEventListener(t, s), r(a));
          }, "wrapListener"),
        );
      else
        throw new TypeError(
          'The "emitter" argument must be of type EventEmitter. Received type ' +
            typeof e,
        );
    }
    n(ja, "eventTargetAgnosticAddListener");
  });
  var y = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__;
  var _ = globalThis;
  var $ = "10.73.0";
  function he() {
    return (ve(_), _);
  }
  n(he, "getMainCarrier");
  function ve(e) {
    let t = (e.__SENTRY__ = e.__SENTRY__ || {});
    return ((t.version = t.version || $), (t[$] = t[$] || {}));
  }
  n(ve, "getSentryCarrier");
  function Y(e, t, r = _) {
    let i = (r.__SENTRY__ = r.__SENTRY__ || {}),
      s = (i[$] = i[$] || {});
    return s[e] || (s[e] = t());
  }
  n(Y, "getGlobalSingleton");
  var De = ["debug", "info", "warn", "error", "log", "assert", "trace"],
    ko = "Sentry Logger ",
    Se = {};
  function G(e) {
    if (!("console" in _)) return e();
    let t = _.console,
      r = {},
      i = Object.keys(Se);
    i.forEach((s) => {
      let a = Se[s];
      ((r[s] = t[s]), (t[s] = a));
    });
    try {
      return e();
    } finally {
      i.forEach((s) => {
        t[s] = r[s];
      });
    }
  }
  n(G, "consoleSandbox");
  function No() {
    Sr().enabled = !0;
  }
  n(No, "enable");
  function wo() {
    Sr().enabled = !1;
  }
  n(wo, "disable");
  function mi() {
    return Sr().enabled;
  }
  n(mi, "isEnabled");
  function Co(...e) {
    vr("log", ...e);
  }
  n(Co, "log");
  function Mo(...e) {
    vr("warn", ...e);
  }
  n(Mo, "warn");
  function Po(...e) {
    vr("error", ...e);
  }
  n(Po, "error");
  function vr(e, ...t) {
    y &&
      mi() &&
      G(() => {
        _.console[e](`${ko}[${e}]:`, ...t);
      });
  }
  n(vr, "_maybeLog");
  function Sr() {
    return y ? Y("loggerSettings", () => ({ enabled: !1 })) : { enabled: !1 };
  }
  n(Sr, "_getLoggerSettings");
  var f = {
    enable: No,
    disable: wo,
    isEnabled: mi,
    log: Co,
    warn: Mo,
    error: Po,
  };
  var gi = /\(error: (.*)\)/,
    bi = /captureMessage|captureException/;
  function Ct(...e) {
    let t = e.sort((r, i) => r[0] - i[0]).map((r) => r[1]);
    return (r, i = 0, s = 0) => {
      let a = [],
        c = r.split(`
`);
      for (let o = i; o < c.length; o++) {
        let p = c[o];
        p.length > 1024 && (p = p.slice(0, 1024));
        let l = gi.test(p) ? p.replace(gi, "$1") : p;
        if (!l.includes("Error: ")) {
          for (let g of t) {
            let u = g(l);
            if (u) {
              a.push(u);
              break;
            }
          }
          if (a.length >= 50 + s) break;
        }
      }
      return fi(a.slice(s));
    };
  }
  n(Ct, "createStackParser");
  function Tr(e) {
    return Array.isArray(e) ? Ct(...e) : e;
  }
  n(Tr, "stackParserFromStackParserOptions");
  function fi(e) {
    if (!e.length) return [];
    let t = Array.from(e);
    return (
      /sentryWrapped/.test(wt(t).function || "") && t.pop(),
      t.reverse(),
      bi.test(wt(t).function || "") &&
        (t.pop(), bi.test(wt(t).function || "") && t.pop()),
      t
        .slice(0, 50)
        .map((r) => ({
          ...r,
          filename: r.filename || wt(t).filename,
          function: r.function || "?",
        }))
    );
  }
  n(fi, "stripSentryFramesAndReverse");
  function wt(e) {
    return e[e.length - 1] || {};
  }
  n(wt, "getLastStackFrame");
  var Er = "<anonymous>";
  function q(e) {
    try {
      return !e || typeof e != "function" ? Er : e.name || Er;
    } catch {
      return Er;
    }
  }
  n(q, "getFunctionName");
  function Mt(e) {
    let t = e.exception;
    if (t) {
      let r = [];
      try {
        return (
          t.values.forEach((i) => {
            i.stacktrace.frames && r.push(...i.stacktrace.frames);
          }),
          r
        );
      } catch {
        return;
      }
    }
  }
  n(Mt, "getFramesFromEvent");
  var tt = {},
    yi = {};
  function C(e, t) {
    return (
      (tt[e] = tt[e] || []),
      tt[e].push(t),
      () => {
        let r = tt[e];
        if (r) {
          let i = r.indexOf(t);
          i !== -1 && r.splice(i, 1);
        }
      }
    );
  }
  n(C, "addHandler");
  function M(e, t) {
    if (!yi[e]) {
      yi[e] = !0;
      try {
        t();
      } catch (r) {
        y && f.error(`Error while instrumenting ${e}`, r);
      }
    }
  }
  n(M, "maybeInstrument");
  function R(e, t) {
    let r = e && tt[e];
    if (r)
      for (let i of r)
        try {
          i(t);
        } catch (s) {
          y &&
            f.error(
              `Error while triggering instrumentation handler.
Type: ${e}
Name: ${q(i)}
Error:`,
              s,
            );
        }
  }
  n(R, "triggerHandlers");
  var Ir = null;
  function Ar(e) {
    let t = "error";
    (C(t, e), M(t, Lo));
  }
  n(Ar, "addGlobalErrorInstrumentationHandler");
  function Lo() {
    ((Ir = _.onerror),
      (_.onerror = function (e, t, r, i, s) {
        return (
          R("error", { column: i, error: s, line: r, msg: e, url: t }),
          Ir ? Ir.apply(this, arguments) : !1
        );
      }),
      (_.onerror.__SENTRY_INSTRUMENTED__ = !0));
  }
  n(Lo, "instrumentError");
  var Or = null;
  function xr(e) {
    let t = "unhandledrejection";
    (C(t, e), M(t, Do));
  }
  n(xr, "addGlobalUnhandledRejectionInstrumentationHandler");
  function Do() {
    ((Or = _.onunhandledrejection),
      (_.onunhandledrejection = function (e) {
        return (
          R("unhandledrejection", e),
          Or ? Or.apply(this, arguments) : !0
        );
      }),
      (_.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0));
  }
  n(Do, "instrumentUnhandledRejection");
  var _i = Object.prototype.toString;
  function N(e) {
    switch (_i.call(e)) {
      case "[object Error]":
      case "[object Exception]":
      case "[object DOMException]":
      case "[object WebAssembly.Exception]":
        return !0;
      default:
        return nt(e, Error);
    }
  }
  n(N, "isError");
  function Ue(e, t) {
    return _i.call(e) === `[object ${t}]`;
  }
  n(Ue, "isBuiltin");
  function Fe(e) {
    return Ue(e, "ErrorEvent");
  }
  n(Fe, "isErrorEvent");
  function rt(e) {
    return Ue(e, "DOMError");
  }
  n(rt, "isDOMError");
  function Pt(e) {
    return Ue(e, "DOMException");
  }
  n(Pt, "isDOMException");
  function w(e) {
    return Ue(e, "String");
  }
  n(w, "isString");
  function oe(e) {
    return (
      typeof e == "object" &&
      e !== null &&
      "__sentry_template_string__" in e &&
      "__sentry_template_values__" in e
    );
  }
  n(oe, "isParameterizedString");
  function W(e) {
    return (
      e === null || oe(e) || (typeof e != "object" && typeof e != "function")
    );
  }
  n(W, "isPrimitive");
  function Q(e) {
    return Ue(e, "Object");
  }
  n(Q, "isPlainObject");
  function ne(e) {
    return typeof e == "object" && e !== null;
  }
  n(ne, "isObjectLike");
  function pe(e) {
    return typeof Event < "u" && nt(e, Event);
  }
  n(pe, "isEvent");
  function Lt(e) {
    return Ue(e, "RegExp");
  }
  n(Lt, "isRegExp");
  function V(e) {
    return !!(e?.then && typeof e.then == "function");
  }
  n(V, "isThenable");
  function nt(e, t) {
    try {
      return e instanceof t;
    } catch {
      return !1;
    }
  }
  n(nt, "isInstanceOf");
  function Rr(e) {
    return typeof Request < "u" && nt(e, Request);
  }
  n(Rr, "isRequest");
  function A(e, t, r) {
    if (!(t in e)) return;
    let i = e[t];
    if (typeof i != "function") return;
    let s = r(i);
    typeof s == "function" && it(s, i);
    try {
      e[t] = s;
    } catch {
      y && f.log(`Failed to replace method "${t}" in object`, e);
    }
  }
  n(A, "fill");
  function P(e, t, r) {
    try {
      Object.defineProperty(e, t, { value: r, writable: !0, configurable: !0 });
    } catch {
      y &&
        f.log(
          `Failed to add non-enumerable property "${String(t)}" to object`,
          e,
        );
    }
  }
  n(P, "addNonEnumerableProperty");
  function it(e, t) {
    try {
      let r = t.prototype || {};
      ((e.prototype = t.prototype = r), P(e, "__sentry_original__", t));
    } catch {}
  }
  n(it, "markFunctionWrapped");
  function le(e) {
    return e.__sentry_original__;
  }
  n(le, "getOriginalFunction");
  function st(e) {
    if (N(e))
      return { message: e.message, name: e.name, stack: e.stack, ...hi(e) };
    if (pe(e)) {
      let { type: t, target: r, currentTarget: i, detail: s } = e;
      return {
        type: t,
        target: r,
        currentTarget: i,
        ...(s ? { detail: s } : {}),
        ...hi(e),
      };
    }
    return e;
  }
  n(st, "convertToPlainObject");
  function hi(e) {
    return ne(e) ? Object.fromEntries(Object.entries(e)) : {};
  }
  n(hi, "getOwnProperties");
  function Dt(e) {
    let t = Object.keys(st(e));
    return (t.sort(), t[0] ? t.join(", ") : "[object has no keys]");
  }
  n(Dt, "extractExceptionKeysForMessage");
  var Be;
  function Ge(e) {
    if (Be !== void 0) return Be ? Be(e) : e();
    let t = Symbol.for("__SENTRY_SAFE_RANDOM_ID_WRAPPER__"),
      r = _;
    return t in r && typeof r[t] == "function"
      ? ((Be = r[t]), Be(e))
      : ((Be = null), e());
  }
  n(Ge, "withRandomSafeContext");
  function Ee() {
    return Ge(() => Math.random());
  }
  n(Ee, "safeMathRandom");
  function X() {
    return Ge(() => Date.now());
  }
  n(X, "safeDateNow");
  var Uo = Symbol.for("sentry.skipNormalization"),
    Fo = Symbol.for("sentry.overrideNormalizationDepth");
  function vi(e) {
    return !!e[Uo];
  }
  n(vi, "hasSkipNormalizationHint");
  function Si(e) {
    let t = e[Fo];
    return typeof t == "number" ? t : void 0;
  }
  n(Si, "getNormalizationDepthOverrideHint");
  var kr;
  function wr(e) {
    kr = e;
  }
  n(wr, "setNormalizeStringifier");
  function H(e, t = 100, r = 1 / 0) {
    try {
      return Nr("", e, t, r);
    } catch (i) {
      return { ERROR: `**non-serializable** (${i})` };
    }
  }
  n(H, "normalize");
  function Ut(e, t = 3, r = 100 * 1024) {
    let i = H(e, t);
    return qo(i) > r ? Ut(e, t - 1, r) : i;
  }
  n(Ut, "normalizeToSize");
  function Nr(e, t, r = 1 / 0, i = 1 / 0, s = Ho()) {
    let [a, c] = s;
    if (
      t == null ||
      ["boolean", "string"].includes(typeof t) ||
      (typeof t == "number" && Number.isFinite(t))
    )
      return t;
    let o = Cr(e, t);
    if (!o.startsWith("[object ")) return o;
    if (vi(t)) return t;
    let p = Si(t),
      l = p !== void 0 ? p : r;
    if (l === 0) return o.replace("object ", "");
    if (a(t)) return "[Circular ~]";
    let g = t;
    if (g && typeof g.toJSON == "function")
      try {
        let b = g.toJSON();
        return Nr("", b, l - 1, i, s);
      } catch {}
    let u = Array.isArray(t) ? [] : {},
      m = 0,
      d = st(t);
    for (let b in d) {
      if (!Object.prototype.hasOwnProperty.call(d, b)) continue;
      if (m >= i) {
        u[b] = "[MaxProperties ~]";
        break;
      }
      let h = d[b];
      ((u[b] = Nr(b, h, l - 1, i, s)), m++);
    }
    return (c(t), u);
  }
  n(Nr, "visit");
  function Cr(e, t) {
    try {
      if (kr) {
        let i = kr(t);
        if (i) return i;
      }
      return typeof global < "u" && t === global
        ? "[Global]"
        : typeof t == "number" && !Number.isFinite(t)
          ? `[${t}]`
          : typeof t == "function"
            ? `[Function: ${q(t)}]`
            : typeof t == "symbol"
              ? `[${String(t)}]`
              : typeof t == "bigint"
                ? `[BigInt: ${String(t)}]`
                : `[object ${Bo(t)}]`;
    } catch (r) {
      return `**non-serializable** (${r})`;
    }
  }
  n(Cr, "stringifyValue");
  function Bo(e) {
    let t = Object.getPrototypeOf(e);
    return t?.constructor ? t.constructor.name : "null prototype";
  }
  n(Bo, "getConstructorName");
  function Go(e) {
    return ~-encodeURI(e).split(/%..|./).length;
  }
  n(Go, "utf8Length");
  function qo(e) {
    return Go(JSON.stringify(e));
  }
  n(qo, "jsonSize");
  function Ho() {
    let e = new WeakSet();
    function t(i) {
      return e.has(i) ? !0 : (e.add(i), !1);
    }
    n(t, "memoize");
    function r(i) {
      e.delete(i);
    }
    return (n(r, "unmemoize"), [t, r]);
  }
  n(Ho, "memoBuilder");
  function qe(e, t = 0) {
    return typeof e != "string" || t === 0 || e.length <= t
      ? e
      : `${e.slice(0, t)}...`;
  }
  n(qe, "truncate");
  function Te(e, t) {
    if (!Array.isArray(e)) return "";
    let r = [];
    for (let i = 0; i < e.length; i++) {
      let s = e[i];
      W(s)
        ? r.push(String(s))
        : s instanceof Error
          ? r.push(s.message ? `${s.name}: ${s.message}` : s.name)
          : r.push(Cr(void 0, s));
    }
    return r.join(t);
  }
  n(Te, "safeJoin");
  function Ie(e, t, r = !1) {
    return w(e)
      ? Lt(t)
        ? t.test(e)
        : w(t)
          ? r
            ? e === t
            : e.includes(t)
          : typeof t == "function"
            ? t(e)
            : !1
      : !1;
  }
  n(Ie, "isMatchingPattern");
  function ce(e, t = [], r = !1) {
    for (let i of t) if (Ie(e, i, r)) return !0;
    return !1;
  }
  n(ce, "stringMatchesSomePattern");
  function Yo() {
    let e = _;
    return e.crypto || e.msCrypto;
  }
  n(Yo, "getCrypto");
  var Mr;
  function Wo() {
    return Ee() * 16;
  }
  n(Wo, "getRandomByte");
  function O(e = Yo()) {
    try {
      if (e?.randomUUID) return Ge(() => e.randomUUID()).replace(/-/g, "");
    } catch {}
    return (
      Mr || (Mr = "10000000100040008000" + 1e11),
      Mr.replace(/[018]/g, (t) => (t ^ ((Wo() & 15) >> (t / 4))).toString(16))
    );
  }
  n(O, "uuid4");
  function Ei(e) {
    return e.exception?.values?.[0];
  }
  n(Ei, "getFirstException");
  function z(e) {
    let { message: t, event_id: r } = e;
    if (t) return t;
    let i = Ei(e);
    return i
      ? i.type && i.value
        ? `${i.type}: ${i.value}`
        : i.type || i.value || r || "<unknown>"
      : r || "<unknown>";
  }
  n(z, "getEventDescription");
  function Ae(e, t, r) {
    let i = (e.exception = e.exception || {}),
      s = (i.values = i.values || []),
      a = (s[0] = s[0] || {});
    (a.value || (a.value = t || ""), a.type || (a.type = r || "Error"));
  }
  n(Ae, "addExceptionTypeValue");
  function D(e, t) {
    let r = Ei(e);
    if (!r) return;
    let i = { type: "generic", handled: !0 },
      s = r.mechanism;
    if (((r.mechanism = { ...i, ...s, ...t }), t && "data" in t)) {
      let a = { ...s?.data, ...t.data };
      r.mechanism.data = a;
    }
  }
  n(D, "addExceptionMechanism");
  function at(e) {
    if (Pr(e)) return !0;
    try {
      P(e, "__sentry_captured__", !0);
    } catch {}
    return !1;
  }
  n(at, "checkOrSetAlreadyCaught");
  function Pr(e) {
    try {
      return e.__sentry_captured__;
    } catch {}
  }
  n(Pr, "isAlreadyCaptured");
  var Ii = 1e3;
  function J() {
    return X() / Ii;
  }
  n(J, "dateTimestampInSeconds");
  function Vo() {
    let { performance: e } = _;
    if (!e?.now || !e.timeOrigin) return J;
    let t = e.timeOrigin;
    return () => (t + Ge(() => e.now())) / Ii;
  }
  n(Vo, "createUnixTimestampInSecondsFunc");
  var Ti;
  function U() {
    return (Ti ?? (Ti = Vo()))();
  }
  n(U, "timestampInSeconds");
  function Ai(e) {
    let t = U(),
      r = {
        sid: O(),
        init: !0,
        timestamp: t,
        started: t,
        duration: 0,
        status: "ok",
        errors: 0,
        ignoreDuration: !1,
        toJSON: n(() => zo(r), "toJSON"),
      };
    return (e && ie(r, e), r);
  }
  n(Ai, "makeSession");
  function ie(e, t = {}) {
    if (
      (t.user &&
        (!e.ipAddress && t.user.ip_address && (e.ipAddress = t.user.ip_address),
        !e.did &&
          !t.did &&
          (e.did = t.user.id || t.user.email || t.user.username)),
      (e.timestamp = t.timestamp || U()),
      t.abnormal_mechanism && (e.abnormal_mechanism = t.abnormal_mechanism),
      t.ignoreDuration && (e.ignoreDuration = t.ignoreDuration),
      t.sid && (e.sid = t.sid.length === 32 ? t.sid : O()),
      t.init !== void 0 && (e.init = t.init),
      !e.did && t.did && (e.did = `${t.did}`),
      typeof t.started == "number" && (e.started = t.started),
      e.ignoreDuration)
    )
      e.duration = void 0;
    else if (typeof t.duration == "number") e.duration = t.duration;
    else {
      let r = e.timestamp - e.started;
      e.duration = r >= 0 ? r : 0;
    }
    (t.release && (e.release = t.release),
      t.environment && (e.environment = t.environment),
      !e.ipAddress && t.ipAddress && (e.ipAddress = t.ipAddress),
      !e.userAgent && t.userAgent && (e.userAgent = t.userAgent),
      typeof t.errors == "number" && (e.errors = t.errors),
      t.status && (e.status = t.status));
  }
  n(ie, "updateSession");
  function Oi(e, t) {
    let r = {};
    (t ? (r = { status: t }) : e.status === "ok" && (r = { status: "exited" }),
      ie(e, r));
  }
  n(Oi, "closeSession");
  function zo(e) {
    return {
      sid: `${e.sid}`,
      init: e.init,
      started: new Date(e.started * 1e3).toISOString(),
      timestamp: new Date(e.timestamp * 1e3).toISOString(),
      status: e.status,
      errors: e.errors,
      did:
        typeof e.did == "number" || typeof e.did == "string"
          ? `${e.did}`
          : void 0,
      duration: e.duration,
      abnormal_mechanism: e.abnormal_mechanism,
      attrs: {
        release: e.release,
        environment: e.environment,
        ip_address: e.ipAddress,
        user_agent: e.userAgent,
      },
    };
  }
  n(zo, "sessionToJSON");
  function ue(e, t, r = 2) {
    if (!t || typeof t != "object" || r <= 0) return t;
    if (e && Object.keys(t).length === 0) return e;
    let i = { ...e };
    for (let s in t)
      Object.prototype.hasOwnProperty.call(t, s) &&
        (i[s] = ue(i[s], t[s], r - 1));
    return i;
  }
  n(ue, "merge");
  function Lr() {
    return O();
  }
  n(Lr, "generateTraceId");
  function Ft() {
    return O().substring(16);
  }
  n(Ft, "generateSpanId");
  function Dr(e) {
    try {
      let t = _.WeakRef;
      if (typeof t == "function") return new t(e);
    } catch {}
    return e;
  }
  n(Dr, "makeWeakRef");
  function Bt(e) {
    if (e) {
      if (typeof e == "object" && "deref" in e && typeof e.deref == "function")
        try {
          return e.deref();
        } catch {
          return;
        }
      return e;
    }
  }
  n(Bt, "derefWeakRef");
  var Ur = "_sentrySpan";
  function Fr(e, t) {
    t ? P(e, Ur, Dr(t)) : delete e[Ur];
  }
  n(Fr, "_setSpanForScope");
  function Br(e) {
    return Bt(e[Ur]);
  }
  n(Br, "_getSpanForScope");
  var jo = 100,
    ot = class ot {
      constructor() {
        ((this._notifyingListeners = !1),
          (this._scopeListeners = []),
          (this._eventProcessors = []),
          (this._breadcrumbs = []),
          (this._attachments = []),
          (this._user = {}),
          (this._tags = {}),
          (this._attributes = {}),
          (this._extra = {}),
          (this._contexts = {}),
          (this._sdkProcessingMetadata = {}),
          (this._propagationContext = { traceId: Lr(), sampleRand: Ee() }));
      }
      clone() {
        let t = new ot();
        return (
          (t._breadcrumbs = [...this._breadcrumbs]),
          (t._tags = { ...this._tags }),
          (t._attributes = { ...this._attributes }),
          (t._extra = { ...this._extra }),
          (t._contexts = { ...this._contexts }),
          this._contexts.flags &&
            (t._contexts.flags = { values: [...this._contexts.flags.values] }),
          (t._user = this._user),
          (t._level = this._level),
          (t._session = this._session),
          (t._transactionName = this._transactionName),
          (t._fingerprint = this._fingerprint),
          (t._eventProcessors = [...this._eventProcessors]),
          (t._attachments = [...this._attachments]),
          (t._sdkProcessingMetadata = { ...this._sdkProcessingMetadata }),
          (t._propagationContext = { ...this._propagationContext }),
          (t._client = this._client),
          (t._lastEventId = this._lastEventId),
          (t._conversationId = this._conversationId),
          Fr(t, Br(this)),
          t
        );
      }
      setClient(t) {
        this._client = t;
      }
      setLastEventId(t) {
        this._lastEventId = t;
      }
      getClient() {
        return this._client;
      }
      lastEventId() {
        return this._lastEventId;
      }
      addScopeListener(t) {
        this._scopeListeners.push(t);
      }
      addEventProcessor(t) {
        return (this._eventProcessors.push(t), this);
      }
      setUser(t) {
        return (
          (this._user = t || {
            email: void 0,
            id: void 0,
            ip_address: void 0,
            username: void 0,
          }),
          this._session && ie(this._session, { user: t }),
          this._notifyScopeListeners(),
          this
        );
      }
      getUser() {
        return this._user;
      }
      setConversationId(t) {
        return (
          (this._conversationId = t || void 0),
          this._notifyScopeListeners(),
          this
        );
      }
      setTags(t) {
        return (
          (this._tags = { ...this._tags, ...t }),
          this._notifyScopeListeners(),
          this
        );
      }
      setTag(t, r) {
        return this.setTags({ [t]: r });
      }
      setAttributes(t) {
        return (
          (this._attributes = { ...this._attributes, ...t }),
          this._notifyScopeListeners(),
          this
        );
      }
      setAttribute(t, r) {
        return this.setAttributes({ [t]: r });
      }
      removeAttribute(t) {
        return (
          t in this._attributes &&
            (delete this._attributes[t], this._notifyScopeListeners()),
          this
        );
      }
      setExtras(t) {
        return (
          (this._extra = { ...this._extra, ...t }),
          this._notifyScopeListeners(),
          this
        );
      }
      setExtra(t, r) {
        return (
          (this._extra = { ...this._extra, [t]: r }),
          this._notifyScopeListeners(),
          this
        );
      }
      setFingerprint(t) {
        return ((this._fingerprint = t), this._notifyScopeListeners(), this);
      }
      setLevel(t) {
        return ((this._level = t), this._notifyScopeListeners(), this);
      }
      setTransactionName(t) {
        return (
          (this._transactionName = t),
          this._notifyScopeListeners(),
          this
        );
      }
      setContext(t, r) {
        return (
          r === null ? delete this._contexts[t] : (this._contexts[t] = r),
          this._notifyScopeListeners(),
          this
        );
      }
      setSession(t) {
        return (
          t ? (this._session = t) : delete this._session,
          this._notifyScopeListeners(),
          this
        );
      }
      getSession() {
        return this._session;
      }
      update(t) {
        if (!t) return this;
        let r = typeof t == "function" ? t(this) : t,
          i = r instanceof ot ? r.getScopeData() : Q(r) ? t : void 0,
          {
            tags: s,
            attributes: a,
            extra: c,
            user: o,
            contexts: p,
            level: l,
            fingerprint: g = [],
            propagationContext: u,
            conversationId: m,
          } = i || {};
        return (
          (this._tags = { ...this._tags, ...s }),
          (this._attributes = { ...this._attributes, ...a }),
          (this._extra = { ...this._extra, ...c }),
          (this._contexts = { ...this._contexts, ...p }),
          o && Object.keys(o).length && (this._user = o),
          l && (this._level = l),
          g.length && (this._fingerprint = g),
          u && (this._propagationContext = u),
          m && (this._conversationId = m),
          this
        );
      }
      clear() {
        return (
          (this._breadcrumbs = []),
          (this._tags = {}),
          (this._attributes = {}),
          (this._extra = {}),
          (this._user = {}),
          (this._contexts = {}),
          (this._level = void 0),
          (this._transactionName = void 0),
          (this._fingerprint = void 0),
          (this._session = void 0),
          (this._conversationId = void 0),
          Fr(this, void 0),
          (this._attachments = []),
          this.setPropagationContext({ traceId: Lr(), sampleRand: Ee() }),
          this._notifyScopeListeners(),
          this
        );
      }
      addBreadcrumb(t, r) {
        let i = typeof r == "number" ? r : jo;
        if (i <= 0) return this;
        let s = {
          timestamp: J(),
          ...t,
          message: t.message ? qe(t.message, 2048) : t.message,
        };
        return (
          this._breadcrumbs.push(s),
          this._breadcrumbs.length > i &&
            ((this._breadcrumbs = this._breadcrumbs.slice(-i)),
            this._client?.recordDroppedEvent("buffer_overflow", "log_item")),
          this._notifyScopeListeners(),
          this
        );
      }
      getLastBreadcrumb() {
        return this._breadcrumbs[this._breadcrumbs.length - 1];
      }
      clearBreadcrumbs() {
        return ((this._breadcrumbs = []), this._notifyScopeListeners(), this);
      }
      addAttachment(t) {
        return (this._attachments.push(t), this);
      }
      clearAttachments() {
        return ((this._attachments = []), this);
      }
      getScopeData() {
        return {
          breadcrumbs: this._breadcrumbs,
          attachments: this._attachments,
          contexts: this._contexts,
          tags: this._tags,
          attributes: this._attributes,
          extra: this._extra,
          user: this._user,
          level: this._level,
          fingerprint: this._fingerprint || [],
          eventProcessors: this._eventProcessors,
          propagationContext: this._propagationContext,
          sdkProcessingMetadata: this._sdkProcessingMetadata,
          transactionName: this._transactionName,
          span: Br(this),
          conversationId: this._conversationId,
        };
      }
      setSDKProcessingMetadata(t) {
        return (
          (this._sdkProcessingMetadata = ue(this._sdkProcessingMetadata, t, 2)),
          this
        );
      }
      setPropagationContext(t) {
        return ((this._propagationContext = t), this);
      }
      getPropagationContext() {
        return this._propagationContext;
      }
      captureException(t, r) {
        let i = r?.event_id || O();
        if (!this._client)
          return (
            y &&
              f.warn(
                "No client configured on scope - will not capture exception!",
              ),
            i
          );
        let s = new Error("Sentry syntheticException");
        return (
          this._client.captureException(
            t,
            { originalException: t, syntheticException: s, ...r, event_id: i },
            this,
          ),
          i
        );
      }
      captureMessage(t, r, i) {
        let s = i?.event_id || O();
        if (!this._client)
          return (
            y &&
              f.warn(
                "No client configured on scope - will not capture message!",
              ),
            s
          );
        let a = i?.syntheticException ?? new Error(t);
        return (
          this._client.captureMessage(
            t,
            r,
            { originalException: t, syntheticException: a, ...i, event_id: s },
            this,
          ),
          s
        );
      }
      captureEvent(t, r) {
        let i = t.event_id || r?.event_id || O();
        return this._client
          ? (this._client.captureEvent(t, { ...r, event_id: i }, this), i)
          : (y &&
              f.warn("No client configured on scope - will not capture event!"),
            i);
      }
      _notifyScopeListeners() {
        this._notifyingListeners ||
          ((this._notifyingListeners = !0),
          this._scopeListeners.forEach((t) => {
            t(this);
          }),
          (this._notifyingListeners = !1));
      }
    };
  n(ot, "Scope");
  var F = ot;
  function xi() {
    return Y("defaultCurrentScope", () => new F());
  }
  n(xi, "getDefaultCurrentScope");
  function Ri() {
    return Y("defaultIsolationScope", () => new F());
  }
  n(Ri, "getDefaultIsolationScope");
  var ki = n((e) => e instanceof Promise && !e[Ni], "isActualPromise"),
    Ni = Symbol("chained PromiseLike"),
    wi = n((e, t, r) => {
      let i = e.then(
        (s) => (t(s), s),
        (s) => {
          throw (r(s), s);
        },
      );
      return ki(i) && ki(e) ? i : Ko(e, i);
    }, "chainAndCopyPromiseLike"),
    Ko = n((e, t) => {
      if (!t) return e;
      let r = !1;
      for (let i in e) {
        if (i in t) continue;
        r = !0;
        let s = e[i];
        typeof s == "function"
          ? Object.defineProperty(t, i, {
              value: n((...a) => s.apply(e, a), "value"),
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (t[i] = s);
      }
      return (r && Object.assign(t, { [Ni]: !0 }), t);
    }, "copyProps");
  var qr = class qr {
    constructor(t, r) {
      let i;
      t ? (i = t) : (i = new F());
      let s;
      (r ? (s = r) : (s = new F()),
        (this._stack = [{ scope: i }]),
        (this._isolationScope = s));
    }
    withScope(t) {
      let r = this._pushScope(),
        i;
      try {
        i = t(r);
      } catch (s) {
        throw (this._popScope(), s);
      }
      return V(i)
        ? wi(
            i,
            () => this._popScope(),
            () => this._popScope(),
          )
        : (this._popScope(), i);
    }
    getClient() {
      return this.getStackTop().client;
    }
    getScope() {
      return this.getStackTop().scope;
    }
    getIsolationScope() {
      return this._isolationScope;
    }
    getStackTop() {
      return this._stack[this._stack.length - 1];
    }
    _pushScope() {
      let t = this.getScope().clone();
      return (this._stack.push({ client: this.getClient(), scope: t }), t);
    }
    _popScope() {
      return this._stack.length <= 1 ? !1 : !!this._stack.pop();
    }
  };
  n(qr, "AsyncContextStack");
  var Gr = qr;
  function He() {
    let e = he(),
      t = ve(e);
    return (t.stack = t.stack || new Gr(xi(), Ri()));
  }
  n(He, "getAsyncContextStack");
  function $o(e) {
    return He().withScope(e);
  }
  n($o, "withScope");
  function Qo(e, t) {
    let r = He();
    return r.withScope(() => ((r.getStackTop().scope = e), t(e)));
  }
  n(Qo, "withSetScope");
  function Ci(e) {
    return He().withScope(() => e(He().getIsolationScope()));
  }
  n(Ci, "withIsolationScope");
  function Mi() {
    return {
      withIsolationScope: Ci,
      withScope: $o,
      withSetScope: Qo,
      withSetIsolationScope: n((e, t) => Ci(t), "withSetIsolationScope"),
      getCurrentScope: n(() => He().getScope(), "getCurrentScope"),
      getIsolationScope: n(() => He().getIsolationScope(), "getIsolationScope"),
    };
  }
  n(Mi, "getStackAsyncContextStrategy");
  function Gt(e) {
    let t = ve(e);
    return t.acs ? t.acs : Mi();
  }
  n(Gt, "getAsyncContextStrategy");
  function Xo(e) {
    return (
      typeof e == "object" &&
      e != null &&
      !Array.isArray(e) &&
      Object.keys(e).includes("value")
    );
  }
  n(Xo, "isAttributeObject");
  function Jo(e, t) {
    let { value: r, unit: i } = Xo(e) ? e : { value: e, unit: void 0 },
      s = Zo(r),
      a = i && typeof i == "string" ? { unit: i } : {};
    if (s) return { ...s, ...a };
    if (!t || (t === "skip-undefined" && r === void 0)) return;
    let c = "";
    try {
      c = JSON.stringify(r) ?? "";
    } catch {}
    return { value: c, type: "string", ...a };
  }
  n(Jo, "attributeValueToTypedAttributeValue");
  function Hr(e, t = !1) {
    let r = {};
    for (let [i, s] of Object.entries(e ?? {})) {
      let a = Jo(s, t);
      a && (r[i] = a);
    }
    return r;
  }
  n(Hr, "serializeAttributes");
  function Zo(e) {
    if (Array.isArray(e)) return { value: e, type: "array" };
    let t =
      typeof e == "string"
        ? "string"
        : typeof e == "boolean"
          ? "boolean"
          : typeof e == "number" && !Number.isNaN(e)
            ? Number.isInteger(e)
              ? "integer"
              : "double"
            : null;
    if (t) return { value: e, type: t };
  }
  n(Zo, "getTypedAttributeValue");
  var ep;
  function Pi() {
    return ep?.();
  }
  n(Pi, "getExternalPropagationContext");
  function L() {
    let e = he();
    return Gt(e).getCurrentScope();
  }
  n(L, "getCurrentScope");
  function B() {
    let e = he();
    return Gt(e).getIsolationScope();
  }
  n(B, "getIsolationScope");
  function qt() {
    return Y("globalScope", () => new F());
  }
  n(qt, "getGlobalScope");
  function Ye(...e) {
    let t = he(),
      r = Gt(t);
    if (e.length === 2) {
      let [i, s] = e;
      return i ? r.withSetScope(i, s) : r.withScope(s);
    }
    return r.withScope(e[0]);
  }
  n(Ye, "withScope");
  function S() {
    return L().getClient();
  }
  n(S, "getClient");
  function Yr(e) {
    let t = Pi();
    if (t) return { trace_id: t.traceId, span_id: t.spanId };
    let r = e.getPropagationContext(),
      { traceId: i, parentSpanId: s, propagationSpanId: a } = r,
      c = { trace_id: i, span_id: a || Ft() };
    return (s && (c.parent_span_id = s), c);
  }
  n(Yr, "getTraceContextFromScope");
  var pt = "sentry.source",
    Ht = "sentry.sample_rate",
    Wr = "sentry.previous_trace_sample_rate",
    We = "sentry.op",
    Yt = "sentry.origin";
  var Wt = "sentry.profile_id",
    Vt = "sentry.exclusive_time";
  var Vr = "gen_ai.conversation.id";
  var tp = "_sentryScope",
    rp = "_sentryIsolationScope";
  function lt(e) {
    let t = e;
    return { scope: t[tp], isolationScope: Bt(t[rp]) };
  }
  n(lt, "getCapturedScopesOnSpan");
  var Li = "sentry-";
  function Ui(e) {
    let t = np(e);
    if (!t) return;
    let r = Object.entries(t).reduce((i, [s, a]) => {
      if (s.startsWith(Li)) {
        let c = s.slice(Li.length);
        i[c] = a;
      }
      return i;
    }, {});
    if (Object.keys(r).length > 0) return r;
  }
  n(Ui, "baggageHeaderToDynamicSamplingContext");
  function np(e) {
    if (!(!e || (!w(e) && !Array.isArray(e))))
      return Array.isArray(e)
        ? e.reduce((t, r) => {
            let i = Di(r);
            return (
              Object.entries(i).forEach(([s, a]) => {
                t[s] = a;
              }),
              t
            );
          }, {})
        : Di(e);
  }
  n(np, "parseBaggageHeader");
  function Di(e) {
    return e
      .split(",")
      .map((t) => {
        let r = t.indexOf("=");
        if (r === -1) return [];
        let i = t.slice(0, r),
          s = t.slice(r + 1);
        return [i, s].map((a) => {
          try {
            return decodeURIComponent(a.trim());
          } catch {
            return;
          }
        });
      })
      .reduce((t, [r, i]) => (r && i && (t[r] = i), t), {});
  }
  n(Di, "baggageHeaderToObject");
  var ip = /^o(\d+)\./,
    sp =
      /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)((?:\[[:.%\w]+\]|[\w.-]+))(?::(\d+))?\/(.+)/;
  function ap(e) {
    return e === "http" || e === "https";
  }
  n(ap, "isValidProtocol");
  function Z(e, t = !1) {
    let {
      host: r,
      path: i,
      pass: s,
      port: a,
      projectId: c,
      protocol: o,
      publicKey: p,
    } = e;
    return `${o}://${p}${t && s ? `:${s}` : ""}@${r}${a ? `:${a}` : ""}/${i && `${i}/`}${c}`;
  }
  n(Z, "dsnToString");
  function op(e) {
    let t = sp.exec(e);
    if (!t) {
      G(() => {
        console.error(`Invalid Sentry Dsn: ${e}`);
      });
      return;
    }
    let [r, i, s = "", a = "", c = "", o = ""] = t.slice(1),
      p = "",
      l = o,
      g = l.split("/");
    if ((g.length > 1 && ((p = g.slice(0, -1).join("/")), (l = g.pop())), l)) {
      let u = l.match(/^\d+/);
      u && (l = u[0]);
    }
    return Fi({
      host: a,
      pass: s,
      path: p,
      projectId: l,
      port: c,
      protocol: r,
      publicKey: i,
    });
  }
  n(op, "dsnFromString");
  function Fi(e) {
    return {
      protocol: e.protocol,
      publicKey: e.publicKey || "",
      pass: e.pass || "",
      host: e.host,
      port: e.port || "",
      path: e.path || "",
      projectId: e.projectId,
    };
  }
  n(Fi, "dsnFromComponents");
  function pp(e) {
    if (!y) return !0;
    let { port: t, projectId: r, protocol: i } = e;
    return ["protocol", "publicKey", "host", "projectId"].find((c) =>
      e[c] ? !1 : (f.error(`Invalid Sentry Dsn: ${c} missing`), !0),
    )
      ? !1
      : r.match(/^\d+$/)
        ? ap(i)
          ? t && isNaN(parseInt(t, 10))
            ? (f.error(`Invalid Sentry Dsn: Invalid port ${t}`), !1)
            : !0
          : (f.error(`Invalid Sentry Dsn: Invalid protocol ${i}`), !1)
        : (f.error(`Invalid Sentry Dsn: Invalid projectId ${r}`), !1);
  }
  n(pp, "validateDsn");
  function lp(e) {
    return e.match(ip)?.[1];
  }
  n(lp, "extractOrgIdFromDsnHost");
  function Bi(e) {
    let t = e.getOptions(),
      { host: r } = e.getDsn() || {},
      i;
    return (t.orgId ? (i = String(t.orgId)) : r && (i = lp(r)), i);
  }
  n(Bi, "extractOrgIdFromClient");
  function Gi(e) {
    let t = typeof e == "string" ? op(e) : Fi(e);
    if (!(!t || !pp(t))) return t;
  }
  n(Gi, "makeDsn");
  function qi(e) {
    if (typeof e == "boolean") return Number(e);
    let t = typeof e == "string" ? parseFloat(e) : e;
    if (!(typeof t != "number" || isNaN(t) || t < 0 || t > 1)) return t;
  }
  n(qi, "parseSampleRate");
  var Vi = 1,
    Hi = !1;
  function zi(e) {
    let { spanId: t, traceId: r, isRemote: i } = e.spanContext(),
      s = i ? t : de(e).parent_span_id,
      a = lt(e).scope,
      c = i ? a?.getPropagationContext().propagationSpanId || Ft() : t;
    return { parent_span_id: s, span_id: c, trace_id: r };
  }
  n(zi, "spanToTraceContext");
  function dp(e) {
    if (e && e.length > 0)
      return e.map(
        ({
          context: { spanId: t, traceId: r, traceFlags: i, ...s },
          attributes: a,
        }) => ({
          span_id: t,
          trace_id: r,
          sampled: i === Vi,
          attributes: a,
          ...s,
        }),
      );
  }
  n(dp, "convertSpanLinksForEnvelope");
  function Yi(e) {
    return typeof e == "number"
      ? Wi(e)
      : Array.isArray(e)
        ? e[0] + e[1] / 1e9
        : e instanceof Date
          ? Wi(e.getTime())
          : U();
  }
  n(Yi, "spanTimeInputToSeconds");
  function Wi(e) {
    return e > 9999999999 ? e / 1e3 : e;
  }
  n(Wi, "ensureTimestampInSeconds");
  function de(e) {
    if (bp(e)) return e.getSpanJSON();
    let { spanId: t, traceId: r } = e.spanContext();
    if (gp(e)) {
      let {
        attributes: i,
        startTime: s,
        name: a,
        endTime: c,
        status: o,
        links: p,
      } = e;
      return {
        span_id: t,
        trace_id: r,
        data: i,
        description: a,
        parent_span_id: mp(e),
        start_timestamp: Yi(s),
        timestamp: Yi(c) || void 0,
        status: fp(o),
        op: i[We],
        origin: i[Yt],
        links: dp(p),
      };
    }
    return { span_id: t, trace_id: r, start_timestamp: 0, data: {} };
  }
  n(de, "spanToJSON");
  function mp(e) {
    return "parentSpanId" in e
      ? e.parentSpanId
      : "parentSpanContext" in e
        ? e.parentSpanContext?.spanId
        : void 0;
  }
  n(mp, "getOtelParentSpanId");
  function ji(e) {
    return {
      ...e,
      attributes: Hr(e.attributes),
      links: e.links?.map((t) => ({ ...t, attributes: Hr(t.attributes) })),
    };
  }
  n(ji, "streamedSpanJsonToSerializedSpan");
  function gp(e) {
    let t = e;
    return (
      !!t.attributes && !!t.startTime && !!t.name && !!t.endTime && !!t.status
    );
  }
  n(gp, "spanIsOpenTelemetrySdkTraceBaseSpan");
  function bp(e) {
    return typeof e.getSpanJSON == "function";
  }
  n(bp, "spanIsSentrySpan");
  function Ki(e) {
    let { traceFlags: t } = e.spanContext();
    return t === Vi;
  }
  n(Ki, "spanIsSampled");
  function fp(e) {
    if (!(!e || e.code === 0))
      return e.code === 1 ? "ok" : e.message || "internal_error";
  }
  n(fp, "getStatusMessage");
  var yp = "_sentryRootSpan";
  var ct = _p;
  function _p(e) {
    return e[yp] || e;
  }
  n(_p, "INTERNAL_getSegmentSpan");
  function zr() {
    Hi ||
      (G(() => {
        console.warn(
          "[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`.",
        );
      }),
      (Hi = !0));
  }
  n(zr, "showSpanDropWarning");
  function jr(e) {
    if (typeof __SENTRY_TRACING__ == "boolean" && !__SENTRY_TRACING__)
      return !1;
    let t = e || S()?.getOptions();
    return !!t && (t.tracesSampleRate != null || !!t.tracesSampler);
  }
  n(jr, "hasSpansEnabled");
  function $i(e) {
    f.log(
      `Ignoring span ${e.op} - ${e.description} because it matches \`ignoreSpans\`.`,
    );
  }
  n($i, "logIgnoredSpan");
  function Kr(e, t) {
    if (!t?.length) return !1;
    for (let r of t) {
      if (vp(r)) {
        if (e.description && Ie(e.description, r)) return (y && $i(e), !0);
        continue;
      }
      let i = !!r.attributes && Object.keys(r.attributes).length > 0;
      if (!r.name && !r.op && !i) continue;
      let s = r.name ? e.description && Ie(e.description, r.name) : !0,
        a = r.op ? e.op && Ie(e.op, r.op) : !0,
        c = r.attributes
          ? Object.entries(r.attributes).every(([o, p]) =>
              hp(e.attributes?.[o], p),
            )
          : !0;
      if (s && a && c) return (y && $i(e), !0);
    }
    return !1;
  }
  n(Kr, "shouldIgnoreSpan");
  function hp(e, t) {
    return typeof e == "string" && (typeof t == "string" || t instanceof RegExp)
      ? Ie(e, t)
      : Array.isArray(e) && Array.isArray(t)
        ? e.length === t.length && e.every((r, i) => r === t[i])
        : e === t;
  }
  n(hp, "_matchesAttributeValue");
  function Qi(e, t) {
    let r = t.parent_span_id,
      i = t.span_id;
    if (r) for (let s of e) s.parent_span_id === i && (s.parent_span_id = r);
  }
  n(Qi, "reparentChildSpans");
  function vp(e) {
    return typeof e == "string" || e instanceof RegExp;
  }
  n(vp, "isStringOrRegExp");
  var Sp = Symbol.for("sentry.nonRecordingSpan");
  function Xi(e) {
    return !!e && e[Sp] === !0;
  }
  n(Xi, "spanIsNonRecordingSpan");
  var Ve = "production";
  var Ep = "_frozenDsc";
  function Ji(e, t) {
    let r = t.getOptions(),
      { publicKey: i } = t.getDsn() || {},
      s = {
        environment: r.environment || Ve,
        release: r.release,
        public_key: i,
        trace_id: e,
        org_id: Bi(t),
      };
    return (t.emit("createDsc", s), s);
  }
  n(Ji, "getDynamicSamplingContextFromClient");
  function $r(e, t) {
    let r = t.getPropagationContext();
    return r.dsc || Ji(r.traceId, e);
  }
  n($r, "getDynamicSamplingContextFromScope");
  function Zi(e) {
    let t = S();
    if (!t) return {};
    let r = ct(e),
      i = de(r),
      s = i.data,
      a = r.spanContext().traceState,
      c = a?.get("sentry.sample_rate") ?? s[Ht] ?? s[Wr];
    function o(I) {
      return (
        (typeof c == "number" || typeof c == "string") &&
          (I.sample_rate = `${c}`),
        I
      );
    }
    n(o, "applyLocalSampleRateToDsc");
    let p = r[Ep];
    if (p) return o(p);
    let l = Xi(r),
      g = l && r.dropReason === "ignored";
    if (l && (!jr(t.getOptions()) || g)) {
      let I = lt(r).scope;
      if (I) {
        let x = { ...$r(t, I) };
        return (g && (x.sampled = "false"), o(x));
      }
    }
    let u = a?.get("sentry.dsc"),
      m = u && Ui(u);
    if (m) return o(m);
    let d = Ji(e.spanContext().traceId, t),
      b = s[pt] ?? s["sentry.segment.name.source"],
      h = i.description;
    return (
      b !== "url" && h && (d.transaction = h),
      jr() &&
        ((d.sampled = String(Ki(r))),
        (d.sample_rand =
          a?.get("sentry.sample_rand") ??
          lt(r).scope?.getPropagationContext().sampleRand.toString())),
      o(d),
      t.emit("createDsc", d, r),
      d
    );
  }
  n(Zi, "getDynamicSamplingContextFromSpan");
  function es(e) {
    return !!e && typeof e == "function" && "_streamed" in e && !!e._streamed;
  }
  n(es, "isStreamedBeforeSendSpanCallback");
  function j(e, t = []) {
    return [e, t];
  }
  n(j, "createEnvelope");
  function Xr(e, t) {
    let [r, i] = e;
    return [r, [...i, t]];
  }
  n(Xr, "addItemToEnvelope");
  function zt(e, t) {
    let r = e[1];
    for (let i of r) {
      let s = i[0].type;
      if (t(i, s)) return !0;
    }
    return !1;
  }
  n(zt, "forEachEnvelopeItem");
  function ts(e, t) {
    return zt(e, (r, i) => t.includes(i));
  }
  n(ts, "envelopeContainsItemType");
  function Qr(e) {
    let t = ve(_);
    return t.encodePolyfill ? t.encodePolyfill(e) : new TextEncoder().encode(e);
  }
  n(Qr, "encodeUTF8");
  function rs(e) {
    let [t, r] = e,
      i = JSON.stringify(t);
    function s(a) {
      typeof i == "string"
        ? (i = typeof a == "string" ? i + a : [Qr(i), a])
        : i.push(typeof a == "string" ? Qr(a) : a);
    }
    n(s, "append");
    for (let a of r) {
      let [c, o] = a;
      if (
        (s(`
${JSON.stringify(c)}
`),
        typeof o == "string" || o instanceof Uint8Array)
      )
        s(o);
      else {
        let p;
        try {
          p = JSON.stringify(o);
        } catch {
          p = JSON.stringify(H(o));
        }
        s(p);
      }
    }
    return typeof i == "string" ? i : Tp(i);
  }
  n(rs, "serializeEnvelope");
  function Tp(e) {
    let t = e.reduce((s, a) => s + a.length, 0),
      r = new Uint8Array(t),
      i = 0;
    for (let s of e) (r.set(s, i), (i += s.length));
    return r;
  }
  n(Tp, "concatBuffers");
  function ns(e) {
    let t = typeof e.data == "string" ? Qr(e.data) : e.data;
    return [
      {
        type: "attachment",
        length: t.length,
        filename: e.filename,
        content_type: e.contentType,
        attachment_type: e.attachmentType,
      },
      t,
    ];
  }
  n(ns, "createAttachmentEnvelopeItem");
  var is = {
    sessions: "session",
    event: "error",
    client_report: "internal",
    user_report: "default",
    profile_chunk: "profile",
    replay_event: "replay",
    replay_recording: "replay",
    check_in: "monitor",
    raw_security: "security",
    log: "log_item",
    trace_metric: "metric",
  };
  function Ip(e) {
    return e in is;
  }
  n(Ip, "_isOverriddenType");
  function Jr(e) {
    return Ip(e) ? is[e] : e;
  }
  n(Jr, "envelopeItemTypeToDataCategory");
  function Zr(e) {
    if (!e?.sdk) return;
    let { name: t, version: r } = e.sdk;
    return { name: t, version: r };
  }
  n(Zr, "getSdkMetadataForEnvelopeHeader");
  function ss(e, t, r, i) {
    let s = e.sdkProcessingMetadata?.dynamicSamplingContext;
    return {
      event_id: e.event_id,
      sent_at: new Date(X()).toISOString(),
      ...(t && { sdk: t }),
      ...(!!r && i && { dsn: Z(i) }),
      ...(s && { trace: s }),
    };
  }
  n(ss, "createEventEnvelopeHeaders");
  function Ap(e, t) {
    if (!t) return e;
    let r = e.sdk || {};
    return (
      (e.sdk = {
        ...r,
        name: r.name || t.name,
        version: r.version || t.version,
        integrations: [
          ...(e.sdk?.integrations || []),
          ...(t.integrations || []),
        ],
        packages: [...(e.sdk?.packages || []), ...(t.packages || [])],
        settings:
          e.sdk?.settings || t.settings
            ? { ...e.sdk?.settings, ...t.settings }
            : void 0,
      }),
      e
    );
  }
  n(Ap, "_enhanceEventWithSdkInfo");
  function as(e, t, r, i) {
    let s = Zr(r),
      a = {
        sent_at: new Date(X()).toISOString(),
        ...(s && { sdk: s }),
        ...(!!i && t && { dsn: Z(t) }),
      },
      c =
        "aggregates" in e
          ? [{ type: "sessions" }, e]
          : [{ type: "session" }, e.toJSON()];
    return j(a, [c]);
  }
  n(as, "createSessionEnvelope");
  function os(e, t, r, i) {
    let s = Zr(r),
      a = e.type && e.type !== "replay_event" ? e.type : "event";
    Ap(e, r?.sdk);
    let c = ss(e, s, i, t);
    return (delete e.sdkProcessingMetadata, j(c, [[{ type: a }, e]]));
  }
  n(os, "createEventEnvelope");
  function ps(e) {
    return e.getOptions().traceLifecycle === "stream";
  }
  n(ps, "hasSpanStreamingEnabled");
  function cs(e, t) {
    let {
      fingerprint: r,
      span: i,
      breadcrumbs: s,
      sdkProcessingMetadata: a,
    } = t;
    (Op(e, t), i && kp(e, i), Np(e, r), xp(e, s), Rp(e, a));
  }
  n(cs, "applyScopeDataToEvent");
  function ls(e, t) {
    let {
      extra: r,
      tags: i,
      attributes: s,
      user: a,
      contexts: c,
      level: o,
      sdkProcessingMetadata: p,
      breadcrumbs: l,
      fingerprint: g,
      eventProcessors: u,
      attachments: m,
      propagationContext: d,
      transactionName: b,
      span: h,
    } = t;
    (ut(e, "extra", r),
      ut(e, "tags", i),
      ut(e, "attributes", s),
      ut(e, "user", a),
      ut(e, "contexts", c),
      (e.sdkProcessingMetadata = ue(e.sdkProcessingMetadata, p, 2)),
      o && (e.level = o),
      b && (e.transactionName = b),
      h && (e.span = h),
      l.length && (e.breadcrumbs = [...e.breadcrumbs, ...l]),
      g.length && (e.fingerprint = [...e.fingerprint, ...g]),
      u.length && (e.eventProcessors = [...e.eventProcessors, ...u]),
      m.length && (e.attachments = [...e.attachments, ...m]),
      (e.propagationContext = { ...e.propagationContext, ...d }));
  }
  n(ls, "mergeScopeData");
  function ut(e, t, r) {
    e[t] = ue(e[t], r, 1);
  }
  n(ut, "mergeAndOverwriteScopeData");
  function jt(e, t) {
    let r = qt().getScopeData();
    return (e && ls(r, e.getScopeData()), t && ls(r, t.getScopeData()), r);
  }
  n(jt, "getCombinedScopeData");
  function Op(e, t) {
    let {
      extra: r,
      tags: i,
      user: s,
      contexts: a,
      level: c,
      transactionName: o,
    } = t;
    (Object.keys(r).length && (e.extra = { ...r, ...e.extra }),
      Object.keys(i).length && (e.tags = { ...i, ...e.tags }),
      Object.keys(s).length && (e.user = { ...s, ...e.user }),
      Object.keys(a).length && (e.contexts = { ...a, ...e.contexts }),
      c && (e.level = c),
      o && e.type !== "transaction" && (e.transaction = o));
  }
  n(Op, "applyDataToEvent");
  function xp(e, t) {
    let r = [...(e.breadcrumbs || []), ...t];
    e.breadcrumbs = r.length ? r : void 0;
  }
  n(xp, "applyBreadcrumbsToEvent");
  function Rp(e, t) {
    e.sdkProcessingMetadata = { ...e.sdkProcessingMetadata, ...t };
  }
  n(Rp, "applySdkMetadataToEvent");
  function kp(e, t) {
    ((e.contexts = { trace: zi(t), ...e.contexts }),
      (e.sdkProcessingMetadata = {
        dynamicSamplingContext: Zi(t),
        ...e.sdkProcessingMetadata,
      }));
    let r = ct(t),
      i = de(r).description;
    i && !e.transaction && e.type === "transaction" && (e.transaction = i);
  }
  n(kp, "applySpanToEvent");
  function Np(e, t) {
    ((e.fingerprint = e.fingerprint
      ? Array.isArray(e.fingerprint)
        ? e.fingerprint
        : [e.fingerprint]
      : []),
      t && (e.fingerprint = e.fingerprint.concat(t)),
      e.fingerprint.length || delete e.fingerprint);
  }
  n(Np, "applyFingerprintToEvent");
  var us = "url.full";
  function dt(e, t) {
    let r = e.attributes ?? (e.attributes = {});
    Object.entries(t).forEach(([i, s]) => {
      s != null && !(i in r) && (r[i] = s);
    });
  }
  n(dt, "safeSetSpanJSONAttributes");
  var en = 0,
    ds = 1,
    ms = 2;
  function ee(e) {
    return new gt((t) => {
      t(e);
    });
  }
  n(ee, "resolvedSyncPromise");
  function bt(e) {
    return new gt((t, r) => {
      r(e);
    });
  }
  n(bt, "rejectedSyncPromise");
  var mt = class mt {
    constructor(t) {
      ((this._state = en), (this._handlers = []), this._runExecutor(t));
    }
    then(t, r) {
      return new mt((i, s) => {
        (this._handlers.push([
          !1,
          (a) => {
            if (!t) i(a);
            else
              try {
                i(t(a));
              } catch (c) {
                s(c);
              }
          },
          (a) => {
            if (!r) s(a);
            else
              try {
                i(r(a));
              } catch (c) {
                s(c);
              }
          },
        ]),
          this._executeHandlers());
      });
    }
    catch(t) {
      return this.then((r) => r, t);
    }
    finally(t) {
      return new mt((r, i) => {
        let s, a;
        return this.then(
          (c) => {
            ((a = !1), (s = c), t && t());
          },
          (c) => {
            ((a = !0), (s = c), t && t());
          },
        ).then(() => {
          if (a) {
            i(s);
            return;
          }
          r(s);
        });
      });
    }
    _executeHandlers() {
      if (this._state === en) return;
      let t = this._handlers.slice();
      ((this._handlers = []),
        t.forEach((r) => {
          r[0] ||
            (this._state === ds && r[1](this._value),
            this._state === ms && r[2](this._value),
            (r[0] = !0));
        }));
    }
    _runExecutor(t) {
      let r = n((a, c) => {
          if (this._state === en) {
            if (V(c)) {
              c.then(i, s);
              return;
            }
            ((this._state = a), (this._value = c), this._executeHandlers());
          }
        }, "setResult"),
        i = n((a) => {
          r(ds, a);
        }, "resolve"),
        s = n((a) => {
          r(ms, a);
        }, "reject");
      try {
        t(i, s);
      } catch (a) {
        s(a);
      }
    }
  };
  n(mt, "SyncPromise");
  var gt = mt;
  function gs(e, t, r, i = 0) {
    try {
      let s = tn(t, r, e, i);
      return V(s) ? s : ee(s);
    } catch (s) {
      return bt(s);
    }
  }
  n(gs, "notifyEventProcessors");
  function tn(e, t, r, i) {
    let s = r[i];
    if (!e || !s) return e;
    let a = s({ ...e }, t);
    return (
      y &&
        a === null &&
        f.log(`Event processor "${s.id || "?"}" dropped event`),
      V(a) ? a.then((c) => tn(c, t, r, i + 1)) : tn(a, t, r, i + 1)
    );
  }
  n(tn, "_notifyEventProcessors");
  var Oe, bs, fs, me;
  function ys(e) {
    let t = _._sentryDebugIds,
      r = _._debugIds;
    if (!t && !r) return {};
    let i = t ? Object.keys(t) : [],
      s = r ? Object.keys(r) : [];
    if (me && i.length === bs && s.length === fs) return me;
    ((bs = i.length), (fs = s.length), (me = {}), Oe || (Oe = {}));
    let a = n((c, o) => {
      for (let p of c) {
        let l = o[p],
          g = Oe?.[p];
        if (g && me && l) ((me[g[0]] = l), Oe && (Oe[p] = [g[0], l]));
        else if (l) {
          let u = e(p);
          for (let m = u.length - 1; m >= 0; m--) {
            let b = u[m]?.filename;
            if (b && me && Oe) {
              ((me[b] = l), (Oe[p] = [b, l]));
              break;
            }
          }
        }
      }
    }, "processDebugIds");
    return (t && a(i, t), r && a(s, r), me);
  }
  n(ys, "getFilenameToDebugIdMap");
  function _s(e, t, r, i, s, a) {
    let { normalizeDepth: c = 3, normalizeMaxBreadth: o = 1e3 } = e,
      p = {
        ...t,
        event_id: t.event_id || r.event_id || O(),
        timestamp: t.timestamp || J(),
      },
      l = r.integrations || e.integrations.map((x) => x.name);
    (wp(p, e),
      Pp(p, l),
      s && s.emit("applyFrameMetadata", t),
      t.type === void 0 && Cp(p, e.stackParser));
    let g = Dp(i, r.captureContext);
    r.mechanism && D(p, r.mechanism);
    let u = s ? s.getEventProcessors() : [],
      m = jt(a, g),
      d = [...(r.attachments || []), ...m.attachments];
    (d.length && (r.attachments = d), cs(p, m));
    let b = [...u, ...m.eventProcessors];
    return (r.data && r.data.__sentry__ === !0 ? ee(p) : gs(b, p, r)).then(
      (x) => (x && Mp(x), typeof c == "number" && c > 0 ? Lp(x, c, o) : x),
    );
  }
  n(_s, "prepareEvent");
  function wp(e, t) {
    let { environment: r, release: i, dist: s, maxValueLength: a } = t;
    ((e.environment = e.environment || r || Ve),
      !e.release && i && (e.release = i),
      !e.dist && s && (e.dist = s));
    let c = e.request;
    (c?.url && a && (c.url = qe(c.url, a)),
      a &&
        e.exception?.values?.forEach((o) => {
          o.value && (o.value = qe(o.value, a));
        }));
  }
  n(wp, "applyClientOptions");
  function Cp(e, t) {
    let r = ys(t);
    e.exception?.values?.forEach((i) => {
      i.stacktrace?.frames?.forEach((s) => {
        s.filename && (s.debug_id = r[s.filename]);
      });
    });
  }
  n(Cp, "applyDebugIds");
  function Mp(e) {
    let t = {};
    if (
      (e.exception?.values?.forEach((i) => {
        i.stacktrace?.frames?.forEach((s) => {
          s.debug_id &&
            (s.abs_path
              ? (t[s.abs_path] = s.debug_id)
              : s.filename && (t[s.filename] = s.debug_id),
            delete s.debug_id);
        });
      }),
      Object.keys(t).length === 0)
    )
      return;
    ((e.debug_meta = e.debug_meta || {}),
      (e.debug_meta.images = e.debug_meta.images || []));
    let r = e.debug_meta.images;
    Object.entries(t).forEach(([i, s]) => {
      r.push({ type: "sourcemap", code_file: i, debug_id: s });
    });
  }
  n(Mp, "applyDebugMeta");
  function Pp(e, t) {
    t.length > 0 &&
      ((e.sdk = e.sdk || {}),
      (e.sdk.integrations = [...(e.sdk.integrations || []), ...t]));
  }
  n(Pp, "applyIntegrationsMetadata");
  function Lp(e, t, r) {
    if (!e) return null;
    let i = {
      ...e,
      ...(e.breadcrumbs && {
        breadcrumbs: e.breadcrumbs.map((s) => ({
          ...s,
          ...(s.data && { data: H(s.data, t, r) }),
        })),
      }),
      ...(e.user && { user: H(e.user, t, r) }),
      ...(e.contexts && { contexts: H(e.contexts, t, r) }),
      ...(e.extra && { extra: H(e.extra, t, r) }),
    };
    return (
      e.contexts?.trace &&
        i.contexts &&
        ((i.contexts.trace = e.contexts.trace),
        e.contexts.trace.data &&
          (i.contexts.trace.data = H(e.contexts.trace.data, t, r))),
      e.spans &&
        (i.spans = e.spans.map((s) => ({
          ...s,
          ...(s.data && { data: H(s.data, t, r) }),
        }))),
      e.contexts?.flags &&
        i.contexts &&
        (i.contexts.flags = H(e.contexts.flags, 3, r)),
      i
    );
  }
  n(Lp, "normalizeEvent");
  function Dp(e, t) {
    if (!t) return e;
    let r = e ? e.clone() : new F();
    return (r.update(t), r);
  }
  n(Dp, "getFinalScope");
  function hs(e) {
    if (e)
      return Up(e) ? { captureContext: e } : Bp(e) ? { captureContext: e } : e;
  }
  n(hs, "parseEventHintOrCaptureContext");
  function Up(e) {
    return e instanceof F || typeof e == "function";
  }
  n(Up, "hintIsScopeOrFunction");
  var Fp = [
    "user",
    "level",
    "extra",
    "contexts",
    "tags",
    "fingerprint",
    "propagationContext",
  ];
  function Bp(e) {
    return Object.keys(e).some((t) => Fp.includes(t));
  }
  n(Bp, "hintIsScopeContext");
  function ze(e, t) {
    return L().captureException(e, hs(t));
  }
  n(ze, "captureException");
  function ft(e, t) {
    return L().captureEvent(e, t);
  }
  n(ft, "captureEvent");
  function yt(e) {
    let t = B(),
      { user: r } = jt(t, L()),
      { userAgent: i } = _.navigator || {},
      s = Ai({ user: r, ...(i && { userAgent: i }), ...e }),
      a = t.getSession();
    return (
      a?.status === "ok" && ie(a, { status: "exited" }),
      Kt(),
      t.setSession(s),
      s
    );
  }
  n(yt, "startSession");
  function Kt() {
    let e = B(),
      r = L().getSession() || e.getSession();
    (r && Oi(r), Ss(), e.setSession());
  }
  n(Kt, "endSession");
  function Ss() {
    let e = B(),
      t = S(),
      r = e.getSession();
    r && t && t.captureSession(r);
  }
  n(Ss, "_sendSessionUpdate");
  function je(e = !1) {
    if (e) {
      Kt();
      return;
    }
    Ss();
  }
  n(je, "captureSession");
  function $t(e) {
    return (
      typeof e == "object" && typeof e.unref == "function" && e.unref(),
      e
    );
  }
  n($t, "safeUnref");
  var Gp = "7";
  function qp(e) {
    let t = e.protocol ? `${e.protocol}:` : "",
      r = e.port ? `:${e.port}` : "";
    return `${t}//${e.host}${r}${e.path ? `/${e.path}` : ""}/api/`;
  }
  n(qp, "getBaseApiEndpoint");
  function Hp(e) {
    return `${qp(e)}${e.projectId}/envelope/`;
  }
  n(Hp, "_getIngestEndpoint");
  function Yp(e, t) {
    let r = { sentry_version: Gp };
    return (
      e.publicKey && (r.sentry_key = e.publicKey),
      t && (r.sentry_client = `${t.name}/${t.version}`),
      new URLSearchParams(r).toString()
    );
  }
  n(Yp, "_encodedAuth");
  function Es(e, t, r) {
    return t || `${Hp(e)}?${Yp(e, r)}`;
  }
  n(Es, "getEnvelopeEndpointWithUrlEncodedAuth");
  var rn = [];
  function Wp(e) {
    let t = {};
    return (
      e.forEach((r) => {
        let { name: i } = r,
          s = t[i];
        (s && !s.isDefaultInstance && r.isDefaultInstance) || (t[i] = r);
      }),
      Object.values(t)
    );
  }
  n(Wp, "filterDuplicates");
  function nn(e) {
    let t = e.defaultIntegrations || [],
      r = e.integrations;
    t.forEach((s) => {
      s.isDefaultInstance = !0;
    });
    let i;
    if (Array.isArray(r)) i = [...t, ...r];
    else if (typeof r == "function") {
      let s = r(t);
      i = Array.isArray(s) ? s : [s];
    } else i = t;
    return Wp(i);
  }
  n(nn, "getIntegrationsToSetup");
  function Ts(e, t) {
    let r = {};
    return (
      t.forEach((i) => {
        i?.beforeSetup && i.beforeSetup(e);
      }),
      t.forEach((i) => {
        i && an(e, i, r);
      }),
      r
    );
  }
  n(Ts, "setupIntegrations");
  function sn(e, t) {
    for (let r of t) r?.afterAllSetup && r.afterAllSetup(e);
  }
  n(sn, "afterSetupIntegrations");
  function an(e, t, r) {
    if (r[t.name]) {
      y &&
        f.log(
          `Integration skipped because it was already installed: ${t.name}`,
        );
      return;
    }
    if (
      ((r[t.name] = t),
      !rn.includes(t.name) &&
        typeof t.setupOnce == "function" &&
        (t.setupOnce(), rn.push(t.name)),
      t.setup && typeof t.setup == "function" && t.setup(e),
      typeof t.preprocessEvent == "function")
    ) {
      let i = t.preprocessEvent.bind(t);
      e.on("preprocessEvent", (s, a) => i(s, a, e));
    }
    if (typeof t.processEvent == "function") {
      let i = t.processEvent.bind(t),
        s = Object.assign((a, c) => i(a, c, e), { id: t.name });
      e.addEventProcessor(s);
    }
    (["processSpan", "processSegmentSpan"].forEach((i) => {
      let s = t[i];
      typeof s == "function" && e.on(i, (a) => s.call(t, a, e));
    }),
      y && f.log(`Integration installed: ${t.name}`));
  }
  n(an, "setupIntegration");
  function on() {
    return (
      typeof __SENTRY_BROWSER_BUNDLE__ < "u" && !!__SENTRY_BROWSER_BUNDLE__
    );
  }
  n(on, "isBrowserBundle");
  function pn() {
    return "npm";
  }
  n(pn, "getSDKSource");
  function Is() {
    return (
      !on() &&
      Object.prototype.toString.call(typeof process < "u" ? process : 0) ===
        "[object process]"
    );
  }
  n(Is, "isNodeEnv");
  function Ke() {
    return typeof window < "u" && (!Is() || Vp());
  }
  n(Ke, "isBrowser");
  function Vp() {
    return _.process?.type === "renderer";
  }
  n(Vp, "isElectronNodeRenderer");
  function zp(e, t) {
    let r = t ? "auto" : "never";
    return [
      {
        type: "log",
        item_count: e.length,
        content_type: "application/vnd.sentry.items.log+json",
      },
      {
        version: 2,
        ...(Ke() && { ingest_settings: { infer_ip: r, infer_user_agent: r } }),
        items: e,
      },
    ];
  }
  n(zp, "createLogContainerEnvelopeItem");
  function As(e, t, r, i, s) {
    let a = {};
    return (
      t?.sdk && (a.sdk = { name: t.sdk.name, version: t.sdk.version }),
      r && i && (a.dsn = Z(i)),
      j(a, [zp(e, s)])
    );
  }
  n(As, "createLogEnvelope");
  function Os(e, t) {
    let r = t ?? jp(e) ?? [];
    if (r.length === 0) return;
    let i = e.getOptions(),
      s = As(
        r,
        i._metadata,
        i.tunnel,
        e.getDsn(),
        e.getDataCollectionOptions().userInfo,
      );
    (xs().set(e, []), e.emit("flushLogs"), e.sendEnvelope(s));
  }
  n(Os, "_INTERNAL_flushLogsBuffer");
  function jp(e) {
    return xs().get(e);
  }
  n(jp, "_INTERNAL_getLogBuffer");
  function xs() {
    return Y("clientToLogBufferMap", () => new WeakMap());
  }
  n(xs, "_getBufferMap");
  function Kp(e, t) {
    let r = t ? "auto" : "never";
    return [
      {
        type: "trace_metric",
        item_count: e.length,
        content_type: "application/vnd.sentry.items.trace-metric+json",
      },
      {
        version: 2,
        ...(Ke() && { ingest_settings: { infer_ip: r, infer_user_agent: r } }),
        items: e,
      },
    ];
  }
  n(Kp, "createMetricContainerEnvelopeItem");
  function Rs(e, t, r, i, s) {
    let a = {};
    return (
      t?.sdk && (a.sdk = { name: t.sdk.name, version: t.sdk.version }),
      r && i && (a.dsn = Z(i)),
      j(a, [Kp(e, s)])
    );
  }
  n(Rs, "createMetricEnvelope");
  function ks(e, t) {
    let r = t ?? $p(e) ?? [];
    if (r.length === 0) return;
    let i = e.getOptions(),
      s = Rs(
        r,
        i._metadata,
        i.tunnel,
        e.getDsn(),
        e.getDataCollectionOptions().userInfo,
      );
    (Ns().set(e, []), e.emit("flushMetrics"), e.sendEnvelope(s));
  }
  n(ks, "_INTERNAL_flushMetricsBuffer");
  function $p(e) {
    return Ns().get(e);
  }
  n($p, "_INTERNAL_getMetricBuffer");
  function Ns() {
    return Y("clientToMetricBufferMap", () => new WeakMap());
  }
  n(Ns, "_getBufferMap");
  function ws(e) {
    let t = {
      trace_id: e.trace_id,
      span_id: e.span_id,
      parent_span_id: e.parent_span_id,
      name: e.description || "",
      start_timestamp: e.start_timestamp,
      end_timestamp: e.timestamp || e.start_timestamp,
      status:
        !e.status || e.status === "ok" || e.status === "cancelled"
          ? "ok"
          : "error",
      is_segment: !1,
      attributes: { ...e.data },
      links: e.links,
    };
    return ji(t);
  }
  n(ws, "spanJsonToSerializedStreamedSpan");
  function Cs(e, t) {
    if (
      e.type !== "transaction" ||
      !e.spans?.length ||
      !e.sdkProcessingMetadata?.hasGenAiSpans ||
      t.getOptions().streamGenAiSpans === !1 ||
      ps(t)
    )
      return;
    let r = [],
      i = [];
    for (let a of e.spans)
      a.op?.startsWith("gen_ai.") ? r.push(ws(a)) : i.push(a);
    if (r.length === 0) return;
    e.spans = i;
    let s = t.getDataCollectionOptions().userInfo ? "auto" : "never";
    return [
      {
        type: "span",
        item_count: r.length,
        content_type: "application/vnd.sentry.items.span.v2+json",
      },
      {
        version: 2,
        ...(Ke() && { ingest_settings: { infer_ip: s, infer_user_agent: s } }),
        items: r,
      },
    ];
  }
  n(Cs, "extractGenAiSpansFromEvent");
  var $e = Symbol.for("SentryBufferFullError");
  function xe(e = 100) {
    let t = new Set();
    function r() {
      return t.size < e;
    }
    n(r, "isReady");
    function i(c) {
      t.delete(c);
    }
    n(i, "remove");
    function s(c) {
      if (!r()) return bt($e);
      let o = c();
      return (
        t.add(o),
        o.then(
          () => i(o),
          () => i(o),
        ),
        o
      );
    }
    n(s, "add");
    function a(c) {
      if (!t.size) return ee(!0);
      let o = Promise.allSettled(Array.from(t)).then(() => !0);
      if (!c) return o;
      let p = [o, new Promise((l) => $t(setTimeout(() => l(!1), c)))];
      return Promise.race(p);
    }
    return (
      n(a, "drain"),
      {
        get $() {
          return Array.from(t);
        },
        add: s,
        drain: a,
      }
    );
  }
  n(xe, "makePromiseBuffer");
  var Qp = 60 * 1e3;
  function Xp(e, t = X()) {
    let r = parseInt(`${e}`, 10);
    if (!isNaN(r)) return r * 1e3;
    let i = Date.parse(`${e}`);
    return isNaN(i) ? Qp : i - t;
  }
  n(Xp, "parseRetryAfterHeader");
  function Jp(e, t) {
    return e[t] || e.all || 0;
  }
  n(Jp, "disabledUntil");
  function Ms(e, t, r = X()) {
    return Jp(e, t) > r;
  }
  n(Ms, "isRateLimited");
  function Ps(e, { statusCode: t, headers: r }, i = X()) {
    let s = { ...e },
      a = r?.["x-sentry-rate-limits"],
      c = r?.["retry-after"];
    if (a)
      for (let o of a.trim().split(",")) {
        let [p, l, , , g] = o.split(":", 5),
          u = parseInt(p, 10),
          m = (isNaN(u) ? 60 : u) * 1e3;
        if (!l) s.all = i + m;
        else
          for (let d of l.split(";"))
            d === "metric_bucket"
              ? (!g || g.split(";").includes("custom")) && (s[d] = i + m)
              : (s[d] = i + m);
      }
    else c ? (s.all = i + Xp(c, i)) : t === 429 && (s.all = i + 60 * 1e3);
    return s;
  }
  n(Ps, "updateRateLimits");
  var ln = 64;
  function Qt(e, t, r = xe(e.bufferSize || ln)) {
    let i = {},
      s = n((c) => r.drain(c), "flush");
    function a(c) {
      let o = [];
      if (
        (zt(c, (u, m) => {
          let d = Jr(m);
          Ms(i, d) ? e.recordDroppedEvent("ratelimit_backoff", d) : o.push(u);
        }),
        o.length === 0)
      )
        return Promise.resolve({});
      let p = j(c[0], o),
        l = n((u) => {
          if (ts(p, ["client_report"])) {
            y &&
              f.warn(
                `Dropping client report. Will not send outcomes (reason: ${u}).`,
              );
            return;
          }
          zt(p, (m, d) => {
            e.recordDroppedEvent(u, Jr(d));
          });
        }, "recordEnvelopeLoss"),
        g = n(
          () =>
            t({ body: rs(p) }).then(
              (u) =>
                u.statusCode === 413
                  ? (y &&
                      f.error(
                        "Sentry responded with status code 413. Envelope was discarded due to exceeding size limits.",
                      ),
                    l("send_error"),
                    u)
                  : (y &&
                      u.statusCode !== void 0 &&
                      (u.statusCode < 200 || u.statusCode >= 300) &&
                      f.warn(
                        `Sentry responded with status code ${u.statusCode} to sent event.`,
                      ),
                    (i = Ps(i, u)),
                    u),
              (u) => {
                throw (
                  l("network_error"),
                  y &&
                    f.error("Encountered error running transport request:", u),
                  u
                );
              },
            ),
          "requestTask",
        );
      return r.add(g).then(
        (u) => u,
        (u) => {
          if (u === $e)
            return (
              y && f.error("Skipped sending event because buffer is full."),
              l("queue_overflow"),
              Promise.resolve({})
            );
          throw u;
        },
      );
    }
    return (n(a, "send"), { send: a, flush: s });
  }
  n(Qt, "createTransport");
  function Ls(e, t, r) {
    let i = [
      { type: "client_report" },
      { timestamp: r || J(), discarded_events: e },
    ];
    return j(t ? { dsn: t } : {}, [i]);
  }
  n(Ls, "createClientReportEnvelope");
  function Xt(e) {
    let t = [];
    e.message && t.push(e.message);
    try {
      let r = e.exception.values[e.exception.values.length - 1];
      r?.value && (t.push(r.value), r.type && t.push(`${r.type}: ${r.value}`));
    } catch {}
    return t;
  }
  n(Xt, "getPossibleEventMessages");
  function Ds(e) {
    let {
      trace_id: t,
      parent_span_id: r,
      span_id: i,
      status: s,
      origin: a,
      data: c,
      op: o,
    } = e.contexts?.trace ?? {};
    return {
      data: c ?? {},
      description: e.transaction,
      op: o,
      parent_span_id: r,
      span_id: i ?? "",
      start_timestamp: e.start_timestamp ?? 0,
      status: s,
      timestamp: e.timestamp,
      trace_id: t ?? "",
      origin: a,
      profile_id: c?.[Wt],
      exclusive_time: c?.[Vt],
      measurements: e.measurements,
      is_segment: !0,
    };
  }
  n(Ds, "convertTransactionEventToSpanJson");
  function Us(e) {
    return {
      type: "transaction",
      timestamp: e.timestamp,
      start_timestamp: e.start_timestamp,
      transaction: e.description,
      contexts: {
        trace: {
          trace_id: e.trace_id,
          span_id: e.span_id,
          parent_span_id: e.parent_span_id,
          op: e.op,
          status: e.status,
          origin: e.origin,
          data: {
            ...e.data,
            ...(e.profile_id && { [Wt]: e.profile_id }),
            ...(e.exclusive_time && { [Vt]: e.exclusive_time }),
          },
        },
      },
      measurements: e.measurements,
    };
  }
  n(Us, "convertSpanJsonToTransactionEvent");
  var _t = ["forwarded", "-ip", "remote-", "via", "-user"];
  function Fs(e) {
    return e === !0
      ? {
          userInfo: !0,
          cookies: !0,
          httpHeaders: { request: !0, response: !0 },
          httpBodies: [
            "incomingRequest",
            "outgoingRequest",
            "incomingResponse",
            "outgoingResponse",
          ],
          urlQueryParams: !0,
          graphQL: { document: !0, variables: !0 },
          genAI: { inputs: !0, outputs: !0 },
          databaseQueryData: !0,
          stackFrameVariables: !0,
          frameContextLines: 7,
        }
      : {
          userInfo: !1,
          cookies: { deny: _t },
          httpHeaders: { request: { deny: _t }, response: { deny: _t } },
          httpBodies: [],
          urlQueryParams: { deny: _t },
          graphQL: { document: !0, variables: !0 },
          genAI: { inputs: !1, outputs: !1 },
          databaseQueryData: !1,
          stackFrameVariables: !0,
          frameContextLines: 7,
        };
  }
  n(Fs, "defaultPiiToCollectionOptions");
  var Zp = {
    userInfo: !0,
    cookies: !0,
    httpHeaders: { request: !0, response: !0 },
    httpBodies: [
      "incomingRequest",
      "outgoingRequest",
      "incomingResponse",
      "outgoingResponse",
    ],
    urlQueryParams: !0,
    graphQL: { document: !0, variables: !0 },
    genAI: { inputs: !0, outputs: !0 },
    databaseQueryData: !0,
    stackFrameVariables: !0,
    frameContextLines: 5,
  };
  function Bs(e) {
    let t = e.dataCollection != null ? Zp : Fs(e.sendDefaultPii),
      r = e.dataCollection ?? {};
    return {
      userInfo: r.userInfo ?? t.userInfo,
      cookies: r.cookies ?? t.cookies,
      httpHeaders: {
        request: r.httpHeaders?.request ?? t.httpHeaders.request,
        response: r.httpHeaders?.response ?? t.httpHeaders.response,
      },
      httpBodies: r.httpBodies ?? t.httpBodies,
      urlQueryParams: r.urlQueryParams ?? r.queryParams ?? t.urlQueryParams,
      graphQL: {
        document: r.graphQL?.document ?? t.graphQL.document,
        variables: r.graphQL?.variables ?? t.graphQL.variables,
      },
      genAI: {
        inputs: r.genAI?.inputs ?? t.genAI.inputs,
        outputs: r.genAI?.outputs ?? t.genAI.outputs,
      },
      databaseQueryData: r.databaseQueryData ?? t.databaseQueryData,
      stackFrameVariables: r.stackFrameVariables ?? t.stackFrameVariables,
      frameContextLines: r.frameContextLines ?? t.frameContextLines,
    };
  }
  n(Bs, "resolveDataCollectionOptions");
  var Gs = "Not capturing exception because it's already been captured.",
    qs = "Discarded session because of missing or non-string release",
    js = Symbol.for("SentryInternalError"),
    Ks = Symbol.for("SentryDoNotSendEventError"),
    el = 5e3;
  function Jt(e) {
    return { message: e, [js]: !0 };
  }
  n(Jt, "_makeInternalError");
  function cn(e) {
    return { message: e, [Ks]: !0 };
  }
  n(cn, "_makeDoNotSendEventError");
  function Hs(e) {
    return ne(e) && js in e;
  }
  n(Hs, "_isInternalError");
  function Ys(e) {
    return ne(e) && Ks in e;
  }
  n(Ys, "_isDoNotSendEventError");
  function Ws(e, t, r, i, s) {
    let a = 0,
      c,
      o = !1;
    (e.on(r, () => {
      ((a = 0), clearTimeout(c), (o = !1));
    }),
      e.on(t, (p) => {
        if (((a += i(p)), a >= 8e5)) s(e);
        else if (!o) {
          let l = e.getOptions()._flushInterval ?? el;
          l > 0 &&
            ((o = !0),
            (c = $t(
              setTimeout(() => {
                s(e);
              }, l),
            )));
        }
      }),
      e.on("flush", () => {
        s(e);
      }));
  }
  n(Ws, "setupWeightBasedFlushing");
  var dn = class dn {
    constructor(t) {
      if (
        ((this._options = t),
        (this._integrations = {}),
        (this._numProcessing = 0),
        (this._outcomes = {}),
        (this._hooks = {}),
        (this._eventProcessors = []),
        (this._promiseBuffer = xe(t.transportOptions?.bufferSize ?? ln)),
        (this._dataCollection = Bs(t)),
        t.dsn
          ? (this._dsn = Gi(t.dsn))
          : y && f.warn("No DSN provided, client will not send events."),
        this._dsn)
      ) {
        let i = Es(this._dsn, t.tunnel, t._metadata ? t._metadata.sdk : void 0);
        this._transport = t.transport({
          tunnel: this._options.tunnel,
          recordDroppedEvent: this.recordDroppedEvent.bind(this),
          ...t.transportOptions,
          url: i,
        });
      }
      ((this._options.enableLogs =
        this._options.enableLogs ??
        this._options._experiments?.enableLogs ??
        !0),
        this._options.enableLogs &&
          Ws(this, "afterCaptureLog", "flushLogs", il, Os),
        (this._options.enableMetrics ??
          this._options._experiments?.enableMetrics ??
          !0) &&
          Ws(this, "afterCaptureMetric", "flushMetrics", nl, ks));
    }
    captureException(t, r, i) {
      let s = O();
      if (at(t)) return (y && f.log(Gs), s);
      let a = { event_id: s, ...r };
      return (
        this._process(
          () =>
            this.eventFromException(t, a)
              .then((c) => this._captureEvent(c, a, i))
              .then((c) => c),
          "error",
        ),
        a.event_id
      );
    }
    captureMessage(t, r, i, s) {
      let a = { event_id: O(), ...i },
        c = oe(t) ? t : String(t),
        o = W(t),
        p = o ? this.eventFromMessage(c, r, a) : this.eventFromException(t, a);
      return (
        this._process(
          () => p.then((l) => this._captureEvent(l, a, s)),
          o ? "unknown" : "error",
        ),
        a.event_id
      );
    }
    captureEvent(t, r, i) {
      let s = O();
      if (r?.originalException && at(r.originalException))
        return (y && f.log(Gs), s);
      let a = { event_id: s, ...r },
        c = t.sdkProcessingMetadata || {},
        o = c.capturedSpanScope,
        p = c.capturedSpanIsolationScope,
        l = Vs(t.type);
      return (
        this._process(() => this._captureEvent(t, a, o || i, p), l),
        a.event_id
      );
    }
    captureSession(t) {
      (this.sendSession(t), ie(t, { init: !1 }));
    }
    getDsn() {
      return this._dsn;
    }
    getOptions() {
      return this._options;
    }
    getDataCollectionOptions() {
      return this._dataCollection;
    }
    getSdkMetadata() {
      return this._options._metadata;
    }
    getTransport() {
      return this._transport;
    }
    async flush(t) {
      let r = this._transport;
      if ((this.emit("flush"), !r)) return !0;
      let i = await this._isClientDoneProcessing(t),
        s = await r.flush(t);
      return i && s;
    }
    async close(t) {
      let r = await this.flush(t);
      return ((this.getOptions().enabled = !1), this.emit("close"), r);
    }
    getEventProcessors() {
      return this._eventProcessors;
    }
    addEventProcessor(t) {
      this._eventProcessors.push(t);
    }
    init() {
      (this._isEnabled() ||
        this._options.integrations.some(({ name: t }) =>
          t.startsWith("Spotlight"),
        )) &&
        this._setupIntegrations();
    }
    getIntegrationByName(t) {
      return this._integrations[t];
    }
    getIntegrationNames() {
      return Object.keys(this._integrations);
    }
    addIntegration(t) {
      let r = this._integrations[t.name];
      (!r && t.beforeSetup && t.beforeSetup(this),
        an(this, t, this._integrations),
        r || sn(this, [t]));
    }
    sendEvent(t, r = {}) {
      this.emit("beforeSendEvent", t, r);
      let i = Cs(t, this),
        s = os(t, this._dsn, this._options._metadata, this._options.tunnel);
      for (let a of r.attachments || []) s = Xr(s, ns(a));
      (i && (s = Xr(s, i)),
        this.sendEnvelope(s).then((a) => this.emit("afterSendEvent", t, a)));
    }
    sendSession(t) {
      let { release: r, environment: i = Ve } = this._options;
      if ("aggregates" in t) {
        let a = t.attrs || {};
        if (!a.release && !r) {
          y && f.warn(qs);
          return;
        }
        ((a.release = a.release || r),
          (a.environment = a.environment || i),
          (t.attrs = a));
      } else {
        if (!t.release && !r) {
          y && f.warn(qs);
          return;
        }
        ((t.release = t.release || r), (t.environment = t.environment || i));
      }
      this.emit("beforeSendSession", t);
      let s = as(t, this._dsn, this._options._metadata, this._options.tunnel);
      this.sendEnvelope(s);
    }
    recordDroppedEvent(t, r, i = 1) {
      if (this._options.sendClientReports) {
        let s = `${t}:${r}`;
        (y && f.log(`Recording outcome: "${s}"${i > 1 ? ` (${i} times)` : ""}`),
          (this._outcomes[s] = (this._outcomes[s] || 0) + i));
      }
    }
    on(t, r) {
      let i = (this._hooks[t] = this._hooks[t] || new Set()),
        s = n((...a) => r(...a), "uniqueCallback");
      return (
        i.add(s),
        () => {
          i.delete(s);
        }
      );
    }
    emit(t, ...r) {
      let i = this._hooks[t];
      i && i.forEach((s) => s(...r));
    }
    async sendEnvelope(t) {
      if (
        (this.emit("beforeEnvelope", t), this._isEnabled() && this._transport)
      )
        try {
          return await this._transport.send(t);
        } catch (r) {
          return (y && f.error("Error while sending envelope:", r), {});
        }
      return (y && f.error("Transport disabled"), {});
    }
    registerCleanup(t) {}
    dispose() {}
    _setupIntegrations() {
      let { integrations: t } = this._options;
      ((this._integrations = Ts(this, t)), sn(this, t));
    }
    _updateSessionFromEvent(t, r) {
      let i = r.level === "fatal",
        s = !1,
        a = r.exception?.values;
      if (a) {
        ((s = !0), (i = !1));
        for (let p of a)
          if (p.mechanism?.handled === !1) {
            i = !0;
            break;
          }
      }
      let c = t.status === "ok";
      ((c && t.errors === 0) || (c && i)) &&
        (ie(t, {
          ...(i && { status: "crashed" }),
          errors: t.errors || Number(s || i),
        }),
        this.captureSession(t));
    }
    async _isClientDoneProcessing(t) {
      let r = 0;
      for (; !t || r < t; ) {
        if ((await new Promise((i) => setTimeout(i, 1)), !this._numProcessing))
          return !0;
        r++;
      }
      return !1;
    }
    _isEnabled() {
      return this.getOptions().enabled !== !1 && this._transport !== void 0;
    }
    _prepareEvent(t, r, i, s) {
      let a = this.getOptions(),
        c = this.getIntegrationNames();
      return (
        !r.integrations && c.length && (r.integrations = c),
        this.emit("preprocessEvent", t, r),
        t.type || s.setLastEventId(t.event_id || r.event_id),
        _s(a, t, r, i, this, s).then((o) => {
          if (o === null) return o;
          (this.emit("postprocessEvent", o, r),
            (o.contexts = {
              trace: { ...o.contexts?.trace, ...Yr(i) },
              ...o.contexts,
            }));
          let p = $r(this, i);
          return (
            (o.sdkProcessingMetadata = {
              dynamicSamplingContext: p,
              ...o.sdkProcessingMetadata,
            }),
            o
          );
        })
      );
    }
    _captureEvent(t, r = {}, i = L(), s = B()) {
      return (
        y &&
          un(t) &&
          f.log(`Captured error event \`${Xt(t)[0] || "<unknown>"}\``),
        this._processEvent(t, r, i, s).then(
          (a) => a.event_id,
          (a) => {
            y &&
              (Ys(a)
                ? f.log(a.message)
                : Hs(a)
                  ? f.warn(a.message)
                  : f.warn(a));
          },
        )
      );
    }
    _processEvent(t, r, i, s) {
      let a = this.getOptions(),
        { sampleRate: c } = a,
        o = $s(t),
        p = un(t),
        g = `before send for type \`${t.type || "error"}\``,
        u = typeof c > "u" ? void 0 : qi(c),
        m = Vs(t.type);
      return this._prepareEvent(t, r, i, s)
        .then((d) => {
          if (d === null)
            throw (
              this.recordDroppedEvent("event_processor", m),
              cn("An event processor returned `null`, will not send event.")
            );
          if (r.data?.__sentry__ === !0) return d;
          let h = rl(this, a, d, r);
          return tl(h, g);
        })
        .then((d) => {
          if (d === null) {
            if ((this.recordDroppedEvent("before_send", m), o)) {
              let x = 1 + (t.spans || []).length;
              this.recordDroppedEvent("before_send", "span", x);
            }
            throw cn(`${g} returned \`null\`, will not send event.`);
          }
          let b = i.getSession() || s.getSession();
          if (
            (p && b && this._updateSessionFromEvent(b, d),
            p && typeof u == "number" && Ee() > u)
          )
            throw (
              this.recordDroppedEvent("sample_rate", "error"),
              cn(
                `Discarding event because it's not included in the random sample (sampling rate = ${c})`,
              )
            );
          if (o) {
            let I = d.sdkProcessingMetadata?.spanCountBeforeProcessing || 0,
              x = d.spans ? d.spans.length : 0,
              et = I - x;
            et > 0 && this.recordDroppedEvent("before_send", "span", et);
          }
          let h = d.transaction_info;
          if (o && h && d.transaction !== t.transaction) {
            let I = "custom";
            d.transaction_info = { ...h, source: I };
          }
          return (this.sendEvent(d, r), d);
        })
        .then(null, (d) => {
          throw Ys(d) || Hs(d)
            ? d
            : (this.captureException(d, {
                mechanism: { handled: !1, type: "internal" },
                data: { __sentry__: !0 },
                originalException: d,
              }),
              Jt(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${d}`));
        });
    }
    _process(t, r) {
      (this._numProcessing++,
        this._promiseBuffer.add(t).then(
          (i) => (this._numProcessing--, i),
          (i) => (
            this._numProcessing--,
            i === $e && this.recordDroppedEvent("queue_overflow", r),
            i
          ),
        ));
    }
    _clearOutcomes() {
      let t = this._outcomes;
      return (
        (this._outcomes = {}),
        Object.entries(t).map(([r, i]) => {
          let [s, a] = r.split(":");
          return { reason: s, category: a, quantity: i };
        })
      );
    }
    _flushOutcomes() {
      y && f.log("Flushing outcomes...");
      let t = this._clearOutcomes();
      if (t.length === 0) {
        y && f.log("No outcomes to send");
        return;
      }
      if (!this._dsn) {
        y && f.log("No dsn provided, will not send outcomes");
        return;
      }
      y && f.log("Sending outcomes:", t);
      let r = Ls(t, this._options.tunnel && Z(this._dsn));
      this.sendEnvelope(r);
    }
  };
  n(dn, "Client");
  var ht = dn;
  function Vs(e) {
    return e === "replay_event" ? "replay" : e || "error";
  }
  n(Vs, "getDataCategoryByType");
  function tl(e, t) {
    let r = `${t} must return \`null\` or a valid event.`;
    if (V(e))
      return e.then(
        (i) => {
          if (!Q(i) && i !== null) throw Jt(r);
          return i;
        },
        (i) => {
          throw Jt(`${t} rejected with ${i}`);
        },
      );
    if (!Q(e) && e !== null) throw Jt(r);
    return e;
  }
  n(tl, "_validateBeforeSendResult");
  function rl(e, t, r, i) {
    let { beforeSend: s, beforeSendTransaction: a, ignoreSpans: c } = t,
      o = !es(t.beforeSendSpan) && t.beforeSendSpan,
      p = r;
    if (un(p) && s) return s(p, i);
    if ($s(p)) {
      if (o || c) {
        let l = Ds(p);
        if (
          c?.length &&
          Kr({ description: l.description, op: l.op, attributes: l.data }, c)
        )
          return null;
        if (o) {
          let g = o(l);
          g ? (p = ue(r, Us(g))) : zr();
        }
        if (p.spans) {
          let g = [],
            u = p.spans;
          for (let d of u) {
            if (
              c?.length &&
              Kr(
                { description: d.description, op: d.op, attributes: d.data },
                c,
              )
            ) {
              Qi(u, d);
              continue;
            }
            if (o) {
              let b = o(d);
              b ? g.push(b) : (zr(), g.push(d));
            } else g.push(d);
          }
          let m = p.spans.length - g.length;
          (m && e.recordDroppedEvent("before_send", "span", m), (p.spans = g));
        }
      }
      if (a) {
        if (p.spans) {
          let l = p.spans.length;
          p.sdkProcessingMetadata = {
            ...r.sdkProcessingMetadata,
            spanCountBeforeProcessing: l,
          };
        }
        return a(p, i);
      }
    }
    return p;
  }
  n(rl, "processBeforeSend");
  function un(e) {
    return e.type === void 0;
  }
  n(un, "isErrorEvent");
  function $s(e) {
    return e.type === "transaction";
  }
  n($s, "isTransactionEvent");
  function nl(e) {
    let t = 0;
    return (e.name && (t += e.name.length * 2), (t += 8), t + Qs(e.attributes));
  }
  n(nl, "estimateMetricSizeInBytes");
  function il(e) {
    let t = 0;
    return (e.message && (t += e.message.length * 2), t + Qs(e.attributes));
  }
  n(il, "estimateLogSizeInBytes");
  function Qs(e) {
    if (!e) return 0;
    let t = 0;
    return (
      Object.values(e).forEach((r) => {
        Array.isArray(r)
          ? (t += r.length * zs(r[0]))
          : W(r)
            ? (t += zs(r))
            : (t += 100);
      }),
      t
    );
  }
  n(Qs, "estimateAttributesSizeInBytes");
  function zs(e) {
    return typeof e == "string"
      ? e.length * 2
      : typeof e == "number"
        ? 8
        : typeof e == "boolean"
          ? 4
          : 0;
  }
  n(zs, "estimatePrimitiveSizeInBytes");
  function mn(e, t) {
    (t.debug === !0 &&
      (y
        ? f.enable()
        : G(() => {
            console.warn(
              "[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.",
            );
          })),
      L().update(t.initialScope));
    let i = new e(t);
    return (gn(i), i.init(), i);
  }
  n(mn, "initAndBind");
  function gn(e) {
    L().setClient(e);
  }
  n(gn, "setCurrentClient");
  function vt(e) {
    if (!e) return {};
    let t = e.match(
      /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/,
    );
    if (!t) return {};
    let r = t[6] || "",
      i = t[8] || "";
    return {
      host: t[4],
      path: t[5],
      protocol: t[2],
      search: r,
      hash: i,
      relative: t[5] + r + i,
    };
  }
  n(vt, "parseUrl");
  function bn(e, t = !0) {
    if (e.startsWith("data:")) {
      let r = e.match(/^data:([^;,]+)/),
        i = r ? r[1] : "text/plain",
        s = e.includes(";base64,"),
        a = e.indexOf(","),
        c = "";
      if (t && a !== -1) {
        let o = e.slice(a + 1);
        c = o.length > 10 ? `${o.slice(0, 10)}... [truncated]` : o;
      }
      return `data:${i}${s ? ",base64" : ""}${c ? `,${c}` : ""}`;
    }
    return e;
  }
  n(bn, "stripDataUrlContent");
  function fn(e) {
    "aggregates" in e
      ? e.attrs?.ip_address === void 0 &&
        (e.attrs = { ...e.attrs, ip_address: "{{auto}}" })
      : e.ipAddress === void 0 && (e.ipAddress = "{{auto}}");
  }
  n(fn, "addAutoIpAddressToSession");
  function yn(e, t, r = [t], i = "npm") {
    let s = ((e._metadata = e._metadata || {}).sdk = e._metadata.sdk || {});
    s.name ||
      ((s.name = `sentry.javascript.${t}`),
      (s.packages = r.map((a) => ({ name: `${i}:@sentry/${a}`, version: $ }))),
      (s.version = $));
  }
  n(yn, "applySdkMetadata");
  var sl = 100;
  function te(e, t) {
    let r = S(),
      i = B();
    if (!r) return;
    let { beforeBreadcrumb: s = null, maxBreadcrumbs: a = sl } = r.getOptions();
    if (a <= 0) return;
    let o = { timestamp: J(), ...e },
      p = s ? G(() => s(o, t)) : o;
    p !== null &&
      (r.emit && r.emit("beforeAddBreadcrumb", p, t), i.addBreadcrumb(p, a));
  }
  n(te, "addBreadcrumb");
  var al = "FunctionToString",
    Xs = new WeakMap(),
    ol = n(
      () => ({
        name: al,
        setupOnce() {
          let e = Function.prototype.toString;
          try {
            Function.prototype.toString = function (...t) {
              let r = le(this),
                i;
              try {
                Xs.has(S()) && r !== void 0 && (i = r);
              } catch {}
              return e.apply(i ?? this, t);
            };
          } catch {}
        },
        setup(e) {
          Xs.set(e, !0);
        },
      }),
      "_functionToStringIntegration",
    ),
    Zt = ol;
  var pl = [
      /^Script error\.?$/,
      /^Javascript error: Script error\.? on line 0$/,
      /^ResizeObserver loop completed with undelivered notifications.$/,
      /^Cannot redefine property: googletag$/,
      /^Can't find variable: gmo$/,
      /^undefined is not an object \(evaluating 'a\.[A-Z]'\)$/,
      /can't redefine non-configurable property "solana"/,
      /vv\(\)\.getRestrictions is not a function/,
      /Can't find variable: _AutofillCallbackHandler/,
      /Object Not Found Matching Id:\d+, MethodName:simulateEvent/,
      /^Java exception was raised during method invocation$/,
    ],
    ll = "EventFilters",
    _n = (e = {}) => {
      let t;
      return {
        name: ll,
        setup(r) {
          let i = r.getOptions();
          t = Js(e, i);
        },
        processEvent(r, i, s) {
          if (!t) {
            let a = s.getOptions();
            t = Js(e, a);
          }
          return cl(r, t) ? null : r;
        },
      };
    },
    tr = (e = {}) => ({ ..._n(e), name: "InboundFilters" });
  function Js(e = {}, t = {}) {
    return {
      allowUrls: [...(e.allowUrls || []), ...(t.allowUrls || [])],
      denyUrls: [...(e.denyUrls || []), ...(t.denyUrls || [])],
      ignoreErrors: [
        ...(e.ignoreErrors || []),
        ...(t.ignoreErrors || []),
        ...(e.disableErrorDefaults ? [] : pl),
      ],
      ignoreTransactions: [
        ...(e.ignoreTransactions || []),
        ...(t.ignoreTransactions || []),
      ],
    };
  }
  n(Js, "_mergeOptions");
  function cl(e, t) {
    if (e.type) {
      if (e.type === "transaction" && dl(e, t.ignoreTransactions))
        return (
          y &&
            f.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${z(e)}`),
          !0
        );
    } else {
      if (ul(e, t.ignoreErrors))
        return (
          y &&
            f.warn(`Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${z(e)}`),
          !0
        );
      if (fl(e))
        return (
          y &&
            f.warn(`Event dropped due to not having an error message, error type or stacktrace.
Event: ${z(e)}`),
          !0
        );
      if (ml(e, t.denyUrls))
        return (
          y &&
            f.warn(`Event dropped due to being matched by \`denyUrls\` option.
Event: ${z(e)}.
Url: ${er(e)}`),
          !0
        );
      if (!gl(e, t.allowUrls))
        return (
          y &&
            f.warn(`Event dropped due to not being matched by \`allowUrls\` option.
Event: ${z(e)}.
Url: ${er(e)}`),
          !0
        );
    }
    return !1;
  }
  n(cl, "_shouldDropEvent");
  function ul(e, t) {
    return t?.length ? Xt(e).some((r) => ce(r, t)) : !1;
  }
  n(ul, "_isIgnoredError");
  function dl(e, t) {
    if (!t?.length) return !1;
    let r = e.transaction;
    return r ? ce(r, t) : !1;
  }
  n(dl, "_isIgnoredTransaction");
  function ml(e, t) {
    if (!t?.length) return !1;
    let r = er(e);
    return r ? ce(r, t) : !1;
  }
  n(ml, "_isDeniedUrl");
  function gl(e, t) {
    if (!t?.length) return !0;
    let r = er(e);
    return r ? ce(r, t) : !0;
  }
  n(gl, "_isAllowedUrl");
  function bl(e = []) {
    for (let t = e.length - 1; t >= 0; t--) {
      let r = e[t];
      if (r && r.filename !== "<anonymous>" && r.filename !== "[native code]")
        return r.filename || null;
    }
    return null;
  }
  n(bl, "_getLastValidUrl");
  function er(e) {
    try {
      let r = [...(e.exception?.values ?? [])]
        .reverse()
        .find(
          (i) =>
            i.mechanism?.parent_id === void 0 && i.stacktrace?.frames?.length,
        )?.stacktrace?.frames;
      return r ? bl(r) : null;
    } catch {
      return (y && f.error(`Cannot extract url for event ${z(e)}`), null);
    }
  }
  n(er, "_getEventFilterUrl");
  function fl(e) {
    return e.exception?.values?.length
      ? !e.message &&
          !e.exception.values.some(
            (t) => t.stacktrace || (t.type && t.type !== "Error") || t.value,
          )
      : !1;
  }
  n(fl, "_isUselessError");
  function vn(e, t, r, i, s, a) {
    if (!s.exception?.values || !a || !N(a.originalException)) return;
    let c =
      s.exception.values.length > 0
        ? s.exception.values[s.exception.values.length - 1]
        : void 0;
    c &&
      (s.exception.values = hn(
        e,
        t,
        i,
        a.originalException,
        r,
        s.exception.values,
        c,
        0,
      ));
  }
  n(vn, "applyAggregateErrorsToEvent");
  function hn(e, t, r, i, s, a, c, o) {
    if (a.length >= r + 1) return a;
    let p = [...a];
    if (N(i[s])) {
      Zs(c, o, i);
      let l = e(t, i[s]),
        g = p.length;
      (ea(l, s, g, o), (p = hn(e, t, r, i[s], s, [l, ...p], l, g)));
    }
    return (
      ta(i) &&
        i.errors.forEach((l, g) => {
          if (N(l)) {
            Zs(c, o, i);
            let u = e(t, l),
              m = p.length;
            (ea(u, `errors[${g}]`, m, o),
              (p = hn(e, t, r, l, s, [u, ...p], u, m)));
          }
        }),
      p
    );
  }
  n(hn, "aggregateExceptionsFromError");
  function ta(e) {
    return Array.isArray(e.errors);
  }
  n(ta, "isExceptionGroup");
  function Zs(e, t, r) {
    e.mechanism = {
      handled: !0,
      type: "auto.core.linked_errors",
      ...(ta(r) && { is_exception_group: !0 }),
      ...e.mechanism,
      exception_id: t,
    };
  }
  n(Zs, "applyExceptionGroupFieldsForParentException");
  function ea(e, t, r, i) {
    e.mechanism = {
      handled: !0,
      ...e.mechanism,
      type: "chained",
      source: t,
      exception_id: r,
      parent_id: i,
    };
  }
  n(ea, "applyExceptionGroupFieldsForChildException");
  function yl(e) {
    return (
      N(e) &&
      "__sentry_fetch_url_host__" in e &&
      typeof e.__sentry_fetch_url_host__ == "string"
    );
  }
  n(yl, "hasSentryFetchUrlHost");
  function rr(e) {
    return yl(e) ? `${e.message} (${e.__sentry_fetch_url_host__})` : e.message;
  }
  n(rr, "_enhanceErrorWithSentryInfo");
  var ra = new Set([]);
  function St(e) {
    let t = "console",
      r = C(t, e);
    return (M(t, _l), r);
  }
  n(St, "addConsoleInstrumentationHandler");
  var na = new Set();
  function _l() {
    "console" in _ &&
      De.forEach(function (e) {
        na.has(e) ||
          !(e in _.console) ||
          (na.add(e),
          A(_.console, e, function (t) {
            return (
              (Se[e] = t),
              function (...r) {
                let i = r[0],
                  s = Se[e],
                  a = ra.size && typeof i == "string" && ce(i, ra);
                (a || R("console", { args: r, level: e }),
                  (!a || (y && f.isEnabled())) && s?.apply(_.console, r));
              }
            );
          }));
      });
  }
  n(_l, "instrumentConsole");
  function Qe(e) {
    return e === "warn"
      ? "warning"
      : ["fatal", "error", "warning", "log", "info", "debug"].includes(e)
        ? e
        : "log";
  }
  n(Qe, "severityLevelFromString");
  var hl = "CaptureConsole",
    vl = n((e = {}) => {
      let t = e.levels || De,
        r = e.handled ?? !0;
      return {
        name: hl,
        setup(i) {
          "console" in _ &&
            St(({ args: s, level: a }) => {
              S() !== i || !t.includes(a) || Sl(s, a, r);
            });
        },
      };
    }, "_captureConsoleIntegration"),
    nr = vl;
  function Sl(e, t, r) {
    let i = Qe(t),
      s = new Error(),
      a = { level: Qe(t), extra: { arguments: e } };
    Ye((c) => {
      if (
        (c.addEventProcessor(
          (l) => (
            (l.logger = "console"),
            D(l, { handled: r, type: "auto.core.capture_console" }),
            l
          ),
        ),
        t === "assert")
      ) {
        if (!e[0]) {
          let l = `Assertion failed: ${Te(e.slice(1), " ") || "console.assert"}`;
          (c.setExtra("arguments", e.slice(1)),
            c.captureMessage(l, i, {
              captureContext: a,
              syntheticException: s,
            }));
        }
        return;
      }
      let o = e.find((l) => l instanceof Error);
      if (o) {
        ze(o, a);
        return;
      }
      let p = Te(e, " ");
      c.captureMessage(p, i, { captureContext: a, syntheticException: s });
    });
  }
  n(Sl, "consoleHandler");
  var El = "Dedupe",
    Tl = n(() => {
      let e;
      return {
        name: El,
        processEvent(t) {
          if (t.type) return t;
          try {
            if (Il(t, e))
              return (
                y &&
                  f.warn(
                    "Event dropped due to being a duplicate of previously captured event.",
                  ),
                null
              );
          } catch {}
          return (e = t);
        },
      };
    }, "_dedupeIntegration"),
    ir = Tl;
  function Il(e, t) {
    return t ? !!(Al(e, t) || Ol(e, t)) : !1;
  }
  n(Il, "_shouldDropEvent");
  function Al(e, t) {
    let r = e.message,
      i = t.message;
    return !(
      (!r && !i) ||
      (r && !i) ||
      (!r && i) ||
      r !== i ||
      !aa(e, t) ||
      !sa(e, t)
    );
  }
  n(Al, "_isSameMessageEvent");
  function Ol(e, t) {
    let r = ia(t),
      i = ia(e);
    return !(
      !r ||
      !i ||
      r.type !== i.type ||
      r.value !== i.value ||
      !aa(e, t) ||
      !sa(e, t)
    );
  }
  n(Ol, "_isSameExceptionEvent");
  function sa(e, t) {
    let r = Mt(e),
      i = Mt(t);
    if (!r && !i) return !0;
    if ((r && !i) || (!r && i) || ((r = r), (i = i), i.length !== r.length))
      return !1;
    for (let s = 0; s < i.length; s++) {
      let a = i[s],
        c = r[s];
      if (
        a.filename !== c.filename ||
        a.lineno !== c.lineno ||
        a.colno !== c.colno ||
        a.function !== c.function
      )
        return !1;
    }
    return !0;
  }
  n(sa, "_isSameStacktrace");
  function aa(e, t) {
    let r = e.fingerprint,
      i = t.fingerprint;
    if (!r && !i) return !0;
    if ((r && !i) || (!r && i)) return !1;
    ((r = r), (i = i));
    try {
      return r.join("") === i.join("");
    } catch {
      return !1;
    }
  }
  n(aa, "_isSameFingerprint");
  function ia(e) {
    return e.exception?.values?.[0];
  }
  n(ia, "_getExceptionFromEvent");
  var xl = "ConversationId",
    Rl = n(
      () => ({
        name: xl,
        setup(e) {
          e.on("spanStart", (t) => {
            let r = L().getScopeData(),
              i = B().getScopeData(),
              s = r.conversationId || i.conversationId;
            if (s) {
              let { op: a, data: c, description: o } = de(t);
              if (
                !a?.startsWith("gen_ai.") &&
                !c["ai.operationId"] &&
                !o?.startsWith("ai.")
              )
                return;
              t.setAttribute(Vr, s);
            }
          });
        },
      }),
      "_conversationIdIntegration",
    ),
    Sn = Rl;
  function sr(e) {
    if (e !== void 0)
      return e >= 400 && e < 500 ? "warning" : e >= 500 ? "error" : void 0;
  }
  n(sr, "getBreadcrumbLogLevelFromHttpStatusCode");
  var Et = _;
  function En() {
    return "history" in Et && !!Et.history;
  }
  n(En, "supportsHistory");
  function kl() {
    if (!("fetch" in Et)) return !1;
    try {
      return (new Headers(), new Request("data:,"), new Response(), !0);
    } catch {
      return !1;
    }
  }
  n(kl, "_isFetchSupported");
  function Tt(e) {
    return (
      e && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e.toString())
    );
  }
  n(Tt, "isNativeFunction");
  function Tn() {
    if (typeof EdgeRuntime == "string") return !0;
    if (!kl()) return !1;
    if (Tt(Et.fetch)) return !0;
    let e = !1,
      t = Et.document;
    if (t && typeof t.createElement == "function")
      try {
        let r = t.createElement("iframe");
        ((r.hidden = !0),
          t.head.appendChild(r),
          r.contentWindow?.fetch && (e = Tt(r.contentWindow.fetch)),
          t.head.removeChild(r));
      } catch (r) {
        y &&
          f.warn(
            "Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ",
            r,
          );
      }
    return e;
  }
  n(Tn, "supportsNativeFetch");
  function In(e, t) {
    let r = "fetch",
      i = C(r, e);
    return (M(r, () => Nl(void 0, t)), i);
  }
  n(In, "addFetchInstrumentationHandler");
  function Nl(e, t = !1) {
    (t && !Tn()) ||
      A(_, "fetch", function (r) {
        return function (...i) {
          let s = new Error(),
            { method: a, url: c } = wl(i),
            o = {
              args: i,
              fetchData: { method: a, url: c },
              startTimestamp: U() * 1e3,
              virtualError: s,
              headers: Cl(i),
            };
          return (
            e || R("fetch", { ...o }),
            r.apply(_, i).then(
              async (p) => (
                e
                  ? e(p)
                  : R("fetch", { ...o, endTimestamp: U() * 1e3, response: p }),
                p
              ),
              (p) => {
                (R("fetch", { ...o, endTimestamp: U() * 1e3, error: p }),
                  N(p) &&
                    p.stack === void 0 &&
                    ((p.stack = s.stack), P(p, "framesToPop", 1)));
                let g = S()?.getOptions().enhanceFetchErrorMessages ?? "always";
                if (
                  g !== !1 &&
                  N(p) &&
                  p.name === "TypeError" &&
                  (p.message === "Failed to fetch" ||
                    p.message === "Load failed" ||
                    p.message ===
                      "NetworkError when attempting to fetch resource.")
                )
                  try {
                    let d = new URL(o.fetchData.url).host;
                    g === "always"
                      ? (p.message = `${p.message} (${d})`)
                      : P(p, "__sentry_fetch_url_host__", d);
                  } catch {}
                throw p;
              },
            )
          );
        };
      });
  }
  n(Nl, "instrumentFetch");
  function ar(e, t) {
    return ne(e) && !!e[t];
  }
  n(ar, "hasProp");
  function oa(e) {
    return typeof e == "string"
      ? e
      : e
        ? ar(e, "url")
          ? e.url
          : e.toString
            ? e.toString()
            : ""
        : "";
  }
  n(oa, "getUrlFromResource");
  function wl(e) {
    if (e.length === 0) return { method: "GET", url: "" };
    if (e.length === 2) {
      let [r, i] = e;
      return {
        url: oa(r),
        method: ar(i, "method")
          ? String(i.method).toUpperCase()
          : Rr(r) && ar(r, "method")
            ? String(r.method).toUpperCase()
            : "GET",
      };
    }
    let t = e[0];
    return {
      url: oa(t),
      method: ar(t, "method") ? String(t.method).toUpperCase() : "GET",
    };
  }
  n(wl, "parseFetchArgs");
  function Cl(e) {
    let [t, r] = e;
    try {
      if (typeof r == "object" && r !== null && "headers" in r && r.headers)
        return new Headers(r.headers);
      if (Rr(t)) return new Headers(t.headers);
    } catch {}
  }
  n(Cl, "getHeadersFromFetchArgs");
  var pa = _;
  function Re() {
    try {
      return pa.document.location.href;
    } catch {
      return "";
    }
  }
  n(Re, "getLocationHref");
  function An(e, t = 5) {
    if (!pa.HTMLElement) return null;
    let r = e;
    for (let i = 0; i < t; i++) {
      if (!r) return null;
      if (r instanceof HTMLElement) {
        if (r.dataset.sentryComponent) return r.dataset.sentryComponent;
        if (r.dataset.sentryElement) return r.dataset.sentryElement;
      }
      r = r.parentNode;
    }
    return null;
  }
  n(An, "getComponentName");
  var v = _,
    On = 0;
  function xn() {
    return On > 0;
  }
  n(xn, "shouldIgnoreOnError");
  function nc() {
    (On++,
      setTimeout(() => {
        On--;
      }));
  }
  n(nc, "ignoreNextOnError");
  function Ne(e, t = {}) {
    function r(s) {
      return typeof s == "function";
    }
    if ((n(r, "isFunction"), !r(e))) return e;
    try {
      if (Object.prototype.hasOwnProperty.call(e, "__sentry_wrapped__")) {
        let a = e.__sentry_wrapped__;
        return typeof a == "function" ? a : e;
      }
      if (le(e)) return e;
    } catch {
      return e;
    }
    let i = n(function (...s) {
      _._sentryWrappedDepth = (_._sentryWrappedDepth || 0) + 1;
      try {
        let a = s.map((c) => Ne(c, t));
        return e.apply(this, a);
      } catch (a) {
        throw (
          nc(),
          Ye((c) => {
            (c.addEventProcessor(
              (o) => (
                t.mechanism && (Ae(o, void 0, void 0), D(o, t.mechanism)),
                (o.extra = { ...o.extra, arguments: s }),
                o
              ),
            ),
              ze(a));
          }),
          a
        );
      } finally {
        _._sentryWrappedDepth = (_._sentryWrappedDepth || 0) - 1;
      }
    }, "sentryWrapped");
    try {
      for (let s in e)
        Object.prototype.hasOwnProperty.call(e, s) && (i[s] = e[s]);
    } catch {}
    (it(i, e), P(e, "__sentry_wrapped__", i));
    try {
      Object.getOwnPropertyDescriptor(i, "name").configurable &&
        Object.defineProperty(i, "name", {
          get() {
            return e.name;
          },
        });
    } catch {}
    return i;
  }
  n(Ne, "wrap");
  function Rn() {
    let e = Re(),
      { referrer: t } = v.document || {},
      { userAgent: r } = v.navigator || {},
      i = { ...(t && { Referer: t }), ...(r && { "User-Agent": r }) };
    return { url: e, headers: i };
  }
  n(Rn, "getHttpRequestData");
  function or(e, t) {
    let r = pr(e, t),
      i = { type: pc(t), value: lc(t) };
    return (
      r.length && (i.stacktrace = { frames: r }),
      i.type === void 0 &&
        i.value === "" &&
        (i.value = "Unrecoverable error caught"),
      i
    );
  }
  n(or, "exceptionFromError");
  function ic(e, t, r, i) {
    let a = S()?.getOptions().normalizeDepth,
      c = dc(t),
      o = { __serialized__: Ut(t, a) };
    if (c) return { exception: { values: [or(e, c)] }, extra: o };
    let p = {
      exception: {
        values: [
          {
            type: pe(t)
              ? t.constructor.name
              : i
                ? "UnhandledRejection"
                : "Error",
            value: cc(t, { isUnhandledRejection: i }),
          },
        ],
      },
      extra: o,
    };
    if (r) {
      let l = pr(e, r);
      l.length && (p.exception.values[0].stacktrace = { frames: l });
    }
    return p;
  }
  n(ic, "eventFromPlainObject");
  function kn(e, t) {
    return { exception: { values: [or(e, t)] } };
  }
  n(kn, "eventFromError");
  function pr(e, t) {
    let r = t.stacktrace || t.stack || "",
      i = ac(t),
      s = oc(t);
    try {
      return e(r, i, s);
    } catch {}
    return [];
  }
  n(pr, "parseStackFrames");
  var sc = /Minified React error #\d+;/i;
  function ac(e) {
    return e && sc.test(e.message) ? 1 : 0;
  }
  n(ac, "getSkipFirstStackStringLines");
  function oc(e) {
    return typeof e.framesToPop == "number" ? e.framesToPop : 0;
  }
  n(oc, "getPopFirstTopFrames");
  function la(e) {
    return typeof WebAssembly < "u" && typeof WebAssembly.Exception < "u"
      ? e instanceof WebAssembly.Exception
      : !1;
  }
  n(la, "isWebAssemblyException");
  function pc(e) {
    let t = e?.name;
    return !t && la(e)
      ? e.message && Array.isArray(e.message) && e.message.length == 2
        ? e.message[0]
        : "WebAssembly.Exception"
      : t;
  }
  n(pc, "extractType");
  function lc(e) {
    let t = e?.message;
    return la(e)
      ? Array.isArray(e.message) && e.message.length == 2
        ? e.message[1]
        : "wasm exception"
      : t
        ? t.error && typeof t.error.message == "string"
          ? rr(t.error)
          : rr(e)
        : "No error message";
  }
  n(lc, "extractMessage");
  function ca(e, t, r, i) {
    let s = r?.syntheticException || void 0,
      a = lr(e, t, s, i);
    return (
      D(a),
      (a.level = "error"),
      r?.event_id && (a.event_id = r.event_id),
      ee(a)
    );
  }
  n(ca, "eventFromException");
  function ua(e, t, r = "info", i, s) {
    let a = i?.syntheticException || void 0,
      c = Nn(e, t, a, s);
    return ((c.level = r), i?.event_id && (c.event_id = i.event_id), ee(c));
  }
  n(ua, "eventFromMessage");
  function lr(e, t, r, i, s) {
    let a;
    if (Fe(t) && t.error) return kn(e, t.error);
    if (rt(t) || Pt(t)) {
      let c = t;
      if ("stack" in t) {
        a = kn(e, t);
        let o = a.exception?.values?.[0];
        if (i && r && o && !o.stacktrace) {
          let p = pr(e, r);
          p.length && ((o.stacktrace = { frames: p }), D(a, { synthetic: !0 }));
        }
      } else {
        let o = c.name || (rt(c) ? "DOMError" : "DOMException"),
          p = c.message ? `${o}: ${c.message}` : o;
        ((a = Nn(e, p, r, i)), Ae(a, p));
      }
      return (
        "code" in c &&
          (a.tags = { ...a.tags, "DOMException.code": `${c.code}` }),
        a
      );
    }
    return N(t)
      ? kn(e, t)
      : Q(t) || pe(t)
        ? ((a = ic(e, t, r, s)), D(a, { synthetic: !0 }), a)
        : ((a = Nn(e, t, r, i)),
          Ae(a, `${t}`, void 0),
          D(a, { synthetic: !0 }),
          a);
  }
  n(lr, "eventFromUnknownInput");
  function Nn(e, t, r, i) {
    let s = {};
    if (i && r) {
      let a = pr(e, r);
      (a.length &&
        (s.exception = { values: [{ value: t, stacktrace: { frames: a } }] }),
        D(s, { synthetic: !0 }));
    }
    if (oe(t)) {
      let { __sentry_template_string__: a, __sentry_template_values__: c } = t;
      return ((s.logentry = { message: a, params: c }), s);
    }
    return ((s.message = t), s);
  }
  n(Nn, "eventFromString");
  function cc(e, { isUnhandledRejection: t }) {
    let r = Dt(e),
      i = t ? "promise rejection" : "exception";
    return Fe(e)
      ? `Event \`ErrorEvent\` captured as ${i} with message \`${e.message}\``
      : pe(e)
        ? `Event \`${uc(e)}\` (type=${e.type}) captured as ${i}`
        : `Object captured as ${i} with keys: ${r}`;
  }
  n(cc, "getNonErrorObjectExceptionValue");
  function uc(e) {
    try {
      let t = Object.getPrototypeOf(e);
      return t ? t.constructor.name : void 0;
    } catch {}
  }
  n(uc, "getObjectClassName");
  function dc(e) {
    return Object.values(e).find(N);
  }
  n(dc, "getErrorPropertyFromObject");
  var wn = class wn extends ht {
    constructor(t) {
      let r = mc(t),
        i = v.SENTRY_SDK_SOURCE || pn();
      (yn(r, "browser", ["browser"], i), super(r));
      let { userInfo: s } = this.getDataCollectionOptions();
      r._metadata?.sdk &&
        (r._metadata.sdk.settings = {
          infer_ip: s ? "auto" : "never",
          ...r._metadata.sdk.settings,
        });
      let { sendClientReports: a } = this._options;
      (v.document &&
        v.document.addEventListener("visibilitychange", () => {
          v.document.visibilityState === "hidden" &&
            (a && this._flushOutcomes(),
            queueMicrotask(() => {
              this.flush();
            }));
        }),
        s && this.on("beforeSendSession", fn));
    }
    eventFromException(t, r) {
      return ca(
        this._options.stackParser,
        t,
        r,
        this._options.attachStacktrace,
      );
    }
    eventFromMessage(t, r = "info", i) {
      return ua(
        this._options.stackParser,
        t,
        r,
        i,
        this._options.attachStacktrace,
      );
    }
    _prepareEvent(t, r, i, s) {
      return (
        (t.platform = t.platform || "javascript"),
        super._prepareEvent(t, r, i, s)
      );
    }
  };
  n(wn, "BrowserClient");
  var cr = wn;
  function mc(e) {
    return {
      release:
        typeof __SENTRY_RELEASE__ == "string"
          ? __SENTRY_RELEASE__
          : v.SENTRY_RELEASE?.id,
      sendClientReports: !0,
      parentSpanIsAlwaysRootSpan: !0,
      ...e,
    };
  }
  n(mc, "applyDefaultOptions");
  var da = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__;
  var E = _;
  function Cn(e, t, r) {
    E.document && E.addEventListener(e, t, r);
  }
  n(Cn, "addPageListener");
  function Mn(e, t, r) {
    E.document && E.removeEventListener(e, t, r);
  }
  n(Mn, "removePageListener");
  var ma = n((e) => {
    let t = !1;
    return () => {
      t || (e(), (t = !0));
    };
  }, "runOnce");
  var Pn = n((e) => {
    let t = E.requestIdleCallback || E.setTimeout;
    E.document?.visibilityState === "hidden"
      ? e()
      : ((e = ma(e)),
        Cn("visibilitychange", e, { once: !0, capture: !0 }),
        Cn("pagehide", e, { once: !0, capture: !0 }),
        t(() => {
          (e(),
            Mn("visibilitychange", e, { capture: !0 }),
            Mn("pagehide", e, { capture: !0 }));
        }));
  }, "whenIdleOrHidden");
  var gc = 80,
    we = {};
  try {
    (typeof Node < "u" &&
      (we.parentNode = Object.getOwnPropertyDescriptor(
        Node.prototype,
        "parentNode",
      ).get),
      typeof Element < "u" &&
        ((we.tagName = Object.getOwnPropertyDescriptor(
          Element.prototype,
          "tagName",
        ).get),
        (we.id = Object.getOwnPropertyDescriptor(Element.prototype, "id").get),
        (we.className = Object.getOwnPropertyDescriptor(
          Element.prototype,
          "className",
        ).get),
        (we.getAttribute = Element.prototype.getAttribute)),
      typeof HTMLElement < "u" &&
        (we.dataset = Object.getOwnPropertyDescriptor(
          HTMLElement.prototype,
          "dataset",
        ).get));
  } catch {}
  function be(e, t, r) {
    let i = we[t];
    if (i)
      try {
        return i.call(e, r);
      } catch {}
    let s = e[t];
    return typeof s == "function" ? s.call(e, r) : s;
  }
  n(be, "_safeRead");
  function It(e, t = {}) {
    if (!e) return "<unknown>";
    try {
      let r = e,
        i = 5,
        s = [],
        a = 0,
        c = 0,
        o = " > ",
        p = o.length,
        l,
        g = Array.isArray(t) ? t : t.keyAttrs,
        u = (!Array.isArray(t) && t.maxStringLength) || gc;
      for (
        ;
        r &&
        a++ < i &&
        ((l = bc(r, g)),
        !(l === "html" || (a > 1 && c + s.length * p + l.length >= u)));
      )
        (s.push(l), (c += l.length), (r = be(r, "parentNode")));
      return s.reverse().join(o);
    } catch {
      return "<unknown>";
    }
  }
  n(It, "htmlTreeAsString");
  function bc(e, t) {
    let r = [],
      i = be(e, "tagName");
    if (!i) return "";
    if (typeof HTMLElement < "u" && e instanceof HTMLElement) {
      let a = be(e, "dataset");
      if (a) {
        if (a.sentryComponent) return a.sentryComponent;
        if (a.sentryElement) return a.sentryElement;
      }
    }
    r.push(i.toLowerCase());
    let s = t?.length
      ? t
          .filter((a) => be(e, "getAttribute", a))
          .map((a) => [a, be(e, "getAttribute", a)])
      : null;
    if (s?.length)
      s.forEach((a) => {
        r.push(`[${a[0]}="${a[1]}"]`);
      });
    else {
      let a = be(e, "id");
      a && r.push(`#${a}`);
      let c = be(e, "className");
      if (c && w(c)) {
        let o = c.split(/\s+/);
        for (let p of o) r.push(`.${p}`);
      }
    }
    for (let a of ["aria-label", "type", "name", "title", "alt"]) {
      let c = be(e, "getAttribute", a);
      c && r.push(`[${a}="${c}"]`);
    }
    return r.join("");
  }
  n(bc, "_htmlElementAsString");
  var fc = 1e3,
    ga,
    Ln,
    Dn;
  function Un(e) {
    (C("dom", e), M("dom", yc));
  }
  n(Un, "addClickKeypressInstrumentationHandler");
  function yc() {
    if (!E.document) return;
    let e = R.bind(null, "dom"),
      t = ba(e, !0);
    (E.document.addEventListener("click", t, !1),
      E.document.addEventListener("keypress", t, !1),
      ["EventTarget", "Node"].forEach((r) => {
        let s = E[r]?.prototype;
        s?.hasOwnProperty?.("addEventListener") &&
          (A(s, "addEventListener", function (a) {
            return function (c, o, p) {
              if (c === "click" || c == "keypress")
                try {
                  let l = (this.__sentry_instrumentation_handlers__ =
                      this.__sentry_instrumentation_handlers__ || {}),
                    g = (l[c] = l[c] || { refCount: 0 });
                  if (!g.handler) {
                    let u = ba(e);
                    ((g.handler = u), a.call(this, c, u, p));
                  }
                  g.refCount++;
                } catch {}
              return a.call(this, c, o, p);
            };
          }),
          A(s, "removeEventListener", function (a) {
            return function (c, o, p) {
              if (c === "click" || c == "keypress")
                try {
                  let l = this.__sentry_instrumentation_handlers__ || {},
                    g = l[c];
                  g &&
                    (g.refCount--,
                    g.refCount <= 0 &&
                      (a.call(this, c, g.handler, p),
                      (g.handler = void 0),
                      delete l[c]),
                    Object.keys(l).length === 0 &&
                      delete this.__sentry_instrumentation_handlers__);
                } catch {}
              return a.call(this, c, o, p);
            };
          }));
      }));
  }
  n(yc, "instrumentDOM");
  function _c(e) {
    if (e.type !== Ln) return !1;
    try {
      if (!e.target || e.target._sentryId !== Dn) return !1;
    } catch {}
    return !0;
  }
  n(_c, "isSimilarToLastCapturedEvent");
  function hc(e, t) {
    return e !== "keypress"
      ? !1
      : t?.tagName
        ? !(
            t.tagName === "INPUT" ||
            t.tagName === "TEXTAREA" ||
            t.isContentEditable
          )
        : !0;
  }
  n(hc, "shouldSkipDOMEvent");
  function ba(e, t = !1) {
    return (r) => {
      if (!r || r._sentryCaptured) return;
      let i = vc(r);
      if (hc(r.type, i)) return;
      (P(r, "_sentryCaptured", !0),
        i && !i._sentryId && P(i, "_sentryId", O()));
      let s = r.type === "keypress" ? "input" : r.type;
      (_c(r) ||
        (e({ event: r, name: s, global: t }),
        (Ln = r.type),
        (Dn = i ? i._sentryId : void 0)),
        clearTimeout(ga),
        (ga = E.setTimeout(() => {
          ((Dn = void 0), (Ln = void 0));
        }, fc)));
    };
  }
  n(ba, "makeDOMEventHandler");
  function vc(e) {
    try {
      return e.target;
    } catch {
      return null;
    }
  }
  n(vc, "getEventTarget");
  var ur;
  function At(e) {
    let t = "history";
    (C(t, e), M(t, Sc));
  }
  n(At, "addHistoryInstrumentationHandler");
  function Sc() {
    if (
      (E.addEventListener("popstate", () => {
        let t = E.location.href,
          r = ur;
        if (((ur = t), r === t)) return;
        R("history", { from: r, to: t });
      }),
      !En())
    )
      return;
    function e(t) {
      return function (...r) {
        let i = r.length > 2 ? r[2] : void 0;
        if (i) {
          let s = ur,
            a = Ec(String(i));
          if (((ur = a), s === a)) return t.apply(this, r);
          R("history", { from: s, to: a });
        }
        return t.apply(this, r);
      };
    }
    (n(e, "historyReplacementFunction"),
      A(E.history, "pushState", e),
      A(E.history, "replaceState", e));
  }
  n(Sc, "instrumentHistory");
  function Ec(e) {
    try {
      return new URL(e, E.location.origin).toString();
    } catch {
      return e;
    }
  }
  n(Ec, "getAbsoluteUrl");
  var dr = {};
  function Fn(e) {
    let t = dr[e];
    if (t) return t;
    let r = E[e];
    if (Tt(r)) return (dr[e] = r.bind(E));
    let i = E.document;
    if (i && typeof i.createElement == "function")
      try {
        let s = i.createElement("iframe");
        ((s.hidden = !0), i.head.appendChild(s));
        let a = s.contentWindow;
        (a?.[e] && (r = a[e]), i.head.removeChild(s));
      } catch (s) {
        da &&
          f.warn(
            `Could not create sandbox iframe for ${e} check, bailing to window.${e}: `,
            s,
          );
      }
    return r && (dr[e] = r.bind(E));
  }
  n(Fn, "getNativeImplementation");
  function Bn(e) {
    dr[e] = void 0;
  }
  n(Bn, "clearCachedImplementation");
  var Ce = "__sentry_xhr_v3__";
  function Gn(e) {
    (C("xhr", e), M("xhr", Tc));
  }
  n(Gn, "addXhrInstrumentationHandler");
  function Tc() {
    if (!E.XMLHttpRequest) return;
    let e = XMLHttpRequest.prototype;
    ((e.open = new Proxy(e.open, {
      apply(t, r, i) {
        let s = new Error(),
          a = U() * 1e3,
          c = w(i[0]) ? i[0].toUpperCase() : void 0,
          o = Ic(i[1]);
        if (!c || !o) return t.apply(r, i);
        ((r[Ce] = { method: c, url: o, request_headers: {} }),
          c === "POST" &&
            o.match(/sentry_key/) &&
            (r.__sentry_own_request__ = !0));
        let p = n(() => {
          let l = r[Ce];
          if (l && r.readyState === 4) {
            try {
              l.status_code = r.status;
            } catch {}
            let g = {
              endTimestamp: U() * 1e3,
              startTimestamp: a,
              xhr: r,
              virtualError: s,
            };
            (R("xhr", g), r.removeEventListener("readystatechange", p));
          }
        }, "onreadystatechangeHandler");
        return (
          "onreadystatechange" in r && typeof r.onreadystatechange == "function"
            ? (r.onreadystatechange = new Proxy(r.onreadystatechange, {
                apply(l, g, u) {
                  return (p(), l.apply(g, u));
                },
              }))
            : r.addEventListener("readystatechange", p),
          (r.setRequestHeader = new Proxy(r.setRequestHeader, {
            apply(l, g, u) {
              let [m, d] = u,
                b = g[Ce];
              return (
                b && w(m) && w(d) && (b.request_headers[m.toLowerCase()] = d),
                l.apply(g, u)
              );
            },
          })),
          t.apply(r, i)
        );
      },
    })),
      (e.send = new Proxy(e.send, {
        apply(t, r, i) {
          let s = r[Ce];
          if (!s) return t.apply(r, i);
          i[0] !== void 0 && (s.body = i[0]);
          let a = { startTimestamp: U() * 1e3, xhr: r };
          return (R("xhr", a), t.apply(r, i));
        },
      })));
  }
  n(Tc, "instrumentXHR");
  function Ic(e) {
    if (w(e)) return e;
    try {
      return e.toString();
    } catch {}
  }
  n(Ic, "parseXhrUrlArg");
  function qn(e) {
    if (typeof Element > "u") return !1;
    try {
      return e instanceof Element;
    } catch {
      return !1;
    }
  }
  n(qn, "isElement");
  var Ac = 40;
  function fa(e, t = Fn("fetch")) {
    let r = 0,
      i = 0;
    async function s(a) {
      let c = a.body.length;
      ((r += c), i++);
      let o = {
        body: a.body,
        method: "POST",
        referrerPolicy: "strict-origin",
        headers: e.headers,
        keepalive: r <= 6e4 && i < 15,
        ...e.fetchOptions,
      };
      try {
        let p = await t(e.url, o);
        return {
          statusCode: p.status,
          headers: {
            "x-sentry-rate-limits": p.headers.get("X-Sentry-Rate-Limits"),
            "retry-after": p.headers.get("Retry-After"),
          },
        };
      } catch (p) {
        throw (Bn("fetch"), p);
      } finally {
        ((r -= c), i--);
      }
    }
    return (n(s, "makeRequest"), Qt(e, s, xe(e.bufferSize || Ac)));
  }
  n(fa, "makeFetchTransport");
  var fe = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__;
  var Oc = 30;
  var xc = 50;
  function Hn(e, t, r, i) {
    let s = {
      filename: e,
      function: t === "<anonymous>" ? "?" : t,
      in_app: !0,
    };
    return (r !== void 0 && (s.lineno = r), i !== void 0 && (s.colno = i), s);
  }
  n(Hn, "createFrame");
  var Rc = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i,
    kc =
      /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
    Nc = /\((\S*)(?::(\d+))(?::(\d+))\)/,
    wc = /at (.+?) ?\(data:(.+?),/,
    Cc = n((e) => {
      let t = e.match(wc);
      if (t) return { filename: `<data:${t[2]}>`, function: t[1] };
      let r = Rc.exec(e);
      if (r) {
        let [, s, a, c] = r;
        return Hn(s, "?", +a, +c);
      }
      let i = kc.exec(e);
      if (i) {
        if (i[2]?.indexOf("eval") === 0) {
          let o = Nc.exec(i[2]);
          o && ((i[2] = o[1]), (i[3] = o[2]), (i[4] = o[3]));
        }
        let [a, c] = _a(i[1] || "?", i[2]);
        return Hn(c, a, i[3] ? +i[3] : void 0, i[4] ? +i[4] : void 0);
      }
    }, "chromeStackParserFn"),
    Mc = [Oc, Cc],
    Pc =
      /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i,
    Lc = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
    Dc = n((e) => {
      let t = Pc.exec(e);
      if (t) {
        if (t[3] && t[3].indexOf(" > eval") > -1) {
          let a = Lc.exec(t[3]);
          a &&
            ((t[1] = t[1] || "eval"),
            (t[3] = a[1]),
            (t[4] = a[2]),
            (t[5] = ""));
        }
        let i = t[3],
          s = t[1] || "?";
        return (
          ([s, i] = _a(s, i)),
          Hn(i, s, t[4] ? +t[4] : void 0, t[5] ? +t[5] : void 0)
        );
      }
    }, "gecko"),
    Uc = [xc, Dc];
  var Fc = [Mc, Uc],
    ya = Ct(...Fc),
    _a = n((e, t) => {
      let r = e.indexOf("safari-extension") !== -1,
        i = e.indexOf("safari-web-extension") !== -1;
      return r || i
        ? [
            e.indexOf("@") !== -1 ? e.split("@")[0] : "?",
            r ? `safari-extension:${t}` : `safari-web-extension:${t}`,
          ]
        : [e, t];
    }, "extractSafariExtensionDetails");
  var mr = 1024,
    Bc = "Breadcrumbs",
    Gc = n((e = {}) => {
      let t = {
        console: !0,
        dom: !0,
        fetch: !0,
        history: !0,
        sentry: !0,
        xhr: !0,
        ...e,
      };
      return {
        name: Bc,
        setup(r) {
          (t.console && St(Yc(r)),
            t.dom && Un(Hc(r, t.dom)),
            t.xhr && Gn(Wc(r)),
            t.fetch && In(Vc(r)),
            t.history && At(zc(r)),
            t.sentry && r.on("beforeSendEvent", qc(r)));
        },
      };
    }, "_breadcrumbsIntegration"),
    ha = Gc;
  function qc(e) {
    return n(function (r) {
      S() === e &&
        te(
          {
            category: `sentry.${r.type === "transaction" ? "transaction" : "event"}`,
            event_id: r.event_id,
            level: r.level,
            message: z(r),
          },
          { event: r },
        );
    }, "addSentryBreadcrumb");
  }
  n(qc, "_getSentryBreadcrumbHandler");
  function Hc(e, t) {
    return n(function (i) {
      if (S() !== e) return;
      let s,
        a,
        c = typeof t == "object" ? t.serializeAttribute : void 0,
        o =
          typeof t == "object" && typeof t.maxStringLength == "number"
            ? t.maxStringLength
            : void 0;
      (o &&
        o > mr &&
        (fe &&
          f.warn(
            `\`dom.maxStringLength\` cannot exceed ${mr}, but a value of ${o} was configured. Sentry will use ${mr} instead.`,
          ),
        (o = mr)),
        typeof c == "string" && (c = [c]));
      try {
        let l = i.event,
          g = jc(l) ? l.target : l;
        ((s = It(g, { keyAttrs: c, maxStringLength: o })), (a = An(g)));
      } catch {
        s = "<unknown>";
      }
      if (s.length === 0) return;
      let p = { category: `ui.${i.name}`, message: s };
      (a && (p.data = { "ui.component_name": a }),
        te(p, { event: i.event, name: i.name, global: i.global }));
    }, "_innerDomBreadcrumb");
  }
  n(Hc, "_getDomBreadcrumbHandler");
  function Yc(e) {
    return n(function (r) {
      if (S() !== e) return;
      let i = {
        category: "console",
        data: { arguments: r.args, logger: "console" },
        level: Qe(r.level),
        message: Te(r.args, " "),
      };
      if (r.level === "assert")
        if (r.args[0] === !1)
          ((i.message = `Assertion failed: ${Te(r.args.slice(1), " ") || "console.assert"}`),
            (i.data.arguments = r.args.slice(1)));
        else return;
      te(i, { input: r.args, level: r.level });
    }, "_consoleBreadcrumb");
  }
  n(Yc, "_getConsoleBreadcrumbHandler");
  function Wc(e) {
    return n(function (r) {
      if (S() !== e) return;
      let { startTimestamp: i, endTimestamp: s } = r,
        a = r.xhr[Ce];
      if (!i || !s || !a) return;
      let { method: c, url: o, status_code: p, body: l } = a,
        g = { method: c, url: o, status_code: p },
        u = { xhr: r.xhr, input: l, startTimestamp: i, endTimestamp: s },
        m = { category: "xhr", data: g, type: "http", level: sr(p) };
      (e.emit("beforeOutgoingRequestBreadcrumb", m, u), te(m, u));
    }, "_xhrBreadcrumb");
  }
  n(Wc, "_getXhrBreadcrumbHandler");
  function Vc(e) {
    return n(function (r) {
      if (S() !== e) return;
      let { startTimestamp: i, endTimestamp: s } = r;
      if (
        s &&
        !(r.fetchData.url.match(/sentry_key/) && r.fetchData.method === "POST")
      )
        if (r.error) {
          let a = {
              data: r.error,
              input: r.args,
              startTimestamp: i,
              endTimestamp: s,
            },
            c = {
              category: "fetch",
              data: r.fetchData,
              level: "error",
              type: "http",
            };
          (e.emit("beforeOutgoingRequestBreadcrumb", c, a), te(c, a));
        } else {
          let a = r.response,
            c = { ...r.fetchData, status_code: a?.status },
            o = {
              input: r.args,
              response: a,
              startTimestamp: i,
              endTimestamp: s,
            },
            p = {
              category: "fetch",
              data: c,
              type: "http",
              level: sr(c.status_code),
            };
          (e.emit("beforeOutgoingRequestBreadcrumb", p, o), te(p, o));
        }
    }, "_fetchBreadcrumb");
  }
  n(Vc, "_getFetchBreadcrumbHandler");
  function zc(e) {
    return n(function (r) {
      if (S() !== e) return;
      let i = r.from,
        s = r.to,
        a = vt(v.location.href),
        c = i ? vt(i) : void 0,
        o = vt(s);
      (c?.path || (c = a),
        a.protocol === o.protocol && a.host === o.host && (s = o.relative),
        a.protocol === c.protocol && a.host === c.host && (i = c.relative),
        te({ category: "navigation", data: { from: i, to: s } }));
    }, "_historyBreadcrumb");
  }
  n(zc, "_getHistoryBreadcrumbHandler");
  function jc(e) {
    return !!e && !!e.target;
  }
  n(jc, "_isEvent");
  var Kc =
      "EventTarget,Window,Node,ApplicationCache,AudioTrackList,BroadcastChannel,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,SharedWorker,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload".split(
        ",",
      ),
    $c = "BrowserApiErrors",
    Qc = n((e = {}) => {
      let t = {
        XMLHttpRequest: !0,
        eventTarget: !0,
        requestAnimationFrame: !0,
        setInterval: !0,
        setTimeout: !0,
        unregisterOriginalCallbacks: !1,
        ...e,
      };
      return {
        name: $c,
        setupOnce() {
          (t.setTimeout && A(v, "setTimeout", va),
            t.setInterval && A(v, "setInterval", va),
            t.requestAnimationFrame && A(v, "requestAnimationFrame", Xc),
            t.XMLHttpRequest &&
              "XMLHttpRequest" in v &&
              A(XMLHttpRequest.prototype, "send", Jc));
          let r = t.eventTarget;
          r && (Array.isArray(r) ? r : Kc).forEach((s) => Zc(s, t));
        },
      };
    }, "_browserApiErrorsIntegration"),
    Sa = Qc;
  function va(e) {
    return function (...t) {
      let r = t[0];
      return (
        (t[0] = Ne(r, {
          mechanism: {
            handled: !1,
            type: `auto.browser.browserapierrors.${q(e)}`,
          },
        })),
        e.apply(this, t)
      );
    };
  }
  n(va, "_wrapTimeFunction");
  function Xc(e) {
    return function (t) {
      return e.apply(this, [
        Ne(t, {
          mechanism: {
            data: { handler: q(e) },
            handled: !1,
            type: "auto.browser.browserapierrors.requestAnimationFrame",
          },
        }),
      ]);
    };
  }
  n(Xc, "_wrapRAF");
  function Jc(e) {
    return function (...t) {
      let r = this;
      return (
        ["onload", "onerror", "onprogress", "onreadystatechange"].forEach(
          (s) => {
            s in r &&
              typeof r[s] == "function" &&
              A(r, s, function (a) {
                let c = {
                    mechanism: {
                      data: { handler: q(a) },
                      handled: !1,
                      type: `auto.browser.browserapierrors.xhr.${s}`,
                    },
                  },
                  o = le(a);
                return (o && (c.mechanism.data.handler = q(o)), Ne(a, c));
              });
          },
        ),
        e.apply(this, t)
      );
    };
  }
  n(Jc, "_wrapXHR");
  function Zc(e, t) {
    let i = v[e]?.prototype;
    i?.hasOwnProperty?.("addEventListener") &&
      (A(i, "addEventListener", function (s) {
        return function (a, c, o) {
          try {
            eu(c) &&
              (c.handleEvent = Ne(c.handleEvent, {
                mechanism: {
                  data: { handler: q(c), target: e },
                  handled: !1,
                  type: "auto.browser.browserapierrors.handleEvent",
                },
              }));
          } catch {}
          return (
            t.unregisterOriginalCallbacks && tu(this, a, c),
            s.apply(this, [
              a,
              Ne(c, {
                mechanism: {
                  data: { handler: q(c), target: e },
                  handled: !1,
                  type: "auto.browser.browserapierrors.addEventListener",
                },
              }),
              o,
            ])
          );
        };
      }),
      A(i, "removeEventListener", function (s) {
        return function (a, c, o) {
          try {
            if (Object.prototype.hasOwnProperty.call(c, "__sentry_wrapped__")) {
              let p = c.__sentry_wrapped__;
              p && s.call(this, a, p, o);
            }
          } catch {}
          return s.call(this, a, c, o);
        };
      }));
  }
  n(Zc, "_wrapEventTarget");
  function eu(e) {
    return typeof e.handleEvent == "function";
  }
  n(eu, "isEventListenerObject");
  function tu(e, t, r) {
    e &&
      typeof e == "object" &&
      "removeEventListener" in e &&
      typeof e.removeEventListener == "function" &&
      e.removeEventListener(t, r);
  }
  n(tu, "unregisterOriginalCallback");
  var Ea = (e = {}) => {
    let t = e.lifecycle ?? "route";
    return {
      name: "BrowserSession",
      setupOnce() {
        if (typeof v.document > "u") {
          fe &&
            f.warn(
              "Using the `browserSessionIntegration` in non-browser environments is not supported.",
            );
          return;
        }
        yt({ ignoreDuration: !0 });
        let r = !1;
        Pn(() => {
          r || (je(), (r = !0));
        });
        let i = B(),
          s = i.getUser();
        (i.addScopeListener((a) => {
          let c = a.getUser();
          (s?.id !== c?.id || s?.ip_address !== c?.ip_address) &&
            ((s = c), r && je());
        }),
          t === "route" &&
            At(({ from: a, to: c }) => {
              a !== c && (yt({ ignoreDuration: !0 }), je(), (r = !0));
            }));
      },
    };
  };
  var ru = "CultureContext",
    nu = n(
      () => ({
        name: ru,
        preprocessEvent(e) {
          let t = Ta();
          t &&
            (e.contexts = {
              ...e.contexts,
              culture: { ...t, ...e.contexts?.culture },
            });
        },
        processSegmentSpan(e) {
          let t = Ta();
          t &&
            dt(e, {
              "culture.locale": t.locale,
              "culture.timezone": t.timezone,
              "culture.calendar": t.calendar,
            });
        },
      }),
      "_cultureContextIntegration",
    ),
    Ia = nu;
  function Ta() {
    try {
      let e = v.Intl;
      if (!e) return;
      let t = e.DateTimeFormat().resolvedOptions();
      return { locale: t.locale, timezone: t.timeZone, calendar: t.calendar };
    } catch {
      return;
    }
  }
  n(Ta, "getCultureContext");
  var iu = "GlobalHandlers",
    su = n((e = {}) => {
      let t = { onerror: !0, onunhandledrejection: !0, ...e };
      return {
        name: iu,
        setupOnce() {
          Error.stackTraceLimit = 50;
        },
        setup(r) {
          (t.onerror && (au(r), Aa("onerror")),
            t.onunhandledrejection && (ou(r), Aa("onunhandledrejection")));
        },
      };
    }, "_globalHandlersIntegration"),
    Oa = su;
  function au(e) {
    Ar((t) => {
      let { stackParser: r, attachStacktrace: i } = xa();
      if (S() !== e || xn()) return;
      let { msg: s, url: a, line: c, column: o, error: p } = t,
        l = cu(lr(r, p || s, void 0, i, !1), a, c, o);
      ((l.level = "error"),
        ft(l, {
          originalException: p,
          mechanism: {
            handled: !1,
            type: "auto.browser.global_handlers.onerror",
          },
        }));
    });
  }
  n(au, "_installGlobalOnErrorHandler");
  function ou(e) {
    xr((t) => {
      let { stackParser: r, attachStacktrace: i } = xa();
      if (S() !== e || xn()) return;
      let s = pu(t),
        a = W(s) ? lu(s) : lr(r, s, void 0, i, !0);
      ((a.level = "error"),
        ft(a, {
          originalException: s,
          mechanism: {
            handled: !1,
            type: "auto.browser.global_handlers.onunhandledrejection",
          },
        }));
    });
  }
  n(ou, "_installGlobalOnUnhandledRejectionHandler");
  function pu(e) {
    if (W(e)) return e;
    try {
      if ("reason" in e) return e.reason;
      if ("detail" in e && "reason" in e.detail) return e.detail.reason;
    } catch {}
    return e;
  }
  n(pu, "_getUnhandledRejectionError");
  function lu(e) {
    return {
      exception: {
        values: [
          {
            type: "UnhandledRejection",
            value: `Non-Error promise rejection captured with value: ${String(e)}`,
          },
        ],
      },
    };
  }
  n(lu, "_eventFromRejectionWithPrimitive");
  function cu(e, t, r, i) {
    let s = (e.exception = e.exception || {}),
      a = (s.values = s.values || []),
      c = (a[0] = a[0] || {}),
      o = (c.stacktrace = c.stacktrace || {}),
      p = (o.frames = o.frames || []);
    return (
      p.length === 0 &&
        p.push({
          colno: i,
          lineno: r,
          filename: uu(t) ?? Re(),
          function: "?",
          in_app: !0,
        }),
      e
    );
  }
  n(cu, "_enhanceEventWithInitialFrame");
  function Aa(e) {
    fe && f.log(`Global Handler attached: ${e}`);
  }
  n(Aa, "globalHandlerLog");
  function xa() {
    return (
      S()?.getOptions() || {
        stackParser: n(() => [], "stackParser"),
        attachStacktrace: !1,
      }
    );
  }
  n(xa, "getOptions");
  function uu(e) {
    if (!(!w(e) || e.length === 0))
      return e.startsWith("data:") ? `<${bn(e, !1)}>` : e;
  }
  n(uu, "getFilenameFromUrl");
  var Ra = () => ({
    name: "HttpContext",
    preprocessEvent(e) {
      if (!v.navigator && !v.location && !v.document) return;
      let t = Rn(),
        r = { ...t.headers, ...e.request?.headers };
      e.request = { ...t, ...e.request, headers: r };
    },
    processSegmentSpan(e) {
      let t = e.attributes?.[We];
      if (!v.navigator && !v.location && !v.document) return;
      let r = Rn();
      dt(e, {
        [us]: t !== "http.client" ? r.url : void 0,
        "http.request.header.user_agent": r.headers["User-Agent"],
        "http.request.header.referer": r.headers.Referer,
      });
    },
  });
  var du = "cause",
    mu = 5,
    gu = "LinkedErrors",
    bu = n((e = {}) => {
      let t = e.limit || mu,
        r = e.key || du;
      return {
        name: gu,
        preprocessEvent(i, s, a) {
          let c = a.getOptions();
          vn(or, c.stackParser, r, t, i, s);
        },
      };
    }, "_linkedErrorsIntegration"),
    ka = bu;
  var fu = /^HTML(\w*)Element$/;
  function Na(e) {
    if (typeof window < "u" && e === window) return "[Window]";
    if (typeof document < "u" && e === document) return "[Document]";
    if (qn(e)) {
      let t = yu(e);
      if (fu.test(t)) return `[HTMLElement: ${It(e)}]`;
    }
  }
  n(Na, "normalizeStringifyValue");
  function yu(e) {
    let t = Object.getPrototypeOf(e);
    return t?.constructor ? t.constructor.name : "null prototype";
  }
  n(yu, "getConstructorName");
  function wa() {
    return _u()
      ? (fe &&
          G(() => {
            console.error(
              "[Sentry] You cannot use Sentry.init() in a browser extension, see: https://docs.sentry.io/platforms/javascript/best-practices/browser-extensions/",
            );
          }),
        !0)
      : !1;
  }
  n(wa, "checkAndWarnIfIsEmbeddedBrowserExtension");
  function _u() {
    if (typeof v.window > "u") return !1;
    let e = v;
    if (e.nw || !(e.chrome || e.browser)?.runtime?.id) return !1;
    let r = Re();
    return !(
      v === v.top &&
      /^(?:chrome-extension|moz-extension|ms-browser-extension|safari-web-extension):\/\//.test(
        r,
      )
    );
  }
  n(_u, "_isEmbeddedBrowserExtension");
  function Ca(e) {
    return [tr(), Zt(), Sn(), Sa(), ha(), Oa(), ka(), ir(), Ra(), Ia(), Ea()];
  }
  n(Ca, "getDefaultIntegrations");
  function Yn(e = {}) {
    let t = !e.skipBrowserExtensionCheck && wa(),
      r = e.defaultIntegrations == null ? Ca() : e.defaultIntegrations,
      i = {
        ...e,
        enabled: t ? !1 : e.enabled,
        stackParser: Tr(e.stackParser || ya),
        integrations: nn({
          integrations: e.integrations,
          defaultIntegrations: r,
        }),
        transport: e.transport || fa,
      };
    return (wr(Na), mn(cr, i));
  }
  n(Yn, "init");
  var Pa = di(Ma(), 1);
  var K = null;
  try {
    K = Pa.default.parse(navigator.userAgent);
  } catch (e) {
    console.error(e.stack || e);
  }
  K &&
    (typeof K.browser.version == "string" &&
      (K.browser.majorVersion = parseInt(K.browser.version.split(".")[0])),
    K.browser.name === "Firefox" &&
      K.os.name === "iOS" &&
      (K.browser.name = "Firefox iOS"));
  var vu = { Chrome: 50, Safari: 10, Firefox: 50, "Firefox iOS": 20 },
    La = n(
      () => !!K && K.browser.majorVersion >= vu[K.browser.name],
      "isTargetBrowser",
    );
  var Su = ["src/client/js/workers"];
  function Eu(e) {
    if (typeof e != "string") throw new Error("fileUrl is not string");
    return e
      .replace(new RegExp(".*(" + Su.join("|") + ")/"), "")
      .replace(/\..+$/, "")
      .replace(/\/index$/, "")
      .replace(/\//g, ":");
  }
  n(Eu, "fileUrlToTitle");
  function k(e) {
    let t = Eu(e);
    return function (...r) {
      ((r = r.map((i) =>
        Array.isArray(i)
          ? `[Array ${i.length}]`
          : i instanceof Map
            ? `[Map ${i.size}]`
            : typeof i == "object"
              ? "[Object]"
              : i,
      )),
        console.log(`%c${t}`, "color: gray", ...r));
    };
  }
  n(k, "createDebug");
  var gr = k("src/client/js/workers/lib/sentry.js"),
    Vn = "https://a1e18d1b37504a1a847ea4d4b7e154f4@sentry.io/192116",
    Da = "";
  function Ua({ environment: e }) {
    if (!Vn) return gr("SENTRY_DSN is not exists");
    if (!La()) return gr("not target browser");
    gr(
      "install",
      JSON.stringify({ SENTRY_DSN: Vn, RELEASE_VERSION: Da, environment: e }),
    );
    try {
      Yn({
        dsn: Vn,
        integrations: [
          nr({ levels: [] }),
          {
            name: "GlobalHandlers",
            setup(t) {
              t.addEventProcessor((r) =>
                r.mechanism?.type === "onerror" ||
                r.mechanism?.type === "onunhandledrejection"
                  ? r
                  : null,
              );
            },
          },
        ],
        environment: e,
        release: Da,
        tracesSampleRate: 1,
        debug: !1,
      });
    } catch (t) {
      return (console.error(t), gr("SENTRY_DSN is invalid"));
    }
  }
  n(Ua, "setupSentry");
  var $a = di(Ka(), 1),
    se = new $a.EventEmitter();
  var Me = n((...e) => {
      let t = e.map(ku);
      return { patterns: e, match: n((r) => !!t.find((i) => i(r)), "match") };
    }, "wildpath"),
    ku = n((e) => {
      if (typeof e == "function") return e;
      if (e.includes("*")) {
        if (e.endsWith("/*")) {
          let t = e.replace(/\*$/, "");
          return (r) => r.startsWith(t);
        }
        throw new Error(`invalid wildcard pattern ${e}`);
      }
      return (t) => t === e;
    }, "createMatcher");
  var jn = class jn {
    constructor(t = []) {
      if (!(t instanceof Array))
        throw new Error("ArgumentError: errors must be an Array");
      this.errors = t;
    }
    get isValid() {
      return this.errors.length < 1;
    }
    get isInvalid() {
      return !this.isValid;
    }
    toString() {
      return this.errors.map((t) => t.message || t).join(". ");
    }
  };
  n(jn, "ValidationResult");
  var xt = jn;
  var Qa = n((...e) => {
    for (let { validator: r, message: i } of e) {
      if (typeof r != "function")
        throw new Error("validator must be a function.");
      if (typeof i != "string") throw new Error("message must be a string.");
    }
    let t = n((r) => {
      let i = new xt();
      for (let { validator: s, message: a, next: c } of e)
        if (!s(r) && (i.errors.push(a), !c)) break;
      return i;
    }, "validate");
    return (
      Object.defineProperty(t, "mongooseFormat", {
        get: n(
          () =>
            e.map(({ validator: r, message: i }) => ({
              validator: r,
              message: i,
            })),
          "get",
        ),
      }),
      (t.validators = e),
      t
    );
  }, "combineValidators");
  var Nu = !0,
    Xa = { value: 2, message: "Name is too short" },
    Ja = { value: 48, message: "Name is too long" },
    Pe = [
      "landing",
      "product",
      "enterprise",
      "pricing",
      "try-enterprise",
      "contact",
      "terms",
      "privacy",
      "jp-commercial-act",
      "support",
      "case",
      "features",
      "business",
      "solution",
      "resource",
    ],
    Le = ["auth", "login", "logout", "oauth2"],
    wu = [
      "_",
      ...Le,
      "api",
      "app.html",
      "assets",
      "file",
      "files",
      "billing",
      "billings",
      "cdn-cgi",
      "config",
      "feed",
      "index",
      "io",
      "new",
      "opensearch",
      "project",
      "projects",
      "search",
      "setting",
      "settings",
      "setup-profile",
      "slide",
      "socket.io",
      "stream",
      "user",
      "users",
      "v2",
      "v3",
      "v4",
    ]
      .concat(Nu ? Pe : [])
      .map((e) => e.toLowerCase()),
    VT = Qa(
      {
        validator: n((e) => typeof e == "string", "validator"),
        message: "Name must be a String",
      },
      {
        validator: n((e) => e.length >= Xa.value, "validator"),
        message: Xa.message,
        next: !0,
      },
      {
        validator: n((e) => e.length <= Ja.value, "validator"),
        message: Ja.message,
        next: !0,
      },
      {
        validator: n(
          (e) => /^[a-z0-9][a-z0-9-]*[a-z0-9]$/i.test(e),
          "validator",
        ),
        message:
          "Name can contain only alphabets, numbers and hyphens. It must start and end with alphabet or number",
        next: !0,
      },
      {
        validator: n((e) => !wu.includes(e.toLowerCase()), "validator"),
        message: "the name is reserved for system",
        next: !0,
      },
    );
  var Cu = Me(...Pe.map((e) => `/${e}`), ...Pe.map((e) => `/${e}/*`)),
    Mu = Me(
      "/serviceworker.js",
      "/api/*",
      "/files/*",
      ...Le.map((e) => `/${e}`),
      ...Le.map((e) => `/${e}/*`),
    ),
    Kn = Me(
      "/app.html",
      "/favicon.ico",
      "/robots.txt",
      "/manifest.json",
      "/assets/*",
    );
  function Pu(e) {
    return location.origin === e.origin;
  }
  n(Pu, "isMyOrigin");
  function Lu(e) {
    let t = e.headers.get("Accept");
    return t && (t.includes("text/html") || t === "*/*");
  }
  n(Lu, "isAcceptHtml");
  function Du(e) {
    return e.method === "GET";
  }
  n(Du, "isGetMethod");
  function Za(e) {
    if (!Du(e) || !Lu(e)) return !1;
    let t = new URL(e.url);
    return (
      Pu(t) &&
      !Kn.match(t.pathname) &&
      !Cu.match(t.pathname) &&
      !Mu.match(t.pathname)
    );
  }
  n(Za, "isSinglePageRequest");
  function eo(e) {
    let t = new URL(e.url).origin + "/app.html";
    return new Request(t, {
      method: e.method,
      headers: e.headers,
      credentials: e.credentials,
      cache: e.cache,
      mode: "same-origin",
      redirect: "manual",
    });
  }
  n(eo, "createSinglePageRequest");
  var Uu = Me(...Le.map((e) => `/${e}`), ...Le.map((e) => `/${e}/*`));
  function $n(e) {
    let { origin: t, pathname: r } = new URL(e.url);
    return t !== location.origin ? !1 : Uu.match(r);
  }
  n($n, "isLoginOrLogoutRequest");
  var Fu = Me(...Pe.map((e) => `/${e}`), ...Pe.map((e) => `/${e}/*`));
  function to(e) {
    let { origin: t, pathname: r } = new URL(e.url);
    return t !== location.origin ? !1 : Fu.match(r);
  }
  n(to, "isLandingPageRequest");
  function ro(e) {
    let { origin: t, pathname: r } = new URL(e.url);
    return t !== location.origin
      ? !1
      : !![
          "/api/project-backup/",
          "/api/projects/auditlogs/",
          "/api/page-data/",
        ].some((i) => r.startsWith(i));
  }
  n(ro, "isInternalLargeApiRequest");
  function no(e) {
    let { host: t, pathname: r } = new URL(e.url);
    return !!(
      t === "upload.gyazo.com" ||
      (t.endsWith("gyazo.com") && r.startsWith("/api/upload/"))
    );
  }
  n(no, "isGyazoUploadRequest");
  var io = k("src/client/js/workers/service-worker/lib/cache-storage.js");
  async function so(e) {
    if (typeof e != "function")
      throw new Error("ArgumentError: filter is not a function.");
    let t = (await caches.keys()).filter(e);
    for (let r of t)
      try {
        let i = await caches.open(r),
          s = await i.keys();
        for (let a of s) await i.delete(a.url);
      } catch (i) {
        console.error(i);
      }
    return Promise.all(t.map((r) => caches.delete(r)));
  }
  n(so, "deleteCaches");
  async function Je() {
    return (io("delete all cache"), so(() => !0));
  }
  n(Je, "deleteAllCache");
  async function ao() {
    return (
      io("delete all cache without assets"),
      so((e) => !/^assets-/.test(e))
    );
  }
  n(ao, "deleteAllCacheWithoutAssets");
  async function oo(e) {
    return (await caches.has(e))
      ? (await (await caches.open(e)).keys()).length > 0
      : !1;
  }
  n(oo, "cacheExists");
  async function po(e) {
    if (e.type === "opaque") return e;
    let t = new Headers(e.headers);
    return (
      t.set("X-Serviceworker-Cached", new Date(t.get("date")).getTime()),
      new Response(await e.blob(), {
        status: e.status,
        statusText: e.statusText,
        headers: t,
      })
    );
  }
  n(po, "setHeader");
  var yr = n(
    (e, t = new Date()) =>
      [
        e,
        t.getFullYear(),
        (t.getMonth() + 1).toString().padStart(2, "0"),
        t.getDate().toString().padStart(2, "0"),
      ].join("-"),
    "generateCacheName",
  );
  var Qn = n((e, ...t) => t.find((r) => e instanceof r), "matchTypes"),
    Xn = class Xn extends Error {
      constructor(t) {
        (super(t), (this.name = "NetworkError"));
      }
    };
  n(Xn, "NetworkError");
  var Rt = Xn,
    Jn = class Jn extends Error {
      constructor(t) {
        (super(t), (this.name = "FetchError"));
      }
    };
  n(Jn, "ServerError");
  var Ze = Jn,
    Zn = class Zn extends Error {
      constructor(t) {
        (super(t), (this.name = "AssetsVersionError"));
      }
    };
  n(Zn, "AssetsVersionError");
  var kt = Zn;
  var ei = k("src/client/js/workers/service-worker/lib/api-cache.js"),
    ti = /^api-(\d{4}-\d{2}-\d{2})$/,
    lo = n((e) => {
      let { pathname: t } = new URL(e.url);
      return [
        /^\/api\/projects$/,
        /^\/api\/pages\/([^/]+?)$/,
        /^\/api\/pages\/([^/]+?)\/search\/query$/,
        /^\/api\/pages\/([^/]+?)\/search\/titles$/,
        /^\/api\/projects\/search\/query$/,
        /^\/api\/oembed-proxy\/gyazo$/,
        /^\/api\/deepl\/translate$/,
      ].some((r) => r.test(t));
    }, "enableSearchParameterOnCache");
  function Bu(e) {
    let [, t] = e.match(ti) || [];
    return t ? new Date() - new Date(t) > 10080 * 60 * 1e3 : !1;
  }
  n(Bu, "isExpiredApiCache");
  async function Gu(e) {
    let t = (await caches.keys()).filter((i) => ti.test(i)),
      r = !lo(e);
    for (let i of t.sort().reverse()) {
      let a = await (await caches.open(i)).match(e, { ignoreSearch: r });
      if (a) return a;
    }
    return null;
  }
  n(Gu, "findLatestApiCache");
  async function co() {
    let e = await caches.keys();
    return Promise.all(
      e
        .filter((t) => Bu(t))
        .map((t) => (ei(`delete expired api cache "${t}"`), caches.delete(t))),
    );
  }
  n(co, "deleteExpiredApiCache");
  async function qu(e, t) {
    let r = e.url;
    if (!lo(e)) {
      let i = new URL(e.url);
      ((i.search = ""), (r = i.href));
    }
    try {
      await (await caches.open(yr("api"))).put(r, await po(t));
    } catch (i) {
      console.error(i.stack || i);
    }
  }
  n(qu, "saveApiCache");
  async function Hu(e) {
    let t = (await caches.keys()).filter((r) => ti.test(r));
    for (let r of t)
      try {
        let i = await caches.open(r);
        (await i.match(e.url, { ignoreSearch: !0 })) &&
          (await i.delete(e.url, { ignoreSearch: !0 }));
      } catch (i) {
        console.error(i.stack || i);
      }
  }
  n(Hu, "deleteApiCache");
  async function Yu(e, t) {
    t.ok
      ? t.headers.get("Cache-Control") !== "no-store" && (await qu(e, t))
      : t.status < 500 && (await Hu(e));
  }
  n(Yu, "updateApiCache");
  async function uo(e) {
    let t = n(async () => {
        let i = await Gu(e);
        return i ? (ei("use cache", e.url, e.cache), i) : null;
      }, "respondCache"),
      r;
    try {
      r = await fetch(e);
    } catch (i) {
      return (console.error(i), t());
    }
    if (!ri(e))
      try {
        let i = await mo(),
          s = r.headers.get("x-assets-version");
        i &&
          s &&
          i !== s &&
          (ei(
            "new assets-cache has been detected from x-assets-version header",
          ),
          ae());
      } catch (i) {
        console.error(i);
      }
    return (Yu(e, r.clone()), r);
  }
  n(uo, "respondApiNetworkFirst");
  var Wu = k("src/client/js/workers/service-worker/lib/image-cache.js"),
    ni = /^image-(\d{4}-\d{2}-\d{2})$/;
  function Vu(e) {
    let [, t] = e.match(ni) || [];
    return t ? new Date() - new Date(t) > 2880 * 60 * 1e3 : !1;
  }
  n(Vu, "isExpiredImageCache");
  async function go() {
    return (await caches.keys()).filter((t) => ni.test(t));
  }
  n(go, "getImageCacheKeys");
  async function zu(e) {
    let t = (await caches.keys()).filter((r) => ni.test(r));
    for (let r of t.sort().reverse()) {
      let s = await (await caches.open(r)).match(e);
      if (s) return s;
    }
    return null;
  }
  n(zu, "findLatestImageCache");
  async function ju() {
    let { quota: e, usage: t } = await navigator.storage.estimate();
    if (t <= e * 0.2) return;
    let r = await go();
    for (let i of r) {
      let s = await caches.open(i),
        a = await s.keys();
      for (let c of a) await s.delete(c.url);
    }
  }
  n(ju, "deleteImageCachesIfExceededLimit");
  async function Ku(e, t) {
    if (!(!navigator.storage || !navigator.storage.estimate))
      try {
        (await ju(), await (await caches.open(yr("image"))).put(e.url, t));
      } catch (r) {
        console.error(r);
      }
  }
  n(Ku, "saveImageCache");
  async function bo() {
    let e = await go();
    return Promise.all(e.filter((t) => Vu(t)).map((t) => caches.delete(t)));
  }
  n(bo, "deleteExpiredImageCache");
  async function fo(e) {
    let t = n(async () => {
        let i = await zu(e);
        return i ? (Wu("use image cache", e.url, e.cache), i) : null;
      }, "respondCache"),
      r = null;
    try {
      r = await fetch(e, { mode: e.mode, credentials: e.credentials });
    } catch (i) {
      return (console.error(i), t());
    }
    return (r && Ku(e, r.clone()), r);
  }
  n(fo, "respondImageNetworkFirst");
  var ye = k("src/client/js/workers/service-worker/lib/assets-cache.js");
  async function mo() {
    return (await caches.keys()).find((e) => e.startsWith("assets-"));
  }
  n(mo, "getAssetsVersion");
  async function $u() {
    ye("fetching assets.json...");
    let e = await fetch("/assets/assets.json");
    if (!e.ok) throw new Ze(`Server responded ${e.status}`);
    return e.clone().json();
  }
  n($u, "fetchAssetsJson");
  async function Qu({ version: e, urls: t }) {
    let r = [];
    for (let s of t) {
      let a = await fetch(s);
      if (!a.ok) throw new Ze(`bad response status ${a.status} for ${s}`);
      let c = a.headers.get("x-assets-version");
      if (c && c !== e)
        throw new kt(
          `wrong assets version for ${s}, got ${c} but must be ${e}`,
        );
      let o = new Request(s);
      r.push({ req: o, res: a });
    }
    let i = await caches.open(e);
    try {
      for (let { req: s, res: a } of r) await i.put(s, a);
    } catch (s) {
      throw (caches.delete(e), s);
    }
  }
  n(Qu, "addAllCache");
  async function yo({ version: e, urls: t }) {
    return (
      ye("adding all AssetsCache..."),
      await Qu({ version: e, urls: t }),
      ye(`add all AssetsCache done "${e}"`),
      await _o(e),
      ye("updating AssetsCache done"),
      { hasUpdate: !0 }
    );
  }
  n(yo, "fetchAndRotate");
  async function _o(e) {
    let t = await caches.keys();
    return Promise.all(
      t
        .filter((r) => r.startsWith("assets-") && r !== e)
        .map((r) => (ye(`delete old AssetsCache "${r}"`), caches.delete(r))),
    );
  }
  n(_o, "deleteOldAssetsCache");
  async function ii(e) {
    let r = (await caches.keys()).find((s) => s.startsWith("assets-"));
    return r ? (await caches.open(r)).match(e) : null;
  }
  n(ii, "findAssetsCache");
  async function si() {
    if ((ye("checking for update of assets cache"), !navigator.onLine))
      throw new Rt("network is offline");
    let e = await $u();
    if (await oo(e.version))
      return (ye("already up-to-date"), await _o(e.version), { hasUpdate: !1 });
    try {
      return await yo(e);
    } catch (t) {
      if (Qn(t, DOMException) && t.name === "QuotaExceededError")
        return (await Je(), yo(e));
      throw t;
    }
  }
  n(si, "updateAssetsCache");
  function ri(e) {
    let t = new URL(e.url);
    return !![
      /^\/api\/pages\/([^/]+?)\/search\/titles$/,
      /^\/api\/commits\//,
      /^\/api\/deepl\//,
    ].some((r) => r.test(t.pathname));
  }
  n(ri, "isIgnoreRequestOfUpdateAssetsCache");
  var ho = Date.now();
  se.on("fetch", async (e) => {
    ri(e.request) || (ho = Date.now());
  });
  var _r = null;
  function ae() {
    if (_r) return !1;
    (ye("updateAssetsCacheBackground: Wait for connection to be idle."),
      (_r = setInterval(async () => {
        if (!(Date.now() - ho < 3e3)) {
          (clearInterval(_r), (_r = null));
          try {
            (await si(), await co(), await bo());
          } catch (e) {
            if (Qn(e, Rt, Ze, TypeError, kt)) return console.error(e);
            throw e;
          }
        }
      }, 1e3)));
  }
  n(ae, "updateAssetsCacheBackground");
  var OI =
    typeof location == "object"
      ? `${location.protocol}//${location.host}`
      : process.env.APP_URL || "";
  function vo(e) {
    return /^https?:\/\/(?:[a-z][a-z\d-]*[a-z\d]\.|i\.|)gyazo\.com\/[a-z\d]{32}\.[^.]+$/.test(
      e,
    );
  }
  n(vo, "isGyazoExtURL");
  var _e = k("src/client/js/workers/service-worker/fetch/index.js");
  function Xu(e) {
    return !/^\/\//.test(e);
  }
  n(Xu, "isValidPathname");
  self.addEventListener("fetch", async function (e) {
    setTimeout(() => se.emit("fetch", e), 1);
    let t = e.request,
      { protocol: r, host: i, pathname: s } = new URL(t.url);
    if (
      !(r !== "https:" && i !== location.host) &&
      Xu(s) &&
      !to(t) &&
      !(t.method !== "GET" && !$n(t)) &&
      t.destination !== "video" &&
      !no(t) &&
      !ro(t)
    ) {
      if ($n(t)) {
        (await ao(), ae());
        return;
      }
      e.respondWith(
        (async function () {
          if (Za(t)) return ed(t);
          try {
            return t.destination === "image" && !Kn.match(s)
              ? await fo(t)
              : s.startsWith("/api/")
                ? await uo(t)
                : await Zu(t);
          } catch (a) {
            return (_e(a), new Response("offline"));
          }
        })(),
      );
    }
  });
  function Ju(e) {
    let t = e.headers.get("date");
    if (!t) return !1;
    let r = new Date(t),
      i = new Date(),
      s = 720 * 60 * 60 * 1e3;
    return i - r > s;
  }
  n(Ju, "cacheIsOutdated");
  async function Zu(e) {
    let t;
    try {
      t = await ii(e);
    } catch (i) {
      console.error(i);
    }
    if (t) return (_e("use cache", e.url, e.cache), t);
    if ((_e("fetch", e.url, e.cache), vo(e.url)))
      return fetch(e, { mode: e.mode, credentials: e.credentials });
    let r = Object.create(null);
    return (
      e.mode !== "navigate" && (r.mode = e.mode),
      e.credentials && (r.credentials = e.credentials),
      e.redirect && (r.redirect = e.redirect),
      fetch(e, r)
    );
  }
  n(Zu, "respondCacheFirst");
  async function ed(e) {
    e = eo(e);
    let t;
    try {
      t = await ii(e);
    } catch (c) {
      console.error(c);
    }
    if (!t) return (ae(), fetch(e));
    if (!Ju(t)) return (_e("use cache", e.url, e.cache), ae(), t);
    _e("cache is outdated", "(fetch remote)", e.url, e.cache);
    let i;
    try {
      if (((i = await fetch(e)), !i.ok))
        throw new Error(`Responded ${t.status}`);
    } catch (c) {
      return (console.error(c), _e("use cache anyway", e.url, e.cache), t);
    }
    let s = "x-assets-version",
      a = t.headers.get(s);
    return (
      a === i.headers.get(s)
        ? (_e("version is not changed", "so just replace cache to new one"),
          await (await caches.open(a)).put(e, i.clone()))
        : (_e("fetched different version"), await Je(), ae()),
      i
    );
  }
  n(ed, "respondSinglePage");
  var So = k("src/client/js/workers/service-worker/install/index.js");
  self.addEventListener("install", function (e) {
    (So("install"),
      setTimeout(() => se.emit("install", e), 1),
      e.waitUntil(self.skipWaiting()));
  });
  self.addEventListener("activate", function (e) {
    (So("activate"),
      setTimeout(() => se.emit("activate", e), 1),
      e.waitUntil(self.clients.claim()),
      ae());
  });
  var td = k("src/client/js/workers/service-worker/message/index.js");
  self.addEventListener("message", function (e) {
    (setTimeout(() => se.emit("message", e), 1),
      e.waitUntil(
        (async function () {
          try {
            let t = await rd(e.data);
            e.ports[0].postMessage({ title: e.data.title, result: t });
          } catch (t) {
            e.ports[0].postMessage({ title: e.data.title, error: t.message });
          }
        })(),
      ));
  });
  function rd({ title: e, body: t }) {
    switch ((td("exec", e, t), e)) {
      case "updateAssetsCache":
        return si();
      case "deleteAllCache":
        return Je();
    }
  }
  n(rd, "exec");
  var nd = k("src/client/js/workers/service-worker/index.js");
  Ua({ environment: "service-worker" });
  nd("start");
})();
/*! Bundled license information:

@sentry/core/build/esm/utils/env.js:
  (*! __SENTRY_SDK_SOURCE__ *)
*/

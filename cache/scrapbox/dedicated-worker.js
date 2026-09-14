"use strict";
(() => {
  var Eo = Object.create;
  var Mr = Object.defineProperty;
  var To = Object.getOwnPropertyDescriptor;
  var Io = Object.getOwnPropertyNames;
  var Ao = Object.getPrototypeOf,
    Oo = Object.prototype.hasOwnProperty;
  var i = (e, t) => Mr(e, "name", { value: t, configurable: !0 });
  var k = (e, t) => () => {
    try {
      return (t || e((t = { exports: {} }).exports, t), t.exports);
    } catch (r) {
      throw ((t = 0), r);
    }
  };
  var xo = (e, t, r, n) => {
    if ((t && typeof t == "object") || typeof t == "function")
      for (let s of Io(t))
        !Oo.call(e, s) &&
          s !== r &&
          Mr(e, s, {
            get: () => t[s],
            enumerable: !(n = To(t, s)) || n.enumerable,
          });
    return e;
  };
  var Pr = (e, t, r) => (
    (r = e != null ? Eo(Ao(e)) : {}),
    xo(
      t || !e || !e.__esModule
        ? Mr(r, "default", { value: e, enumerable: !0 })
        : r,
      e,
    )
  );
  var Pa = k((Ot, sn) => {
    (function (e, t) {
      typeof Ot == "object" && typeof sn == "object"
        ? (sn.exports = t())
        : typeof define == "function" && define.amd
          ? define([], t)
          : typeof Ot == "object"
            ? (Ot.bowser = t())
            : (e.bowser = t());
    })(Ot, function () {
      return (function (e) {
        var t = {};
        function r(n) {
          if (t[n]) return t[n].exports;
          var s = (t[n] = { i: n, l: !1, exports: {} });
          return (e[n].call(s.exports, s, s.exports, r), (s.l = !0), s.exports);
        }
        return (
          i(r, "r"),
          (r.m = e),
          (r.c = t),
          (r.d = function (n, s, a) {
            r.o(n, s) ||
              Object.defineProperty(n, s, { enumerable: !0, get: a });
          }),
          (r.r = function (n) {
            (typeof Symbol < "u" &&
              Symbol.toStringTag &&
              Object.defineProperty(n, Symbol.toStringTag, { value: "Module" }),
              Object.defineProperty(n, "__esModule", { value: !0 }));
          }),
          (r.t = function (n, s) {
            if (
              (1 & s && (n = r(n)),
              8 & s || (4 & s && typeof n == "object" && n && n.__esModule))
            )
              return n;
            var a = Object.create(null);
            if (
              (r.r(a),
              Object.defineProperty(a, "default", { enumerable: !0, value: n }),
              2 & s && typeof n != "string")
            )
              for (var c in n)
                r.d(
                  a,
                  c,
                  function (o) {
                    return n[o];
                  }.bind(null, c),
                );
            return a;
          }),
          (r.n = function (n) {
            var s =
              n && n.__esModule
                ? function () {
                    return n.default;
                  }
                : function () {
                    return n;
                  };
            return (r.d(s, "a", s), s);
          }),
          (r.o = function (n, s) {
            return Object.prototype.hasOwnProperty.call(n, s);
          }),
          (r.p = ""),
          r((r.s = 90))
        );
      })({
        17: function (e, t, r) {
          "use strict";
          ((t.__esModule = !0), (t.default = void 0));
          var n = r(18),
            s = (function () {
              function a() {}
              return (
                i(a, "e"),
                (a.getFirstMatch = function (c, o) {
                  var l = o.match(c);
                  return (l && l.length > 0 && l[1]) || "";
                }),
                (a.getSecondMatch = function (c, o) {
                  var l = o.match(c);
                  return (l && l.length > 1 && l[2]) || "";
                }),
                (a.matchAndReturnConst = function (c, o, l) {
                  if (c.test(o)) return l;
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
                  var l = o[0],
                    p = o[1];
                  if (l === 10)
                    switch (p) {
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
                  switch (l) {
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
                    .map(function (l) {
                      return parseInt(l, 10) || 0;
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
                (a.compareVersions = function (c, o, l) {
                  l === void 0 && (l = !1);
                  var p = a.getVersionPrecision(c),
                    g = a.getVersionPrecision(o),
                    u = Math.max(p, g),
                    m = 0,
                    d = a.map([c, o], function (b) {
                      var h = u - a.getVersionPrecision(b),
                        S = b + new Array(h + 1).join(".0");
                      return a
                        .map(S.split("."), function (O) {
                          return new Array(20 - O.length).join("0") + O;
                        })
                        .reverse();
                    });
                  for (l && (m = u - Math.min(p, g)), u -= 1; u >= m; ) {
                    if (d[0][u] > d[1][u]) return 1;
                    if (d[0][u] === d[1][u]) {
                      if (u === m) return 0;
                      u -= 1;
                    } else if (d[0][u] < d[1][u]) return -1;
                  }
                }),
                (a.map = function (c, o) {
                  var l,
                    p = [];
                  if (Array.prototype.map)
                    return Array.prototype.map.call(c, o);
                  for (l = 0; l < c.length; l += 1) p.push(o(c[l]));
                  return p;
                }),
                (a.find = function (c, o) {
                  var l, p;
                  if (Array.prototype.find)
                    return Array.prototype.find.call(c, o);
                  for (l = 0, p = c.length; l < p; l += 1) {
                    var g = c[l];
                    if (o(g, l)) return g;
                  }
                }),
                (a.assign = function (c) {
                  for (
                    var o,
                      l,
                      p = c,
                      g = arguments.length,
                      u = new Array(g > 1 ? g - 1 : 0),
                      m = 1;
                    m < g;
                    m++
                  )
                    u[m - 1] = arguments[m];
                  if (Object.assign)
                    return Object.assign.apply(Object, [c].concat(u));
                  var d = i(function () {
                    var b = u[o];
                    typeof b == "object" &&
                      b !== null &&
                      Object.keys(b).forEach(function (h) {
                        p[h] = b[h];
                      });
                  }, "s");
                  for (o = 0, l = u.length; o < l; o += 1) d();
                  return c;
                }),
                (a.getBrowserAlias = function (c) {
                  return n.BROWSER_ALIASES_MAP[c];
                }),
                (a.getBrowserTypeByAlias = function (c) {
                  return n.BROWSER_MAP[c] || "";
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
          var n,
            s = (n = r(91)) && n.__esModule ? n : { default: n },
            a = r(18);
          function c(l, p) {
            for (var g = 0; g < p.length; g++) {
              var u = p[g];
              ((u.enumerable = u.enumerable || !1),
                (u.configurable = !0),
                "value" in u && (u.writable = !0),
                Object.defineProperty(l, u.key, u));
            }
          }
          i(c, "o");
          var o = (function () {
            function l() {}
            i(l, "e");
            var p, g, u;
            return (
              (l.getParser = function (m, d, b) {
                if (
                  (d === void 0 && (d = !1),
                  b === void 0 && (b = null),
                  typeof m != "string")
                )
                  throw new Error("UserAgent should be a string");
                return new s.default(m, d, b);
              }),
              (l.parse = function (m, d) {
                return (
                  d === void 0 && (d = null),
                  new s.default(m, d).getResult()
                );
              }),
              (p = l),
              (u = [
                {
                  key: "BROWSER_MAP",
                  get: i(function () {
                    return a.BROWSER_MAP;
                  }, "get"),
                },
                {
                  key: "ENGINE_MAP",
                  get: i(function () {
                    return a.ENGINE_MAP;
                  }, "get"),
                },
                {
                  key: "OS_MAP",
                  get: i(function () {
                    return a.OS_MAP;
                  }, "get"),
                },
                {
                  key: "PLATFORMS_MAP",
                  get: i(function () {
                    return a.PLATFORMS_MAP;
                  }, "get"),
                },
              ]),
              (g = null) && c(p.prototype, g),
              u && c(p, u),
              l
            );
          })();
          ((t.default = o), (e.exports = t.default));
        },
        91: function (e, t, r) {
          "use strict";
          ((t.__esModule = !0), (t.default = void 0));
          var n = l(r(92)),
            s = l(r(93)),
            a = l(r(94)),
            c = l(r(95)),
            o = l(r(17));
          function l(g) {
            return g && g.__esModule ? g : { default: g };
          }
          i(l, "u");
          var p = (function () {
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
            i(g, "e");
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
                var d = o.default.find(n.default, function (b) {
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
                  S = {},
                  O = 0;
                if (
                  (Object.keys(m).forEach(function (z) {
                    var De = m[z];
                    typeof De == "string"
                      ? ((S[z] = De), (O += 1))
                      : typeof De == "object" && ((b[z] = De), (h += 1));
                  }),
                  h > 0)
                ) {
                  var Se = Object.keys(b),
                    Nt = o.default.find(Se, function (z) {
                      return d.isOS(z);
                    });
                  if (Nt) {
                    var Je = this.satisfies(b[Nt]);
                    if (Je !== void 0) return Je;
                  }
                  var wt = o.default.find(Se, function (z) {
                    return d.isPlatform(z);
                  });
                  if (wt) {
                    var Ze = this.satisfies(b[wt]);
                    if (Ze !== void 0) return Ze;
                  }
                }
                if (O > 0) {
                  var Ct = Object.keys(S),
                    et = o.default.find(Ct, function (z) {
                      return d.isBrowser(z, !0);
                    });
                  if (et !== void 0) return this.compareVersion(S[et]);
                }
              }),
              (u.isBrowser = function (m, d) {
                d === void 0 && (d = !1);
                var b = this.getBrowserName().toLowerCase(),
                  h = m.toLowerCase(),
                  S = o.default.getBrowserTypeByAlias(h);
                return (d && S && (h = S.toLowerCase()), h === b);
              }),
              (u.compareVersion = function (m) {
                var d = [0],
                  b = m,
                  h = !1,
                  S = this.getBrowserVersion();
                if (typeof S == "string")
                  return (
                    m[0] === ">" || m[0] === "<"
                      ? ((b = m.substr(1)),
                        m[1] === "=" ? ((h = !0), (b = m.substr(2))) : (d = []),
                        m[0] === ">" ? d.push(1) : d.push(-1))
                      : m[0] === "="
                        ? (b = m.substr(1))
                        : m[0] === "~" && ((h = !0), (b = m.substr(1))),
                    d.indexOf(o.default.compareVersions(S, b, h)) > -1
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
          ((t.default = p), (e.exports = t.default));
        },
        92: function (e, t, r) {
          "use strict";
          ((t.__esModule = !0), (t.default = void 0));
          var n,
            s = (n = r(17)) && n.__esModule ? n : { default: n },
            a = /version\/(\d+(\.?_?\d+)+)/i,
            c = [
              {
                test: [/gptbot/i],
                describe: i(function (o) {
                  var l = { name: "GPTBot" },
                    p =
                      s.default.getFirstMatch(/gptbot\/(\d+(\.\d+)+)/i, o) ||
                      s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/chatgpt-user/i],
                describe: i(function (o) {
                  var l = { name: "ChatGPT-User" },
                    p =
                      s.default.getFirstMatch(
                        /chatgpt-user\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/oai-searchbot/i],
                describe: i(function (o) {
                  var l = { name: "OAI-SearchBot" },
                    p =
                      s.default.getFirstMatch(
                        /oai-searchbot\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [
                  /claudebot/i,
                  /claude-web/i,
                  /claude-user/i,
                  /claude-searchbot/i,
                ],
                describe: i(function (o) {
                  var l = { name: "ClaudeBot" },
                    p =
                      s.default.getFirstMatch(
                        /(?:claudebot|claude-web|claude-user|claude-searchbot)\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/omgilibot/i, /webzio-extended/i],
                describe: i(function (o) {
                  var l = { name: "Omgilibot" },
                    p =
                      s.default.getFirstMatch(
                        /(?:omgilibot|webzio-extended)\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/diffbot/i],
                describe: i(function (o) {
                  var l = { name: "Diffbot" },
                    p =
                      s.default.getFirstMatch(/diffbot\/(\d+(\.\d+)+)/i, o) ||
                      s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/perplexitybot/i],
                describe: i(function (o) {
                  var l = { name: "PerplexityBot" },
                    p =
                      s.default.getFirstMatch(
                        /perplexitybot\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/perplexity-user/i],
                describe: i(function (o) {
                  var l = { name: "Perplexity-User" },
                    p =
                      s.default.getFirstMatch(
                        /perplexity-user\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/youbot/i],
                describe: i(function (o) {
                  var l = { name: "YouBot" },
                    p =
                      s.default.getFirstMatch(/youbot\/(\d+(\.\d+)+)/i, o) ||
                      s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/meta-webindexer/i],
                describe: i(function (o) {
                  var l = { name: "Meta-WebIndexer" },
                    p =
                      s.default.getFirstMatch(
                        /meta-webindexer\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/meta-externalads/i],
                describe: i(function (o) {
                  var l = { name: "Meta-ExternalAds" },
                    p =
                      s.default.getFirstMatch(
                        /meta-externalads\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/meta-externalagent/i],
                describe: i(function (o) {
                  var l = { name: "Meta-ExternalAgent" },
                    p =
                      s.default.getFirstMatch(
                        /meta-externalagent\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/meta-externalfetcher/i],
                describe: i(function (o) {
                  var l = { name: "Meta-ExternalFetcher" },
                    p =
                      s.default.getFirstMatch(
                        /meta-externalfetcher\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/googlebot/i],
                describe: i(function (o) {
                  var l = { name: "Googlebot" },
                    p =
                      s.default.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, o) ||
                      s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/linespider/i],
                describe: i(function (o) {
                  var l = { name: "Linespider" },
                    p =
                      s.default.getFirstMatch(
                        /(?:linespider)(?:-[-\w]+)?[\s/](\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/amazonbot/i],
                describe: i(function (o) {
                  var l = { name: "AmazonBot" },
                    p =
                      s.default.getFirstMatch(/amazonbot\/(\d+(\.\d+)+)/i, o) ||
                      s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/bingbot/i],
                describe: i(function (o) {
                  var l = { name: "BingCrawler" },
                    p =
                      s.default.getFirstMatch(/bingbot\/(\d+(\.\d+)+)/i, o) ||
                      s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/baiduspider/i],
                describe: i(function (o) {
                  var l = { name: "BaiduSpider" },
                    p =
                      s.default.getFirstMatch(
                        /baiduspider\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/duckduckbot/i],
                describe: i(function (o) {
                  var l = { name: "DuckDuckBot" },
                    p =
                      s.default.getFirstMatch(
                        /duckduckbot\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/ia_archiver/i],
                describe: i(function (o) {
                  var l = { name: "InternetArchiveCrawler" },
                    p =
                      s.default.getFirstMatch(
                        /ia_archiver\/(\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/facebookexternalhit/i, /facebookcatalog/i],
                describe: i(function () {
                  return { name: "FacebookExternalHit" };
                }, "describe"),
              },
              {
                test: [/slackbot/i, /slack-imgProxy/i],
                describe: i(function (o) {
                  var l = { name: "SlackBot" },
                    p =
                      s.default.getFirstMatch(
                        /(?:slackbot|slack-imgproxy)(?:-[-\w]+)?[\s/](\d+(\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/yahoo!?[\s/]*slurp/i],
                describe: i(function () {
                  return { name: "YahooSlurp" };
                }, "describe"),
              },
              {
                test: [/yandexbot/i, /yandexmobilebot/i],
                describe: i(function () {
                  return { name: "YandexBot" };
                }, "describe"),
              },
              {
                test: [/pingdom/i],
                describe: i(function () {
                  return { name: "PingdomBot" };
                }, "describe"),
              },
              {
                test: [/opera/i],
                describe: i(function (o) {
                  var l = { name: "Opera" },
                    p =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:opera)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/opr\/|opios/i],
                describe: i(function (o) {
                  var l = { name: "Opera" },
                    p =
                      s.default.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, o) ||
                      s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/SamsungBrowser/i],
                describe: i(function (o) {
                  var l = { name: "Samsung Internet for Android" },
                    p =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/Whale/i],
                describe: i(function (o) {
                  var l = { name: "NAVER Whale Browser" },
                    p =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:whale)[\s/](\d+(?:\.\d+)+)/i,
                        o,
                      );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/PaleMoon/i],
                describe: i(function (o) {
                  var l = { name: "Pale Moon" },
                    p =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:PaleMoon)[\s/](\d+(?:\.\d+)+)/i,
                        o,
                      );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/MZBrowser/i],
                describe: i(function (o) {
                  var l = { name: "MZ Browser" },
                    p =
                      s.default.getFirstMatch(
                        /(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/focus/i],
                describe: i(function (o) {
                  var l = { name: "Focus" },
                    p =
                      s.default.getFirstMatch(
                        /(?:focus)[\s/](\d+(?:\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/swing/i],
                describe: i(function (o) {
                  var l = { name: "Swing" },
                    p =
                      s.default.getFirstMatch(
                        /(?:swing)[\s/](\d+(?:\.\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/coast/i],
                describe: i(function (o) {
                  var l = { name: "Opera Coast" },
                    p =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:coast)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/opt\/\d+(?:.?_?\d+)+/i],
                describe: i(function (o) {
                  var l = { name: "Opera Touch" },
                    p =
                      s.default.getFirstMatch(
                        /(?:opt)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/yabrowser/i],
                describe: i(function (o) {
                  var l = { name: "Yandex Browser" },
                    p =
                      s.default.getFirstMatch(
                        /(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/ucbrowser/i],
                describe: i(function (o) {
                  var l = { name: "UC Browser" },
                    p =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/Maxthon|mxios/i],
                describe: i(function (o) {
                  var l = { name: "Maxthon" },
                    p =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/epiphany/i],
                describe: i(function (o) {
                  var l = { name: "Epiphany" },
                    p =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/puffin/i],
                describe: i(function (o) {
                  var l = { name: "Puffin" },
                    p =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:puffin)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/sleipnir/i],
                describe: i(function (o) {
                  var l = { name: "Sleipnir" },
                    p =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/k-meleon/i],
                describe: i(function (o) {
                  var l = { name: "K-Meleon" },
                    p =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/micromessenger/i],
                describe: i(function (o) {
                  var l = { name: "WeChat" },
                    p =
                      s.default.getFirstMatch(
                        /(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/qqbrowser/i],
                describe: i(function (o) {
                  var l = {
                      name: /qqbrowserlite/i.test(o)
                        ? "QQ Browser Lite"
                        : "QQ Browser",
                    },
                    p =
                      s.default.getFirstMatch(
                        /(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/msie|trident/i],
                describe: i(function (o) {
                  var l = { name: "Internet Explorer" },
                    p = s.default.getFirstMatch(
                      /(?:msie |rv:)(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/\sedg\//i],
                describe: i(function (o) {
                  var l = { name: "Microsoft Edge" },
                    p = s.default.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/edg([ea]|ios)/i],
                describe: i(function (o) {
                  var l = { name: "Microsoft Edge" },
                    p = s.default.getSecondMatch(
                      /edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/vivaldi/i],
                describe: i(function (o) {
                  var l = { name: "Vivaldi" },
                    p = s.default.getFirstMatch(
                      /vivaldi\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/seamonkey/i],
                describe: i(function (o) {
                  var l = { name: "SeaMonkey" },
                    p = s.default.getFirstMatch(
                      /seamonkey\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/sailfish/i],
                describe: i(function (o) {
                  var l = { name: "Sailfish" },
                    p = s.default.getFirstMatch(
                      /sailfish\s?browser\/(\d+(\.\d+)?)/i,
                      o,
                    );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/silk/i],
                describe: i(function (o) {
                  var l = { name: "Amazon Silk" },
                    p = s.default.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/phantom/i],
                describe: i(function (o) {
                  var l = { name: "PhantomJS" },
                    p = s.default.getFirstMatch(
                      /phantomjs\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/slimerjs/i],
                describe: i(function (o) {
                  var l = { name: "SlimerJS" },
                    p = s.default.getFirstMatch(
                      /slimerjs\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
                describe: i(function (o) {
                  var l = { name: "BlackBerry" },
                    p =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /blackberry[\d]+\/(\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/(web|hpw)[o0]s/i],
                describe: i(function (o) {
                  var l = { name: "WebOS Browser" },
                    p =
                      s.default.getFirstMatch(a, o) ||
                      s.default.getFirstMatch(
                        /w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i,
                        o,
                      );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/bada/i],
                describe: i(function (o) {
                  var l = { name: "Bada" },
                    p = s.default.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/tizen/i],
                describe: i(function (o) {
                  var l = { name: "Tizen" },
                    p =
                      s.default.getFirstMatch(
                        /(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/qupzilla/i],
                describe: i(function (o) {
                  var l = { name: "QupZilla" },
                    p =
                      s.default.getFirstMatch(
                        /(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/librewolf/i],
                describe: i(function (o) {
                  var l = { name: "LibreWolf" },
                    p = s.default.getFirstMatch(
                      /(?:librewolf)[\s/](\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/firefox|iceweasel|fxios/i],
                describe: i(function (o) {
                  var l = { name: "Firefox" },
                    p = s.default.getFirstMatch(
                      /(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/electron/i],
                describe: i(function (o) {
                  var l = { name: "Electron" },
                    p = s.default.getFirstMatch(
                      /(?:electron)\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/sogoumobilebrowser/i, /metasr/i, /se 2\.[x]/i],
                describe: i(function (o) {
                  var l = { name: "Sogou Browser" },
                    p = s.default.getFirstMatch(
                      /(?:sogoumobilebrowser)[\s/](\d+(\.?_?\d+)+)/i,
                      o,
                    ),
                    g = s.default.getFirstMatch(
                      /(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i,
                      o,
                    ),
                    u = s.default.getFirstMatch(/se ([\d.]+)x/i, o),
                    m = p || g || u;
                  return (m && (l.version = m), l);
                }, "describe"),
              },
              {
                test: [/MiuiBrowser/i],
                describe: i(function (o) {
                  var l = { name: "Miui" },
                    p = s.default.getFirstMatch(
                      /(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: i(function (o) {
                  return (
                    !!o.hasBrand("DuckDuckGo") || o.test(/\sDdg\/[\d.]+$/i)
                  );
                }, "test"),
                describe: i(function (o, l) {
                  var p = { name: "DuckDuckGo" };
                  if (l) {
                    var g = l.getBrandVersion("DuckDuckGo");
                    if (g) return ((p.version = g), p);
                  }
                  var u = s.default.getFirstMatch(/\sDdg\/([\d.]+)$/i, o);
                  return (u && (p.version = u), p);
                }, "describe"),
              },
              {
                test: i(function (o) {
                  return o.hasBrand("Brave");
                }, "test"),
                describe: i(function (o, l) {
                  var p = { name: "Brave" };
                  if (l) {
                    var g = l.getBrandVersion("Brave");
                    if (g) return ((p.version = g), p);
                  }
                  return p;
                }, "describe"),
              },
              {
                test: [/chromium/i],
                describe: i(function (o) {
                  var l = { name: "Chromium" },
                    p =
                      s.default.getFirstMatch(
                        /(?:chromium)[\s/](\d+(\.?_?\d+)+)/i,
                        o,
                      ) || s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/chrome|crios|crmo/i],
                describe: i(function (o) {
                  var l = { name: "Chrome" },
                    p = s.default.getFirstMatch(
                      /(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/GSA/i],
                describe: i(function (o) {
                  var l = { name: "Google Search" },
                    p = s.default.getFirstMatch(
                      /(?:GSA)\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: i(function (o) {
                  var l = !o.test(/like android/i),
                    p = o.test(/android/i);
                  return l && p;
                }, "test"),
                describe: i(function (o) {
                  var l = { name: "Android Browser" },
                    p = s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/playstation 4/i],
                describe: i(function (o) {
                  var l = { name: "PlayStation 4" },
                    p = s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/safari|applewebkit/i],
                describe: i(function (o) {
                  var l = { name: "Safari" },
                    p = s.default.getFirstMatch(a, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/.*/i],
                describe: i(function (o) {
                  var l =
                    o.search("\\(") !== -1
                      ? /^(.*)\/(.*)[ \t]\((.*)/
                      : /^(.*)\/(.*) /;
                  return {
                    name: s.default.getFirstMatch(l, o),
                    version: s.default.getSecondMatch(l, o),
                  };
                }, "describe"),
              },
            ];
          ((t.default = c), (e.exports = t.default));
        },
        93: function (e, t, r) {
          "use strict";
          ((t.__esModule = !0), (t.default = void 0));
          var n,
            s = (n = r(17)) && n.__esModule ? n : { default: n },
            a = r(18),
            c = [
              {
                test: [/Roku\/DVP/],
                describe: i(function (o) {
                  var l = s.default.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, o);
                  return { name: a.OS_MAP.Roku, version: l };
                }, "describe"),
              },
              {
                test: [/windows phone/i],
                describe: i(function (o) {
                  var l = s.default.getFirstMatch(
                    /windows phone (?:os)?\s?(\d+(\.\d+)*)/i,
                    o,
                  );
                  return { name: a.OS_MAP.WindowsPhone, version: l };
                }, "describe"),
              },
              {
                test: [/windows /i],
                describe: i(function (o) {
                  var l = s.default.getFirstMatch(
                      /Windows ((NT|XP)( \d\d?.\d)?)/i,
                      o,
                    ),
                    p = s.default.getWindowsVersionName(l);
                  return { name: a.OS_MAP.Windows, version: l, versionName: p };
                }, "describe"),
              },
              {
                test: [/Macintosh(.*?) FxiOS(.*?)\//],
                describe: i(function (o) {
                  var l = { name: a.OS_MAP.iOS },
                    p = s.default.getSecondMatch(/(Version\/)(\d[\d.]+)/, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/macintosh/i],
                describe: i(function (o) {
                  var l = s.default
                      .getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, o)
                      .replace(/[_\s]/g, "."),
                    p = s.default.getMacOSVersionName(l),
                    g = { name: a.OS_MAP.MacOS, version: l };
                  return (p && (g.versionName = p), g);
                }, "describe"),
              },
              {
                test: [/(ipod|iphone|ipad)/i],
                describe: i(function (o) {
                  var l = s.default
                    .getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, o)
                    .replace(/[_\s]/g, ".");
                  return { name: a.OS_MAP.iOS, version: l };
                }, "describe"),
              },
              {
                test: [/OpenHarmony/i],
                describe: i(function (o) {
                  var l = s.default.getFirstMatch(
                    /OpenHarmony\s+(\d+(\.\d+)*)/i,
                    o,
                  );
                  return { name: a.OS_MAP.HarmonyOS, version: l };
                }, "describe"),
              },
              {
                test: i(function (o) {
                  var l = !o.test(/like android/i),
                    p = o.test(/android/i);
                  return l && p;
                }, "test"),
                describe: i(function (o) {
                  var l = s.default.getFirstMatch(
                      /android[\s/-](\d+(\.\d+)*)/i,
                      o,
                    ),
                    p = s.default.getAndroidVersionName(l),
                    g = { name: a.OS_MAP.Android, version: l };
                  return (p && (g.versionName = p), g);
                }, "describe"),
              },
              {
                test: [/(web|hpw)[o0]s/i],
                describe: i(function (o) {
                  var l = s.default.getFirstMatch(
                      /(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i,
                      o,
                    ),
                    p = { name: a.OS_MAP.WebOS };
                  return (l && l.length && (p.version = l), p);
                }, "describe"),
              },
              {
                test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
                describe: i(function (o) {
                  var l =
                    s.default.getFirstMatch(
                      /rim\stablet\sos\s(\d+(\.\d+)*)/i,
                      o,
                    ) ||
                    s.default.getFirstMatch(
                      /blackberry\d+\/(\d+([_\s]\d+)*)/i,
                      o,
                    ) ||
                    s.default.getFirstMatch(/\bbb(\d+)/i, o);
                  return { name: a.OS_MAP.BlackBerry, version: l };
                }, "describe"),
              },
              {
                test: [/bada/i],
                describe: i(function (o) {
                  var l = s.default.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, o);
                  return { name: a.OS_MAP.Bada, version: l };
                }, "describe"),
              },
              {
                test: [/tizen/i],
                describe: i(function (o) {
                  var l = s.default.getFirstMatch(
                    /tizen[/\s](\d+(\.\d+)*)/i,
                    o,
                  );
                  return { name: a.OS_MAP.Tizen, version: l };
                }, "describe"),
              },
              {
                test: [/linux/i],
                describe: i(function () {
                  return { name: a.OS_MAP.Linux };
                }, "describe"),
              },
              {
                test: [/CrOS/],
                describe: i(function () {
                  return { name: a.OS_MAP.ChromeOS };
                }, "describe"),
              },
              {
                test: [/PlayStation 4/],
                describe: i(function (o) {
                  var l = s.default.getFirstMatch(
                    /PlayStation 4[/\s](\d+(\.\d+)*)/i,
                    o,
                  );
                  return { name: a.OS_MAP.PlayStation4, version: l };
                }, "describe"),
              },
            ];
          ((t.default = c), (e.exports = t.default));
        },
        94: function (e, t, r) {
          "use strict";
          ((t.__esModule = !0), (t.default = void 0));
          var n,
            s = (n = r(17)) && n.__esModule ? n : { default: n },
            a = r(18),
            c = [
              {
                test: [/googlebot/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Google" };
                }, "describe"),
              },
              {
                test: [/linespider/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Line" };
                }, "describe"),
              },
              {
                test: [/amazonbot/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Amazon" };
                }, "describe"),
              },
              {
                test: [/gptbot/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "OpenAI" };
                }, "describe"),
              },
              {
                test: [/chatgpt-user/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "OpenAI" };
                }, "describe"),
              },
              {
                test: [/oai-searchbot/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "OpenAI" };
                }, "describe"),
              },
              {
                test: [/baiduspider/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Baidu" };
                }, "describe"),
              },
              {
                test: [/bingbot/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Bing" };
                }, "describe"),
              },
              {
                test: [/duckduckbot/i],
                describe: i(function () {
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
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Anthropic" };
                }, "describe"),
              },
              {
                test: [/omgilibot/i, /webzio-extended/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Webz.io" };
                }, "describe"),
              },
              {
                test: [/diffbot/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Diffbot" };
                }, "describe"),
              },
              {
                test: [/perplexitybot/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Perplexity AI" };
                }, "describe"),
              },
              {
                test: [/perplexity-user/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Perplexity AI" };
                }, "describe"),
              },
              {
                test: [/youbot/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "You.com" };
                }, "describe"),
              },
              {
                test: [/ia_archiver/i],
                describe: i(function () {
                  return {
                    type: a.PLATFORMS_MAP.bot,
                    vendor: "Internet Archive",
                  };
                }, "describe"),
              },
              {
                test: [/meta-webindexer/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
                }, "describe"),
              },
              {
                test: [/meta-externalads/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
                }, "describe"),
              },
              {
                test: [/meta-externalagent/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
                }, "describe"),
              },
              {
                test: [/meta-externalfetcher/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
                }, "describe"),
              },
              {
                test: [/facebookexternalhit/i, /facebookcatalog/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Meta" };
                }, "describe"),
              },
              {
                test: [/slackbot/i, /slack-imgProxy/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Slack" };
                }, "describe"),
              },
              {
                test: [/yahoo/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Yahoo" };
                }, "describe"),
              },
              {
                test: [/yandexbot/i, /yandexmobilebot/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Yandex" };
                }, "describe"),
              },
              {
                test: [/pingdom/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.bot, vendor: "Pingdom" };
                }, "describe"),
              },
              {
                test: [/huawei/i],
                describe: i(function (o) {
                  var l = s.default.getFirstMatch(/(can-l01)/i, o) && "Nova",
                    p = { type: a.PLATFORMS_MAP.mobile, vendor: "Huawei" };
                  return (l && (p.model = l), p);
                }, "describe"),
              },
              {
                test: [/nexus\s*(?:7|8|9|10).*/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.tablet, vendor: "Nexus" };
                }, "describe"),
              },
              {
                test: [/ipad/i],
                describe: i(function () {
                  return {
                    type: a.PLATFORMS_MAP.tablet,
                    vendor: "Apple",
                    model: "iPad",
                  };
                }, "describe"),
              },
              {
                test: [/Macintosh(.*?) FxiOS(.*?)\//],
                describe: i(function () {
                  return {
                    type: a.PLATFORMS_MAP.tablet,
                    vendor: "Apple",
                    model: "iPad",
                  };
                }, "describe"),
              },
              {
                test: [/kftt build/i],
                describe: i(function () {
                  return {
                    type: a.PLATFORMS_MAP.tablet,
                    vendor: "Amazon",
                    model: "Kindle Fire HD 7",
                  };
                }, "describe"),
              },
              {
                test: [/silk/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.tablet, vendor: "Amazon" };
                }, "describe"),
              },
              {
                test: [/tablet(?! pc)/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.tablet };
                }, "describe"),
              },
              {
                test: i(function (o) {
                  var l = o.test(/ipod|iphone/i),
                    p = o.test(/like (ipod|iphone)/i);
                  return l && !p;
                }, "test"),
                describe: i(function (o) {
                  var l = s.default.getFirstMatch(/(ipod|iphone)/i, o);
                  return {
                    type: a.PLATFORMS_MAP.mobile,
                    vendor: "Apple",
                    model: l,
                  };
                }, "describe"),
              },
              {
                test: [/nexus\s*[0-6].*/i, /galaxy nexus/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.mobile, vendor: "Nexus" };
                }, "describe"),
              },
              {
                test: [/Nokia/i],
                describe: i(function (o) {
                  var l = s.default.getFirstMatch(
                      /Nokia\s+([0-9]+(\.[0-9]+)?)/i,
                      o,
                    ),
                    p = { type: a.PLATFORMS_MAP.mobile, vendor: "Nokia" };
                  return (l && (p.model = l), p);
                }, "describe"),
              },
              {
                test: [/[^-]mobi/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.mobile };
                }, "describe"),
              },
              {
                test: i(function (o) {
                  return o.getBrowserName(!0) === "blackberry";
                }, "test"),
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.mobile, vendor: "BlackBerry" };
                }, "describe"),
              },
              {
                test: i(function (o) {
                  return o.getBrowserName(!0) === "bada";
                }, "test"),
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.mobile };
                }, "describe"),
              },
              {
                test: i(function (o) {
                  return o.getBrowserName() === "windows phone";
                }, "test"),
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.mobile, vendor: "Microsoft" };
                }, "describe"),
              },
              {
                test: i(function (o) {
                  var l = Number(String(o.getOSVersion()).split(".")[0]);
                  return o.getOSName(!0) === "android" && l >= 3;
                }, "test"),
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.tablet };
                }, "describe"),
              },
              {
                test: i(function (o) {
                  return o.getOSName(!0) === "android";
                }, "test"),
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.mobile };
                }, "describe"),
              },
              {
                test: [/smart-?tv|smarttv/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.tv };
                }, "describe"),
              },
              {
                test: [/netcast/i],
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.tv };
                }, "describe"),
              },
              {
                test: i(function (o) {
                  return o.getOSName(!0) === "macos";
                }, "test"),
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.desktop, vendor: "Apple" };
                }, "describe"),
              },
              {
                test: i(function (o) {
                  return o.getOSName(!0) === "windows";
                }, "test"),
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.desktop };
                }, "describe"),
              },
              {
                test: i(function (o) {
                  return o.getOSName(!0) === "linux";
                }, "test"),
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.desktop };
                }, "describe"),
              },
              {
                test: i(function (o) {
                  return o.getOSName(!0) === "playstation 4";
                }, "test"),
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.tv };
                }, "describe"),
              },
              {
                test: i(function (o) {
                  return o.getOSName(!0) === "roku";
                }, "test"),
                describe: i(function () {
                  return { type: a.PLATFORMS_MAP.tv };
                }, "describe"),
              },
            ];
          ((t.default = c), (e.exports = t.default));
        },
        95: function (e, t, r) {
          "use strict";
          ((t.__esModule = !0), (t.default = void 0));
          var n,
            s = (n = r(17)) && n.__esModule ? n : { default: n },
            a = r(18),
            c = [
              {
                test: i(function (o) {
                  return o.getBrowserName(!0) === "microsoft edge";
                }, "test"),
                describe: i(function (o) {
                  if (/\sedg\//i.test(o)) return { name: a.ENGINE_MAP.Blink };
                  var l = s.default.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, o);
                  return { name: a.ENGINE_MAP.EdgeHTML, version: l };
                }, "describe"),
              },
              {
                test: [/trident/i],
                describe: i(function (o) {
                  var l = { name: a.ENGINE_MAP.Trident },
                    p = s.default.getFirstMatch(
                      /trident\/(\d+(\.?_?\d+)+)/i,
                      o,
                    );
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: i(function (o) {
                  return o.test(/presto/i);
                }, "test"),
                describe: i(function (o) {
                  var l = { name: a.ENGINE_MAP.Presto },
                    p = s.default.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: i(function (o) {
                  var l = o.test(/gecko/i),
                    p = o.test(/like gecko/i);
                  return l && !p;
                }, "test"),
                describe: i(function (o) {
                  var l = { name: a.ENGINE_MAP.Gecko },
                    p = s.default.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
              {
                test: [/(apple)?webkit\/537\.36/i],
                describe: i(function () {
                  return { name: a.ENGINE_MAP.Blink };
                }, "describe"),
              },
              {
                test: [/(apple)?webkit/i],
                describe: i(function (o) {
                  var l = { name: a.ENGINE_MAP.WebKit },
                    p = s.default.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, o);
                  return (p && (l.version = p), l);
                }, "describe"),
              },
            ];
          ((t.default = c), (e.exports = t.default));
        },
      });
    });
  });
  var Ba = k((yr) => {
    "use strict";
    Object.defineProperty(yr, "__esModule", { value: !0 });
    yr.arabic = void 0;
    var Eu =
        "\u0620-\u064A\u066E-\u066F\u0671-\u06D5\u06EE-\u06EF\u06FA-\u06FF",
      Tu = "\u0750-\u077F",
      Iu = "[".concat(Eu).concat(Tu, "]"),
      Au = "[\u064B-\u065F\u0670]",
      Ou = "".concat(Iu).concat(Au, "*");
    yr.arabic = Ou;
  });
  var qa = k((_r) => {
    "use strict";
    Object.defineProperty(_r, "__esModule", { value: !0 });
    _r.bengali = void 0;
    var Ga = "[\\u{0980}-\\u{09FF}]",
      xu =
        "[\\u{0980}-\\u{0983}\\u{09BC}-\\u{09D7}\\u{09E2}\\u{09E3}\\u{09FE}]",
      Ru = "\\u{09CD}",
      ku = "".concat(Ga, "(").concat(Ru).concat(Ga, "|").concat(xu, ")*");
    _r.bengali = ku;
  });
  var Ya = k((hr) => {
    "use strict";
    Object.defineProperty(hr, "__esModule", { value: !0 });
    hr.devanagari = void 0;
    var Ha = "[\\u{0900}-\\u{097F}]",
      Nu = "[\\u{0900}-\\u{0903}\\u{093A}-\\u{0957}\\u{0962}\\u{0963}]",
      wu = "\\u{094D}",
      Cu = "".concat(Ha, "(").concat(wu).concat(Ha, "|").concat(Nu, ")*");
    hr.devanagari = Cu;
  });
  var Va = k((vr) => {
    "use strict";
    Object.defineProperty(vr, "__esModule", { value: !0 });
    vr.gujarati = void 0;
    var Wa = "[\\u{0A80}-\\u{0AFF}]",
      Mu =
        "[\\u{0A81}-\\u{0A83}\\u{0ABC}\\u{0ABE}-\\u{0ACD}\\u{0AE2}\\u{0AE3}\\u{0AFA}-\\u{0AFF}]",
      Pu = "\\u{0ACD}",
      Lu = "".concat(Wa, "(").concat(Pu).concat(Wa, "|").concat(Mu, ")*");
    vr.gujarati = Lu;
  });
  var ja = k((Sr) => {
    "use strict";
    Object.defineProperty(Sr, "__esModule", { value: !0 });
    Sr.hebrew = void 0;
    var Du = "[\u05D0-\u05EA]",
      Uu = "[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]",
      Fu = "".concat(Du).concat(Uu, "*");
    Sr.hebrew = Fu;
  });
  var za = k((Er) => {
    "use strict";
    Object.defineProperty(Er, "__esModule", { value: !0 });
    Er.japaneseKana = void 0;
    var Bu = "[\\u{3041}-\\u{3096}\\u{309D}-\\u{309F}]",
      Gu = "[\\u{30A0}-\\u{30FF}]",
      qu = "[\\u{3099}-\\u{309A}]",
      Hu = "[\\u{309B}-\\u{309C}]",
      Yu = "(("
        .concat(Gu, "|")
        .concat(Bu, ")")
        .concat(qu, "?|")
        .concat(Hu, ")");
    Er.japaneseKana = Yu;
  });
  var $a = k((Tr) => {
    "use strict";
    Object.defineProperty(Tr, "__esModule", { value: !0 });
    Tr.kannada = void 0;
    var Ka = "[\\u{0C80}-\\u{0CFF}]",
      Wu =
        "[\\u{0C81}-\\u{0C83}\\u{0CBC}\\u{0CBE}-\\u{0CCD}\\u{0CD5}\\u{0CD6}\\u{0CE2}\\u{0CE3}]",
      Vu = "\\u{0CCD}",
      ju = "".concat(Ka, "(").concat(Vu).concat(Ka, "|").concat(Wu, ")*");
    Tr.kannada = ju;
  });
  var Xa = k((Ir) => {
    "use strict";
    Object.defineProperty(Ir, "__esModule", { value: !0 });
    Ir.khmer = void 0;
    var Qa = "[\\u{1780}-\\u{17FF}]",
      zu = "[\\u{17B6}-\\u{17D1}\\u{17D3}\\u{17DD}]",
      Ku = "\\u{17D2}",
      $u = "".concat(Qa, "(").concat(Ku).concat(Qa, "|").concat(zu, ")*");
    Ir.khmer = $u;
  });
  var Ja = k((Ar) => {
    "use strict";
    Object.defineProperty(Ar, "__esModule", { value: !0 });
    Ar.lao = void 0;
    var Qu = "[\\u{0E80}-\\u{0EFF}]",
      Xu = "[\\u{0EB1}\\u{0EB4}-\\u{0EBC}\\u{0EC8}-\\u{0ECD}]",
      Ju = "".concat(Qu).concat(Xu, "*");
    Ar.lao = Ju;
  });
  var eo = k((Or) => {
    "use strict";
    Object.defineProperty(Or, "__esModule", { value: !0 });
    Or.malayalam = void 0;
    var Za = "[\\u{0D00}-\\u{0D7F}]",
      Zu =
        "[\\u{0D00}-\\u{0D03}\\u{0D3B}\\u{0D3C}\\u{0D3E}-\\u{0D4D}\\u{0D57}\\u{0D62}-\\u{0D63}]",
      ed = "\\u{0D4D}",
      td = "".concat(Za, "(").concat(ed).concat(Za, "|").concat(Zu, ")*");
    Or.malayalam = td;
  });
  var ro = k((xr) => {
    "use strict";
    Object.defineProperty(xr, "__esModule", { value: !0 });
    xr.myanmar = void 0;
    var to = "[\\u{1000}-\\u{109F}]",
      rd = [
        "\\u{102B}-\\u{1038}",
        "\\u{103A}-\\u{103E}",
        "\\u{1056}-\\u{1059}",
        "\\u{105E}-\\u{1060}",
        "\\u{1062}-\\u{1064}",
        "\\u{1067}-\\u{106D}",
        "\\u{1071}-\\u{1074}",
        "\\u{1082}-\\u{108D}",
        "\\u{108F}",
        "\\u{109A}-\\u{109D}",
      ],
      id = "[".concat(rd.join(""), "]"),
      nd = "\\u{1039}",
      sd = "".concat(to, "(").concat(nd).concat(to, "|").concat(id, ")*");
    xr.myanmar = sd;
  });
  var io = k((Rr) => {
    "use strict";
    Object.defineProperty(Rr, "__esModule", { value: !0 });
    Rr.tamil = void 0;
    var ad = "[\\u{0B80}-\\u{0BFF}]",
      od = "[\\u{0B82}-\\u{0B83}\\u{0BBE}-\\u{0BD7}\\u{0962}\\u{0963}]",
      ld = "".concat(ad).concat(od, "*");
    Rr.tamil = ld;
  });
  var so = k((kr) => {
    "use strict";
    Object.defineProperty(kr, "__esModule", { value: !0 });
    kr.telugu = void 0;
    var no = "[\\u{0C00}-\\u{0C7F}]",
      pd = "[\\u{0C00}-\\u{0C04}\\u{0C3E}-\\u{0C56}\\u{0C62}\\u{0C63}]",
      cd = "\\u{0C4D}",
      ud = "".concat(no, "(").concat(cd).concat(no, "|").concat(pd, ")*");
    kr.telugu = ud;
  });
  var ao = k((Nr) => {
    "use strict";
    Object.defineProperty(Nr, "__esModule", { value: !0 });
    Nr.thai = void 0;
    var dd = "[\\u0E00-\\u0E7F]",
      md = "[\\u0E31\\u0E33-\\u0E3A\\u0E47-\\u0E4E]",
      gd = "".concat(dd).concat(md, "*");
    Nr.thai = gd;
  });
  var oo = k((wr) => {
    "use strict";
    Object.defineProperty(wr, "__esModule", { value: !0 });
    wr.tibetan = void 0;
    var bd = "[\\u{0F00}-\\u{0FFF}]",
      fd =
        "[\\0F18\\0F19\\0F35\\0F37\\0F39\\0F3E\\0F3F\\u{0F71}-\\u{0F87}\\u{0F8D}-\\u{0FBC}\\u{0FC6}]",
      yd = "".concat(bd).concat(fd, "*");
    wr.tibetan = yd;
  });
  var po = k((ve) => {
    "use strict";
    Object.defineProperty(ve, "__esModule", { value: !0 });
    ve.emojiVariation = ve.keyCap = ve.countryFlag = void 0;
    var _d = "[\\u{1F1E6}-\\u{1F1FF}]{2}";
    ve.countryFlag = _d;
    var hd = "[0-9#\\*][\\u{FE0F}]?\\u{20E3}";
    ve.keyCap = hd;
    var vd = [
        "[\\u{2600}-\\u{26FF}]",
        "[\\u{2700}-\\u{27BF}]",
        "[\\u{1F300}-\\u{1F5FF}]",
        "[\\u{1F600}-\\u{1F64F}]",
        "[\\u{1F680}-\\u{1F6FF}]",
        "[\\u{1F700}-\\u{1F77F}]",
        "[\\u{1F900}-\\u{1F9FF}]",
      ],
      lo = "(".concat(vd.join("|"), ")"),
      Sd = "\\u{200D}",
      Ed = "[\\u{FE0E}\\u{FE0F}]",
      Td = "[\\u{1F3FB}-\\u{1F3FF}]",
      Id = ""
        .concat(lo, "(")
        .concat(Sd)
        .concat(lo, "|")
        .concat(Td, "|")
        .concat(Ed, ")*");
    ve.emojiVariation = Id;
  });
  var uo = k((HI, co) => {
    "use strict";
    var Ad = Ba(),
      Od = qa(),
      xd = Ya(),
      Rd = Va(),
      kd = ja(),
      Nd = za(),
      wd = $a(),
      Cd = Xa(),
      Md = Ja(),
      Pd = eo(),
      Ld = ro(),
      Dd = io(),
      Ud = so(),
      Fd = ao(),
      Bd = oo(),
      on = po(),
      Gd = [
        on.countryFlag,
        on.keyCap,
        on.emojiVariation,
        Ad.arabic,
        Od.bengali,
        xd.devanagari,
        Rd.gujarati,
        kd.hebrew,
        Nd.japaneseKana,
        wd.kannada,
        Cd.khmer,
        Md.lao,
        Pd.malayalam,
        Ld.myanmar,
        Dd.tamil,
        Ud.telugu,
        Fd.thai,
        Bd.tibetan,
        ".",
      ],
      qd = new RegExp("(".concat(Gd.join("|"), ")"), "gu");
    function Hd(e) {
      return e.match(qd) || [];
    }
    i(Hd, "splitGraphemes");
    co.exports = { splitGraphemes: Hd };
  });
  var yo = k((sA, fo) => {
    "use strict";
    var Kd = i(function (t) {
      return new Promise(function (r) {
        return setTimeout(r, t);
      });
    }, "delay");
    fo.exports = Kd;
  });
  var y = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__;
  var _ = globalThis;
  var ee = "10.73.0";
  function Ee() {
    return (Te(_), _);
  }
  i(Ee, "getMainCarrier");
  function Te(e) {
    let t = (e.__SENTRY__ = e.__SENTRY__ || {});
    return ((t.version = t.version || ee), (t[ee] = t[ee] || {}));
  }
  i(Te, "getSentryCarrier");
  function K(e, t, r = _) {
    let n = (r.__SENTRY__ = r.__SENTRY__ || {}),
      s = (n[ee] = n[ee] || {});
    return s[e] || (s[e] = t());
  }
  i(K, "getGlobalSingleton");
  var Ue = ["debug", "info", "warn", "error", "log", "assert", "trace"],
    Ro = "Sentry Logger ",
    Ie = {};
  function H(e) {
    if (!("console" in _)) return e();
    let t = _.console,
      r = {},
      n = Object.keys(Ie);
    n.forEach((s) => {
      let a = Ie[s];
      ((r[s] = t[s]), (t[s] = a));
    });
    try {
      return e();
    } finally {
      n.forEach((s) => {
        t[s] = r[s];
      });
    }
  }
  i(H, "consoleSandbox");
  function ko() {
    Dr().enabled = !0;
  }
  i(ko, "enable");
  function No() {
    Dr().enabled = !1;
  }
  i(No, "disable");
  function gn() {
    return Dr().enabled;
  }
  i(gn, "isEnabled");
  function wo(...e) {
    Lr("log", ...e);
  }
  i(wo, "log");
  function Co(...e) {
    Lr("warn", ...e);
  }
  i(Co, "warn");
  function Mo(...e) {
    Lr("error", ...e);
  }
  i(Mo, "error");
  function Lr(e, ...t) {
    y &&
      gn() &&
      H(() => {
        _.console[e](`${Ro}[${e}]:`, ...t);
      });
  }
  i(Lr, "_maybeLog");
  function Dr() {
    return y ? K("loggerSettings", () => ({ enabled: !1 })) : { enabled: !1 };
  }
  i(Dr, "_getLoggerSettings");
  var f = {
    enable: ko,
    disable: No,
    isEnabled: gn,
    log: wo,
    warn: Co,
    error: Mo,
  };
  var bn = /\(error: (.*)\)/,
    fn = /captureMessage|captureException/;
  function Pt(...e) {
    let t = e.sort((r, n) => r[0] - n[0]).map((r) => r[1]);
    return (r, n = 0, s = 0) => {
      let a = [],
        c = r.split(`
`);
      for (let o = n; o < c.length; o++) {
        let l = c[o];
        l.length > 1024 && (l = l.slice(0, 1024));
        let p = bn.test(l) ? l.replace(bn, "$1") : l;
        if (!p.includes("Error: ")) {
          for (let g of t) {
            let u = g(p);
            if (u) {
              a.push(u);
              break;
            }
          }
          if (a.length >= 50 + s) break;
        }
      }
      return yn(a.slice(s));
    };
  }
  i(Pt, "createStackParser");
  function Fr(e) {
    return Array.isArray(e) ? Pt(...e) : e;
  }
  i(Fr, "stackParserFromStackParserOptions");
  function yn(e) {
    if (!e.length) return [];
    let t = Array.from(e);
    return (
      /sentryWrapped/.test(Mt(t).function || "") && t.pop(),
      t.reverse(),
      fn.test(Mt(t).function || "") &&
        (t.pop(), fn.test(Mt(t).function || "") && t.pop()),
      t.slice(0, 50).map((r) => ({
        ...r,
        filename: r.filename || Mt(t).filename,
        function: r.function || "?",
      }))
    );
  }
  i(yn, "stripSentryFramesAndReverse");
  function Mt(e) {
    return e[e.length - 1] || {};
  }
  i(Mt, "getLastStackFrame");
  var Ur = "<anonymous>";
  function W(e) {
    try {
      return !e || typeof e != "function" ? Ur : e.name || Ur;
    } catch {
      return Ur;
    }
  }
  i(W, "getFunctionName");
  function Lt(e) {
    let t = e.exception;
    if (t) {
      let r = [];
      try {
        return (
          t.values.forEach((n) => {
            n.stacktrace.frames && r.push(...n.stacktrace.frames);
          }),
          r
        );
      } catch {
        return;
      }
    }
  }
  i(Lt, "getFramesFromEvent");
  var tt = {},
    _n = {};
  function P(e, t) {
    return (
      (tt[e] = tt[e] || []),
      tt[e].push(t),
      () => {
        let r = tt[e];
        if (r) {
          let n = r.indexOf(t);
          n !== -1 && r.splice(n, 1);
        }
      }
    );
  }
  i(P, "addHandler");
  function L(e, t) {
    if (!_n[e]) {
      _n[e] = !0;
      try {
        t();
      } catch (r) {
        y && f.error(`Error while instrumenting ${e}`, r);
      }
    }
  }
  i(L, "maybeInstrument");
  function N(e, t) {
    let r = e && tt[e];
    if (r)
      for (let n of r)
        try {
          n(t);
        } catch (s) {
          y &&
            f.error(
              `Error while triggering instrumentation handler.
Type: ${e}
Name: ${W(n)}
Error:`,
              s,
            );
        }
  }
  i(N, "triggerHandlers");
  var Br = null;
  function Gr(e) {
    let t = "error";
    (P(t, e), L(t, Po));
  }
  i(Gr, "addGlobalErrorInstrumentationHandler");
  function Po() {
    ((Br = _.onerror),
      (_.onerror = function (e, t, r, n, s) {
        return (
          N("error", { column: n, error: s, line: r, msg: e, url: t }),
          Br ? Br.apply(this, arguments) : !1
        );
      }),
      (_.onerror.__SENTRY_INSTRUMENTED__ = !0));
  }
  i(Po, "instrumentError");
  var qr = null;
  function Hr(e) {
    let t = "unhandledrejection";
    (P(t, e), L(t, Lo));
  }
  i(Hr, "addGlobalUnhandledRejectionInstrumentationHandler");
  function Lo() {
    ((qr = _.onunhandledrejection),
      (_.onunhandledrejection = function (e) {
        return (
          N("unhandledrejection", e),
          qr ? qr.apply(this, arguments) : !0
        );
      }),
      (_.onunhandledrejection.__SENTRY_INSTRUMENTED__ = !0));
  }
  i(Lo, "instrumentUnhandledRejection");
  var hn = Object.prototype.toString;
  function w(e) {
    switch (hn.call(e)) {
      case "[object Error]":
      case "[object Exception]":
      case "[object DOMException]":
      case "[object WebAssembly.Exception]":
        return !0;
      default:
        return it(e, Error);
    }
  }
  i(w, "isError");
  function Fe(e, t) {
    return hn.call(e) === `[object ${t}]`;
  }
  i(Fe, "isBuiltin");
  function Be(e) {
    return Fe(e, "ErrorEvent");
  }
  i(Be, "isErrorEvent");
  function rt(e) {
    return Fe(e, "DOMError");
  }
  i(rt, "isDOMError");
  function Dt(e) {
    return Fe(e, "DOMException");
  }
  i(Dt, "isDOMException");
  function C(e) {
    return Fe(e, "String");
  }
  i(C, "isString");
  function ce(e) {
    return (
      typeof e == "object" &&
      e !== null &&
      "__sentry_template_string__" in e &&
      "__sentry_template_values__" in e
    );
  }
  i(ce, "isParameterizedString");
  function $(e) {
    return (
      e === null || ce(e) || (typeof e != "object" && typeof e != "function")
    );
  }
  i($, "isPrimitive");
  function te(e) {
    return Fe(e, "Object");
  }
  i(te, "isPlainObject");
  function oe(e) {
    return typeof e == "object" && e !== null;
  }
  i(oe, "isObjectLike");
  function ue(e) {
    return typeof Event < "u" && it(e, Event);
  }
  i(ue, "isEvent");
  function Ut(e) {
    return Fe(e, "RegExp");
  }
  i(Ut, "isRegExp");
  function Q(e) {
    return !!(e?.then && typeof e.then == "function");
  }
  i(Q, "isThenable");
  function it(e, t) {
    try {
      return e instanceof t;
    } catch {
      return !1;
    }
  }
  i(it, "isInstanceOf");
  function Yr(e) {
    return typeof Request < "u" && it(e, Request);
  }
  i(Yr, "isRequest");
  function x(e, t, r) {
    if (!(t in e)) return;
    let n = e[t];
    if (typeof n != "function") return;
    let s = r(n);
    typeof s == "function" && nt(s, n);
    try {
      e[t] = s;
    } catch {
      y && f.log(`Failed to replace method "${t}" in object`, e);
    }
  }
  i(x, "fill");
  function D(e, t, r) {
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
  i(D, "addNonEnumerableProperty");
  function nt(e, t) {
    try {
      let r = t.prototype || {};
      ((e.prototype = t.prototype = r), D(e, "__sentry_original__", t));
    } catch {}
  }
  i(nt, "markFunctionWrapped");
  function de(e) {
    return e.__sentry_original__;
  }
  i(de, "getOriginalFunction");
  function st(e) {
    if (w(e))
      return { message: e.message, name: e.name, stack: e.stack, ...vn(e) };
    if (ue(e)) {
      let { type: t, target: r, currentTarget: n, detail: s } = e;
      return {
        type: t,
        target: r,
        currentTarget: n,
        ...(s ? { detail: s } : {}),
        ...vn(e),
      };
    }
    return e;
  }
  i(st, "convertToPlainObject");
  function vn(e) {
    return oe(e) ? Object.fromEntries(Object.entries(e)) : {};
  }
  i(vn, "getOwnProperties");
  function Ft(e) {
    let t = Object.keys(st(e));
    return (t.sort(), t[0] ? t.join(", ") : "[object has no keys]");
  }
  i(Ft, "extractExceptionKeysForMessage");
  var Ge;
  function qe(e) {
    if (Ge !== void 0) return Ge ? Ge(e) : e();
    let t = Symbol.for("__SENTRY_SAFE_RANDOM_ID_WRAPPER__"),
      r = _;
    return t in r && typeof r[t] == "function"
      ? ((Ge = r[t]), Ge(e))
      : ((Ge = null), e());
  }
  i(qe, "withRandomSafeContext");
  function Ae() {
    return qe(() => Math.random());
  }
  i(Ae, "safeMathRandom");
  function re() {
    return qe(() => Date.now());
  }
  i(re, "safeDateNow");
  var Do = Symbol.for("sentry.skipNormalization"),
    Uo = Symbol.for("sentry.overrideNormalizationDepth");
  function Sn(e) {
    return !!e[Do];
  }
  i(Sn, "hasSkipNormalizationHint");
  function En(e) {
    let t = e[Uo];
    return typeof t == "number" ? t : void 0;
  }
  i(En, "getNormalizationDepthOverrideHint");
  var Wr;
  function jr(e) {
    Wr = e;
  }
  i(jr, "setNormalizeStringifier");
  function V(e, t = 100, r = 1 / 0) {
    try {
      return Vr("", e, t, r);
    } catch (n) {
      return { ERROR: `**non-serializable** (${n})` };
    }
  }
  i(V, "normalize");
  function Bt(e, t = 3, r = 100 * 1024) {
    let n = V(e, t);
    return Go(n) > r ? Bt(e, t - 1, r) : n;
  }
  i(Bt, "normalizeToSize");
  function Vr(e, t, r = 1 / 0, n = 1 / 0, s = qo()) {
    let [a, c] = s;
    if (
      t == null ||
      ["boolean", "string"].includes(typeof t) ||
      (typeof t == "number" && Number.isFinite(t))
    )
      return t;
    let o = zr(e, t);
    if (!o.startsWith("[object ")) return o;
    if (Sn(t)) return t;
    let l = En(t),
      p = l !== void 0 ? l : r;
    if (p === 0) return o.replace("object ", "");
    if (a(t)) return "[Circular ~]";
    let g = t;
    if (g && typeof g.toJSON == "function")
      try {
        let b = g.toJSON();
        return Vr("", b, p - 1, n, s);
      } catch {}
    let u = Array.isArray(t) ? [] : {},
      m = 0,
      d = st(t);
    for (let b in d) {
      if (!Object.prototype.hasOwnProperty.call(d, b)) continue;
      if (m >= n) {
        u[b] = "[MaxProperties ~]";
        break;
      }
      let h = d[b];
      ((u[b] = Vr(b, h, p - 1, n, s)), m++);
    }
    return (c(t), u);
  }
  i(Vr, "visit");
  function zr(e, t) {
    try {
      if (Wr) {
        let n = Wr(t);
        if (n) return n;
      }
      return typeof global < "u" && t === global
        ? "[Global]"
        : typeof t == "number" && !Number.isFinite(t)
          ? `[${t}]`
          : typeof t == "function"
            ? `[Function: ${W(t)}]`
            : typeof t == "symbol"
              ? `[${String(t)}]`
              : typeof t == "bigint"
                ? `[BigInt: ${String(t)}]`
                : `[object ${Fo(t)}]`;
    } catch (r) {
      return `**non-serializable** (${r})`;
    }
  }
  i(zr, "stringifyValue");
  function Fo(e) {
    let t = Object.getPrototypeOf(e);
    return t?.constructor ? t.constructor.name : "null prototype";
  }
  i(Fo, "getConstructorName");
  function Bo(e) {
    return ~-encodeURI(e).split(/%..|./).length;
  }
  i(Bo, "utf8Length");
  function Go(e) {
    return Bo(JSON.stringify(e));
  }
  i(Go, "jsonSize");
  function qo() {
    let e = new WeakSet();
    function t(n) {
      return e.has(n) ? !0 : (e.add(n), !1);
    }
    i(t, "memoize");
    function r(n) {
      e.delete(n);
    }
    return (i(r, "unmemoize"), [t, r]);
  }
  i(qo, "memoBuilder");
  function He(e, t = 0) {
    return typeof e != "string" || t === 0 || e.length <= t
      ? e
      : `${e.slice(0, t)}...`;
  }
  i(He, "truncate");
  function Oe(e, t) {
    if (!Array.isArray(e)) return "";
    let r = [];
    for (let n = 0; n < e.length; n++) {
      let s = e[n];
      $(s)
        ? r.push(String(s))
        : s instanceof Error
          ? r.push(s.message ? `${s.name}: ${s.message}` : s.name)
          : r.push(zr(void 0, s));
    }
    return r.join(t);
  }
  i(Oe, "safeJoin");
  function xe(e, t, r = !1) {
    return C(e)
      ? Ut(t)
        ? t.test(e)
        : C(t)
          ? r
            ? e === t
            : e.includes(t)
          : typeof t == "function"
            ? t(e)
            : !1
      : !1;
  }
  i(xe, "isMatchingPattern");
  function me(e, t = [], r = !1) {
    for (let n of t) if (xe(e, n, r)) return !0;
    return !1;
  }
  i(me, "stringMatchesSomePattern");
  function Ho() {
    let e = _;
    return e.crypto || e.msCrypto;
  }
  i(Ho, "getCrypto");
  var Kr;
  function Yo() {
    return Ae() * 16;
  }
  i(Yo, "getRandomByte");
  function R(e = Ho()) {
    try {
      if (e?.randomUUID) return qe(() => e.randomUUID()).replace(/-/g, "");
    } catch {}
    return (
      Kr || (Kr = "10000000100040008000" + 1e11),
      Kr.replace(/[018]/g, (t) => (t ^ ((Yo() & 15) >> (t / 4))).toString(16))
    );
  }
  i(R, "uuid4");
  function Tn(e) {
    return e.exception?.values?.[0];
  }
  i(Tn, "getFirstException");
  function X(e) {
    let { message: t, event_id: r } = e;
    if (t) return t;
    let n = Tn(e);
    return n
      ? n.type && n.value
        ? `${n.type}: ${n.value}`
        : n.type || n.value || r || "<unknown>"
      : r || "<unknown>";
  }
  i(X, "getEventDescription");
  function Re(e, t, r) {
    let n = (e.exception = e.exception || {}),
      s = (n.values = n.values || []),
      a = (s[0] = s[0] || {});
    (a.value || (a.value = t || ""), a.type || (a.type = r || "Error"));
  }
  i(Re, "addExceptionTypeValue");
  function F(e, t) {
    let r = Tn(e);
    if (!r) return;
    let n = { type: "generic", handled: !0 },
      s = r.mechanism;
    if (((r.mechanism = { ...n, ...s, ...t }), t && "data" in t)) {
      let a = { ...s?.data, ...t.data };
      r.mechanism.data = a;
    }
  }
  i(F, "addExceptionMechanism");
  function at(e) {
    if ($r(e)) return !0;
    try {
      D(e, "__sentry_captured__", !0);
    } catch {}
    return !1;
  }
  i(at, "checkOrSetAlreadyCaught");
  function $r(e) {
    try {
      return e.__sentry_captured__;
    } catch {}
  }
  i($r, "isAlreadyCaptured");
  var An = 1e3;
  function ie() {
    return re() / An;
  }
  i(ie, "dateTimestampInSeconds");
  function Wo() {
    let { performance: e } = _;
    if (!e?.now || !e.timeOrigin) return ie;
    let t = e.timeOrigin;
    return () => (t + qe(() => e.now())) / An;
  }
  i(Wo, "createUnixTimestampInSecondsFunc");
  var In;
  function B() {
    return (In ?? (In = Wo()))();
  }
  i(B, "timestampInSeconds");
  function On(e) {
    let t = B(),
      r = {
        sid: R(),
        init: !0,
        timestamp: t,
        started: t,
        duration: 0,
        status: "ok",
        errors: 0,
        ignoreDuration: !1,
        toJSON: i(() => Vo(r), "toJSON"),
      };
    return (e && le(r, e), r);
  }
  i(On, "makeSession");
  function le(e, t = {}) {
    if (
      (t.user &&
        (!e.ipAddress && t.user.ip_address && (e.ipAddress = t.user.ip_address),
        !e.did &&
          !t.did &&
          (e.did = t.user.id || t.user.email || t.user.username)),
      (e.timestamp = t.timestamp || B()),
      t.abnormal_mechanism && (e.abnormal_mechanism = t.abnormal_mechanism),
      t.ignoreDuration && (e.ignoreDuration = t.ignoreDuration),
      t.sid && (e.sid = t.sid.length === 32 ? t.sid : R()),
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
  i(le, "updateSession");
  function xn(e, t) {
    let r = {};
    (t ? (r = { status: t }) : e.status === "ok" && (r = { status: "exited" }),
      le(e, r));
  }
  i(xn, "closeSession");
  function Vo(e) {
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
  i(Vo, "sessionToJSON");
  function ge(e, t, r = 2) {
    if (!t || typeof t != "object" || r <= 0) return t;
    if (e && Object.keys(t).length === 0) return e;
    let n = { ...e };
    for (let s in t)
      Object.prototype.hasOwnProperty.call(t, s) &&
        (n[s] = ge(n[s], t[s], r - 1));
    return n;
  }
  i(ge, "merge");
  function Qr() {
    return R();
  }
  i(Qr, "generateTraceId");
  function Gt() {
    return R().substring(16);
  }
  i(Gt, "generateSpanId");
  function Xr(e) {
    try {
      let t = _.WeakRef;
      if (typeof t == "function") return new t(e);
    } catch {}
    return e;
  }
  i(Xr, "makeWeakRef");
  function qt(e) {
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
  i(qt, "derefWeakRef");
  var Jr = "_sentrySpan";
  function Zr(e, t) {
    t ? D(e, Jr, Xr(t)) : delete e[Jr];
  }
  i(Zr, "_setSpanForScope");
  function ei(e) {
    return qt(e[Jr]);
  }
  i(ei, "_getSpanForScope");
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
          (this._propagationContext = { traceId: Qr(), sampleRand: Ae() }));
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
          Zr(t, ei(this)),
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
          this._session && le(this._session, { user: t }),
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
          n = r instanceof ot ? r.getScopeData() : te(r) ? t : void 0,
          {
            tags: s,
            attributes: a,
            extra: c,
            user: o,
            contexts: l,
            level: p,
            fingerprint: g = [],
            propagationContext: u,
            conversationId: m,
          } = n || {};
        return (
          (this._tags = { ...this._tags, ...s }),
          (this._attributes = { ...this._attributes, ...a }),
          (this._extra = { ...this._extra, ...c }),
          (this._contexts = { ...this._contexts, ...l }),
          o && Object.keys(o).length && (this._user = o),
          p && (this._level = p),
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
          Zr(this, void 0),
          (this._attachments = []),
          this.setPropagationContext({ traceId: Qr(), sampleRand: Ae() }),
          this._notifyScopeListeners(),
          this
        );
      }
      addBreadcrumb(t, r) {
        let n = typeof r == "number" ? r : jo;
        if (n <= 0) return this;
        let s = {
          timestamp: ie(),
          ...t,
          message: t.message ? He(t.message, 2048) : t.message,
        };
        return (
          this._breadcrumbs.push(s),
          this._breadcrumbs.length > n &&
            ((this._breadcrumbs = this._breadcrumbs.slice(-n)),
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
          span: ei(this),
          conversationId: this._conversationId,
        };
      }
      setSDKProcessingMetadata(t) {
        return (
          (this._sdkProcessingMetadata = ge(this._sdkProcessingMetadata, t, 2)),
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
        let n = r?.event_id || R();
        if (!this._client)
          return (
            y &&
              f.warn(
                "No client configured on scope - will not capture exception!",
              ),
            n
          );
        let s = new Error("Sentry syntheticException");
        return (
          this._client.captureException(
            t,
            { originalException: t, syntheticException: s, ...r, event_id: n },
            this,
          ),
          n
        );
      }
      captureMessage(t, r, n) {
        let s = n?.event_id || R();
        if (!this._client)
          return (
            y &&
              f.warn(
                "No client configured on scope - will not capture message!",
              ),
            s
          );
        let a = n?.syntheticException ?? new Error(t);
        return (
          this._client.captureMessage(
            t,
            r,
            { originalException: t, syntheticException: a, ...n, event_id: s },
            this,
          ),
          s
        );
      }
      captureEvent(t, r) {
        let n = t.event_id || r?.event_id || R();
        return this._client
          ? (this._client.captureEvent(t, { ...r, event_id: n }, this), n)
          : (y &&
              f.warn("No client configured on scope - will not capture event!"),
            n);
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
  i(ot, "Scope");
  var G = ot;
  function Rn() {
    return K("defaultCurrentScope", () => new G());
  }
  i(Rn, "getDefaultCurrentScope");
  function kn() {
    return K("defaultIsolationScope", () => new G());
  }
  i(kn, "getDefaultIsolationScope");
  var Nn = i((e) => e instanceof Promise && !e[wn], "isActualPromise"),
    wn = Symbol("chained PromiseLike"),
    Cn = i((e, t, r) => {
      let n = e.then(
        (s) => (t(s), s),
        (s) => {
          throw (r(s), s);
        },
      );
      return Nn(n) && Nn(e) ? n : zo(e, n);
    }, "chainAndCopyPromiseLike"),
    zo = i((e, t) => {
      if (!t) return e;
      let r = !1;
      for (let n in e) {
        if (n in t) continue;
        r = !0;
        let s = e[n];
        typeof s == "function"
          ? Object.defineProperty(t, n, {
              value: i((...a) => s.apply(e, a), "value"),
              enumerable: !0,
              configurable: !0,
              writable: !0,
            })
          : (t[n] = s);
      }
      return (r && Object.assign(t, { [wn]: !0 }), t);
    }, "copyProps");
  var ri = class ri {
    constructor(t, r) {
      let n;
      t ? (n = t) : (n = new G());
      let s;
      (r ? (s = r) : (s = new G()),
        (this._stack = [{ scope: n }]),
        (this._isolationScope = s));
    }
    withScope(t) {
      let r = this._pushScope(),
        n;
      try {
        n = t(r);
      } catch (s) {
        throw (this._popScope(), s);
      }
      return Q(n)
        ? Cn(
            n,
            () => this._popScope(),
            () => this._popScope(),
          )
        : (this._popScope(), n);
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
  i(ri, "AsyncContextStack");
  var ti = ri;
  function Ye() {
    let e = Ee(),
      t = Te(e);
    return (t.stack = t.stack || new ti(Rn(), kn()));
  }
  i(Ye, "getAsyncContextStack");
  function Ko(e) {
    return Ye().withScope(e);
  }
  i(Ko, "withScope");
  function $o(e, t) {
    let r = Ye();
    return r.withScope(() => ((r.getStackTop().scope = e), t(e)));
  }
  i($o, "withSetScope");
  function Mn(e) {
    return Ye().withScope(() => e(Ye().getIsolationScope()));
  }
  i(Mn, "withIsolationScope");
  function Pn() {
    return {
      withIsolationScope: Mn,
      withScope: Ko,
      withSetScope: $o,
      withSetIsolationScope: i((e, t) => Mn(t), "withSetIsolationScope"),
      getCurrentScope: i(() => Ye().getScope(), "getCurrentScope"),
      getIsolationScope: i(() => Ye().getIsolationScope(), "getIsolationScope"),
    };
  }
  i(Pn, "getStackAsyncContextStrategy");
  function Ht(e) {
    let t = Te(e);
    return t.acs ? t.acs : Pn();
  }
  i(Ht, "getAsyncContextStrategy");
  function Qo(e) {
    return (
      typeof e == "object" &&
      e != null &&
      !Array.isArray(e) &&
      Object.keys(e).includes("value")
    );
  }
  i(Qo, "isAttributeObject");
  function Xo(e, t) {
    let { value: r, unit: n } = Qo(e) ? e : { value: e, unit: void 0 },
      s = Jo(r),
      a = n && typeof n == "string" ? { unit: n } : {};
    if (s) return { ...s, ...a };
    if (!t || (t === "skip-undefined" && r === void 0)) return;
    let c = "";
    try {
      c = JSON.stringify(r) ?? "";
    } catch {}
    return { value: c, type: "string", ...a };
  }
  i(Xo, "attributeValueToTypedAttributeValue");
  function ii(e, t = !1) {
    let r = {};
    for (let [n, s] of Object.entries(e ?? {})) {
      let a = Xo(s, t);
      a && (r[n] = a);
    }
    return r;
  }
  i(ii, "serializeAttributes");
  function Jo(e) {
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
  i(Jo, "getTypedAttributeValue");
  var Zo;
  function Ln() {
    return Zo?.();
  }
  i(Ln, "getExternalPropagationContext");
  function U() {
    let e = Ee();
    return Ht(e).getCurrentScope();
  }
  i(U, "getCurrentScope");
  function q() {
    let e = Ee();
    return Ht(e).getIsolationScope();
  }
  i(q, "getIsolationScope");
  function Yt() {
    return K("globalScope", () => new G());
  }
  i(Yt, "getGlobalScope");
  function We(...e) {
    let t = Ee(),
      r = Ht(t);
    if (e.length === 2) {
      let [n, s] = e;
      return n ? r.withSetScope(n, s) : r.withScope(s);
    }
    return r.withScope(e[0]);
  }
  i(We, "withScope");
  function T() {
    return U().getClient();
  }
  i(T, "getClient");
  function ni(e) {
    let t = Ln();
    if (t) return { trace_id: t.traceId, span_id: t.spanId };
    let r = e.getPropagationContext(),
      { traceId: n, parentSpanId: s, propagationSpanId: a } = r,
      c = { trace_id: n, span_id: a || Gt() };
    return (s && (c.parent_span_id = s), c);
  }
  i(ni, "getTraceContextFromScope");
  var lt = "sentry.source",
    Wt = "sentry.sample_rate",
    si = "sentry.previous_trace_sample_rate",
    Ve = "sentry.op",
    Vt = "sentry.origin";
  var jt = "sentry.profile_id",
    zt = "sentry.exclusive_time";
  var ai = "gen_ai.conversation.id";
  var el = "_sentryScope",
    tl = "_sentryIsolationScope";
  function pt(e) {
    let t = e;
    return { scope: t[el], isolationScope: qt(t[tl]) };
  }
  i(pt, "getCapturedScopesOnSpan");
  var Dn = "sentry-";
  function Fn(e) {
    let t = rl(e);
    if (!t) return;
    let r = Object.entries(t).reduce((n, [s, a]) => {
      if (s.startsWith(Dn)) {
        let c = s.slice(Dn.length);
        n[c] = a;
      }
      return n;
    }, {});
    if (Object.keys(r).length > 0) return r;
  }
  i(Fn, "baggageHeaderToDynamicSamplingContext");
  function rl(e) {
    if (!(!e || (!C(e) && !Array.isArray(e))))
      return Array.isArray(e)
        ? e.reduce((t, r) => {
            let n = Un(r);
            return (
              Object.entries(n).forEach(([s, a]) => {
                t[s] = a;
              }),
              t
            );
          }, {})
        : Un(e);
  }
  i(rl, "parseBaggageHeader");
  function Un(e) {
    return e
      .split(",")
      .map((t) => {
        let r = t.indexOf("=");
        if (r === -1) return [];
        let n = t.slice(0, r),
          s = t.slice(r + 1);
        return [n, s].map((a) => {
          try {
            return decodeURIComponent(a.trim());
          } catch {
            return;
          }
        });
      })
      .reduce((t, [r, n]) => (r && n && (t[r] = n), t), {});
  }
  i(Un, "baggageHeaderToObject");
  var il = /^o(\d+)\./,
    nl =
      /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)((?:\[[:.%\w]+\]|[\w.-]+))(?::(\d+))?\/(.+)/;
  function sl(e) {
    return e === "http" || e === "https";
  }
  i(sl, "isValidProtocol");
  function ne(e, t = !1) {
    let {
      host: r,
      path: n,
      pass: s,
      port: a,
      projectId: c,
      protocol: o,
      publicKey: l,
    } = e;
    return `${o}://${l}${t && s ? `:${s}` : ""}@${r}${a ? `:${a}` : ""}/${n && `${n}/`}${c}`;
  }
  i(ne, "dsnToString");
  function al(e) {
    let t = nl.exec(e);
    if (!t) {
      H(() => {
        console.error(`Invalid Sentry Dsn: ${e}`);
      });
      return;
    }
    let [r, n, s = "", a = "", c = "", o = ""] = t.slice(1),
      l = "",
      p = o,
      g = p.split("/");
    if ((g.length > 1 && ((l = g.slice(0, -1).join("/")), (p = g.pop())), p)) {
      let u = p.match(/^\d+/);
      u && (p = u[0]);
    }
    return Bn({
      host: a,
      pass: s,
      path: l,
      projectId: p,
      port: c,
      protocol: r,
      publicKey: n,
    });
  }
  i(al, "dsnFromString");
  function Bn(e) {
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
  i(Bn, "dsnFromComponents");
  function ol(e) {
    if (!y) return !0;
    let { port: t, projectId: r, protocol: n } = e;
    return ["protocol", "publicKey", "host", "projectId"].find((c) =>
      e[c] ? !1 : (f.error(`Invalid Sentry Dsn: ${c} missing`), !0),
    )
      ? !1
      : r.match(/^\d+$/)
        ? sl(n)
          ? t && isNaN(parseInt(t, 10))
            ? (f.error(`Invalid Sentry Dsn: Invalid port ${t}`), !1)
            : !0
          : (f.error(`Invalid Sentry Dsn: Invalid protocol ${n}`), !1)
        : (f.error(`Invalid Sentry Dsn: Invalid projectId ${r}`), !1);
  }
  i(ol, "validateDsn");
  function ll(e) {
    return e.match(il)?.[1];
  }
  i(ll, "extractOrgIdFromDsnHost");
  function Gn(e) {
    let t = e.getOptions(),
      { host: r } = e.getDsn() || {},
      n;
    return (t.orgId ? (n = String(t.orgId)) : r && (n = ll(r)), n);
  }
  i(Gn, "extractOrgIdFromClient");
  function qn(e) {
    let t = typeof e == "string" ? al(e) : Bn(e);
    if (!(!t || !ol(t))) return t;
  }
  i(qn, "makeDsn");
  function Hn(e) {
    if (typeof e == "boolean") return Number(e);
    let t = typeof e == "string" ? parseFloat(e) : e;
    if (!(typeof t != "number" || isNaN(t) || t < 0 || t > 1)) return t;
  }
  i(Hn, "parseSampleRate");
  var jn = 1,
    Yn = !1;
  function zn(e) {
    let { spanId: t, traceId: r, isRemote: n } = e.spanContext(),
      s = n ? t : be(e).parent_span_id,
      a = pt(e).scope,
      c = n ? a?.getPropagationContext().propagationSpanId || Gt() : t;
    return { parent_span_id: s, span_id: c, trace_id: r };
  }
  i(zn, "spanToTraceContext");
  function ul(e) {
    if (e && e.length > 0)
      return e.map(
        ({
          context: { spanId: t, traceId: r, traceFlags: n, ...s },
          attributes: a,
        }) => ({
          span_id: t,
          trace_id: r,
          sampled: n === jn,
          attributes: a,
          ...s,
        }),
      );
  }
  i(ul, "convertSpanLinksForEnvelope");
  function Wn(e) {
    return typeof e == "number"
      ? Vn(e)
      : Array.isArray(e)
        ? e[0] + e[1] / 1e9
        : e instanceof Date
          ? Vn(e.getTime())
          : B();
  }
  i(Wn, "spanTimeInputToSeconds");
  function Vn(e) {
    return e > 9999999999 ? e / 1e3 : e;
  }
  i(Vn, "ensureTimestampInSeconds");
  function be(e) {
    if (gl(e)) return e.getSpanJSON();
    let { spanId: t, traceId: r } = e.spanContext();
    if (ml(e)) {
      let {
        attributes: n,
        startTime: s,
        name: a,
        endTime: c,
        status: o,
        links: l,
      } = e;
      return {
        span_id: t,
        trace_id: r,
        data: n,
        description: a,
        parent_span_id: dl(e),
        start_timestamp: Wn(s),
        timestamp: Wn(c) || void 0,
        status: bl(o),
        op: n[Ve],
        origin: n[Vt],
        links: ul(l),
      };
    }
    return { span_id: t, trace_id: r, start_timestamp: 0, data: {} };
  }
  i(be, "spanToJSON");
  function dl(e) {
    return "parentSpanId" in e
      ? e.parentSpanId
      : "parentSpanContext" in e
        ? e.parentSpanContext?.spanId
        : void 0;
  }
  i(dl, "getOtelParentSpanId");
  function Kn(e) {
    return {
      ...e,
      attributes: ii(e.attributes),
      links: e.links?.map((t) => ({ ...t, attributes: ii(t.attributes) })),
    };
  }
  i(Kn, "streamedSpanJsonToSerializedSpan");
  function ml(e) {
    let t = e;
    return (
      !!t.attributes && !!t.startTime && !!t.name && !!t.endTime && !!t.status
    );
  }
  i(ml, "spanIsOpenTelemetrySdkTraceBaseSpan");
  function gl(e) {
    return typeof e.getSpanJSON == "function";
  }
  i(gl, "spanIsSentrySpan");
  function $n(e) {
    let { traceFlags: t } = e.spanContext();
    return t === jn;
  }
  i($n, "spanIsSampled");
  function bl(e) {
    if (!(!e || e.code === 0))
      return e.code === 1 ? "ok" : e.message || "internal_error";
  }
  i(bl, "getStatusMessage");
  var fl = "_sentryRootSpan";
  var ct = yl;
  function yl(e) {
    return e[fl] || e;
  }
  i(yl, "INTERNAL_getSegmentSpan");
  function oi() {
    Yn ||
      (H(() => {
        console.warn(
          "[Sentry] Returning null from `beforeSendSpan` is disallowed. To drop certain spans, configure the respective integrations directly or use `ignoreSpans`.",
        );
      }),
      (Yn = !0));
  }
  i(oi, "showSpanDropWarning");
  function li(e) {
    if (typeof __SENTRY_TRACING__ == "boolean" && !__SENTRY_TRACING__)
      return !1;
    let t = e || T()?.getOptions();
    return !!t && (t.tracesSampleRate != null || !!t.tracesSampler);
  }
  i(li, "hasSpansEnabled");
  function Qn(e) {
    f.log(
      `Ignoring span ${e.op} - ${e.description} because it matches \`ignoreSpans\`.`,
    );
  }
  i(Qn, "logIgnoredSpan");
  function pi(e, t) {
    if (!t?.length) return !1;
    for (let r of t) {
      if (hl(r)) {
        if (e.description && xe(e.description, r)) return (y && Qn(e), !0);
        continue;
      }
      let n = !!r.attributes && Object.keys(r.attributes).length > 0;
      if (!r.name && !r.op && !n) continue;
      let s = r.name ? e.description && xe(e.description, r.name) : !0,
        a = r.op ? e.op && xe(e.op, r.op) : !0,
        c = r.attributes
          ? Object.entries(r.attributes).every(([o, l]) =>
              _l(e.attributes?.[o], l),
            )
          : !0;
      if (s && a && c) return (y && Qn(e), !0);
    }
    return !1;
  }
  i(pi, "shouldIgnoreSpan");
  function _l(e, t) {
    return typeof e == "string" && (typeof t == "string" || t instanceof RegExp)
      ? xe(e, t)
      : Array.isArray(e) && Array.isArray(t)
        ? e.length === t.length && e.every((r, n) => r === t[n])
        : e === t;
  }
  i(_l, "_matchesAttributeValue");
  function Xn(e, t) {
    let r = t.parent_span_id,
      n = t.span_id;
    if (r) for (let s of e) s.parent_span_id === n && (s.parent_span_id = r);
  }
  i(Xn, "reparentChildSpans");
  function hl(e) {
    return typeof e == "string" || e instanceof RegExp;
  }
  i(hl, "isStringOrRegExp");
  var vl = Symbol.for("sentry.nonRecordingSpan");
  function Jn(e) {
    return !!e && e[vl] === !0;
  }
  i(Jn, "spanIsNonRecordingSpan");
  var je = "production";
  var Sl = "_frozenDsc";
  function Zn(e, t) {
    let r = t.getOptions(),
      { publicKey: n } = t.getDsn() || {},
      s = {
        environment: r.environment || je,
        release: r.release,
        public_key: n,
        trace_id: e,
        org_id: Gn(t),
      };
    return (t.emit("createDsc", s), s);
  }
  i(Zn, "getDynamicSamplingContextFromClient");
  function ci(e, t) {
    let r = t.getPropagationContext();
    return r.dsc || Zn(r.traceId, e);
  }
  i(ci, "getDynamicSamplingContextFromScope");
  function es(e) {
    let t = T();
    if (!t) return {};
    let r = ct(e),
      n = be(r),
      s = n.data,
      a = r.spanContext().traceState,
      c = a?.get("sentry.sample_rate") ?? s[Wt] ?? s[si];
    function o(S) {
      return (
        (typeof c == "number" || typeof c == "string") &&
          (S.sample_rate = `${c}`),
        S
      );
    }
    i(o, "applyLocalSampleRateToDsc");
    let l = r[Sl];
    if (l) return o(l);
    let p = Jn(r),
      g = p && r.dropReason === "ignored";
    if (p && (!li(t.getOptions()) || g)) {
      let S = pt(r).scope;
      if (S) {
        let O = { ...ci(t, S) };
        return (g && (O.sampled = "false"), o(O));
      }
    }
    let u = a?.get("sentry.dsc"),
      m = u && Fn(u);
    if (m) return o(m);
    let d = Zn(e.spanContext().traceId, t),
      b = s[lt] ?? s["sentry.segment.name.source"],
      h = n.description;
    return (
      b !== "url" && h && (d.transaction = h),
      li() &&
        ((d.sampled = String($n(r))),
        (d.sample_rand =
          a?.get("sentry.sample_rand") ??
          pt(r).scope?.getPropagationContext().sampleRand.toString())),
      o(d),
      t.emit("createDsc", d, r),
      d
    );
  }
  i(es, "getDynamicSamplingContextFromSpan");
  function ts(e) {
    return !!e && typeof e == "function" && "_streamed" in e && !!e._streamed;
  }
  i(ts, "isStreamedBeforeSendSpanCallback");
  function J(e, t = []) {
    return [e, t];
  }
  i(J, "createEnvelope");
  function di(e, t) {
    let [r, n] = e;
    return [r, [...n, t]];
  }
  i(di, "addItemToEnvelope");
  function Kt(e, t) {
    let r = e[1];
    for (let n of r) {
      let s = n[0].type;
      if (t(n, s)) return !0;
    }
    return !1;
  }
  i(Kt, "forEachEnvelopeItem");
  function rs(e, t) {
    return Kt(e, (r, n) => t.includes(n));
  }
  i(rs, "envelopeContainsItemType");
  function ui(e) {
    let t = Te(_);
    return t.encodePolyfill ? t.encodePolyfill(e) : new TextEncoder().encode(e);
  }
  i(ui, "encodeUTF8");
  function is(e) {
    let [t, r] = e,
      n = JSON.stringify(t);
    function s(a) {
      typeof n == "string"
        ? (n = typeof a == "string" ? n + a : [ui(n), a])
        : n.push(typeof a == "string" ? ui(a) : a);
    }
    i(s, "append");
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
        let l;
        try {
          l = JSON.stringify(o);
        } catch {
          l = JSON.stringify(V(o));
        }
        s(l);
      }
    }
    return typeof n == "string" ? n : El(n);
  }
  i(is, "serializeEnvelope");
  function El(e) {
    let t = e.reduce((s, a) => s + a.length, 0),
      r = new Uint8Array(t),
      n = 0;
    for (let s of e) (r.set(s, n), (n += s.length));
    return r;
  }
  i(El, "concatBuffers");
  function ns(e) {
    let t = typeof e.data == "string" ? ui(e.data) : e.data;
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
  i(ns, "createAttachmentEnvelopeItem");
  var ss = {
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
  function Tl(e) {
    return e in ss;
  }
  i(Tl, "_isOverriddenType");
  function mi(e) {
    return Tl(e) ? ss[e] : e;
  }
  i(mi, "envelopeItemTypeToDataCategory");
  function gi(e) {
    if (!e?.sdk) return;
    let { name: t, version: r } = e.sdk;
    return { name: t, version: r };
  }
  i(gi, "getSdkMetadataForEnvelopeHeader");
  function as(e, t, r, n) {
    let s = e.sdkProcessingMetadata?.dynamicSamplingContext;
    return {
      event_id: e.event_id,
      sent_at: new Date(re()).toISOString(),
      ...(t && { sdk: t }),
      ...(!!r && n && { dsn: ne(n) }),
      ...(s && { trace: s }),
    };
  }
  i(as, "createEventEnvelopeHeaders");
  function Il(e, t) {
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
  i(Il, "_enhanceEventWithSdkInfo");
  function os(e, t, r, n) {
    let s = gi(r),
      a = {
        sent_at: new Date(re()).toISOString(),
        ...(s && { sdk: s }),
        ...(!!n && t && { dsn: ne(t) }),
      },
      c =
        "aggregates" in e
          ? [{ type: "sessions" }, e]
          : [{ type: "session" }, e.toJSON()];
    return J(a, [c]);
  }
  i(os, "createSessionEnvelope");
  function ls(e, t, r, n) {
    let s = gi(r),
      a = e.type && e.type !== "replay_event" ? e.type : "event";
    Il(e, r?.sdk);
    let c = as(e, s, n, t);
    return (delete e.sdkProcessingMetadata, J(c, [[{ type: a }, e]]));
  }
  i(ls, "createEventEnvelope");
  function ps(e) {
    return e.getOptions().traceLifecycle === "stream";
  }
  i(ps, "hasSpanStreamingEnabled");
  function us(e, t) {
    let {
      fingerprint: r,
      span: n,
      breadcrumbs: s,
      sdkProcessingMetadata: a,
    } = t;
    (Al(e, t), n && Rl(e, n), kl(e, r), Ol(e, s), xl(e, a));
  }
  i(us, "applyScopeDataToEvent");
  function cs(e, t) {
    let {
      extra: r,
      tags: n,
      attributes: s,
      user: a,
      contexts: c,
      level: o,
      sdkProcessingMetadata: l,
      breadcrumbs: p,
      fingerprint: g,
      eventProcessors: u,
      attachments: m,
      propagationContext: d,
      transactionName: b,
      span: h,
    } = t;
    (ut(e, "extra", r),
      ut(e, "tags", n),
      ut(e, "attributes", s),
      ut(e, "user", a),
      ut(e, "contexts", c),
      (e.sdkProcessingMetadata = ge(e.sdkProcessingMetadata, l, 2)),
      o && (e.level = o),
      b && (e.transactionName = b),
      h && (e.span = h),
      p.length && (e.breadcrumbs = [...e.breadcrumbs, ...p]),
      g.length && (e.fingerprint = [...e.fingerprint, ...g]),
      u.length && (e.eventProcessors = [...e.eventProcessors, ...u]),
      m.length && (e.attachments = [...e.attachments, ...m]),
      (e.propagationContext = { ...e.propagationContext, ...d }));
  }
  i(cs, "mergeScopeData");
  function ut(e, t, r) {
    e[t] = ge(e[t], r, 1);
  }
  i(ut, "mergeAndOverwriteScopeData");
  function $t(e, t) {
    let r = Yt().getScopeData();
    return (e && cs(r, e.getScopeData()), t && cs(r, t.getScopeData()), r);
  }
  i($t, "getCombinedScopeData");
  function Al(e, t) {
    let {
      extra: r,
      tags: n,
      user: s,
      contexts: a,
      level: c,
      transactionName: o,
    } = t;
    (Object.keys(r).length && (e.extra = { ...r, ...e.extra }),
      Object.keys(n).length && (e.tags = { ...n, ...e.tags }),
      Object.keys(s).length && (e.user = { ...s, ...e.user }),
      Object.keys(a).length && (e.contexts = { ...a, ...e.contexts }),
      c && (e.level = c),
      o && e.type !== "transaction" && (e.transaction = o));
  }
  i(Al, "applyDataToEvent");
  function Ol(e, t) {
    let r = [...(e.breadcrumbs || []), ...t];
    e.breadcrumbs = r.length ? r : void 0;
  }
  i(Ol, "applyBreadcrumbsToEvent");
  function xl(e, t) {
    e.sdkProcessingMetadata = { ...e.sdkProcessingMetadata, ...t };
  }
  i(xl, "applySdkMetadataToEvent");
  function Rl(e, t) {
    ((e.contexts = { trace: zn(t), ...e.contexts }),
      (e.sdkProcessingMetadata = {
        dynamicSamplingContext: es(t),
        ...e.sdkProcessingMetadata,
      }));
    let r = ct(t),
      n = be(r).description;
    n && !e.transaction && e.type === "transaction" && (e.transaction = n);
  }
  i(Rl, "applySpanToEvent");
  function kl(e, t) {
    ((e.fingerprint = e.fingerprint
      ? Array.isArray(e.fingerprint)
        ? e.fingerprint
        : [e.fingerprint]
      : []),
      t && (e.fingerprint = e.fingerprint.concat(t)),
      e.fingerprint.length || delete e.fingerprint);
  }
  i(kl, "applyFingerprintToEvent");
  var ds = "url.full";
  function dt(e, t) {
    let r = e.attributes ?? (e.attributes = {});
    Object.entries(t).forEach(([n, s]) => {
      s != null && !(n in r) && (r[n] = s);
    });
  }
  i(dt, "safeSetSpanJSONAttributes");
  var bi = 0,
    ms = 1,
    gs = 2;
  function se(e) {
    return new gt((t) => {
      t(e);
    });
  }
  i(se, "resolvedSyncPromise");
  function bt(e) {
    return new gt((t, r) => {
      r(e);
    });
  }
  i(bt, "rejectedSyncPromise");
  var mt = class mt {
    constructor(t) {
      ((this._state = bi), (this._handlers = []), this._runExecutor(t));
    }
    then(t, r) {
      return new mt((n, s) => {
        (this._handlers.push([
          !1,
          (a) => {
            if (!t) n(a);
            else
              try {
                n(t(a));
              } catch (c) {
                s(c);
              }
          },
          (a) => {
            if (!r) s(a);
            else
              try {
                n(r(a));
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
      return new mt((r, n) => {
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
            n(s);
            return;
          }
          r(s);
        });
      });
    }
    _executeHandlers() {
      if (this._state === bi) return;
      let t = this._handlers.slice();
      ((this._handlers = []),
        t.forEach((r) => {
          r[0] ||
            (this._state === ms && r[1](this._value),
            this._state === gs && r[2](this._value),
            (r[0] = !0));
        }));
    }
    _runExecutor(t) {
      let r = i((a, c) => {
          if (this._state === bi) {
            if (Q(c)) {
              c.then(n, s);
              return;
            }
            ((this._state = a), (this._value = c), this._executeHandlers());
          }
        }, "setResult"),
        n = i((a) => {
          r(ms, a);
        }, "resolve"),
        s = i((a) => {
          r(gs, a);
        }, "reject");
      try {
        t(n, s);
      } catch (a) {
        s(a);
      }
    }
  };
  i(mt, "SyncPromise");
  var gt = mt;
  function bs(e, t, r, n = 0) {
    try {
      let s = fi(t, r, e, n);
      return Q(s) ? s : se(s);
    } catch (s) {
      return bt(s);
    }
  }
  i(bs, "notifyEventProcessors");
  function fi(e, t, r, n) {
    let s = r[n];
    if (!e || !s) return e;
    let a = s({ ...e }, t);
    return (
      y &&
        a === null &&
        f.log(`Event processor "${s.id || "?"}" dropped event`),
      Q(a) ? a.then((c) => fi(c, t, r, n + 1)) : fi(a, t, r, n + 1)
    );
  }
  i(fi, "_notifyEventProcessors");
  var ke, fs, ys, fe;
  function _s(e) {
    let t = _._sentryDebugIds,
      r = _._debugIds;
    if (!t && !r) return {};
    let n = t ? Object.keys(t) : [],
      s = r ? Object.keys(r) : [];
    if (fe && n.length === fs && s.length === ys) return fe;
    ((fs = n.length), (ys = s.length), (fe = {}), ke || (ke = {}));
    let a = i((c, o) => {
      for (let l of c) {
        let p = o[l],
          g = ke?.[l];
        if (g && fe && p) ((fe[g[0]] = p), ke && (ke[l] = [g[0], p]));
        else if (p) {
          let u = e(l);
          for (let m = u.length - 1; m >= 0; m--) {
            let b = u[m]?.filename;
            if (b && fe && ke) {
              ((fe[b] = p), (ke[l] = [b, p]));
              break;
            }
          }
        }
      }
    }, "processDebugIds");
    return (t && a(n, t), r && a(s, r), fe);
  }
  i(_s, "getFilenameToDebugIdMap");
  function hs(e, t, r, n, s, a) {
    let { normalizeDepth: c = 3, normalizeMaxBreadth: o = 1e3 } = e,
      l = {
        ...t,
        event_id: t.event_id || r.event_id || R(),
        timestamp: t.timestamp || ie(),
      },
      p = r.integrations || e.integrations.map((O) => O.name);
    (Nl(l, e),
      Ml(l, p),
      s && s.emit("applyFrameMetadata", t),
      t.type === void 0 && wl(l, e.stackParser));
    let g = Ll(n, r.captureContext);
    r.mechanism && F(l, r.mechanism);
    let u = s ? s.getEventProcessors() : [],
      m = $t(a, g),
      d = [...(r.attachments || []), ...m.attachments];
    (d.length && (r.attachments = d), us(l, m));
    let b = [...u, ...m.eventProcessors];
    return (r.data && r.data.__sentry__ === !0 ? se(l) : bs(b, l, r)).then(
      (O) => (O && Cl(O), typeof c == "number" && c > 0 ? Pl(O, c, o) : O),
    );
  }
  i(hs, "prepareEvent");
  function Nl(e, t) {
    let { environment: r, release: n, dist: s, maxValueLength: a } = t;
    ((e.environment = e.environment || r || je),
      !e.release && n && (e.release = n),
      !e.dist && s && (e.dist = s));
    let c = e.request;
    (c?.url && a && (c.url = He(c.url, a)),
      a &&
        e.exception?.values?.forEach((o) => {
          o.value && (o.value = He(o.value, a));
        }));
  }
  i(Nl, "applyClientOptions");
  function wl(e, t) {
    let r = _s(t);
    e.exception?.values?.forEach((n) => {
      n.stacktrace?.frames?.forEach((s) => {
        s.filename && (s.debug_id = r[s.filename]);
      });
    });
  }
  i(wl, "applyDebugIds");
  function Cl(e) {
    let t = {};
    if (
      (e.exception?.values?.forEach((n) => {
        n.stacktrace?.frames?.forEach((s) => {
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
    Object.entries(t).forEach(([n, s]) => {
      r.push({ type: "sourcemap", code_file: n, debug_id: s });
    });
  }
  i(Cl, "applyDebugMeta");
  function Ml(e, t) {
    t.length > 0 &&
      ((e.sdk = e.sdk || {}),
      (e.sdk.integrations = [...(e.sdk.integrations || []), ...t]));
  }
  i(Ml, "applyIntegrationsMetadata");
  function Pl(e, t, r) {
    if (!e) return null;
    let n = {
      ...e,
      ...(e.breadcrumbs && {
        breadcrumbs: e.breadcrumbs.map((s) => ({
          ...s,
          ...(s.data && { data: V(s.data, t, r) }),
        })),
      }),
      ...(e.user && { user: V(e.user, t, r) }),
      ...(e.contexts && { contexts: V(e.contexts, t, r) }),
      ...(e.extra && { extra: V(e.extra, t, r) }),
    };
    return (
      e.contexts?.trace &&
        n.contexts &&
        ((n.contexts.trace = e.contexts.trace),
        e.contexts.trace.data &&
          (n.contexts.trace.data = V(e.contexts.trace.data, t, r))),
      e.spans &&
        (n.spans = e.spans.map((s) => ({
          ...s,
          ...(s.data && { data: V(s.data, t, r) }),
        }))),
      e.contexts?.flags &&
        n.contexts &&
        (n.contexts.flags = V(e.contexts.flags, 3, r)),
      n
    );
  }
  i(Pl, "normalizeEvent");
  function Ll(e, t) {
    if (!t) return e;
    let r = e ? e.clone() : new G();
    return (r.update(t), r);
  }
  i(Ll, "getFinalScope");
  function vs(e) {
    if (e)
      return Dl(e) ? { captureContext: e } : Fl(e) ? { captureContext: e } : e;
  }
  i(vs, "parseEventHintOrCaptureContext");
  function Dl(e) {
    return e instanceof G || typeof e == "function";
  }
  i(Dl, "hintIsScopeOrFunction");
  var Ul = [
    "user",
    "level",
    "extra",
    "contexts",
    "tags",
    "fingerprint",
    "propagationContext",
  ];
  function Fl(e) {
    return Object.keys(e).some((t) => Ul.includes(t));
  }
  i(Fl, "hintIsScopeContext");
  function ze(e, t) {
    return U().captureException(e, vs(t));
  }
  i(ze, "captureException");
  function ft(e, t) {
    return U().captureEvent(e, t);
  }
  i(ft, "captureEvent");
  function yt(e) {
    let t = q(),
      { user: r } = $t(t, U()),
      { userAgent: n } = _.navigator || {},
      s = On({ user: r, ...(n && { userAgent: n }), ...e }),
      a = t.getSession();
    return (
      a?.status === "ok" && le(a, { status: "exited" }),
      Qt(),
      t.setSession(s),
      s
    );
  }
  i(yt, "startSession");
  function Qt() {
    let e = q(),
      r = U().getSession() || e.getSession();
    (r && xn(r), Es(), e.setSession());
  }
  i(Qt, "endSession");
  function Es() {
    let e = q(),
      t = T(),
      r = e.getSession();
    r && t && t.captureSession(r);
  }
  i(Es, "_sendSessionUpdate");
  function Ke(e = !1) {
    if (e) {
      Qt();
      return;
    }
    Es();
  }
  i(Ke, "captureSession");
  function Xt(e) {
    return (
      typeof e == "object" && typeof e.unref == "function" && e.unref(),
      e
    );
  }
  i(Xt, "safeUnref");
  var Bl = "7";
  function Gl(e) {
    let t = e.protocol ? `${e.protocol}:` : "",
      r = e.port ? `:${e.port}` : "";
    return `${t}//${e.host}${r}${e.path ? `/${e.path}` : ""}/api/`;
  }
  i(Gl, "getBaseApiEndpoint");
  function ql(e) {
    return `${Gl(e)}${e.projectId}/envelope/`;
  }
  i(ql, "_getIngestEndpoint");
  function Hl(e, t) {
    let r = { sentry_version: Bl };
    return (
      e.publicKey && (r.sentry_key = e.publicKey),
      t && (r.sentry_client = `${t.name}/${t.version}`),
      new URLSearchParams(r).toString()
    );
  }
  i(Hl, "_encodedAuth");
  function Ts(e, t, r) {
    return t || `${ql(e)}?${Hl(e, r)}`;
  }
  i(Ts, "getEnvelopeEndpointWithUrlEncodedAuth");
  var yi = [];
  function Yl(e) {
    let t = {};
    return (
      e.forEach((r) => {
        let { name: n } = r,
          s = t[n];
        (s && !s.isDefaultInstance && r.isDefaultInstance) || (t[n] = r);
      }),
      Object.values(t)
    );
  }
  i(Yl, "filterDuplicates");
  function _i(e) {
    let t = e.defaultIntegrations || [],
      r = e.integrations;
    t.forEach((s) => {
      s.isDefaultInstance = !0;
    });
    let n;
    if (Array.isArray(r)) n = [...t, ...r];
    else if (typeof r == "function") {
      let s = r(t);
      n = Array.isArray(s) ? s : [s];
    } else n = t;
    return Yl(n);
  }
  i(_i, "getIntegrationsToSetup");
  function Is(e, t) {
    let r = {};
    return (
      t.forEach((n) => {
        n?.beforeSetup && n.beforeSetup(e);
      }),
      t.forEach((n) => {
        n && vi(e, n, r);
      }),
      r
    );
  }
  i(Is, "setupIntegrations");
  function hi(e, t) {
    for (let r of t) r?.afterAllSetup && r.afterAllSetup(e);
  }
  i(hi, "afterSetupIntegrations");
  function vi(e, t, r) {
    if (r[t.name]) {
      y &&
        f.log(
          `Integration skipped because it was already installed: ${t.name}`,
        );
      return;
    }
    if (
      ((r[t.name] = t),
      !yi.includes(t.name) &&
        typeof t.setupOnce == "function" &&
        (t.setupOnce(), yi.push(t.name)),
      t.setup && typeof t.setup == "function" && t.setup(e),
      typeof t.preprocessEvent == "function")
    ) {
      let n = t.preprocessEvent.bind(t);
      e.on("preprocessEvent", (s, a) => n(s, a, e));
    }
    if (typeof t.processEvent == "function") {
      let n = t.processEvent.bind(t),
        s = Object.assign((a, c) => n(a, c, e), { id: t.name });
      e.addEventProcessor(s);
    }
    (["processSpan", "processSegmentSpan"].forEach((n) => {
      let s = t[n];
      typeof s == "function" && e.on(n, (a) => s.call(t, a, e));
    }),
      y && f.log(`Integration installed: ${t.name}`));
  }
  i(vi, "setupIntegration");
  function Si() {
    return (
      typeof __SENTRY_BROWSER_BUNDLE__ < "u" && !!__SENTRY_BROWSER_BUNDLE__
    );
  }
  i(Si, "isBrowserBundle");
  function Ei() {
    return "npm";
  }
  i(Ei, "getSDKSource");
  function As() {
    return (
      !Si() &&
      Object.prototype.toString.call(typeof process < "u" ? process : 0) ===
        "[object process]"
    );
  }
  i(As, "isNodeEnv");
  function $e() {
    return typeof window < "u" && (!As() || Wl());
  }
  i($e, "isBrowser");
  function Wl() {
    return _.process?.type === "renderer";
  }
  i(Wl, "isElectronNodeRenderer");
  function Vl(e, t) {
    let r = t ? "auto" : "never";
    return [
      {
        type: "log",
        item_count: e.length,
        content_type: "application/vnd.sentry.items.log+json",
      },
      {
        version: 2,
        ...($e() && { ingest_settings: { infer_ip: r, infer_user_agent: r } }),
        items: e,
      },
    ];
  }
  i(Vl, "createLogContainerEnvelopeItem");
  function Os(e, t, r, n, s) {
    let a = {};
    return (
      t?.sdk && (a.sdk = { name: t.sdk.name, version: t.sdk.version }),
      r && n && (a.dsn = ne(n)),
      J(a, [Vl(e, s)])
    );
  }
  i(Os, "createLogEnvelope");
  function xs(e, t) {
    let r = t ?? jl(e) ?? [];
    if (r.length === 0) return;
    let n = e.getOptions(),
      s = Os(
        r,
        n._metadata,
        n.tunnel,
        e.getDsn(),
        e.getDataCollectionOptions().userInfo,
      );
    (Rs().set(e, []), e.emit("flushLogs"), e.sendEnvelope(s));
  }
  i(xs, "_INTERNAL_flushLogsBuffer");
  function jl(e) {
    return Rs().get(e);
  }
  i(jl, "_INTERNAL_getLogBuffer");
  function Rs() {
    return K("clientToLogBufferMap", () => new WeakMap());
  }
  i(Rs, "_getBufferMap");
  function zl(e, t) {
    let r = t ? "auto" : "never";
    return [
      {
        type: "trace_metric",
        item_count: e.length,
        content_type: "application/vnd.sentry.items.trace-metric+json",
      },
      {
        version: 2,
        ...($e() && { ingest_settings: { infer_ip: r, infer_user_agent: r } }),
        items: e,
      },
    ];
  }
  i(zl, "createMetricContainerEnvelopeItem");
  function ks(e, t, r, n, s) {
    let a = {};
    return (
      t?.sdk && (a.sdk = { name: t.sdk.name, version: t.sdk.version }),
      r && n && (a.dsn = ne(n)),
      J(a, [zl(e, s)])
    );
  }
  i(ks, "createMetricEnvelope");
  function Ns(e, t) {
    let r = t ?? Kl(e) ?? [];
    if (r.length === 0) return;
    let n = e.getOptions(),
      s = ks(
        r,
        n._metadata,
        n.tunnel,
        e.getDsn(),
        e.getDataCollectionOptions().userInfo,
      );
    (ws().set(e, []), e.emit("flushMetrics"), e.sendEnvelope(s));
  }
  i(Ns, "_INTERNAL_flushMetricsBuffer");
  function Kl(e) {
    return ws().get(e);
  }
  i(Kl, "_INTERNAL_getMetricBuffer");
  function ws() {
    return K("clientToMetricBufferMap", () => new WeakMap());
  }
  i(ws, "_getBufferMap");
  function Cs(e) {
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
    return Kn(t);
  }
  i(Cs, "spanJsonToSerializedStreamedSpan");
  function Ms(e, t) {
    if (
      e.type !== "transaction" ||
      !e.spans?.length ||
      !e.sdkProcessingMetadata?.hasGenAiSpans ||
      t.getOptions().streamGenAiSpans === !1 ||
      ps(t)
    )
      return;
    let r = [],
      n = [];
    for (let a of e.spans)
      a.op?.startsWith("gen_ai.") ? r.push(Cs(a)) : n.push(a);
    if (r.length === 0) return;
    e.spans = n;
    let s = t.getDataCollectionOptions().userInfo ? "auto" : "never";
    return [
      {
        type: "span",
        item_count: r.length,
        content_type: "application/vnd.sentry.items.span.v2+json",
      },
      {
        version: 2,
        ...($e() && { ingest_settings: { infer_ip: s, infer_user_agent: s } }),
        items: r,
      },
    ];
  }
  i(Ms, "extractGenAiSpansFromEvent");
  var Qe = Symbol.for("SentryBufferFullError");
  function Ne(e = 100) {
    let t = new Set();
    function r() {
      return t.size < e;
    }
    i(r, "isReady");
    function n(c) {
      t.delete(c);
    }
    i(n, "remove");
    function s(c) {
      if (!r()) return bt(Qe);
      let o = c();
      return (
        t.add(o),
        o.then(
          () => n(o),
          () => n(o),
        ),
        o
      );
    }
    i(s, "add");
    function a(c) {
      if (!t.size) return se(!0);
      let o = Promise.allSettled(Array.from(t)).then(() => !0);
      if (!c) return o;
      let l = [o, new Promise((p) => Xt(setTimeout(() => p(!1), c)))];
      return Promise.race(l);
    }
    return (
      i(a, "drain"),
      {
        get $() {
          return Array.from(t);
        },
        add: s,
        drain: a,
      }
    );
  }
  i(Ne, "makePromiseBuffer");
  var $l = 60 * 1e3;
  function Ql(e, t = re()) {
    let r = parseInt(`${e}`, 10);
    if (!isNaN(r)) return r * 1e3;
    let n = Date.parse(`${e}`);
    return isNaN(n) ? $l : n - t;
  }
  i(Ql, "parseRetryAfterHeader");
  function Xl(e, t) {
    return e[t] || e.all || 0;
  }
  i(Xl, "disabledUntil");
  function Ps(e, t, r = re()) {
    return Xl(e, t) > r;
  }
  i(Ps, "isRateLimited");
  function Ls(e, { statusCode: t, headers: r }, n = re()) {
    let s = { ...e },
      a = r?.["x-sentry-rate-limits"],
      c = r?.["retry-after"];
    if (a)
      for (let o of a.trim().split(",")) {
        let [l, p, , , g] = o.split(":", 5),
          u = parseInt(l, 10),
          m = (isNaN(u) ? 60 : u) * 1e3;
        if (!p) s.all = n + m;
        else
          for (let d of p.split(";"))
            d === "metric_bucket"
              ? (!g || g.split(";").includes("custom")) && (s[d] = n + m)
              : (s[d] = n + m);
      }
    else c ? (s.all = n + Ql(c, n)) : t === 429 && (s.all = n + 60 * 1e3);
    return s;
  }
  i(Ls, "updateRateLimits");
  var Ti = 64;
  function Jt(e, t, r = Ne(e.bufferSize || Ti)) {
    let n = {},
      s = i((c) => r.drain(c), "flush");
    function a(c) {
      let o = [];
      if (
        (Kt(c, (u, m) => {
          let d = mi(m);
          Ps(n, d) ? e.recordDroppedEvent("ratelimit_backoff", d) : o.push(u);
        }),
        o.length === 0)
      )
        return Promise.resolve({});
      let l = J(c[0], o),
        p = i((u) => {
          if (rs(l, ["client_report"])) {
            y &&
              f.warn(
                `Dropping client report. Will not send outcomes (reason: ${u}).`,
              );
            return;
          }
          Kt(l, (m, d) => {
            e.recordDroppedEvent(u, mi(d));
          });
        }, "recordEnvelopeLoss"),
        g = i(
          () =>
            t({ body: is(l) }).then(
              (u) =>
                u.statusCode === 413
                  ? (y &&
                      f.error(
                        "Sentry responded with status code 413. Envelope was discarded due to exceeding size limits.",
                      ),
                    p("send_error"),
                    u)
                  : (y &&
                      u.statusCode !== void 0 &&
                      (u.statusCode < 200 || u.statusCode >= 300) &&
                      f.warn(
                        `Sentry responded with status code ${u.statusCode} to sent event.`,
                      ),
                    (n = Ls(n, u)),
                    u),
              (u) => {
                throw (
                  p("network_error"),
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
          if (u === Qe)
            return (
              y && f.error("Skipped sending event because buffer is full."),
              p("queue_overflow"),
              Promise.resolve({})
            );
          throw u;
        },
      );
    }
    return (i(a, "send"), { send: a, flush: s });
  }
  i(Jt, "createTransport");
  function Ds(e, t, r) {
    let n = [
      { type: "client_report" },
      { timestamp: r || ie(), discarded_events: e },
    ];
    return J(t ? { dsn: t } : {}, [n]);
  }
  i(Ds, "createClientReportEnvelope");
  function Zt(e) {
    let t = [];
    e.message && t.push(e.message);
    try {
      let r = e.exception.values[e.exception.values.length - 1];
      r?.value && (t.push(r.value), r.type && t.push(`${r.type}: ${r.value}`));
    } catch {}
    return t;
  }
  i(Zt, "getPossibleEventMessages");
  function Us(e) {
    let {
      trace_id: t,
      parent_span_id: r,
      span_id: n,
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
      span_id: n ?? "",
      start_timestamp: e.start_timestamp ?? 0,
      status: s,
      timestamp: e.timestamp,
      trace_id: t ?? "",
      origin: a,
      profile_id: c?.[jt],
      exclusive_time: c?.[zt],
      measurements: e.measurements,
      is_segment: !0,
    };
  }
  i(Us, "convertTransactionEventToSpanJson");
  function Fs(e) {
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
            ...(e.profile_id && { [jt]: e.profile_id }),
            ...(e.exclusive_time && { [zt]: e.exclusive_time }),
          },
        },
      },
      measurements: e.measurements,
    };
  }
  i(Fs, "convertSpanJsonToTransactionEvent");
  var _t = ["forwarded", "-ip", "remote-", "via", "-user"];
  function Bs(e) {
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
  i(Bs, "defaultPiiToCollectionOptions");
  var Jl = {
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
  function Gs(e) {
    let t = e.dataCollection != null ? Jl : Bs(e.sendDefaultPii),
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
  i(Gs, "resolveDataCollectionOptions");
  var qs = "Not capturing exception because it's already been captured.",
    Hs = "Discarded session because of missing or non-string release",
    Ks = Symbol.for("SentryInternalError"),
    $s = Symbol.for("SentryDoNotSendEventError"),
    Zl = 5e3;
  function er(e) {
    return { message: e, [Ks]: !0 };
  }
  i(er, "_makeInternalError");
  function Ii(e) {
    return { message: e, [$s]: !0 };
  }
  i(Ii, "_makeDoNotSendEventError");
  function Ys(e) {
    return oe(e) && Ks in e;
  }
  i(Ys, "_isInternalError");
  function Ws(e) {
    return oe(e) && $s in e;
  }
  i(Ws, "_isDoNotSendEventError");
  function Vs(e, t, r, n, s) {
    let a = 0,
      c,
      o = !1;
    (e.on(r, () => {
      ((a = 0), clearTimeout(c), (o = !1));
    }),
      e.on(t, (l) => {
        if (((a += n(l)), a >= 8e5)) s(e);
        else if (!o) {
          let p = e.getOptions()._flushInterval ?? Zl;
          p > 0 &&
            ((o = !0),
            (c = Xt(
              setTimeout(() => {
                s(e);
              }, p),
            )));
        }
      }),
      e.on("flush", () => {
        s(e);
      }));
  }
  i(Vs, "setupWeightBasedFlushing");
  var Oi = class Oi {
    constructor(t) {
      if (
        ((this._options = t),
        (this._integrations = {}),
        (this._numProcessing = 0),
        (this._outcomes = {}),
        (this._hooks = {}),
        (this._eventProcessors = []),
        (this._promiseBuffer = Ne(t.transportOptions?.bufferSize ?? Ti)),
        (this._dataCollection = Gs(t)),
        t.dsn
          ? (this._dsn = qn(t.dsn))
          : y && f.warn("No DSN provided, client will not send events."),
        this._dsn)
      ) {
        let n = Ts(this._dsn, t.tunnel, t._metadata ? t._metadata.sdk : void 0);
        this._transport = t.transport({
          tunnel: this._options.tunnel,
          recordDroppedEvent: this.recordDroppedEvent.bind(this),
          ...t.transportOptions,
          url: n,
        });
      }
      ((this._options.enableLogs =
        this._options.enableLogs ??
        this._options._experiments?.enableLogs ??
        !0),
        this._options.enableLogs &&
          Vs(this, "afterCaptureLog", "flushLogs", ip, xs),
        (this._options.enableMetrics ??
          this._options._experiments?.enableMetrics ??
          !0) &&
          Vs(this, "afterCaptureMetric", "flushMetrics", rp, Ns));
    }
    captureException(t, r, n) {
      let s = R();
      if (at(t)) return (y && f.log(qs), s);
      let a = { event_id: s, ...r };
      return (
        this._process(
          () =>
            this.eventFromException(t, a)
              .then((c) => this._captureEvent(c, a, n))
              .then((c) => c),
          "error",
        ),
        a.event_id
      );
    }
    captureMessage(t, r, n, s) {
      let a = { event_id: R(), ...n },
        c = ce(t) ? t : String(t),
        o = $(t),
        l = o ? this.eventFromMessage(c, r, a) : this.eventFromException(t, a);
      return (
        this._process(
          () => l.then((p) => this._captureEvent(p, a, s)),
          o ? "unknown" : "error",
        ),
        a.event_id
      );
    }
    captureEvent(t, r, n) {
      let s = R();
      if (r?.originalException && at(r.originalException))
        return (y && f.log(qs), s);
      let a = { event_id: s, ...r },
        c = t.sdkProcessingMetadata || {},
        o = c.capturedSpanScope,
        l = c.capturedSpanIsolationScope,
        p = js(t.type);
      return (
        this._process(() => this._captureEvent(t, a, o || n, l), p),
        a.event_id
      );
    }
    captureSession(t) {
      (this.sendSession(t), le(t, { init: !1 }));
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
      let n = await this._isClientDoneProcessing(t),
        s = await r.flush(t);
      return n && s;
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
        vi(this, t, this._integrations),
        r || hi(this, [t]));
    }
    sendEvent(t, r = {}) {
      this.emit("beforeSendEvent", t, r);
      let n = Ms(t, this),
        s = ls(t, this._dsn, this._options._metadata, this._options.tunnel);
      for (let a of r.attachments || []) s = di(s, ns(a));
      (n && (s = di(s, n)),
        this.sendEnvelope(s).then((a) => this.emit("afterSendEvent", t, a)));
    }
    sendSession(t) {
      let { release: r, environment: n = je } = this._options;
      if ("aggregates" in t) {
        let a = t.attrs || {};
        if (!a.release && !r) {
          y && f.warn(Hs);
          return;
        }
        ((a.release = a.release || r),
          (a.environment = a.environment || n),
          (t.attrs = a));
      } else {
        if (!t.release && !r) {
          y && f.warn(Hs);
          return;
        }
        ((t.release = t.release || r), (t.environment = t.environment || n));
      }
      this.emit("beforeSendSession", t);
      let s = os(t, this._dsn, this._options._metadata, this._options.tunnel);
      this.sendEnvelope(s);
    }
    recordDroppedEvent(t, r, n = 1) {
      if (this._options.sendClientReports) {
        let s = `${t}:${r}`;
        (y && f.log(`Recording outcome: "${s}"${n > 1 ? ` (${n} times)` : ""}`),
          (this._outcomes[s] = (this._outcomes[s] || 0) + n));
      }
    }
    on(t, r) {
      let n = (this._hooks[t] = this._hooks[t] || new Set()),
        s = i((...a) => r(...a), "uniqueCallback");
      return (
        n.add(s),
        () => {
          n.delete(s);
        }
      );
    }
    emit(t, ...r) {
      let n = this._hooks[t];
      n && n.forEach((s) => s(...r));
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
      ((this._integrations = Is(this, t)), hi(this, t));
    }
    _updateSessionFromEvent(t, r) {
      let n = r.level === "fatal",
        s = !1,
        a = r.exception?.values;
      if (a) {
        ((s = !0), (n = !1));
        for (let l of a)
          if (l.mechanism?.handled === !1) {
            n = !0;
            break;
          }
      }
      let c = t.status === "ok";
      ((c && t.errors === 0) || (c && n)) &&
        (le(t, {
          ...(n && { status: "crashed" }),
          errors: t.errors || Number(s || n),
        }),
        this.captureSession(t));
    }
    async _isClientDoneProcessing(t) {
      let r = 0;
      for (; !t || r < t; ) {
        if ((await new Promise((n) => setTimeout(n, 1)), !this._numProcessing))
          return !0;
        r++;
      }
      return !1;
    }
    _isEnabled() {
      return this.getOptions().enabled !== !1 && this._transport !== void 0;
    }
    _prepareEvent(t, r, n, s) {
      let a = this.getOptions(),
        c = this.getIntegrationNames();
      return (
        !r.integrations && c.length && (r.integrations = c),
        this.emit("preprocessEvent", t, r),
        t.type || s.setLastEventId(t.event_id || r.event_id),
        hs(a, t, r, n, this, s).then((o) => {
          if (o === null) return o;
          (this.emit("postprocessEvent", o, r),
            (o.contexts = {
              trace: { ...o.contexts?.trace, ...ni(n) },
              ...o.contexts,
            }));
          let l = ci(this, n);
          return (
            (o.sdkProcessingMetadata = {
              dynamicSamplingContext: l,
              ...o.sdkProcessingMetadata,
            }),
            o
          );
        })
      );
    }
    _captureEvent(t, r = {}, n = U(), s = q()) {
      return (
        y &&
          Ai(t) &&
          f.log(`Captured error event \`${Zt(t)[0] || "<unknown>"}\``),
        this._processEvent(t, r, n, s).then(
          (a) => a.event_id,
          (a) => {
            y &&
              (Ws(a)
                ? f.log(a.message)
                : Ys(a)
                  ? f.warn(a.message)
                  : f.warn(a));
          },
        )
      );
    }
    _processEvent(t, r, n, s) {
      let a = this.getOptions(),
        { sampleRate: c } = a,
        o = Qs(t),
        l = Ai(t),
        g = `before send for type \`${t.type || "error"}\``,
        u = typeof c > "u" ? void 0 : Hn(c),
        m = js(t.type);
      return this._prepareEvent(t, r, n, s)
        .then((d) => {
          if (d === null)
            throw (
              this.recordDroppedEvent("event_processor", m),
              Ii("An event processor returned `null`, will not send event.")
            );
          if (r.data?.__sentry__ === !0) return d;
          let h = tp(this, a, d, r);
          return ep(h, g);
        })
        .then((d) => {
          if (d === null) {
            if ((this.recordDroppedEvent("before_send", m), o)) {
              let O = 1 + (t.spans || []).length;
              this.recordDroppedEvent("before_send", "span", O);
            }
            throw Ii(`${g} returned \`null\`, will not send event.`);
          }
          let b = n.getSession() || s.getSession();
          if (
            (l && b && this._updateSessionFromEvent(b, d),
            l && typeof u == "number" && Ae() > u)
          )
            throw (
              this.recordDroppedEvent("sample_rate", "error"),
              Ii(
                `Discarding event because it's not included in the random sample (sampling rate = ${c})`,
              )
            );
          if (o) {
            let S = d.sdkProcessingMetadata?.spanCountBeforeProcessing || 0,
              O = d.spans ? d.spans.length : 0,
              Se = S - O;
            Se > 0 && this.recordDroppedEvent("before_send", "span", Se);
          }
          let h = d.transaction_info;
          if (o && h && d.transaction !== t.transaction) {
            let S = "custom";
            d.transaction_info = { ...h, source: S };
          }
          return (this.sendEvent(d, r), d);
        })
        .then(null, (d) => {
          throw Ws(d) || Ys(d)
            ? d
            : (this.captureException(d, {
                mechanism: { handled: !1, type: "internal" },
                data: { __sentry__: !0 },
                originalException: d,
              }),
              er(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.
Reason: ${d}`));
        });
    }
    _process(t, r) {
      (this._numProcessing++,
        this._promiseBuffer.add(t).then(
          (n) => (this._numProcessing--, n),
          (n) => (
            this._numProcessing--,
            n === Qe && this.recordDroppedEvent("queue_overflow", r),
            n
          ),
        ));
    }
    _clearOutcomes() {
      let t = this._outcomes;
      return (
        (this._outcomes = {}),
        Object.entries(t).map(([r, n]) => {
          let [s, a] = r.split(":");
          return { reason: s, category: a, quantity: n };
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
      let r = Ds(t, this._options.tunnel && ne(this._dsn));
      this.sendEnvelope(r);
    }
  };
  i(Oi, "Client");
  var ht = Oi;
  function js(e) {
    return e === "replay_event" ? "replay" : e || "error";
  }
  i(js, "getDataCategoryByType");
  function ep(e, t) {
    let r = `${t} must return \`null\` or a valid event.`;
    if (Q(e))
      return e.then(
        (n) => {
          if (!te(n) && n !== null) throw er(r);
          return n;
        },
        (n) => {
          throw er(`${t} rejected with ${n}`);
        },
      );
    if (!te(e) && e !== null) throw er(r);
    return e;
  }
  i(ep, "_validateBeforeSendResult");
  function tp(e, t, r, n) {
    let { beforeSend: s, beforeSendTransaction: a, ignoreSpans: c } = t,
      o = !ts(t.beforeSendSpan) && t.beforeSendSpan,
      l = r;
    if (Ai(l) && s) return s(l, n);
    if (Qs(l)) {
      if (o || c) {
        let p = Us(l);
        if (
          c?.length &&
          pi({ description: p.description, op: p.op, attributes: p.data }, c)
        )
          return null;
        if (o) {
          let g = o(p);
          g ? (l = ge(r, Fs(g))) : oi();
        }
        if (l.spans) {
          let g = [],
            u = l.spans;
          for (let d of u) {
            if (
              c?.length &&
              pi(
                { description: d.description, op: d.op, attributes: d.data },
                c,
              )
            ) {
              Xn(u, d);
              continue;
            }
            if (o) {
              let b = o(d);
              b ? g.push(b) : (oi(), g.push(d));
            } else g.push(d);
          }
          let m = l.spans.length - g.length;
          (m && e.recordDroppedEvent("before_send", "span", m), (l.spans = g));
        }
      }
      if (a) {
        if (l.spans) {
          let p = l.spans.length;
          l.sdkProcessingMetadata = {
            ...r.sdkProcessingMetadata,
            spanCountBeforeProcessing: p,
          };
        }
        return a(l, n);
      }
    }
    return l;
  }
  i(tp, "processBeforeSend");
  function Ai(e) {
    return e.type === void 0;
  }
  i(Ai, "isErrorEvent");
  function Qs(e) {
    return e.type === "transaction";
  }
  i(Qs, "isTransactionEvent");
  function rp(e) {
    let t = 0;
    return (e.name && (t += e.name.length * 2), (t += 8), t + Xs(e.attributes));
  }
  i(rp, "estimateMetricSizeInBytes");
  function ip(e) {
    let t = 0;
    return (e.message && (t += e.message.length * 2), t + Xs(e.attributes));
  }
  i(ip, "estimateLogSizeInBytes");
  function Xs(e) {
    if (!e) return 0;
    let t = 0;
    return (
      Object.values(e).forEach((r) => {
        Array.isArray(r)
          ? (t += r.length * zs(r[0]))
          : $(r)
            ? (t += zs(r))
            : (t += 100);
      }),
      t
    );
  }
  i(Xs, "estimateAttributesSizeInBytes");
  function zs(e) {
    return typeof e == "string"
      ? e.length * 2
      : typeof e == "number"
        ? 8
        : typeof e == "boolean"
          ? 4
          : 0;
  }
  i(zs, "estimatePrimitiveSizeInBytes");
  function xi(e, t) {
    (t.debug === !0 &&
      (y
        ? f.enable()
        : H(() => {
            console.warn(
              "[Sentry] Cannot initialize SDK with `debug` option using a non-debug bundle.",
            );
          })),
      U().update(t.initialScope));
    let n = new e(t);
    return (Ri(n), n.init(), n);
  }
  i(xi, "initAndBind");
  function Ri(e) {
    U().setClient(e);
  }
  i(Ri, "setCurrentClient");
  function vt(e) {
    if (!e) return {};
    let t = e.match(
      /^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/,
    );
    if (!t) return {};
    let r = t[6] || "",
      n = t[8] || "";
    return {
      host: t[4],
      path: t[5],
      protocol: t[2],
      search: r,
      hash: n,
      relative: t[5] + r + n,
    };
  }
  i(vt, "parseUrl");
  function ki(e, t = !0) {
    if (e.startsWith("data:")) {
      let r = e.match(/^data:([^;,]+)/),
        n = r ? r[1] : "text/plain",
        s = e.includes(";base64,"),
        a = e.indexOf(","),
        c = "";
      if (t && a !== -1) {
        let o = e.slice(a + 1);
        c = o.length > 10 ? `${o.slice(0, 10)}... [truncated]` : o;
      }
      return `data:${n}${s ? ",base64" : ""}${c ? `,${c}` : ""}`;
    }
    return e;
  }
  i(ki, "stripDataUrlContent");
  function Ni(e) {
    "aggregates" in e
      ? e.attrs?.ip_address === void 0 &&
        (e.attrs = { ...e.attrs, ip_address: "{{auto}}" })
      : e.ipAddress === void 0 && (e.ipAddress = "{{auto}}");
  }
  i(Ni, "addAutoIpAddressToSession");
  function wi(e, t, r = [t], n = "npm") {
    let s = ((e._metadata = e._metadata || {}).sdk = e._metadata.sdk || {});
    s.name ||
      ((s.name = `sentry.javascript.${t}`),
      (s.packages = r.map((a) => ({ name: `${n}:@sentry/${a}`, version: ee }))),
      (s.version = ee));
  }
  i(wi, "applySdkMetadata");
  var np = 100;
  function ae(e, t) {
    let r = T(),
      n = q();
    if (!r) return;
    let { beforeBreadcrumb: s = null, maxBreadcrumbs: a = np } = r.getOptions();
    if (a <= 0) return;
    let o = { timestamp: ie(), ...e },
      l = s ? H(() => s(o, t)) : o;
    l !== null &&
      (r.emit && r.emit("beforeAddBreadcrumb", l, t), n.addBreadcrumb(l, a));
  }
  i(ae, "addBreadcrumb");
  var sp = "FunctionToString",
    Js = new WeakMap(),
    ap = i(
      () => ({
        name: sp,
        setupOnce() {
          let e = Function.prototype.toString;
          try {
            Function.prototype.toString = function (...t) {
              let r = de(this),
                n;
              try {
                Js.has(T()) && r !== void 0 && (n = r);
              } catch {}
              return e.apply(n ?? this, t);
            };
          } catch {}
        },
        setup(e) {
          Js.set(e, !0);
        },
      }),
      "_functionToStringIntegration",
    ),
    tr = ap;
  var op = [
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
    lp = "EventFilters",
    Ci = (e = {}) => {
      let t;
      return {
        name: lp,
        setup(r) {
          let n = r.getOptions();
          t = Zs(e, n);
        },
        processEvent(r, n, s) {
          if (!t) {
            let a = s.getOptions();
            t = Zs(e, a);
          }
          return pp(r, t) ? null : r;
        },
      };
    },
    ir = (e = {}) => ({ ...Ci(e), name: "InboundFilters" });
  function Zs(e = {}, t = {}) {
    return {
      allowUrls: [...(e.allowUrls || []), ...(t.allowUrls || [])],
      denyUrls: [...(e.denyUrls || []), ...(t.denyUrls || [])],
      ignoreErrors: [
        ...(e.ignoreErrors || []),
        ...(t.ignoreErrors || []),
        ...(e.disableErrorDefaults ? [] : op),
      ],
      ignoreTransactions: [
        ...(e.ignoreTransactions || []),
        ...(t.ignoreTransactions || []),
      ],
    };
  }
  i(Zs, "_mergeOptions");
  function pp(e, t) {
    if (e.type) {
      if (e.type === "transaction" && up(e, t.ignoreTransactions))
        return (
          y &&
            f.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.
Event: ${X(e)}`),
          !0
        );
    } else {
      if (cp(e, t.ignoreErrors))
        return (
          y &&
            f.warn(`Event dropped due to being matched by \`ignoreErrors\` option.
Event: ${X(e)}`),
          !0
        );
      if (bp(e))
        return (
          y &&
            f.warn(`Event dropped due to not having an error message, error type or stacktrace.
Event: ${X(e)}`),
          !0
        );
      if (dp(e, t.denyUrls))
        return (
          y &&
            f.warn(`Event dropped due to being matched by \`denyUrls\` option.
Event: ${X(e)}.
Url: ${rr(e)}`),
          !0
        );
      if (!mp(e, t.allowUrls))
        return (
          y &&
            f.warn(`Event dropped due to not being matched by \`allowUrls\` option.
Event: ${X(e)}.
Url: ${rr(e)}`),
          !0
        );
    }
    return !1;
  }
  i(pp, "_shouldDropEvent");
  function cp(e, t) {
    return t?.length ? Zt(e).some((r) => me(r, t)) : !1;
  }
  i(cp, "_isIgnoredError");
  function up(e, t) {
    if (!t?.length) return !1;
    let r = e.transaction;
    return r ? me(r, t) : !1;
  }
  i(up, "_isIgnoredTransaction");
  function dp(e, t) {
    if (!t?.length) return !1;
    let r = rr(e);
    return r ? me(r, t) : !1;
  }
  i(dp, "_isDeniedUrl");
  function mp(e, t) {
    if (!t?.length) return !0;
    let r = rr(e);
    return r ? me(r, t) : !0;
  }
  i(mp, "_isAllowedUrl");
  function gp(e = []) {
    for (let t = e.length - 1; t >= 0; t--) {
      let r = e[t];
      if (r && r.filename !== "<anonymous>" && r.filename !== "[native code]")
        return r.filename || null;
    }
    return null;
  }
  i(gp, "_getLastValidUrl");
  function rr(e) {
    try {
      let r = [...(e.exception?.values ?? [])]
        .reverse()
        .find(
          (n) =>
            n.mechanism?.parent_id === void 0 && n.stacktrace?.frames?.length,
        )?.stacktrace?.frames;
      return r ? gp(r) : null;
    } catch {
      return (y && f.error(`Cannot extract url for event ${X(e)}`), null);
    }
  }
  i(rr, "_getEventFilterUrl");
  function bp(e) {
    return e.exception?.values?.length
      ? !e.message &&
          !e.exception.values.some(
            (t) => t.stacktrace || (t.type && t.type !== "Error") || t.value,
          )
      : !1;
  }
  i(bp, "_isUselessError");
  function Pi(e, t, r, n, s, a) {
    if (!s.exception?.values || !a || !w(a.originalException)) return;
    let c =
      s.exception.values.length > 0
        ? s.exception.values[s.exception.values.length - 1]
        : void 0;
    c &&
      (s.exception.values = Mi(
        e,
        t,
        n,
        a.originalException,
        r,
        s.exception.values,
        c,
        0,
      ));
  }
  i(Pi, "applyAggregateErrorsToEvent");
  function Mi(e, t, r, n, s, a, c, o) {
    if (a.length >= r + 1) return a;
    let l = [...a];
    if (w(n[s])) {
      ea(c, o, n);
      let p = e(t, n[s]),
        g = l.length;
      (ta(p, s, g, o), (l = Mi(e, t, r, n[s], s, [p, ...l], p, g)));
    }
    return (
      ra(n) &&
        n.errors.forEach((p, g) => {
          if (w(p)) {
            ea(c, o, n);
            let u = e(t, p),
              m = l.length;
            (ta(u, `errors[${g}]`, m, o),
              (l = Mi(e, t, r, p, s, [u, ...l], u, m)));
          }
        }),
      l
    );
  }
  i(Mi, "aggregateExceptionsFromError");
  function ra(e) {
    return Array.isArray(e.errors);
  }
  i(ra, "isExceptionGroup");
  function ea(e, t, r) {
    e.mechanism = {
      handled: !0,
      type: "auto.core.linked_errors",
      ...(ra(r) && { is_exception_group: !0 }),
      ...e.mechanism,
      exception_id: t,
    };
  }
  i(ea, "applyExceptionGroupFieldsForParentException");
  function ta(e, t, r, n) {
    e.mechanism = {
      handled: !0,
      ...e.mechanism,
      type: "chained",
      source: t,
      exception_id: r,
      parent_id: n,
    };
  }
  i(ta, "applyExceptionGroupFieldsForChildException");
  function fp(e) {
    return (
      w(e) &&
      "__sentry_fetch_url_host__" in e &&
      typeof e.__sentry_fetch_url_host__ == "string"
    );
  }
  i(fp, "hasSentryFetchUrlHost");
  function nr(e) {
    return fp(e) ? `${e.message} (${e.__sentry_fetch_url_host__})` : e.message;
  }
  i(nr, "_enhanceErrorWithSentryInfo");
  var ia = new Set([]);
  function St(e) {
    let t = "console",
      r = P(t, e);
    return (L(t, yp), r);
  }
  i(St, "addConsoleInstrumentationHandler");
  var na = new Set();
  function yp() {
    "console" in _ &&
      Ue.forEach(function (e) {
        na.has(e) ||
          !(e in _.console) ||
          (na.add(e),
          x(_.console, e, function (t) {
            return (
              (Ie[e] = t),
              function (...r) {
                let n = r[0],
                  s = Ie[e],
                  a = ia.size && typeof n == "string" && me(n, ia);
                (a || N("console", { args: r, level: e }),
                  (!a || (y && f.isEnabled())) && s?.apply(_.console, r));
              }
            );
          }));
      });
  }
  i(yp, "instrumentConsole");
  function Xe(e) {
    return e === "warn"
      ? "warning"
      : ["fatal", "error", "warning", "log", "info", "debug"].includes(e)
        ? e
        : "log";
  }
  i(Xe, "severityLevelFromString");
  var _p = "CaptureConsole",
    hp = i((e = {}) => {
      let t = e.levels || Ue,
        r = e.handled ?? !0;
      return {
        name: _p,
        setup(n) {
          "console" in _ &&
            St(({ args: s, level: a }) => {
              T() !== n || !t.includes(a) || vp(s, a, r);
            });
        },
      };
    }, "_captureConsoleIntegration"),
    sr = hp;
  function vp(e, t, r) {
    let n = Xe(t),
      s = new Error(),
      a = { level: Xe(t), extra: { arguments: e } };
    We((c) => {
      if (
        (c.addEventProcessor(
          (p) => (
            (p.logger = "console"),
            F(p, { handled: r, type: "auto.core.capture_console" }),
            p
          ),
        ),
        t === "assert")
      ) {
        if (!e[0]) {
          let p = `Assertion failed: ${Oe(e.slice(1), " ") || "console.assert"}`;
          (c.setExtra("arguments", e.slice(1)),
            c.captureMessage(p, n, {
              captureContext: a,
              syntheticException: s,
            }));
        }
        return;
      }
      let o = e.find((p) => p instanceof Error);
      if (o) {
        ze(o, a);
        return;
      }
      let l = Oe(e, " ");
      c.captureMessage(l, n, { captureContext: a, syntheticException: s });
    });
  }
  i(vp, "consoleHandler");
  var Sp = "Dedupe",
    Ep = i(() => {
      let e;
      return {
        name: Sp,
        processEvent(t) {
          if (t.type) return t;
          try {
            if (Tp(t, e))
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
    ar = Ep;
  function Tp(e, t) {
    return t ? !!(Ip(e, t) || Ap(e, t)) : !1;
  }
  i(Tp, "_shouldDropEvent");
  function Ip(e, t) {
    let r = e.message,
      n = t.message;
    return !(
      (!r && !n) ||
      (r && !n) ||
      (!r && n) ||
      r !== n ||
      !oa(e, t) ||
      !aa(e, t)
    );
  }
  i(Ip, "_isSameMessageEvent");
  function Ap(e, t) {
    let r = sa(t),
      n = sa(e);
    return !(
      !r ||
      !n ||
      r.type !== n.type ||
      r.value !== n.value ||
      !oa(e, t) ||
      !aa(e, t)
    );
  }
  i(Ap, "_isSameExceptionEvent");
  function aa(e, t) {
    let r = Lt(e),
      n = Lt(t);
    if (!r && !n) return !0;
    if ((r && !n) || (!r && n) || ((r = r), (n = n), n.length !== r.length))
      return !1;
    for (let s = 0; s < n.length; s++) {
      let a = n[s],
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
  i(aa, "_isSameStacktrace");
  function oa(e, t) {
    let r = e.fingerprint,
      n = t.fingerprint;
    if (!r && !n) return !0;
    if ((r && !n) || (!r && n)) return !1;
    ((r = r), (n = n));
    try {
      return r.join("") === n.join("");
    } catch {
      return !1;
    }
  }
  i(oa, "_isSameFingerprint");
  function sa(e) {
    return e.exception?.values?.[0];
  }
  i(sa, "_getExceptionFromEvent");
  var Op = "ConversationId",
    xp = i(
      () => ({
        name: Op,
        setup(e) {
          e.on("spanStart", (t) => {
            let r = U().getScopeData(),
              n = q().getScopeData(),
              s = r.conversationId || n.conversationId;
            if (s) {
              let { op: a, data: c, description: o } = be(t);
              if (
                !a?.startsWith("gen_ai.") &&
                !c["ai.operationId"] &&
                !o?.startsWith("ai.")
              )
                return;
              t.setAttribute(ai, s);
            }
          });
        },
      }),
      "_conversationIdIntegration",
    ),
    Li = xp;
  function or(e) {
    if (e !== void 0)
      return e >= 400 && e < 500 ? "warning" : e >= 500 ? "error" : void 0;
  }
  i(or, "getBreadcrumbLogLevelFromHttpStatusCode");
  var Et = _;
  function Di() {
    return "history" in Et && !!Et.history;
  }
  i(Di, "supportsHistory");
  function Rp() {
    if (!("fetch" in Et)) return !1;
    try {
      return (new Headers(), new Request("data:,"), new Response(), !0);
    } catch {
      return !1;
    }
  }
  i(Rp, "_isFetchSupported");
  function Tt(e) {
    return (
      e && /^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e.toString())
    );
  }
  i(Tt, "isNativeFunction");
  function Ui() {
    if (typeof EdgeRuntime == "string") return !0;
    if (!Rp()) return !1;
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
  i(Ui, "supportsNativeFetch");
  function Fi(e, t) {
    let r = "fetch",
      n = P(r, e);
    return (L(r, () => kp(void 0, t)), n);
  }
  i(Fi, "addFetchInstrumentationHandler");
  function kp(e, t = !1) {
    (t && !Ui()) ||
      x(_, "fetch", function (r) {
        return function (...n) {
          let s = new Error(),
            { method: a, url: c } = Np(n),
            o = {
              args: n,
              fetchData: { method: a, url: c },
              startTimestamp: B() * 1e3,
              virtualError: s,
              headers: wp(n),
            };
          return (
            e || N("fetch", { ...o }),
            r.apply(_, n).then(
              async (l) => (
                e
                  ? e(l)
                  : N("fetch", { ...o, endTimestamp: B() * 1e3, response: l }),
                l
              ),
              (l) => {
                (N("fetch", { ...o, endTimestamp: B() * 1e3, error: l }),
                  w(l) &&
                    l.stack === void 0 &&
                    ((l.stack = s.stack), D(l, "framesToPop", 1)));
                let g = T()?.getOptions().enhanceFetchErrorMessages ?? "always";
                if (
                  g !== !1 &&
                  w(l) &&
                  l.name === "TypeError" &&
                  (l.message === "Failed to fetch" ||
                    l.message === "Load failed" ||
                    l.message ===
                      "NetworkError when attempting to fetch resource.")
                )
                  try {
                    let d = new URL(o.fetchData.url).host;
                    g === "always"
                      ? (l.message = `${l.message} (${d})`)
                      : D(l, "__sentry_fetch_url_host__", d);
                  } catch {}
                throw l;
              },
            )
          );
        };
      });
  }
  i(kp, "instrumentFetch");
  function lr(e, t) {
    return oe(e) && !!e[t];
  }
  i(lr, "hasProp");
  function la(e) {
    return typeof e == "string"
      ? e
      : e
        ? lr(e, "url")
          ? e.url
          : e.toString
            ? e.toString()
            : ""
        : "";
  }
  i(la, "getUrlFromResource");
  function Np(e) {
    if (e.length === 0) return { method: "GET", url: "" };
    if (e.length === 2) {
      let [r, n] = e;
      return {
        url: la(r),
        method: lr(n, "method")
          ? String(n.method).toUpperCase()
          : Yr(r) && lr(r, "method")
            ? String(r.method).toUpperCase()
            : "GET",
      };
    }
    let t = e[0];
    return {
      url: la(t),
      method: lr(t, "method") ? String(t.method).toUpperCase() : "GET",
    };
  }
  i(Np, "parseFetchArgs");
  function wp(e) {
    let [t, r] = e;
    try {
      if (typeof r == "object" && r !== null && "headers" in r && r.headers)
        return new Headers(r.headers);
      if (Yr(t)) return new Headers(t.headers);
    } catch {}
  }
  i(wp, "getHeadersFromFetchArgs");
  var pa = _;
  function we() {
    try {
      return pa.document.location.href;
    } catch {
      return "";
    }
  }
  i(we, "getLocationHref");
  function Bi(e, t = 5) {
    if (!pa.HTMLElement) return null;
    let r = e;
    for (let n = 0; n < t; n++) {
      if (!r) return null;
      if (r instanceof HTMLElement) {
        if (r.dataset.sentryComponent) return r.dataset.sentryComponent;
        if (r.dataset.sentryElement) return r.dataset.sentryElement;
      }
      r = r.parentNode;
    }
    return null;
  }
  i(Bi, "getComponentName");
  var E = _,
    Gi = 0;
  function qi() {
    return Gi > 0;
  }
  i(qi, "shouldIgnoreOnError");
  function rc() {
    (Gi++,
      setTimeout(() => {
        Gi--;
      }));
  }
  i(rc, "ignoreNextOnError");
  function Me(e, t = {}) {
    function r(s) {
      return typeof s == "function";
    }
    if ((i(r, "isFunction"), !r(e))) return e;
    try {
      if (Object.prototype.hasOwnProperty.call(e, "__sentry_wrapped__")) {
        let a = e.__sentry_wrapped__;
        return typeof a == "function" ? a : e;
      }
      if (de(e)) return e;
    } catch {
      return e;
    }
    let n = i(function (...s) {
      _._sentryWrappedDepth = (_._sentryWrappedDepth || 0) + 1;
      try {
        let a = s.map((c) => Me(c, t));
        return e.apply(this, a);
      } catch (a) {
        throw (
          rc(),
          We((c) => {
            (c.addEventProcessor(
              (o) => (
                t.mechanism && (Re(o, void 0, void 0), F(o, t.mechanism)),
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
        Object.prototype.hasOwnProperty.call(e, s) && (n[s] = e[s]);
    } catch {}
    (nt(n, e), D(e, "__sentry_wrapped__", n));
    try {
      Object.getOwnPropertyDescriptor(n, "name").configurable &&
        Object.defineProperty(n, "name", {
          get() {
            return e.name;
          },
        });
    } catch {}
    return n;
  }
  i(Me, "wrap");
  function Hi() {
    let e = we(),
      { referrer: t } = E.document || {},
      { userAgent: r } = E.navigator || {},
      n = { ...(t && { Referer: t }), ...(r && { "User-Agent": r }) };
    return { url: e, headers: n };
  }
  i(Hi, "getHttpRequestData");
  function pr(e, t) {
    let r = cr(e, t),
      n = { type: oc(t), value: lc(t) };
    return (
      r.length && (n.stacktrace = { frames: r }),
      n.type === void 0 &&
        n.value === "" &&
        (n.value = "Unrecoverable error caught"),
      n
    );
  }
  i(pr, "exceptionFromError");
  function ic(e, t, r, n) {
    let a = T()?.getOptions().normalizeDepth,
      c = uc(t),
      o = { __serialized__: Bt(t, a) };
    if (c) return { exception: { values: [pr(e, c)] }, extra: o };
    let l = {
      exception: {
        values: [
          {
            type: ue(t)
              ? t.constructor.name
              : n
                ? "UnhandledRejection"
                : "Error",
            value: pc(t, { isUnhandledRejection: n }),
          },
        ],
      },
      extra: o,
    };
    if (r) {
      let p = cr(e, r);
      p.length && (l.exception.values[0].stacktrace = { frames: p });
    }
    return l;
  }
  i(ic, "eventFromPlainObject");
  function Yi(e, t) {
    return { exception: { values: [pr(e, t)] } };
  }
  i(Yi, "eventFromError");
  function cr(e, t) {
    let r = t.stacktrace || t.stack || "",
      n = sc(t),
      s = ac(t);
    try {
      return e(r, n, s);
    } catch {}
    return [];
  }
  i(cr, "parseStackFrames");
  var nc = /Minified React error #\d+;/i;
  function sc(e) {
    return e && nc.test(e.message) ? 1 : 0;
  }
  i(sc, "getSkipFirstStackStringLines");
  function ac(e) {
    return typeof e.framesToPop == "number" ? e.framesToPop : 0;
  }
  i(ac, "getPopFirstTopFrames");
  function ca(e) {
    return typeof WebAssembly < "u" && typeof WebAssembly.Exception < "u"
      ? e instanceof WebAssembly.Exception
      : !1;
  }
  i(ca, "isWebAssemblyException");
  function oc(e) {
    let t = e?.name;
    return !t && ca(e)
      ? e.message && Array.isArray(e.message) && e.message.length == 2
        ? e.message[0]
        : "WebAssembly.Exception"
      : t;
  }
  i(oc, "extractType");
  function lc(e) {
    let t = e?.message;
    return ca(e)
      ? Array.isArray(e.message) && e.message.length == 2
        ? e.message[1]
        : "wasm exception"
      : t
        ? t.error && typeof t.error.message == "string"
          ? nr(t.error)
          : nr(e)
        : "No error message";
  }
  i(lc, "extractMessage");
  function ua(e, t, r, n) {
    let s = r?.syntheticException || void 0,
      a = ur(e, t, s, n);
    return (
      F(a),
      (a.level = "error"),
      r?.event_id && (a.event_id = r.event_id),
      se(a)
    );
  }
  i(ua, "eventFromException");
  function da(e, t, r = "info", n, s) {
    let a = n?.syntheticException || void 0,
      c = Wi(e, t, a, s);
    return ((c.level = r), n?.event_id && (c.event_id = n.event_id), se(c));
  }
  i(da, "eventFromMessage");
  function ur(e, t, r, n, s) {
    let a;
    if (Be(t) && t.error) return Yi(e, t.error);
    if (rt(t) || Dt(t)) {
      let c = t;
      if ("stack" in t) {
        a = Yi(e, t);
        let o = a.exception?.values?.[0];
        if (n && r && o && !o.stacktrace) {
          let l = cr(e, r);
          l.length && ((o.stacktrace = { frames: l }), F(a, { synthetic: !0 }));
        }
      } else {
        let o = c.name || (rt(c) ? "DOMError" : "DOMException"),
          l = c.message ? `${o}: ${c.message}` : o;
        ((a = Wi(e, l, r, n)), Re(a, l));
      }
      return (
        "code" in c &&
          (a.tags = { ...a.tags, "DOMException.code": `${c.code}` }),
        a
      );
    }
    return w(t)
      ? Yi(e, t)
      : te(t) || ue(t)
        ? ((a = ic(e, t, r, s)), F(a, { synthetic: !0 }), a)
        : ((a = Wi(e, t, r, n)),
          Re(a, `${t}`, void 0),
          F(a, { synthetic: !0 }),
          a);
  }
  i(ur, "eventFromUnknownInput");
  function Wi(e, t, r, n) {
    let s = {};
    if (n && r) {
      let a = cr(e, r);
      (a.length &&
        (s.exception = { values: [{ value: t, stacktrace: { frames: a } }] }),
        F(s, { synthetic: !0 }));
    }
    if (ce(t)) {
      let { __sentry_template_string__: a, __sentry_template_values__: c } = t;
      return ((s.logentry = { message: a, params: c }), s);
    }
    return ((s.message = t), s);
  }
  i(Wi, "eventFromString");
  function pc(e, { isUnhandledRejection: t }) {
    let r = Ft(e),
      n = t ? "promise rejection" : "exception";
    return Be(e)
      ? `Event \`ErrorEvent\` captured as ${n} with message \`${e.message}\``
      : ue(e)
        ? `Event \`${cc(e)}\` (type=${e.type}) captured as ${n}`
        : `Object captured as ${n} with keys: ${r}`;
  }
  i(pc, "getNonErrorObjectExceptionValue");
  function cc(e) {
    try {
      let t = Object.getPrototypeOf(e);
      return t ? t.constructor.name : void 0;
    } catch {}
  }
  i(cc, "getObjectClassName");
  function uc(e) {
    return Object.values(e).find(w);
  }
  i(uc, "getErrorPropertyFromObject");
  var Vi = class Vi extends ht {
    constructor(t) {
      let r = dc(t),
        n = E.SENTRY_SDK_SOURCE || Ei();
      (wi(r, "browser", ["browser"], n), super(r));
      let { userInfo: s } = this.getDataCollectionOptions();
      r._metadata?.sdk &&
        (r._metadata.sdk.settings = {
          infer_ip: s ? "auto" : "never",
          ...r._metadata.sdk.settings,
        });
      let { sendClientReports: a } = this._options;
      (E.document &&
        E.document.addEventListener("visibilitychange", () => {
          E.document.visibilityState === "hidden" &&
            (a && this._flushOutcomes(),
            queueMicrotask(() => {
              this.flush();
            }));
        }),
        s && this.on("beforeSendSession", Ni));
    }
    eventFromException(t, r) {
      return ua(
        this._options.stackParser,
        t,
        r,
        this._options.attachStacktrace,
      );
    }
    eventFromMessage(t, r = "info", n) {
      return da(
        this._options.stackParser,
        t,
        r,
        n,
        this._options.attachStacktrace,
      );
    }
    _prepareEvent(t, r, n, s) {
      return (
        (t.platform = t.platform || "javascript"),
        super._prepareEvent(t, r, n, s)
      );
    }
  };
  i(Vi, "BrowserClient");
  var dr = Vi;
  function dc(e) {
    return {
      release:
        typeof __SENTRY_RELEASE__ == "string"
          ? __SENTRY_RELEASE__
          : E.SENTRY_RELEASE?.id,
      sendClientReports: !0,
      parentSpanIsAlwaysRootSpan: !0,
      ...e,
    };
  }
  i(dc, "applyDefaultOptions");
  var ma = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__;
  var I = _;
  function ji(e, t, r) {
    I.document && I.addEventListener(e, t, r);
  }
  i(ji, "addPageListener");
  function zi(e, t, r) {
    I.document && I.removeEventListener(e, t, r);
  }
  i(zi, "removePageListener");
  var ga = i((e) => {
    let t = !1;
    return () => {
      t || (e(), (t = !0));
    };
  }, "runOnce");
  var Ki = i((e) => {
    let t = I.requestIdleCallback || I.setTimeout;
    I.document?.visibilityState === "hidden"
      ? e()
      : ((e = ga(e)),
        ji("visibilitychange", e, { once: !0, capture: !0 }),
        ji("pagehide", e, { once: !0, capture: !0 }),
        t(() => {
          (e(),
            zi("visibilitychange", e, { capture: !0 }),
            zi("pagehide", e, { capture: !0 }));
        }));
  }, "whenIdleOrHidden");
  var mc = 80,
    Pe = {};
  try {
    (typeof Node < "u" &&
      (Pe.parentNode = Object.getOwnPropertyDescriptor(
        Node.prototype,
        "parentNode",
      ).get),
      typeof Element < "u" &&
        ((Pe.tagName = Object.getOwnPropertyDescriptor(
          Element.prototype,
          "tagName",
        ).get),
        (Pe.id = Object.getOwnPropertyDescriptor(Element.prototype, "id").get),
        (Pe.className = Object.getOwnPropertyDescriptor(
          Element.prototype,
          "className",
        ).get),
        (Pe.getAttribute = Element.prototype.getAttribute)),
      typeof HTMLElement < "u" &&
        (Pe.dataset = Object.getOwnPropertyDescriptor(
          HTMLElement.prototype,
          "dataset",
        ).get));
  } catch {}
  function _e(e, t, r) {
    let n = Pe[t];
    if (n)
      try {
        return n.call(e, r);
      } catch {}
    let s = e[t];
    return typeof s == "function" ? s.call(e, r) : s;
  }
  i(_e, "_safeRead");
  function It(e, t = {}) {
    if (!e) return "<unknown>";
    try {
      let r = e,
        n = 5,
        s = [],
        a = 0,
        c = 0,
        o = " > ",
        l = o.length,
        p,
        g = Array.isArray(t) ? t : t.keyAttrs,
        u = (!Array.isArray(t) && t.maxStringLength) || mc;
      for (
        ;
        r &&
        a++ < n &&
        ((p = gc(r, g)),
        !(p === "html" || (a > 1 && c + s.length * l + p.length >= u)));
      )
        (s.push(p), (c += p.length), (r = _e(r, "parentNode")));
      return s.reverse().join(o);
    } catch {
      return "<unknown>";
    }
  }
  i(It, "htmlTreeAsString");
  function gc(e, t) {
    let r = [],
      n = _e(e, "tagName");
    if (!n) return "";
    if (typeof HTMLElement < "u" && e instanceof HTMLElement) {
      let a = _e(e, "dataset");
      if (a) {
        if (a.sentryComponent) return a.sentryComponent;
        if (a.sentryElement) return a.sentryElement;
      }
    }
    r.push(n.toLowerCase());
    let s = t?.length
      ? t
          .filter((a) => _e(e, "getAttribute", a))
          .map((a) => [a, _e(e, "getAttribute", a)])
      : null;
    if (s?.length)
      s.forEach((a) => {
        r.push(`[${a[0]}="${a[1]}"]`);
      });
    else {
      let a = _e(e, "id");
      a && r.push(`#${a}`);
      let c = _e(e, "className");
      if (c && C(c)) {
        let o = c.split(/\s+/);
        for (let l of o) r.push(`.${l}`);
      }
    }
    for (let a of ["aria-label", "type", "name", "title", "alt"]) {
      let c = _e(e, "getAttribute", a);
      c && r.push(`[${a}="${c}"]`);
    }
    return r.join("");
  }
  i(gc, "_htmlElementAsString");
  var bc = 1e3,
    ba,
    $i,
    Qi;
  function Xi(e) {
    (P("dom", e), L("dom", fc));
  }
  i(Xi, "addClickKeypressInstrumentationHandler");
  function fc() {
    if (!I.document) return;
    let e = N.bind(null, "dom"),
      t = fa(e, !0);
    (I.document.addEventListener("click", t, !1),
      I.document.addEventListener("keypress", t, !1),
      ["EventTarget", "Node"].forEach((r) => {
        let s = I[r]?.prototype;
        s?.hasOwnProperty?.("addEventListener") &&
          (x(s, "addEventListener", function (a) {
            return function (c, o, l) {
              if (c === "click" || c == "keypress")
                try {
                  let p = (this.__sentry_instrumentation_handlers__ =
                      this.__sentry_instrumentation_handlers__ || {}),
                    g = (p[c] = p[c] || { refCount: 0 });
                  if (!g.handler) {
                    let u = fa(e);
                    ((g.handler = u), a.call(this, c, u, l));
                  }
                  g.refCount++;
                } catch {}
              return a.call(this, c, o, l);
            };
          }),
          x(s, "removeEventListener", function (a) {
            return function (c, o, l) {
              if (c === "click" || c == "keypress")
                try {
                  let p = this.__sentry_instrumentation_handlers__ || {},
                    g = p[c];
                  g &&
                    (g.refCount--,
                    g.refCount <= 0 &&
                      (a.call(this, c, g.handler, l),
                      (g.handler = void 0),
                      delete p[c]),
                    Object.keys(p).length === 0 &&
                      delete this.__sentry_instrumentation_handlers__);
                } catch {}
              return a.call(this, c, o, l);
            };
          }));
      }));
  }
  i(fc, "instrumentDOM");
  function yc(e) {
    if (e.type !== $i) return !1;
    try {
      if (!e.target || e.target._sentryId !== Qi) return !1;
    } catch {}
    return !0;
  }
  i(yc, "isSimilarToLastCapturedEvent");
  function _c(e, t) {
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
  i(_c, "shouldSkipDOMEvent");
  function fa(e, t = !1) {
    return (r) => {
      if (!r || r._sentryCaptured) return;
      let n = hc(r);
      if (_c(r.type, n)) return;
      (D(r, "_sentryCaptured", !0),
        n && !n._sentryId && D(n, "_sentryId", R()));
      let s = r.type === "keypress" ? "input" : r.type;
      (yc(r) ||
        (e({ event: r, name: s, global: t }),
        ($i = r.type),
        (Qi = n ? n._sentryId : void 0)),
        clearTimeout(ba),
        (ba = I.setTimeout(() => {
          ((Qi = void 0), ($i = void 0));
        }, bc)));
    };
  }
  i(fa, "makeDOMEventHandler");
  function hc(e) {
    try {
      return e.target;
    } catch {
      return null;
    }
  }
  i(hc, "getEventTarget");
  var mr;
  function At(e) {
    let t = "history";
    (P(t, e), L(t, vc));
  }
  i(At, "addHistoryInstrumentationHandler");
  function vc() {
    if (
      (I.addEventListener("popstate", () => {
        let t = I.location.href,
          r = mr;
        if (((mr = t), r === t)) return;
        N("history", { from: r, to: t });
      }),
      !Di())
    )
      return;
    function e(t) {
      return function (...r) {
        let n = r.length > 2 ? r[2] : void 0;
        if (n) {
          let s = mr,
            a = Sc(String(n));
          if (((mr = a), s === a)) return t.apply(this, r);
          N("history", { from: s, to: a });
        }
        return t.apply(this, r);
      };
    }
    (i(e, "historyReplacementFunction"),
      x(I.history, "pushState", e),
      x(I.history, "replaceState", e));
  }
  i(vc, "instrumentHistory");
  function Sc(e) {
    try {
      return new URL(e, I.location.origin).toString();
    } catch {
      return e;
    }
  }
  i(Sc, "getAbsoluteUrl");
  var gr = {};
  function Ji(e) {
    let t = gr[e];
    if (t) return t;
    let r = I[e];
    if (Tt(r)) return (gr[e] = r.bind(I));
    let n = I.document;
    if (n && typeof n.createElement == "function")
      try {
        let s = n.createElement("iframe");
        ((s.hidden = !0), n.head.appendChild(s));
        let a = s.contentWindow;
        (a?.[e] && (r = a[e]), n.head.removeChild(s));
      } catch (s) {
        ma &&
          f.warn(
            `Could not create sandbox iframe for ${e} check, bailing to window.${e}: `,
            s,
          );
      }
    return r && (gr[e] = r.bind(I));
  }
  i(Ji, "getNativeImplementation");
  function Zi(e) {
    gr[e] = void 0;
  }
  i(Zi, "clearCachedImplementation");
  var Le = "__sentry_xhr_v3__";
  function en(e) {
    (P("xhr", e), L("xhr", Ec));
  }
  i(en, "addXhrInstrumentationHandler");
  function Ec() {
    if (!I.XMLHttpRequest) return;
    let e = XMLHttpRequest.prototype;
    ((e.open = new Proxy(e.open, {
      apply(t, r, n) {
        let s = new Error(),
          a = B() * 1e3,
          c = C(n[0]) ? n[0].toUpperCase() : void 0,
          o = Tc(n[1]);
        if (!c || !o) return t.apply(r, n);
        ((r[Le] = { method: c, url: o, request_headers: {} }),
          c === "POST" &&
            o.match(/sentry_key/) &&
            (r.__sentry_own_request__ = !0));
        let l = i(() => {
          let p = r[Le];
          if (p && r.readyState === 4) {
            try {
              p.status_code = r.status;
            } catch {}
            let g = {
              endTimestamp: B() * 1e3,
              startTimestamp: a,
              xhr: r,
              virtualError: s,
            };
            (N("xhr", g), r.removeEventListener("readystatechange", l));
          }
        }, "onreadystatechangeHandler");
        return (
          "onreadystatechange" in r && typeof r.onreadystatechange == "function"
            ? (r.onreadystatechange = new Proxy(r.onreadystatechange, {
                apply(p, g, u) {
                  return (l(), p.apply(g, u));
                },
              }))
            : r.addEventListener("readystatechange", l),
          (r.setRequestHeader = new Proxy(r.setRequestHeader, {
            apply(p, g, u) {
              let [m, d] = u,
                b = g[Le];
              return (
                b && C(m) && C(d) && (b.request_headers[m.toLowerCase()] = d),
                p.apply(g, u)
              );
            },
          })),
          t.apply(r, n)
        );
      },
    })),
      (e.send = new Proxy(e.send, {
        apply(t, r, n) {
          let s = r[Le];
          if (!s) return t.apply(r, n);
          n[0] !== void 0 && (s.body = n[0]);
          let a = { startTimestamp: B() * 1e3, xhr: r };
          return (N("xhr", a), t.apply(r, n));
        },
      })));
  }
  i(Ec, "instrumentXHR");
  function Tc(e) {
    if (C(e)) return e;
    try {
      return e.toString();
    } catch {}
  }
  i(Tc, "parseXhrUrlArg");
  function tn(e) {
    if (typeof Element > "u") return !1;
    try {
      return e instanceof Element;
    } catch {
      return !1;
    }
  }
  i(tn, "isElement");
  var Ic = 40;
  function ya(e, t = Ji("fetch")) {
    let r = 0,
      n = 0;
    async function s(a) {
      let c = a.body.length;
      ((r += c), n++);
      let o = {
        body: a.body,
        method: "POST",
        referrerPolicy: "strict-origin",
        headers: e.headers,
        keepalive: r <= 6e4 && n < 15,
        ...e.fetchOptions,
      };
      try {
        let l = await t(e.url, o);
        return {
          statusCode: l.status,
          headers: {
            "x-sentry-rate-limits": l.headers.get("X-Sentry-Rate-Limits"),
            "retry-after": l.headers.get("Retry-After"),
          },
        };
      } catch (l) {
        throw (Zi("fetch"), l);
      } finally {
        ((r -= c), n--);
      }
    }
    return (i(s, "makeRequest"), Jt(e, s, Ne(e.bufferSize || Ic)));
  }
  i(ya, "makeFetchTransport");
  var he = typeof __SENTRY_DEBUG__ > "u" || __SENTRY_DEBUG__;
  var Ac = 30;
  var Oc = 50;
  function rn(e, t, r, n) {
    let s = {
      filename: e,
      function: t === "<anonymous>" ? "?" : t,
      in_app: !0,
    };
    return (r !== void 0 && (s.lineno = r), n !== void 0 && (s.colno = n), s);
  }
  i(rn, "createFrame");
  var xc = /^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i,
    Rc =
      /^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
    kc = /\((\S*)(?::(\d+))(?::(\d+))\)/,
    Nc = /at (.+?) ?\(data:(.+?),/,
    wc = i((e) => {
      let t = e.match(Nc);
      if (t) return { filename: `<data:${t[2]}>`, function: t[1] };
      let r = xc.exec(e);
      if (r) {
        let [, s, a, c] = r;
        return rn(s, "?", +a, +c);
      }
      let n = Rc.exec(e);
      if (n) {
        if (n[2]?.indexOf("eval") === 0) {
          let o = kc.exec(n[2]);
          o && ((n[2] = o[1]), (n[3] = o[2]), (n[4] = o[3]));
        }
        let [a, c] = ha(n[1] || "?", n[2]);
        return rn(c, a, n[3] ? +n[3] : void 0, n[4] ? +n[4] : void 0);
      }
    }, "chromeStackParserFn"),
    Cc = [Ac, wc],
    Mc =
      /^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i,
    Pc = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
    Lc = i((e) => {
      let t = Mc.exec(e);
      if (t) {
        if (t[3] && t[3].indexOf(" > eval") > -1) {
          let a = Pc.exec(t[3]);
          a &&
            ((t[1] = t[1] || "eval"),
            (t[3] = a[1]),
            (t[4] = a[2]),
            (t[5] = ""));
        }
        let n = t[3],
          s = t[1] || "?";
        return (
          ([s, n] = ha(s, n)),
          rn(n, s, t[4] ? +t[4] : void 0, t[5] ? +t[5] : void 0)
        );
      }
    }, "gecko"),
    Dc = [Oc, Lc];
  var Uc = [Cc, Dc],
    _a = Pt(...Uc),
    ha = i((e, t) => {
      let r = e.indexOf("safari-extension") !== -1,
        n = e.indexOf("safari-web-extension") !== -1;
      return r || n
        ? [
            e.indexOf("@") !== -1 ? e.split("@")[0] : "?",
            r ? `safari-extension:${t}` : `safari-web-extension:${t}`,
          ]
        : [e, t];
    }, "extractSafariExtensionDetails");
  var br = 1024,
    Fc = "Breadcrumbs",
    Bc = i((e = {}) => {
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
        name: Fc,
        setup(r) {
          (t.console && St(Hc(r)),
            t.dom && Xi(qc(r, t.dom)),
            t.xhr && en(Yc(r)),
            t.fetch && Fi(Wc(r)),
            t.history && At(Vc(r)),
            t.sentry && r.on("beforeSendEvent", Gc(r)));
        },
      };
    }, "_breadcrumbsIntegration"),
    va = Bc;
  function Gc(e) {
    return i(function (r) {
      T() === e &&
        ae(
          {
            category: `sentry.${r.type === "transaction" ? "transaction" : "event"}`,
            event_id: r.event_id,
            level: r.level,
            message: X(r),
          },
          { event: r },
        );
    }, "addSentryBreadcrumb");
  }
  i(Gc, "_getSentryBreadcrumbHandler");
  function qc(e, t) {
    return i(function (n) {
      if (T() !== e) return;
      let s,
        a,
        c = typeof t == "object" ? t.serializeAttribute : void 0,
        o =
          typeof t == "object" && typeof t.maxStringLength == "number"
            ? t.maxStringLength
            : void 0;
      (o &&
        o > br &&
        (he &&
          f.warn(
            `\`dom.maxStringLength\` cannot exceed ${br}, but a value of ${o} was configured. Sentry will use ${br} instead.`,
          ),
        (o = br)),
        typeof c == "string" && (c = [c]));
      try {
        let p = n.event,
          g = jc(p) ? p.target : p;
        ((s = It(g, { keyAttrs: c, maxStringLength: o })), (a = Bi(g)));
      } catch {
        s = "<unknown>";
      }
      if (s.length === 0) return;
      let l = { category: `ui.${n.name}`, message: s };
      (a && (l.data = { "ui.component_name": a }),
        ae(l, { event: n.event, name: n.name, global: n.global }));
    }, "_innerDomBreadcrumb");
  }
  i(qc, "_getDomBreadcrumbHandler");
  function Hc(e) {
    return i(function (r) {
      if (T() !== e) return;
      let n = {
        category: "console",
        data: { arguments: r.args, logger: "console" },
        level: Xe(r.level),
        message: Oe(r.args, " "),
      };
      if (r.level === "assert")
        if (r.args[0] === !1)
          ((n.message = `Assertion failed: ${Oe(r.args.slice(1), " ") || "console.assert"}`),
            (n.data.arguments = r.args.slice(1)));
        else return;
      ae(n, { input: r.args, level: r.level });
    }, "_consoleBreadcrumb");
  }
  i(Hc, "_getConsoleBreadcrumbHandler");
  function Yc(e) {
    return i(function (r) {
      if (T() !== e) return;
      let { startTimestamp: n, endTimestamp: s } = r,
        a = r.xhr[Le];
      if (!n || !s || !a) return;
      let { method: c, url: o, status_code: l, body: p } = a,
        g = { method: c, url: o, status_code: l },
        u = { xhr: r.xhr, input: p, startTimestamp: n, endTimestamp: s },
        m = { category: "xhr", data: g, type: "http", level: or(l) };
      (e.emit("beforeOutgoingRequestBreadcrumb", m, u), ae(m, u));
    }, "_xhrBreadcrumb");
  }
  i(Yc, "_getXhrBreadcrumbHandler");
  function Wc(e) {
    return i(function (r) {
      if (T() !== e) return;
      let { startTimestamp: n, endTimestamp: s } = r;
      if (
        s &&
        !(r.fetchData.url.match(/sentry_key/) && r.fetchData.method === "POST")
      )
        if (r.error) {
          let a = {
              data: r.error,
              input: r.args,
              startTimestamp: n,
              endTimestamp: s,
            },
            c = {
              category: "fetch",
              data: r.fetchData,
              level: "error",
              type: "http",
            };
          (e.emit("beforeOutgoingRequestBreadcrumb", c, a), ae(c, a));
        } else {
          let a = r.response,
            c = { ...r.fetchData, status_code: a?.status },
            o = {
              input: r.args,
              response: a,
              startTimestamp: n,
              endTimestamp: s,
            },
            l = {
              category: "fetch",
              data: c,
              type: "http",
              level: or(c.status_code),
            };
          (e.emit("beforeOutgoingRequestBreadcrumb", l, o), ae(l, o));
        }
    }, "_fetchBreadcrumb");
  }
  i(Wc, "_getFetchBreadcrumbHandler");
  function Vc(e) {
    return i(function (r) {
      if (T() !== e) return;
      let n = r.from,
        s = r.to,
        a = vt(E.location.href),
        c = n ? vt(n) : void 0,
        o = vt(s);
      (c?.path || (c = a),
        a.protocol === o.protocol && a.host === o.host && (s = o.relative),
        a.protocol === c.protocol && a.host === c.host && (n = c.relative),
        ae({ category: "navigation", data: { from: n, to: s } }));
    }, "_historyBreadcrumb");
  }
  i(Vc, "_getHistoryBreadcrumbHandler");
  function jc(e) {
    return !!e && !!e.target;
  }
  i(jc, "_isEvent");
  var zc =
      "EventTarget,Window,Node,ApplicationCache,AudioTrackList,BroadcastChannel,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,SharedWorker,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload".split(
        ",",
      ),
    Kc = "BrowserApiErrors",
    $c = i((e = {}) => {
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
        name: Kc,
        setupOnce() {
          (t.setTimeout && x(E, "setTimeout", Sa),
            t.setInterval && x(E, "setInterval", Sa),
            t.requestAnimationFrame && x(E, "requestAnimationFrame", Qc),
            t.XMLHttpRequest &&
              "XMLHttpRequest" in E &&
              x(XMLHttpRequest.prototype, "send", Xc));
          let r = t.eventTarget;
          r && (Array.isArray(r) ? r : zc).forEach((s) => Jc(s, t));
        },
      };
    }, "_browserApiErrorsIntegration"),
    Ea = $c;
  function Sa(e) {
    return function (...t) {
      let r = t[0];
      return (
        (t[0] = Me(r, {
          mechanism: {
            handled: !1,
            type: `auto.browser.browserapierrors.${W(e)}`,
          },
        })),
        e.apply(this, t)
      );
    };
  }
  i(Sa, "_wrapTimeFunction");
  function Qc(e) {
    return function (t) {
      return e.apply(this, [
        Me(t, {
          mechanism: {
            data: { handler: W(e) },
            handled: !1,
            type: "auto.browser.browserapierrors.requestAnimationFrame",
          },
        }),
      ]);
    };
  }
  i(Qc, "_wrapRAF");
  function Xc(e) {
    return function (...t) {
      let r = this;
      return (
        ["onload", "onerror", "onprogress", "onreadystatechange"].forEach(
          (s) => {
            s in r &&
              typeof r[s] == "function" &&
              x(r, s, function (a) {
                let c = {
                    mechanism: {
                      data: { handler: W(a) },
                      handled: !1,
                      type: `auto.browser.browserapierrors.xhr.${s}`,
                    },
                  },
                  o = de(a);
                return (o && (c.mechanism.data.handler = W(o)), Me(a, c));
              });
          },
        ),
        e.apply(this, t)
      );
    };
  }
  i(Xc, "_wrapXHR");
  function Jc(e, t) {
    let n = E[e]?.prototype;
    n?.hasOwnProperty?.("addEventListener") &&
      (x(n, "addEventListener", function (s) {
        return function (a, c, o) {
          try {
            Zc(c) &&
              (c.handleEvent = Me(c.handleEvent, {
                mechanism: {
                  data: { handler: W(c), target: e },
                  handled: !1,
                  type: "auto.browser.browserapierrors.handleEvent",
                },
              }));
          } catch {}
          return (
            t.unregisterOriginalCallbacks && eu(this, a, c),
            s.apply(this, [
              a,
              Me(c, {
                mechanism: {
                  data: { handler: W(c), target: e },
                  handled: !1,
                  type: "auto.browser.browserapierrors.addEventListener",
                },
              }),
              o,
            ])
          );
        };
      }),
      x(n, "removeEventListener", function (s) {
        return function (a, c, o) {
          try {
            if (Object.prototype.hasOwnProperty.call(c, "__sentry_wrapped__")) {
              let l = c.__sentry_wrapped__;
              l && s.call(this, a, l, o);
            }
          } catch {}
          return s.call(this, a, c, o);
        };
      }));
  }
  i(Jc, "_wrapEventTarget");
  function Zc(e) {
    return typeof e.handleEvent == "function";
  }
  i(Zc, "isEventListenerObject");
  function eu(e, t, r) {
    e &&
      typeof e == "object" &&
      "removeEventListener" in e &&
      typeof e.removeEventListener == "function" &&
      e.removeEventListener(t, r);
  }
  i(eu, "unregisterOriginalCallback");
  var Ta = (e = {}) => {
    let t = e.lifecycle ?? "route";
    return {
      name: "BrowserSession",
      setupOnce() {
        if (typeof E.document > "u") {
          he &&
            f.warn(
              "Using the `browserSessionIntegration` in non-browser environments is not supported.",
            );
          return;
        }
        yt({ ignoreDuration: !0 });
        let r = !1;
        Ki(() => {
          r || (Ke(), (r = !0));
        });
        let n = q(),
          s = n.getUser();
        (n.addScopeListener((a) => {
          let c = a.getUser();
          (s?.id !== c?.id || s?.ip_address !== c?.ip_address) &&
            ((s = c), r && Ke());
        }),
          t === "route" &&
            At(({ from: a, to: c }) => {
              a !== c && (yt({ ignoreDuration: !0 }), Ke(), (r = !0));
            }));
      },
    };
  };
  var tu = "CultureContext",
    ru = i(
      () => ({
        name: tu,
        preprocessEvent(e) {
          let t = Ia();
          t &&
            (e.contexts = {
              ...e.contexts,
              culture: { ...t, ...e.contexts?.culture },
            });
        },
        processSegmentSpan(e) {
          let t = Ia();
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
    Aa = ru;
  function Ia() {
    try {
      let e = E.Intl;
      if (!e) return;
      let t = e.DateTimeFormat().resolvedOptions();
      return { locale: t.locale, timezone: t.timeZone, calendar: t.calendar };
    } catch {
      return;
    }
  }
  i(Ia, "getCultureContext");
  var iu = "GlobalHandlers",
    nu = i((e = {}) => {
      let t = { onerror: !0, onunhandledrejection: !0, ...e };
      return {
        name: iu,
        setupOnce() {
          Error.stackTraceLimit = 50;
        },
        setup(r) {
          (t.onerror && (su(r), Oa("onerror")),
            t.onunhandledrejection && (au(r), Oa("onunhandledrejection")));
        },
      };
    }, "_globalHandlersIntegration"),
    xa = nu;
  function su(e) {
    Gr((t) => {
      let { stackParser: r, attachStacktrace: n } = Ra();
      if (T() !== e || qi()) return;
      let { msg: s, url: a, line: c, column: o, error: l } = t,
        p = pu(ur(r, l || s, void 0, n, !1), a, c, o);
      ((p.level = "error"),
        ft(p, {
          originalException: l,
          mechanism: {
            handled: !1,
            type: "auto.browser.global_handlers.onerror",
          },
        }));
    });
  }
  i(su, "_installGlobalOnErrorHandler");
  function au(e) {
    Hr((t) => {
      let { stackParser: r, attachStacktrace: n } = Ra();
      if (T() !== e || qi()) return;
      let s = ou(t),
        a = $(s) ? lu(s) : ur(r, s, void 0, n, !0);
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
  i(au, "_installGlobalOnUnhandledRejectionHandler");
  function ou(e) {
    if ($(e)) return e;
    try {
      if ("reason" in e) return e.reason;
      if ("detail" in e && "reason" in e.detail) return e.detail.reason;
    } catch {}
    return e;
  }
  i(ou, "_getUnhandledRejectionError");
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
  i(lu, "_eventFromRejectionWithPrimitive");
  function pu(e, t, r, n) {
    let s = (e.exception = e.exception || {}),
      a = (s.values = s.values || []),
      c = (a[0] = a[0] || {}),
      o = (c.stacktrace = c.stacktrace || {}),
      l = (o.frames = o.frames || []);
    return (
      l.length === 0 &&
        l.push({
          colno: n,
          lineno: r,
          filename: cu(t) ?? we(),
          function: "?",
          in_app: !0,
        }),
      e
    );
  }
  i(pu, "_enhanceEventWithInitialFrame");
  function Oa(e) {
    he && f.log(`Global Handler attached: ${e}`);
  }
  i(Oa, "globalHandlerLog");
  function Ra() {
    return (
      T()?.getOptions() || {
        stackParser: i(() => [], "stackParser"),
        attachStacktrace: !1,
      }
    );
  }
  i(Ra, "getOptions");
  function cu(e) {
    if (!(!C(e) || e.length === 0))
      return e.startsWith("data:") ? `<${ki(e, !1)}>` : e;
  }
  i(cu, "getFilenameFromUrl");
  var ka = () => ({
    name: "HttpContext",
    preprocessEvent(e) {
      if (!E.navigator && !E.location && !E.document) return;
      let t = Hi(),
        r = { ...t.headers, ...e.request?.headers };
      e.request = { ...t, ...e.request, headers: r };
    },
    processSegmentSpan(e) {
      let t = e.attributes?.[Ve];
      if (!E.navigator && !E.location && !E.document) return;
      let r = Hi();
      dt(e, {
        [ds]: t !== "http.client" ? r.url : void 0,
        "http.request.header.user_agent": r.headers["User-Agent"],
        "http.request.header.referer": r.headers.Referer,
      });
    },
  });
  var uu = "cause",
    du = 5,
    mu = "LinkedErrors",
    gu = i((e = {}) => {
      let t = e.limit || du,
        r = e.key || uu;
      return {
        name: mu,
        preprocessEvent(n, s, a) {
          let c = a.getOptions();
          Pi(pr, c.stackParser, r, t, n, s);
        },
      };
    }, "_linkedErrorsIntegration"),
    Na = gu;
  var bu = /^HTML(\w*)Element$/;
  function wa(e) {
    if (typeof window < "u" && e === window) return "[Window]";
    if (typeof document < "u" && e === document) return "[Document]";
    if (tn(e)) {
      let t = fu(e);
      if (bu.test(t)) return `[HTMLElement: ${It(e)}]`;
    }
  }
  i(wa, "normalizeStringifyValue");
  function fu(e) {
    let t = Object.getPrototypeOf(e);
    return t?.constructor ? t.constructor.name : "null prototype";
  }
  i(fu, "getConstructorName");
  function Ca() {
    return yu()
      ? (he &&
          H(() => {
            console.error(
              "[Sentry] You cannot use Sentry.init() in a browser extension, see: https://docs.sentry.io/platforms/javascript/best-practices/browser-extensions/",
            );
          }),
        !0)
      : !1;
  }
  i(Ca, "checkAndWarnIfIsEmbeddedBrowserExtension");
  function yu() {
    if (typeof E.window > "u") return !1;
    let e = E;
    if (e.nw || !(e.chrome || e.browser)?.runtime?.id) return !1;
    let r = we();
    return !(
      E === E.top &&
      /^(?:chrome-extension|moz-extension|ms-browser-extension|safari-web-extension):\/\//.test(
        r,
      )
    );
  }
  i(yu, "_isEmbeddedBrowserExtension");
  function Ma(e) {
    return [ir(), tr(), Li(), Ea(), va(), xa(), Na(), ar(), ka(), Aa(), Ta()];
  }
  i(Ma, "getDefaultIntegrations");
  function nn(e = {}) {
    let t = !e.skipBrowserExtensionCheck && Ca(),
      r = e.defaultIntegrations == null ? Ma() : e.defaultIntegrations,
      n = {
        ...e,
        enabled: t ? !1 : e.enabled,
        stackParser: Fr(e.stackParser || _a),
        integrations: _i({
          integrations: e.integrations,
          defaultIntegrations: r,
        }),
        transport: e.transport || ya,
      };
    return (jr(wa), xi(dr, n));
  }
  i(nn, "init");
  var La = Pr(Pa(), 1);
  var Z = null;
  try {
    Z = La.default.parse(navigator.userAgent);
  } catch (e) {
    console.error(e.stack || e);
  }
  Z &&
    (typeof Z.browser.version == "string" &&
      (Z.browser.majorVersion = parseInt(Z.browser.version.split(".")[0])),
    Z.browser.name === "Firefox" &&
      Z.os.name === "iOS" &&
      (Z.browser.name = "Firefox iOS"));
  var hu = { Chrome: 50, Safari: 10, Firefox: 50, "Firefox iOS": 20 },
    Da = i(
      () => !!Z && Z.browser.majorVersion >= hu[Z.browser.name],
      "isTargetBrowser",
    );
  var vu = ["src/client/js/workers"];
  function Su(e) {
    if (typeof e != "string") throw new Error("fileUrl is not string");
    return e
      .replace(new RegExp(".*(" + vu.join("|") + ")/"), "")
      .replace(/\..+$/, "")
      .replace(/\/index$/, "")
      .replace(/\//g, ":");
  }
  i(Su, "fileUrlToTitle");
  function xt(e) {
    let t = Su(e);
    return function (...r) {
      ((r = r.map((n) =>
        Array.isArray(n)
          ? `[Array ${n.length}]`
          : n instanceof Map
            ? `[Map ${n.size}]`
            : typeof n == "object"
              ? "[Object]"
              : n,
      )),
        console.log(`%c${t}`, "color: gray", ...r));
    };
  }
  i(xt, "createDebug");
  var fr = xt("src/client/js/workers/lib/sentry.js"),
    an = "https://a1e18d1b37504a1a847ea4d4b7e154f4@sentry.io/192116",
    Ua = "";
  function Fa({ environment: e }) {
    if (!an) return fr("SENTRY_DSN is not exists");
    if (!Da()) return fr("not target browser");
    fr(
      "install",
      JSON.stringify({ SENTRY_DSN: an, RELEASE_VERSION: Ua, environment: e }),
    );
    try {
      nn({
        dsn: an,
        integrations: [
          sr({ levels: [] }),
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
        release: Ua,
        tracesSampleRate: 1,
        debug: !1,
      });
    } catch (t) {
      return (console.error(t), fr("SENTRY_DSN is invalid"));
    }
  }
  i(Fa, "setupSentry");
  var Yd = Pr(uo(), 1);
  var ln = class ln {
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
  i(ln, "ValidationResult");
  var Rt = ln;
  var pn = i((...e) => {
    for (let { validator: r, message: n } of e) {
      if (typeof r != "function")
        throw new Error("validator must be a function.");
      if (typeof n != "string") throw new Error("message must be a string.");
    }
    let t = i((r) => {
      let n = new Rt();
      for (let { validator: s, message: a, next: c } of e)
        if (!s(r) && (n.errors.push(a), !c)) break;
      return n;
    }, "validate");
    return (
      Object.defineProperty(t, "mongooseFormat", {
        get: i(
          () =>
            e.map(({ validator: r, message: n }) => ({
              validator: r,
              message: n,
            })),
          "get",
        ),
      }),
      (t.validators = e),
      t
    );
  }, "combineValidators");
  var mo = { value: 1, message: "Title is too short" },
    cn = { value: 240, message: "Title is too long" },
    go = pn(
      {
        validator: i((e) => typeof e == "string", "validator"),
        message: "Title must be a String",
      },
      { validator: i((e) => !!e, "validator"), message: "Title is missing" },
      {
        validator: i((e) => e.length >= mo.value, "validator"),
        message: mo.message,
      },
      {
        validator: i((e) => e.length <= cn.value, "validator"),
        message: cn.message,
      },
      {
        validator: i((e) => !/[\r\n\u2028\u2029]/.test(e), "validator"),
        message: "Title should be one line (line-feed code is included)",
      },
      {
        validator: i((e) => !/^[./]+$/.test(e), "validator"),
        message: "Title is an illegal string like a relative path.",
      },
      {
        validator: i((e) => !/[[\]]/.test(e), "validator"),
        message: "Title should not use bracket ([ ] is included)",
      },
      {
        validator: i((e) => !/\.icon\s*$/.test(e), "validator"),
        message: 'Title should not ends with ".icon"',
      },
      {
        validator: i((e) => !/https?:\/\//.test(e), "validator"),
        message:
          'Title should not use "http://" and "https://" (URL is included)',
      },
    ),
    QI = pn(...go.validators, {
      validator: i((e) => !/[A-Z]/.test(e), "validator"),
      message: "TitleLc must not includes capital letters",
    });
  Array.prototype.getIndexByTitleLc = function (e) {
    return this.map(j).indexOf(j(e));
  };
  function Wd(e) {
    return e.replace(/ /g, "_");
  }
  i(Wd, "spaceToUnderscore");
  function j(e) {
    return Wd(e).toLowerCase();
  }
  i(j, "toTitleLc");
  var Vd = {
      related: i(
        (e, t) =>
          t.relatedScore !== e.relatedScore
            ? t.relatedScore - e.relatedScore
            : t.updated - e.updated,
        "related",
      ),
      created: i((e, t) => t.created - e.created, "created"),
      updated: i((e, t) => t.updated - e.updated, "updated"),
      accessed: i((e, t) => t.accessed - e.accessed, "accessed"),
      linked: i((e, t) => t.linked - e.linked, "linked"),
      pageRank: i((e, t) => t.pageRank - e.pageRank, "pageRank"),
      title: i((e, t) => (t.titleLc > e.titleLc ? -1 : 1), "title"),
    },
    un = i(({ sort: e, pages: t }) => t.sort(Vd[e]), "sortPages");
  function jd(e) {
    let t = new Map(),
      r = new Map();
    for (let a of e || []) {
      if (!Array.isArray(a) || a.length === 0) continue;
      let c = a[0],
        o = j(c);
      r.set(o, c);
      for (let l of a) t.set(j(l), o);
    }
    return {
      canonicalLcOf: i((a) => t.get(a) ?? a, "canonicalLcOf"),
      canonicalTitleOf: i((a) => {
        let c = t.get(j(a));
        return c ? r.get(c) : a;
      }, "canonicalTitleOf"),
    };
  }
  i(jd, "buildSynonymMaps");
  var zd = i(
    ({
      currentPageTitle: e,
      linksLc: t,
      relatedPages: r,
      canonicalLcOf: n = i((s) => s, "canonicalLcOf"),
    }) => {
      let s = ["linkTo", "linkFrom", ...t],
        a = [...r.links1hop, ...r.links2hop],
        c = new Set(t),
        o = n(j(e));
      for (let l of a) {
        ((l.relations = []),
          c.has(n(l.titleLc)) && l.relations.push("linkTo"),
          l.linksLc.some((p) => n(p) === o) && l.relations.push("linkFrom"));
        for (let p of l.linksLc) {
          let g = n(p);
          c.has(g) && !l.relations.includes(g) && l.relations.push(g);
        }
      }
      for (let l of a) {
        if (!Array.isArray(l.relations)) continue;
        let p = s.length - s.indexOf(l.relations[0]);
        l.relatedScore = p * 100 + l.relations.length;
      }
    },
    "calcPageRelatedScore",
  );
  function bo({ currentPageTitle: e, links: t, relatedPages: r, sort: n }) {
    let { canonicalLcOf: s, canonicalTitleOf: a } = jd(r.synonyms),
      c = j(e),
      o = s(c);
    for (let v of r.links1hop || [])
      v.linkFromLc = v.linksLc.includes(c)
        ? void 0
        : v.linksLc.find((A) => s(A) === o);
    let l = [...new Set(t.map((v) => s(j(v))))];
    zd({ currentPageTitle: e, linksLc: l, relatedPages: r, canonicalLcOf: s });
    let p = un({ sort: n, pages: r.links1hop || [] }),
      g = new Set(r.hiddenHeadwordsLc || []),
      u = un({ sort: n, pages: r.projectLinks1hop || [] }),
      m = [],
      d = new Map(),
      b = new Map(),
      h = new Map();
    for (let v of t) {
      let A = j(v);
      if (g.has(A)) continue;
      let Y = s(A),
        M = d.get(Y);
      (M === void 0 &&
        ((M = a(v)), d.set(Y, M), m.push(M), b.set(M, Y), h.set(M, new Set())),
        h.get(M).add(A));
    }
    let S = Object.create(null);
    for (let v of m) S[v] = [];
    for (let v of r.links1hop) {
      let A = new Set(v.linksLc);
      for (let Y of m) {
        let M = h.get(Y),
          pe = !1;
        for (let So of M)
          if (A.has(So)) {
            pe = !0;
            break;
          }
        pe && S[Y].push(Object.assign({ show: !1 }, v));
      }
    }
    for (let v of r.links2hop) {
      let A = new Map();
      for (let M of v.linksLc) {
        let pe = s(M);
        A.has(pe) || A.set(pe, M);
      }
      let Y = !0;
      for (let M of m) {
        let pe = A.get(b.get(M));
        pe !== void 0 &&
          (S[M].push(Object.assign({ show: Y, linkFromLc: pe }, v)), (Y = !1));
      }
    }
    for (let [v, A] of Object.entries(S))
      Array.isArray(A) && A.length > 0
        ? (S[v] = un({ sort: n, pages: S[v] || [] }))
        : delete S[v];
    let O = Object.entries(S),
      Se = O.filter(([, v]) => v.length <= 100),
      Nt = O.filter(([, v]) => v.length > 100).sort(
        ([, v], [, A]) => v.length - A.length,
      ),
      Je = Object.create(null);
    for (let [v, A] of [...Se, ...Nt]) Je[v] = A;
    let wt = new Set(t.map(j).filter((v) => !g.has(v))),
      Ze = new Set(),
      Ct = i((v) => {
        for (let A of v) for (let Y of A.linksLc) wt.has(Y) && Ze.add(Y);
      }, "collectBacklinkHeadwords");
    (Ct(r.links1hop), Ct(r.links2hop));
    let et = [
        ...r.links1hop.map((v) => v.titleLc),
        ...r.links2hop.map((v) => v.titleLc),
        ...Ze,
      ].filter((v) => v),
      z = new Set(et),
      De = t.filter((v) => {
        let A = j(v);
        return A !== c && !z.has(A);
      });
    return {
      links1hop: p,
      links2hop: Je,
      existPagesLc: et,
      emptyLinks: De,
      projectLinks1hop: u,
    };
  }
  i(bo, "compileRelatedPages");
  var Cr = Pr(yo(), 1);
  var dn = 1e3;
  async function _o(e) {
    let t = [],
      r = i((n, s) => {
        let a = Object.create(null);
        ((a[n] = s), t.push(a));
      }, "addChunk");
    for (let n in e) {
      let s = e[n];
      if (Array.isArray(s))
        if (s.length === 0) r(n, s);
        else
          for (let a = 0; a < s.length; a += dn)
            (r(n, s.slice(a, a + dn)),
              a % 1e3 === 0 && (await (0, Cr.default)(1)));
      else if (s instanceof Map)
        if (s.size === 0) r(n, s);
        else {
          let a = new Map(),
            c = 0;
          for (let o of s.entries())
            (a.set(...o),
              (c += 1),
              c % dn === 0 &&
                (r(n, a), (a = new Map()), await (0, Cr.default)(1)));
          a.size > 0 && r(n, a);
        }
      else r(n, s);
    }
    return t;
  }
  i(_o, "splitMessageToChunks");
  async function ho(e) {
    if (!Array.isArray(e)) return e;
    let t = Object.create(null);
    for (let r of e)
      for (let n in r) {
        let s = r[n];
        if ((await (0, Cr.default)(1), Array.isArray(s)))
          t[n] ? t[n].push(...s) : (t[n] = s);
        else if (s instanceof Map)
          if (!t[n]) t[n] = s;
          else for (let a of s.entries()) t[n].set(...a);
        else t[n] = s;
      }
    return t;
  }
  i(ho, "mergeChunksToMessage");
  var mn = xt("src/client/js/workers/dedicated-worker/index.js");
  Fa({ environment: "dedicated-worker" });
  var kt = Object.create(null);
  onmessage = i(async (e) => {
    mn("onmessage", e);
    let { title: t, body: r, id: n, chunk: s } = e.data;
    if (!n) return mn("data.id is missing.");
    s
      ? (kt[n] || (kt[n] = []),
        kt[n].push(r),
        s === "end" &&
          (await vo({ title: t, body: await ho(kt[n]), id: n }), delete kt[n]))
      : vo(e.data);
  }, "onmessage");
  async function vo(e) {
    let { title: t, body: r, id: n } = e,
      s = await $d({ title: t, body: r }),
      a = await _o(s);
    for (let c = 0; c < a.length; c++)
      postMessage({
        title: t,
        result: a[c],
        id: n,
        chunk: c === a.length - 1 ? "end" : c === 0 ? "start" : "chunk",
      });
  }
  i(vo, "processData");
  function $d({ title: e, body: t }) {
    if ((mn("exec", e, t), e === "related-page:compile")) return bo(t);
  }
  i($d, "exec");
})();
/*! Bundled license information:

@sentry/core/build/esm/utils/env.js:
  (*! __SENTRY_SDK_SOURCE__ *)
*/

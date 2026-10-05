const RA = ["indent", "quote", "strong", "deco"];
function U(t, e) {
  if (!(t instanceof RegExp)) {
    throw new Error("pattern is not a RegExp");
  }
  if (typeof e !== "function") {
    throw new Error("transformToNode is not a function");
  }
  let r = new RegExp(`(${jp.default(t)})`, t.flags);
  let n = a_2(
    (s) =>
      xu(s, (o) => {
        if (!t.test(o)) {
          return o;
        }
        let f = o
          .split(r)
          .filter((c) => c)
          .map((c) => {
            let u = c.match(t);
            if (u) {
              return e(u);
            }
            return c;
          });
        if (f.length === 1) {
          return f[0];
        }
        return f;
      }),
    "nodeParser",
  );
  n.pattern = t;
  return n;
}
a_2(U, "createNodeParser");
function xu(t, e) {
  return (
    t &&
    (typeof t === "string"
      ? e(t)
      : t instanceof Array
        ? b_1(t.map((r) => xu(r, e)))
        : (RA.includes(t.type) && (t.children = xu(t.children, e)), t))
  );
}
a_2(xu, "parseNodeTree");
function Pe(...t) {
  return (e) => {
    for (let r of t) {
      e = r(e);
    }
    return e;
  };
}
a_2(Pe, "combineNodeParsers");
const Np = U(/\[(\s+)\]/, ([t, e]) => ({
  type: "blank",
  unit: {
    content: e,
    whole: t,
  },
  children: e,
}));
function Ne() {
  return (
    typeof window !== "undefined" &&
    typeof document !== "undefined" &&
    typeof document.createElement === "function"
  );
}
a_2(Ne, "hasDom");
const MA = Ne()
  ? `${location.protocol}//${location.host}`
  : process.env.APP_URL;
export const ha = new RegExp(
  `^${MA}/files/([a-z0-9]{24})(?:|\\.[a-zA-Z0-9]+)(?:|\\?[^\\s]*)$`,
);
const be = a_2((t) => t.match(ha)[1], "parseFileId");
const FA = /\[(https?:\/\/[^\]\s]+\.(?:mp4|webm|mov))\]/i;
const Bp = U(FA, ([t, e]) => ({
  type: "video",
  unit: {
    whole: t,
    content: e,
  },
  children: e,
  fileId: ha.test(e) ? be(e) : undefined,
}));
const DA =
  /\[((https?:\/\/[^\]\s]+)\s+(https?:\/\/[^\]\s]*\.(?:mp4|webm|mov)(?:\?[^\]\s]+)?))\]/i;
const IA = U(DA, ([t, e, r, n]) => ({
  type: "videoLink",
  unit: {
    whole: t,
    content: e,
    link: r,
    video: n,
  },
  fileId: ha.test(n) ? be(n) : undefined,
  fileIds: [ha.test(n) && be(n), ha.test(r) && be(r)].filter((s) => s),
  children: e,
}));
const jA =
  /\[((https?:\/\/[^\]\s]*\.(?:mp4|webm|mov)(?:\?[^\]\s]+)?)\s+(https?:\/\/[^\]\s]+))\]/i;
const NA = U(jA, ([t, e, r, n]) => ({
  type: "videoLink",
  unit: {
    whole: t,
    content: e,
    video: r,
    link: n,
  },
  fileId: ha.test(r) ? be(r) : undefined,
  fileIds: [ha.test(r) && be(r), ha.test(n) && be(n)].filter((s) => s),
  children: e,
}));
const Up = Pe(IA, NA);
const BA = U(
  /\[(https?:\/\/vimeo\.com\/([0-9]+)(?:\?[^\s\]]+|))\]/i,
  ([t, e, r]) => ({
    type: "vimeo",
    unit: {
      whole: t,
      content: e,
      videoId: r,
      params: {},
    },
    children: e,
  }),
);
const UA = U(
  /\[(https?:\/\/vimeo\.com\/([0-9]+)\/([a-z0-9]+)(?:\?[^\s\]]+|))\]/i,
  ([t, e, r, h]) => ({
    type: "vimeo",
    unit: {
      whole: t,
      content: e,
      videoId: r,
      params: {
        h,
      },
    },
    children: e,
  }),
);
const qp = Pe(BA, UA);
const qA = U(
  /\[(https?:\/\/open\.spotify\.com\/(?:[^/]+\/|)(track|artist|playlist|album|episode|show)\/([a-zA-Z\d_-]+)(?:\?[^\s]{0,100}|))\]/i,
  ([t, e, r, n]) => ({
    type: "spotify",
    unit: {
      whole: t,
      content: e,
      videoId: n,
      params: {
        type: r,
      },
    },
    children: e,
  }),
);
const $A = U(
  /\[(https?:\/\/anchor\.fm\/([a-zA-Z\d_-]+)\/episodes\/([a-zA-Z\d_-]+(?:\/[a-zA-Z\d_-]+)?)(?:\?[^\s]{0,100}|))\]/i,
  ([t, e, r, n]) => ({
    type: "anchor-fm",
    unit: {
      whole: t,
      content: e,
      videoId: n,
      username: r,
    },
    children: e,
  }),
);
const zA = U(
  /\[(https?:\/\/podcasters\.spotify\.com\/pod\/show\/([a-zA-Z\d_-]+)\/episodes\/([a-zA-Z\d_-]+(?:\/[a-zA-Z\d_-]+)?)(?:\?[^\s]{0,100}|))\]/i,
  ([t, e, r, n]) => ({
    type: "anchor-fm",
    unit: {
      whole: t,
      content: e,
      videoId: n,
      username: r,
    },
    children: e,
  }),
);
const $p = Pe(qA, $A, zA);
const HA = /\[(https?:\/\/[^\]\s]*\.(?:wav|mp3|weba|ogg|aac))\]/i;
const zp = U(HA, ([t, e]) => ({
  type: "audio",
  unit: {
    whole: t,
    content: e,
  },
  fileId: ha.test(e) ? be(e) : undefined,
  children: e,
}));
const WA = /\[((https?:\/\/[^\s\]]+\.(?:wav|mp3|weba|ogg|aac))\s+([^\]]*))\]/i;
const YA = U(WA, ([t, e, r, n]) => ({
  type: "audioLink",
  unit: {
    whole: t,
    content: e,
    link: r,
    title: n,
  },
  fileId: ha.test(r) ? be(r) : undefined,
  children: e,
}));
const VA = /\[(([^[\]]+)\s+(https?:\/\/[^\s\]]+\.(?:wav|mp3|weba|ogg|aac)))\]/i;
const GA = U(VA, ([t, e, r, n]) => ({
  type: "audioLink",
  unit: {
    whole: t,
    content: e,
    title: r,
    link: n,
  },
  fileId: ha.test(n) ? be(n) : undefined,
  children: e,
}));
const Hp = Pe(YA, GA);
const KA =
  /\[(https?:\/\/[^\]\s]*\.(?:png|jpe?g|gif|svg|webp)(?:\?[^\]\s]+)?)\]/i;
const Wp = U(KA, ([t, e]) => ({
  type: "image",
  unit: {
    whole: t,
    content: e,
  },
  fileId: ha.test(e) ? be(e) : undefined,
  children: e,
}));
const JA =
  /\[((https?:\/\/[^\]\s]+)\s+(https?:\/\/[^\]\s]*\.(?:png|jpe?g|gif|svg|webp)(?:\?[^\]\s]+)?))\]/i;
const QA = U(JA, ([t, e, r, n]) => ({
  type: "imageLink",
  unit: {
    whole: t,
    content: e,
    link: r,
    image: n,
  },
  fileId: ha.test(n) ? be(n) : undefined,
  fileIds: [ha.test(n) && be(n), ha.test(r) && be(r)].filter((s) => s),
  children: e,
}));
const ZA =
  /\[((https?:\/\/[^\]\s]*\.(?:png|jpe?g|gif|svg|webp)(?:\?[^\]\s]+)?)\s+(https?:\/\/[^\]\s]+))\]/i;
const XA = U(ZA, ([t, e, r, n]) => ({
  type: "imageLink",
  unit: {
    whole: t,
    content: e,
    image: r,
    link: n,
  },
  fileId: ha.test(r) ? be(r) : undefined,
  fileIds: [ha.test(r) && be(r), ha.test(n) && be(n)].filter((s) => s),
  children: e,
}));
const Yp = Pe(QA, XA);
const eO = U(
  /\[(https?:\/\/(?:[a-z][a-z0-9-]*[a-z0-9]\.|)gyazo\.com\/[0-9a-f]{32}(?:\/raw)?)]/,
  ([t, e]) => ({
    type: "gyazo",
    unit: {
      whole: t,
      content: e,
    },
    children: e,
  }),
);
const tO = U(
  /\[(https?:\/\/(?:[a-z][a-z\d-]*[a-z\d]\.|i\.|)gyazo\.com\/[a-z\d]{32}\.[^.\s]+)\]/,
  ([t, e]) => ({
    type: "gyazo",
    unit: {
      whole: t,
      content: e,
    },
    children: e,
  }),
);
const Vp = Pe(eO, tO);
const rO =
  /\[((https?:\/\/[^\]\s]+)\s+(https?:\/\/(?:[a-z][a-z0-9-]*[a-z0-9]\.|)gyazo\.com\/[0-9a-f]{32}(?:\/raw)?))\]/;
const nO = U(rO, ([t, e, r, n]) => ({
  type: "gyazoLink",
  unit: {
    whole: t,
    content: e,
    link: r,
    gyazo: n,
  },
  children: e,
}));
const iO = U(
  /\[((https?:\/\/[^\]\s]+)\s+(https?:\/\/(?:[a-z][a-z\d-]*[a-z\d]\.|i\.|)gyazo\.com\/[a-z\d]{32}\.[^.\s]+))\]/,
  ([t, e, r, n]) => ({
    type: "gyazoLink",
    unit: {
      whole: t,
      content: e,
      link: r,
      gyazo: n,
    },
    children: e,
  }),
);
const sO =
  /\[((https?:\/\/(?:[a-z][a-z0-9-]*[a-z0-9]\.|)gyazo\.com\/[0-9a-f]{32}(?:\/raw)?)\s+(https?:\/\/[^\]\s]+))\]/;
const oO = U(sO, ([t, e, r, n]) => ({
  type: "gyazoLink",
  unit: {
    whole: t,
    content: e,
    link: n,
    gyazo: r,
  },
  children: e,
}));
const aO = U(
  /\[((https?:\/\/(?:[a-z][a-z\d-]*[a-z\d]\.|i\.|)gyazo\.com\/[a-z\d]{32}\.[^.\s]+)\s+(https?:\/\/[^\]\s]+))\]/,
  ([t, e, r, n]) => ({
    type: "gyazoLink",
    unit: {
      whole: t,
      content: e,
      link: n,
      gyazo: r,
    },
    children: e,
  }),
);
const Gp = Pe(nO, iO, oO, aO);
const cO = U(/\[([^[\]]+)\]/, ([, t]) => ({
  type: "link",
  unit: {
    page: t,
    get content() {
      return this.page;
    },
    get whole() {
      return `[${this.page}]`;
    },
  },
  children: t,
}));
const uO = U(/\[(([^[\]]+)#([a-f\d]{24,32}))\]/, ([, t, e, r]) => ({
  type: "link",
  unit: {
    page: e,
    line: r,
    get content() {
      return `${this.page}#${this.line}`;
    },
    get whole() {
      return `[${this.content}]`;
    },
  },
  children: t,
}));
const lO = U(/\[(\/([a-z0-9-]+)\/([^[\]]+))\]/i, ([, t, e, r]) => ({
  type: "link",
  unit: {
    project: e,
    page: r,
    get content() {
      if (this.project) {
        return `/${this.project}/${this.page}`;
      }
      return this.page;
    },
    get whole() {
      return `[${this.content}]`;
    },
  },
  children: t,
}));
const fO = U(
  /\[(\/([a-z0-9-]+)\/([^[\]]+)#([a-f\d]{24,32}))\]/i,
  ([, t, e, r, n]) => ({
    type: "link",
    unit: {
      project: e,
      page: r,
      line: n,
      get content() {
        if (this.project) {
          return `/${this.project}/${this.page}#${this.line}`;
        }
        return `${this.page}#${this.line}`;
      },
      get whole() {
        return `[${this.content}]`;
      },
    },
    children: t,
  }),
);
const hO = U(/\[(\/([a-z0-9-]+)\/?)\]/i, ([t, e, r]) => ({
  type: "link",
  unit: {
    whole: t,
    content: e,
    project: r,
  },
  children: e,
}));
const Kp = Pe(hO, fO, lO, uO, cO);
const dO = /(^|\s)#([^\s]+)/;
const Jp = U(dO, ([, t, e]) => {
  if (/^#+$/.test(e)) {
    if (t) {
      return [t, `#${e}`];
    }
    return `#${e}`;
  }
  let r = {
    type: "hashTag",
    unit: {
      page: e,
      tag: "#",
      get content() {
        return this.page;
      },
      get whole() {
        return `#${this.page}`;
      },
    },
    children: `#${e}`,
  };
  if (t) {
    return [t, r];
  }
  return r;
});
const pO = U(/\[(([^[\]]+)\.icon)\]/, ([, t, e]) => ({
  type: "icon",
  unit: {
    page: e,
    size: 1,
    get content() {
      return `${this.page}.icon`;
    },
    get whole() {
      return `[${this.content}]`;
    },
  },
  children: t,
}));
const mO = U(/\[(([^[\]]+)\.icon([*x])([1-9]\d*))\]/, ([, t, e, r, n]) => {
  n = n - 0;
  return {
    type: "icon",
    unit: {
      page: e,
      size: n,
      get content() {
        return `${this.page}.icon${r}${n}`;
      },
      get whole() {
        return `[${this.content}]`;
      },
    },
    children: t,
  };
});
const gO = U(/\[(\/([a-zA-Z0-9-]+)\/([^[\]]+)\.icon)\]/, ([, t, e, r]) => ({
  type: "icon",
  unit: {
    project: e,
    page: r,
    size: 1,
    get content() {
      if (this.project) {
        return `/${this.project}/${this.page}.icon`;
      }
      return `${this.page}.icon`;
    },
    get whole() {
      return `[${this.content}]`;
    },
  },
  children: t,
}));
const yO = U(
  /\[(\/([a-zA-Z0-9-]+)\/([^[\]]+)\.icon([*x])([1-9]\d*))\]/,
  ([, t, e, r, n, s]) => {
    s = s - 0;
    return {
      type: "icon",
      unit: {
        project: e,
        page: r,
        size: s,
        get content() {
          if (this.project) {
            return `/${this.project}/${this.page}.icon${n}${s}`;
          }
          return `${this.page}.icon${n}${s}`;
        },
        get whole() {
          return `[${this.content}]`;
        },
      },
      children: t,
    };
  },
);
export const ia = Pe(gO, yO, pO, mO);
const bO = U(/\[\[(([^[\]]+)\.icon)\]\]/, ([, t, e]) => ({
  type: "strong-icon",
  unit: {
    page: e,
    size: 1,
    get content() {
      return `${this.page}.icon`;
    },
    get whole() {
      return `[[${this.content}]]`;
    },
  },
  children: t,
}));
const wO = U(/\[\[(([^[\]]+)\.icon([*x])([1-9]\d*))\]\]/, ([, t, e, r, n]) => {
  n = n - 0;
  return {
    type: "strong-icon",
    unit: {
      page: e,
      size: n,
      get content() {
        return `${this.page}.icon${r}${this.size}`;
      },
      get whole() {
        return `[[${this.content}]]`;
      },
    },
    children: t,
  };
});
const vO = U(/\[\[(\/([a-zA-Z0-9-]+)\/([^[\]]+)\.icon)\]\]/, ([, t, e, r]) => ({
  type: "strong-icon",
  unit: {
    project: e,
    page: r,
    size: 1,
    get content() {
      return `/${this.project}/${this.page}.icon`;
    },
    get whole() {
      return `[[${this.content}]]`;
    },
  },
  children: t,
}));
const SO = U(
  /\[\[(\/([a-zA-Z0-9-]+)\/([^[\]]+)\.icon([*x])([1-9]\d*))\]\]/,
  ([, t, e, r, n, s]) => {
    s = s - 0;
    return {
      type: "strong-icon",
      unit: {
        project: e,
        page: r,
        size: s,
        get content() {
          return `/${this.project}/${this.page}.icon${n}${this.size}`;
        },
        get whole() {
          return `[[${this.content}]]`;
        },
      },
      children: t,
    };
  },
);
const Zp = Pe(vO, SO, bO, wO);
const xO = U(
  /\[\[(https?:\/\/[^\]\s]*\.(?:png|jpe?g|gif|svg|webp)(?:\?[^\]\s]+)?)\]\]/i,
  ([t, e]) => ({
    type: "strongImage",
    unit: {
      whole: t,
      content: e,
    },
    children: e,
    fileId: ha.test(e) ? be(e) : undefined,
  }),
);
const _O = U(
  /\[\[(https?:\/\/(?:[a-z][a-z0-9-]*[a-z0-9]\.|)gyazo\.com\/[0-9a-f]{32})\]\]/,
  ([t, e]) => ({
    type: "strongGyazo",
    unit: {
      whole: t,
      content: e,
    },
    children: e,
  }),
);
const CO = U(
  /\[\[(https?:\/\/(?:[a-z][a-z\d-]*[a-z\d]\.|i\.|)gyazo\.com\/[a-z\d]{32}\.[^.\s]+)\]\]/,
  ([t, e]) => ({
    type: "strongGyazo",
    unit: {
      whole: t,
      content: e,
    },
    children: e,
  }),
);
const PO = U(
  /\[\[((https?:\/\/[^\]\s]+)\s+(https?:\/\/[^\]\s]*\.(?:png|jpe?g|gif|svg|webp)(?:\?[^\]\s]+)?))\]\]/,
  ([t, e, r, n]) => ({
    type: "strongImageLink",
    unit: {
      whole: t,
      content: e,
      link: r,
      image: n,
    },
    fileId: ha.test(n) ? be(n) : undefined,
    children: e,
  }),
);
const kO = U(
  /\[\[((https?:\/\/[^\]\s]*\.(?:png|jpe?g|gif|svg|webp)(?:\?[^\]\s]+)?)\s+(https?:\/\/[^\]\s]+))\]\]/,
  ([t, e, r, n]) => ({
    type: "strongImageLink",
    unit: {
      whole: t,
      content: e,
      link: n,
      image: r,
    },
    fileId: ha.test(r) ? be(r) : undefined,
    children: e,
  }),
);
const EO = U(
  /\[\[((https?:\/\/[^\]\s]+)\s+(https?:\/\/(?:[a-z][a-z0-9-]*[a-z0-9]\.|)gyazo\.com\/[0-9a-f]{32}))\]\]/,
  ([t, e, r, n]) => ({
    type: "strongGyazoLink",
    unit: {
      whole: t,
      content: e,
      link: r,
      gyazo: n,
    },
    children: e,
  }),
);
const AO = U(
  /\[\[((https?:\/\/(?:[a-z][a-z0-9-]*[a-z0-9]\.|)gyazo\.com\/[0-9a-f]{32})\s+(https?:\/\/[^\]\s]+))\]\]/,
  ([t, e, r, n]) => ({
    type: "strongGyazoLink",
    unit: {
      whole: t,
      content: e,
      gyazo: r,
      link: n,
    },
    children: e,
  }),
);
const OO = U(
  /\[\[((https?:\/\/[^\]\s]+)\s+(https?:\/\/(?:[a-z][a-z\d-]*[a-z\d]\.|i\.|)gyazo\.com\/[a-z\d]{32}\.[^.\s]+))\]\]/,
  ([t, e, r, n]) => ({
    type: "strongGyazoLink",
    unit: {
      whole: t,
      content: e,
      link: r,
      gyazo: n,
    },
    children: e,
  }),
);
const LO = U(
  /\[\[((https?:\/\/(?:[a-z][a-z\d-]*[a-z\d]\.|i\.|)gyazo\.com\/[a-z\d]{32}\.[^.\s]+)\s+(https?:\/\/[^\]\s]+))\]\]/,
  ([t, e, r, n]) => ({
    type: "strongGyazoLink",
    unit: {
      whole: t,
      content: e,
      link: n,
      gyazo: r,
    },
    children: e,
  }),
);
const Xp = Pe(_O, CO, xO, EO, AO, OO, LO, PO, kO);
const TO = /\[\[(https?:\/\/[^\]\s]+\.(?:mp4|webm|mov))\]\]/i;
const em = U(TO, ([t, e]) => ({
  type: "strongVideo",
  unit: {
    whole: t,
    content: e,
  },
  children: e,
  fileId: ha.test(e) ? be(e) : undefined,
}));
const RO = U(
  /\[([!"#%&'()*+,\-./{|}<>_~]+) ((?:\[[^[\]]+\]|[^\]])+)\]/,
  ([t, e, r]) => ({
    type: "deco",
    unit: {
      whole: t,
      content: r,
      deco: e,
      strong: e.includes("*") ? Math.min(e.match(/\*/g).length, 10) : 0,
      italic: e.includes("/"),
      strike: e.includes("-"),
      underline: e.includes("_"),
    },
    children: r,
  }),
);
const MO = U(/\[(\$ (.+? ))\]/, ([t, e, r]) => ({
  type: "deco-formula",
  unit: {
    whole: t,
    content: e,
    formula: r,
  },
  children: e,
}));
const FO = U(/\[(\$ ([^\]]+))\]/, ([t, e, r]) => ({
  type: "deco-formula",
  unit: {
    whole: t,
    content: e,
    formula: r,
  },
  children: e,
}));
const tm = Pe(RO, MO, FO);
const rm = U(/\[\[((?:[^[]|\[[^[]).*?\]*)\]\]/, ([, t]) => ({
  type: "strong",
  unit: {
    content: t,
    whole: `[[${t}]]`,
  },
  children: t,
}));
const nm = U(/(https?:\/\/[^\s]+)/, ([, t]) => ({
  type: "url",
  unit: {
    content: t,
    whole: t,
  },
  fileId: ha.test(t) ? be(t) : undefined,
  children: t,
}));
const DO = U(/\[(https?:\/\/[^\s\]]+)\]/, ([, t]) => ({
  type: "urlLink",
  unit: {
    link: t,
    content: t,
    whole: `[${t}]`,
  },
  fileId: ha.test(t) ? be(t) : undefined,
  children: t,
}));
const IO = U(
  /\[((https?:\/\/[^\s\]]+)(\s+)([^\]]*[^\s]))\]/,
  ([, t, e, r, n]) => ({
    type: "urlLink",
    unit: {
      link: e,
      space: r,
      title: n,
      content: t,
      whole: `[${t}]`,
    },
    fileId: ha.test(e) ? be(e) : undefined,
    fileIds: [ha.test(e) && be(e), ha.test(n) && be(n)].filter((s) => s),
    children: t,
  }),
);
const jO = U(
  /\[(([^[\]]*[^\s])(\s+)(https?:\/\/[^\s\]]+))\]/,
  ([, t, e, r, n]) => ({
    type: "urlLink",
    unit: {
      link: n,
      space: r,
      title: e,
      content: t,
      whole: `[${t}]`,
    },
    fileId: ha.test(n) ? be(n) : undefined,
    fileIds: [ha.test(e) && be(e), ha.test(n) && be(n)].filter((s) => s),
    children: t,
  }),
);
const im = Pe(IO, jO, DO);
function Qi(t) {
  let e = {};
  if (!t) {
    return e;
  }
  for (let r of t.split("&")) {
    if (!r) {
      continue;
    }
    let [n, s] = r.split("=");
    if (n !== "v") {
      e[n] = s;
    }
  }
  if (e.t) {
    e.t = NO(e.t);
  }
  return e;
}
a_2(Qi, "parseParams");
function NO(t) {
  if (/^\d+$/.test(t)) {
    return parseInt(t);
  }
  let e = [
    [/(\d+)s/, (n) => n],
    [/(\d+)m/, (n) => 60 * n],
    [/(\d+)h/, (n) => 3600 * n],
  ];
  let r = 0;
  for (let [n, s] of e) {
    if (n.test(t)) {
      r += s(parseInt(t.match(n)[1]));
    }
  }
  return r || t;
}
a_2(NO, "normalizeTime");
const BO = U(
  /\[(https?:\/\/(?:www\.|music\.|)youtube\.com\/watch\?((?:[^\s\]]+&|)v=([a-zA-Z\d_-]+)(?:&[^\s\]]+|)))\]/,
  ([t, e, r, n]) => ({
    type: "youtube",
    unit: {
      whole: t,
      content: e,
      videoId: n,
      params: Qi(r),
    },
    children: e,
  }),
);
const UO = U(
  /\[(https?:\/\/youtu\.be\/([a-zA-Z\d_-]+)(?:\?([^\s\]]{0,100})|))\]/,
  ([t, e, r, n]) => ({
    type: "youtube",
    unit: {
      whole: t,
      content: e,
      videoId: r,
      params: Qi(n),
    },
    children: e,
  }),
);
const qO = U(
  /\[(https?:\/\/(?:www\.|)youtube\.com\/shorts\/([a-zA-Z\d_-]+)(?:\?([^\s\]]+)|))\]/,
  ([t, e, r, n]) => ({
    type: "youtube",
    unit: {
      whole: t,
      content: e,
      videoId: r,
      params: Qi(n),
      type: "short",
    },
    children: e,
  }),
);
const $O = U(
  /\[(https?:\/\/(?:www\.|music\.|)youtube\.com\/playlist\?((?:[^\s\]]+&|)list=([a-zA-Z\d_-]+)(?:&[^\s\]]+|)))\]/,
  ([t, e, r, listId]) => ({
    type: "youtube",
    unit: {
      whole: t,
      content: e,
      listId,
      params: Qi(r),
    },
    children: e,
  }),
);
const zO = U(
  /\[(https?:\/\/(?:www\.|)youtube\.com\/live\/([a-zA-Z\d_-]+)(?:\?([^\s\]]+)|))\]/,
  ([t, e, r, n]) => ({
    type: "youtube",
    unit: {
      whole: t,
      content: e,
      videoId: r,
      params: Qi(n),
      type: "live",
    },
    children: e,
  }),
);
const sm = Pe(BO, UO, qO, $O, zO);
const _u = a_2(
  (t) => parseFloat(t.replace(/^N/, "").replace(/^S/, "-")),
  "normalizeLatitude",
);
const Cu = a_2(
  (t) => parseFloat(t.replace(/^E/, "").replace(/^W/, "-")),
  "normalizeLongitude",
);
const HO = U(
  /\[(([NS]\d+(?:\.\d+)?),([EW]\d+(?:\.\d+)?)(?:|,Z(\d+)))\]/,
  ([t, e, r, n, s]) => ({
    type: "location",
    unit: {
      whole: t,
      content: e,
      latitude: _u(r),
      longitude: Cu(n),
      zoom: s && parseInt(s),
    },
    children: e,
  }),
);
const WO = U(
  /\[(([NS]\d+(?:\.\d+)?),([EW]\d+(?:\.\d+)?)(?:|,Z(\d+)) ([^[\]]+))\]/,
  ([t, e, r, n, s, o]) => ({
    type: "location",
    unit: {
      whole: t,
      content: e,
      latitude: _u(r),
      longitude: Cu(n),
      zoom: s && parseInt(s),
      title: o,
    },
    children: e,
  }),
);
const YO = U(
  /\[(([^[\]]+) ([NS]\d+(?:\.\d+)?),([EW]\d+(?:\.\d+)?)(?:|,Z(\d+)))\]/,
  ([t, e, r, n, s, o]) => ({
    type: "location",
    unit: {
      whole: t,
      content: e,
      latitude: _u(n),
      longitude: Cu(s),
      zoom: o && parseInt(o),
      title: r,
    },
    children: e,
  }),
);
const om = Pe(HO, WO, YO);
const Eo = U(/^([\t\s]+)(.*)$/, ([t, e, r]) => ({
  type: "indent",
  unit: {
    whole: t,
    tag: e,
    content: r,
  },
  children: r,
}));
const am = U(/^(> ?)(.*?)$/, ([t, e, r]) => {
  let n = Eo(r);
  return {
    type: "quote",
    unit: {
      whole: t,
      tag: e,
      content: r,
    },
    children: n,
  };
});
const cm = U(/`((?:\\`|[^`])*)`/, ([t, e]) => ({
  type: "code",
  unit: {
    whole: t,
    content: e,
  },
  children: e,
}));

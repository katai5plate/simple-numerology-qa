import {
  TUPLE,
  createPage,
  tag,
  setCallback,
  useMuteryClasses,
} from "./frontend.js";
import {
  getBirthdayNumber,
  getChallengeNumber,
  getDestinyNumber,
  hiraganaToSpel,
  getIntensityNumbers,
  getLifeLessonNumbers,
  getLifePathNumber,
  getPersonalYearNumbers,
  getPersonalityNumber,
  getSoulNumber,
  numberToOverview,
  getMaturityNumber,
  getYakuYear,
  numberToTaiheki,
} from "./utils.js";

const { component: $, state: _ } = createPage(
  {
    form: {
      /** @type {HTMLInputElement} */
      spel: true,
      /** @type {HTMLInputElement} */
      birth: true,
      /** @type {HTMLTextAreaElement} */
      share: true,
    },
    valid: {
      /** @type {HTMLSpanElement} */
      spel: true,
    },
    btn: {
      /** @type {HTMLButtonElement} */
      copy: true,
      /** @type {HTMLButtonElement} */
      result: true,
    },
    render: {
      /** @type {HTMLElement} */
      basic: true,
      /** @type {HTMLElement} */
      intensities: true,
      /** @type {HTMLElement} */
      years: true,
    },
    label: {
      /** @type {HTMLElement} */
      share: true,
    },
  },
  {
    spel: TUPLE ? null : "",
    spelIsReady: false,
    birth: TUPLE ? null : "",
    birthIsReady: false,
  },
  (now) => {
    $.btn.result.disabled = !(now.spelIsReady && now.birthIsReady);
  }
);

const updateSpel = setCallback(
  $.form.spel,
  ["onkeyup", "onchange", "onblur"],
  (self) => {
    const { value } = self;
    const setInputColor = useMuteryClasses($.form.spel, "uk-form-?", {
      danger: null,
    });
    const setValidColor = useMuteryClasses($.valid.spel, "uk-label-?", {
      success: null,
      danger: null,
    });

    const spel = hiraganaToSpel(value);

    $.valid.spel.style.display = "block";
    if (!value) {
      setInputColor();
      setValidColor();
      $.valid.spel.textContent = "";
      _.set({ spelIsReady: false, spel: "" });
      return;
    }
    if (!/^([ぁ-ん]+|[a-z]+)$/.test(value)) {
      setInputColor("danger");
      setValidColor("danger");
      $.valid.spel.textContent =
        "「ひらがな だけ」か、「小文字アルファベッド だけ」で入力してください";
      _.set({ spelIsReady: false, spel: "" });
      return;
    }
    if (!/^[a-z]+$/.test(spel)) {
      setInputColor("danger");
      setValidColor("danger");
      $.valid.spel.textContent = `使用できない文字が入力されています: ${spel}`;
      _.set({ spelIsReady: false, spel: "" });
      return;
    }
    setInputColor();
    setValidColor("success");
    $.valid.spel.textContent = spel;
    _.set({ spelIsReady: true, spel });
  }
);

const updateBirth = setCallback(
  $.form.birth,
  ["onkeyup", "onchange", "onblur"],
  (self) => {
    const { value: birth } = self;
    _.set({ birthIsReady: !!birth, birth });
  }
);

setCallback($.btn.copy, ["onclick"], () => {
  navigator.clipboard.writeText($.form.share.value);
});

const submit = setCallback($.btn.result, ["onclick"], () => {
  const { spel, birth } = _.get();
  const [y, m, d] = birth.split("-").map(Number);

  $.label.share.textContent = `${location.href.split("?").at(0)}?spel=${[
    ...spel,
  ]
    .sort()
    .sort(() => 0.5 - Math.random())
    .join("")}&birth=${birth}`;

  const [
    lifepath,
    destiny,
    soul,
    personality,
    birthday,
    challenge,
    intensityNumbers,
    lifeLessonNumbers,
    personalYearNumbers,
  ] = [
    getLifePathNumber(y, m, d),
    getDestinyNumber(spel),
    getSoulNumber(spel),
    getPersonalityNumber(spel),
    getBirthdayNumber(d),
    getChallengeNumber(m, d),
    getIntensityNumbers(spel),
    getLifeLessonNumbers(spel),
    getPersonalYearNumbers(y, m, d),
  ];
  const maturity = getMaturityNumber(lifepath, destiny);

  const TABLE_CLASS = "uk-table uk-table-striped uk-table-hover uk-table-small";

  $.form.share.value = "";

  const basic = [
    {
      label: "ライフパス",
      desc: "生き様",
      num: lifepath,
      id: "lifepath",
      style: "font-weight: bold;",
    },
    { desc: "長所", overwrite: numberToOverview(lifepath).pros },
    { desc: "短所", overwrite: numberToOverview(lifepath).cons },
    { desc: "改善方法", overwrite: numberToOverview(lifepath).personalYear },
    {
      label: "ディスティニー",
      desc: "社会的立位置",
      num: destiny,
      id: "destiny",
    },
    {
      label: "ソウル",
      desc: "幸福感",
      num: soul,
      id: "soul",
    },
    {
      label: "パーソナリティ",
      desc: "客観的な印象",
      num: personality,
      id: "personality",
    },
    {
      label: "マチュリティ",
      desc: "人生の目標",
      num: maturity,
      id: "maturity",
    },
    {
      label: "バースデー",
      desc: "天性の能力",
      num: birthday,
      id: "birthday",
      style: "font-weight: bold; color: red;",
    },
    // { desc: "分野", overwrite: numberToOverview(birthday).intensity },
    {
      label: "チャレンジ",
      desc: "付き纏う問題",
      num: challenge,
      id: "challenge",
      style: "font-weight: bold; color: blue;",
    },
    // { desc: "更に", overwrite: numberToOverview(challenge).cons },
  ];
  $.render.basic.innerHTML = tag.ex("table", { class: TABLE_CLASS }, [
    tag("thead", [
      tag("tr", [
        tag("th"),
        tag("th", ["説明"]),
        tag("th", ["番号 (体癖)"]),
        tag("th", ["概要"]),
      ]),
    ]),
    tag("tbody", [
      tag.arr(basic, ({ label, desc, num, id, overwrite, style }) =>
        tag.frag([
          tag.ex("tr", { style }, [
            tag("td", [label]),
            tag("td", [desc]),
            tag("td", [num ? `${num} (${numberToTaiheki(num)})` : ""]),
            tag("td", [overwrite || numberToOverview(num)[id]]),
          ]),
        ])
      ),
    ]),
  ]);

  $.form.share.value += basic
    .map(
      ({ label, desc, num, id, overwrite }) =>
        `${label ? `${label} (${desc}): ${num}` : ` <${desc}>`}\n  ${
          overwrite || (num ? numberToOverview(num)[id] : "")
        }`
    )
    .join("\n");

  const intensityMax = Math.max(
    ...intensityNumbers.ranking.map((item) => item.count)
  );

  $.render.intensities.innerHTML = tag.ex("table", { class: TABLE_CLASS }, [
    tag("thead", [
      tag("tr", [
        tag("th", ["能力値"]),
        tag("th", ["番号 (体癖)"]),
        tag("th", ["概要"]),
      ]),
    ]),
    tag("tbody", [
      ...tag.arr(intensityNumbers.ranking, ({ value: num, count }) =>
        tag.ex(
          "tr",
          {
            style:
              count === intensityMax ? "font-weight: bold; color: red;" : "",
          },
          [
            tag("td", [count]),
            tag("td", [`${num} (${numberToTaiheki(num)})`]),
            tag("td", [numberToOverview(num).intensity]),
          ]
        )
      ),
      ...tag.arr(lifeLessonNumbers, (num) =>
        tag.ex("tr", { style: "color: blue;" }, [
          tag("td", [0]),
          tag("td", [`${num} (${numberToTaiheki(num)})`]),
          tag("td", [numberToOverview(num).intensity]),
        ])
      ),
    ]),
  ]);

  $.form.share.value += [
    "\nインテンシティ(能力): ",
    intensityNumbers.text,
    ...intensityNumbers.ranking
      .reduce(
        (p, c) => [
          ...p,
          `\n  [${c.value}] x ${c.count} ${
            numberToOverview(c.value).intensity
          }`,
        ],
        []
      )
      .join(""),
    "\nライフレッスン(不向き): ",
    lifeLessonNumbers.join(", "),
    ...lifeLessonNumbers
      .reduce(
        (p, c) => [...p, `\n  [${c}] ${numberToOverview(c).intensity}`],
        []
      )
      .join(""),
  ].join("");

  const currentYear = new Date().getFullYear();
  $.render.years.innerHTML = tag.frag([
    tag("details", [
      tag("summary", ["出生～去年の結果"]),
      tag.ex("table", { class: TABLE_CLASS }, [
        tag("thead", [
          tag("tr", [
            tag("th", ["西暦"]),
            tag("th", ["年齢"]),
            tag("th", ["厄年"]),
            tag("th", ["番号 (体癖)"]),
            tag("th", ["やるべきだったこと"]),
          ]),
        ]),
        tag("tbody", [
          ...tag.arr(
            personalYearNumbers.slice(
              0,
              personalYearNumbers.findIndex((x) => x.year === currentYear)
            ),
            (p) =>
              tag.ex(
                "tr",
                {
                  style: p.year === currentYear ? "font-weight: bold;" : "",
                },
                [
                  tag("td", [p.year]),
                  tag("td", [p.age]),
                  tag("td", [getYakuYear(p.age)]),
                  tag("td", [`${p.result} (${numberToTaiheki(p.result)})`]),
                  tag("td", [numberToOverview(p.result).personalYear]),
                ]
              )
          ),
        ]),
      ]),
    ]),
    tag.ex("table", { class: TABLE_CLASS }, [
      tag("thead", [
        tag("tr", [
          tag("th", ["西暦"]),
          tag("th", ["年齢"]),
          tag("th", ["厄年"]),
          tag("th", ["番号 (体癖)"]),
          tag("th", ["やるべきこと"]),
        ]),
      ]),
      tag("tbody", [
        ...tag.arr(
          personalYearNumbers.slice(
            personalYearNumbers.findIndex((x) => x.year === currentYear)
          ),
          (p) =>
            tag.ex(
              "tr",
              {
                style: p.year === currentYear ? "font-weight: bold;" : "",
              },
              [
                tag("td", [p.year]),
                tag("td", [p.age]),
                tag("td", [getYakuYear(p.age)]),
                tag("td", [`${p.result} (${numberToTaiheki(p.result)})`]),
                tag("td", [numberToOverview(p.result).personalYear]),
              ]
            )
        ),
      ]),
    ]),
  ]);
  $.form.share.value += [
    `\nパーソナルイヤー (年運): ${
      personalYearNumbers.find((x) => x.year === currentYear).result
    }`,
    ...personalYearNumbers
      .filter(({ year }) => Math.abs(year - currentYear) <= 3)
      .reduce(
        (p, c) => [
          ...p,
          `\n  ${c.year} ${c.age} 歳: [${c.result}] ${
            numberToOverview(c.result).personalYear
          }`,
        ],
        []
      ),
  ].join("");
});

const q = location.search
  .slice(1)
  .split("&")
  .reduce((p, c) => {
    const [k, v] = c.split("=");
    return { ...p, [k]: v };
  }, {});
if (q.spel && q.birth) {
  $.form.spel.value = q.spel;
  $.form.birth.value = q.birth;
  updateSpel();
  updateBirth();
  submit();
}

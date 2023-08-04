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
  numberOverview,
  getMaturityNumber,
} from "./utils.js";

const { component: $, state: _ } = createPage(
  {
    form: {
      /** @type {HTMLInputElement} */
      spel: true,
      /** @type {HTMLInputElement} */
      birth: true,
    },
    valid: {
      /** @type {HTMLSpanElement} */
      spel: true,
    },
    btn: {
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
    lifepathNumber,
    destinyNumber,
    soulNumber,
    personalityNumber,
    birthdayNumber,
    challengeNumber,
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
  const maturityNumber = getMaturityNumber(lifepathNumber, destinyNumber);

  const TABLE_CLASS = "uk-table uk-table-striped uk-table-hover uk-table-small";

  $.render.basic.innerHTML = tag.ex("table", { class: TABLE_CLASS }, [
    tag("thead", [
      tag("tr", [
        tag("th"),
        tag("th", ["説明"]),
        tag("th", ["ナンバー"]),
        tag("th", ["概要"]),
      ]),
    ]),
    tag("tbody", [
      ...tag.arr(
        [
          { label: "ライフパス", desc: "生き様", num: lifepathNumber },
          { label: "ディスティニー", desc: "社会的位置", num: destinyNumber },
          { label: "ソウル", desc: "幸福感", num: soulNumber },
          {
            label: "パーソナリティ",
            desc: "客観的印象",
            num: personalityNumber,
          },
          { label: "マチュリティ", desc: "人生の目標", num: maturityNumber },
          { label: "バースデー", desc: "天性", num: birthdayNumber },
          { label: "チャレンジ", desc: "人生の課題", num: challengeNumber },
        ],
        ({ label, desc, num }) =>
          tag("tr", [
            tag("td", [label]),
            tag("td", [desc]),
            tag("td", [num]),
            tag("td", [numberOverview(num)]),
          ])
      ),
    ]),
  ]);

  const intensityMax = Math.max(
    ...intensityNumbers.ranking.map((item) => item.count)
  );

  $.render.intensities.innerHTML = tag.ex("table", { class: TABLE_CLASS }, [
    tag("thead", [
      tag("tr", [
        tag("th", ["能力値"]),
        tag("th", ["ナンバー"]),
        tag("th", ["概要"]),
      ]),
    ]),
    tag("tbody", [
      ...tag.arr(intensityNumbers.ranking, (rank) =>
        tag.ex(
          "tr",
          {
            style: rank.count === intensityMax ? "font-weight: bold;" : "",
          },
          [
            tag("td", [rank.count]),
            tag("td", [rank.value]),
            tag("td", [numberOverview(rank.value)]),
          ]
        )
      ),
      ...tag.arr(lifeLessonNumbers, (num) =>
        tag.ex("tr", { style: "font-weight: bold;" }, [
          tag("td", [0]),
          tag("td", [num]),
          tag("td", [numberOverview(num)]),
        ])
      ),
    ]),
  ]);

  const currentYear = new Date().getFullYear();
  const currentPYN = personalYearNumbers.find((p) => p.year === currentYear);
  $.render.years.innerHTML = tag.ex("table", { class: TABLE_CLASS }, [
    tag("thead", [
      tag("tr", [
        tag("th", ["西暦"]),
        tag("th", ["年齢"]),
        tag("th", ["ナンバー"]),
        tag("th", ["概要"]),
      ]),
    ]),
    tag("tbody", [
      tag.ex("tr", { style: "font-weight: bold;" }, [
        tag("td", [currentPYN.year]),
        tag("td", [currentPYN.age]),
        tag("td", [currentPYN.result]),
        tag("td", [numberOverview(currentPYN.result)]),
      ]),
      ...tag.arr(personalYearNumbers, (p) =>
        tag.ex(
          "tr",
          {
            style: p.year === currentYear ? "font-weight: bold;" : "",
          },
          [
            tag("td", [p.year]),
            tag("td", [p.age]),
            tag("td", [p.result]),
            tag("td", [numberOverview(p.result)]),
          ]
        )
      ),
    ]),
  ]);
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

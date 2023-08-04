export const hiraganaToSpel = (hiraganaName) => {
  const table =
    "あ:a,い:i,う:u,え:e,お:o,か:ka,き:ki,く:ku,け:ke,こ:ko,さ:sa,し:shi,す:su,せ:se,そ:so,た:ta,ち:chi,つ:tsu,て:te,と:to,な:na,に:ni,ぬ:nu,ね:ne,の:no,は:ha,ひ:hi,ふ:fu,へ:he,ほ:ho,ま:ma,み:mi,む:mu,め:me,も:mo,や:ya,ゆ:yu,よ:yo,ら:ra,り:ri,る:ru,れ:re,ろ:ro,わ:wa,を:wo,ん:n,が:ga,ぎ:gi,ぐ:gu,げ:ge,ご:go,ざ:za,じ:ji,ず:zu,ぜ:ze,ぞ:zo,だ:da,ぢ:ji,づ:zu,で:de,ど:do,ば:ba,び:bi,ぶ:bu,べ:be,ぼ:bo,ぱ:pa,ぴ:pi,ぷ:pu,ぺ:pe,ぽ:po,きゃ:kya,きゅ:kyu,きょ:kyo,しゃ:sha,しゅ:shu,しょ:sho,ちゃ:cha,ちゅ:chu,ちょ:cho,にゃ:nya,にゅ:nyu,にょ:nyo,ひゃ:hya,ひゅ:hyu,ひょ:hyo,みゃ:mya,みゅ:myu,みょ:myo,りゃ:rya,りゅ:ryu,りょ:ryo,ぎゃ:gya,ぎゅ:gyu,ぎょ:gyo,じゃ:ja,じゅ:ju,じょ:jo,びゃ:bya,びゅ:byu,びょ:byo,ぴゃ:pya,ぴゅ:pyu,ぴょ:pyo"
      .split(",")
      .reduce((p, c) => {
        const [k, v] = c.split(":");
        return { ...p, [k]: v };
      }, {});
  let name = "";
  for (let i = 0; i < hiraganaName.length; i++) {
    let roman;
    if (i < hiraganaName.length - 1 && table[hiraganaName.slice(i, i + 2)]) {
      roman = table[hiraganaName.slice(i, i + 2)];
      i++;
    } else {
      roman = table[hiraganaName[i]] || hiraganaName[i];
    }
    if (roman === "n" && i < hiraganaName.length - 1) {
      const next = table[hiraganaName[i + 1]] || hiraganaName[i + 1];
      if (["b", "m", "p"].includes(next[0])) roman = "m";
    }
    name += roman;
  }
  return name;
};

const SPELMAP = (c) =>
  [
    ...["", "ajs", "bkt", "clu", "dmv", "enw", "fox", "gpy", "hqz", "ir"],
  ].findIndex((item) => item.includes(c));

const spelToNumber = (spel, filter = () => true, map = SPELMAP) => {
  let sum = [...spel]
    .filter(filter)
    .map(map)
    .reduce((p, c) => p + c, 0);
  while (sum > 9 && sum % 11 !== 0)
    sum = [...`${sum}`].reduce((a, c) => a + Number(c), 0);
  return sum;
};

export const getDestinyNumber = (spel) => spelToNumber(spel);
export const getSoulNumber = (spel) =>
  spelToNumber(
    spel,
    (c) => "aiueo".includes(c),
    (c) => ({ a: 1, u: 3, e: 5, o: 6, i: 9 }[c])
  );
export const getPersonalityNumber = (spel) =>
  spelToNumber(spel, (c) => !"aiueo".includes(c));

export const getIntensityNumbers = (spel) => {
  const counts = [...spel]
    .map(SPELMAP)
    .reduce(
      (acc, number) => ({ ...acc, [number]: (acc[number] || 0) + 1 }),
      {}
    );
  const ranking = Object.entries(counts)
    .map(([k, v]) => ({ value: +k, count: v }))
    .sort((a, b) => b.count - a.count || a.value - b.value);
  let formula = [];
  let sameCount = [];
  let lastCount = null;
  ranking.forEach(({ value, count }) => {
    if (count !== lastCount) {
      formula.push(sameCount.join("="));
      sameCount = [value];
    } else {
      sameCount.push(value);
    }
    lastCount = count;
  });
  formula.push(sameCount.join("="));
  return { text: formula.filter((x) => x !== "").join(">"), ranking };
};

export const getLifeLessonNumbers = (spel) =>
  [...Array(10).keys()]
    .slice(1)
    .filter((x) => ![...spel].map(SPELMAP).includes(x));

const ymdToNumber = (y, m, d) => {
  const total = [...`${y}${m}${d}`].map(Number);
  let sum = total.reduce((a, b) => a + b, 0);
  const uniq = [...new Set([...`${sum}`])];
  if (uniq.length === 1) return sum;
  while (sum > 9) {
    sum = [...`${sum}`].map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
};

export const getLifePathNumber = (birthY, birthM, birthD) =>
  ymdToNumber(birthY, birthM, birthD);
export const getBirthdayNumber = (birthD) => ymdToNumber(0, 0, birthD);
export const getChallengeNumber = (birthM, birthD) =>
  ymdToNumber(0, birthM, birthD);

export const getPersonalYearNumbers = (birthY, birthM, birthD, maxAge = 120) =>
  [...new Array(maxAge + 1).keys()].map((age) => {
    const year = birthY + age;
    return { year, age, result: ymdToNumber(year, birthM, birthD) };
  });

export const getMaturityNumber = (lifepathNumber, destinyNumber) => {
  const total = [...`${lifepathNumber + destinyNumber}`].map(Number);
  let sum = total.reduce((a, b) => a + b, 0);
  const uniq = [...new Set([...`${sum}`])];
  if (uniq.length === 1) return sum;
  while (sum > 9) {
    sum = [...`${sum}`].map(Number).reduce((a, b) => a + b, 0);
  }
  return sum;
};

export const numberOverview = (num) =>
  ({
    1: "自立、意志強くリーダー、孤立や我が優先傾向",
    2: "協力と調和、他人思いでパートナー、過度な依存に注意",
    3: "創造性、情熱と表現力が特徴、楽観的過ぎて現実逃避傾向",
    4: "実務と秩序、安定と努力家、変化を嫌う保守性あり",
    5: "自由と変化、好奇心旺盛で適応力、過度な自由欲求で無責任",
    6: "調和と家族愛、親切で責任感、過保護で自己犠牲傾向",
    7: "探求と内省、深遠な思索家、内向的で社交的に苦手",
    8: "権力と物質、指導力と企業家精神、支配欲や材料主義的",
    9: "完結と人道、広い視野と理想主義、理想高すぎて現実見失う",
    11: "直観と啓示、霊的な視野とリーダーシップ、神経質で不安定",
    22: "建設と大規模計画、実行力と革新、オーバーワークと焦燥感",
    33: "教師と無私無欲、愛と調和の象徴、過度の献身と自己忘却傾向",
  }[num]);

/** @type {unknown} */
export const TUPLE = Symbol("unknown");

/**
 * ページのコンポーネントとステートを定義する
 * @template M, S
 * @param {M} componentsMap
 * @param {S} initState
 * @param {(now: S) => void} onChangeState
 * @returns {{
 *   component: M,
 *   state: {
 *     set: (next: Partial<S>) => void;
 *     get: () => S;
 *   }
 * }}
 */
export const createPage = (componentsMap, initState, onChangeState) => {
  const createComponents = (map) =>
    Object.entries(map).reduce((p, [k, v]) => {
      p[k] = Object.entries(v).reduce((pp, [kk, vv]) => {
        pp[kk] = document.getElementById(vv === true ? `${k}-${kk}` : vv);
        return pp;
      }, {});
      return p;
    }, {});
  const createState = (init, onChange) => ({
    set(next) {
      this._ = { ...this._, ...next };
      onChange(this._);
    },
    get() {
      return this._;
    },
    _: init,
  });
  return {
    component: createComponents(componentsMap),
    state: createState(initState, onChangeState),
  };
};

/**
 * @template T
 * @param {T} component
 * @param {Extract<keyof T, `on${string}`>[]} hooks
 * @param {(self: T) => void} fn
 */
export const setCallback = (component, hooks, fn) => {
  const callback = () => fn(component);
  hooks.forEach((h) => {
    component[h] = callback;
  });
  return callback;
};

/**
 * @template T
 * @param {HTMLElement} component
 * @param {string} pettern
 * @param {T} valiables JSDoc の都合上 { xxx: null } のように記述
 */
export const useMuteryClasses =
  (component, pettern, valiables) =>
  /** @param {keyof T} [value] */
  (value) => {
    Object.keys(valiables).forEach((remove) => {
      component.classList.remove(pettern.replace("?", remove));
    });
    if (value) component.classList.add(pettern.replace("?", value));
  };

const createElement = (name, props, children = []) =>
  `<${name}${Object.entries(props).reduce(
    (p, [k, v]) => `${p} ${k}="${v}"`,
    ""
  )}>${children.join("")}</${name}>`;

/**
 * @type {{
 *   (name: string, children?: string[]): string;
 *   frag: (arr: string[]) => string;
 *   ex: (name: string, props: any, children?: string[]) => string;
 *   arr: <T>(arr: T[], fn: (el: T, index: number) => string) => string;
 * }}
 */
export const tag = (name, children = []) => createElement(name, {}, children);
tag.frag = (arr) => arr.join("");
tag.ex = createElement;
tag.arr = (arr, fn) => arr.reduce((p, c, i) => [...p, fn(c, i)], []).join("");

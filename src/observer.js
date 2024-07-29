import { defaultOptions, setOptions } from "./config.js";
import { animate, reverse, isAnimated, clearAnimation } from "./animations.js";

let elements = [];
let intersectionObserver = null;

const enableAnimations = () => {
  document.body.classList.remove(defaultOptions.disabledClassName);
};

const disableAnimations = () => {
  document.body.classList.add(defaultOptions.disabledClassName);
};

const clearObserver = () => {
  intersectionObserver.disconnect();
  intersectionObserver = null;
};

/**
 * Checks if the observer is disabled based on the default options.
 *
 * @returns {boolean} Returns true if the observer is disabled, false otherwise.
 */
export const isDisabled = () =>
  defaultOptions.disabled ||
  (typeof defaultOptions.disabled === "function" && defaultOptions.disabled());

/**
 * Handles the intersection callback for the Intersection Observer.
 *
 * @param {IntersectionObserverEntry[]} entries - The array of intersection entries.
 * @param {IntersectionObserver} observer - The Intersection Observer instance.
 */
const onIntersection = (entries, observer) => {
  entries.forEach((entry) => {
    const { target } = entry;
    const hasRepeatFlag = target.dataset.animationRepeat !== undefined;
    const hasOnceFlag = target.dataset.animationOnce !== undefined;
    const shouldRepeat = hasRepeatFlag || !(hasOnceFlag || defaultOptions.once);

    if (entry.intersectionRatio >= defaultOptions.threshold) {
      animate(entry);

      if (!shouldRepeat) {
        observer.unobserve(target);
      }
    } else if (shouldRepeat) {
      reverse(entry);
    }
  });
};

/**
 * Retrieves the observed elements based on the default options.
 *
 * @returns {Array<HTMLElement>} The collection of observed elements.
 */
export const getObservedElements = () => {
  const collection = [].filter.call(
    document.querySelectorAll(defaultOptions.selector),
    (element) => !isAnimated(element, defaultOptions.animateClassName)
  );

  collection.forEach((element) => intersectionObserver.observe(element));

  return collection;
};

export const disable = () => {
  disableAnimations();
  clearObserver();
};

export const enable = () => {
  enableAnimations();

  intersectionObserver = new IntersectionObserver(onIntersection, {
    root: defaultOptions.root,
    rootMargin: defaultOptions.rootMargin,
    threshold: defaultOptions.threshold,
  });

  elements = getObservedElements();
};

export const reset = (settings = {}) => {
  clearObserver();

  Array.from(document.querySelectorAll(defaultOptions.selector)).forEach(
    clearAnimation
  );

  setOptions(settings);
  enable();
};

export const update = () => {
  const newElements = getObservedElements();
  elements.push(newElements);
};

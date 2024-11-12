/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import { div } from '../../scripts/dom-helpers.js';
import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  let $content;
  let $img;

  [...block.children].forEach((row, i) => {
    if (i === 0) {
      $content = div({ class: 'content' }, row.childNodes[1]);
    }
    if (i === 1) {
      $img = createOptimizedPicture(row.querySelector('img').src, 'alt', true, [{ width: '1400px' }]);
    }
  });

  const $hero = div({ class: 'hero' },
    $img,
    $content,
  );

  block.replaceWith($hero);

  setTimeout(() => {
    $hero.classList.add('loaded');
  }, 400);
}

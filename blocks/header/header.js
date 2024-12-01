/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import { div, span, a, img } from '../../scripts/dom-helpers.js';

// function animateHeader($hdr) {
//   const sections = document.querySelectorAll('.section');
//
//   // Track the last section that triggered an invert to prevent unnecessary toggling
//   let lastInvertState = null;
//
//   window.addEventListener('scroll', () => {
//     let isInDarkSection = false;
//
//     sections.forEach((section) => {
//       const sectionTop = section.getBoundingClientRect().top;
//
//       // Check if the section is at 60px from the top and contains the 'dark' class
//       if (sectionTop <= 60 && sectionTop + section.offsetHeight > 60) {
//         if (section.classList.contains('dark')) {
//           isInDarkSection = true;
//         }
//       }
//     });
//
//     // Toggle the header's invert class only when changing from dark to non-dark sections
//     if (isInDarkSection !== lastInvertState) {
//       if (!isInDarkSection) {
//         $hdr.classList.add('invert');
//       } else {
//         $hdr.classList.remove('invert');
//       }
//       lastInvertState = isInDarkSection;
//     }
//   });
// }

function animateHeader($hdr) {
  const sections = document.querySelectorAll('.section');
  const firstSection = sections[0]; // Get the first section separately
  let lastInvertState = null;

  const checkHeaderClasses = () => {
    const scrollPosition = window.scrollY;

    // Handle the blur effect based on scroll position
    let blurValue = 0;
    if (scrollPosition > 40) {
      blurValue = Math.min((scrollPosition - 40) / 400 * 20, 20); // Scale blur from 0 to 30
    }
    $hdr.style.backdropFilter = `blur(${blurValue}px)`;

    // Check if the header is within the view of the first section
    const firstSectionTop = firstSection.getBoundingClientRect().top;
    if (firstSectionTop <= 60 && firstSectionTop + firstSection.offsetHeight > 60) {
      $hdr.classList.add('top');
    } else {
      $hdr.classList.remove('top');
    }

    // Check for dark section toggle logic
    let isInDarkSection = false;
    sections.forEach((section) => {
      const sectionTop = section.getBoundingClientRect().top;
      if (sectionTop <= 60 && sectionTop + section.offsetHeight > 60) {
        if (section.classList.contains('dark')) {
          isInDarkSection = true;
        }
      }
    });

    if (isInDarkSection !== lastInvertState) {
      if (!isInDarkSection) {
        $hdr.classList.add('invert');
      } else {
        $hdr.classList.remove('invert');
      }
      lastInvertState = isInDarkSection;
    }
  };

  // Bind the scroll event listener
  window.addEventListener('scroll', checkHeaderClasses);

  // Initialize on load
  checkHeaderClasses();
}

// function animateHeader($hdr) {
//   const sections = document.querySelectorAll('.section');
//   const firstSection = sections[0]; // Get the first section separately
//
//   // Track the last section that triggered an invert to prevent unnecessary toggling
//   let lastInvertState = null;
//
//   const checkHeaderClasses = () => {
//     let isInDarkSection = false;
//
//     // Check if the header is within the view of the first section
//     const firstSectionTop = firstSection.getBoundingClientRect().top;
//     if (firstSectionTop <= 60 && firstSectionTop + firstSection.offsetHeight > 60) {
//       $hdr.classList.add('top');
//     } else {
//       $hdr.classList.remove('top');
//     }
//
//     // Check other sections for the 'invert' toggle logic
//     sections.forEach((section) => {
//       const sectionTop = section.getBoundingClientRect().top;
//
//       // Check if the section is at 60px from the top and contains the 'dark' class
//       if (sectionTop <= 60 && sectionTop + section.offsetHeight > 60) {
//         if (section.classList.contains('dark')) {
//           isInDarkSection = true;
//         }
//       }
//     });
//
//     // Toggle the header's invert class only when changing from dark to non-dark sections
//     if (isInDarkSection !== lastInvertState) {
//       if (!isInDarkSection) {
//         $hdr.classList.add('invert');
//       } else {
//         $hdr.classList.remove('invert');
//       }
//       lastInvertState = isInDarkSection;
//     }
//   };
//
//   // Bind the scroll event listener
//   window.addEventListener('scroll', checkHeaderClasses);
//
//   // Call the function once on load to initialize classes correctly
//   checkHeaderClasses();
// }

export default async function decorate(block) {
  const $homeBtn = a({ class: 'home', href: '/' },
    img({ src: '/icons/adobe-logo.svg', width: 27, height: 27, alt: 'Adobe' }),
    span('Adobe Managed Services'),
  );

  // todo: p10 make search expandable
  // const $searchBtn = div({ class: 'search' });
  // $searchBtn.innerHTML = `
  //   <svg fill="currentColor" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
  //     <path d="M16.9,15.5c2.4-3.2,2.2-7.7-0.7-10.6c-3.1-3.1-8.1-3.1-11.3,0c-3.1,3.2-3.1,8.3,0,11.4
  //       c2.9,2.9,7.5,3.1,10.6,0.6c0,0.1,0,0.1,0,0.1l4.2,4.2c0.5,0.4,1.1,0.4,1.5,0c0.4-0.4,0.4-1,0-1.4L16.9,15.5
  //       C16.9,15.5,16.9,15.5,16.9,15.5L16.9,15.5z M14.8,6.3c2.3,2.3,2.3,6.1,0,8.5c-2.3,2.3-6.1,2.3-8.5,0C4,12.5,4,8.7,6.3,6.3
  //       C8.7,4,12.5,4,14.8,6.3z"/>
  //   </svg>
  // `;

  const $header = div(
    $homeBtn,
    // $searchBtn,
  );

  block.remove();

  // place header in body
  const $hdr = document.querySelector('header');
  $hdr.append($header);

  // const $parallax = document.querySelector('#parallax-page-wrapper');
  // if ($parallax) {
  //   $parallax.prepend($hdr);
  // } else {
  //   document.body.prepend($hdr);
  // }

  animateHeader($hdr);
}

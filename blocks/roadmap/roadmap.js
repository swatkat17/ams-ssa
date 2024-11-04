/* eslint-disable no-use-before-define, object-curly-newline, function-paren-newline */
import { div, ul, li, p, a, span, sup } from '../../scripts/dom-helpers.js';
import { scrollToMe } from '../../scripts/animations.js';
import { readBlockConfig } from '../../scripts/aem.js';

// Generate all quarters between start and end
function generateYearQuarterRange(start, end) {
  let [startYear, startQuarter] = start.split('-');
  let [endYear, endQuarter] = end.split('-');

  // Adjust start to one quarter earlier
  startQuarter = parseInt(startQuarter.replace('Q', ''), 10) - 1;
  if (startQuarter === 0) {
    startQuarter = 4;
    startYear = parseInt(startYear, 10) - 1;
  }

  // Adjust end to one quarter later
  endQuarter = parseInt(endQuarter.replace('Q', ''), 10) + 1;
  if (endQuarter === 5) {
    endQuarter = 1;
    endYear = parseInt(endYear, 10) + 1;
  }

  // fill in anny empty quarters
  const yearQuarterList = [];
  let currentYear = parseInt(startYear, 10);
  let currentQuarter = parseInt(startQuarter, 10);
  while (
    currentYear < parseInt(endYear, 10)
    || (currentYear === parseInt(endYear, 10) && currentQuarter <= parseInt(endQuarter, 10))
  ) {
    yearQuarterList.push({ year: currentYear, quarter: `Q${currentQuarter}` });
    currentQuarter += 1;
    if (currentQuarter > 4) {
      currentQuarter = 1;
      currentYear += 1;
    }
  }
  return yearQuarterList;
}

// find the earliest and latest year/quarter
function getEarliestAndLatest(roadmapData) {
  let earliest = null;
  let latest = null;
  roadmapData.forEach(({ year, quarter }) => {
    const current = `${year}-${quarter}`;
    if (!earliest || compareYearQuarter(current, earliest) < 0) {
      earliest = current;
    }
    if (!latest || compareYearQuarter(current, latest) > 0) {
      latest = current;
    }
  });
  return { earliest, latest };
}

// compare year and quarter
function compareYearQuarter(yq1, yq2) {
  const [year1, quarter1] = yq1.split('-').map((v) => parseInt(v.replace('Q', ''), 10));
  const [year2, quarter2] = yq2.split('-').map((v) => parseInt(v.replace('Q', ''), 10));
  if (year1 < year2 || (year1 === year2 && quarter1 < quarter2)) return -1;
  if (year1 > year2 || (year1 === year2 && quarter1 > quarter2)) return 1;
  return 0;
}

function fixYears(block, years) {
  // get center position
  const leftPosition = (window.innerWidth / 2) - 50;

  block.addEventListener('scroll', () => {
    const scrollLeftPos = block.scrollLeft;

    years.forEach((year) => {
      const yearLeftPos = year.offsetLeft;
      if (scrollLeftPos >= yearLeftPos - leftPosition) {
        year.classList.add('fixed');
      } else {
        year.classList.remove('fixed');
      }
    });
  });
}

export default function decorate(block) {
  const blockConfig = readBlockConfig(block);

  // Calculate the current year and quarter
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentQuarter = `Q${Math.floor(currentMonth / 3) + 1}`;

  let activePos;
  let yIndex = 0;
  let qIndex = 0;
  let pTabIndex = 1;

  block.innerHTML = '';

  fetch(blockConfig['data-source'])
    .then((response) => response.json())
    .then((data) => {
      const roadmapData = data.data;
      const { earliest, latest } = getEarliestAndLatest(roadmapData);
      const fullYearQuarterRange = generateYearQuarterRange(earliest, latest);

      // Group data by year and quarter
      // eslint-disable-next-line max-len
      const groupData = roadmapData.reduce((acc, { year, quarter, project, description, path, sort, btn }) => {
        acc[year] = acc[year] || {};
        acc[year][quarter] = acc[year][quarter] || [];
        acc[year][quarter].push({ title: project, tip: description, path, sort, btn });

        // Sort the projects for this quarter by the sort number
        acc[year][quarter].sort((A, B) => A.sort - B.sort);

        return acc;
      }, {});

      const $heading = div({ class: 'heading' },
        'Future Vision ',
        span('(roadmap)'),
      );

      const $disclaimer = div({ class: 'disclaimer' },
        'EA = Early Availability',
        span(' | '),
        'GA = General Availability',
      );

      const $years = ul({ class: 'years' });

      fullYearQuarterRange.forEach(({ year, quarter }) => {
        let $year = $years.querySelector(`[data-year="${year}"]`);
        if (!$year) {
          $year = li({ class: `y clr-${yIndex}`, 'data-year': year }, '\u00A0', div(year));
          yIndex += 1; // Increment only for new years
        }

        let $quarters = $year.querySelector('ul.quarters');
        if (!$quarters) {
          $quarters = ul({ class: 'quarters' });
        }

        // Increment the position index for each quarter
        qIndex += 1;
        const pos = qIndex;

        // Create the quarter element and attach it
        const $quarter = li({ class: 'q', 'data-i': pos }, quarter);

        // Initial start quarter (current date)
        if (parseInt(year, 10) === currentYear && quarter === currentQuarter) {
          $quarter.classList.add('start');
          activePos = pos;
        }

        // Retrieve projects for the corresponding year/quarter if they exist
        const projects = (groupData[year] && groupData[year][quarter]) || [];
        const $projects = ul({ class: 'projects' });

        // Iterate over the projects and append them to the quarter
        projects.forEach(({ title, tip, path, btn }, n) => {
          // Ignore empty projects
          if (title === '') return;

          // Process title for (EA) and (GA)
          const suffixMap = {
            '(EA)': { title: 'Early Access', label: 'EA' },
            '(GA)': { title: 'General Access', label: 'GA' },
          };
          const suffix = Object.keys(suffixMap).find((key) => title.includes(key));
          let $pTitle = suffix ? title.replace(suffix, '') : title;
          const suffixElement = suffix ? sup({ title: suffixMap[suffix].title }, suffixMap[suffix].label) : '';

          $pTitle = span($pTitle, suffixElement);

          const $learnMoreLink = btn.toLowerCase() !== 'hide' ? p(a({ class: 'btn', href: path }, 'Learn more')) : '';

          // Create the project element and append it to the project list
          const $project = li({ class: 'p', style: `--index:${n}`, tabindex: pTabIndex },
            div($pTitle,
              div({ class: 'tooltip' },
                div(tip,
                  $learnMoreLink,
                ),
              ),
            ),
          );

          $project.addEventListener('click', () => {
            $years.querySelectorAll('.active').forEach(($p) => $p.classList.remove('active'));
            $project.classList.toggle('active');
          });

          // Expand on focus
          $project.addEventListener('focus', () => {
            $years.querySelectorAll('.active').forEach(($p) => $p.classList.remove('active'));
            $project.classList.add('active');
          });

          // Optional: collapse on blur
          $project.addEventListener('blur', () => {
            $project.classList.remove('active');
          });

          $projects.appendChild($project);
          pTabIndex += 1; // Increment only for new years
        });

        $years.appendChild($year);
        $year.appendChild($quarters);
        $quarters.appendChild($quarter);
        $quarter.appendChild($projects);
      });

      const quarterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('on');
          else entry.target.classList.remove('on');
        });
      }, {
        threshold: [0.40], root: $years,
      });
      $years.querySelectorAll('.q').forEach(($quarter) => {
        quarterObserver.observe($quarter);
      });

      function scroll(dir) {
        // return if the button is disabled
        if (
          (dir === -1 && activePos === 1) // is at start
          || (dir === 1 && activePos === qIndex) // is at end
        ) return;

        activePos += dir;
        const target = block.querySelector(`[data-i="${activePos}"]`);

        if (target) scrollToMe($years, target, 500);

        // Toggle disabled state for left and right buttons
        $left.classList.toggle('disabled', activePos === 1);
        $right.classList.toggle('disabled', activePos === qIndex);

        // Close all active projects
        // $years.querySelectorAll('.active').forEach(($p) => $p.classList.remove('active'));
      }
      const $left = div({ class: 'left' }, div());
      const $right = div({ class: 'right' }, div());
      $left.addEventListener('click', () => scroll(-1));
      $right.addEventListener('click', () => scroll(1));

      // keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') scroll(1);
        if (e.key === 'ArrowLeft') scroll(-1);
      });

      const $timeline = div({ class: 'timeline' }, $years, $left, $right);

      block.append($heading, $timeline, $disclaimer);

      // scroll to start for initial scroll
      const roadMapObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const startHere = block.querySelector('.start');
            scrollToMe($years, startHere, 2000);
            // stop observing
            observer.disconnect();
          }
        });
      }, {
        threshold: [0.20],
      });
      roadMapObserver.observe($timeline);

      fixYears($years, $timeline.querySelectorAll('.y'));
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error('Error fetching roadmap data:', error);
    });
}
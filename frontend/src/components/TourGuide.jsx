import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

/**
 * TourGuide — Multi-Page Guided Tour with Global Step Numbering
 *
 * Walks new users across pages with per-component highlights.
 * Uses localStorage to track progress across page navigations.
 *
 * Total: 12 steps across 7 pages
 */

const TOUR_PAGES = [
  {
    path: '/dashboard',
    steps: [
      {
        element: '#tour-identity',
        popover: {
          title: '👤 Officer Identity Card',
          description: 'Your designation, division, and years of service. This drives all competency targets and personalized recommendations.',
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#tour-heatmap',
        popover: {
          title: '📅 Activity Heatmap',
          description: 'GitHub-style calendar showing your daily learning activity. Build streaks by completing lessons every day!',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#tour-radar',
        popover: {
          title: '📊 FRAC Competency Radar',
          description: 'Your current scores vs the target framework. Blue = your score, green = target. Red zones indicate skill gaps that need priority training.',
          side: 'top',
          align: 'center',
        },
      },
      {
        element: '#tour-track-progress',
        popover: {
          title: '📈 Track Progress',
          description: 'Module-by-module completion across all 4 FRAC learning tracks. Progress bars fill as you complete levels.',
          side: 'top',
          align: 'center',
        },
      },
    ],
  },
  {
    path: '/tracks',
    steps: [
      {
        element: '#tour-first-track',
        popover: {
          title: '📚 Learning Track Cards',
          description: 'Each card maps to a FRAC quadrant. Red borders highlight your weakest areas. Click "START TRACK" to enter a level-by-level roadmap with lessons and boss quizzes.',
          side: 'left',
          align: 'start',
        },
      },
    ],
  },
  {
    path: '/track/cloud',
    steps: [
      {
        popover: {
          title: '🗺️ Track Roadmap',
          description: 'Each track has 10 levels with progressively harder lessons. Complete all lessons in a level to unlock the next. Boss quizzes gate each milestone!',
          side: 'bottom',
          align: 'center',
        },
      },
    ],
  },
  {
    path: '/diagnostic',
    steps: [
      {
        element: '#tour-page-diagnostic',
        popover: {
          title: '🎯 FRAC Diagnostic Assessment',
          description: 'Retake the 12-question competency quiz anytime to update your skill profile. Your officer data (designation, division) stays pre-filled.',
          side: 'bottom',
          align: 'center',
        },
      },
    ],
  },
  {
    path: '/recommendations',
    steps: [
      {
        element: '#tour-page-recommendations',
        popover: {
          title: '🗺️ AI Training Pathways',
          description: 'Two tabs: iGOT Karmayogi e-courses for self-paced learning, and NSSTA TPAC institutional programmes for classroom training. Both filtered by your FRAC skill gaps.',
          side: 'bottom',
          align: 'center',
        },
      },
    ],
  },
  {
    path: '/quiz-generator',
    steps: [
      {
        element: '#tour-page-quiz',
        popover: {
          title: '📝 Document Quiz Engine',
          description: 'Upload any MoSPI statistical manual or circular (PDF/PPTX). AI extracts key concepts and generates FRAC-tagged MCQs with instant grading and explanations.',
          side: 'bottom',
          align: 'center',
        },
      },
    ],
  },
  {
    path: '/labs/quiz-generator',
    steps: [
      {
        element: '#tour-page-labs',
        popover: {
          title: '🧪 AI Labs',
          description: 'Two powerful tools: Doc Quiz Engine generates FRAC-tagged MCQs from uploaded documents (PDF/PPTX) for self-assessment. Blueprint Lab creates step-by-step project plans from your idea using AI.',
          side: 'bottom',
          align: 'center',
        },
      },
    ],
  },
  {
    path: '/admin',
    steps: [
      {
        element: '#tour-page-admin',
        popover: {
          title: '🏛️ Admin Analytics Dashboard',
          description: 'Three tabs: Division Heatmap for org-wide scores, Cadre Analysis for JSO→Dy.Dir comparison, and Training Effectiveness for completion rate trends.',
          side: 'bottom',
          align: 'center',
        },
      },
    ],
  },
];

// Pre-compute global step total
const TOTAL_STEPS = TOUR_PAGES.reduce((sum, pg) => sum + pg.steps.length, 0);

function getStepOffset(pageIndex) {
  let offset = 0;
  for (let i = 0; i < pageIndex; i++) {
    offset += TOUR_PAGES[i].steps.length;
  }
  return offset;
}

export default function TourGuide() {
  const navigate = useNavigate();
  const location = useLocation();
  const driverRef = useRef(null);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('mospi_has_seen_tour');
    if (hasSeenTour === 'true') return;

    const currentPageIndex = parseInt(localStorage.getItem('mospi_tour_page') || '0', 10);
    const tourPage = TOUR_PAGES[currentPageIndex];

    if (!tourPage) {
      localStorage.setItem('mospi_has_seen_tour', 'true');
      localStorage.removeItem('mospi_tour_page');
      return;
    }

    // If user navigated away from the tour page (e.g. clicked "Take Assessment"),
    // don't redirect them back — just wait for them to return naturally.
    if (!location.pathname.startsWith(tourPage.path)) {
      // Check if user is on any other tour page (out of order) — if so, don't interfere
      const isOnAnyTourPage = TOUR_PAGES.some(pg => location.pathname.startsWith(pg.path));
      if (!isOnAnyTourPage) {
        // User went to a non-tour page (e.g. /diagnostic) — let them go, don't redirect
        return;
      }
      // User is on a different tour page — navigate to the correct one
      navigate(tourPage.path);
      return;
    }

    const stepOffset = getStepOffset(currentPageIndex);
    const isLastPage = currentPageIndex >= TOUR_PAGES.length - 1;

    const timer = setTimeout(() => {
      const driverObj = driver({
        showProgress: true,
        animate: true,
        overlayColor: 'rgba(15, 23, 42, 0.75)',
        stagePadding: 10,
        stageRadius: 8,
        popoverClass: 'smartskills-tour-popover',
        allowClose: false,   // Force use of Skip button instead of random clicks
        steps: tourPage.steps,

        onPopoverRender: (popover, { state }) => {
          // ── Override progress text with global count ──
          const currentGlobal = stepOffset + state.activeIndex + 1;
          const progressEl = popover.progress || popover.progressText;
          if (progressEl) {
            progressEl.textContent = `${currentGlobal} OF ${TOTAL_STEPS}`;
          }

          // ── Button text ──
          const isLastStepOnPage = state.activeIndex === tourPage.steps.length - 1;
          const nextBtn = popover.nextButton;
          if (nextBtn) {
            if (isLastPage && isLastStepOnPage) {
              nextBtn.textContent = 'Finish Tour 🚀';
            } else if (isLastStepOnPage) {
              nextBtn.textContent = 'Next Page →';
            } else {
              nextBtn.textContent = 'Next →';
            }
          }
          const prevBtn = popover.previousButton;
          if (prevBtn) {
            prevBtn.textContent = '← Back';
          }

          // ── Skip Tutorial link ──
          const footer = popover.footerButtons;
          if (footer && !footer.querySelector('.tour-skip-btn')) {
            const skipBtn = document.createElement('button');
            skipBtn.className = 'tour-skip-btn';
            skipBtn.textContent = 'Skip Tutorial';
            skipBtn.style.cssText = `
              background: none; border: none; cursor: pointer;
              font-family: var(--font-mono); font-size: 0.65rem;
              color: var(--color-muted); text-transform: uppercase;
              letter-spacing: 0.05em; text-decoration: underline;
              margin-left: auto; padding: 4px 0;
            `;
            skipBtn.addEventListener('click', () => {
              localStorage.setItem('mospi_has_seen_tour', 'true');
              localStorage.removeItem('mospi_tour_page');
              driverObj.destroy();
            });
            footer.appendChild(skipBtn);
          }
        },

        onPrevClick: () => {
          // If on the first step of a page, go back to previous page
          if (driverObj.getActiveIndex() === 0 && currentPageIndex > 0) {
            const prevIndex = currentPageIndex - 1;
            localStorage.setItem('mospi_tour_page', String(prevIndex));
            driverObj.destroy();
            navigate(TOUR_PAGES[prevIndex].path);
          } else {
            driverObj.movePrevious();
          }
        },

        onDestroyStarted: () => {
          if (driverObj.isLastStep()) {
            const nextIndex = currentPageIndex + 1;
            if (nextIndex < TOUR_PAGES.length) {
              localStorage.setItem('mospi_tour_page', String(nextIndex));
              driverObj.destroy();
              navigate(TOUR_PAGES[nextIndex].path);
            } else {
              localStorage.setItem('mospi_has_seen_tour', 'true');
              localStorage.removeItem('mospi_tour_page');
              driverObj.destroy();
            }
          } else {
            // Early dismiss — still mark complete
            localStorage.setItem('mospi_has_seen_tour', 'true');
            localStorage.removeItem('mospi_tour_page');
            driverObj.destroy();
          }
        },
      });

      driverRef.current = driverObj;
      driverObj.drive();
    }, 700);

    return () => {
      clearTimeout(timer);
      if (driverRef.current) {
        try { driverRef.current.destroy(); } catch {}
        driverRef.current = null;
      }
    };
  }, [location.pathname]);

  return null;
}

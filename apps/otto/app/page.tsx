import Image from "next/image";
import styles from "./page.module.css";

const Arrow = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M4 10h12M11 5l5 5-5 5" />
  </svg>
);

const Mark = () => (
  <span className={styles.mark} aria-hidden="true">
    <span />
    <span />
    <span />
  </span>
);

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a className={styles.logo} href="#" aria-label="Otto home">
          <Mark />
          <span>otto</span>
        </a>
        <nav className={styles.nav} aria-label="Main navigation">
          <a href="#product">Product</a>
          <a href="#outcomes">Solutions</a>
          <a href="#about">Why Otto</a>
          <a href="#footer">Resources</a>
        </nav>
        <div className={styles.headerActions}>
          <a className={styles.signIn} href="#signin">Sign in</a>
          <a className={styles.navCta} href="#demo">
            Book a demo <Arrow />
          </a>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroGlow} />
          <div className={styles.eyebrow}>
            <span>New</span> The learning platform built for momentum
          </div>
          <h1>
            Learning that moves
            <br />
            <em>people forward.</em>
          </h1>
          <p className={styles.heroCopy}>
            Otto gives teams one beautifully simple place to teach, learn,
            and turn knowledge into meaningful progress.
          </p>
          <div className={styles.heroActions}>
            <a className={styles.primaryButton} href="#demo">
              Start learning <Arrow />
            </a>
            <a className={styles.textButton} href="#product">
              Explore the platform <span>↘</span>
            </a>
          </div>

          <div className={styles.productFrame} id="product">
            <div className={styles.frameBar}>
              <div className={styles.dots}><i /><i /><i /></div>
              <div className={styles.frameTitle}><Mark /> otto.app/course</div>
              <div className={styles.frameMenu}>•••</div>
            </div>
            <Image
              src="/otto-lms-dashboard.png"
              alt="Otto course dashboard showing curriculum, learner progress, activity, and upcoming lessons"
              width={1586}
              height={992}
              priority
              className={styles.dashboard}
            />
          </div>
          <p className={styles.trusted}>TRUSTED BY LEARNING TEAMS AT</p>
          <div className={styles.logos} aria-label="Customer logos">
            <span>Northstar</span><span>MONO</span><span>Arc Studio</span>
            <span>Fieldwork</span><span>Shift</span>
          </div>
        </section>

        <section className={styles.statement} id="about">
          <p className={styles.sectionLabel}>THE BETTER WAY TO LEARN</p>
          <h2>
            Most learning platforms feel like work.
            <br />
            Otto feels like <em>progress.</em>
          </h2>
          <p>
            Designed around how people actually learn, Otto clears away the
            noise so every lesson has purpose and every learner knows what’s next.
          </p>
        </section>

        <section className={styles.featureGrid} id="outcomes">
          <article className={styles.featureLarge}>
            <div className={styles.featureText}>
              <span className={styles.number}>01</span>
              <p className={styles.kicker}>FOR LEARNING TEAMS</p>
              <h3>Create learning people want to finish.</h3>
              <p>
                Build polished courses with a flexible editor that keeps the
                focus on your ideas—not the setup.
              </p>
              <a href="#demo">Explore course creation <Arrow /></a>
            </div>
            <div className={styles.courseMock}>
              <div className={styles.courseTop}>
                <span>Design systems</span><span>•••</span>
              </div>
              <div className={styles.lesson}>
                <span className={styles.lessonIcon}>✦</span>
                <div>
                  <small>MODULE 03 · LESSON 02</small>
                  <h4>Building with consistency</h4>
                  <p>Learn how shared principles turn separate decisions into one clear system.</p>
                </div>
              </div>
              <div className={styles.lessonProgress}><span /></div>
            </div>
          </article>

          <article className={styles.featureSmall}>
            <span className={styles.number}>02</span>
            <p className={styles.kicker}>FOR LEARNERS</p>
            <div className={styles.progressVisual}>
              <div className={styles.ring}><strong>74%</strong><span>complete</span></div>
              <div className={styles.miniList}>
                <span><i className={styles.blue} /> Foundation <b>8/8</b></span>
                <span><i className={styles.mint} /> Practice <b>5/7</b></span>
                <span><i className={styles.lilac} /> Mastery <b>2/6</b></span>
              </div>
            </div>
            <h3>See the next step. Feel the momentum.</h3>
            <p>Clear pathways and useful feedback keep progress visible and motivation high.</p>
          </article>

          <article className={styles.featureSmall}>
            <span className={styles.number}>03</span>
            <p className={styles.kicker}>FOR THE WHOLE BUSINESS</p>
            <div className={styles.peopleVisual}>
              <div className={styles.avatar}>AM</div>
              <div className={styles.avatar}>JD</div>
              <div className={styles.avatar}>SK</div>
              <div className={styles.avatar}>+28</div>
              <div className={styles.sparkline}>
                <svg viewBox="0 0 240 70" aria-hidden="true">
                  <path d="M4 58c28-6 36-34 63-31 24 3 31 20 54 13 30-9 32-31 61-29 20 1 31 9 54-7" />
                </svg>
              </div>
            </div>
            <h3>Turn learning into a shared advantage.</h3>
            <p>Understand what’s landing, where teams are growing, and what to teach next.</p>
          </article>
        </section>

        <section className={styles.cta} id="demo">
          <div>
            <p className={styles.sectionLabel}>READY WHEN YOU ARE</p>
            <h2>Give your team a better way to grow.</h2>
          </div>
          <a className={styles.ctaButton} href="mailto:hello@otto.app">
            Book a demo <Arrow />
          </a>
        </section>
      </main>

      <footer className={styles.footer} id="footer">
        <div className={styles.footerTop}>
          <a className={styles.logo} href="#" aria-label="Otto home"><Mark /><span>otto</span></a>
          <p>Learning, beautifully clear.</p>
          <div className={styles.footerLinks}>
            <div><b>Platform</b><a href="#product">Product</a><a href="#outcomes">Solutions</a><a href="#demo">Book a demo</a></div>
            <div><b>Company</b><a href="#about">About</a><a href="#footer">Careers</a><a href="#footer">Contact</a></div>
            <div><b>Follow</b><a href="#footer">LinkedIn</a><a href="#footer">X / Twitter</a></div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <span>© 2026 Otto Learning, Inc.</span>
          <span>Privacy · Terms</span>
          <span>Made for curious minds.</span>
        </div>
      </footer>
    </div>
  );
}

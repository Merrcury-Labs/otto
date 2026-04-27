import { Button } from "@repo/ui/button";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.welcome}>
          <h1 className={styles.welcomeTitle}>
            Welcome back to your learning journey
          </h1>
          <p className={styles.welcomeSubtitle}>
            Continue where you left off and track your progress
          </p>
        </section>

        <section className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>12</div>
            <div className={styles.statLabel}>Courses Completed</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>48h</div>
            <div className={styles.statLabel}>Learning Time</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>5</div>
            <div className={styles.statLabel}>In Progress</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>156</div>
            <div className={styles.statLabel}>Exercises Done</div>
          </div>
        </section>

        <section className={styles.cta}>
          <Button appName="web" className={styles.primaryButton}>
            Continue Learning
          </Button>
        </section>
      </main>
    </div>
  );
}

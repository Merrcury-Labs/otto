import { LearningAnalytics } from "@/components/learning-analytics";

export const metadata = {
  title: "Learning Analytics — Otto",
  description: "Track your learning progress and discover personalized recommendations",
};

export default function AnalyticsPage() {
  return (
    <div className="p-4">
      <LearningAnalytics />
    </div>
  );
}

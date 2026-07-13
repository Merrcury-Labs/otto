"""Populate the database with example flashcard decks and cards."""

from django.core.management.base import BaseCommand
from courses.models import Course
from flashcards.models import Flashcard, FlashcardDeck


class Command(BaseCommand):
    help = "Populate the database with example flashcard decks and cards"

    def handle(self, *args, **options):
        courses = list(Course.objects.all())

        if not courses:
            self.stdout.write(
                self.style.ERROR("No courses found. Create courses first.")
            )
            return

        self.stdout.write(f"Found {len(courses)} course(s)")

        # ─── Deck data ──────────────────────────────────────────────────

        decks_data = [
            {
                "title": "Statistics Fundamentals",
                "description": "Core statistical concepts including measures of central tendency, dispersion, probability, and distributions.",
                "course_name": "Intoduction To Statistics",
                "status": FlashcardDeck.PUBLISHED,
                "cards": [
                    {
                        "front": "What is the difference between mean, median, and mode?",
                        "back": "Mean is the arithmetic average (sum ÷ count). Median is the middle value when data is sorted. Mode is the most frequently occurring value. They measure central tendency differently — mean is sensitive to outliers, median is robust, and mode shows frequency.",
                        "hint": "Think about how each handles extreme values differently.",
                        "tags": ["central-tendency", "basics"],
                    },
                    {
                        "front": "What is standard deviation and what does it measure?",
                        "back": "Standard deviation measures the average distance of each data point from the mean. A low SD means data clusters tightly around the mean; a high SD means data is spread out. It's the square root of variance.",
                        "hint": "It's related to variance — how?",
                        "tags": ["dispersion", "variability"],
                    },
                    {
                        "front": "Define variance. How is it related to standard deviation?",
                        "back": "Variance is the average of the squared differences from the mean. Standard deviation is the square root of variance. Variance is in squared units, while SD is in the original units, making SD more interpretable.",
                        "hint": "One is the square of the other.",
                        "tags": ["dispersion", "variability"],
                    },
                    {
                        "front": "What is a normal distribution? Describe its key properties.",
                        "back": "A normal distribution is a symmetric, bell-shaped curve where the mean, median, and mode are equal. ~68% of data falls within 1 SD, ~95% within 2 SDs, and ~99.7% within 3 SDs of the mean (the 68-95-99.7 rule).",
                        "hint": "Remember the 68-95-99.7 rule.",
                        "tags": ["distributions", "normal"],
                    },
                    {
                        "front": "What is the difference between population and sample?",
                        "back": "A population is the entire group you want to draw conclusions about. A sample is a subset of the population that you actually observe. We use samples because studying entire populations is often impractical or impossible.",
                        "hint": "Think about scope — all vs. some.",
                        "tags": ["basics", "sampling"],
                    },
                    {
                        "front": "What is the Central Limit Theorem and why is it important?",
                        "back": "The CLT states that the sampling distribution of the sample mean approaches a normal distribution as the sample size increases, regardless of the population's shape. This lets us use normal distribution methods for inference even when the underlying data isn't normal.",
                        "hint": "It's about what happens to means as n grows large.",
                        "tags": ["sampling", "inference", "advanced"],
                    },
                    {
                        "front": "What is a p-value?",
                        "back": "A p-value is the probability of observing results at least as extreme as the actual results, assuming the null hypothesis is true. A small p-value (typically < 0.05) suggests the observed data is unlikely under the null hypothesis, leading to its rejection.",
                        "hint": "It's a probability — of what exactly?",
                        "tags": ["hypothesis-testing", "inference"],
                    },
                    {
                        "front": "What is the difference between Type I and Type II errors?",
                        "back": "Type I error (α): Rejecting a true null hypothesis (false positive). Type II error (β): Failing to reject a false null hypothesis (false negative). Reducing one typically increases the other unless you increase sample size.",
                        "hint": "One is a false alarm, the other is a missed signal.",
                        "tags": ["hypothesis-testing", "errors"],
                    },
                    {
                        "front": "What is correlation and what is its range?",
                        "back": "Correlation measures the strength and direction of a linear relationship between two variables. Pearson's r ranges from -1 (perfect negative) to +1 (perfect positive), with 0 meaning no linear relationship. Correlation does NOT imply causation.",
                        "hint": "Think about both strength and direction.",
                        "tags": ["correlation", "relationships"],
                    },
                    {
                        "front": "What is the difference between descriptive and inferential statistics?",
                        "back": "Descriptive statistics summarize and describe the features of a dataset (mean, SD, charts). Inferential statistics use sample data to make generalizations or predictions about a larger population (hypothesis tests, confidence intervals).",
                        "hint": "One describes what you have; the other draws conclusions beyond it.",
                        "tags": ["basics"],
                    },
                ],
            },
            {
                "title": "React Core Concepts",
                "description": "Essential React concepts including components, hooks, state management, and the virtual DOM.",
                "course_name": "React Fundementals",
                "status": FlashcardDeck.PUBLISHED,
                "cards": [
                    {
                        "front": "What is the Virtual DOM and how does React use it?",
                        "back": "The Virtual DOM is a lightweight JavaScript representation of the real DOM. React creates a virtual snapshot, compares it with the previous one (diffing), and then updates only the changed parts of the real DOM (reconciliation). This makes updates efficient.",
                        "hint": "Think: a blueprint that gets compared before building.",
                        "tags": ["virtual-dom", "performance"],
                    },
                    {
                        "front": "What is the difference between props and state?",
                        "back": "Props are read-only data passed from a parent to a child component (like function arguments). State is data managed within a component that can change over time (like a variable). Props flow down; state is local and mutable via setState.",
                        "hint": "One is inherited, one is owned.",
                        "tags": ["props", "state", "basics"],
                    },
                    {
                        "front": "What are React hooks? Name three commonly used ones.",
                        "back": "Hooks are functions that let you use state and lifecycle features in functional components. Three common hooks: useState (manages local state), useEffect (runs side effects after render), useRef (holds a mutable reference that persists across renders without causing re-renders).",
                        "hint": "They all start with 'use'.",
                        "tags": ["hooks", "basics"],
                    },
                    {
                        "front": "What does useEffect do and when does it run?",
                        "back": "useEffect runs side effects (data fetching, subscriptions, DOM manipulation) after the component renders. It runs after every render by default, after the first render only with an empty dependency array [], or when specific dependencies change if you list them.",
                        "hint": "Think about the dependency array controlling when it fires.",
                        "tags": ["hooks", "effects"],
                    },
                    {
                        "front": "What is JSX and how is it different from HTML?",
                        "back": "JSX is a syntax extension for JavaScript that looks like HTML but compiles to React.createElement() calls. Key differences from HTML: uses className instead of class, self-closing tags require />, style takes an object not a string, and you can embed JS expressions inside {}.",
                        "hint": "It's not actually HTML — it's JavaScript in disguise.",
                        "tags": ["jsx", "basics"],
                    },
                    {
                        "front": "What is the difference between controlled and uncontrolled components?",
                        "back": "Controlled components have their form data driven by React state — the input's value is set by state and updated via onChange. Uncontrolled components let the DOM handle the form data — you access values via refs. Controlled is the React-idiomatic approach.",
                        "hint": "Who owns the source of truth — React or the DOM?",
                        "tags": ["forms", "patterns"],
                    },
                    {
                        "front": "What is React's one-way data flow?",
                        "back": "Data in React flows downward from parent to child via props. Children cannot directly modify parent data — they call callback functions passed as props to request changes. This makes data flow predictable and easier to debug.",
                        "hint": "Think: water flowing downstream, not upstream.",
                        "tags": ["architecture", "basics"],
                    },
                    {
                        "front": "What is the purpose of the key prop in list rendering?",
                        "back": "The key prop gives React a stable identity for each list item, enabling efficient re-renders. Keys help React determine which items changed, were added, or were removed. Use a unique, stable identifier — never use the array index as a key if items can be reordered.",
                        "hint": "It's about helping React diff efficiently.",
                        "tags": ["lists", "performance"],
                    },
                ],
            },
            {
                "title": "Probability Basics",
                "description": "Fundamental probability concepts including rules, conditional probability, and Bayes' theorem.",
                "course_name": "Intoduction To Statistics",
                "status": FlashcardDeck.PUBLISHED,
                "cards": [
                    {
                        "front": "What is the addition rule of probability?",
                        "back": "P(A or B) = P(A) + P(B) − P(A and B). For mutually exclusive events, P(A and B) = 0, so it simplifies to P(A) + P(B). The subtraction avoids double-counting the overlap.",
                        "hint": "Don't double-count the intersection!",
                        "tags": ["probability", "rules"],
                    },
                    {
                        "front": "What is conditional probability?",
                        "back": "P(A|B) is the probability of A occurring given that B has already occurred. Formula: P(A|B) = P(A and B) / P(B). It restricts the sample space to only outcomes where B is true.",
                        "hint": "The '|' reads as 'given'.",
                        "tags": ["probability", "conditional"],
                    },
                    {
                        "front": "State Bayes' Theorem in simple terms.",
                        "back": "P(A|B) = P(B|A) × P(A) / P(B). It lets you update the probability of hypothesis A given new evidence B. You flip the conditional: from 'probability of evidence given hypothesis' to 'probability of hypothesis given evidence.'",
                        "hint": "It reverses the direction of conditioning.",
                        "tags": ["probability", "bayes"],
                    },
                    {
                        "front": "What is the multiplication rule of probability?",
                        "back": "P(A and B) = P(A) × P(B|A). For independent events, P(B|A) = P(B), so it simplifies to P(A) × P(B). This rule calculates the probability of both events occurring together.",
                        "hint": "It chains two probabilities together.",
                        "tags": ["probability", "rules"],
                    },
                    {
                        "front": "What does it mean for two events to be independent?",
                        "back": "Events A and B are independent if the occurrence of one does not affect the probability of the other: P(A|B) = P(A), or equivalently P(B|A) = P(B). Knowing B happened gives no information about A.",
                        "hint": "Does knowing one change your belief about the other?",
                        "tags": ["probability", "independence"],
                    },
                ],
            },
            {
                "title": "React Advanced Patterns",
                "description": "Advanced React patterns including context, reducers, memoization, and custom hooks.",
                "course_name": "React Fundementals",
                "status": FlashcardDeck.DRAFT,
                "cards": [
                    {
                        "front": "What problem does React Context solve?",
                        "back": "Context provides a way to pass data through the component tree without manually passing props at every level (prop drilling). It's useful for global data like theme, auth state, or language that many components need.",
                        "hint": "It's an alternative to prop drilling.",
                        "tags": ["context", "patterns"],
                    },
                    {
                        "front": "When should you use useReducer instead of useState?",
                        "back": "Use useReducer when state logic is complex — multiple sub-values, next state depends on the previous one, or when you want to separate state update logic from rendering. It centralizes transitions via a reducer function, making complex state predictable and testable.",
                        "hint": "Think: many moving parts vs. simple toggle.",
                        "tags": ["hooks", "state-management"],
                    },
                    {
                        "front": "What do React.memo, useMemo, and useCallback do?",
                        "back": "React.memo: prevents a component from re-rendering if its props haven't changed. useMemo: memoizes a computed value so it's not recalculated on every render. useCallback: memoizes a function reference so it stays stable across renders. All are performance optimizations.",
                        "hint": "They all prevent unnecessary work.",
                        "tags": ["performance", "memoization"],
                    },
                    {
                        "front": "What is a custom hook and how do you create one?",
                        "back": "A custom hook is a reusable function that starts with 'use' and can call other hooks. It extracts component logic into reusable functions. Example: useLocalStorage(key, initialValue) that syncs state with localStorage. Custom hooks share logic, not state.",
                        "hint": "It's a function that uses hooks, named with 'use' prefix.",
                        "tags": ["hooks", "patterns"],
                    },
                    {
                        "front": "What are React Server Components and what problem do they solve?",
                        "back": "Server Components render on the server and send HTML to the client, reducing the JavaScript bundle size. They can directly access databases and file systems. They solve the problem of shipping too much JS to the browser — data-fetching and heavy logic stay on the server.",
                        "hint": "Think: less JS shipped to the browser.",
                        "tags": ["server-components", "architecture"],
                    },
                ],
            },
        ]

        # ─── Create decks and cards ────────────────────────────────────

        created_decks = 0
        created_cards = 0

        for deck_data in decks_data:
            course_name = deck_data["course_name"]
            course = next(
                (c for c in courses if c.name == course_name),
                None,
            )

            if not course:
                self.stdout.write(
                    self.style.WARNING(
                        f"Skipping '{deck_data['title']}' — course '{course_name}' not found"
                    )
                )
                continue

            deck, deck_created = FlashcardDeck.objects.get_or_create(
                title=deck_data["title"],
                course=course,
                defaults={
                    "description": deck_data["description"],
                    "status": deck_data["status"],
                },
            )

            if not deck_created:
                self.stdout.write(
                    self.style.WARNING(f"Deck '{deck.title}' already exists, skipping")
                )
                continue

            created_decks += 1

            for i, card_data in enumerate(deck_data["cards"]):
                Flashcard.objects.create(
                    deck=deck,
                    front=card_data["front"],
                    back=card_data["back"],
                    position=i,
                    hint=card_data.get("hint", ""),
                    tags=card_data.get("tags", []),
                )
                created_cards += 1

            self.stdout.write(
                self.style.SUCCESS(
                    f"Created deck '{deck.title}' with {len(deck_data['cards'])} cards"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! Created {created_decks} decks with {created_cards} cards total."
            )
        )

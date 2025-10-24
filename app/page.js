// app/page.js  (NO "use client")
import HomeClient from "./home_client";

export const metadata = {
  title: "Decision Support System",
  description: "Answer 32 questions and get tailored evaluation metrics.",
};

export default function Page() {
  return <HomeClient />;
}

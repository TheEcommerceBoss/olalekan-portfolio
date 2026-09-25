import { lazy, Suspense } from "react";
import About from "./components/About";
import Hero from "./components/Hero";
import { Contact, Nav, Stats, Work } from "./components/Sections";
import { Cursor, Ticker } from "./components/Playful";
import FlowMap from "./components/FlowMap";

const ScrollWorld = lazy(() => import("./components/ScrollWorld"));

export default function App() {
  return (
    <>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <About />
        <Suspense fallback={<section className="world" id="approach" />}><ScrollWorld /></Suspense>
        <Ticker />
        <FlowMap />
        <Stats />
        <Work />
        <Contact />
      </main>
    </>
  );
}

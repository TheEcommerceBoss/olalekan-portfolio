import About from "./components/About";
import Hero from "./components/Hero";
import { Contact, Nav, Stats, Work } from "./components/Sections";
import { Cursor, Ticker } from "./components/Playful";
import FlowMap from "./components/FlowMap";
import Toolkit from "./components/Toolkit";

export default function App() {
  return (
    <>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <About />
        <Toolkit />
        <Ticker />
        <FlowMap />
        <Stats />
        <Work />
        <Contact />
      </main>
    </>
  );
}

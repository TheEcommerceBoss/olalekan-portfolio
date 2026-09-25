import About from "./components/About";
import Hero from "./components/Hero";
import ScrollWorld from "./components/ScrollWorld";
import { Contact, Nav, Stats, Work } from "./components/Sections";
import { Cursor, Ticker } from "./components/Playful";
import FlowMap from "./components/FlowMap";

export default function App() {
  return (
    <>
      <Cursor />
      <Nav />
      <main>
        <Hero />
        <About />
        <ScrollWorld />
        <Ticker />
        <FlowMap />
        <Stats />
        <Work />
        <Contact />
      </main>
    </>
  );
}

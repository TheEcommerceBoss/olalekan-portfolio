import About from "./components/About";
import Hero from "./components/Hero";
import ScrollWorld from "./components/ScrollWorld";
import { Contact, Nav, Stats, Work } from "./components/Sections";
import { Cursor, Ticker } from "./components/Playful";

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
        <Stats />
        <Work />
        <Contact />
      </main>
    </>
  );
}

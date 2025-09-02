import Hero from '../components/sections/Hero';
import Projects from '../components/sections/Projects';
import Sectors from '../components/sections/Sectors';
import Contact from '../components/sections/Contact';

const Home = () => {
  return (
    <>
      <Hero />
      <Sectors />
      <Projects />
      <Contact />
    </>
  );
};

export default Home;
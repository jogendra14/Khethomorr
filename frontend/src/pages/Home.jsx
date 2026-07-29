
import { useEffect, useState } from "react";
import { getHomeContent } from "../api/homeApi.js";
import Navbar from "../components/home/navbar/Navbar.jsx"
import Hero from "../components/home/hero/Hero.jsx"
import Features from "../components/home/feature/Features.jsx"
import TrendingProducts from "../components/home/trendingProducts/TrendingProducts.jsx"
import OurServices from "../components/home/ourServices/OurServices.jsx"
import Footer from "../components/home/footer/Footer.jsx"

const Home = () => {
  const [homeContent, setHomeContent] = useState(null);

  useEffect(() => {
    const loadHomeContent = async () => {
      try {
        setHomeContent(await getHomeContent());
      } catch (error) {
        console.error("Unable to load home content:", error);
      }
    };

    loadHomeContent();
  }, []);

  return (
    <>
      <div className="">
        <Navbar/>
        <Hero slides={homeContent?.heroSlides}/>
        <Features items={homeContent?.features}/>
        <TrendingProducts/>
        <OurServices
          services={homeContent?.services}
          trustFeatures={homeContent?.trustFeatures}
        />
        <Footer/>
      </div>
    </>
  )
}

export default Home

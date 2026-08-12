import Navbar from "../components/home/navbar/Navbar.jsx";
import Hero from "../components/home/hero/Hero.jsx";
import Features from "../components/home/feature/Features.jsx";
import FeatureProducts from "../components/home/trendingProducts/FeatureProducts.jsx";
import OurServices from "../components/home/ourServices/OurServices.jsx";
import Footer from "../components/home/footer/Footer.jsx";

const Home = () => {
  return (
    <>
      <div className="">
        <Navbar />
        <Hero/>
        <Features/>
        <FeatureProducts/>
        <OurServices/>
        <Footer />
      </div>
    </>
  );
};

export default Home;
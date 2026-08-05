import { useQuery } from "@tanstack/react-query";
import { getHomeContent } from "../api/homeApi.js";
import Navbar from "../components/home/navbar/Navbar.jsx";
import Hero from "../components/home/hero/Hero.jsx";
import Features from "../components/home/feature/Features.jsx";
import TrendingProducts from "../components/home/trendingProducts/TrendingProducts.jsx";
import OurServices from "../components/home/ourServices/OurServices.jsx";
import Footer from "../components/home/footer/Footer.jsx";
import toast from "react-hot-toast";

const Home = () => {
  // ✅ React Query - Fetch Home Content
  const {
    data: homeContent,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['homeContent'],
    queryFn: getHomeContent,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    onError: (error) => {
      console.error("Unable to load home content:", error);
      toast.error("Failed to load home content");
    },
  });

  // ✅ Loading State
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen">
          {/* Hero Skeleton */}
          <div className="w-full h-[400px] md:h-[500px] bg-gray-200 animate-pulse"></div>
          
          {/* Features Skeleton */}
          <div className="max-w-7xl mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-200 h-24 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Trending Products Skeleton */}
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ✅ Error State
  if (isError) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center py-20 px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-500 mb-6 max-w-md">
              {error?.message || "Unable to load home content. Please try again."}
            </p>
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="">
        <Navbar />
        <Hero slides={homeContent?.heroSlides} />
        <Features items={homeContent?.features} />
        <TrendingProducts />
        <OurServices
          services={homeContent?.services}
          trustFeatures={homeContent?.trustFeatures}
        />
        <Footer />
      </div>
    </>
  );
};

export default Home;
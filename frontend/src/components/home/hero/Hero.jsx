import { FaCheckCircle } from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination} from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import hero1 from "../../../assets/hero/hero1.jpg";
import hero2 from "../../../assets/hero/hero2.jpg";
import hero3 from "../../../assets/hero/hero3.jpeg";
import hero4 from "../../../assets/hero/hero4.jpeg";
import hero5 from "../../../assets/hero/hero5.jpeg";

const defaultSlides = [
  {
    image: hero1,
    imageKey: "hero1",
    title: "Brighter Living,",
    highlight: "Better Every Day",
    desc: "Premium lighting, home appliances & expert services — all at the best prices.",
  },
  {
    image: hero2,
    imageKey: "hero2",
    title: "Modern",
    highlight: "Lighting Collection",
    desc: "Elegant chandeliers, ceiling lights & wall lights for every room.",
  },
  {
    image: hero3,
    imageKey: "hero3",
    title: "Premium",
    highlight: "Home Appliances",
    desc: "Top brands with amazing offers and fast delivery.",
  },
  {
    image: hero4,
    imageKey: "hero4",
    title: "Decorate Your",
    highlight: "Dream Home",
    desc: "Beautiful home décor products for every style.",
  },
  {
    image: hero5,
    imageKey: "hero5",
    title: "Best Quality",
    highlight: "Electrical Products",
    desc: "Safe, durable and affordable electrical solutions.",
  },
];

const heroImages = { hero1, hero2, hero3, hero4, hero5 };

export default function Hero({ slides }) {
  const displaySlides = slides?.length
    ? slides.map((slide, index) => ({
        ...defaultSlides[index % defaultSlides.length],
        ...slide,
        image: heroImages[slide.imageKey] || defaultSlides[index % defaultSlides.length].image,
      }))
    : defaultSlides;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-6 ">

      <Swiper
        modules={[Autoplay, Pagination]}
        loop={true}
        speed={900}
        grabCursor={true}
        autoplay={{
          delay: 3500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        className="rounded-3xl"
      >
        {displaySlides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="bg-[#F8F4EF] rounded-3xl overflow-hidden">

              <div className="flex flex-col lg:flex-row items-center justify-between p-8 lg:p-14">

                {/* Left */}
                <div className="lg:w-1/2">

                  <p className="uppercase text-red-600 font-semibold text-sm">
                    Transform Your Space
                  </p>

                  <h1 className="text-4xl lg:text-6xl font-bold leading-tight mt-3">
                    {slide.title}
                    <br />
                    <span className="text-red-600">
                      {slide.highlight}
                    </span>
                  </h1>

                  <p className="text-gray-600 mt-5 text-lg">
                    {slide.description || slide.desc}
                  </p>

                  <div className="flex gap-4 mt-8 flex-wrap">

                    <button className="bg-red-600 hover:bg-red-700 text-white px-7 py-3 rounded-xl transition">
                      Shop Now
                    </button>

                    <button className="border-2 border-gray-300 hover:border-red-600 px-7 py-3 rounded-xl transition">
                      Explore Services
                    </button>

                  </div>

                  <div className="flex flex-wrap gap-6 mt-8">

                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-red-600" />
                      <span>100% Original Brands</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-red-600" />
                      <span>Best Price</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="text-red-600" />
                      <span>Fast Delivery</span>
                    </div>

                  </div>

                </div>

                {/* Right */}

                <div className=" relative lg:w-1/2 mt-10 lg:mt-0">

                  <img
                    src={slide.image}
                    alt=""
                    className="rounded-2xl w-full h-90 md:h-105 object-cover"
                  />
                </div>

              </div>

            </div>
          </SwiperSlide>
        ))}
      </Swiper>

    </section>
  );
}

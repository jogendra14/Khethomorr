import {
  FaBoxOpen,
  FaArrowRight,
  FaMedal,
  FaWallet,
  FaShippingFast,
  FaUsers,
  FaHeadset,
} from "react-icons/fa";

import interior from "../../../assets/interiorDesign.jpg";
import installation from "../../../assets/installation.jpeg";
import electrician from "../../../assets/electrician.jpeg";
import architecture from "../../../assets/architecture.jpg";

const defaultServices = [
  {
    title: "Interior Design",
    description: "Get professional designs for your dream space.",
    imageKey: "interior",
  },
  {
    title: "Installation Service",
    description: "Expert installation for lights, fans & more.",
    imageKey: "installation",
  },
  {
    title: "Electrician Service",
    description: "Verified electricians at your service.",
    imageKey: "electrician",
  },
  {
    title: "Architecture Design",
    description: "Modern & functional architecture solutions.",
    imageKey: "architecture",
  },
];

const defaultTrustFeatures = [
  {
    iconKey: "box",
    title: "Wide Range",
    subtitle: "5000+ Products",
  },
  {
    iconKey: "medal",
    title: "Top Brands",
    subtitle: "100% Original",
  },
  {
    iconKey: "wallet",
    title: "Secure Payments",
    subtitle: "Multiple Options",
  },
  {
    iconKey: "shipping",
    title: "Fast Delivery",
    subtitle: "Across India",
  },
  {
    iconKey: "users",
    title: "Trusted by 50K+",
    subtitle: "Happy Customers",
  },
  {
    iconKey: "support",
    title: "5 Star Support",
    subtitle: "Always Here for You",
  },
];

const serviceImages = { interior, installation, electrician, architecture };
const trustIcons = {
  box: FaBoxOpen,
  medal: FaMedal,
  wallet: FaWallet,
  shipping: FaShippingFast,
  users: FaUsers,
  support: FaHeadset,
};

export default function OurServices({ services: servicesFromApi, trustFeatures: trustFeaturesFromApi }) {
  const services = (servicesFromApi?.length ? servicesFromApi : defaultServices).map((service, index) => ({
    ...service,
    image: serviceImages[service.imageKey] || defaultServices[index % defaultServices.length].image,
  }));
  const features = (trustFeaturesFromApi?.length ? trustFeaturesFromApi : defaultTrustFeatures).map((item) => ({
    ...item,
    Icon: trustIcons[item.iconKey] || FaBoxOpen,
  }));

  return (
    <>
      {/* OUR SERVICES */}
      <section className="max-w-7xl mx-auto mt-6 px-3 sm:px-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 uppercase">
          OUR SERVICES
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow hover:shadow-lg transition duration-300 overflow-hidden flex"
            >
              {/* Image */}
              <div className="w-2/5">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-40 sm:h-full object-cover"
                />
              </div>

              {/* Content */}
              <div className="w-3/5 p-3 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {service.title}
                  </h3>

                  <p className="text-gray-500 text-xs sm:text-sm mt-2">
                    {service.description}
                  </p>
                </div>

                <button className="mt-4 flex items-center gap-2 text-red-600 font-semibold text-xs sm:text-sm hover:gap-3 transition-all">
                  BOOK NOW
                  <FaArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto py-6 px-3 sm:px-4">
        <div className="bg-[#111111] rounded-2xl border border-gray-700 overflow-hidden">

          {/* Heading */}
          <div className="px-5 sm:px-6 pt-5">
            <h2 className="text-white text-lg sm:text-xl font-bold uppercase">
              WHY CHOOSE <span className="text-red-600">KETHOMORR?</span>
            </h2>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y-0 lg:divide-x divide-gray-700">

            {features.map((item, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center justify-center gap-3 p-5 text-center sm:text-left"
              >
                <div className="text-red-600 text-2xl sm:text-3xl">
                  <item.Icon />
                </div>

                <div>
                  <h3 className="text-white font-semibold text-sm">
                    {item.title}
                  </h3>

                  <p className="text-gray-400 text-xs">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>
    </>
  );
}

import {
  FaBoxOpen,
  FaTags,
  FaTruck,
  FaCreditCard,
  FaHeadset,
} from "react-icons/fa";

const defaultFeatures = [
  {
    iconKey: "box",
    title: "Wide Range",
    subtitle: "10,000+ Products",
  },
  {
    iconKey: "tag",
    title: "Top Brands",
    subtitle: "Trusted Quality",
  },
  {
    iconKey: "card",
    title: "Secure Payment",
    subtitle: "100% Safe Checkout",
  },
  {
    iconKey: "truck",
    title: "Fast Delivery",
    subtitle: "Across India",
  },
  {
    iconKey: "support",
    title: "24/7 Support",
    subtitle: "Always Available",
  },
];

const featureIcons = {
  box: FaBoxOpen,
  tag: FaTags,
  card: FaCreditCard,
  truck: FaTruck,
  support: FaHeadset,
};

const Features = ({ items }) => {
  const features = (items?.length ? items : defaultFeatures).map((item) => ({
    ...item,
    Icon: featureIcons[item.iconKey] || FaBoxOpen,
  }));

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-5">

        {features.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border p-6 text-center group"
          >
            <div className="flex justify-center text-red-600 mb-4 group-hover:scale-110 transition">
              <item.Icon size={28} />
            </div>

            <h3 className="font-semibold text-lg">
              {item.title}
            </h3>

            <p className="text-gray-500 text-sm mt-1">
              {item.subtitle}
            </p>
          </div>
        ))}

      </div>
    </section>
  );
};

export default Features;

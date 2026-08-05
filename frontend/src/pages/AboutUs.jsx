import { Lightbulb, Award, Users, Truck, ShieldCheck, Target } from "lucide-react";
import Navbar from "../components/home/navbar/Navbar";
import Footer from "../components/home/footer/Footer";

export default function AboutUs() {
  const features = [
    {
      icon: <Lightbulb size={40} />,
      title: "Premium Lighting",
      desc: "Modern and stylish lighting products for every space.",
    },
    {
      icon: <Truck size={40} />,
      title: "Fast Delivery",
      desc: "Safe and quick delivery across India.",
    },
    {
      icon: <ShieldCheck size={40} />,
      title: "Trusted Quality",
      desc: "High-quality products with warranty support.",
    },
    {
      icon: <Award size={40} />,
      title: "Best Service",
      desc: "Customer satisfaction is our top priority.",
    },
  ];

  return (
    <>
      <Navbar />

      <div className="bg-white">
        {/* Hero */}
        <section className="bg-red-600 text-white py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold">About KHETHOMORR</h1>

            <p className="mt-5 max-w-3xl mx-auto text-lg">
              We bring elegant lighting solutions that transform homes, offices, and commercial spaces with style, quality, and innovation.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="max-w-7xl mx-auto py-16 px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?w=900" alt="Lighting" className="rounded-xl shadow-lg w-full" />
            </div>

            <div>
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>

              <p className="text-gray-600 mb-4 leading-7">
                KHETHOMORR was founded with one simple vision—to make premium lighting affordable, stylish, and accessible.
              </p>

              <p className="text-gray-600 mb-4 leading-7">
                From elegant chandeliers to modern ceiling lights, decorative lamps, and smart lighting, we offer carefully selected products designed for every
                lifestyle.
              </p>

              <p className="text-gray-600 leading-7">
                Our mission is to brighten every home with innovation, quality craftsmanship, and exceptional customer service.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Vision */}

        <section className="bg-gray-100 py-16 px-6">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10">
            <div className="bg-white rounded-xl shadow p-8">
              <Target className="text-red-600 mb-5" size={45} />

              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>

              <p className="text-gray-600">To provide stylish, energy-efficient, and affordable lighting products backed by excellent customer service.</p>
            </div>

            <div className="bg-white rounded-xl shadow p-8">
              <Users className="text-red-600 mb-5" size={45} />

              <h3 className="text-2xl font-bold mb-4">Our Vision</h3>

              <p className="text-gray-600">To become India's most trusted online destination for premium lighting and home décor solutions.</p>
            </div>
          </div>
        </section>

        {/* Features */}

        <section className="max-w-7xl mx-auto py-16 px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((item, index) => (
              <div key={index} className="border rounded-xl p-8 text-center hover:shadow-lg transition">
                <div className="flex justify-center text-red-600 mb-5">{item.icon}</div>

                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>

                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}

        <section className="bg-red-600 text-white py-16">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 text-center gap-8">
            <div>
              <h2 className="text-4xl font-bold">5000+</h2>
              <p>Happy Customers</p>
            </div>

            <div>
              <h2 className="text-4xl font-bold">1000+</h2>
              <p>Products</p>
            </div>

            <div>
              <h2 className="text-4xl font-bold">50+</h2>
              <p>Brands</p>
            </div>

            <div>
              <h2 className="text-4xl font-bold">24/7</h2>
              <p>Support</p>
            </div>
          </div>
        </section>

        {/* CTA */}

        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-5">Let's Brighten Your Home Together</h2>

            <p className="text-gray-600 mb-8">Explore our premium lighting collection and experience quality, elegance, and modern design.</p>

            <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition">Shop Now</button>
          </div>
        </section>
      </div>
      <Footer/>
    </>
  );
}

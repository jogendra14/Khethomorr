import { Wrench, Lightbulb, Truck, ShieldCheck, Clock, Headphones } from "lucide-react";
import Navbar from "../components/home/navbar/Navbar";
export default function Services() {
  const services = [
    {
      icon: <Lightbulb size={40} />,
      title: "Lighting Consultation",
      desc: "Expert guidance to help you choose the perfect lighting for every room.",
    },
    {
      icon: <Wrench size={40} />,
      title: "Installation Service",
      desc: "Professional installation by trained electricians with complete safety.",
    },
    {
      icon: <Truck size={40} />,
      title: "Fast Delivery",
      desc: "Quick and secure delivery across India with real-time tracking.",
    },
  ];

  const whyChoose = [
    {
      icon: <ShieldCheck size={35} />,
      title: "Premium Quality",
      desc: "Certified products with long-lasting performance.",
    },
    {
      icon: <Clock size={35} />,
      title: "On-Time Service",
      desc: "We value your time and deliver quickly.",
    },
    {
      icon: <Headphones size={35} />,
      title: "24/7 Support",
      desc: "Our team is always available to help you.",
    },
  ];

  return (
    <>
      <Navbar />
      <div className="bg-white">
        {/* Hero */}
        <section className="bg-red-600 text-white py-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold">Our Services</h1>

            <p className="mt-5 text-lg max-w-2xl mx-auto">
              We provide complete lighting solutions from consultation to installation, ensuring your home shines beautifully.
            </p>
          </div>
        </section>

        {/* Services */}
        <section className="max-w-7xl mx-auto py-16 px-6">
          <h2 className="text-3xl font-bold text-center mb-12">What We Offer</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {services.map((item, index) => (
              <div key={index} className="border rounded-xl p-8 hover:shadow-xl transition duration-300 text-center">
                <div className="text-red-600 flex justify-center mb-5">{item.icon}</div>

                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>

                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-gray-100 py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {whyChoose.map((item, index) => (
                <div key={index} className="bg-white rounded-xl shadow p-8 text-center">
                  <div className="text-red-600 flex justify-center mb-5">{item.icon}</div>

                  <h3 className="text-xl font-semibold mb-3">{item.title}</h3>

                  <p className="text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="max-w-7xl mx-auto py-16 px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Working Process</h2>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">1</div>

              <h3 className="mt-5 font-semibold">Consultation</h3>
            </div>

            <div>
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">2</div>

              <h3 className="mt-5 font-semibold">Product Selection</h3>
            </div>

            <div>
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">3</div>

              <h3 className="mt-5 font-semibold">Installation</h3>
            </div>

            <div>
              <div className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center mx-auto text-2xl font-bold">4</div>

              <h3 className="mt-5 font-semibold">Support</h3>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-black text-white py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold">Ready To Brighten Your Space?</h2>

            <p className="mt-5 text-gray-300">Contact our experts today and get the best lighting solution for your home or office.</p>

            <button className="mt-8 bg-red-600 hover:bg-red-700 px-8 py-3 rounded-lg font-semibold transition">Contact Us</button>
          </div>
        </section>
      </div>
    </>
  );
}

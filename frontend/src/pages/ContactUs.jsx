import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Navbar from "../components/home/navbar/Navbar";
import Footer from "../components/home/footer/Footer";
export default function ContactUs() {
  return (
    <>
      <Navbar />
      <div className="bg-white">
        {/* Hero */}
        <section className="bg-red-600 text-white py-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold">Contact Us</h1>

            <p className="mt-5 text-lg max-w-2xl mx-auto">We'd love to hear from you. Reach out for product enquiries, support, or business partnerships.</p>
          </div>
        </section>

        {/* Contact Cards */}

        <section className="max-w-7xl mx-auto py-16 px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition">
              <Phone className="mx-auto text-red-600 mb-4" size={38} />
              <h3 className="font-bold text-lg">Call Us</h3>
              <p className="text-gray-600 mt-2">+91 9079659815,<br/>+91 7232841690</p>
            </div>

            <div className="border rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition">
              <Mail className="mx-auto text-red-600 mb-4" size={38} />
              <h3 className="font-bold text-lg">Email</h3>
              <p className="text-gray-600 mt-2">support@khethomorr.com</p>
            </div>

            <div className="border rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition">
              <MapPin className="mx-auto text-red-600 mb-4" size={38} />
              <h3 className="font-bold text-lg">Address</h3>
              <p className="text-gray-600 mt-2">BVK lyenger Rd, Basettypet, Huriopet, Chickpet, Bengaluru, Karnataka 560053, India</p>
            </div>

            <div className="border rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition">
              <Clock className="mx-auto text-red-600 mb-4" size={38} />
              <h3 className="font-bold text-lg">Working Hours</h3>
              <p className="text-gray-600 mt-2">
                Mon - Sat <br />
                9:00 AM - 7:00 PM
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form */}

        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}

            <div>
              <h2 className="text-3xl font-bold mb-6">Send a Message</h2>

              <form className="space-y-5">
                <input type="text" placeholder="Your Name" className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500" />

                <input type="email" placeholder="Email Address" className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500" />

                <input type="text" placeholder="Subject" className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500" />

                <textarea
                  rows="6"
                  placeholder="Write your message..."
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                ></textarea>

                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg transition">Send Message</button>
              </form>
            </div>

            {/* Map */}

            <div>
              <h2 className="text-3xl font-bold mb-6">Our Location</h2>

              <iframe
                title="Google Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.033665436092!2d77.57305077373181!3d12.969697614922723!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae160ecd422e53%3A0x4253ddc05308ec55!2sBVK%20Iyengar%20Rd%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1785349219317!5m2!1sen!2sin"
                className="w-full h-112.5 rounded-xl border"
                loading="lazy"
              ></iframe>
            </div>
          </div>
        </section>

        {/* FAQ */}

        <section className="bg-white py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>

            <div className="space-y-5">
              <div className="bg-white p-5 rounded-lg shadow">
                <h3 className="font-semibold">Do you deliver across India?</h3>
                <p className="text-gray-600 mt-2">Yes, we provide fast and secure delivery across India.</p>
              </div>

              <div className="bg-white p-5 rounded-lg shadow">
                <h3 className="font-semibold">Do your products come with warranty?</h3>
                <p className="text-gray-600 mt-2">Yes, most of our products include manufacturer warranty.</p>
              </div>

              <div className="bg-white p-5 rounded-lg shadow">
                <h3 className="font-semibold">Can I return a product?</h3>
                <p className="text-gray-600 mt-2">Yes, returns are accepted according to our return policy.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer/>
    </>
  );
}

import { FaStar} from "react-icons/fa";

export default function ReviewSection() {
  const ratingData = [
    { star: 5, value: 90 },
    { star: 4, value: 70 },
    { star: 3, value: 35 },
    { star: 2, value: 15 },
    { star: 1, value: 5 },
  ];

  return (
    <section className="py-0">
      <h2 className="text-2xl font-bold mb-1">Customer Reviews</h2>

      <div className="grid lg:grid-cols-2 gap-12">

        {/* Left */}
        <div>
          <h1 className="text-3xl font-bold">4.7</h1>

          <div className="flex text-yellow-400 text-xl mt-1">
            {[1, 2, 3, 4, 5].map((item) => (
              <FaStar key={item} />
            ))}
          </div>

          <p className="text-gray-500 mt-1">Based on 128 Reviews</p>

          <div className="mt-3 space-y-1">
            {ratingData.map((item) => (
              <div key={item.star} className="flex items-center gap-4">
                <span className="w-4">{item.star}</span>

                <FaStar className="text-yellow-400" />

                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full bg-green-700"
                    style={{
                      width: `${item.value}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right */}

        <div>
          <div className="border rounded-2xl p-3 shadow-sm">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold text-lg">Sarah Johnson</h3>

                <p className="text-gray-500 text-sm">Verified Buyer</p>
              </div>

              <span className="text-gray-400">2 Days Ago</span>
            </div>

            <div className="flex text-yellow-400 mt-3">
              {[1, 2, 3, 4, 5].map((item) => (
                <FaStar key={item} />
              ))}
            </div>

            <p className="text-gray-600 leading-7 mt-1">
              Absolutely love this jacket. Perfect fit, lightweight and keeps me dry during unexpected rain. Quality feels premium and the color looks exactly
              like the pictures.
            </p>
          </div>

          {/* Slider Buttons */}


        </div>
      </div>
    </section>
  );
}

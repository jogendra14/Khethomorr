const ShowDeals = ({product}) => {
  return (
    <div class>
     <section className="bg-zink-100 py-4 max-w-7xl mx-auto">
      <div className="">
          <div key={product.id} className="group cursor-pointer">
              {/* Image */}
              <div className="relative  rounded-2xl">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-70 object-cover rounded-2xl"
                />
                {/* AD Badge */}
                <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
                  AD
                </span>

                {/* Logo */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white px-6 py-2 rounded-t-lg">
                  <span className="text-3xl font-bold text-red-600">
                    {product.brand}
                  </span>
                </div>
              </div>

              {/* Text */}
              <div className="text-center mt-2">
                <h3 className="text-2xl font-bold">
                  {product.price}
                </h3>

                <p className="text-gray-600 text-lg">
                  {product.title}
                </p>
              </div>
          </div>
      </div>
    </section>
    </div>
  )
}

export default ShowDeals

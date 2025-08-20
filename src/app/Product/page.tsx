import React from "react";

const products = [
  {
    id: 1,
    title: "Nordic Chair",
    price: "$50.00",
    image: "/assets/images/product-3.png",
  },
  {
    id: 2,
    title: "Nordic Chair",
    price: "$50.00",
    image: "/assets/images/product-1.png",
  },
  {
    id: 3,
    title: "Kruzo Aero Chair",
    price: "$78.00",
    image: "/assets/images/product-2.png",
  },
  {
    id: 4,
    title: "Ergonomic Chair",
    price: "$43.00",
    image: "/assets/images/product-3.png",
  },
  {
    id: 5,
    title: "Nordic Chair",
    price: "$50.00",
    image: "/assets/images/product-3.png",
  },
  {
    id: 6,
    title: "Nordic Chair",
    price: "$50.00",
    image: "/assets/images/product-1.png",
  },
  {
    id: 7,
    title: "Kruzo Aero Chair",
    price: "$78.00",
    image: "/assets/images/product-2.png",
  },
  {
    id: 8,
    title: "Ergonomic Chair",
    price: "$43.00",
    image: "/assets/images/product-3.png",
  },
];

function ProductPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-lg-5">
              <div className="intro-excerpt">
                <h1>Shop</h1>
              </div>
            </div>
            <div className="col-lg-7"></div>
          </div>
        </div>
      </section>

      {/* Product Section */}
      <section className="untree_co-section product-section before-footer-section">
        <div className="container">
          <div className="row">
            {products.map((product) => (
              <div
                key={product.id}
                className="col-12 col-md-4 col-lg-3 mb-5"
              >
                <a className="product-item" href="#">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="img-fluid product-thumbnail"
                  />
                  <h3 className="product-title">{product.title}</h3>
                  <strong className="product-price">{product.price}</strong>
                  <span className="icon-cross">
                    <img
                      src="/assets/images/cross.svg"
                      alt="add"
                      className="img-fluid"
                    />
                  </span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProductPage;

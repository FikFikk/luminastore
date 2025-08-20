"use client";

import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* Start Hero Section */}
      <div className="hero">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-lg-5">
              <div className="intro-excerpt">
                <h1>
                  Modern Interior <span className="d-block">Design Studio</span>
                </h1>
                <p className="mb-4">
                  Donec vitae odio quis nisl dapibus malesuada. Nullam ac aliquet
                  velit. Aliquam vulputate velit imperdiet dolor tempor tristique.
                </p>
                <p>
                  <a href="/shop" className="btn btn-secondary me-2">
                    Shop Now
                  </a>
                  <a href="#" className="btn btn-white-outline">
                    Explore
                  </a>
                </p>
              </div>
            </div>
            <div className="col-lg-7">
              <div className="hero-img-wrap">
                <Image
                  src="/assets/images/couch.png"
                  alt="Hero Couch"
                  className="img-fluid"
                  width={700}
                  height={500}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Hero Section */}

      {/* Start Product Section */}
      <div className="product-section">
        <div className="container">
          <div className="row">
            {/* Column 1 */}
            <div className="col-md-12 col-lg-3 mb-5 mb-lg-0">
              <h2 className="mb-4 section-title">
                Crafted with excellent material.
              </h2>
              <p className="mb-4">
                Donec vitae odio quis nisl dapibus malesuada. Nullam ac aliquet
                velit. Aliquam vulputate velit imperdiet dolor tempor tristique.
              </p>
              <p>
                <a href="/shop" className="btn">
                  Explore
                </a>
              </p>
            </div>

            {/* Products */}
            {[
              { img: "product-1.png", title: "Nordic Chair", price: "$50.00" },
              { img: "product-2.png", title: "Kruzo Aero Chair", price: "$78.00" },
              { img: "product-3.png", title: "Ergonomic Chair", price: "$43.00" },
            ].map((p, i) => (
              <div key={i} className="col-12 col-md-4 col-lg-3 mb-5 mb-md-0">
                <a className="product-item" href="/cart">
                  <Image
                    src={`/assets/images/${p.img}`}
                    alt={p.title}
                    width={300}
                    height={300}
                    className="img-fluid product-thumbnail"
                  />
                  <h3 className="product-title">{p.title}</h3>
                  <strong className="product-price">{p.price}</strong>
                  <span className="icon-cross">
                    <Image
                      src="/assets/images/cross.svg"
                      alt="Add"
                      width={20}
                      height={20}
                      className="img-fluid"
                    />
                  </span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* End Product Section */}

      {/* Start Why Choose Us */}
      <div className="why-choose-section">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-lg-6">
              <h2 className="section-title">Why Choose Us</h2>
              <p>
                Donec vitae odio quis nisl dapibus malesuada. Nullam ac aliquet
                velit. Aliquam vulputate velit imperdiet dolor tempor tristique.
              </p>

              <div className="row my-5">
                {[
                  { icon: "truck.svg", title: "Fast & Free Shipping" },
                  { icon: "bag.svg", title: "Easy to Shop" },
                  { icon: "support.svg", title: "24/7 Support" },
                  { icon: "return.svg", title: "Hassle Free Returns" },
                ].map((f, i) => (
                  <div key={i} className="col-6 col-md-6">
                    <div className="feature">
                      <div className="icon">
                        <Image
                          src={`/assets/images/${f.icon}`}
                          alt={f.title}
                          width={40}
                          height={40}
                          className="img-fluid"
                        />
                      </div>
                      <h3>{f.title}</h3>
                      <p>
                        Donec vitae odio quis nisl dapibus malesuada. Nullam ac
                        aliquet velit.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-lg-5">
              <div className="img-wrap">
                <Image
                  src="/assets/images/why-choose-us-img.jpg"
                  alt="Why Choose Us"
                  className="img-fluid"
                  width={500}
                  height={400}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Why Choose Us */}

      {/* Start We Help Section */}
      <div className="we-help-section">
        <div className="container">
          <div className="row justify-content-between">
            <div className="col-lg-7 mb-5 mb-lg-0">
              <div className="imgs-grid">
                <div className="grid grid-1">
                  <Image
                    src="/assets/images/img-grid-1.jpg"
                    alt="Grid1"
                    width={250}
                    height={250}
                  />
                </div>
                <div className="grid grid-2">
                  <Image
                    src="/assets/images/img-grid-2.jpg"
                    alt="Grid2"
                    width={250}
                    height={250}
                  />
                </div>
                <div className="grid grid-3">
                  <Image
                    src="/assets/images/img-grid-3.jpg"
                    alt="Grid3"
                    width={250}
                    height={250}
                  />
                </div>
              </div>
            </div>
            <div className="col-lg-5 ps-lg-5">
              <h2 className="section-title mb-4">
                We Help You Make Modern Interior Design
              </h2>
              <p>
                Donec facilisis quam ut purus rutrum lobortis. Donec vitae odio
                quis nisl dapibus malesuada. Nullam ac aliquet velit. Pellentesque
                habitant morbi tristique senectus.
              </p>
              <ul className="list-unstyled custom-list my-4">
                <li>Donec vitae odio quis nisl dapibus malesuada</li>
                <li>Nullam ac aliquet velit</li>
                <li>Aliquam vulputate velit</li>
                <li>Pellentesque habitant morbi tristique</li>
              </ul>
              <p>
                <a href="#" className="btn">
                  Explore
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* End We Help Section */}

      {/* Start Popular Product */}
      <div className="popular-product">
        <div className="container">
          <div className="row">
            {["product-1.png", "product-2.png", "product-3.png"].map((p, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-4 mb-4 mb-lg-0">
                <div className="product-item-sm d-flex">
                  <div className="thumbnail">
                    <Image
                      src={`/assets/images/${p}`}
                      alt={`Product ${i}`}
                      width={100}
                      height={100}
                      className="img-fluid"
                    />
                  </div>
                  <div className="pt-3">
                    <h3>{i === 0 ? "Nordic Chair" : i === 1 ? "Kruzo Aero Chair" : "Ergonomic Chair"}</h3>
                    <p>Donec facilisis quam ut purus rutrum lobortis.</p>
                    <p>
                      <a href="#">Read More</a>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* End Popular Product */}

      {/* Start Testimonial */}
      <div className="testimonial-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-7 mx-auto text-center">
              <h2 className="section-title">Testimonials</h2>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-lg-12">
              <div className="testimonial-slider-wrap text-center">
                <div className="testimonial-slider">
                  {[1, 2, 3].map((t) => (
                    <div key={t} className="item">
                      <div className="row justify-content-center">
                        <div className="col-lg-8 mx-auto">
                          <div className="testimonial-block text-center">
                            <blockquote className="mb-5">
                              <p>
                                &ldquo;Donec facilisis quam ut purus rutrum lobortis.
                                Donec vitae odio quis nisl dapibus malesuada.&rdquo;
                              </p>
                            </blockquote>
                            <div className="author-info">
                              <div className="author-pic">
                                <Image
                                  src="/assets/images/person-1.png"
                                  alt="Author"
                                  width={60}
                                  height={60}
                                  className="img-fluid"
                                />
                              </div>
                              <h3 className="font-weight-bold">Maria Jones</h3>
                              <span className="position d-block mb-3">
                                CEO, Co-Founder, XYZ Inc.
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Testimonial */}

      {/* Start Blog Section */}
      <div className="blog-section">
        <div className="container">
          <div className="row mb-5">
            <div className="col-md-6">
              <h2 className="section-title">Recent Blog</h2>
            </div>
            <div className="col-md-6 text-start text-md-end">
              <a href="#" className="more">
                View All Posts
              </a>
            </div>
          </div>

          <div className="row">
            {["post-1.jpg", "post-2.jpg", "post-3.jpg"].map((p, i) => (
              <div key={i} className="col-12 col-sm-6 col-md-4 mb-4 mb-md-0">
                <div className="post-entry">
                  <a href="#" className="post-thumbnail">
                    <Image
                      src={`/assets/images/${p}`}
                      alt={`Post ${i}`}
                      width={350}
                      height={200}
                      className="img-fluid"
                    />
                  </a>
                  <div className="post-content-entry">
                    <h3>
                      <a href="#">
                        {i === 0
                          ? "First Time Home Owner Ideas"
                          : i === 1
                          ? "How To Keep Your Furniture Clean"
                          : "Small Space Furniture Apartment Ideas"}
                      </a>
                    </h3>
                    <div className="meta">
                      <span>
                        by <a href="#">Kristin Watson</a>
                      </span>{" "}
                      <span>
                        on <a href="#">Dec {19 - i * 4}, 2021</a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* End Blog Section */}
      </>
  );
}

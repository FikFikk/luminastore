"use client";

import Image from "next/image";

export default function Footer({showHeader = true} : {showHeader?: boolean}) {
  return (
    <footer className="footer-section bg-light pt-5"
    style={{display: !showHeader ? "none" : ""}}
    >
      <div className="container relative">

        {/* Sofa image */}
        <div className="sofa-img mb-4">
          <Image
            src="/assets/images/sofa.png"
            alt="Sofa"
            width={300}
            height={200}
            className="img-fluid"
          />
        </div>

        {/* Newsletter */}
        <div className="row">
          <div className="col-lg-8">
            <div className="subscription-form mb-5">
              <h3 className="d-flex align-items-center">
                <span className="me-2">
                  <Image
                    src="/assets/images/envelope-outline.svg"
                    alt="Envelope"
                    width={24}
                    height={24}
                  />
                </span>
                <span>Subscribe to Newsletter</span>
              </h3>

              <form className="row g-3">
                <div className="col-auto">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="col-auto">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                  />
                </div>
                <div className="col-auto">
                  <button className="btn btn-primary">
                    <span className="fa fa-paper-plane"></span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Footer main */}
        <div className="row g-5 mb-5">
          <div className="col-lg-4">
            <div className="mb-4 footer-logo-wrap">
              <a href="#" className="footer-logo">
                Furni<span>.</span>
              </a>
            </div>
            <p className="mb-4">
              Donec facilisis quam ut purus rutrum lobortis. Donec vitae odio
              quis nisl dapibus malesuada. Nullam ac aliquet velit.
            </p>

            <ul className="list-unstyled custom-social d-flex gap-3">
              <li>
                <a href="#"><span className="fa fa-facebook-f"></span></a>
              </li>
              <li>
                <a href="#"><span className="fa fa-twitter"></span></a>
              </li>
              <li>
                <a href="#"><span className="fa fa-instagram"></span></a>
              </li>
              <li>
                <a href="#"><span className="fa fa-linkedin"></span></a>
              </li>
            </ul>
          </div>

          {/* Links */}
          <div className="col-lg-8">
            <div className="row links-wrap">
              <div className="col-6 col-sm-6 col-md-3">
                <ul className="list-unstyled">
                  <li><a href="#">About us</a></li>
                  <li><a href="#">Services</a></li>
                  <li><a href="#">Blog</a></li>
                  <li><a href="#">Contact us</a></li>
                </ul>
              </div>

              <div className="col-6 col-sm-6 col-md-3">
                <ul className="list-unstyled">
                  <li><a href="#">Support</a></li>
                  <li><a href="#">Knowledge base</a></li>
                  <li><a href="#">Live chat</a></li>
                </ul>
              </div>

              <div className="col-6 col-sm-6 col-md-3">
                <ul className="list-unstyled">
                  <li><a href="#">Jobs</a></li>
                  <li><a href="#">Our team</a></li>
                  <li><a href="#">Leadership</a></li>
                  <li><a href="#">Privacy Policy</a></li>
                </ul>
              </div>

              <div className="col-6 col-sm-6 col-md-3">
                <ul className="list-unstyled">
                  <li><a href="#">Nordic Chair</a></li>
                  <li><a href="#">Kruzo Aero</a></li>
                  <li><a href="#">Ergonomic Chair</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-top pt-4">
          <div className="row">
            <div className="col-lg-6">
              <p className="mb-2 text-center text-lg-start">
                Copyright &copy; {new Date().getFullYear()}.
                All Rights Reserved. &mdash; Designed with love by{" "}
                <a href="https://untree.co">Untree.co</a> Distributed By{" "}
                <a href="https://themewagon.com">ThemeWagon</a>
              </p>
            </div>

            <div className="col-lg-6 text-center text-lg-end">
              <ul className="list-unstyled d-inline-flex ms-auto gap-4">
                <li><a href="#">Terms &amp; Conditions</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

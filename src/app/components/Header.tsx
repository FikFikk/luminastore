"use client";

import Image from "next/image";
import Link from "next/link";

export default function Header() {
  return (
    <>
      {/* Start Header/Navigation */}
      <nav
        className="custom-navbar navbar navbar-expand-md navbar-dark bg-dark"
        aria-label="Furni navigation bar"
      >
        <div className="container">
          <Link className="navbar-brand" href="/">
            Furni<span>.</span>
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarsFurni"
            aria-controls="navbarsFurni"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarsFurni">
            <ul className="custom-navbar-nav navbar-nav ms-auto mb-2 mb-md-0">
              <li className="nav-item">
                <Link className="nav-link" href="/">Home</Link>
              </li>
              <li>
                <Link className="nav-link" href="/product">Product</Link>
              </li>
              <li>
                <Link className="nav-link" href="/contact">Contact us</Link>
              </li>
            </ul>

            <ul className="custom-navbar-cta navbar-nav mb-2 mb-md-0 ms-5">
              <li>
                <Link className="nav-link" href="#">
                  <Image
                    src="/assets/images/user.svg"
                    alt="User"
                    width={20}
                    height={20}
                  />
                </Link>
              </li>
              <li>
                <Link className="nav-link" href="/cart">
                  <Image
                    src="/assets/images/cart.svg"
                    alt="Cart"
                    width={20}
                    height={20}
                  />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      {/* End Header/Navigation */}
    </>
  );
}

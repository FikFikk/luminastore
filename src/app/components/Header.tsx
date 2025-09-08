"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { logoutUser } from "@/store/slices/authSlice";
import { getCartThunk, resetCart } from "@/store/slices/cartSlice";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import utilsService, { SiteConfig } from "@/services/utilsService";

export default function Header({ showHeader = true }: { showHeader?: boolean }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const { summary, items } = useAppSelector((state) => state.cart);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Load cart when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(getCartThunk());
    } else if (!isAuthenticated) {
      // Reset cart when user logs out
      dispatch(resetCart());
    }
  }, [isAuthenticated, user, dispatch]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);

        const [configData] = await Promise.all([
          utilsService.getSiteConfig(),
        ]);

        setSiteConfig(configData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());

    if (logoutUser.fulfilled.match(result)) {
      // Reset cart on logout
      dispatch(resetCart());
      router.push("/auth/login");
    }
  };

  // Calculate total items for badge
  const totalCartItems = summary.items_count || 0;

  return (
    <>
      <nav
        className={'custom-navbar navbar navbar-expand-md navbar-dark bg-dark'}
        style={{ display: !showHeader ? "none" : "" }}
        aria-label="Furni navigation bar"
      >
        <div className="container">
          <Link className="navbar-brand" href="/">
            {siteConfig?.site_name || "LuminaStore"}
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
                <Link className="nav-link" href="/orders">Order</Link>
              </li>
              <li>
                <Link className="nav-link" href="/abouts">About</Link>
              </li>
            </ul>

            <ul className="custom-navbar-cta navbar-nav mb-2 mb-md-0 ms-5">
              <li className="nav-item dropdown">
                {isAuthenticated && user ? (
                  <>
                    <a
                      className="nav-link dropdown-toggle text-white"
                      href="#"
                      id="userDropdown"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {isLoading ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      ) : null}
                      Hi, {user.FirstName} {user.Surname}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                      <li>
                        <Link className="dropdown-item" href="/profile">
                          Profile
                        </Link>
                      </li>
                      <li>
                        <Link className="dropdown-item" href="/change-password">
                          Change Password
                        </Link>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          onClick={handleLogout}
                          className="dropdown-item text-danger"
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </>
                ) : (
                  <Link className="nav-link" href="/auth/login">
                    <Image
                      src="/assets/images/user.svg"
                      alt="User"
                      width={20}
                      height={20}
                    />
                  </Link>
                )}
              </li>
              <li className="nav-item position-relative">
                <Link className="nav-link" href="/cart">
                  <Image
                    src="/assets/images/cart.svg"
                    alt="Cart"
                    width={20}
                    height={20}
                  />
                  {isAuthenticated && totalCartItems > 0 && (
                    <span 
                      className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                      style={{ fontSize: '0.7rem', minWidth: '1.2rem', height: '1.2rem' }}
                    >
                      {totalCartItems > 99 ? '99+' : totalCartItems}
                      <span className="visually-hidden">items in cart</span>
                    </span>
                  )}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
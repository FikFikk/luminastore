"use client";

import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { logoutUser } from "@/store/slices/authSlice";
import { useRouter } from "next/navigation";

export default function Header({ showHeader = true }: { showHeader?: boolean }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);
  const router = useRouter();

  const handleLogout = async () => {
    const result = await dispatch(logoutUser());

    if (logoutUser.fulfilled.match(result)) {
      router.push("/auth/login"); // redirect ke login kalau logout sukses
    }
  };

  return (
    <>
      <nav
        className={'custom-navbar navbar navbar-expand-md navbar-dark bg-dark'}
        style={{ display: !showHeader ? "none" : "" }}
        aria-label="Furni navigation bar"
      >
        <div className="container">
          <Link className="navbar-brand" href="/">
            LuminaStore<span>.</span>
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
    </>
  );
}
"use client";

import utilsService, { SiteConfig } from "@/services/utilsService";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

  

export default function Footer({showHeader = true} : {showHeader?: boolean}) {

  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [configData] = await Promise.all([
          utilsService.getSiteConfig(),
        ]);

        setSiteConfig(configData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="min-vh-100 d-flex justify-content-center align-items-center">Loading your furniture collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Try Again
          </button>
        </div>
      </div>
    );
  }
 const content = siteConfig?.about?.content ?? "-";

  // Batasi ke 150 karakter
  const limit = 150;
  const isLong = content.length > limit;
  const preview = isLong ? content.substring(0, limit) + "..." : content;
  return (
    <footer className="footer-section bg-light pt-5"
    style={{display: !showHeader ? "none" : ""}}
    >
      <div className="container relative">

        {/* Sofa image */}
        {/* <div className="sofa-img mb-4">
          <Image
            src="/assets/images/sofa.png"
            alt="Sofa"
            width={300}
            height={200}
            className="img-fluid"
          />
        </div> */}

        {/* Newsletter */}
        {/* <div className="row">
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
        </div> */}

        {/* Footer main */}
        <div className="row g-5 mb-5">
          <div className="col-lg-4">
            <div className="mb-4 footer-logo-wrap">
              <a href="#" className="footer-logo">
                 {siteConfig?.site_name || "LuminaStore"}
              </a>
            </div>
            <p className="mb-4">
              <span
                dangerouslySetInnerHTML={{
                  __html: preview,
                }}
              />
              {isLong && (
                <Link href="/abouts" className="text-primary fw-semibold">
                  Lihat selengkapnya
                </Link>
              )}
            </p>
            
          </div>

          
        </div>

        {/* Copyright */}
        <div className="border-top pt-4">
          <div className="row">
            <div className="col-lg-6">
              <p className="mb-2 text-center text-lg-start">
                Copyright &copy; {new Date().getFullYear()}.
                All Rights Reserved. &mdash; 
                <a href="">{siteConfig?.site_name}</a>
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
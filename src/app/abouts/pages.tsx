import utilsService, { SiteConfig } from '@/services/utilsService';
import React, { useEffect, useState } from 'react'
import { Shimmer } from 'react-shimmer';

function AboutPages() {
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
  return (
    <div className="container">
        {/* Why Choose Us Section */}
        <section className="why-choose-section">
        <div className="container">
            <div className="row justify-content-between">
            <div className="col-lg-6">
                <h2 className="section-title">
                {siteConfig?.about.title || "Why Choose Us"}
                </h2>
                <div 
                className="about-content"
                dangerouslySetInnerHTML={{
                    __html: siteConfig?.about.content || 
                    "Donec vitae odio quis nisl dapibus malesuada. Nullam ac aliquet velit. Aliquam vulputate velit imperdiet dolor tempor tristique."
                }}
                />
            </div>

            <div className="col-lg-5">
                <div className="img-wrap">
                {siteConfig?.about.image ? (
                    <div style={{ width: 500, height: 400, position: 'relative' }}>
                    <Shimmer width={500} height={400} />
                    <img
                        src={siteConfig.about.image.medium}
                        alt={siteConfig.about.title}
                        style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0
                        }}
                        onLoad={(e) => {
                        const target = e.target as HTMLImageElement; // cast here
                        const shimmer = target.previousElementSibling as HTMLElement | null;
                        if (shimmer) shimmer.style.display = 'none';
                        }}
                    />
                    </div>
                ) : (
                    <div style={{ width: 500, height: 400, position: 'relative' }}>
                    <Shimmer width={500} height={400} />
                    <img
                        src="/assets/images/why-choose-us-img.jpg"
                        alt="Why Choose Us"
                        style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0
                        }}
                        onLoad={(e) => {
                        const target = e.target as HTMLImageElement; // cast here
                        const shimmer = target.previousElementSibling as HTMLElement | null;
                        if (shimmer) shimmer.style.display = 'none';
                        }}
                    />
                    </div>
                )}
                </div>
            </div>
            </div>
        </div>
        </section>
    </div>
  )
}

export default AboutPages
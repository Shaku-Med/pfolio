import React from 'react';

interface CompanyLogoProps {
  company: string;
  className?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ company, className = '' }) => {
  const [logoUrl, setLogoUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<boolean>(false);

  React.useEffect(() => {
    const fetchLogo = async () => {
      try {
        // Format company name for URL
        const formattedCompany = encodeURIComponent(company.toLowerCase().trim());
        const url = `https://logo.clearbit.com/${formattedCompany}.com`;
        
        // Check if the logo exists
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          setLogoUrl(url);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      }
    };

    if (company) {
      fetchLogo();
    }
  }, [company]);

  if (error || !logoUrl) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={logoUrl}
        alt={`${company} logo`}
        width={48}
        height={48}
        className="object-contain"
        onError={() => setError(true)}
      />
    </div>
  );
}; 
export const CoverImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <img src={src} alt={alt} className="w-full h-auto md:w-56 rounded-lg shadow-lg" />
);
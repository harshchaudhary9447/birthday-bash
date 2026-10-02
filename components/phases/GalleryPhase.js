export default function GalleryPhase({ person, gallery = [] }) {
  const validGallery = Array.isArray(gallery) && gallery.length > 0 ? gallery.slice(0, 7) : [];
  
  // Ensure at least 6 photos in base list so marquee spans wider than max container (1180px)
  const minItems = 6;
  const repeatCount = validGallery.length > 0 ? Math.max(1, Math.ceil(minItems / validGallery.length)) : 0;
  const baseList = [];
  for (let i = 0; i < repeatCount; i++) {
    baseList.push(...validGallery);
  }
  const marqueePhotos = [...baseList, ...baseList];

  return (
    <section className="gallery-page">
      <span className="script">little moments, big love</span>
      <h1>
        A gallery
        <br />
        <em>for you, {person?.name || "you"}.</em>
      </h1>
      <div className="gallery-frame">
        <span className="gallery-side-border gallery-side-border-left" />
        <div className="gallery-marquee">
          <div className="gallery-track">
            {marqueePhotos.map((image, index) => (
              <div className="gallery-photo-card" key={`${image}-${index}`}>
                <img src={image} alt="A happy memory" />
              </div>
            ))}
          </div>
        </div>
        <span className="gallery-side-border gallery-side-border-right" />
      </div>
      <p>Here&apos;s to every memory behind the smile.</p>
    </section>
  );
}

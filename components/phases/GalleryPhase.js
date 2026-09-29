export default function GalleryPhase({ person, gallery, onReplay, onShare }) {
  return (
    <section className="gallery-page">
      <span className="script">little moments, big love</span>
      <h1>
        A gallery
        <br />
        <em>for you, {person.name}.</em>
      </h1>
      <div className="gallery-frame">
        <span className="gallery-side-border gallery-side-border-left" />
        <div className="gallery-marquee">
          <div className="gallery-track">
            {[...gallery.slice(0, 7), ...gallery.slice(0, 7)].map(
              (image, index) => (
                <div className="gallery-photo-card" key={`${image}-${index}`}>
                  <img src={image} alt="A happy memory" />
                </div>
              ),
            )}
          </div>
        </div>
        <span className="gallery-side-border gallery-side-border-right" />
      </div>
      <p>Here&apos;s to every memory behind the smile.</p>
      <div className="gallery-actions">
        {onShare && (
          <button type="button" className="share-link-btn" onClick={onShare}>
            Send the link to your loved one 💌
          </button>
        )}
        {onReplay && (
          <button type="button" className="replay-btn" onClick={onReplay}>
            Celebrate Again <span>↺</span>
          </button>
        )}
      </div>
    </section>
  );
}

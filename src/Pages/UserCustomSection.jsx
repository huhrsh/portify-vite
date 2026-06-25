import { useEffect, useState } from "react";
import { useParams, useOutletContext } from "react-router-dom";

function LazyImg({ src, alt, className }) {
    const [state, setState] = useState('loading'); // 'loading' | 'loaded' | 'error'
    return (
        <div className={`relative bg-gray-100 animate-pulse ${state !== 'loading' ? 'animate-none bg-transparent' : ''} ${className}`}>
            <img
                src={src}
                alt={alt}
                loading="lazy"
                className={`absolute inset-0 w-full h-full object-cover rounded-lg transition-opacity duration-300 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setState('loaded')}
                onError={() => setState('error')}
            />
            {state === 'error' && (
                <div className="absolute inset-0 flex items-center justify-center rounded-lg"
                    style={{ background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 50%, #c4b5fd 100%)' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(109,40,217,0.45)', textAlign: 'center', padding: 8 }}>{alt}</span>
                </div>
            )}
        </div>
    );
}

function CardRenderer({ card }) {
    switch (card.type) {
        case "text":
            return (
                <div className="custom-card">
                    {card.title && <h3 className="custom-card-title">{card.title}</h3>}
                    {card.body  && <p  className="custom-card-body">{card.body}</p>}
                    {card.link  && <a href={card.link} target="_blank" rel="noopener noreferrer" className="custom-card-link">Learn more →</a>}
                </div>
            );

        case "image-text":
            return (
                <div className="custom-card flex gap-6 max-sm:flex-col">
                    {card.imageUrl && (
                        <LazyImg src={card.imageUrl} alt={card.title || "image"}
                            className="w-48 h-36 flex-shrink-0 max-sm:w-full max-sm:h-48 rounded-lg" />
                    )}
                    <div className="flex flex-col gap-2 flex-1">
                        {card.title && <h3 className="custom-card-title">{card.title}</h3>}
                        {card.body  && <p  className="custom-card-body">{card.body}</p>}
                        {card.link  && <a href={card.link} target="_blank" rel="noopener noreferrer" className="custom-card-link">Learn more →</a>}
                    </div>
                </div>
            );

        case "list":
            return (
                <div className="custom-card">
                    {card.title && <h3 className="custom-card-title">{card.title}</h3>}
                    <ul className="flex flex-col gap-1.5 mt-2">
                        {card.items?.filter(Boolean).map((item, i) => (
                            <li key={i} className="custom-card-list-item flex items-start gap-2">
                                <span className="mt-1 flex-shrink-0">›</span> {item}
                            </li>
                        ))}
                    </ul>
                    {card.link && <a href={card.link} target="_blank" rel="noopener noreferrer" className="custom-card-link mt-3 inline-block">Learn more →</a>}
                </div>
            );

        case "link-grid":
            return (
                <div className="custom-card">
                    {card.title && <h3 className="custom-card-title">{card.title}</h3>}
                    <div className="flex flex-wrap gap-3 mt-3">
                        {card.links?.filter(l => l.label || l.url).map((lnk, i) => (
                            <a key={i} href={lnk.url} target="_blank" rel="noopener noreferrer"
                                className="custom-card-link border rounded-lg px-4 py-2 text-sm font-medium transition-all hover:opacity-80">
                                {lnk.label || lnk.url}
                            </a>
                        ))}
                    </div>
                </div>
            );

        case "timeline":
            return (
                <div className="custom-card flex gap-5">
                    <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-3 h-3 rounded-full bg-current mt-1.5 opacity-60" />
                        <div className="w-px flex-1 bg-current opacity-15 mt-1" />
                    </div>
                    <div className="flex flex-col gap-1 pb-4">
                        {card.date  && <span className="custom-card-body text-xs font-semibold uppercase tracking-wider opacity-50">{card.date}</span>}
                        {card.title && <h3 className="custom-card-title">{card.title}</h3>}
                        {card.body  && <p  className="custom-card-body">{card.body}</p>}
                    </div>
                </div>
            );

        case "quote":
            return (
                <div className="custom-card relative">
                    <span className="text-5xl leading-none opacity-15 absolute top-3 left-4 select-none font-serif">"</span>
                    {card.title  && <h3 className="custom-card-title pl-8">{card.title}</h3>}
                    {card.body   && <p  className="custom-card-body italic pl-8 pt-2">{card.body}</p>}
                    {card.author && <p  className="custom-card-body text-sm font-semibold mt-3 pl-8 opacity-60">— {card.author}</p>}
                </div>
            );

        case "gallery":
            return (
                <div className="custom-card">
                    {card.title && <h3 className="custom-card-title mb-3">{card.title}</h3>}
                    <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-2">
                        {(card.images || []).filter(Boolean).map((src, i) => (
                            <LazyImg key={i} src={src} alt={`gallery-${i}`}
                                className="w-full h-32 rounded-lg hover:opacity-90 transition-opacity" />
                        ))}
                    </div>
                </div>
            );

        default:
            return null;
    }
}

const LAYOUT_CLASSES = {
    list:    "flex flex-col gap-6",
    grid:    "grid grid-cols-2 gap-6 max-sm:grid-cols-1",
    masonry: "columns-2 gap-6 max-sm:columns-1",
};

const isCardPopulated = (card) =>
    card.title || card.body || card.items?.some(Boolean) ||
    card.links?.some(l => l.url) || card.images?.some(Boolean);

export default function UserCustomSection() {
    const { sectionId } = useParams();
    const { userDetails } = useOutletContext();

    useEffect(() => { window.scrollTo(0, 0); }, [sectionId]);

    const theme = userDetails?.selectedStyle || "bold-purple";
    const section = userDetails?.customSections?.find(s => s.id === sectionId);

    if (!section) {
        return (
            <div className={`${theme}-main min-h-screen flex items-center justify-center`}>
                <p className="custom-card-body text-lg opacity-60">Section not found.</p>
            </div>
        );
    }

    const layout = section.layout || "list";
    const layoutCls = LAYOUT_CLASSES[layout] || LAYOUT_CLASSES.list;
    const populated = section.cards?.filter(isCardPopulated) || [];

    return (
        <div className="max-w-4xl mx-auto px-8 pt-28 pb-16 max-sm:px-5 max-sm:pt-24">
            <h1 className="custom-card-title text-4xl font-bold mb-10 max-sm:text-3xl">{section.title}</h1>
            {layout === "masonry" ? (
                <div className={layoutCls}>
                    {populated.map(card => (
                        <div key={card.id} className="break-inside-avoid mb-6">
                            <CardRenderer card={card} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className={layoutCls}>
                    {populated.map(card => (
                        <CardRenderer key={card.id} card={card} />
                    ))}
                </div>
            )}
        </div>
    );
}

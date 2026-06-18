import React, { useEffect, useState } from "react";

function BookCover({ title, author, isLanding = false }) {
    const [coverUrl, setCoverUrl] = useState(null);

    useEffect(() => {
        const fetchCover = async () => {
            try {
                const googleQuery = `intitle:${title}+inauthor:${author}`;
                const googleResponse = await fetch(
                    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(googleQuery)}&maxResults=1`
                );

                if (googleResponse.ok) {
                    const googleData = await googleResponse.json();
                    if (googleData.items && googleData.items.length > 0) {
                        const imageLinks = googleData.items[0].volumeInfo?.imageLinks;
                        if (imageLinks?.thumbnail) {
                            setCoverUrl(imageLinks.thumbnail.replace("http:", "https:"));
                            return;
                        }
                    }
                }

                const openLibResponse = await fetch(
                    `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}&limit=1`
                );

                if (openLibResponse.ok) {
                    const openLibData = await openLibResponse.json();
                    if (openLibData.docs && openLibData.docs.length > 0 && openLibData.docs[0].cover_i) {
                        setCoverUrl(`https://covers.openlibrary.org/b/id/${openLibData.docs[0].cover_i}-M.jpg`);
                    }
                }
            } catch (error) {
                console.error(`Failed to fetch cover for ${title}`, error);
            }
        };

        fetchCover();
    }, [title, author]);

    return (
        <div className={isLanding ? "bl-book-cover" : "cover-wrapper"} style={isLanding ? { width: '100%', height: '100%', display: 'flex' } : {}}>
            {coverUrl ? (
                <img src={coverUrl} alt={`${title} cover`} style={isLanding ? { width: '100%', height: '100%', objectFit: 'cover' } : {}} />
            ) : (
                <div className="cover-placeholder" style={isLanding ? { width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0e8de', color: '#8b5e3c', fontSize: '0.75rem', gap: '0.25rem' } : {}}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span>No cover</span>
                </div>
            )}
        </div>
    );
}

export default BookCover;

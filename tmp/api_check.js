const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getStats() {
    const artistId = '7lt0oRndgoezYm6X98pS9s'; // Rosalía
    try {
        const res = await fetch(`https://backend.digital-latino.com/api/report/getSongsArtist/${artistId}/0`);
        const data = await res.json();
        console.log('--- ARTIST SONG SAMPLE ---');
        console.log(JSON.stringify(data[0], null, 2));

        if (data[0] && data[0].spotify_id) {
            const songId = data[0].spotify_id;
            const resSong = await fetch(`https://backend.digital-latino.com/api/report/getSongBySpotifyId/${songId}`);
            const songData = await resSong.json();
            console.log('--- SONG DETAIL SAMPLE ---');
            console.log(JSON.stringify(songData, null, 2));
        }
    } catch (e) {
        console.error(e);
    }
}

getStats();

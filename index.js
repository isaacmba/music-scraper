const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();

const PORT = process.env.PORT || 9999;

const sources = [
    {
        platform: 'apple',
        location: 'us',
        address: 'https://music.apple.com/us/playlist/top-100-usa/pl.606afcbb70264d2eb2b51d8dbcfa6a12'
    },
    {
        platform: 'apple',
        location: 'global',
        address: 'https://music.apple.com/la/playlist/top-100-global/pl.d25f5d1181894928af76c85c967f8f31'
    },
    {
        platform: 'apple',
        location: 'uk',
        address: 'https://music.apple.com/la/playlist/top-100-uk/pl.c2273b7e89b44121b3093f67228918e7'
    },
    {
        platform: 'apple',
        location: 'uae',
        address: 'https://music.apple.com/us/playlist/top-100-united-arab-emirates/pl.7b5e51f09aee4733958e23ea97dda459'
    },
    {
        platform: 'spotify',
        location: 'us',
        address: 'https://spotifycharts.com/regional/us/daily/latest'
    }
    ,
    {
        platform: 'spotify',
        location: 'gb',
        address: 'https://spotifycharts.com/regional/gb/daily/latest'
    },
    {
        platform: 'spotify',
        location: 'uae',
        address: 'https://spotifycharts.com/regional/ae/daily/latest'
    },
    {
        platform: 'spotify',
        location: 'global',
        address: 'https://spotifycharts.com/regional/ae/daily/latest'
    }
]

const songs = [];

sources.forEach(source => {
    axios.get(source.address)
        .then((response) => {
            const $ = cheerio.load(response.data);
            if (source.platform.includes('spotify')) {
                $('tbody tr').each((index, element) => {
                    const rank = $(element).find('.chart-table-position').text();
                    const title = $(element).find('.chart-table-track strong').text();
                    const artist = $(element).find('.chart-table-track span').text();

                    songs.push({
                        rank: rank,
                        title: title,
                        artist: artist,
                        platform: source.platform,
                        location: source.location
                    });
                });
            }
            else if (source.platform == 'apple') {
                $('.songs-list .songs-list-row').each((index, element) => {
                    const newSong = {
                        rank: $(element).find('.songs-list-row__rank').text(),
                        title: $(element).find('.songs-list-row__song-name').text(),
                        artist: $(element).find('.songs-list__col--artist').text().trim(),
                        platform: 'apple',
                        location: source.location
                    }
                    songs.push(newSong);
                });
            }
        });
});

app.get('/', (req, res) => {
    res.json(
        {
            title: 'Welcome to my Top Songs API',
            what: 'Gets Top songs from Apple Music and Spotify'
        }
    )
})

app.get('/songs', (req, res) => {
    res.json(songs);
})

app.get('/songs/:platform', (req, res) => {

    const platform = req.params.platform;

    let songsFromPlatform = [];

    songs.forEach((song) => {
        if (song.platform == platform) {
            songsFromPlatform.push(song);
        }
    })

    if (songsFromPlatform === undefined || songsFromPlatform.length == 0) {
        res.send(`cannot GET /songs/${platform}`)
    }
    else {
        res.json(songsFromPlatform);
    }
})

app.get('/songs/:platform/:location', (req, res) => {
    const platform = req.params.platform;
    const location = req.params.location;

    let songsByLocation = [];

    songs.forEach((song) => {
        if (song.location == location && song.platform == platform) {
            songsByLocation.push(song);
        }
    })

    if (songsByLocation === undefined || songsByLocation.length == 0) {
        res.send(`cannot GET /songs/${platform}/${location}`);
    }
    else {
        res.json(songsByLocation);
    }
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))
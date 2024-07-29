import fetch from "node-fetch";
import fs from "fs";

// Spotify API credentials
const clientId = "";
const clientSecret = "";

// Get Spotify access token
const getAccessToken = async () => {
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  return data.access_token;
};

const getAlbumCoverAndArtist = async (
  trackName,
  artistName,
  token,
  retries = 3
) => {
  try {
    const query = `track:${trackName} artist:${artistName}`;
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=track&limit=1`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch data for ${trackName} by ${artistName}`);
      if (retries > 0) {
        console.log(
          `Retrying with just track name... (${retries} retries left)`
        );
        return getAlbumCoverAndArtistByTrack(trackName, token, retries - 1);
      }
      return null;
    }

    const data = await response.json();
    if (data.tracks && data.tracks.items.length > 0) {
      console.log(
        `Found album cover and artist for ${trackName} by ${artistName}`
      );
      const albumCover = data.tracks.items[0].album.images[0].url; // URL of the album cover
      const correctedArtistName = data.tracks.items[0].artists
        .map((artist) => artist.name)
        .join(", ");
      return { albumCover, correctedArtistName };
    }

    if (retries > 0) {
      console.log(`Retrying with just track name... (${retries} retries left)`);
      return getAlbumCoverAndArtistByTrack(trackName, token, retries - 1);
    }
    return null;
  } catch (error) {
    console.error(
      `Error fetching album cover and artist for ${trackName} by ${artistName}:`,
      error
    );
    if (retries > 0) {
      console.log(`Retrying with just track name... (${retries} retries left)`);
      return getAlbumCoverAndArtistByTrack(trackName, token, retries - 1);
    }
    return null;
  }
};

// Fallback function to get album cover and artist by just track name
const getAlbumCoverAndArtistByTrack = async (trackName, token, retries = 3) => {
  try {
    const query = `track:${trackName}`;
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      query
    )}&type=track&limit=1`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch data for ${trackName}`);
      if (retries > 0) {
        console.log(`Retrying... (${retries} retries left)`);
        return getAlbumCoverAndArtistByTrack(trackName, token, retries - 1);
      }
      return null;
    }

    const data = await response.json();
    if (data.tracks && data.tracks.items.length > 0) {
      console.log(`Found album cover and artist for ${trackName}`);
      const albumCover = data.tracks.items[0].album.images[0].url; // URL of the album cover
      const correctedArtistName = data.tracks.items[0].artists
        .map((artist) => artist.name)
        .join(", ");
      return { albumCover, correctedArtistName };
    }

    if (retries > 0) {
      console.log(`Retrying... (${retries} retries left)`);
      return getAlbumCoverAndArtistByTrack(trackName, token, retries - 1);
    }
    return null;
  } catch (error) {
    console.error(
      `Error fetching album cover and artist for ${trackName}:`,
      error
    );
    if (retries > 0) {
      console.log(`Retrying... (${retries} retries left)`);
      return getAlbumCoverAndArtistByTrack(trackName, token, retries - 1);
    }
    return null;
  }
};

const appendAlbumCovers = async (inputJson, outputJson) => {
  const token = await getAccessToken();
  const tracks = JSON.parse(fs.readFileSync(inputJson, "utf8"));

  for (let row of tracks) {
    const result = await getAlbumCoverAndArtist(
      row["Track"],
      row["Artist"],
      token
    );
    if (result) {
      row["Album Cover"] = result.albumCover;
      row["Artist"] = result.correctedArtistName;
    }
  }

  fs.writeFileSync(outputJson, JSON.stringify(tracks, null, 2));
  console.log(`JSON file with album covers written to ${outputJson}`);
};

// Process each JSON file
appendAlbumCovers(
  "data/top_50_streamed.json",
  "data/top_50_streamed_with_covers.json"
);
appendAlbumCovers(
  "data/top_50_popularity.json",
  "data/top_50_popularity_with_covers.json"
);
appendAlbumCovers(
  "data/top_50_playlist.json",
  "data/top_50_playlist_with_covers.json"
);

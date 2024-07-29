import fetch from "node-fetch";
import fs from "fs";
import { createReadStream } from "fs";
import { pipeline } from "stream";
import { promisify } from "util";
import csv from "csv-parser";

// Spotify API credentials
const clientId = "";
const clientSecret = "";

console.log(clientId);

// Promisify the pipeline function for easier async/await usage
const pipelineAsync = promisify(pipeline);

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

// Get album cover URL for a track
const getAlbumCover = async (trackName, artistName, token) => {
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
      return null;
    }

    const data = await response.json();
    if (data.tracks && data.tracks.items.length > 0) {
      console.log(`Good for ${trackName} by ${artistName}:`);
      return data.tracks.items[0].album.images[0].url; // URL of the album cover
    }
    return null;
  } catch (error) {
    console.error(
      `Error fetching album cover for ${trackName} by ${artistName}:`,
      error
    );
    return null;
  }
};

// Read CSV, fetch album covers, and write to JSON
const processTracks = async () => {
  const token = await getAccessToken();
  const tracks = [];

  await pipelineAsync(
    createReadStream("data/Most Streamed Spotify Songs 2024.csv"),
    csv(),
    async function* (source) {
      for await (const row of source) {
        const albumCover = await getAlbumCover(
          row["Track"],
          row["Artist"],
          token
        );
        row["Album Cover"] = albumCover;
        tracks.push(row);
      }
    }
  );

  fs.writeFileSync(
    "data/tracks_with_album_covers.json",
    JSON.stringify(tracks, null, 2)
  );
  console.log("CSV file successfully processed");
};

processTracks().catch((err) => console.error(err));

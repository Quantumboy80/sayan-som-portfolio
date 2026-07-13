import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const username = process.env.LASTFM_USERNAME;
  const apiKey = process.env.LASTFM_API_KEY;

  if (!username || !apiKey) {
    return NextResponse.json({
      isPlaying: false,
      title: "Not Listening",
      artist: "YouTube Music",
      album: "No Last.fm credentials configured",
      albumArt: "",
      songUrl: "https://music.youtube.com",
    });
  }

  try {
    const response = await fetch(
      `http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${username}&api_key=${apiKey}&limit=1&format=json`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch from Last.fm");
    }

    const data = await response.json();
    const track = data.recenttracks?.track?.[0];

    if (!track) {
      return NextResponse.json({
        isPlaying: false,
        title: "Not Listening",
        artist: "YouTube Music",
        album: "",
        albumArt: "",
        songUrl: "https://music.youtube.com",
      });
    }

    const isPlaying = track["@attr"]?.nowplaying === "true";
    const title = track.name;
    const artist = track.artist?.["#text"] || "";
    const album = track.album?.["#text"] || "";
    const albumArt = track.image?.[2]?.["#text"] || track.image?.[1]?.["#text"] || "";
    
    // Generate a direct search link to YouTube Music for seamless playback
    const songUrl = `https://music.youtube.com/search?q=${encodeURIComponent(
      `${title} ${artist}`
    )}`;

    return NextResponse.json({
      isPlaying,
      title,
      artist,
      album,
      albumArt,
      songUrl,
    });
  } catch (error) {
    console.error("Last.fm Fetch Error:", error);
    return NextResponse.json({
      isPlaying: false,
      title: "Not Listening",
      artist: "YouTube Music",
      album: "Error fetching live details",
      albumArt: "",
      songUrl: "https://music.youtube.com",
    });
  }
}

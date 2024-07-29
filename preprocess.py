import pandas as pd

# Try reading the file with different encodings
encodings = ['utf-8', 'latin1', 'ISO-8859-1']

for enc in encodings:
    try:
        spotify_songs = pd.read_csv('data/Most Streamed Spotify Songs 2024.csv', encoding=enc)
        print(f'Successfully read the file with {enc} encoding')
        break
    except UnicodeDecodeError:
        print(f'Failed to read the file with {enc} encoding')
        continue
else:
    raise ValueError('Failed to read the file with all tried encodings')

# Display the column names of the dataset to understand its structure
print(spotify_songs.columns)

# Ensure numeric columns are treated as strings before conversion
numeric_columns = ['Spotify Streams', 'Spotify Popularity', 'YouTube Views', 'TikTok Views', 'Spotify Playlist Count', 'Spotify Playlist Reach']
for col in numeric_columns:
    spotify_songs[col] = spotify_songs[col].astype(str).str.replace(',', '').str.replace(' ', '')

# Convert numeric columns to numeric types
for col in numeric_columns:
    spotify_songs[col] = pd.to_numeric(spotify_songs[col], errors='coerce')

# Adjust column names based on actual columns
track_name_col = 'Track'  # Adjust if needed
artist_col = 'Artist'          # Adjust if needed
release_date_col = 'Release Date'  # Adjust if needed

# Preprocess data for Scene 1
top_50_streamed = spotify_songs.nlargest(50, 'Spotify Streams')[[track_name_col, artist_col, release_date_col, 'Spotify Streams']]

# Preprocess data for Scene 2
top_50_popularity = spotify_songs.nlargest(50, 'Spotify Popularity')[[track_name_col, artist_col, 'Spotify Streams', 'YouTube Views', 'TikTok Views']]

# Preprocess data for Scene 3
top_50_playlist = spotify_songs.nlargest(50, 'Spotify Playlist Reach')[[track_name_col, artist_col, 'Spotify Playlist Count', 'Spotify Playlist Reach']]

# Save preprocessed data to JSON
top_50_streamed.to_json('data/top_50_streamed.json', orient='records')
top_50_popularity.to_json('data/top_50_popularity.json', orient='records')
top_50_playlist.to_json('data/top_50_playlist.json', orient='records')

import pandas as pd

# Load datasets
movies_total_gross = pd.read_csv('./data/disney_movies_total_gross.csv')
revenue_1991_2016 = pd.read_csv('./data/disney_revenue_1991-2016.csv')
characters = pd.read_csv('./data/disney-characters.csv')
directors = pd.read_csv('./data/disney-director.csv')
voice_actors = pd.read_csv('./data/disney-voice-actors.csv')

# Rename columns to have a consistent 'movie_title' column for merging
movies_total_gross.rename(columns={'movie': 'movie_title'}, inplace=True)
directors.rename(columns={'name': 'movie_title'}, inplace=True)
voice_actors.rename(columns={'movie': 'movie_title'}, inplace=True)

# Merge datasets
movies_directors = pd.merge(movies_total_gross, directors, on="movie_title", how="left")
movies_full = pd.merge(movies_directors, voice_actors, on="movie_title", how="left")

# Clean data (handle missing values, duplicates, etc.)
movies_full = movies_full.drop_duplicates().fillna("Unknown")

# Convert to JSON
movies_full_json = movies_full.to_json(orient='records')

# Save JSON file
with open('./data/movies_full.json', 'w') as f:
    f.write(movies_full_json)

# Display the JSON data to verify
print(movies_full_json[:500])  # Print the first 500 characters of the JSON data for verification

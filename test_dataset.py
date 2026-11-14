
import io
import urllib.request
import zipfile
import pandas as pd

URL = "https://archive.ics.uci.edu/static/public/522/south%2Bgerman%2Bcredit.zip"

print("Downloading official UCI dataset...")

response = urllib.request.urlopen(URL)
archive = zipfile.ZipFile(io.BytesIO(response.read()))

with archive.open("SouthGermanCredit.asc") as file:
    df = pd.read_csv(file, sep=r"\s+", engine="python")

print("\n========== DATASET OVERVIEW ==========")
print("Shape:", df.shape)

print("\n========== COLUMNS ==========")
print(df.columns.tolist())

print("\n========== FIRST FIVE RECORDS ==========")
print(df.head())

print("\n========== TARGET VALUES ==========")
print(df["kredit"].value_counts(dropna=False))

print("\n========== DATA TYPES ==========")
print(df.dtypes)

print("\n========== MISSING VALUES ==========")
print(df.isnull().sum())

print("\n========== AGE AND PERSONAL STATUS ==========")
print(df[["alter", "famges"]].head())

print("\nDataset inspection complete!")

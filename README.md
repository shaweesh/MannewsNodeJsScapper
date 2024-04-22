# Maan News Scraper

This is a Node.js script that scrapes news articles from the [Maan News website](https://www.maannews.net/) and saves them to a SQLite3 database.

## Requirements

- Node.js installed
- `axios`, `cheerio`, `sqlite3` packages installed (run `npm install axios cheerio sqlite3` to install them)

## How it works

The script first checks if the database and table already exist. If they do, it gets the latest link from the database and uses it to scrape the next page. If not, it creates the database and table and sets the starting URL for scraping.

The script uses the `axios` package to make HTTP requests to the URLs, and the `cheerio` package to parse the HTML content of the pages. It then extracts the news articles from the pages and saves them to the database using the `sqlite3` package.

The script repeats this process for each page until it reaches the last page.

## Database schema

The script creates a table named `news` with the following schema:

- `id` (integer, primary key, auto-increment)
- `title` (text)
- `category` (text)
- `link` (text)
- `image` (text)
- `content` (text)

## Usage
Install npm dependencies
```bash
npm install
```

To run the script, simply execute the following command in the terminal:

``` bash
node index.js
```

The script will output the scraped news articles to the console, along with any errors that may occur.

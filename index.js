const axios = require('axios');
const cheerio = require('cheerio');
const sqlite3 = require('sqlite3').verbose();

// Connect to the database
const db = new sqlite3.Database('news.db', (err) => {
    if (err) {
        console.error(err.message);
        return;
    }
    console.log('Connected to the news database.');
});

// Check if the database and table already exist
db.get('SELECT * FROM news LIMIT 1', (err, row) => {
    if (row) {
        // Get the latest link from the database
        db.get('SELECT link FROM news ORDER BY id DESC LIMIT 1', (err, row) => {
            const latestLink = row.link;

            // Get the next page link
            axios.get(latestLink)
                .then(response => {
                    if (response.status === 200) {
                        const $ = cheerio.load(response.data);
                        const nextLink = $('.prev-next-item-next').attr('href');
                        if (nextLink) {
                            scrapeNews(nextLink);
                        } else {
                            console.log("No more pages to scrape.");
                            db.close();
                        }
                    }
                })
                .catch(error => {
                    console.error(error);
                    process.exit();
                });
        });
    } else {
        // Create the table
        db.run(`
            CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT,
                category TEXT,
                link TEXT,
                image TEXT,
                content TEXT
            )
        `);

        // Set the starting URL
        const startingUrl = 'https://www.maannews.net/news/1.html';
        scrapeNews(startingUrl);
    }
});

function scrapeNews(url) {
    // Get the HTML content of the page
    axios.get(url)
        .then(response => {
            if (response.status === 200) {
                const $ = cheerio.load(response.data);

                // Scrape the news articles on the page
                $('.default__item').each((index, element) => {
                    const title = $(element).find('.default__item--title').text().trim();
                    const category = $('.bread-crumb__title').last().text().trim();
                    const link = url;
                    const image = $(element).find('.default__item--img img').attr('data-src');
                    const content = $(element).find('.default__item--content').text().trim() || null;

                    // Insert the news article into the database
                    db.run(`
                        INSERT INTO news (title, category, link, image, content)
                        VALUES (?, ?, ?, ?, ?)
                    `, [title, category, link, image, content], (err) => {
                        if (err) {
                            console.error(err.message);
                        } else {
                            console.log(`Scraped news article ${index + 1}: ${title}`);
                        }
                    });
                });

                // Get the next page link
                const nextLink = $('.prev-next-item-next').attr('href');
                if (nextLink) {
                    scrapeNews(nextLink);
                } else {
                    console.log("No more pages to scrape.");
                    db.close();
                }
            }
        })
        .catch(error => {
            console.error(error);
            process.exit();
        });
}
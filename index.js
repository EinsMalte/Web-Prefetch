const path = require('path');
const fs = require('fs');

var basePath = __dirname;
var baseFile = "";
var registeredSites = [];

function setBasePath(path) {
    basePath = path;
    console.info("Changed dir to " + path);
}

function registerAsBase(_filePath) {
    let filePath = path.join(basePath, _filePath);
    baseFile = filePath;
    console.info("Set base file to " + _filePath);
}

function registerWebsite(_filePath) {
    let filePath = path.join(basePath, _filePath);
    if(!(filePath in registeredSites)) {
        registeredSites.push(filePath);
        console.info("Registered " + _filePath + " successfully");
    } else {
        console.info(_filePath + " already registered.");
    }
}

function build() {
    clean();
    try {
        fs.mkdirSync(path.join(basePath, "/wp-build/"));
    } catch(error) {
    }

    const baseHTML = fs.readFileSync(baseFile, 'utf8');
    
    registeredSites.forEach(site => {
        console.info(`Processing site: ${site}`);
        const siteHTML = fs.readFileSync(site, 'utf8');
        
        // Extract the main part using a regex
        const mainMatch = siteHTML.match(/<main[^>]*>([\s\S]*?)<\/main>/i) ||
                          siteHTML.match(/<article[^>]*>([\s\S]*?)<\/article>/i) ||
                          siteHTML.match(/<div class="content"[^>]*>([\s\S]*?)<\/div>/i);

        if (mainMatch && mainMatch[1]) {
            const mainContent = mainMatch[1];

            // Insert the extracted content into the <main> tag of baseHTML
            const updatedBaseHTML = baseHTML.replace(/<main[^>]*>[\s\S]*?<\/main>/i, `<main>${mainContent}</main>`);
            
            // Prepare a new filename based on the site name
            const siteName = path.basename(site, path.extname(site));
            const newFilePathFull = path.join(basePath, "/wp-build/", `${siteName}.html`);
            const newFilePathMain = path.join(basePath, "/wp-build/", `${siteName}.main.html`);
            
            // Save the modified HTML
            fs.writeFileSync(newFilePathFull, updatedBaseHTML);
            fs.writeFileSync(newFilePathMain, mainContent);
            console.info(`Built new file: ${newFilePathFull}`);
        } else {
            console.warn(`No main content found for site: ${site}`);
        }
    });
}

function clean() {
    try {
        fs.rmSync(path.join(basePath, "/wp-build/"), { recursive: true, force: true });
    } catch(error) {
        console.error(`Couldn't remove directory: ${path.join(basePath, "/wp-build/")}`);
        console.info(error);
    }
}

module.exports = {
    setBasePath,
    registerAsBase,
    registerWebsite,
    build,
    clean
};
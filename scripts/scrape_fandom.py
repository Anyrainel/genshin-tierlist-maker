#!/usr/bin/env python3
"""
Genshin Impact Character Data Scraper - Fandom Wiki Version
Scrapes character data from genshin-impact.fandom.com and generates TypeScript files
"""

import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime

# =============================================================================
# CONFIGURATION - Modify these settings as needed
# =============================================================================

# Output Configuration
CHARACTERS_OUTPUT_FILE = "src/data/characters.ts"
ELEMENTS_OUTPUT_FILE = "src/data/elements.ts"
WEAPONS_OUTPUT_FILE = "src/data/weapons.ts"

# Web Scraping Configuration
BASE_URL = "https://genshin-impact.fandom.com"
CHARACTERS_URL = f"{BASE_URL}/wiki/Character/List"
REQUEST_TIMEOUT = 30  # Timeout in seconds for web requests

# HTTP Headers for web requests
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
}

# Character Data Validation
MIN_NAME_LENGTH = 2
MAX_NAME_LENGTH = 30
VALID_ELEMENTS = ['Pyro', 'Hydro', 'Electro', 'Cryo', 'Anemo', 'Geo', 'Dendro']
VALID_WEAPONS = ['Sword', 'Claymore', 'Polearm', 'Catalyst', 'Bow']
VALID_REGIONS = ['Mondstadt', 'Liyue', 'Inazuma', 'Sumeru', 'Fontaine', 'Natlan', 'Snezhnaya', 'Nod-Krai', 'None']
VALID_RARITIES = [4, 5]

# Character Filtering
SKIP_TRAVELER = False  # Include Traveler character variants

# =============================================================================




def clean_release_date(date_string):
    """Clean release date to YYYY-MM-DD format"""
    # Remove time and timezone information
    date_string = re.sub(r'\s+\d{2}:\d{2}:\d{2}.*$', '', date_string)
    return date_string


def clean_image_url(image_url):
    """Clean image URL by removing scaling parameters"""
    # Remove everything after the .png/.jpg/.jpeg extension
    # This removes /revision/latest/scale-to-width-down/50?cb=... parameters
    cleaned_url = re.sub(r'\.(png|jpg|jpeg).*$', r'.\1', image_url)
    return cleaned_url


def scrape_character_data():
    """Scrape character data from genshin-impact.fandom.com"""
    print("Fetching character data from genshin-impact.fandom.com...")
    
    try:
        response = requests.get(CHARACTERS_URL, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error fetching characters page: {e}")
        return []
    
    soup = BeautifulSoup(response.text, 'html.parser')
    characters = []
    
    # Find the table with data-release elements (Playable Characters table)
    tables = soup.find_all('table')
    target_table = None
    
    for table in tables:
        data_release_elements = table.find_all(attrs={'data-release': True})
        if data_release_elements:
            target_table = table
            break
    
    if not target_table:
        print("Could not find the Playable Characters table")
        return []
    
    print(f"Found Playable Characters table with {len(data_release_elements)} characters")
    
    # Process each row (skip header row)
    rows = target_table.find_all('tr')[1:]  # Skip header row
    print(f"Processing {len(rows)} rows...")
    
    for row in rows:
        try:
            cells = row.find_all(['td', 'th'])
            if len(cells) < 9:  # Ensure we have all 9 columns
                continue
            
            # Extract character name from Cell 2 (Name column)
            name_cell = cells[1]
            name_link = name_cell.find('a')
            if not name_link:
                continue
            name = name_link.get_text(strip=True)
            
            if not name or len(name) < MIN_NAME_LENGTH or len(name) > MAX_NAME_LENGTH:
                continue
            
            # Skip Traveler variants if configured
            if SKIP_TRAVELER and name.startswith('Traveler'):
                continue
            
            # Extract rarity from Cell 3 (Quality column)
            quality_cell = cells[2]
            rarity_img = quality_cell.find('img')
            if not rarity_img or not rarity_img.get('alt'):
                continue
            
            alt_text = rarity_img.get('alt')
            if '4 Stars' in alt_text:
                rarity = 4
            elif '5 Stars' in alt_text:
                rarity = 5
            else:
                continue
            
            if rarity not in VALID_RARITIES:
                continue
            
            # Extract element from Cell 4 (Element column)
            element_cell = cells[3]
            element_links = element_cell.find_all('a')
            if not element_links:
                continue
            
            # Get the last link (which contains the element name)
            element_link = element_links[-1]
            element = element_link.get_text(strip=True)
            
            if element not in VALID_ELEMENTS:
                continue
            
            # Extract weapon from Cell 5 (Weapon column)
            weapon_cell = cells[4]
            weapon_links = weapon_cell.find_all('a')
            if not weapon_links:
                continue
            
            # Get the last link (which contains the weapon name)
            weapon_link = weapon_links[-1]
            weapon = weapon_link.get_text(strip=True)
            
            if weapon not in VALID_WEAPONS:
                continue
            
            # Extract region from Cell 6 (Region column)
            region_cell = cells[5]
            region_links = region_cell.find_all('a')
            if region_links:
                # Get the last link (which contains the region name)
                region_link = region_links[-1]
                region = region_link.get_text(strip=True)
            else:
                # Some regions might not have links (like "None")
                region = region_cell.get_text(strip=True)
            
            if region not in VALID_REGIONS:
                continue
            
            # Extract release date from Cell 8 (Release Date column)
            release_cell = cells[7]  # Index 7 for 8th column
            release_date_attr = release_cell.get('data-release')
            if not release_date_attr:
                continue
            
            release_date = clean_release_date(release_date_attr)
            
            # Extract character image from Cell 1 (Icon column)
            icon_cell = cells[0]
            icon_img = icon_cell.find('img')
            if not icon_img:
                continue
            
            # Try data-src first (lazy loading), then src
            image_url = icon_img.get('data-src') or icon_img.get('src')
            if not image_url or image_url.startswith('data:image/gif'):
                continue
            
            # Clean the image URL by removing scaling parameters
            image_url = clean_image_url(image_url)
            
            character = {
                'name': name,
                'element': element,
                'imageUrl': image_url,
                'rarity': rarity,
                'weapon': weapon,
                'region': region,
                'releaseDate': release_date
            }
            
            characters.append(character)
            print(f"Scraped: {name} ({element}, {weapon}, {region}, {rarity}★, {release_date})")
            
        except Exception as e:
            print(f"Error processing character row: {e}")
            continue
    
    return characters


def sort_characters_by_rarity_and_release_date(characters):
    """Sort characters by rarity (5-star first), then by release date (newest first within same rarity)"""
    def get_sort_key(char):
        try:
            # Parse release date for sorting
            release_date = datetime.strptime(char['releaseDate'], '%Y-%m-%d')
            # Return tuple: (-rarity, -release_date) for descending order
            return (-char['rarity'], -release_date.timestamp())
        except ValueError:
            # Put invalid dates at the end
            return (-char['rarity'], 0)
    
    return sorted(characters, key=get_sort_key)


def scrape_element_and_weapon_images():
    """Scrape element and weapon images from the Fandom page"""
    print("Fetching element and weapon images from genshin-impact.fandom.com...")
    
    try:
        response = requests.get(CHARACTERS_URL, headers=HEADERS, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error fetching Fandom page: {e}")
        return {}, {}
    
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find the table with data-release elements (Playable Characters table)
    tables = soup.find_all('table')
    target_table = None
    
    for table in tables:
        data_release_elements = table.find_all(attrs={'data-release': True})
        if data_release_elements:
            target_table = table
            break
    
    if not target_table:
        print("Could not find the Playable Characters table")
        return {}, {}
    
    element_images = {}
    weapon_images = {}
    
    # Process each row to collect element and weapon images
    rows = target_table.find_all('tr')[1:]  # Skip header row
    
    for row in rows:
        try:
            cells = row.find_all(['td', 'th'])
            if len(cells) < 9:  # Ensure we have all 9 columns
                continue
            
            # Extract element image from Cell 4 (Element column)
            element_cell = cells[3]
            element_links = element_cell.find_all('a')
            if element_links:
                element = element_links[-1].get_text(strip=True)
                element_img = element_cell.find('img')
                if element_img and element not in element_images:
                    element_url = element_img.get('data-src') or element_img.get('src')
                    if element_url:
                        element_images[element] = clean_image_url(element_url)
            
            # Extract weapon image from Cell 5 (Weapon column)
            weapon_cell = cells[4]
            weapon_links = weapon_cell.find_all('a')
            if weapon_links:
                weapon = weapon_links[-1].get_text(strip=True)
                weapon_img = weapon_cell.find('img')
                if weapon_img and weapon not in weapon_images:
                    weapon_url = weapon_img.get('data-src') or weapon_img.get('src')
                    if weapon_url:
                        weapon_images[weapon] = clean_image_url(weapon_url)
        
        except Exception as e:
            print(f"Error processing row for images: {e}")
            continue
    
    print(f"Found {len(element_images)} element images and {len(weapon_images)} weapon images")
    return element_images, weapon_images


def generate_element_images_file(element_images):
    """Generate the elements.ts file with element images and original URLs"""
    ts_content = "import type { Element } from './types';\n\n"
    ts_content += "export const elementImages: Record<Element, string> = {\n"
    
    for element, image_url in element_images.items():
        ts_content += f"  '{element}': '/genshin-tierlist-maker/element/{element.lower()}.png',\n"
    
    ts_content += "};\n\n"
    ts_content += "export const elementOriginalUrls: Record<Element, string> = {\n"
    
    for element, image_url in element_images.items():
        ts_content += f"  '{element}': '{image_url}',\n"
    
    ts_content += "};\n"
    return ts_content


def generate_weapon_images_file(weapon_images):
    """Generate the weapons.ts file with weapon images and original URLs"""
    ts_content = "import type { Weapon } from './types';\n\n"
    ts_content += "export const weaponImages: Record<Weapon, string> = {\n"
    
    for weapon, image_url in weapon_images.items():
        ts_content += f"  '{weapon}': '/genshin-tierlist-maker/weapon/{weapon.lower()}.png',\n"
    
    ts_content += "};\n\n"
    ts_content += "export const weaponOriginalUrls: Record<Weapon, string> = {\n"
    
    for weapon, image_url in weapon_images.items():
        ts_content += f"  '{weapon}': '{image_url}',\n"
    
    ts_content += "};\n"
    return ts_content


def generate_typescript_file(characters):
    """Generate the characters.ts file"""
    
    # Generate TypeScript content
    ts_content = "import type { Character } from './types';\n\n"
    ts_content += "// Generated character list with data from genshin-impact.fandom.com\n"
    ts_content += "export const characters: Character[] = [\n"
    
    for char in characters:
        # Generate imagePath from character name
        image_path = f"/genshin-tierlist-maker/character/{re.sub(r'[^a-z0-9_]', '', char['name'].lower().replace(' ', '_'))}.png"
        ts_content += f"  {{ name: '{char['name']}', element: '{char['element']}', rarity: {char['rarity']}, weapon: '{char['weapon']}', region: '{char['region']}', releaseDate: '{char['releaseDate']}', imageUrl: '{char['imageUrl']}', imagePath: '{image_path}' }},\n"
    
    ts_content += "];\n"
    return ts_content


def get_character_data():
    """Get character data from Fandom wiki and return it as a dictionary keyed by (element, rarity, name)"""
    print("Fetching character data from genshin-impact.fandom.com...")
    
    characters = scrape_character_data()
    
    if not characters:
        print("No characters found. The website structure may have changed.")
        return {}
    
    print(f"Successfully scraped {len(characters)} characters from Fandom")
    
    # Create a lookup dictionary keyed by (element, rarity, name) for easy matching
    character_lookup = {}
    for char in characters:
        key = (char['element'], char['rarity'], char['name'])
        character_lookup[key] = char
    
    return character_lookup


def main():
    """Main function"""
    print("Genshin Impact Character Data Scraper - Fandom Wiki")
    print("=" * 50)
    
    # Scrape character data from genshin-impact.fandom.com
    characters = scrape_character_data()
    
    if not characters:
        print("No characters found. The website structure may have changed.")
        print("Please check the selectors in the script and update them accordingly.")
        return
    
    print(f"\nSuccessfully scraped {len(characters)} characters")
    
    # Sort characters by rarity and release date
    characters = sort_characters_by_rarity_and_release_date(characters)
    
    # Scrape element and weapon images
    element_images, weapon_images = scrape_element_and_weapon_images()
    
    # Generate TypeScript files
    characters_ts = generate_typescript_file(characters)
    elements_ts = generate_element_images_file(element_images)
    weapons_ts = generate_weapon_images_file(weapon_images)
    
    # Write files
    try:
        with open(CHARACTERS_OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(characters_ts)
        print(f"\nSuccessfully generated {CHARACTERS_OUTPUT_FILE}")
        
        with open(ELEMENTS_OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(elements_ts)
        print(f"Successfully generated {ELEMENTS_OUTPUT_FILE}")
        
        with open(WEAPONS_OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write(weapons_ts)
        print(f"Successfully generated {WEAPONS_OUTPUT_FILE}")
        
        # Show summary by element
        element_counts = {}
        for char in characters:
            element = char['element']
            element_counts[element] = element_counts.get(element, 0) + 1
        
        print("\nCharacters by element:")
        for element, count in sorted(element_counts.items()):
            print(f"  {element}: {count}")
        
        # Show summary by rarity
        rarity_counts = {}
        for char in characters:
            rarity = char['rarity']
            rarity_counts[rarity] = rarity_counts.get(rarity, 0) + 1
        
        print("\nCharacters by rarity:")
        for rarity in sorted(rarity_counts.keys()):
            print(f"  {rarity}★: {rarity_counts[rarity]}")
        
        # Show summary by weapon
        weapon_counts = {}
        for char in characters:
            weapon = char['weapon']
            weapon_counts[weapon] = weapon_counts.get(weapon, 0) + 1
        
        print("\nCharacters by weapon:")
        for weapon, count in sorted(weapon_counts.items()):
            print(f"  {weapon}: {count}")
        
        # Show summary by region
        region_counts = {}
        for char in characters:
            region = char['region']
            region_counts[region] = region_counts.get(region, 0) + 1
        
        print("\nCharacters by region:")
        for region, count in sorted(region_counts.items()):
            print(f"  {region}: {count}")
        
    except Exception as e:
        print(f"Error writing file: {e}")


if __name__ == "__main__":
    main()

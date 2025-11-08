#!/usr/bin/env python3
"""
Genshin Impact Character Data Scraper - Fandom Wiki Version
Scrapes character data from genshin-impact.fandom.com for enrichment
"""

import requests
from bs4 import BeautifulSoup, Tag
import re
from typing import TypedDict, Any


# Type definitions
class FandomCharacterData(TypedDict):
    """Character data from Fandom wiki"""

    name: str
    element: str
    rarity: int
    weapon: str
    region: str
    releaseDate: str


# Web Scraping Configuration
BASE_URL = "https://genshin-impact.fandom.com"
CHARACTERS_URL = f"{BASE_URL}/wiki/Character/List"
REQUEST_TIMEOUT = 30  # Timeout in seconds for web requests

# HTTP Headers for web requests
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
}

# Character Data Validation
MIN_NAME_LENGTH = 2
MAX_NAME_LENGTH = 30
VALID_ELEMENTS = ["Pyro", "Hydro", "Electro", "Cryo", "Anemo", "Geo", "Dendro"]
VALID_WEAPONS = ["Sword", "Claymore", "Polearm", "Catalyst", "Bow"]
VALID_REGIONS = [
    "Mondstadt",
    "Liyue",
    "Inazuma",
    "Sumeru",
    "Fontaine",
    "Natlan",
    "Snezhnaya",
    "Nod-Krai",
    "None",
]
VALID_RARITIES = [4, 5]

# Character Filtering
SKIP_TRAVELER = False  # Include Traveler character variants


def clean_release_date(date_string: str) -> str:
    """Clean release date to YYYY-MM-DD format"""
    date_string = re.sub(r'\s+\d{2}:\d{2}:\d{2}.*$', '', date_string)
    return date_string


def extract_text_from_last_link(cell: Tag) -> str:
    """Extract text from the last link in a cell, or from the cell itself if no links"""
    links = cell.find_all("a")
    assert all(isinstance(link, Tag) for link in links)
    if links:
        return links[-1].get_text(strip=True)
    return cell.get_text(strip=True)


def process_character_row(cells: list[Tag | Any]) -> FandomCharacterData | None:
    """Process a single character row and return character data if valid"""
    if len(cells) < 9:
        return None

    name_cell = cells[1]
    assert isinstance(name_cell, Tag)
    name_link = name_cell.find("a")
    if not name_link or not isinstance(name_link, Tag):
        return None
    name = name_link.get_text(strip=True)

    if not name or len(name) < MIN_NAME_LENGTH or len(name) > MAX_NAME_LENGTH:
        return None

    if SKIP_TRAVELER and name.startswith("Traveler"):
        return None

    quality_cell = cells[2]
    assert isinstance(quality_cell, Tag)
    rarity_img = quality_cell.find("img")
    if not rarity_img or not isinstance(rarity_img, Tag):
        return None

    alt_text = rarity_img.get("alt")
    if not alt_text or not isinstance(alt_text, str):
        return None

    if "4 Stars" in alt_text:
        rarity = 4
    elif "5 Stars" in alt_text:
        rarity = 5
    else:
        return None

    if rarity not in VALID_RARITIES:
        return None

    element_cell = cells[3]
    assert isinstance(element_cell, Tag)
    element = extract_text_from_last_link(element_cell)
    if not element or element not in VALID_ELEMENTS:
        return None

    weapon_cell = cells[4]
    assert isinstance(weapon_cell, Tag)
    weapon = extract_text_from_last_link(weapon_cell)
    if not weapon or weapon not in VALID_WEAPONS:
        return None

    region_cell = cells[5]
    assert isinstance(region_cell, Tag)
    region = extract_text_from_last_link(region_cell)
    if not region or region not in VALID_REGIONS:
        return None

    release_cell = cells[7]
    assert isinstance(release_cell, Tag)
    release_date_attr = release_cell.get("data-release")
    if not release_date_attr or not isinstance(release_date_attr, str):
        return None

    release_date = clean_release_date(release_date_attr)

    return {
        "name": name,
        "element": element,
        "rarity": rarity,
        "weapon": weapon,
        "region": region,
        "releaseDate": release_date,
    }


def scrape_character_data() -> list[FandomCharacterData]:
    """Scrape character data from genshin-impact.fandom.com"""
    print("Fetching character data from genshin-impact.fandom.com...")

    try:
        response = requests.get(
            CHARACTERS_URL, headers=HEADERS, timeout=REQUEST_TIMEOUT
        )
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"Error fetching characters page: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    characters: list[FandomCharacterData] = []

    tables = soup.find_all("table")
    target_table: Tag | None = None
    data_release_elements: list[Any] = []

    for table in tables:
        assert isinstance(table, Tag)
        temp_elements = table.find_all(attrs={"data-release": True})
        if temp_elements:
            data_release_elements = list(temp_elements)
            target_table = table
            break

    if not target_table:
        print("Could not find the Playable Characters table")
        return []

    print(
        f"Found Playable Characters table with {len(data_release_elements)} characters"
    )

    rows = target_table.find_all("tr")[1:]
    print(f"Processing {len(rows)} rows...")

    for row in rows:
        assert isinstance(row, Tag)
        try:
            cells = row.find_all(["td", "th"])
            character = process_character_row(cells)
            if character:
                characters.append(character)
                print(
                    f"Scraped: {character['name']} ({character['element']}, "
                    f"{character['weapon']}, {character['region']}, {character['rarity']}★, "
                    f"{character['releaseDate']})"
                )
        except Exception as e:
            print(f"Error processing character row: {e}")
            continue

    return characters


def get_character_data() -> dict[tuple[str, int, str], FandomCharacterData]:
    """Get character data from Fandom wiki and return it as a dictionary keyed by (element, rarity, name)"""
    print("Fetching character data from genshin-impact.fandom.com...")

    characters = scrape_character_data()

    if not characters:
        print("No characters found. The website structure may have changed.")
        return {}

    print(f"Successfully scraped {len(characters)} characters from Fandom")

    character_lookup: dict[tuple[str, int, str], FandomCharacterData] = {}
    for char in characters:
        key = (char["element"], char["rarity"], char["name"])
        character_lookup[key] = char

    return character_lookup

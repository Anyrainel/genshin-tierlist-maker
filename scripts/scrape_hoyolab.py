#!/usr/bin/env python3
"""
Simplified Genshin Impact Character Data Scraper
Scrapes character data from Hoyolab wiki and generates TypeScript files
"""

import os
import sys
import io
import json
import requests
from typing import Any, TypedDict
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from webdriver_manager.chrome import ChromeDriverManager
from scrape_fandom import get_character_data
import time
import re


# Type definitions
class CharacterDataBase(TypedDict):
    """Required fields for character data"""

    name: str
    element: str
    rarity: int
    image_url: str


class CharacterData(CharacterDataBase, total=False):
    """Character data with optional enrichment fields"""

    weapon: str
    region: str
    releaseDate: str
    nameZh: str


class ElementData(TypedDict):
    name: str
    image_url: str


class WeaponData(TypedDict):
    name: str
    image_url: str


# Global configuration flags
SKIP_EXISTING_IMAGES = True  # Set to False to re-download all images

# Known elements and weapons
KNOWN_ELEMENTS = {"Pyro", "Hydro", "Electro", "Cryo", "Anemo", "Geo", "Dendro"}
KNOWN_WEAPONS = {"Sword", "Claymore", "Polearm", "Catalyst", "Bow"}

PLACEHOLDER_PATTERNS = ["avatar.7663739.png", "_nuxt/img/avatar"]


def setup_driver() -> WebDriver:
    """Setup Chrome driver with proper options for scraping"""
    chrome_options = Options()

    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("--disable-background-networking")
    chrome_options.add_argument("--disable-default-apps")
    chrome_options.add_argument("--disable-sync")
    chrome_options.add_argument("--disable-translate")
    chrome_options.add_argument("--log-level=3")
    chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])  # pyright: ignore[reportUnknownMemberType]
    chrome_options.add_argument(
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    )
    chrome_options.page_load_strategy = "normal"

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver


def extract_element_from_src(src: str) -> str | None:
    """Extract element type from image src URL"""
    src_lower = src.lower()
    for element in KNOWN_ELEMENTS:
        if element.lower() in src_lower:
            return element
    return None


def extract_rarity_from_class(class_str: str) -> int | None:
    """Extract rarity from CSS class"""
    if "d-img-level-5" in class_str:
        return 5
    elif "d-img-level-4" in class_str:
        return 4
    return None


def download_image(url: str, filepath: str) -> bool:
    """Download an image from URL to filepath"""
    if SKIP_EXISTING_IMAGES and os.path.exists(filepath):
        print(f"Skipping existing image: {os.path.basename(filepath)}")
        return True

    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()

        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "wb") as f:
            f.write(response.content)
        print(f"Downloaded: {os.path.basename(filepath)}")
        return True
    except Exception as e:
        print(f"Failed to download image {url}: {e}")
        return False


def clean_image_url(url: str) -> str:
    """Clean image URL by removing query parameters"""
    if not url:
        return url
    if "?" in url:
        return url.split("?")[0]
    return url


def wait_for_images_to_load(
    driver: WebDriver, selector: str, max_wait: int = 30
) -> bool:
    """Wait for all images to load and replace placeholder URLs"""
    print("Waiting for images to load...")

    start_time = time.time()

    while time.time() - start_time < max_wait:
        images = driver.find_elements(By.CSS_SELECTOR, selector)

        placeholder_found = False
        placeholder_count = 0

        for img in images:
            src = img.get_attribute("src")  # pyright: ignore[reportUnknownMemberType]
            if src:
                for pattern in PLACEHOLDER_PATTERNS:
                    if pattern in src:
                        placeholder_found = True
                        placeholder_count += 1
                        break

        if not placeholder_found:
            print("All images loaded successfully!")
            return True

        print(f"Found {placeholder_count} placeholder images, waiting...")

        driver.execute_script("window.scrollBy(0, 500);")  # pyright: ignore[reportUnknownMemberType]
        time.sleep(2)

        driver.execute_script("window.scrollBy(0, -200);")  # pyright: ignore[reportUnknownMemberType]
        time.sleep(1)

    print(f"Warning: Some images may not have loaded after {max_wait} seconds")
    return False


def scroll_until_all_loaded(
    driver: WebDriver, card_selector: str, max_scrolls: int = 20
) -> int:
    """Scroll until no new cards are loaded"""
    print("Scrolling to load all cards...")

    previous_count = 0
    current_count = 0
    scroll_count = 0

    while scroll_count < max_scrolls:
        current_count = len(driver.find_elements(By.CSS_SELECTOR, card_selector))

        print(f"Scroll {scroll_count + 1}: Found {current_count} cards")

        if current_count > previous_count:
            previous_count = current_count
        elif current_count == previous_count:
            print(f"Card count stable at {current_count} for 1 scroll, stopping...")
            break

        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")  # pyright: ignore[reportUnknownMemberType]
        time.sleep(2)
        scroll_count += 1

    if scroll_count >= max_scrolls:
        print(
            f"Reached maximum scroll limit ({max_scrolls}), proceeding with {current_count} cards"
        )

    return previous_count


def process_character_card(card: WebElement, i: int) -> CharacterData | None:
    """Process a single character card and return character data if valid"""
    try:
        name_element = card.find_element( # pyright: ignore[reportUnknownMemberType]
            By.CSS_SELECTOR, "div.character-card-name span"
        )
        name = name_element.text.strip()

        try:
            element_img = card.find_element( # pyright: ignore[reportUnknownMemberType]
                By.CSS_SELECTOR, "img.character-card-element"
            )
            element_src = element_img.get_attribute("src") # pyright: ignore[reportUnknownMemberType]
            if not element_src:
                print(f"Skipping character {i + 1} {name}: element src is empty")
                return None
            element = extract_element_from_src(element_src)
        except NoSuchElementException:
            print(f"Skipping character {i + 1} {name}: element image not found")
            return None

        assert element is not None, (
            f"Character {i + 1} {name}: Could not extract valid element from src '{element_src}'"
        )

        icon_div = card.find_element(By.CSS_SELECTOR, "div.character-card-icon") # pyright: ignore[reportUnknownMemberType]
        rarity_classes = icon_div.get_attribute("class") # pyright: ignore[reportUnknownMemberType]
        if not rarity_classes:
            print(f"Skipping character {i + 1} {name}: rarity class is empty")
            return None
        rarity = extract_rarity_from_class(rarity_classes)
        if rarity is None:
            print(f"Skipping character {i + 1} {name}: rarity not found")
            return None

        char_img = card.find_element(By.CSS_SELECTOR, "img.d-img-show") # pyright: ignore[reportUnknownMemberType]
        original_image_url = char_img.get_attribute("src") # pyright: ignore[reportUnknownMemberType]
        if not original_image_url:
            print(f"Skipping character {i + 1} {name}: image url is empty")
            return None

        if any(pattern in original_image_url for pattern in PLACEHOLDER_PATTERNS):
            print(
                f"ERROR: Character {i + 1} {name} has placeholder image: {original_image_url}"
            )
            return None

        cleaned_image_url = clean_image_url(original_image_url)

        return {
            "name": name,
            "element": element,
            "rarity": rarity,
            "image_url": cleaned_image_url,
        }
    except Exception as e:
        print(f"Error processing character {i + 1}: {e}")
        return None


def scrape_characters(driver: WebDriver, lang: str = "en") -> list[CharacterData]:
    """Scrape character data from the wiki"""
    print(f"Scraping characters (language: {lang})...")

    character_url = f"https://wiki.hoyolab.com/pc/genshin/aggregate/2?lang={lang}"
    driver.get(character_url)
    time.sleep(2)

    scroll_until_all_loaded(driver, "article.character-card")
    wait_for_images_to_load(driver, "article.character-card img.d-img-show")

    character_cards = driver.find_elements(By.CSS_SELECTOR, "article.character-card")
    print(f"Found {len(character_cards)} character cards")

    characters: list[CharacterData] = []
    for i, card in enumerate(character_cards):
        character_data = process_character_card(card, i)
        if character_data:
            characters.append(character_data)
            print(
                f"Character {i + 1}: {character_data['name']} "
                f"({character_data['element']}, {character_data['rarity']}*)"
            )

    return characters


def process_filter_images(
    imgs: list[WebElement], valid_names: set[str], filter_type: str
) -> list[ElementData | WeaponData]:
    """Process filter images (elements or weapons) and return data list"""
    results: list[ElementData | WeaponData] = []
    for img in imgs:
        try:
            alt_text = img.get_attribute("alt") # pyright: ignore[reportUnknownMemberType]
            src_url = img.get_attribute("src") # pyright: ignore[reportUnknownMemberType]

            if alt_text and src_url:
                if alt_text in valid_names:
                    cleaned_url = clean_image_url(src_url)
                    results.append({"name": alt_text, "image_url": cleaned_url})
                    print(f"Found {filter_type}: {alt_text}")
                else:
                    print(
                        f"Warning: Unknown {filter_type} '{alt_text}' found, skipping"
                    )
        except Exception as e:
            print(f"Error processing {filter_type} image: {e}")
            continue
    return results


def scrape_elements_and_weapons(
    driver: WebDriver, lang: str = "en"
) -> tuple[list[ElementData], list[WeaponData]]:
    """Scrape element and weapon images from the character page filters"""
    print(f"Scraping elements and weapons (language: {lang})...")

    character_url = f"https://wiki.hoyolab.com/pc/genshin/aggregate/2?lang={lang}"
    driver.get(character_url)
    time.sleep(3)

    elements: list[ElementData] = []
    weapons: list[WeaponData] = []

    try:
        print("Looking for filter grid...")
        filter_grid = driver.find_element(By.CSS_SELECTOR, "div.tw-grid")
        print("Found filter grid")
        filter_items = filter_grid.find_elements( # pyright: ignore[reportUnknownMemberType]
            By.CSS_SELECTOR, "div.tw-flex-items-center"
        )
        print(f"Found {len(filter_items)} filter items")

        if len(filter_items) >= 2:
            element_container = filter_items[0]
            element_imgs = element_container.find_elements(By.CSS_SELECTOR, "img") # pyright: ignore[reportUnknownMemberType]
            print(f"Found {len(element_imgs)} element images")
            elements = process_filter_images(element_imgs, KNOWN_ELEMENTS, "element")

            weapon_container = filter_items[1]
            weapon_imgs = weapon_container.find_elements(By.CSS_SELECTOR, "img") # pyright: ignore[reportUnknownMemberType]
            print(f"Found {len(weapon_imgs)} weapon images")
            weapons = process_filter_images(weapon_imgs, KNOWN_WEAPONS, "weapon")

        print(f"Found {len(elements)} elements and {len(weapons)} weapons")

    except Exception as e:
        print(f"Error scraping elements and weapons: {e}")

    return elements, weapons


def enrich_character_data_with_fandom(
    characters: list[CharacterData],
    fandom_data: dict[tuple[str, int, str], Any],
    zh_characters: list[CharacterData] | None = None,
) -> list[CharacterData]:
    """Enrich character data with weapon, region, release date from Fandom data and Chinese names"""
    enriched_characters: list[CharacterData] = []

    zh_name_map: dict[str, str] = {}
    if zh_characters:
        for i, zh_char in enumerate(zh_characters):
            if i < len(characters):
                zh_name_map[characters[i]["name"]] = zh_char["name"]

    for char in characters:
        key = (char["element"], char["rarity"], char["name"])
        fandom_char = fandom_data.get(key)

        if fandom_char:
            enriched_char = char.copy()
            enriched_char["weapon"] = fandom_char["weapon"]
            enriched_char["region"] = fandom_char["region"]
            enriched_char["releaseDate"] = fandom_char["releaseDate"]
            if char["name"] in zh_name_map:
                enriched_char["nameZh"] = zh_name_map[char["name"]]
            enriched_characters.append(enriched_char)
            print(
                f"Enriched {char['name']}: {fandom_char['weapon']}, {fandom_char['region']}, {fandom_char['releaseDate']}"
            )
        else:
            enriched_char = char.copy()
            enriched_char["weapon"] = "Sword"
            enriched_char["region"] = "None"
            enriched_char["releaseDate"] = "2020-09-28"
            if char["name"] in zh_name_map:
                enriched_char["nameZh"] = zh_name_map[char["name"]]
            enriched_characters.append(enriched_char)
            print(
                f"Using defaults for {char['name']}: {enriched_char['weapon']}, {enriched_char['region']}, {enriched_char['releaseDate']}"
            )

    return enriched_characters


def save_typescript_data(
    characters: list[CharacterData],
    elements: list[ElementData],
    weapons: list[WeaponData],
) -> None:
    """Save scraped data in TypeScript format"""

    character_data: list[dict[str, Any]] = []
    for char in characters:
        image_path = f"/genshin-tierlist-maker/character/{re.sub(r'[^a-z0-9_]', '', char['name'].lower().replace(' ', '_'))}.png"
        char_obj: dict[str, Any] = {
            "name": char["name"],
            "element": char["element"],
            "rarity": char["rarity"],
            "weapon": char.get("weapon", "Sword"),
            "region": char.get("region", "None"),
            "releaseDate": char.get("releaseDate", "2020-09-28"),
            "imageUrl": char["image_url"],
            "imagePath": image_path,
        }
        if "nameZh" in char:
            char_obj["nameZh"] = char["nameZh"]
        character_data.append(char_obj)

    element_images: dict[str, str] = {}
    element_original_urls: dict[str, str] = {}
    for element in elements:
        element_images[element["name"]] = (
            f"/genshin-tierlist-maker/element/{element['name'].lower()}.png"
        )
        element_original_urls[element["name"]] = element["image_url"]

    weapon_images: dict[str, str] = {}
    weapon_original_urls: dict[str, str] = {}
    for weapon in weapons:
        weapon_images[weapon["name"]] = (
            f"/genshin-tierlist-maker/weapon/{weapon['name'].lower()}.png"
        )
        weapon_original_urls[weapon["name"]] = weapon["image_url"]

    with open("src/data/characters.ts", "w", encoding="utf-8") as f:
        f.write("import type { Character } from './types';\n\n")
        f.write("// Generated character list with data from Hoyolab wiki\n")
        f.write("export const characters: Character[] = ")
        f.write(json.dumps(character_data, indent=2, ensure_ascii=False))
        f.write(";\n")

    with open("src/data/elements.ts", "w", encoding="utf-8") as f:
        f.write("import type { Element } from './types';\n\n")
        f.write("export const elementImages: Record<Element, string> = ")
        f.write(json.dumps(element_images, indent=2, ensure_ascii=False))
        f.write(";\n\n")
        f.write("export const elementOriginalUrls: Record<Element, string> = ")
        f.write(json.dumps(element_original_urls, indent=2, ensure_ascii=False))
        f.write(";\n")

    with open("src/data/weapons.ts", "w", encoding="utf-8") as f:
        f.write("import type { Weapon } from './types';\n\n")
        f.write("export const weaponImages: Record<Weapon, string> = ")
        f.write(json.dumps(weapon_images, indent=2, ensure_ascii=False))
        f.write(";\n\n")
        f.write("export const weaponOriginalUrls: Record<Weapon, string> = ")
        f.write(json.dumps(weapon_original_urls, indent=2, ensure_ascii=False))
        f.write(";\n")


def download_all_images(
    characters: list[CharacterData],
    elements: list[ElementData],
    weapons: list[WeaponData],
) -> None:
    """Download all character, element, and weapon images"""
    print("Downloading character images...")
    for char in characters:
        filename = re.sub(r"[^a-z0-9_]", "", char["name"].lower().replace(" ", "_"))
        filepath = f"public/character/{filename}.png"
        download_image(char["image_url"], filepath)

    print("Downloading element images...")
    for element in elements:
        filename = f"public/element/{element['name'].lower()}.png"
        download_image(element["image_url"], filename)

    print("Downloading weapon images...")
    for weapon in weapons:
        filename = f"public/weapon/{weapon['name'].lower()}.png"
        download_image(weapon["image_url"], filename)


def main() -> None:
    """Main function to orchestrate the scraping process"""
    print("=== Genshin Impact Wiki Scraper ===")
    print(f"Skip existing images: {SKIP_EXISTING_IMAGES}")
    print("=" * 40)

    print("\nFetching character data from Fandom wiki...")
    fandom_data = get_character_data()
    print(f"Found {len(fandom_data)} characters in Fandom data")

    driver = setup_driver()

    try:
        characters = scrape_characters(driver, lang="en")
        zh_characters = scrape_characters(driver, lang="zh")
        elements, weapons = scrape_elements_and_weapons(driver, lang="en")

        enriched_characters = enrich_character_data_with_fandom(
            characters, fandom_data, zh_characters
        )

        save_typescript_data(enriched_characters, elements, weapons)
        download_all_images(enriched_characters, elements, weapons)

        print("Scraping completed successfully!")

    finally:
        driver.quit()


if __name__ == "__main__":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")
    main()

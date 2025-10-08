#!/usr/bin/env python3
"""
Simplified Genshin Impact Character Data Scraper
Scrapes character data from Hoyolab wiki and generates TypeScript files
"""

import os
import json
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from webdriver_manager.chrome import ChromeDriverManager
from scrape_fandom import get_character_data
import time
import re

# Global configuration flags
SKIP_EXISTING_IMAGES = True  # Set to False to re-download all images

def setup_driver():
    """Setup Chrome driver with proper options for scraping"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def extract_element_from_src(src):
    """Extract element type from image src URL"""
    if "pyro" in src.lower():
        return "Pyro"
    elif "hydro" in src.lower():
        return "Hydro"
    elif "electro" in src.lower():
        return "Electro"
    elif "cryo" in src.lower():
        return "Cryo"
    elif "anemo" in src.lower():
        return "Anemo"
    elif "geo" in src.lower():
        return "Geo"
    elif "dendro" in src.lower():
        return "Dendro"
    else:
        return "Pyro"  # Default fallback

def extract_rarity_from_class(class_str):
    """Extract rarity from CSS class"""
    if "d-img-level-5" in class_str:
        return 5
    elif "d-img-level-4" in class_str:
        return 4
    else:
        return None  # Skip if neither level found

def download_image(url, filepath):
    """Download an image from URL to filepath"""
    # Check if image already exists and skip flag is enabled
    if SKIP_EXISTING_IMAGES and os.path.exists(filepath):
        print(f"Skipping existing image: {os.path.basename(filepath)}")
        return True
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, 'wb') as f:
            f.write(response.content)
        print(f"Downloaded: {os.path.basename(filepath)}")
        return True
    except Exception as e:
        print(f"Failed to download image {url}: {e}")
        return False

def clean_image_url(url):
    """Clean image URL by removing query parameters and ensuring .png extension"""
    if not url:
        return url
    
    # Remove query parameters (everything after ?)
    if '?' in url:
        url = url.split('?')[0]
    
    return url

def wait_for_images_to_load(driver, selector, max_wait=30):
    """Wait for all images to load and replace placeholder URLs"""
    print("Waiting for images to load...")
    
    start_time = time.time()
    placeholder_patterns = [
        "avatar.7663739.png",  # Generic placeholder
        "_nuxt/img/avatar",    # Nuxt placeholder pattern
        "placeholder",          # Generic placeholder keyword
        "default-avatar",       # Default avatar pattern
    ]
    
    while time.time() - start_time < max_wait:
        # Find all images with the selector
        images = driver.find_elements(By.CSS_SELECTOR, selector)
        
        # Check if any images still have placeholder URLs
        placeholder_found = False
        placeholder_count = 0
        
        for img in images:
            src = img.get_attribute("src")
            if src:
                for pattern in placeholder_patterns:
                    if pattern in src:
                        placeholder_found = True
                        placeholder_count += 1
                        break
        
        if not placeholder_found:
            print("All images loaded successfully!")
            return True
        
        print(f"Found {placeholder_count} placeholder images, waiting...")
        
        # Scroll a bit to trigger lazy loading
        driver.execute_script("window.scrollBy(0, 500);")
        time.sleep(2)
        
        # Also try scrolling back up to trigger any images that might be above
        driver.execute_script("window.scrollBy(0, -200);")
        time.sleep(1)
    
    print(f"Warning: Some images may not have loaded after {max_wait} seconds")
    return False

def scroll_until_all_loaded(driver, card_selector, max_scrolls=20):
    """Scroll until no new cards are loaded"""
    print("Scrolling to load all cards...")
    
    previous_count = 0
    stable_count = 0
    scroll_count = 0
    
    while scroll_count < max_scrolls:
        # Count current cards
        current_cards = driver.find_elements(By.CSS_SELECTOR, card_selector)
        current_count = len(current_cards)
        
        print(f"Scroll {scroll_count + 1}: Found {current_count} cards")
        
        if current_count > previous_count:
            # New cards loaded, reset stability counter
            previous_count = current_count
            stable_count = 0
        elif current_count == previous_count:
            # No new cards, increment stability counter
            stable_count += 1
            if stable_count >= 1:  # Stable for 1 scroll
                print(f"Card count stable at {current_count} for 1 scroll, stopping...")
                break
        
        # Scroll down
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        scroll_count += 1
    
    if scroll_count >= max_scrolls:
        print(f"Reached maximum scroll limit ({max_scrolls}), proceeding with {current_count} cards")
    
    # Final scroll back to top to ensure all content is loaded
    print("Scrolling back to top to ensure all content is loaded...")
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(2)
    
    # Scroll back down slowly to trigger any remaining lazy loading
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
    
    # Final count
    final_cards = driver.find_elements(By.CSS_SELECTOR, card_selector)
    final_count = len(final_cards)
    print(f"Final card count: {final_count}")
    
    return final_count

def scrape_characters(driver, lang="en"):
    """Scrape character data from the wiki"""
    print(f"Scraping characters (language: {lang})...")

    # Always add language parameter to URL for consistency
    character_url = f"https://wiki.hoyolab.com/pc/genshin/aggregate/2?lang={lang}"
    driver.get(character_url)
    time.sleep(5)  # Wait longer for page to fully load

    # Scroll until all characters are loaded
    scroll_until_all_loaded(driver, "article.character-card")

    # Wait for all character images to load
    wait_for_images_to_load(driver, "article.character-card img.d-img-show")

    character_cards = driver.find_elements(By.CSS_SELECTOR, "article.character-card")
    print(f"Found {len(character_cards)} character cards")

    characters = []
    for i, card in enumerate(character_cards):
        try:
            # Extract character data with error handling for each element
            try:
                name_element = card.find_element(By.CSS_SELECTOR, "div.character-card-name span")
                name = name_element.text.strip()
            except Exception:
                print(f"Skipping character {i+1}: name not found")
                continue

            try:
                # Get element from image src
                element_img = card.find_element(By.CSS_SELECTOR, "img.character-card-element")
                element_src = element_img.get_attribute("src")
                element = extract_element_from_src(element_src)
            except Exception:
                try:
                    print(f"Skipping {name}: element not found")
                except UnicodeEncodeError:
                    print(f"Skipping character: element not found")
                continue

            try:
                # Get rarity from class
                icon_div = card.find_element(By.CSS_SELECTOR, "div.character-card-icon")
                rarity_classes = icon_div.get_attribute("class")
                rarity = extract_rarity_from_class(rarity_classes)
                if rarity is None:
                    try:
                        print(f"Skipping {name}: rarity not found")
                    except UnicodeEncodeError:
                        print(f"Skipping character: rarity not found")
                    continue
            except Exception:
                try:
                    print(f"Skipping {name}: rarity not found")
                except UnicodeEncodeError:
                    print(f"Skipping character: rarity not found")
                continue

            try:
                # Get character image
                char_img = card.find_element(By.CSS_SELECTOR, "img.d-img-show")
                time.sleep(0.1)  # Small delay to ensure image is loaded
                original_image_url = char_img.get_attribute("src")

                # Double-check that this isn't a placeholder image
                if any(pattern in original_image_url for pattern in ["avatar.7663739.png", "_nuxt/img/avatar", "placeholder"]):
                    try:
                        print(f"ERROR: {name} has placeholder image: {original_image_url}")
                    except UnicodeEncodeError:
                        print(f"ERROR: Character has placeholder image")
                    continue

                cleaned_image_url = clean_image_url(original_image_url)  # Clean the URL
            except Exception as e:
                try:
                    print(f"ERROR: {name} - image element not found: {e}")
                except UnicodeEncodeError:
                    print(f"ERROR: Character - image element not found: {e}")
                continue

            character_data = {
                "name": name,
                "element": element,
                "rarity": rarity,
                "image_url": cleaned_image_url
            }

            characters.append(character_data)
            # Use encoding-safe print
            try:
                print(f"Character {i+1}: {name} ({element}, {rarity}*)")
            except UnicodeEncodeError:
                print(f"Character {i+1}: [name with special chars] ({element}, {rarity}*)")

        except Exception as e:
            print(f"Error processing character {i+1}: {e}")
            continue

    return characters

def scrape_elements_and_weapons(driver, lang="en"):
    """Scrape element and weapon images from the character page filters"""
    print(f"Scraping elements and weapons (language: {lang})...")

    # Always add language parameter to URL for consistency
    character_url = f"https://wiki.hoyolab.com/pc/genshin/aggregate/2?lang={lang}"
    driver.get(character_url)
    time.sleep(5)  # Wait for page to load
    
    elements = []
    weapons = []
    
    try:
        # Find the filter grid
        print("Looking for filter grid...")
        filter_grid = driver.find_element(By.CSS_SELECTOR, "div.tw-grid")
        print("Found filter grid")
        filter_items = filter_grid.find_elements(By.CSS_SELECTOR, "div.tw-flex-items-center")
        print(f"Found {len(filter_items)} filter items")
        
        if len(filter_items) >= 2:
            # First filter item is for elements
            element_container = filter_items[0]
            element_imgs = element_container.find_elements(By.CSS_SELECTOR, "img")
            print(f"Found {len(element_imgs)} element images")
            
            for img in element_imgs:
                try:
                    alt_text = img.get_attribute("alt")
                    src_url = img.get_attribute("src")
                    
                    if alt_text and src_url:
                        # Map alt text to element names
                        element_mapping = {
                            "Pyro": "Pyro",
                            "Hydro": "Hydro", 
                            "Electro": "Electro",
                            "Cryo": "Cryo",
                            "Anemo": "Anemo",
                            "Geo": "Geo",
                            "Dendro": "Dendro"
                        }
                        
                        if alt_text in element_mapping:
                            element_name = element_mapping[alt_text]
                            cleaned_url = clean_image_url(src_url)
                            
                            elements.append({
                                "name": element_name,
                                "image_url": cleaned_url
                            })
                            print(f"Found element: {element_name}")
                            
                except Exception as e:
                    print(f"Error processing element image: {e}")
                    continue
            
            # Second filter item is for weapons
            weapon_container = filter_items[1]
            weapon_imgs = weapon_container.find_elements(By.CSS_SELECTOR, "img")
            print(f"Found {len(weapon_imgs)} weapon images")
            
            for img in weapon_imgs:
                try:
                    alt_text = img.get_attribute("alt")
                    src_url = img.get_attribute("src")
                    
                    if alt_text and src_url:
                        # Map alt text to weapon names
                        weapon_mapping = {
                            "Sword": "Sword",
                            "Claymore": "Claymore",
                            "Polearm": "Polearm", 
                            "Catalyst": "Catalyst",
                            "Bow": "Bow"
                        }
                        
                        if alt_text in weapon_mapping:
                            weapon_name = weapon_mapping[alt_text]
                            cleaned_url = clean_image_url(src_url)
                            
                            weapons.append({
                                "name": weapon_name,
                                "image_url": cleaned_url
                            })
                            print(f"Found weapon: {weapon_name}")
                            
                except Exception as e:
                    print(f"Error processing weapon image: {e}")
                    continue
        
        print(f"Found {len(elements)} elements and {len(weapons)} weapons")
        
    except Exception as e:
        print(f"Error scraping elements and weapons: {e}")
    
    return elements, weapons

def enrich_character_data_with_fandom(characters, fandom_data, zh_characters=None):
    """Enrich character data with weapon, region, release date from Fandom data and Chinese names"""
    enriched_characters = []

    # Create a mapping from English name to Chinese name
    zh_name_map = {}
    if zh_characters:
        for zh_char in zh_characters:
            # Match by element and rarity to find corresponding English character
            for en_char in characters:
                # Approximate matching by position (assuming same order in both lists)
                # Since we're scraping the same source, order should be preserved
                pass
        # Create mapping by index (assuming same order)
        for i, zh_char in enumerate(zh_characters):
            if i < len(characters):
                zh_name_map[characters[i]["name"]] = zh_char["name"]

    for char in characters:
        # Try to find matching character in Fandom data by element, rarity, and name
        key = (char["element"], char["rarity"], char["name"])
        fandom_char = fandom_data.get(key)

        if fandom_char:
            # Use Fandom data for weapon, region, and release date
            enriched_char = char.copy()
            enriched_char["weapon"] = fandom_char["weapon"]
            enriched_char["region"] = fandom_char["region"]
            enriched_char["releaseDate"] = fandom_char["releaseDate"]
            # Add Chinese name if available
            if char["name"] in zh_name_map:
                enriched_char["nameZh"] = zh_name_map[char["name"]]
            enriched_characters.append(enriched_char)
            try:
                print(f"Enriched {char['name']}: {fandom_char['weapon']}, {fandom_char['region']}, {fandom_char['releaseDate']}")
            except UnicodeEncodeError:
                print(f"Enriched character: {fandom_char['weapon']}, {fandom_char['region']}, {fandom_char['releaseDate']}")
        else:
            # Use default values if no match found
            enriched_char = char.copy()
            enriched_char["weapon"] = "Sword"  # Default weapon type
            enriched_char["region"] = "None"   # Default region
            enriched_char["releaseDate"] = "2020-09-28"  # Default release date
            # Add Chinese name if available
            if char["name"] in zh_name_map:
                enriched_char["nameZh"] = zh_name_map[char["name"]]
            enriched_characters.append(enriched_char)
            try:
                print(f"Using defaults for {char['name']}: {enriched_char['weapon']}, {enriched_char['region']}, {enriched_char['releaseDate']}")
            except UnicodeEncodeError:
                print(f"Using defaults for character: {enriched_char['weapon']}, {enriched_char['region']}, {enriched_char['releaseDate']}")

    return enriched_characters

def save_typescript_data(characters, elements, weapons):
    """Save scraped data in TypeScript format"""

    # Create character data
    character_data = []
    for char in characters:
        # Generate imagePath from character name
        image_path = f"/genshin-tierlist-maker/character/{re.sub(r'[^a-z0-9_]', '', char['name'].lower().replace(' ', '_'))}.png"
        char_obj = {
            "name": char["name"],
            "element": char["element"],
            "rarity": char["rarity"],
            "weapon": char["weapon"],
            "region": char["region"],
            "releaseDate": char["releaseDate"],
            "imageUrl": char["image_url"],
            "imagePath": image_path
        }
        # Add Chinese name if available
        if "nameZh" in char:
            char_obj["nameZh"] = char["nameZh"]
        character_data.append(char_obj)
    
    # Create element data
    element_images = {}
    element_original_urls = {}
    for element in elements:
        element_images[element["name"]] = f"/genshin-tierlist-maker/element/{element['name'].lower()}.png"
        element_original_urls[element["name"]] = element["image_url"]
    
    # Create weapon data
    weapon_images = {}
    weapon_original_urls = {}
    for weapon in weapons:
        weapon_images[weapon["name"]] = f"/genshin-tierlist-maker/weapon/{weapon['name'].lower()}.png"
        weapon_original_urls[weapon["name"]] = weapon["image_url"]
    
    # Save characters.ts
    with open("src/data/characters.ts", "w", encoding="utf-8") as f:
        f.write("import type { Character } from './types';\n\n")
        f.write("// Generated character list with data from Hoyolab wiki\n")
        f.write("export const characters: Character[] = ")
        f.write(json.dumps(character_data, indent=2, ensure_ascii=False))
        f.write(";\n")
    
    # Save elements.ts
    with open("src/data/elements.ts", "w", encoding="utf-8") as f:
        f.write("import type { Element } from './types';\n\n")
        f.write("export const elementImages: Record<Element, string> = ")
        f.write(json.dumps(element_images, indent=2, ensure_ascii=False))
        f.write(";\n\n")
        f.write("export const elementOriginalUrls: Record<Element, string> = ")
        f.write(json.dumps(element_original_urls, indent=2, ensure_ascii=False))
        f.write(";\n")
    
    # Save weapons.ts
    with open("src/data/weapons.ts", "w", encoding="utf-8") as f:
        f.write("import type { Weapon } from './types';\n\n")
        f.write("export const weaponImages: Record<Weapon, string> = ")
        f.write(json.dumps(weapon_images, indent=2, ensure_ascii=False))
        f.write(";\n\n")
        f.write("export const weaponOriginalUrls: Record<Weapon, string> = ")
        f.write(json.dumps(weapon_original_urls, indent=2, ensure_ascii=False))
        f.write(";\n")

def download_all_images(characters, elements, weapons):
    """Download all character, element, and weapon images"""
    print("Downloading character images...")
    for char in characters:
        # Generate filename from character name
        filename = re.sub(r'[^a-z0-9_]', '', char['name'].lower().replace(' ', '_'))
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

def main():
    """Main function to orchestrate the scraping process"""
    print("=== Genshin Impact Wiki Scraper ===")
    print(f"Skip existing images: {SKIP_EXISTING_IMAGES}")
    print("=" * 40)

    # Get Fandom character data first
    print("\nFetching character data from Fandom wiki...")
    fandom_data = get_character_data()
    print(f"Found {len(fandom_data)} characters in Fandom data")

    driver = setup_driver()

    try:
        # Scrape English data
        characters = scrape_characters(driver, lang="en")

        # Scrape Chinese data
        zh_characters = scrape_characters(driver, lang="zh")

        # Scrape elements and weapons
        elements, weapons = scrape_elements_and_weapons(driver, lang="en")

        # Enrich character data with Fandom information and Chinese names
        enriched_characters = enrich_character_data_with_fandom(characters, fandom_data, zh_characters)

        # Save TypeScript data files
        save_typescript_data(enriched_characters, elements, weapons)

        # Download images
        download_all_images(enriched_characters, elements, weapons)

        print("Scraping completed successfully!")

    except Exception as e:
        print(f"Error during scraping: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    main()
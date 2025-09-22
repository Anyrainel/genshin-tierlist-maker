import { useState, useRef } from 'react';
import { Character } from '../data/types';
import { RARITY_COLORS } from '../constants/theme';
import { toast } from 'sonner';

interface UseDragAndDropProps {
    onTierAssignment: (dragName: string, dropName: string | null, tier: string, direction: 'left' | 'right') => void;
    onRemoveFromTiers: (dragName: string) => void;
}

interface DropPosition {
    element: string | null;
    tier: string | null;
    position: 'first' | 'last' | 'only' | null;
    cardName: string | null;
    direction: 'left' | 'right' | null;
}

export const useDragAndDrop = ({ onTierAssignment, onRemoveFromTiers }: UseDragAndDropProps) => {
    const [hoveredCardName, setHoveredCardName] = useState<string | null>(null);
    const [hoverDirection, setHoverDirection] = useState<'left' | 'right' | null>(null);

    // Use ref to track dragged character immediately (synchronous)
    const draggedCharacterRef = useRef<Character | null>(null);

    const calculateDropPosition = (e: React.DragEvent): DropPosition => {
        // Use ref for immediate access to dragged character
        const currentDraggedCharacter = draggedCharacterRef.current;
        // console.log('🔍 CALCULATE DROP POSITION: draggedCharacter =', currentDraggedCharacter);
        if (!currentDraggedCharacter) {
            return { element: null, tier: null, position: null, cardName: null, direction: null };
        }

        // Find the tier row
        const tierRow = (e.target as HTMLElement).closest('[data-tier]');
        if (!tierRow) {
            return { element: null, tier: null, position: null, cardName: null, direction: null };
        }

        const tier = tierRow.getAttribute('data-tier');
        if (!tier) {
            return { element: null, tier: null, position: null, cardName: null, direction: null };
        }

        // Find the element section
        const elementSection = (e.target as HTMLElement).closest('[data-element]');
        if (!elementSection) {
            return { element: null, tier: null, position: null, cardName: null, direction: null };
        }

        const dropElement = elementSection.getAttribute('data-element');
        if (!dropElement) {
            return { element: null, tier: null, position: null, cardName: null, direction: null };
        }

        // Check if dropping in the correct element section
        if (currentDraggedCharacter.element !== dropElement) {
            return { element: null, tier: null, position: null, cardName: null, direction: null };
        }

        // Get all cards in the element section
        let cards = Array.from(elementSection.querySelectorAll('[data-character-id]'));

        // Check if the element section itself is a card and add it if needed
        if (elementSection.hasAttribute('data-character-id') && !cards.includes(elementSection)) {
            cards = [elementSection, ...cards];
        }

        // If no cards in the tier, drop at first position
        if (cards.length === 0) {
            return { element: dropElement, tier, position: 'only', cardName: null, direction: null };
        }

        // Get the cell boundaries
        const dropPoint = { x: e.clientX, y: e.clientY };

        // Find the minimum top and maximum bottom boundaries
        let minTop = Infinity;
        let maxBottom = -Infinity;
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            minTop = Math.min(minTop, rect.top);
            maxBottom = Math.max(maxBottom, rect.bottom);
        }

        // If above all cards, drop at first position
        if (dropPoint.y < minTop) {
            return { element: dropElement, tier, position: 'first', cardName: null, direction: null };
        }

        // If below all cards, drop at last position
        if (dropPoint.y > maxBottom) {
            return { element: dropElement, tier, position: 'last', cardName: null, direction: null };
        }

        // First check if we're directly over any card
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            const cardName = card.getAttribute('data-character-id');
            if (!cardName) continue;

            // If this is the currently hovered card, adjust for its offset
            let adjustedRect = rect;
            if (cardName === hoveredCardName) {
                const offset = hoverDirection === 'left' ? 3 : hoverDirection === 'right' ? -3 : 0;
                adjustedRect = new DOMRect(
                    rect.x - offset,
                    rect.y,
                    rect.width,
                    rect.height
                );
            }

            // Check if the point is within this card's bounds using the adjusted rect
            if (dropPoint.x >= adjustedRect.left && dropPoint.x <= adjustedRect.right &&
                dropPoint.y >= adjustedRect.top && dropPoint.y <= adjustedRect.bottom) {
                // If we're over the dragged card itself, return all nulls
                if (cardName === currentDraggedCharacter.name) {
                    return { element: null, tier: null, position: null, cardName: null, direction: null };
                }
                // We're directly over this card, determine left/right direction
                const midX = adjustedRect.left + (adjustedRect.right - adjustedRect.left) / 2;
                const direction = dropPoint.x < midX ? 'left' : 'right';
                return { element: dropElement, tier, position: null, cardName: cardName, direction };
            }
        }

        // If we're not directly over any card, find the nearest one
        let nearestCard = null;
        let minDistance = Infinity;
        const MAX_VERTICAL_DISTANCE = 36;

        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            const cardId = card.getAttribute('data-character-id');
            if (!cardId) continue;

            // If this is the currently hovered card, adjust for its offset
            let adjustedRect = rect;
            if (cardId === hoveredCardName) {
                const offset = hoverDirection === 'left' ? 3 : hoverDirection === 'right' ? -3 : 0;
                adjustedRect = new DOMRect(
                    rect.x - offset,
                    rect.y,
                    rect.width,
                    rect.height
                );
            }

            const cardCenter = {
                x: adjustedRect.left + (adjustedRect.right - adjustedRect.left) / 2,
                y: adjustedRect.top + (adjustedRect.bottom - adjustedRect.top) / 2
            };

            const dy = Math.abs(dropPoint.y - cardCenter.y);
            if (dy > MAX_VERTICAL_DISTANCE) continue;

            const dx = dropPoint.x - cardCenter.x;
            const distance = dx * dx + dy * dy;

            if (distance < minDistance) {
                minDistance = distance;
                nearestCard = { card, rect: adjustedRect, cardId };
            }
        }

        if (!nearestCard || nearestCard.cardId === currentDraggedCharacter.name) {
            return { element: null, tier: null, position: null, cardName: null, direction: null };
        }

        // Determine if we're in the left or right half of the nearest card
        const { rect, cardId } = nearestCard;
        const midX = rect.left + rect.width / 2;
        const direction = dropPoint.x < midX ? 'left' : 'right';

        const result = { element: dropElement, tier, position: null, cardName: cardId, direction: direction as 'left' | 'right' };
        // console.log('✅ CALCULATE: Final result =', result);
        return result;
    };

    const handleDragStart = (e: React.DragEvent, character: Character) => {
        // console.log('🚀 DRAG START:', character.name);
        // Set ref immediately
        draggedCharacterRef.current = character;
        e.dataTransfer.setData('characterId', character.name);

        // Create a drag preview that matches the CharacterCard component
        const dragPreview = document.createElement('div');
        dragPreview.style.width = '64px';
        dragPreview.style.height = '64px';
        dragPreview.style.borderRadius = '0.375rem';
        dragPreview.style.overflow = 'hidden';
        dragPreview.style.backgroundColor = RARITY_COLORS[character.rarity];
        dragPreview.style.opacity = '0.5';
        dragPreview.style.transform = 'scale(1.05)';
        dragPreview.style.position = 'fixed';
        dragPreview.style.pointerEvents = 'none';
        dragPreview.style.zIndex = '9999';
        dragPreview.style.transition = 'all 0.2s';
        dragPreview.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';

        const img = new Image();
        img.src = character.imageUrl;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'cover';

        dragPreview.appendChild(img);
        document.body.appendChild(dragPreview);
        e.dataTransfer.setDragImage(dragPreview, 32, 32);
        // toast.success(`${character.name} is being dragged`);

        // Clean up the preview element after drag starts
        setTimeout(() => {
            if (document.body.contains(dragPreview)) {
                document.body.removeChild(dragPreview);
            }
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        const currentDraggedCharacter = draggedCharacterRef.current;
        if (!currentDraggedCharacter) {
            return;
        }

        const dropPos = calculateDropPosition(e);
        // console.log('🔄 DRAG OVER:', { draggedCharacter: currentDraggedCharacter.name, dropPos });

        // Only set hover states if we have both cardId and direction
        if (dropPos.cardName && dropPos.direction) {
            setHoveredCardName(dropPos.cardName);
            setHoverDirection(dropPos.direction);
        } else {
            setHoveredCardName(null);
            setHoverDirection(null);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const currentDraggedCharacter = draggedCharacterRef.current;
        // console.log('🎯 DROP START:', currentDraggedCharacter?.name);
        if (!currentDraggedCharacter) {
            return;
        }
        const charName = currentDraggedCharacter.name;

        const dropPos = calculateDropPosition(e);
        // console.log('🎯 DROP POSITION:', { charName, dropPos });

        if (dropPos.element) {
            // If dropping in the pool, check if it's the correct element section
            if (dropPos.tier === 'Pool') {
                onRemoveFromTiers(charName);
                // toast.success(`${charName} moved to Pool`);
            }
                // Handle different drop positions
            else if (dropPos.position === 'first') {
                onTierAssignment(charName, null, dropPos.tier, 'left');
                // toast.success(`${charName} moved to ${dropPos.tier} tier first`);
            }
            else if (dropPos.position === 'last') {
                onTierAssignment(charName, null, dropPos.tier, 'right');
                // toast.success(`${charName} moved to ${dropPos.tier} tier last`);
            }
            else if (dropPos.position === 'only') {
                onTierAssignment(charName, null, dropPos.tier, 'left');
                // toast.success(`${charName} moved to ${dropPos.tier} tier only`);
            }
            else if (dropPos.cardName && dropPos.direction) {
                onTierAssignment(charName, dropPos.cardName, dropPos.tier, dropPos.direction);
                // toast.success(`${charName} moved to ${dropPos.tier} tier, ${dropPos.cardName}'s ${dropPos.direction}`);
            }
        }

        // console.log('🧹 DROP: Resetting state');
        setHoveredCardName(null);
        setHoverDirection(null);
        draggedCharacterRef.current = null;
    };

    const handleDragEnd = (e: React.DragEvent) => {
        // console.log('🏁 DRAG END: Event triggered');
        setHoveredCardName(null);
        setHoverDirection(null);
        draggedCharacterRef.current = null;
    };

    return {
        hoveredCardName,
        hoverDirection,
        handleDragStart,
        handleDragOver,
        handleDrop,
        handleDragEnd,
    };
}; 
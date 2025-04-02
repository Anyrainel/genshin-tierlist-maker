import { useState } from 'react';
import { Character } from '../data/characters';
import { toast } from 'sonner';
import { elementLabels } from '../data/characters';
import { RARITY_COLORS } from '../constants/theme';
import CharacterCard from '../components/CharacterCard';

interface UseDragAndDropProps {
    onTierAssignment: (draggedId: string, dropId: string | null, tier: string, direction: 'left' | 'right') => void;
    onRemoveFromTier: (character: Character) => void;
}

interface DropPosition {
    element: string | null;
    tier: string | null;
    position: 'first' | 'last' | 'only' | null;
    cardId: string | null;
    direction: 'left' | 'right' | null;
}

export const useDragAndDrop = ({ onTierAssignment, onRemoveFromTier }: UseDragAndDropProps) => {
    const [draggedCharacter, setDraggedCharacter] = useState<Character | null>(null);
    const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
    const [hoverDirection, setHoverDirection] = useState<'left' | 'right' | null>(null);

    const calculateDropPosition = (e: React.DragEvent): DropPosition => {
        if (!draggedCharacter) {
            return { element: null, tier: null, position: null, cardId: null, direction: null };
        }

        // Find the tier row
        const tierRow = (e.target as HTMLElement).closest('[data-tier]');
        if (!tierRow) {
            return { element: null, tier: null, position: null, cardId: null, direction: null };
        }

        const tier = tierRow.getAttribute('data-tier');
        if (!tier) {
            return { element: null, tier: null, position: null, cardId: null, direction: null };
        }

        // Find the element section
        const elementSection = (e.target as HTMLElement).closest('[data-element]');
        if (!elementSection) {
            return { element: null, tier: null, position: null, cardId: null, direction: null };
        }

        const dropElement = elementSection.getAttribute('data-element');
        if (!dropElement) {
            return { element: null, tier: null, position: null, cardId: null, direction: null };
        }

        // Check if dropping in the correct element section
        if (draggedCharacter.element !== dropElement) {
            return { element: null, tier: null, position: null, cardId: null, direction: null };
        }

        // Get all cards in the element section
        let cards = Array.from(elementSection.querySelectorAll('[data-character-id]'));

        // Check if the element section itself is a card and add it if needed
        if (elementSection.hasAttribute('data-character-id') && !cards.includes(elementSection)) {
            cards = [elementSection, ...cards];
        }

        // If no cards in the tier, drop at first position
        if (cards.length === 0) {
            return { element: dropElement, tier, position: 'only', cardId: null, direction: null };
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
            return { element: dropElement, tier, position: 'first', cardId: null, direction: null };
        }

        // If below all cards, drop at last position
        if (dropPoint.y > maxBottom) {
            return { element: dropElement, tier, position: 'last', cardId: null, direction: null };
        }

        // First check if we're directly over any card
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            const cardId = card.getAttribute('data-character-id');
            if (!cardId) continue;

            // If this is the currently hovered card, adjust for its offset
            let adjustedRect = rect;
            if (cardId === hoveredCardId) {
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
                if (cardId === draggedCharacter.id) {
                    return { element: null, tier: null, position: null, cardId: null, direction: null };
                }
                // We're directly over this card, determine left/right direction
                const midX = adjustedRect.left + (adjustedRect.right - adjustedRect.left) / 2;
                const direction = dropPoint.x < midX ? 'left' : 'right';
                return { element: dropElement, tier, position: null, cardId, direction };
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
            if (cardId === hoveredCardId) {
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

        if (!nearestCard || nearestCard.cardId === draggedCharacter.id) {
            return { element: null, tier: null, position: null, cardId: null, direction: null };
        }

        // Determine if we're in the left or right half of the nearest card
        const { rect, cardId } = nearestCard;
        const midX = rect.left + rect.width / 2;
        const direction = dropPoint.x < midX ? 'left' : 'right';

        return { element: dropElement, tier, position: null, cardId, direction };
    };

    const handleDragStart = (e: React.DragEvent, character: Character) => {
        setDraggedCharacter(character);
        e.dataTransfer.setData('characterId', character.id);

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

        // Clean up the preview element after drag starts
        setTimeout(() => {
            document.body.removeChild(dragPreview);
        }, 0);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedCharacter) return;

        const dropPos = calculateDropPosition(e);

        // Only set hover states if we have both cardId and direction
        if (dropPos.cardId && dropPos.direction) {
            setHoveredCardId(dropPos.cardId);
            setHoverDirection(dropPos.direction);
        } else {
            setHoveredCardId(null);
            setHoverDirection(null);
        }
    };

    const handleDragEnd = () => {
        setDraggedCharacter(null);
        setHoveredCardId(null);
        setHoverDirection(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedCharacter) return;

        // Reset hover state immediately
        setHoveredCardId(null);
        setHoverDirection(null);

        const dropPos = calculateDropPosition(e);
        if (!dropPos.element) return;

        // If dropping in the pool, check if it's the correct element section
        if (dropPos.tier === 'Pool') {
            onRemoveFromTier(draggedCharacter);
            return;
        }

        // Handle different drop positions
        if (dropPos.position === 'first') {
            onTierAssignment(draggedCharacter.id, null, dropPos.tier, 'left');
            toast.success(`${draggedCharacter.name} moved to ${dropPos.tier} tier first`);
            return;
        }

        if (dropPos.position === 'last') {
            onTierAssignment(draggedCharacter.id, null, dropPos.tier, 'right');
            toast.success(`${draggedCharacter.name} moved to ${dropPos.tier} tier last`);
            return;
        }

        if (dropPos.position === 'only') {
            onTierAssignment(draggedCharacter.id, null, dropPos.tier, 'left');
            toast.success(`${draggedCharacter.name} moved to ${dropPos.tier} tier only`);
            return;
        }

        if (dropPos.cardId && dropPos.direction) {
            onTierAssignment(draggedCharacter.id, dropPos.cardId, dropPos.tier, dropPos.direction);
            toast.success(`${draggedCharacter.name} moved to ${dropPos.tier} tier, ${dropPos.cardId}'s ${dropPos.direction}`);
        }
    };

    return {
        draggedCharacter,
        hoveredCardId,
        hoverDirection,
        handleDragStart,
        handleDragOver,
        handleDragEnd,
        handleDrop,
        handleRemoveFromTier: onRemoveFromTier
    };
}; 
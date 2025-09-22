import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { TierCustomization } from '../data/types';
import { tiers } from '../data/types';
import { useLanguage } from '../contexts/LanguageContext';
import { COLORS, BUTTONS } from '../constants/theme';
import { cn } from '@/lib/utils';

interface TierCustomizationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customization: TierCustomization) => void;
  initialCustomization: TierCustomization;
}

const TierCustomizationDialog: React.FC<TierCustomizationDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCustomization,
}) => {
  const { t } = useLanguage();
  const [customization, setCustomization] = useState<TierCustomization>({});

  useEffect(() => {
    if (isOpen) {
      setCustomization(initialCustomization);
    }
  }, [isOpen, initialCustomization]);

  const handleTierChange = (tier: string, field: 'displayName' | 'hidden', value: string | boolean) => {
    setCustomization(prev => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: value,
      },
    }));
  };

  const handleSave = () => {
    onSave(customization);
    onClose();
  };

  const handleCancel = () => {
    setCustomization(initialCustomization);
    onClose();
  };

  const handleReset = () => {
    setCustomization({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('sm:max-w-[700px]', COLORS.DARK_BG, COLORS.DARK_BORDER)}>
        <DialogHeader>
          <DialogTitle className={COLORS.TEXT_WHITE}>{t.customizeDialog.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {tiers.map((tier) => (
            <div key={tier} className={cn('p-4 border rounded-lg', COLORS.DARK_BORDER_SECONDARY, COLORS.DARK_BG_SECONDARY)}>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-20">
                  <Label htmlFor={`${tier}-name`} className={cn('text-sm font-medium', COLORS.TEXT_GRAY)}>
                    {tier} {t.customizeDialog.tierName}
                  </Label>
                </div>
                <div className="flex-1">
                  <Input
                    id={`${tier}-name`}
                    value={customization[tier]?.displayName || ''}
                    onChange={(e) => handleTierChange(tier, 'displayName', e.target.value)}
                    placeholder={`${t.customizeDialog.defaultPrefix}${tier}`}
                    className={cn(
                      'w-full',
                      COLORS.DARK_BG_SECONDARY,
                      COLORS.DARK_BORDER_SECONDARY,
                      COLORS.TEXT_WHITE,
                      COLORS.TEXT_GRAY_PLACEHOLDER,
                      'focus-visible:ring-1 focus-visible:ring-blue-800 focus-visible:border-blue-800 focus-visible:ring-offset-1 focus-visible:ring-offset-gray-900',
                    )}
                  />
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <Checkbox
                    id={`${tier}-hidden`}
                    checked={customization[tier]?.hidden || false}
                    onCheckedChange={(checked) => 
                      handleTierChange(tier, 'hidden', checked as boolean)
                    }
                    className="border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label htmlFor={`${tier}-hidden`} className={cn('text-sm whitespace-nowrap', COLORS.TEXT_GRAY)}>
                    {t.customizeDialog.hideTier}
                  </Label>
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button 
            variant="destructive" 
            onClick={handleReset}
            className={BUTTONS.DESTRUCTIVE}
          >
            {t.customizeDialog.reset}
          </Button>
          <Button variant="secondary" onClick={handleCancel} className={BUTTONS.SECONDARY}>
            {t.customizeDialog.cancel}
          </Button>
          <Button onClick={handleSave} className={BUTTONS.PRIMARY}>
            {t.customizeDialog.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TierCustomizationDialog;

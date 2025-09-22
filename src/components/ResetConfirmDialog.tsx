import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';

interface ResetConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ResetConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm
}: ResetConfirmDialogProps) => {
  const { t } = useLanguage();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.resetConfirmDialog.title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            {t.resetConfirmDialog.message}
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
          >
            {t.resetConfirmDialog.cancel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            {t.resetConfirmDialog.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResetConfirmDialog;

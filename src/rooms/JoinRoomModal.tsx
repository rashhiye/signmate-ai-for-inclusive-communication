import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { isValidRoomCode, formatRoomCodeInput, normalizeRoomCode } from '../utils/roomCode';
import { useToast } from '../hooks/useToast';
import { ArrowRight, Hash } from 'lucide-react';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  initialCode = '',
}) => {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRoomCodeInput(e.target.value);
    setCode(formatted);
    if (error) setError(undefined);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = normalizeRoomCode(code);

    if (!cleanCode || !isValidRoomCode(cleanCode)) {
      setError('Please enter a valid SignMate room code (e.g. SM-952JW or paste full link)');
      return;
    }

    setIsSubmitting(true);
    try {
      showToast({
        type: 'info',
        title: 'Joining Room',
        message: `Connecting to room ${cleanCode}...`,
      });
      onClose();
      navigate(`/room/${cleanCode}`);
    } catch {
      setError('Unable to join room at this time.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Join Communication Room"
      description="Enter the 5 or 6 character SignMate room code provided by the meeting host."
    >
      <form onSubmit={handleJoin} className="space-y-4">
        <Input
          label="Room Code"
          placeholder="SM-952JW"
          value={code}
          onChange={handleCodeChange}
          error={error}
          required
          autoFocus
          leftIcon={<Hash className="w-4 h-4 text-surface-400" />}
          helperText="Format: SM-XXXXXX (e.g. SM-952JW)"
          className="font-mono text-base uppercase tracking-wider"
        />

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Join Room
          </Button>
        </div>
      </form>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { generateRoomCode } from '../utils/roomCode';
import { isValidRoomName } from '../utils/validators';
import { useToast } from '../hooks/useToast';
import { RefreshCw, ArrowRight } from 'lucide-react';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({ isOpen, onClose }) => {
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setRoomCode(generateRoomCode(5)); // e.g., SM-952JW
      setRoomName('');
      setError(undefined);
    }
  }, [isOpen]);

  const handleRegenerateCode = () => {
    setRoomCode(generateRoomCode(5));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = isValidRoomName(roomName);
    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setIsSubmitting(true);

    try {
      showToast({
        type: 'success',
        title: 'Room Created',
        message: `Created "${roomName}" (${roomCode}). Connecting...`,
      });
      onClose();
      navigate(`/room/${roomCode}?name=${encodeURIComponent(roomName)}`);
    } catch {
      setError('Failed to initialize room.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Communication Room"
      description="Create a new accessible video room for up to 5 participants with ISL recognition."
    >
      <form onSubmit={handleCreate} className="space-y-4">
        <Input
          label="Room Name"
          placeholder="e.g. Daily Standup or Team Sync"
          value={roomName}
          onChange={(e) => {
            setRoomName(e.target.value);
            if (error) setError(undefined);
          }}
          error={error}
          required
          autoFocus
          helperText="Give your room a recognizable name for participants."
        />

        <div className="p-3.5 bg-surface-950/70 border border-surface-800 rounded-lg flex items-center justify-between gap-3">
          <div>
            <span className="text-xs text-surface-400 block font-medium">Generated Room Code</span>
            <span className="font-mono text-base font-bold text-brand-300">{roomCode}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRegenerateCode}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            aria-label="Generate a new room code"
          >
            Regenerate
          </Button>
        </div>

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
            Enter Room
          </Button>
        </div>
      </form>
    </Modal>
  );
};

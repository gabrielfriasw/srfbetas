import React, { useState } from 'react';
import { useClassStore } from '../../store/useClassStore';
import { useAuthStore } from '../../store/useAuthStore';
import { socketService } from '../../lib/socket/socket.service';

interface MonitorAssignmentProps {
  classId: string;
}

export const MonitorAssignment: React.FC<MonitorAssignmentProps> = ({ classId }) => {
  const [monitorEmail, setMonitorEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const setMonitor = useClassStore((state) => state.setMonitor);
  const users = useAuthStore((state) => state.getUsers());

  const handleAssignMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!monitorEmail.trim()) {
      setError('Por favor, insira o email do monitor.');
      return;
    }

    // Procura o monitor entre os usuários registrados
    const monitor = users.find(
      (u) => u.email === monitorEmail && u.role === 'STUDENT_MONITOR'
    );

    if (!monitor) {
      setError('Monitor não encontrado ou o usuário não possui permissão de monitor.');
      return;
    }

    // Atualiza o monitor da turma
    setMonitor(classId, monitor.id);
    
    // Emite atualização via WebSocket
    socketService.emitUpdate('monitor_assigned', {
      classId,
      monitorId: monitor.id,
      monitorEmail: monitor.email
    });

    setSuccess('Monitor atribuído com sucesso!');
    setMonitorEmail('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mt-6">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        Atribuir Monitor
      </h2>
      <form onSubmit={handleAssignMonitor} className="flex flex-col sm:flex-row gap-4">
        <input
          type="email"
          value={monitorEmail}
          onChange={(e) => setMonitorEmail(e.target.value)}
          placeholder="Email do monitor"
          className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        />
        <button
          type="submit"
          className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Atribuir Monitor
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {success && (
        <p className="mt-2 text-sm text-green-600 dark:text-green-400">{success}</p>
      )}
    </div>
  );
};
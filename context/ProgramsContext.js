import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useAuth } from './AuthContext';
import {
  subscribeToProgramTasks,
  subscribeToUserProgramSubmissions,
  submitProgramTask,
  programProgressStats,
  submissionsByTaskId,
} from '../services/programs';
import { PROGRAM_JOURNEY } from '../constants/programs';
import {
  getEnrolledPrograms,
  canOpenProgramTasks,
  learnerBatchId,
} from '../utils/programAccess';

const ProgramsContext = createContext(null);

export function ProgramsProvider({ children }) {
  const { user, profile } = useAuth();
  const [tasksByProgram, setTasksByProgram] = useState({});
  const [subsByProgram, setSubsByProgram] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const enrolled = useMemo(() => getEnrolledPrograms(profile), [profile]);

  // Always subscribe to all three programs' tasks (small catalogs); filter by enrollment in UI
  useEffect(() => {
    setLoading(true);
    const unsubs = PROGRAM_JOURNEY.map((program) =>
      subscribeToProgramTasks(
        program.id,
        (tasks) => {
          setTasksByProgram((prev) => ({ ...prev, [program.id]: tasks }));
          setLoading(false);
        },
        (err) => setError(err.message)
      )
    );
    return () => unsubs.forEach((u) => u());
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setSubsByProgram({});
      return undefined;
    }
    const unsubs = PROGRAM_JOURNEY.map((program) =>
      subscribeToUserProgramSubmissions(
        program.id,
        user.uid,
        (subs) => {
          setSubsByProgram((prev) => ({ ...prev, [program.id]: subs }));
        },
        (err) => setError(err.message)
      )
    );
    return () => unsubs.forEach((u) => u());
  }, [user?.uid]);

  const progressByProgram = useMemo(() => {
    const map = {};
    PROGRAM_JOURNEY.forEach((p) => {
      map[p.id] = programProgressStats(
        tasksByProgram[p.id] || [],
        subsByProgram[p.id] || []
      );
    });
    return map;
  }, [tasksByProgram, subsByProgram]);

  const submitTask = useCallback(
    async (programId, task, fields = {}) => {
      if (!user?.uid) throw new Error('Sign in required');
      const prevMap = submissionsByTaskId(subsByProgram[programId] || []);
      return submitProgramTask({
        programId,
        userId: user.uid,
        task,
        fields,
        batchId: learnerBatchId(profile),
        previousSubmission: prevMap[task.id] || null,
      });
    },
    [user?.uid, profile, subsByProgram]
  );

  const value = useMemo(
    () => ({
      enrolledPrograms: enrolled,
      allPrograms: PROGRAM_JOURNEY,
      tasksByProgram,
      subsByProgram,
      progressByProgram,
      loading,
      error,
      canOpen: (programId) => canOpenProgramTasks(programId, profile),
      getTaskSubmission: (programId, taskId) =>
        submissionsByTaskId(subsByProgram[programId] || [])[taskId] || null,
      submitTask,
      setError,
    }),
    [
      enrolled,
      tasksByProgram,
      subsByProgram,
      progressByProgram,
      loading,
      error,
      profile,
      submitTask,
    ]
  );

  return (
    <ProgramsContext.Provider value={value}>{children}</ProgramsContext.Provider>
  );
}

export function usePrograms() {
  const ctx = useContext(ProgramsContext);
  if (!ctx) throw new Error('usePrograms must be used within ProgramsProvider');
  return ctx;
}

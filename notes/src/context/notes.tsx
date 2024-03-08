
import React, { createContext, useContext, useState, useEffect, ReactNode, } from 'react';

interface ComponentProps {
  notes?: Note[];
  children: ReactNode;
  service: INoteService
}
import { Note } from '@/types';
import { getErrorMessage, removeItemFromArray } from '@/utils';
import { INoteService } from '@/services/notes';

export type NoteContextState = {
  notes: Note[],
  fetching: boolean,
  error: string | null,
}

interface INotesContext {
  notes: Note[];
  fetching: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>
  addNote: (content: string) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
}

const DefaultNotesState : NoteContextState = {
  notes: [],
  fetching: false,
  error: null,
}

const NotesContext = createContext<INotesContext>({
  ...DefaultNotesState,
} as INotesContext);


// Provider Component
export const NotesProvider: React.FC<ComponentProps> = ({ children, service, notes: startingNotes }) => {
  const [notes, setNotes] = useState<Note[]>(startingNotes || []);
  const [fetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if(!startingNotes) {
      fetchNotes();
    }
  }, [startingNotes]);
 
  const fetchNotes = async (): Promise<void> => {
    if(fetching) {
      return;
    }
    setError(null);
    setFetching(true);
    try {
        const response = await service.fetchNotes();
        setNotes(response);
    } catch (error) {
        setError(getErrorMessage(error, {
          prefix: 'Error fetching notes:',
          log: true,
        }));
    } finally {
      setFetching(false);
    }
  };

  const addNote = async (content: string): Promise<void> => {
    setError(null);
    try {
      const note = await service.addNote(content);
      setNotes([note, ...notes]);
    } catch (error: unknown) {
      setError(getErrorMessage(error, {
        prefix: 'Error adding note:',
        log: true,
      }));
    }
  };

  const deleteNote = async (id: number): Promise<void> => {
    setError(null);
    try {
        await service.deleteNote(id);
        setNotes(removeItemFromArray(notes, { id }, 'id'));
    } catch (error) {
        console.error('Error deleting note:', error);
        setError(getErrorMessage(error, {
          prefix: 'Error deleting note:',
          log: true,
        }));
    }
  };

  const contextValue: INotesContext = {
    notes,
    fetching,
    error,
    fetchNotes,
    addNote,
    deleteNote,
  };
  
  return (
    <NotesContext.Provider value={contextValue}>
      {children}
    </NotesContext.Provider>
  );
}

export const useNotesContexct = () => {
  const c = useContext(NotesContext)
  return c;
}
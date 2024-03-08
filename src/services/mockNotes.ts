import { Note } from "@/types";
import { noteContentError } from '@/validation';
import { INoteService } from './notes';

let lastId = 1;

const fetchNotes = async (): Promise<Note[]> => {
  return [{ content: 'test note', id: 1 }]
};

const addNote = async (content: string): Promise<Note> => {
  const error = noteContentError(content);
  if(error) {
    throw error;
  }
  return { content, id: ++lastId }
};

const deleteNote = async (id: number): Promise<void> => {
    return;
};

export default { fetchNotes, addNote, deleteNote } as INoteService
import axios from 'axios';
import { Note } from "@/types";
import { noteContentError } from '@/validation';

const fetchNotes = async (): Promise<Note[]> => {
  const response = await axios.get<Note[]>('/api/notes');
  return response.data;
};

const addNote = async (content: string): Promise<Note> => {
  const error = noteContentError(content);
  if(error) {
    throw error;
  }
  const response = await axios.post<Note>('/api/notes', { content });
  return response.data;
};

const deleteNote = async (id: number): Promise<void> => {
  await axios.delete(`/api/notes?id=${id}`);
};

export interface INoteService {
  fetchNotes: () => Promise<Note[]>
  addNote: (content: string) => Promise<Note>;
  deleteNote: (id: number) => Promise<void>;
}

export default { fetchNotes, addNote, deleteNote } as INoteService
import type { Note } from '@/types';
import { removeItemFromArray } from '@/utils';
import { noteContentError } from '@/validation';
import fs from 'fs';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

const notesPath = path.join(process.cwd(), 'notes.json');

const loadNotes : () => Note[] = () => {
  if(fs.existsSync(notesPath)) {
    try {
      return JSON.parse(fs.readFileSync(notesPath, 'utf-8'));
    } catch (err) {
      return [];
    }
  }
  return [];
}

export const notes : Note[] = loadNotes();

const getNextNodeId = () => {
  if(!notes.length) {
    return 1;
  } else {
    return Math.max(...notes.map(n => n.id)) + 1;
  }
}

const saveNotes = () => fs.writeFileSync(notesPath, JSON.stringify(notes), 'utf-8');

const addNote = (note: Note) => {
  notes.unshift(note);
  saveNotes();
}

const deleteNote = (id: number) => {
  const removed = removeItemFromArray(notes, { id }, 'id');
  if(removed.length !== notes.length) {
    notes.length = 0;
    notes.push(...removed);
    saveNotes();
    return true;
  }
  return false;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, body, query } = req;
  if (req.method === 'GET') {
    return res.status(200).json(notes);
  }

  if (req.method === 'POST') {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const error = noteContentError(content);
    if(error) {
      return res.status(400).json({ error });
    }

    const newNote = {
      id: getNextNodeId(),
      content
    };
    addNote(newNote);
    return res.status(201).json(newNote);
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    const deleted = deleteNote(Number(id));
    if (!deleted) {
      return res.status(404).json({ error: 'Note not found' });
    }
    return res.status(204).end();
  }

  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
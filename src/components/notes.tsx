'use client'

import { useEffect, useMemo, useState } from 'react';
import { NotesProvider, useNotesContexct} from '@/context/notes';
import { Note } from '@/types';
import noteService from '@/services/notes';
import { removeItemFromArray } from '@/utils';

export default function NotesWithProvider(props: { notes?: Note[] }) {
  return (
    <NotesProvider service={noteService} notes={props.notes}>
      <Notes/>
    </NotesProvider>
  )
}

function Notes() {
  const { notes, fetching, error, addNote, deleteNote } = useNotesContexct();
  const [isAdding, setIsAdding] = useState(false);
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tempId, setTempId] = useState(-1);
  const [pendingAdds, setPendingAdds] = useState<Note[]>([]);
  const [pendingDeletes, setPendingDeletes] = useState<number[]>([]);
  
  const allNotes : Note[] = useMemo(() => [...pendingAdds, ...notes], [pendingAdds, notes]);

  useEffect(() => {
    if(!isAdding) {
      if(!error) {
        setContent('');
      }
    }
  }, [isAdding]);

  const handleAddNote = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if(isAdding) {
      return;
    }
    setIsAdding(true);
    const id = tempId;;
    setPendingAdds([{ content, id }, ...pendingAdds]);
    setTempId(id-1);
    await addNote(content);
    setPendingAdds(removeItemFromArray(pendingAdds, { id }, 'id'));
    setIsAdding(false);
  };

  const handleDeleteNote = async (id: number): Promise<void> => {
    if(id < 0) return;
    setPendingDeletes([...pendingDeletes, id]);
    await deleteNote(id);
    setPendingDeletes(removeItemFromArray(pendingDeletes, { id }, 'id'));
  };

  const filteredNotes = useMemo(() => allNotes.filter(n => !searchTerm || n.content.includes(searchTerm)), [allNotes, searchTerm]);

  const formattedNotes : (Note & { canDelete: boolean, beingDeleted: boolean })[] = useMemo(() => {
    return filteredNotes.map(n => {
      const beingDeleted = pendingDeletes.includes(n.id);
      return {
        ...n,
        beingDeleted,
        canDelete: !beingDeleted && n.id > 0,
      }
    })
  }, [pendingDeletes, filteredNotes])

  return (
    <div>
      <h1>Notes</h1>
      <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by content" />
      <form onSubmit={handleAddNote}>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content (20-300 characters)" required></textarea>
        <button disabled={isAdding} type="submit">Add Note</button>
      </form>
      {fetching && <p>Fetching...</p>}
      {error && <p>{error}</p>}
      <ul>
        {formattedNotes.map(note => (
      <li key={note.id} style={{ opacity: note.canDelete ? 1 : 0.5 }}>
          <p>{note.content}</p>
            {note.canDelete && (
              <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
            )}
          </li>
      ))}
      </ul>
    </div>
  );
}

